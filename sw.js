const CACHE = "nihongo-renshu-v2";

const ASSETS = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "styles/main.css",
  "assets/icon.svg",
  "src/main.js",
  "src/views/home.js",
  "src/views/kana.js",
  "src/views/progress.js",
  "src/views/study.js",
  "src/views/tips.js",
  "src/views/ui.js",
  "src/views/welcome.js",
  "src/content/kana.js",
  "src/content/kanji.js",
  "src/content/katakana-drawings.js",
  "src/content/katakana-tips.js",
  "src/content/vocab.js",
  "src/quiz/catalog.js",
  "src/quiz/daily.js",
  "src/quiz/kanapro.js",
  "src/quiz/session.js",
  "src/core/japanese.js",
  "src/core/romaji.js",
  "src/core/speech.js",
  "src/core/srs.js",
  "src/core/store.js",
  "src/core/util.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

// Network first so updates show up immediately; the cache is only the offline fallback.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
