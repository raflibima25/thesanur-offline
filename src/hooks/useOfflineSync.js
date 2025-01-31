import { useState, useEffect } from "react";
import { OfflineStorage } from "../services/offlineStorage";

export const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const offlineStorage = new OfflineStorage();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncData();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const syncData = async () => {
    if (isOnline && !isSyncing) {
      setIsSyncing(true);
      try {
        await offlineStorage.syncOfflineData();
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const saveOfflineData = async (table, data, action) => {
    await offlineStorage.saveOfflineData(table, data, action);
  };

  return { isOnline, isSyncing, saveOfflineData, syncData };
};
