const CACHE_NAME = 'reeltalk-cache-v1';

// We will let the fetch handler cache assets dynamically
const urlsToCache = [
  '/',
  '/index.html',
];

self.addEventListener('install', event => {
  self.skipWaiting(); // Activate worker immediately
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Opened cache');
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('activate', event => {
  // Clean up old caches
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    })
  );
});

self.addEventListener('fetch', event => {
  // We only want to cache GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(response => {
      // Cache hit - return response
      if (response) {
        return response;
      }

      // Not in cache, go to network
      return fetch(event.request).then(response => {
        // Check if we received a valid response
        if (!response || response.status !== 200) {
          return response;
        }

        // We don't cache Chrome extension requests
        if (event.request.url.startsWith('chrome-extension://')) {
          return response;
        }

        const responseToCache = response.clone();

        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });

        return response;
      }).catch(err => {
        console.error("Fetch failed:", err);
        // If the fetch fails (e.g., offline), we can return an offline page or a generic error response.
        // For now, we just let the browser handle the error.
        throw err;
      });
    })
  );
});
