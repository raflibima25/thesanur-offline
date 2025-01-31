import { supabase } from "../../supabaseClient";

export const handleSavePhoto = async (
  userId,
  avatarUrl,
  fullName,
  croppedBlob,
) => {
  try {
    const fileName = `${userId}-${Date.now()}.jpg`;

    // Hapus avatar lama jika ada
    if (avatarUrl && !avatarUrl.startsWith("http")) {
      try {
        await supabase.storage.from("avatars").remove([avatarUrl]);
      } catch (err) {
        console.error("Error removing old avatar:", err);
      }
    }

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, croppedBlob);

    if (uploadError) throw uploadError;

    const updates = {
      user_id: userId,
      full_name: fullName || "",
      avatar_url: fileName,
      updated_at: new Date().toISOString(),
    };

    const { error: updateError } = await supabase
      .from("user_profiles")
      .update(updates)
      .eq("user_id", userId);

    if (updateError) throw updateError;

    return fileName;
  } catch (err) {
    console.error("Error saving photo:", err);
    throw err;
  }
};
