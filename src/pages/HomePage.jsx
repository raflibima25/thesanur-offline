import IconProfileAvatar from "../../public/assets/images/icon-profile-avatar.png";
import ArrowRightIcon from "../../public/assets/icons/arrow-right.svg";
import LocationIcon from "../../public/assets/icons/location.svg";

import QRCodeIcon from "../../public/assets/icons/ic_qrcode.svg";
import CalendarReservationIcon from "../../public/assets/icons/ic_calendar_reservation.svg";
import ListActivityIcon from "../../public/assets/icons/ic_list_activity.svg";
import PersonProfileIcon from "../../public/assets/icons/ic_person_profile.svg";

import IllustrationService1 from "../../public/assets/images/illustration-service-1.png";
import IllustrationService2 from "../../public/assets/images/illustration-service-2.png";
import IllustrationService3 from "../../public/assets/images/illustration-service-3.png";
import IllustrationService4 from "../../public/assets/images/illustration-service-4.png";
import { UserAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { useLocation } from "@/context/LocationContext";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { showInfoToast } from "@/utils/toast";

const HomePage = () => {
  const navigate = useNavigate();
  const { session } = UserAuth();
  const { user } = useUser();
  const { locationData, isLoading: isLoadingLocation } = useLocation();
  const { isOnline, isSyncing } = useOfflineSync();

  const ConnectionStatus = () => {
    if (!isOnline || isSyncing) {
      return (
        <div className={`px-4 py-2 rounded-lg text-sm ${isOnline ? "bg-blue-100" : "bg-yellow-100"}`}>
          {!isOnline && <p>You are offline. Some features may be limited.</p>}
          {isSyncing && <p>Synchronize data...</p>}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-screen max-h-ful">
      <ConnectionStatus />

      <section className="header flex lg:hidden bg-white">
        <div className="flex flex-col items-center justify-center w-screen bg-[url('/assets/background/background-homepage.svg')] bg-cover bg-top rounded-b-3xl">
          <div className="flex flex-col items-center justify-center w-screen z-20  py-7 px-6">
            <img src="/assets/logo/logo-ts.svg" alt="The Sanur" className="w-40" />
            <div
              className="w-full flex flex-row gap-3 bg-white rounded-2xl mt-11 px-4 py-3 cursor-pointer"
              onClick={() => navigate("/profile")}
            >
              <img className="h-12 rounded-full" src={user?.avatar_url || IconProfileAvatar} alt="Profile Picture" />
              <div className="text-wrap break-words">
                <p className="text-sm font-normal">Welcome, </p>
                <h3 className="text-sm md:text-base font-semibold">{user?.full_name || session.user.email}</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="content"
        className=" md:bg-[url('/assets/background/background-view-the-sanur.jpeg')] bg-cover pb-12"
      >
        <div className="hidden lg:flex flex-row items-center justify-between bg-gradient-to-b from-black/70 px-20 pb-12 pt-10">
          <img src="/assets/logo/logo-ts.svg" alt="The Sanur" className="h-20" />
          <div className="flex flex-row gap-3 cursor-pointer" onClick={() => navigate("/profile")}>
            <img
              className="h-14 rounded-full order-2"
              src={user?.avatar_url || IconProfileAvatar}
              alt="Profile Picture"
            />
            <div className="order-1 text-right text-white">
              <p className="text-base font-inter font-normal">Welcome, </p>
              <h3 className="text-4xl font-bold font-iowan">{user?.full_name || session.user.email}</h3>
            </div>
          </div>
        </div>
        <div className="content lg:max-w-3xl lg:mx-auto flex flex-col px-6 py-6 lg:px-12 lg:py-12 lg:rounded-2xl bg-white">
          <div
            className="location cursor-pointer flex flex-row items-center justify-between bg-black px-3 py-3 lg:px-4 rounded-2xl gap-1 lg:gap-2"
            onClick={() => {
              if (isOnline || locationData?.coords) {
                navigate("/location-maps", {
                  state: {
                    locationCoords: locationData?.coords,
                    address: locationData?.fullAddress,
                  },
                });
              } else {
                showInfoToast("Map feature requires internet connection");
              }
            }}
          >
            <div className="flex flex-row items-center gap-2 lg:gap-3">
              <img className="w-3 lg:w-4" src={LocationIcon} alt="Back" />
              <p className="text-sm font-nunito font-bold text-white">
                {isLoadingLocation ? "Loading..." : locationData?.summaryAddress}
              </p>
            </div>
            <img
              className="cursor-pointer h-4 w-4 lg:h-4 lg:w-4"
              src={ArrowRightIcon}
              alt="Arrow"
              onClick={() =>
                navigate("/location-maps", {
                  state: {
                    locationCoords: locationData?.coords,
                    address: locationData?.fullAddress,
                  },
                })
              }
            />
          </div>

          <div className="menus-button grid grid-cols-4 mt-6 gap-4 lg:gap-16 px-0 lg:px-10">
            <div
              className="flex flex-col gap-2"
              onClick={() => navigate("/scan-qrcode")}
            >
              <div className="lg:h-24 cursor-pointer flex flex-row items-center justify-center rounded-3xl bg-gray-200">
                <img className="w-8 lg:w-12 my-4 mx-4" src={QRCodeIcon} alt="Back" />
              </div>
              <p className="text-sm text-center font-nunito font-bold">Scan QR</p>
            </div>
            <div className="flex flex-col gap-2 break-words">
              <div className="lg:h-24 cursor-pointer flex flex-row items-center justify-center rounded-3xl bg-gray-200">
                <img className="w-8 lg:w-12 my-4 mx-4" src={CalendarReservationIcon} alt="Back" />
              </div>
              <p className="text-sm text-center font-nunito font-bold">Reservation</p>
            </div>
            <div className="flex flex-col gap-2">
              <div className="lg:h-24 cursor-pointer flex flex-row items-center justify-center rounded-3xl bg-gray-200">
                <img className="w-8 lg:w-12 my-4 mx-4" src={ListActivityIcon} alt="Back" />
              </div>
              <p className="text-sm text-center font-nunito font-bold">Activity</p>
            </div>
            <div className="flex flex-col gap-2" onClick={() => navigate("/profile")}>
              <div className="lg:h-24 cursor-pointer flex flex-row items-center justify-center rounded-3xl bg-gray-200">
                <img className="w-8 lg:w-12 my-4 mx-4" src={PersonProfileIcon} alt="Back" />
              </div>
              <p className="text-sm text-center font-nunito font-bold">Profile</p>
            </div>
          </div>

          <div className="h-40 lg:h-60 mt-6 bg-[url('/assets/images/view_area_the_sanur.png')] bg-cover rounded-2xl px-4 py-3">
            <div className="flex flex-col items-start justify-end w-full h-full">
              <h2 className="text-2xl font-semibold font-iowan text-white">Bali&apos;s Lavish Sanctuary</h2>
              <p className="text-base font-inter font-normal text-white">
                Lorem Ipsum is simply dummy text of the printing and typesetting industry.
              </p>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-4xl font-semibold font-iowan">Our Services</h2>
            <div className="menus-button grid grid-cols-2 gap-4 px-0 mt-4">
              <div className="flex flex-col gap-2">
                <img
                  className="h-24 lg:h-40 cursor-pointer rounded-2xl object-cover"
                  src={IllustrationService1}
                  alt="Back"
                />
                <p className="text-base text-center font-bold font-nunito text-[#313131]">Centre of Excellence</p>
              </div>
              <div className="flex flex-col gap-2">
                <img
                  className="h-24 lg:h-40 cursor-pointer rounded-2xl object-cover"
                  src={IllustrationService2}
                  alt="Back"
                />
                <p className="text-base text-center font-bold font-nunito text-[#313131]">Our Experts</p>
              </div>
              <div className="flex flex-col gap-2">
                <img
                  className="h-24 lg:h-40 cursor-pointer rounded-2xl object-cover"
                  src={IllustrationService3}
                  alt="Back"
                />
                <p className="text-base text-center font-bold font-nunito text-[#313131]">Our Medical Technlogy</p>
              </div>
              <div className="flex flex-col gap-2">
                <img
                  className="h-24 lg:h-40 cursor-pointer rounded-2xl object-cover"
                  src={IllustrationService4}
                  alt="Back"
                />
                <p className="text-base text-center font-bold font-nunito text-[#313131]">Top-Notch Brand Partners</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
