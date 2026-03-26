const CACHE_NAME = "axinom-ingest-shell-v1-5-2-refresh";
const APP_SHELL = ["/", "/index.html", "/app.js", "/styles.css"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key.startsWith("axinom-ingest-shell-") && key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      ))
      .then(() => self.clients.claim()),
  );
});

function cacheShellResponse(request, response) {
  if (!response || !response.ok) {
    return response;
  }

  const path = new URL(request.url).pathname;
  const cacheKey = path === "/" ? "/index.html" : path;
  const responseClone = response.clone();
  void caches.open(CACHE_NAME).then((cache) => cache.put(cacheKey, responseClone));
  return response;
}

self.addEventListener("fetch", (event) => {
  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  if (requestUrl.pathname.startsWith("/api/")) {
    return;
  }

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => cacheShellResponse(event.request, response))
        .catch(() => caches.match("/index.html")),
    );
    return;
  }

  if (APP_SHELL.includes(requestUrl.pathname)) {
    const cacheKey = requestUrl.pathname === "/" ? "/index.html" : requestUrl.pathname;
    event.respondWith(
      fetch(event.request)
        .then((response) => cacheShellResponse(event.request, response))
        .catch(() => caches.match(cacheKey)),
    );
  }
});
