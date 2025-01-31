module.exports = {
    globDirectory: 'dist/',
    globPatterns: [
        '**/*.{html,js,css,png,jpg,svg,json}'
    ],
    swDest: 'dist/service-worker.js',
    runtimeCaching: [
        // Caching untuk gambar
        {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
                cacheName: 'images-cache',
                expiration: {
                    maxEntries: 50,
                    maxAgeSeconds: 30 * 24 * 60 * 60, // 30 hari
                },
            },
        },
        // Caching untuk Supabase
        {
            urlPattern: ({ url }) => url.origin === 'https://uyglrjipigdbrixmzash.supabase.co',
            handler: 'NetworkFirst',
            options: {
                cacheName: 'supabase-api-cache',
                networkTimeoutSeconds: 10,
                plugins: [
                    {
                        cacheWillUpdate: async ({ response }) => {
                            return response && response.ok ? response : null;
                        },
                    },
                ],
            },
        },
        // Caching untuk Nominatim API
        {
            urlPattern: ({ url }) => url.origin === 'https://nominatim.openstreetmap.org',
            handler: 'StaleWhileRevalidate',
            options: {
                cacheName: 'nominatim-api-cache',
                plugins: [
                    {
                        cacheWillUpdate: async ({ response }) => {
                            if (!response || !response.ok) {
                                return null;
                            }

                            // Add a custom header to record the expiration timestamp
                            const clonedResponse = response.clone();
                            const expirationTimestamp = Date.now() + 24 * 60 * 60 * 1000; // 1 hari
                            const headers = new Headers(clonedResponse.headers);
                            headers.append('x-cache-expiration', expirationTimestamp.toString());

                            return new Response(clonedResponse.body, {
                                status: clonedResponse.status,
                                statusText: clonedResponse.statusText,
                                headers,
                            });
                        },
                    },
                    {
                        fetchDidSucceed: async ({ response }) => {
                            // Clean up old, expired responses in the cache
                            const clonedResponse = response.clone();
                            const expirationTimestamp = clonedResponse.headers.get('x-cache-expiration');
                            if (expirationTimestamp && Date.now() > parseInt(expirationTimestamp, 10)) {
                                return null; // Delete expired responses
                            }
                            return response; // Save response if it has not expired
                        },
                    },
                ],
            },
        },
    ],
};
