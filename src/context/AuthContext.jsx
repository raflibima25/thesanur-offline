import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { useDeviceDetection } from "@/hooks/useDeviceDetection";
import deviceConfig from "@/config/deviceConfig";

const AuthContext = createContext();

const { MOBILE_DOMAIN, DESKTOP_DOMAIN } = deviceConfig;

export const AuthContextProvider = ({ children }) => {
  const [session, setSession] = useState(undefined);
  const { isMobile, isDesktop } = useDeviceDetection();

  // Sign in
  const emailPasswordAuth = async (email, password, isLogin = true) => {
    try {
      const { data, error } = isLogin
        ? await supabase.auth.signInWithPassword({
            email: email.toLowerCase(),
            password: password,
          })
        : await supabase.auth.signUp({
            email: email.toLowerCase(),
            password: password,
          });

      // Handle Supabase error explicitly
      if (error) {
        return { success: false, error: error.message };
      }

      if (!isLogin && data?.user) {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const { error: profileError } = await supabase.from("user_profiles").insert([
          {
            user_id: data.user.id,
            email: data.user.email,
            full_name: "",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]);

        if (profileError && profileError.code !== "23505") {
          console.log("Error creating profile:", profileError);
        }
      }

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: `An unexpected error occurred. ${error.message}. Please try again.`,
      };
    }
  };

  async function socialProviderAuth(provider) {
    try {
      const protocol = "https://";
      const currentDomain = window.location.hostname;
      const redirectUrl = currentDomain.startsWith("m.")
        ? `${protocol}m.thesanur.sangkuriang.co.id/home`
        : `${protocol}thesanur.sangkuriang.co.id/profile`;

      let options = {
        redirectTo: redirectUrl,

        async onSuccess(response) {
          if (response?.user) {
            try {
              await supabase.from("user_profiles").upsert(
                [
                  {
                    user_id: response.user.id,
                    email: response.user.email,
                    full_name: response.user.user_metadata.name || "",
                    avatar_url: response.user.user_metadata.avatar_url || "",
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  },
                ],
                {
                  onConflict: "user_id",
                  ignoreDuplicates: true,
                },
              );
            } catch (error) {
              console.error("Error updating profile:", error);
              return { success: false, error: error.message };
            }
          }
        },
      };

      // konfigurasi khusus untuk Facebook
      if (provider === "facebook") {
        options = {
          ...options,
          scopes: "email,public_profile",
          provider_auth_params: {
            display: "popup",
            auth_type: "reauthenticate",
          },
        };
      }

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: `An unexpected error occurred! ${error.message}. Please try again.`,
      };
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  // Sign out
  async function signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      if (import.meta.env.VITE_MODE === "prod") {
        const protocol = "https://";
        const domain = isDesktop ? DESKTOP_DOMAIN : MOBILE_DOMAIN;
        window.location.replace(`${protocol}${domain}`);
      }
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }

  return (
    <AuthContext.Provider value={{ emailPasswordAuth, socialProviderAuth, session, signOut, isDesktop, isMobile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const UserAuth = () => {
  return useContext(AuthContext);
};
