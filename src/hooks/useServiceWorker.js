import { useEffect } from "react";
import { OfflineStorage } from "../services/offlineStorage";

export const useServiceWorker = () => {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      const offlineStorage = new OfflineStorage();

      navigator.serviceWorker.addEventListener("message", async (event) => {
        switch (event.data.type) {
          case "STORE_OFFLINE_REQUEST":
            await offlineStorage.saveOfflineData(
              event.data.payload.url,
              event.data.payload.body,
              event.data.payload.method,
            );
            break;

          case "PERFORM_SYNC":
            await offlineStorage.syncOfflineData();
            break;

          case "SYNC_STARTED":
            console.log("Background sync started");
            break;
        }
      });

      // Register for background sync
      navigator.serviceWorker.ready.then((registration) => {
        registration.sync
          .register("sync-pending-requests")
          .catch((err) => console.log("Background sync registration failed:", err));
      });
    }
  }, []);
};
