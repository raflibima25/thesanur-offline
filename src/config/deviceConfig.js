const deviceConfig = {
  dev: {
    MOBILE_BREAKPOINT: 768,
    MOBILE_DOMAIN: "localhost:5173",
    DESKTOP_DOMAIN: "localhost:5173",
  },
  prod: {
    MOBILE_BREAKPOINT: 768,
    MOBILE_DOMAIN: "m-poc-the-sanur-redirect.vercel.app",
    DESKTOP_DOMAIN: "poc-the-sanur-redirect.vercel.app",
  },
};

const env = import.meta.env.VITE_MODE || "dev";
export default deviceConfig[env];
