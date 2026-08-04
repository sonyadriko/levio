const CACHE_NAME = "levio-shell-v10";
const PRECACHE_URLS = ["/", "/manifest.webmanifest", "/icon-192.png", "/icon-512.png"];
const PRECACHE_PATHNAMES = PRECACHE_URLS.map(
  (url) => new URL(url, self.location.origin).pathname,
);
// Aset statis lama (hashed JS/CSS dari rilis sebelumnya) diprune jika sudah
// berumur lebih dari ini — mencegah cache membesar tanpa batas.
const ASSET_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Hapus cache versi lain.
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)),
      );
      // Prune aset lama di dalam cache aktif (kecuali precache inti).
      const cache = await caches.open(CACHE_NAME);
      const requests = await cache.keys();
      const now = Date.now();
      await Promise.all(
        requests
          .filter((req) => {
            const pathname = new URL(req.url).pathname;
            return !PRECACHE_PATHNAMES.includes(pathname);
          })
          .map(async (req) => {
            const response = await cache.match(req);
            if (!response) return;
            const date = response.headers.get("date");
            if (!date) return;
            const age = now - new Date(date).getTime();
            if (Number.isFinite(age) && age > ASSET_MAX_AGE_MS) {
              await cache.delete(req);
            }
          }),
      );
      await self.clients.claim();
    })(),
  );
});

// Navigasi (HTML): network-first, fallback ke cache agar offline tetap bisa
// membuka halaman. Aset statis (JS/CSS, hashed): cache-first dengan pembaruan
// di latar belakang. Request API/TTS dan origin lain tidak diintervensi.
self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() =>
          caches.match(request).then((cached) => cached || caches.match("/")),
        ),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    }),
  );
});
