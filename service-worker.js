// Names of the two caches used in this version of the service worker.
// Change to v2, etc. when you update any of the local resources, which will
// in turn trigger the install event again.
const PRECACHE = 'precache-v1';
const RUNTIME = 'runtime';

// A list of local resources we always want to be cached.
const PRECACHE_URLS = [
    "/",
    "/app.js",
    "/blue.png",
    "/browserconfig.xml",
    "/choose.html",
    "/favicon.ico",
    "/game.html",
    "/homepic.png",
    "/index.html",
    "/manifest.json",
    "/militech_r_2019-04-13.ttf",
    "/red.gif",
    "/red.jpg",
    "/rock.png",
    "/startbutton.png",
    "/style.css",
    "/WARTORN_.TTF",
    "/flash/app.js",
    "/flash/Flash.gif",
    "/flash/game.html",
    "/flash/militech_r_2019-04-13.ttf",
    "/flash/star.png",
    "/flash/style.css",
    "/flash/WARTORN_.TTF",
    "/green/app.js",
    "/green/green.gif",
    "/green/game.html",
    "/green/militech_r_2019-04-13.ttf",
    "/green/style.css",
    "/green/WARTORN_.TTF"
]
/ The install handler takes care of precaching the resources we always need.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(PRECACHE)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(self.skipWaiting())
  );
});

// The activate handler takes care of cleaning up old caches.
self.addEventListener('activate', event => {
  const currentCaches = [PRECACHE, RUNTIME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
    }).then(cachesToDelete => {
      return Promise.all(cachesToDelete.map(cacheToDelete => {
        return caches.delete(cacheToDelete);
      }));
    }).then(() => self.clients.claim())
  );
});

// The fetch handler serves responses for same-origin resources from a cache.
// If no response is found, it populates the runtime cache with the response
// from the network before returning it to the page.
self.addEventListener('fetch', event => {
  // Skip cross-origin requests, like those for Google Analytics.
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return caches.open(RUNTIME).then(cache => {
          return fetch(event.request).then(response => {
            // Put a copy of the response in the runtime cache.
            return cache.put(event.request, response.clone()).then(() => {
              return response;
            });
          });
        });
      })
    );
  }
});