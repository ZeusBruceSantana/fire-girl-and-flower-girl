/* Ember Bloom offline helper (a "service worker").
   The first time the game is opened with internet, the tablet saves a copy of EVERY file the game
   needs (the list is sw-manifest.js, made by  node tools/make-manifest.js ), so the game works
   without internet after that, including places the girls have not visited yet.
   Pictures are served from the saved copy first (they only change when their version number does).
   Code and pages try the internet first, so updates arrive by themselves, and fall back to the
   saved copy within a moment when the wifi is slow or gone. (Same approach as Twin Pets.)
   After adding a picture, run the manifest tool so the new file is on the list. */
const CACHE = 'ember-bloom-files-v2';

importScripts('sw-manifest.js');   // defines SW_FILES

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    const files = [...new Set(['./', ...SW_FILES])];
    // small batches, one file at a time inside each: a missing file never breaks the install
    for (let i = 0; i < files.length; i += 12) {
      await Promise.all(files.slice(i, i + 12).map(u => cache.add(new Request(u, { cache: 'no-cache' })).catch(() => {})));
    }
  })());
  self.skipWaiting();
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) if (key !== CACHE) await caches.delete(key);
    await self.clients.claim();
  })());
});

const timeout = (promise, ms) => new Promise((resolve, reject) => {
  const t = setTimeout(() => reject(new Error('slow')), ms);
  promise.then(r => { clearTimeout(t); resolve(r); }, e => { clearTimeout(t); reject(e); });
});
const NETWORK_WAIT_MS = 1500;
const isArt = pathname => /\/(art|icons)\//.test(pathname);

self.addEventListener('fetch', event => {
  const req = event.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  if (url.pathname.includes('/tests/') || url.searchParams.has('test')) return;   // the test page always uses the internet
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const fromNet = () => fetch(req, { cache: 'no-cache' }).then(res => {
      if (res && res.ok) cache.put(req, res.clone());
      return res;
    });
    if (isArt(url.pathname)) {                 // pictures: the saved copy first (?v= is ignored when matching)
      const copy = await cache.match(req, { ignoreSearch: true });
      if (copy) return copy;
      return fromNet();
    }
    const fresh = fromNet();                   // code and pages: the internet first, then the saved copy
    try {
      return await timeout(fresh, NETWORK_WAIT_MS);
    } catch (e) {
      const copy = await cache.match(req, { ignoreSearch: true })
        || (req.mode === 'navigate' && (await cache.match('index.html') || await cache.match('./')));
      if (copy) return copy;
      return fresh;
    }
  })());
});
