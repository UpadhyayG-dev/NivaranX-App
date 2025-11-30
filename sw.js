const CACHE_NAME = 'nivaranx-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://img1.wsimg.com/isteam/ip/e8186a9b-5cfd-4d09-9ac8-87df4de0cc9e/IMG-20251109-WA0001.jpg'
];

// Domains for dynamic caching (Libraries, Fonts, Avatars)
const DYNAMIC_DOMAINS = [
  'cdn.tailwindcss.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'unpkg.com',
  'cdnjs.cloudflare.com',
  'aistudiocdn.com',
  'api.dicebear.com',
  'images.unsplash.com',
  'picsum.photos'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Opened cache');
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Strategy: Stale-While-Revalidate for cached items, Network-First for others, fallback to Cache
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      // Determine if we should cache this request dynamically
      const isCacheable = DYNAMIC_DOMAINS.some(domain => url.hostname.includes(domain)) || url.origin === self.location.origin;

      const networkFetch = fetch(event.request).then(networkResponse => {
        // Update cache if successful and cacheable
        if (networkResponse && networkResponse.status === 200 && isCacheable) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Network failed
        // If it's a navigation request (HTML), return index.html if not found
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });

      // Return cached response immediately if available (Stale-While-Revalidate pattern)
      // Otherwise wait for network
      return cachedResponse || networkFetch;
    })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});