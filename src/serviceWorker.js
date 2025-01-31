const CACHE_NAME = "pwa-the-sanur-v1";
const DYNAMIC_CACHE = "dynamic-v1";
const OFFLINE_URL = "/offline.html";
const API_CACHE = "api-cache-v1";

const CACHE_MAP_ASSETS = ["/leaflet.css", "/marker-icon.png", "/marker-icon-2x.png", "/marker-shadow.png"];

const urlsToCache = [
  OFFLINE_URL,
  ...CACHE_MAP_ASSETS,
  "/",
  "/index.html",
  "/manifest.json",
  "/static/js/main.chunk.js",
  "/static/js/0.chunk.js",
  "/static/js/bundle.js",
  "/static/css/main.chunk.css",
  "/assets/logo/logo-ts.svg",
  "../public/assets",
];

// Helper function to determine if a request is an API call
const isApiRequest = (request) => {
  return request.url.includes("/api/") || request.url.includes("supabase.co");
};

// Helper function to determine if a request should be cached
const shouldCache = (request) => {
  // Don't cache POST requests or API calls
  return request.method === "GET" && !isApiRequest(request);
};

self.addEventListener("install", (event) => {
  console.log("Service Worker installing.");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache");
      return cache.addAll(urlsToCache);
    }),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker activating.");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== DYNAMIC_CACHE && name !== API_CACHE)
          .map((name) => caches.delete(name)),
      );
    }),
  );
  return self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin) && !event.request.url.includes("supabase.co")) {
    return;
  }

  // Handle map tile requests
  if (
    event.request.url.includes("tile.openstreetmap.org") ||
    event.request.url.includes("google.com/vt/") ||
    event.request.url.includes("maptiler.com")
  ) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return (
          response ||
          fetch(event.request)
            .then((response) => {
              return caches.open(DYNAMIC_CACHE).then((cache) => {
                cache.put(event.request, response.clone());
                return response;
              });
            })
            .catch(() => {
              // Return a fallback tile if offline
              return new Response();
            })
        );
      }),
    );
    return;
  }

  // Handle API requests differently
  if (isApiRequest(event.request)) {
    event.respondWith(
      fetch(event.request.clone())
        .then((response) => {
          // Cache successful GET requests to API
          if (response.ok && event.request.method === "GET") {
            const responseToCache = response.clone();
            caches.open(API_CACHE).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(async () => {
          // On failure, try to return cached API response
          const cachedResponse = await caches.match(event.request);
          if (cachedResponse) {
            return cachedResponse;
          }

          // If it's a POST/PUT/DELETE request, store in IndexedDB for later sync
          if (event.request.method !== "GET") {
            // Broadcast to the app that we need to store this request
            self.clients.matchAll().then((clients) => {
              clients.forEach((client) => {
                client.postMessage({
                  type: "STORE_OFFLINE_REQUEST",
                  payload: {
                    url: event.request.url,
                    method: event.request.method,
                    body: event.request.clone().json(),
                  },
                });
              });
            });
          }

          return new Response(JSON.stringify({ error: "Network error, request queued for sync" }), {
            status: 503,
            headers: { "Content-Type": "application/json" },
          });
        }),
    );
    return;
  }

  // Handle regular requests (static assets, pages)
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }

      const fetchRequest = event.request.clone();

      return fetch(fetchRequest)
        .then((response) => {
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response;
          }

          if (shouldCache(event.request)) {
            const responseToCache = response.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }

          return response;
        })
        .catch(() => {
          if (event.request.mode === "navigate") {
            return caches.match(OFFLINE_URL);
          }

          return new Response("Network error happened", {
            status: 408,
            headers: { "Content-Type": "text/plain" },
          });
        });
    }),
  );
});

// Function to sync pending requests
const syncPendingRequests = async () => {
  try {
    // Notify clients that sync is starting
    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
      client.postMessage({
        type: "SYNC_STARTED",
      });
    });

    // Request the client to perform the sync
    clients.forEach((client) => {
      client.postMessage({
        type: "PERFORM_SYNC",
      });
    });

    return true;
  } catch (error) {
    console.error("Sync failed:", error);
    return false;
  }
};

// Listen for sync events
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-pending-requests") {
    event.waitUntil(syncPendingRequests());
  }
});

// Listen for messages from the client
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
