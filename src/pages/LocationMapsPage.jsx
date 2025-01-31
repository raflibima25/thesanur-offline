import React, { useEffect, useState } from "react";
import QRScannerComponent from "../components/QRScannerComponent";
import CameraIcon from "../../public/assets/icons/ic_camera.svg";
import IconProfileAvatar from "../../public/assets/images/icon-profile-avatar.png";
import ArrowBackIcon from "../../public/assets/icons/arrow-back.svg";
import { useNavigate } from "react-router-dom";
import MapsComponent from "../components/MapsComponent";
import LocationIcon from "../../public/assets/icons/location.svg";
import ArrowRightIcon from "../../public/assets/icons/arrow-right.svg";
import apiService from "../services/apiService";
import { useLocation } from "react-router-dom";

const LocationMapsPage = () => {
  const navigate = useNavigate();

  // Get data from navigate
  const location = useLocation();
  const { state } = location; // Data dari navigate
  const { locationCoords, address } = state || {};

  // const [locationGPS, setLocationGPS] = useState(null); // Default location (Jakarta)
  // const [address, setAddress] = useState("");

  const [data, setData] = useState({ locationCoords: null, address: null });
  const [isLoadingGetLocation, setLoadingGetLocation] = useState(false);

  // Fetch location once when the component mounts
  useEffect(() => {
    setData({ locationCoords: locationCoords, address: address });


    if (navigator.geolocation && (data.locationCoords === undefined || data.locationCoords === null)) {
      setLoadingGetLocation(true);

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          setData({ locationCoords: coords, address: address });

          getAddressFromLocation(coords);
          setLoadingGetLocation(false);
        },
        (err) => {
          console.error("Error fetching location:", err);
          setLoadingGetLocation(false);
        },
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      setLoadingGetLocation(false);
    }
  }, []);

  const getAddressFromLocation = async (coords) => {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}&zoom=18&addressdetails=1`;

    try {
      const response = await apiService.get(url);
      setData({ locationCoords: coords, address: response.display_name });
    } catch (error) {
      console.error("Error fetching address:", error);
    }
  };

  return (
    <div className="w-full h-screen flex flex-col bg-[url('/assets/background/Background.svg')] bg-cover bg-no-repeat">
      <div className="w-full max-w-md mx-auto flex flex-col px-4 py-4">
        <div className="flex flex-col items-left py-0 mt-5">
          <img
            className="cursor-pointer h-4 w-4 mt-5"
            src={ArrowBackIcon}
            alt="Back"
            onClick={() => navigate("/home")}
          />

          <h1 className="text-2xl font-inter mb-3 mt-6 text-white">
            Your Location{" "}
          </h1>
        </div>
        <div className="w-full mt-7">
          <div className="location flex flex-row items-center justify-between bg-black px-3 py-3 lg:px-4 lg:py-2 rounded-2xl gap-1 lg:gap-2 mb-3">
            <div className="flex flex-row items-center gap-2 lg:gap-3">
              <img
                className="cursor-pointer h-5 w-5 lg:h-6 lg:w-6"
                src={LocationIcon}
                alt="Back"
              />
              <p className="text-sm font-normal font-inter p-1 text-white">
                {data.address}
              </p>
            </div>
          </div>
          {(data.locationCoords === undefined || data.locationCoords === null) ? (
            <div className="flex flex-col items-center justify-center h-96">
              <p className="text-sm font-inter font-normal text-white">
                Loading your location...
              </p>
            </div>
          ) : (
            <MapsComponent location={data.locationCoords} />
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationMapsPage;
