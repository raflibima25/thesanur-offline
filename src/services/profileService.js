// services/profileService.js
import { supabase } from "../../supabaseClient";

export const getProfile = async (userId) => {
  try {
    if (!userId) {
      throw new Error("No user ID provided");
    }

    // Coba ambil profil yang ada
    let { data: existingProfile, error: fetchError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Fetch error:", fetchError);
      throw fetchError;
    }

    if (existingProfile) {
      return existingProfile;
    } else {
      // Jika profil belum ada, kembalikan null atau objek kosong sesuai kebutuhan
      return null;
    }
  } catch (err) {
    console.error("Error retrieving profile:", err);
    throw err;
  }
};

export const createProfile = async (userId, email, metadata) => {
  try {
    const avatarUrl = metadata?.picture || metadata?.avatar_url || "";

    const newProfile = {
      user_id: userId,
      email: email,
      full_name: metadata?.name || "",
      avatar_url: avatarUrl,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: createdProfile, error: createError } = await supabase
      .from("user_profiles")
      .insert(newProfile)
      .single();

    if (createError) {
      console.error("Error creating profile:", createError);
      throw createError;
    }

    return createdProfile;
  } catch (err) {
    console.error("Error creating profile:", err);
    throw err;
  }
};

export const updateProfile = async (userId, updates) => {
  try {
    const { data, error: updateError } = await supabase
      .from("user_profiles")
      .upsert(updates)
      .eq("user_id", userId);

    console.log("Updated profile:", data);

    if (updateError) {
      console.error("Error updating profile:", updateError);
      throw updateError;
    }

    return data;
  } catch (err) {
    console.error("Error updating profile:", err);
    throw err;
  }
};

export const updateProfilePhoto = async (userId, file) => {
  try {
    const fileName = `${userId}-${Date.now()}.jpg`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, file);

    if (uploadError) {
      console.error("Error uploading photo:", uploadError);
      throw uploadError;
    }

    const { data: updatedProfile, error: updateError } = await supabase
      .from("user_profiles")
      .update({ avatar_url: fileName, updated_at: new Date().toISOString() })
      .eq("user_id", userId)
      .single();

    if (updateError) {
      console.error("Error updating profile photo:", updateError);
      throw updateError;
    }

    return updatedProfile;
  } catch (err) {
    console.error("Error updating profile photo:", err);
    throw err;
  }
};
