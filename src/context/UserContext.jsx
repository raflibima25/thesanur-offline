import { createContext, useContext, useCallback, useEffect } from "react";
import PropTypes from "prop-types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../supabaseClient";
import { ProfileStorage } from "@/services/profileStorage";

const UserContext = createContext();

// Fungsi helper untuk mendapatkan avatar URL
const getAvatarUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  try {
    return supabase.storage.from("avatars").getPublicUrl(url).data.publicUrl;
  } catch (err) {
    console.error("Error getting avatar URL:", err);
    return "";
  }
};

export function UserProvider({ children }) {
  const queryClient = useQueryClient();

  const updateProfile = useCallback(
    async (updates) => {
      try {
        if (!navigator.onLine) {
          // Simpan update ke offline storage
          const currentProfile = await ProfileStorage.getProfile();
          const updatedProfile = {
            ...currentProfile,
            ...updates,
            updated_at: new Date().toISOString(),
            pendingSync: true
          };
          await ProfileStorage.saveProfile(updatedProfile);
          return updatedProfile;
        }

        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();
        if (!authUser?.id) throw new Error("User not found");

        // Cek apakah profile sudah ada
        const { data: existingProfile, error: checkError } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("user_id", authUser.id)
          .maybeSingle();

        if (checkError) throw checkError;

        const updatedData = {
          ...updates,
          updated_at: new Date().toISOString(),
        };

        let result;

        if (existingProfile) {
          // Update existing profile
          const { data, error } = await supabase
            .from("user_profiles")
            .update(updatedData)
            .eq("user_id", authUser.id)
            .select()
            .single();

          if (error) throw error;
          result = data;
        } else {
          // Insert new profile
          const { data, error } = await supabase
            .from("user_profiles")
            .insert({
              ...updatedData,
              user_id: authUser.id,
              email: authUser.email,
              created_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (error) throw error;
          result = data;
        }

        // Update cache
        queryClient.setQueryData(["user-profile"], (oldData) => ({
          ...oldData,
          ...result,
          avatar_url: result.avatar_url ? getAvatarUrl(result.avatar_url) : "",
        }));

        return result;
      } catch (error) {
        console.error("Error in updateProfile:", error);
        throw error;
      }
    },
    [queryClient],
  );

  const syncOfflineUpdates = useCallback(async () => {
    if (navigator.onLine) {
      const pendingUpdates = await ProfileStorage.getPendingUpdates();
      for (const profile of pendingUpdates) {
        if (profile.offlineUpdates) {
          try {
            await updateProfile(profile.offlineUpdates);
            await ProfileStorage.clearPendingSync(profile.id);
          } catch (error) {
            console.error('Failed to sync update:', error);
          }
        }
      }
    }
  }, [updateProfile]);

  useEffect(() => {
    const initSync = async () => {
      if (navigator.onLine) {
        await syncOfflineUpdates();
      }
    };

    initSync();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        // Invalidate and refetch user data when auth state changes
        queryClient.invalidateQueries(["user-profile"]);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [queryClient, syncOfflineUpdates]);

  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      try {
        const session = await supabase.auth.getSession();
        if (!session.data.session) {
          throw new Error("No session");
        }
  
        if (!navigator.onLine) {
          const cachedProfile = await ProfileStorage.getProfile();
          if (cachedProfile) return cachedProfile;
        }
  
        const {
          data: { user: authUser },
          error: authError,
        } = await supabase.auth.getUser();
  
        if (authError) throw authError;
        if (!authUser) return null;
  
        // Cek existing profile dulu
        const { data: existingProfile, error: fetchError } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("user_id", authUser.id)
          .maybeSingle();
  
        if (fetchError && fetchError.code !== "PGRST116") {
          console.error("Error fetching profile:", fetchError);
          throw fetchError;
        }
  
        // Jika profile sudah ada
        if (existingProfile) {
          const profile = {
            ...authUser,
            ...existingProfile,
            avatar_url: existingProfile.avatar_url ? getAvatarUrl(existingProfile.avatar_url) : "",
          };
          // Save ke IndexedDB
          await ProfileStorage.saveProfile(profile);
          return profile;
        }
  
        // Jika belum ada, buat baru
        const newProfile = {
          user_id: authUser.id,
          email: authUser.email,
          full_name: authUser.user_metadata?.name || "",
          avatar_url: authUser.user_metadata?.avatar_url || "",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
  
        const { data: createdProfile, error: createError } = await supabase
          .from("user_profiles")
          .upsert(newProfile)
          .single();
  
        if (createError) throw createError;
  
        const profile = {
          ...authUser,
          ...createdProfile,
          avatar_url: createdProfile.avatar_url ? getAvatarUrl(createdProfile.avatar_url) : "",
        };
  
        await ProfileStorage.saveProfile(profile);
        return profile;
  
      } catch (error) {
        console.error("Error in queryFn:", error);
        if (!navigator.onLine) {
          return await ProfileStorage.getProfile();
        }
        throw error;
      }
    },
    retry: 2,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 30,
    refetchOnWindowFocus: true,
    enabled: !!supabase.auth.getSession(),
  });

  const updateAvatar = useCallback(
    async (avatarFile) => {
      if (!user?.id) throw new Error("User not found");

      try {
        // Hapus avatar lama jika ada
        if (user.avatar_url && !user.avatar_url.startsWith("http")) {
          try {
            await supabase.storage.from("avatars").remove([user.avatar_url]);
          } catch (err) {
            console.error("Error removing old avatar:", err);
          }
        }

        const fileName = `${user.id}-${Date.now()}.jpg`;

        const { error: uploadError } = await supabase.storage.from("avatars").upload(fileName, avatarFile);

        if (uploadError) throw uploadError;

        const updates = {
          avatar_url: fileName,
          updated_at: new Date().toISOString(),
        };

        const { data, error: updateError } = await supabase
          .from("user_profiles")
          .update(updates)
          .eq("id", user.id)
          .single();

        if (updateError) throw updateError;

        const avatarUrl = getAvatarUrl(fileName);

        queryClient.setQueryData(["user-profile"], (oldData) => ({
          ...oldData,
          ...data,
          avatar_url: avatarUrl,
        }));

        return data;
      } catch (error) {
        console.error("Error in updateAvatar:", error);
        throw error;
      }
    },
    [user, queryClient],
  );

  return (
    <UserContext.Provider
      value={{
        user,
        isLoading,
        error,
        updateProfile,
        updateAvatar,
        getAvatarUrl,
        refetchUser: refetch,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

UserProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within UserProvider");
  }
  return context;
}
