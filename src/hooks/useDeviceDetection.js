import { useState, useEffect } from "react";
import { checkDeviceType, handleRedirect } from "../utils/deviceDetection";

export const useDeviceDetection = () => {
  const [isMobile, setIsMobile] = useState(false);
  const isMobileDomain = window.location.hostname.startsWith("m-");
  const reactAppEnvIsMobile = import.meta.env.VITE_REACT_APP_IS_MOBILE === "true";

  const isDesktop = !isMobile && !isMobileDomain && !reactAppEnvIsMobile;

  useEffect(() => {
    const handleResize = () => {
      const deviceInfo = checkDeviceType();
      if (import.meta.env.VITE_MODE === "prod") {
        handleRedirect(deviceInfo);
      }
      setIsMobile(deviceInfo.isMobileDevice);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

  return { isMobile, isMobileDomain, reactAppEnvIsMobile, isDesktop };
};
