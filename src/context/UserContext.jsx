import { createContext, useContext, useCallback, useEffect } from "react";
import PropTypes from "prop-types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../supabaseClient";

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

  useEffect(() => {
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
  }, [queryClient]);

  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      try {
        const {
          data: { user: authUser },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) throw authError;
        if (!authUser) return null;

        // Coba ambil profil yang ada
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
          return {
            ...authUser,
            ...existingProfile,
            avatar_url: existingProfile.avatar_url ? getAvatarUrl(existingProfile.avatar_url) : "",
          };
        }

        // Jika profile belum ada, buat baru
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
          .insert(newProfile)
          .single();

        if (createError) throw createError;

        return {
          ...authUser,
          ...createdProfile,
          avatar_url: createdProfile.avatar_url ? getAvatarUrl(createdProfile.avatar_url) : "",
        };
      } catch (error) {
        console.error("Error in queryFn:", error);
        return null;
      }
    },
    retry: 2,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 30,
    refetchOnWindowFocus: true,
  });

  const updateProfile = useCallback(
    async (updates) => {
      try {
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
