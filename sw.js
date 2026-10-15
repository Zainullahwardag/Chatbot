// Install and activate the new worker right away.
self.addEventListener("install", (e) => self.skipWaiting());
self.addEventListener("activate", (e) => self.clients.claim());

// Use the network for every request. This does not provide offline chat.
self.addEventListener("fetch", (e) => e.respondWith(fetch(e.request)));
