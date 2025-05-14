// Basic service worker with proper paths
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open('mindmatters-cache-v1').then((cache) => {
      console.log('Opened cache');
      return cache.addAll([
        './',
        './index.html',
        // Don't include files that might not exist
      ]);
    }).catch(err => {
      console.error('Cache initialization failed:', err);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request).then(response => {
        if (response) {
          return response;
        }
        
        // For navigation requests, serve index.html
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
        
        return new Response('Network error occurred', {
          status: 408,
          headers: { 'Content-Type': 'text/plain' }
        });
      });
    })
  );
});

self.addEventListener('activate', (event) => {
    const cacheWhitelist = ['mindmatters-cache-v1'];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});