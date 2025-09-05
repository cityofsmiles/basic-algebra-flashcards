const CACHE_NAME = "algebra-flashcards-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/index.css",
  "/src/main.jsx",
  "/components/Flashcards.jsx",
  "/icons/icon-192.png",
  "/icons/icon-512.png"
];

// Install event: cache assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

// Activate event: clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
});

// Fetch event: serve cached files first, fallback to network
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});