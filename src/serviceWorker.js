const CACHE_NAME = "pwa-the-sanur-v1";
const DYNAMIC_CACHE = "dynamic-v1";
const OFFLINE_URL = "/offline.html";
const API_CACHE = "api-cache-v1";

const API_CACHE_URLS = [
  'supabase.co/auth/v1/user',
  'supabase.co/rest/v1/user_profiles',
  'nominatim.openstreetmap.org/reverse'
];

const CRITICAL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/service-worker.js',
  '/static/js/main.chunk.js',
  '/static/js/0.chunk.js',
  '/static/js/bundle.js',
  '/static/css/main.chunk.css',
  '/assets/logo/logo-ts.svg'
];

const CACHE_MAP_ASSETS = ["/leaflet.css", "/marker-icon.png", "/marker-icon-2x.png", "/marker-shadow.png"];

const urlsToCache = [
  ...CRITICAL_ASSETS,
  ...CACHE_MAP_ASSETS,
  OFFLINE_URL,
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

self.addEventListener('install', (event) => {
  console.log('Service Worker installing.');
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then((cache) => {
        console.log('Caching critical assets');
        return cache.addAll(CRITICAL_ASSETS);
      }),
      caches.open(DYNAMIC_CACHE).then((cache) => {
        console.log('Caching other assets');
        return cache.addAll(urlsToCache.filter(url => !CRITICAL_ASSETS.includes(url)));
      })
    ])
    .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating.');
  event.waitUntil(
    Promise.all([
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME && name !== DYNAMIC_CACHE && name !== API_CACHE)
            .map((name) => caches.delete(name))
        );
      }),
      self.clients.claim()
    ])
  );
});

self.addEventListener("fetch", (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin) && !event.request.url.includes("supabase.co")) {
    return;
  }

  // Handle navigate requests differently
  if (event.request.mode === 'navigate') {
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
          try {
            const networkResponse = await fetch(event.request);
            if (networkResponse.ok) {
              const clonedResponse = networkResponse.clone();
              await cache.put(event.request, clonedResponse);
              return networkResponse;
            }
          } catch (error) {
            console.log('Network request failed, falling back to cache');
          }

          // Jika network gagal, coba cached index.html
          const cachedIndex = await cache.match('/index.html');
          if (cachedIndex) {
            return new Response(cachedIndex.body, {
              headers: {
                ...cachedIndex.headers,
                'Content-Security-Policy': "default-src 'self' 'unsafe-inline' 'unsafe-eval' https: data: blob:",
                'Cache-Control': 'no-store'
              }
            });
          }

          // Fallback terakhir ke offline page
          return cache.match(OFFLINE_URL);
        } catch (error) {
          console.error('Error in navigate handler:', error);
          const cache = await caches.open(CACHE_NAME);
          return cache.match(OFFLINE_URL);
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
