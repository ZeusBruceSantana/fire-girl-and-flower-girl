/* Ember Bloom offline helper (a "service worker").
   After the game has been opened once with internet, the tablet keeps a copy of every
   file, so the game works without internet. When there is internet, it always gets the
   newest files first, so updates arrive by themselves. Nothing here needs changing
   when the game is updated. (Same approach as Twin Pets.) */
const CACHE = 'ember-bloom-files';

// Pictures the page only asks for once the game is running (none yet).
// Scene and character art is fetched as the game runs; list the art folders so the first visit saves them too.
const EXTRA_FILES = [];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    const page = await fetch('./index.html', { cache: 'no-store' });
    const html = await page.clone().text();
    await cache.put('./index.html', page.clone());
    await cache.put('./', page);
    const files = [...html.matchAll(/(?:src|href)="([^"#]+)"/g)].map(m => m[1])
      .filter(u => !/^(https?:|data:|mailto:)/.test(u));
    await Promise.all([...new Set([...files, ...EXTRA_FILES])].map(u => cache.add(u).catch(() => {})));
  })());
  self.skipWaiting();
});
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));

const timeout = (promise, ms) => new Promise((resolve, reject) => {
  const t = setTimeout(() => reject(new Error('slow')), ms);
  promise.then(r => { clearTimeout(t); resolve(r); }, e => { clearTimeout(t); reject(e); });
});
// Every time the game asks for a file: try the internet first, then the saved copy.
self.addEventListener('fetch', event => {
  const req = event.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  if (url.pathname.includes('/tests/') || url.searchParams.has('test')) return;   // the test page always uses the internet
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const fresh = fetch(req, { cache: 'no-cache' }).then(res => {
      if (res && res.ok) cache.put(req, res.clone());
      return res;
    });
    try {
      return await timeout(fresh, 4000);
    } catch (e) {
      const copy = await cache.match(req) || (req.mode === 'navigate' && await cache.match('./index.html'));
      if (copy) return copy;
      return fresh;
    }
  })());
});
