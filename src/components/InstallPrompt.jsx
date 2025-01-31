import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { X } from "lucide-react";
import IconTheSanur from "../../public/assets/icons/ic_launcher/icon-512x512.png";

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(true);
  const [isStandalone, setIsStandalone] = useState(false);

  // Function to check if PWA is installed
  const checkInstallation = async () => {
    try {
      // Check various installation indicators
      const isDisplayStandalone = window.matchMedia("(display-mode: standalone)").matches;
      const isIOSStandalone = window.navigator.standalone;
      const isAndroidInstalled = document.referrer.includes("android-app://");
      const hasPWACookie = Cookies.get("pwaInstalled") === "true";

      // Additional check for installed related apps (if available)
      let hasRelatedApps = false;
      if ("getInstalledRelatedApps" in navigator) {
        const relatedApps = await navigator.getInstalledRelatedApps();
        hasRelatedApps = relatedApps.length > 0;
      }

      // Return true if any installation indicator is true
      const isAppInstalled =
        isDisplayStandalone || isIOSStandalone || isAndroidInstalled || hasPWACookie || hasRelatedApps;

      if (isAppInstalled && !hasPWACookie) {
        Cookies.set("pwaInstalled", "true", { expires: 365 });
      }

      return isAppInstalled;
    } catch (error) {
      console.error("Error checking installation:", error);
      return false;
    }
  };

  useEffect(() => {
    // Initial installation check
    checkInstallation();

    // Check if running in standalone mode (PWA)
    const isInStandaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone ||
      document.referrer.includes("android-app://");

    setIsStandalone(isInStandaloneMode);

    // Don't show prompt if in standalone mode
    if (isInStandaloneMode) {
      setShowPrompt(false);
      return;
    }

    // Check if user has already cancelled the prompt
    const hasUserCancelled = Cookies.get("installPromptCanceled");
    if (hasUserCancelled) {
      setShowPrompt(false);
      return;
    }

    const handleBeforeInstallPrompt = (e) => {
      console.log("beforeinstallprompt fired");
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = async () => {
      console.log("PWA was installed");
      Cookies.set("pwaInstalled", "true", { expires: 365 });
    };

    // Add display mode change listener
    const displayModeMediaQuery = window.matchMedia("(display-mode: standalone)");
    const handleDisplayModeChange = (e) => {
      setIsStandalone(e.matches);
      if (e.matches) {
        setShowPrompt(false);
      }
    };

    // Check installation status on visibility change
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkInstallation();
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    displayModeMediaQuery.addListener(handleDisplayModeChange);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      displayModeMediaQuery.removeListener(handleDisplayModeChange);
    };
  }, []);

  const handleOpenApp = () => {
    try {
      // Try using standard URL first
      const appUrl = new URL(window.location.origin);
      appUrl.searchParams.set("mode", "standalone");
      appUrl.searchParams.set("openInApp", "true");
      appUrl.searchParams.set("t", Date.now().toString());

      // Try using intent URL for Android
      if (/android/i.test(navigator.userAgent)) {
        const intentUrl = `intent://${window.location.host}${window.location.pathname}#Intent;scheme=https;package=com.thesanur.app;S.browser_fallback_url=${encodeURIComponent(appUrl.toString())};end`;
        window.location.href = intentUrl;
      } else {
        // For iOS and others
        window.location.href = appUrl.toString();
      }

      // Fallback: If app doesn't open within 2s, reload current page
      setTimeout(() => {
        if (document.visibilityState !== "hidden") {
          window.location.reload();
        }
      }, 2000);
    } catch (error) {
      console.error("Open app error:", error);
      window.location.reload();
    }
  };

  const handleInstall = async () => {
    // Check if app is already installed
    const isCurrentlyInstalled = await checkInstallation();

    // If app is already installed, open it
    if (isCurrentlyInstalled) {
      handleOpenApp();
      return;
    }

    if (!deferredPrompt && !import.meta.env.DEV) {
      console.log("No installation prompt available");
      return;
    }

    try {
      if (import.meta.env.DEV) {
        console.log("Development mode: Installation simulation");
        Cookies.set("pwaInstalled", "true", { expires: 365 });
        return;
      }

      const result = await deferredPrompt.prompt();
      console.log(`Install prompt was: ${result.outcome}`);

      if (result.outcome === "accepted") {
        Cookies.set("pwaInstalled", "true", { expires: 365 });
      }

      setDeferredPrompt(null);
    } catch (error) {
      console.error("Error installing PWA:", error);
    }
  };

  const handleCancel = () => {
    setShowPrompt(false);
    Cookies.set("installPromptCanceled", "true", { expires: 1 });
  };

  if (!showPrompt || isStandalone) return null;

  return (
    <div className="sticky top-0 bg-white py-2 px-4 flex items-center shadow-md z-50">
      <button onClick={handleCancel} aria-label="Close" className="p-1 hover:bg-gray-100 rounded-full mr-2">
        <X size={18} className="text-gray-500" />
      </button>

      <div className="flex items-center gap-3 flex-1">
        <img src={IconTheSanur} alt="The Sanur" className="w-10 h-10" />
        <div>
          <p className="font-medium text-sm">Get the app</p>
          <p className="text-xs text-gray-600">The fastest, easiest way to use The Sanur</p>
        </div>
      </div>

      <button
        onClick={handleInstall}
        className="bg-[#F1B81C] text-white px-5 py-1.5 text-sm rounded-full hover:bg-[#F1B81C]/90"
      >
        Use app
      </button>
    </div>
  );
};

export default InstallPrompt;
