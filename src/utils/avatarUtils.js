import { supabase } from "../../supabaseClient";

export const getAvatarUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  try {
    return supabase.storage.from("avatars").getPublicUrl(url).data.publicUrl;
  } catch (err) {
    console.error("Error getting avatar URL:", err);
    return "";
  }
};
