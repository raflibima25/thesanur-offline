import deviceConfig from "@/config/deviceConfig";

const { MOBILE_BREAKPOINT, MOBILE_DOMAIN, DESKTOP_DOMAIN } = deviceConfig;

export const checkDeviceType = () => {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  const currentWidth = window.innerWidth;
  const currentHost = window.location.hostname;

  // Deteksi mobile menggunakan user agent
  const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

  return {
    // Kombinasi deteksi screen width dan user agent
    isMobileDevice: currentWidth <= MOBILE_BREAKPOINT || isMobileUserAgent,
    isMobileDomain: currentHost.startsWith("m."),
    currentHost,
  };
};

export const handleRedirect = ({ isMobileDevice, isMobileDomain }, navigate) => {
  const protocol = import.meta.env.VITE_MODE === "dev" ? "http://" : "https://";
  const currentPath = window.location.pathname;

  if (import.meta.env.VITE_MODE === "dev") {
    if (isMobileDevice) {
      navigate("/login");
    } else {
      navigate("/");
    }
    return;
  }

  if (isMobileDevice && !isMobileDomain) {
    window.location.replace(`${protocol}${MOBILE_DOMAIN}${currentPath}`);
  } else if (!isMobileDevice && isMobileDomain) {
    window.location.replace(`${protocol}${DESKTOP_DOMAIN}${currentPath}`);
  }
};
