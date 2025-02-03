const CACHE_NAME = "pwa-the-sanur-v1";
const DYNAMIC_CACHE = "dynamic-v1";
const OFFLINE_URL = "/offline.html";
const API_CACHE = "api-cache-v1";
const API_CACHE_URLS = [
  'supabase.co/auth/v1/user',
  'supabase.co/rest/v1/user_profiles',
  'nominatim.openstreetmap.org/reverse'
];

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

  // Handle navigate requests differently
  if (event.request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          // Coba cache terlebih dahulu
          const cache = await caches.open(CACHE_NAME);
          const cachedResponse = await cache.match(event.request);
          
          if (cachedResponse) {
            return cachedResponse;
          }

          // Jika tidak ada di cache, coba network
          const networkResponse = await fetch(event.request);
          
          if (networkResponse.ok) {
            // Cache response untuk penggunaan selanjutnya
            const clonedResponse = networkResponse.clone();
            cache.put(event.request, clonedResponse);
            return networkResponse;
          }
          
          // Jika network response tidak ok, gunakan cached index
          return cache.match('/index.html');
        } catch (error) {
          // Jika network error, gunakan cached index
          const cache = await caches.open(CACHE_NAME);
          const cachedIndex = await cache.match('/index.html');
          
          if (cachedIndex) {
            return cachedIndex;
          }
          
          // Jika tidak ada cache sama sekali, kembalikan custom offline response
          return new Response(
            `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>The Sanur</title>
                <style>
                    body {
                        margin: 0;
                        padding: 16px;
                        font-family: system-ui, -apple-system, sans-serif;
                        background: #f9fafb;
                        height: 100vh;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                    }
                </style>
            </head>
            <body>
                <div id="root"></div>
                <script>
                    // Ini akan memastikan app React kita di-mount
                    window.addEventListener('load', () => {
                        if (typeof window.__REACT_ROOT__ !== 'undefined') {
                            window.__REACT_ROOT__.render(
                                React.createElement(App, null)
                            );
                        }
                    });
                </script>
            </body>
            </html>
            `,
            {
              status: 200,
              headers: {
                'Content-Type': 'text/html',
                'Cache-Control': 'no-cache'
              }
            }
          );
        }
      })()
    );
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
      fetch(event.request.clone(), {
        credentials: 'same-origin',
        cache: 'no-cache'
      })
      .then(response => {
        if (response.ok && event.request.method === "GET") {
          if (API_CACHE_URLS.some(url => event.request.url.includes(url))) {
            const responseToCache = response.clone();
            caches.open(API_CACHE).then(cache => {
              cache.put(event.request, responseToCache);
            });
          }
        }
        return response;
      })
      .catch(async () => {
        const cachedResponse = await caches.match(event.request);
        return cachedResponse || new Response(
          JSON.stringify({ 
            error: "Network error",
            offline: true 
          }), {
            status: 503,
            headers: { 
              'Content-Type': 'application/json',
              'Cache-Control': 'no-store'
            }
          }
        );
      })
    );
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
            event.respondWith(
              (async () => {
                try {
                  // Try network first
                  const preloadResponse = await event.preloadResponse;
                  if (preloadResponse) {
                    return preloadResponse;
                  }
        
                  const networkResponse = await fetch(event.request);
                  return networkResponse;
                } catch (error) {
                  // Network failed, try cache
                  const cache = await caches.open(CACHE_NAME);
                  const cachedResponse = await cache.match('/index.html');
                  return cachedResponse;
                }
              })()
            );
            return;
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
