const CACHE_NAME = 'flashcards-app-cache-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/base.css',
  '/css/auth.css',
  '/css/flashcards.css',
  '/css/test.css',
  '/css/grades.css',
  '/js/auth.js',
  '/js/data.js',
  '/js/flashcards.js',
  '/js/eruda.js',
  '/js/test.js',
  '/js/main.js',
];

// Install the service worker and cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache');
      return cache.addAll(urlsToCache);
    })
  );
});

// Intercept network requests
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached response or fetch from the network
      return response || fetch(event.request);
    })
  );
});

// Update the service worker and delete old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});