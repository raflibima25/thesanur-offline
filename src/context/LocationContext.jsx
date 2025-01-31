import { createContext, useContext, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { openDB } from "idb";

const LocationContext = createContext();
const DB_NAME = "locationDB";
const STORE_NAME = "locations";
const DB_VERSION = 1;

const initDB = async () => {
  return await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "timestamp" });
      }
    },
  });
};

export function LocationProvider({ children }) {
  const queryClient = useQueryClient();

  const {
    data: locationData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["user-location"],
    queryFn: async () => {
      try {
        // Coba ambil lokasi dari IndexedDB dulu
        const db = await initDB();
        const cachedLocation = await db.get(STORE_NAME, "latest");

        if (cachedLocation && !navigator.onLine) {
          return cachedLocation;
        }

        return new Promise((resolve, reject) => {
          if (!navigator.geolocation) {
            reject(new Error("Geolocation is not supported"));
            return;
          }

          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const coords = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              };

              try {
                let addressData = {
                  summaryAddress: "Address not available offline",
                  fullAddress: "Address not available offline",
                };

                if (navigator.onLine) {
                  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}&zoom=18&addressdetails=1`;
                  const response = await fetch(url);
                  const data = await response.json();
                  const { address } = data;

                  addressData = {
                    summaryAddress: [address.road, address.suburb, address.village, address.city]
                      .filter((part) => part)
                      .join(", "),
                    fullAddress: data.display_name,
                  };
                }

                const locationData = {
                  coords,
                  ...addressData,
                  timestamp: new Date().toISOString(),
                };

                // Save to IndexedDB
                const db = await initDB();
                await db.put(STORE_NAME, {
                  ...locationData,
                  type: "latest",
                });

                resolve(locationData);
              } catch (error) {
                // If offline or error fetching address, return coords only
                resolve({
                  coords,
                  summaryAddress: "Address not available offline",
                  fullAddress: "Address not available offline",
                  timestamp: new Date().toISOString(),
                });
              }
            },
            (error) => reject(error),
          );
        });
      } catch (error) {
        // If all fails, try to return cached location
        const db = await initDB();
        const cachedLocation = await db.get(STORE_NAME, "latest");
        if (cachedLocation) {
          return cachedLocation;
        }
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
  });

  // Save location history
  const saveLocationHistory = async (location) => {
    if (!location) return;

    try {
      const db = await initDB();
      await db.add(STORE_NAME, {
        ...location,
        type: "history",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error saving location history:", error);
    }
  };

  useEffect(() => {
    if (locationData) {
      saveLocationHistory(locationData);
    }
  }, [locationData]);

  return (
    <LocationContext.Provider
      value={{
        locationData,
        isLoading,
        error,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocation must be used within LocationProvider");
  }
  return context;
}
