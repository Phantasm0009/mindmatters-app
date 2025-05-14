// Basic service worker with minimal caching
self.addEventListener('install', (event) => {
  console.log('Service worker installing...');
  self.skipWaiting();
  event.waitUntil(
    caches.open('mindmatters-cache-v1').then((cache) => {
      return cache.addAll([
        './',
        './index.html',
        './manifest.json'
      ]);
    })
  );
});

self.addEventListener('activate', (event) => {
  console.log('Service worker activating...');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});