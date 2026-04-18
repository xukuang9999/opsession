const VERSION = "openclaw-sw-v2026-04-19-1";
const SHELL_CACHE = `${VERSION}-shell`;
const RUNTIME_CACHE = `${VERSION}-runtime`;
const SCOPE_URL = new URL(self.registration.scope || self.location.href);
const BASE_PATH = SCOPE_URL.pathname.replace(/\/$/, "");
const withBasePath = (path) => `${BASE_PATH}${path}`;
const APP_SHELL_URLS = [
  withBasePath("/"),
  withBasePath("/index.html"),
  withBasePath("/site.webmanifest"),
  withBasePath("/favicon.svg"),
  withBasePath("/icon-192.png"),
  withBasePath("/icon-512.png"),
  withBasePath("/apple-touch-icon.png"),
  withBasePath("/og-card.svg"),
  withBasePath("/robots.txt"),
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(APP_SHELL_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const cacheKeys = await caches.keys();
      await Promise.all(
        cacheKeys
          .filter((key) => key !== SHELL_CACHE && key !== RUNTIME_CACHE)
          .map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

function isStaticAsset(pathname) {
  return (
    pathname.startsWith(withBasePath("/assets/")) ||
    pathname.endsWith(".js") ||
    pathname.endsWith(".css") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".jpeg") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".webp") ||
    pathname.endsWith(".avif") ||
    pathname.endsWith(".woff2")
  );
}

async function respondWithAppShell() {
  const cache = await caches.open(SHELL_CACHE);
  return (await cache.match(withBasePath("/index.html"))) ?? (await cache.match(withBasePath("/")));
}

async function networkFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (_error) {
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    return respondWithAppShell();
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  const response = await fetch(request);
  if (response.ok) {
    cache.put(request, response.clone());
  }
  return response;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
    return;
  }

  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirst(request));
  }
});
