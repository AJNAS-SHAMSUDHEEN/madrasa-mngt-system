self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  // Network-first pass-through so live Firestore/Auth always stay fresh
  if (event.request.method !== "GET") return;
  event.respondWith(fetch(event.request));
});
