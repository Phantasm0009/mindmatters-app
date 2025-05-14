// Basic service worker with offline support
const CACHE_NAME = 'mindmatters-cache-v1';

// Install event - cache basic assets
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll([
          './', 
          './index.html',
          './offline.html'
        ]);
      })
      .catch(err => console.log('Cache error:', err))
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Fetch event - simple network-first strategy
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        return caches.match(event.request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            
            // For navigation requests, serve index.html
            if (event.request.mode === 'navigate') {
              return caches.match('./index.html');
            }
            
            // Return a simple offline response
            return new Response('Network error', {
              status: 408,
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
  );
});