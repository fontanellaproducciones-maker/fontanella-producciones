// v3: solo guarda copias de los archivos propios de la web (mismo dominio), con la red primero
// para que los cambios se vean enseguida, y usa la copia guardada solo si no hay conexion.
// Antes guardaba cualquier respuesta, tambien de otros dominios y sin limite.
const CACHE_NAME = 'fontanella-cache-v3';

self.addEventListener('install', () => { self.skipWaiting(); });

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // terceros (Elfsight, Supabase, fuentes): sin tocar
  event.respondWith(
    fetch(req)
      .then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        }
        return response;
      })
      .catch(() => caches.match(req))
  );
});
