export function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", async () => {
      try {
        const registration = await navigator.serviceWorker.register("/service-worker.js");
        console.log("Service Worker registered with scope:", registration.scope);
        
        if (registration.active) {
          registration.active.postMessage({ type: "SKIP_WAITING" });
        }
      } catch (error) {
        console.error("Service Worker registration failed:", error);
      }
    });
  }
}