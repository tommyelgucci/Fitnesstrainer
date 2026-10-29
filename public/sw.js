/*
 * Service worker de FitnessB Exam. El plugin `swPrecache` de vite.config.ts rellena
 * VERSION y PRECACHE al construir (en desarrollo no se registra).
 *
 * - Precachea todo el build (la app es 100 % estática) para funcionar sin conexión.
 * - Navegación: red primero (3 s) y, si falla, el index.html guardado (SPA).
 * - Resto del mismo origen: caché primero.
 * - Cada despliegue cambia VERSION → caché nueva, y se borran las antiguas.
 */
const VERSION = '__VERSION__';
const PRECACHE = __PRECACHE__;
const CACHE = `fitnessb-${VERSION}`;
const BASE = self.registration.scope; // termina en /Fitnesstrainer/

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll(PRECACHE.map((p) => new URL(p, BASE).href)))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('fitnessb-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

const conTiempo = (promesa, ms) =>
  new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('timeout')), ms);
    promesa.then((r) => { clearTimeout(t); resolve(r); }, (e) => { clearTimeout(t); reject(e); });
  });

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin || !url.href.startsWith(BASE)) return;

  if (req.mode === 'navigate') {
    event.respondWith(
      conTiempo(fetch(req), 3000).catch(() => caches.match(new URL('index.html', BASE).href).then((r) => r || caches.match(BASE))),
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(
      (hit) =>
        hit ||
        fetch(req).then((res) => {
          if (res.ok) {
            const copia = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copia));
          }
          return res;
        }),
    ),
  );
});
