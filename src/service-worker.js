/* eslint-disable no-restricted-globals */
const CACHE_NAME = 'berbagi-cerita-v3';
const urlsToCache = [
  '/',
  '/index.html',
  '/app.bundle.js',
  '/styles/styles.css',
  '/app.css',
  '/images/logo.png',
  '/images/favicon.png',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  console.log('🍼 Service Worker: Install');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('📦 Cache semua file...');
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('♻️ Service Worker: Activate');
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log('🧹 Hapus cache lama:', name);
            return caches.delete(name);
          }
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return (
        response ||
        fetch(event.request).catch(() => {
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        })
      );
    })
  );
});
