import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useOfflineSync } from "../hooks/useOfflineSync";
import { toast } from "../utils/toast";
import { openDB } from "idb";

// Fix for marker icon issue in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const OFFLINE_TILE_URL = "https://api.maptiler.com/maps/basic/{z}/{x}/{y}.png";
const ONLINE_TILE_URL = "http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}";

const GetAndShowCurrentLocation = () => {
  const [location, setLocation] = useState({ lat: -6.2, lng: 106.8 });
  const [isLoading, setIsLoading] = useState(true);
  const { isOnline } = useOfflineSync();
  const [mapInstance, setMapInstance] = useState(null);

  // Helper functions for tile calculations
  const long2tile = (lon, zoom) => {
    return Math.floor(((lon + 180) / 360) * Math.pow(2, zoom));
  };

  const lat2tile = (lat, zoom) => {
    return Math.floor(
      ((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) *
        Math.pow(2, zoom),
    );
  };

  // Cache map tiles for offline use
  const cacheTiles = async (location, zoom) => {
    if ("caches" in window) {
      try {
        const cache = await caches.open("map-tiles");
        const x = long2tile(location.lng, zoom);
        const y = lat2tile(location.lat, zoom);

        // Cache surrounding tiles
        const promises = [];
        for (let i = -2; i <= 2; i++) {
          for (let j = -2; j <= 2; j++) {
            const tileUrl = OFFLINE_TILE_URL.replace("{z}", zoom)
              .replace("{x}", x + i)
              .replace("{y}", y + j);
            promises.push(cache.add(tileUrl).catch(() => {}));
          }
        }
        await Promise.all(promises);
      } catch (error) {
        console.error("Error caching map tiles:", error);
      }
    }
  };

  // Load location from IndexedDB
  const loadCachedLocation = async () => {
    try {
      const db = await openDB("locationDB", 1, {
        upgrade(db) {
          if (!db.objectStoreNames.contains("locations")) {
            db.createObjectStore("locations");
          }
        },
      });
      const cachedLocation = await db.get("locations", "latest");
      return cachedLocation;
    } catch (error) {
      console.error("Error loading cached location:", error);
      return null;
    }
  };

  // Save location to IndexedDB
  const cacheLocation = async (newLocation) => {
    try {
      const db = await openDB("locationDB", 1);
      await db.put("locations", newLocation, "latest");
    } catch (error) {
      console.error("Error caching location:", error);
    }
  };

  // Get current location with error handling
  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        },
      );
    });
  };

  useEffect(() => {
    const initializeLocation = async () => {
      let cachedLocation = null;
      try {
        // First try to load cached location
        const cachedLocation = await loadCachedLocation();
        if (cachedLocation) {
          setLocation(cachedLocation);
          setIsLoading(false);
        }

        // Then try to get current location
        if (isOnline) {
          const currentLocation = await getCurrentLocation();
          setLocation(currentLocation);
          await cacheLocation(currentLocation);
          await cacheTiles(currentLocation, 17);
        }
      } catch (error) {
        console.error("Error getting location:", error);
        if (!cachedLocation) {
          toast.error("Tidak dapat mengakses lokasi");
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeLocation();
  }, [isOnline]);

  return (
    <div className="container">
      {!isOnline && (
        <div className="bg-yellow-100 p-3 rounded-lg mb-4">
          <p className="text-sm">Mode Offline - Menggunakan peta yang tersimpan</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-[500px]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <MapContainer center={location} zoom={17} style={{ height: "500px", width: "100%" }} ref={setMapInstance}>
          <TileLayer
            url={isOnline ? ONLINE_TILE_URL : OFFLINE_TILE_URL}
            subdomains={isOnline ? ["mt0", "mt1", "mt2", "mt3"] : []}
            attribution='&copy; <a href="https://maps.google.com">Google Maps</a>'
          />
          <Marker position={location}>
            <Popup>Lokasi Anda!</Popup>
          </Marker>
        </MapContainer>
      )}
    </div>
  );
};

export default GetAndShowCurrentLocation;
