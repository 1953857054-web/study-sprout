// 学芽 PWA Service Worker
var CACHE_NAME = 'study-sprout-v1';
var ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/css/variables.css',
  '/css/base.css',
  '/css/components.css',
  '/css/pages.css',
  '/js/config.js',
  '/js/api.js',
  '/js/date-utils.js',
  '/js/storage.js',
  '/js/ai-sim.js',
  '/js/error-book.js',
  '/js/tasks.js',
  '/js/plant.js',
  '/js/pages.js',
  '/js/app.js',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ASSETS);
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k) { return caches.delete(k); })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function(e) {
  // 不缓存API请求
  if (e.request.url.indexOf('/api/') !== -1) return;

  e.respondWith(
    caches.match(e.request).then(function(cached) {
      return cached || fetch(e.request).then(function(resp) {
        return resp;
      }).catch(function() {
        return cached || new Response('离线模式');
      });
    })
  );
});
