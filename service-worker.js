// MindMatters Service Worker
const CACHE_NAME = 'mindmatters-cache-v1';
const urlsToCache = [
  './',
  './index.html',
  './offline.html'
];

// Don't attempt to cache external resources that might fail
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch(err => console.error('Cache addAll failed:', err))
  );
  self.skipWaiting();
});

// Use a cache-first strategy with network fallback
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        
        return fetch(event.request).catch(() => {
          // For navigation requests, return the offline page
          if (event.request.mode === 'navigate') {
            return caches.match('./offline.html');
          }
          
          // Otherwise just fail
          return new Response('Network error', {
            status: 408,
            headers: { 'Content-Type': 'text/plain' }
          });
        });
      })
  );
});