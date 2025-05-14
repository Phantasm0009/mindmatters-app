// MindMatters Service Worker
const GITHUB_PAGES_PATH = '/mindmatters-app';
const isGitHubPages = self.location.pathname.startsWith(GITHUB_PAGES_PATH);
const BASE_PATH = isGitHubPages ? GITHUB_PAGES_PATH : '';

const CACHE_NAME = 'mindmatters-cache-v1';

// Assets to cache on install
const STATIC_ASSETS = [
  BASE_PATH + '/',
  BASE_PATH + '/index.html',
  BASE_PATH + '/offline.html',
  BASE_PATH + '/manifest.json',
  BASE_PATH + '/static/css/main.css',
  BASE_PATH + '/static/js/main.js',
  BASE_PATH + '/static/media/logo.png',
  BASE_PATH + '/favicon.ico',
  BASE_PATH + '/icons/icon-192x192.png',
  BASE_PATH + '/icons/icon-512x512.png'
];

// Install event - cache core assets
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Take control immediately
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(STATIC_ASSETS);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker activated, claiming clients');
      return self.clients.claim();
    })
  );
});

// Fetch event - network-first strategy for API requests, cache-first for static assets
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  // Handle API requests with network-first strategy
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Clone the response before using it
          const responseToCache = response.clone();
          
          // Cache successful responses
          if (response.ok) {
            caches.open(CACHE_NAME)
              .then(cache => cache.put(event.request, responseToCache));
          }
          
          return response;
        })
        .catch(() => {
          // If network fails, try to serve from cache
          return caches.match(event.request);
        })
    );
    return;
  }
  
  // For non-API requests, use cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request)
          .then(response => {
            // Return the response if it's not valid for caching
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone and cache valid responses
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // Serve offline page for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match(BASE_PATH + '/offline.html');
            }
            
            // For image requests, serve a placeholder
            if (event.request.destination === 'image') {
              return new Response(
                '<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">' +
                '<rect width="400" height="300" fill="#f0f0f0"/>' +
                '<text x="50%" y="50%" font-family="Arial" font-size="24" text-anchor="middle" fill="#888">Image Unavailable</text>' +
                '</svg>',
                { 
                  headers: {'Content-Type': 'image/svg+xml'} 
                }
              );
            }
          });
      })
  );
});

// Background Sync for pending journal entries
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-journal-entries') {
    event.waitUntil(syncJournalEntries());
  }
});

// Helper function to sync pending journal entries
async function syncJournalEntries() {
  try {
    const db = await openDatabase();
    const pendingEntries = await getPendingSyncEntries(db);
    
    if (pendingEntries.length === 0) {
      return;
    }
    
    // Process each pending entry
    for (const entry of pendingEntries) {
      try {
        const response = await fetch('/api/journal', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(entry.data)
        });
        
        if (response.ok) {
          // Mark as synced in IndexedDB
          await markEntrySynced(db, entry.id);
        }
      } catch (error) {
        console.error('Failed to sync entry:', error);
      }
    }
  } catch (error) {
    console.error('Sync failed:', error);
  }
}

// Local notification scheduling
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SCHEDULE_NOTIFICATION') {
    const { title, body, tag, timestamp } = event.data;
    const delay = timestamp - Date.now();
    
    // Schedule notification
    if (delay > 0) {
      setTimeout(() => {
        self.registration.showNotification(title, {
          body: body,
          icon: BASE_PATH + '/icons/icon-192x192.png',
          badge: BASE_PATH + '/icons/badge-96x96.png',
          tag: tag,
          vibrate: [100, 50, 100],
          actions: [
            {
              action: 'open',
              title: 'Open Journal'
            },
            {
              action: 'dismiss',
              title: 'Dismiss'
            }
          ]
        });
      }, delay);
    }
  }
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'open' || event.action === '') {
    // Open the journal page
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then(clientList => {
        // If a window client is already open, focus it
        for (const client of clientList) {
          if (client.url === '/' && 'focus' in client) {
            client.navigate(BASE_PATH + '/journal');
            return client.focus();
          }
        }
        
        // Otherwise open a new window
        return clients.openWindow(BASE_PATH + '/journal');
      })
    );
  }
});

// Periodic background sync for daily reminders
// Note: This is only supported in Chrome-based browsers
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'daily-reminder') {
    event.waitUntil(checkAndSendDailyReminder());
  }
});

// Helper function to check if a reminder should be sent
async function checkAndSendDailyReminder() {
  try {
    // Get user's reminder preferences from IndexedDB
    const db = await openDatabase();
    const settings = await getNotificationSettings(db);
    
    if (!settings || !settings.enabled) {
      return;
    }
    
    // Check if we're in the reminder window
    const now = new Date();
    const reminderHour = settings.reminderTime || 20; // Default to 8 PM
    const currentHour = now.getHours();
    
    if (currentHour === reminderHour) {
      // Check if user already made an entry today
      const hasEntry = await hasJournalEntryToday(db);
      
      if (!hasEntry) {
        // Send reminder notification
        await self.registration.showNotification('MindMatters Daily Check-in', {
          body: 'How are you feeling today? Take a moment to log your mood.',
          icon: BASE_PATH + '/icons/icon-192x192.png',
          badge: BASE_PATH + '/icons/badge-96x96.png',
          tag: 'daily-reminder',
          vibrate: [100, 50, 100],
          actions: [
            {
              action: 'open',
              title: 'Log Now'
            },
            {
              action: 'dismiss',
              title: 'Later'
            }
          ]
        });
      }
    }
  } catch (error) {
    console.error('Error in daily reminder check:', error);
  }
}

// Helper functions for IndexedDB
async function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('MindMattersDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create stores if they don't exist
      if (!db.objectStoreNames.contains('moodEntries')) {
        const entriesStore = db.createObjectStore('moodEntries', { keyPath: 'id', autoIncrement: true });
        entriesStore.createIndex('date', 'date', { unique: false });
        entriesStore.createIndex('synced', 'synced', { unique: false });
      }
      
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'id' });
      }
    };
  });
}

async function getPendingSyncEntries(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['moodEntries'], 'readonly');
    const store = transaction.objectStore('moodEntries');
    const index = store.index('synced');
    const request = index.getAll(0); // 0 = not synced
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

async function markEntrySynced(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['moodEntries'], 'readwrite');
    const store = transaction.objectStore('moodEntries');
    const request = store.get(id);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const entry = request.result;
      entry.synced = 1;
      
      const updateRequest = store.put(entry);
      updateRequest.onerror = () => reject(updateRequest.error);
      updateRequest.onsuccess = () => resolve();
    };
  });
}

async function getNotificationSettings(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['settings'], 'readonly');
    const store = transaction.objectStore('settings');
    const request = store.get('notificationSettings');
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result ? request.result.value : null);
  });
}

async function hasJournalEntryToday(db) {
  return new Promise((resolve, reject) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const transaction = db.transaction(['moodEntries'], 'readonly');
    const store = transaction.objectStore('moodEntries');
    const index = store.index('date');
    const range = IDBKeyRange.bound(today.toISOString(), tomorrow.toISOString());
    const request = index.count(range);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result > 0);
  });
}