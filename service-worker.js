const CACHE_NAME = 'textify-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/index.tsx', // Your main application entry point
  // Add other critical assets here if they are local and not handled by CDNs
  // E.g., '/styles/main.css', '/js/utils.js', etc.
  // Note: External CDNs are handled by the fetch event below, but can also be precached if stable.
];

// Install event: precache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate event: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
          return null;
        })
      );
    })
  );
});

// Fetch event: serve from cache first, then network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache hit - return response
      if (response) {
        return response;
      }

      // No cache hit - fetch from network and cache for future
      return fetch(event.request).then((networkResponse) => {
        // Check if we received a valid response
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        // IMPORTANT: Clone the response. A response is a stream
        // and can only be consumed once. We must clone it so that
        // the browser can consume one and we can consume the other.
        const responseToCache = networkResponse.clone();

        caches.open(CACHE_NAME)
          .then((cache) => {
            cache.put(event.request, responseToCache);
          });

        return networkResponse;
      }).catch(() => {
        // Fallback for when network is unavailable and not in cache
        // You could serve an offline page here
        // For now, return a generic error or nothing
        console.error('Fetch failed for:', event.request.url);
        return new Response('<h1>Offline</h1><p>The application is currently offline and this content is not cached.</p>', {
          headers: { 'Content-Type': 'text/html' }
        });
      });
    })
  );
});