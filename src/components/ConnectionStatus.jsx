import { useOfflineSync } from "@/hooks/useOfflineSync";
import { useState, useEffect } from "react";

const ConnectionStatus = () => {
  const { isOnline, isSyncing } = useOfflineSync();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isOnline || isSyncing) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOnline, isSyncing]);

  if (!isVisible) return null;

  return (
    <div 
      className={`
        sticky top-0 z-50 flex
        px-4 py-2 text-sm text-center
        transform transition-all duration-300 ease-in-out
        ${(!isOnline || isSyncing) ? "translate-y-0" : "-translate-y-full"}
        ${isOnline ? "bg-blue-100" : "bg-yellow-100"}
      `}
    >
      {!isOnline && (
        <p className="flex items-center justify-center gap-2">
          <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
          You are offline. Some features may be limited.
        </p>
      )}
      {isSyncing && (
        <p className="flex items-center justify-center gap-2">
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
          Synchronize data...
        </p>
      )}
    </div>
  );
};

export default ConnectionStatus;