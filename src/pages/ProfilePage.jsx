import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { UserAuth } from "../context/AuthContext";
import PhoneInput from "react-country-phone-input";
import "react-country-phone-input/lib/style.css";
import ArrowBackIcon from "../../public/assets/icons/arrow-back.svg";
import CameraIcon from "../../public/assets/icons/ic_camera.svg";
import IconProfileAvatar from "../../public/assets/images/icon-profile-avatar.png";
import PhotoUploadModal from "../components/PhotoUploadModal";
import { showSuccessToast, showErrorToast } from "../utils/toast";
import LogoutIcon from "../../public/assets/icons/logout.svg";
import DatePicker from "@/components/ui/date-picker";
import { format } from "date-fns";
import { useUser } from "../context/UserContext";
import LoadingSpin from "@/components/LoadingSpin";
import { useDeviceDetection } from "@/hooks/useDeviceDetection";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { session, signOut } = UserAuth();
  const { user, isLoading, updateProfile, updateAvatar, refetchUser } = useUser();
  const { isDesktop } = useDeviceDetection();
  const [error, setError] = useState(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    phoneNumber: "",
    birthDate: "",
    address: "",
    fullName: "",
  });

  useEffect(() => {
    if (!session && !isLoading) {
      navigate("/login");
    }
  }, [session, isLoading, navigate]);

  useEffect(() => {
    if (user) {
      setFormData({
        phoneNumber: user.phone_number || "",
        birthDate: user.birth_date || "",
        address: user.address || "",
        fullName: user.full_name || "",
      });
    }
  }, [user]);

  useEffect(() => {
    if (error) {
      console.error("Error loading user data:", error);
      const timer = setTimeout(() => {
        refetchUser();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, refetchUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({
        full_name: formData.fullName,
        birth_date: formData.birthDate,
        phone_number: formData.phoneNumber,
        address: formData.address,
      });
      showSuccessToast("Profil berhasil diperbarui!");
      if (isDesktop) {
        navigate("/info");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      showErrorToast("Gagal memperbarui profil");
    }
  };

  const handleFormChange = (field) => (value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSavePhotoWrapper = async (croppedBlob) => {
    try {
      setUploading(true);
      const file = new File([croppedBlob], `avatar-${Date.now()}.jpg`, {
        type: "image/jpeg",
        lastModified: Date.now(),
      });

      await updateAvatar(file);
      setShowPhotoModal(false);
      showSuccessToast("Foto profil berhasil diperbarui!");
    } catch (err) {
      console.error("Error saving photo:", err);
      showErrorToast("Gagal menyimpan foto");
    } finally {
      setUploading(false);
    }
  };

  const handleDateChange = (newDate) => {
    const formattedDate = newDate ? format(newDate, "yyyy-MM-dd") : "";
    handleFormChange("birthDate")(formattedDate);
  };

  useEffect(() => {
    if (!session && !isLoading) {
      navigate("/login");
    }
  }, [session, isLoading, navigate]);

  if (isLoading) {
    <LoadingSpin />;
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Photo Modal */}
      {showPhotoModal && (
        <PhotoUploadModal
          onClose={() => setShowPhotoModal(false)}
          onSave={handleSavePhotoWrapper}
          uploading={uploading}
        />
      )}

      <section className="header relative flex bg-white lg:hidden">
        <div className="absolute h-40 top-0 left-0 right-0 flex flex-col items-center justify-center w-screen bg-[url('/assets/background/background-homepage.svg')] bg-cover bg-no-repeat bg-bottom rounded-b-3xl"></div>
        <div className="flex flex-col items-left w-screen z-20 py-0 px-4">
          <img className="cursor-pointer h-4 w-4 mt-5" src={ArrowBackIcon} alt="Back" onClick={() => navigate(-1)} />
          <div className="flex flex-row items-center justify-between mt-5">
            <h1 className="text-2xl mb-3 mt-6 text-white font-iowan font-semibold">Profile</h1>
            <button
              className="flex items-center gap-2 text-white font-inter text-base font-semibold hover:opacity-80 transition-opacity mt-4 lg:mt-10 lg:mr-5"
              onClick={signOut}
            >
              <img src={LogoutIcon} alt="Logout" />
              Logout
            </button>
          </div>
          <section className="img-profile flex flex-row items-center justify-center">
            <div className="relative h-[100px] w-[100px]">
              <img
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-[100px] w-[100px] rounded-full border border-black/50"
                src={user?.avatar_url || IconProfileAvatar}
                alt={`Profile picture ${formData.fullName || "User"}`}
                onError={(e) => {
                  console.log("Failed to load avatar:", user.avatar_url);
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    user.full_name || "User",
                  )}&background=random&color=fff&size=128`;
                }}
              />

              <div className="absolute top-0 right-0 transform translate-y-1/2 h-6 w-6 cursor-pointer z-10 border border-black/50 rounded-full flex items-center justify-center bg-white">
                <img
                  className=""
                  src={CameraIcon}
                  alt="Upload Photo"
                  onClick={() => setShowPhotoModal(true)}
                  disabled={uploading}
                />
              </div>
            </div>
          </section>
        </div>
      </section>
      <section className="relative flex flex-col items-center form profile-information lg:py-12">
        <div className="hidden lg:flex absolute h-64 z-0 top-0 left-0 right-0 flex-col items-center justify-center w-screen bg-[url('/assets/background/background-homepage.svg')] bg-cover bg-no-repeat bg-bottom"></div>
        <div className="absolute flex flex-col w-full lg:max-w-3xl lg:mx-auto z-10">
          <div className="hidden lg:flex flex-row items-center justify-between mb-5 lg:mt-10">
            <div className="flex items-center gap-5 ">
              <img className="cursor-pointer h-7 w-6" src={ArrowBackIcon} alt="Back" onClick={() => navigate(-1)} />
              <h1 className="text-4xl text-white font-iowan font-semibold">Profile</h1>
            </div>
            <button
              className="flex items-center gap-2 text-white font-inter text-base font-semibold hover:opacity-80 transition-opacity mr-5"
              onClick={signOut}
            >
              <img src={LogoutIcon} alt="Logout" />
              Logout
            </button>
          </div>

          <div className="bg-white lg:rounded-3xl py-4 px-4 lg:py-8 lg:px-8 lg:border lg:border-black/15">
            <section className="hidden img-profile lg:flex flex-row items-center justify-center mt-8">
              <div className="relative h-[120px] w-[120px]">
                <img
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-[120px] w-[120px] rounded-full border border-black/50"
                  src={user?.avatar_url || IconProfileAvatar}
                  alt={`Profile picture ${formData.fullName || "User"}`}
                  onError={(e) => {
                    console.log("Failed to load avatar:", user.avatar_url);
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      user.full_name || "User",
                    )}&background=random&color=fff&size=128`;
                  }}
                />

                <div className="absolute top-0 right-0 transform translate-y-1/2 h-8 w-8 cursor-pointer z-40 border border-black/50 rounded-full flex items-center justify-center bg-white">
                  <img
                    className="h-5 w-5"
                    src={CameraIcon}
                    alt="Add/Update photo"
                    onClick={() => setShowPhotoModal(true)}
                    disabled={uploading}
                  />
                </div>
              </div>
            </section>
            <form className="flex flex-col gap-y-4" action="" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-y-4 lg:grid lg:grid-cols-2 lg:gap-x-8 mt-5">
                <div className="form-group flex flex-col gap-y-2">
                  <label className="text-[#313131] font-inter">Name</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleFormChange("fullName")(e.target.value)}
                    className="form-control font-inter w-full h-11 bg-white border border-[#313131] rounded-lg px-3"
                    id="name"
                    placeholder="Fill your name"
                    required
                  />
                </div>
                <div className="form-group flex flex-col gap-y-2">
                  <label className="text-[#313131] font-inter">Email</label>
                  <input
                    type="email"
                    defaultValue={user?.email || session.user.email}
                    className="form-control font-inter w-full h-11 bg-white border border-[#313131]/70 rounded-lg px-3 text-black/70"
                    id="email"
                    placeholder="Fill your email"
                    disabled
                  />
                </div>
                <div className="form-group flex flex-col gap-y-2">
                  <label className="text-[#313131] font-inter">Phone</label>
                  <PhoneInput
                    country={"id"}
                    value={formData.phoneNumber}
                    onChange={(value) => {
                      handleFormChange("phoneNumber")(value);
                    }}
                    containerStyle={{
                      width: "100%",
                      height: "47px",
                      border: "1px solid #313131",
                      borderRadius: "8px",
                    }}
                    buttonStyle={{
                      height: "45px",
                      borderTopLeftRadius: "8px",
                      borderBottomLeftRadius: "8px",
                    }}
                    inputStyle={{
                      width: "100%",
                      height: "45px",
                      border: "none",
                      borderRadius: "8px",
                      backgroundColor: "white",
                      fontFamily: "font-inter",
                      fontSize: "16px",
                      fontWeight: "400",
                    }}
                  />
                </div>
                <div className="form-group flex flex-col gap-y-2">
                  <label className="text-[#313131] font-inter">Birthday</label>
                  <DatePicker
                    date={formData.birthDate ? new Date(formData.birthDate) : undefined}
                    setDate={handleDateChange}
                  />
                </div>
              </div>

              <div className="form-group flex flex-col gap-y-2">
                <label className="text-[#313131] font-inter">Address</label>
                <textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleFormChange("address")(e.target.value)}
                  rows="4"
                  className="form-control font-inter w-full bg-white border border-[#313131] rounded-lg px-3 py-2"
                  placeholder="Fill your address"
                ></textarea>
              </div>
              <button
                className="py-3 font-inter rounded-lg mt-2 text-black bg-[#F1B81C] hover:bg-[#F1B81C]/80 font-semibold"
                type="submit"
              >
                Save
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProfilePage;
