const CACHE_NAME = '4maker-admin-v4.2.3.2';
const STATIC_ASSETS = [
  './login.html',
  './painel.html',
  './logo.png',
  './manifest.webmanifest'
];

function isMutableProductJson(url) {
  let pathname = url.pathname;

  try {
    pathname = decodeURIComponent(pathname);
  } catch (_) {
    // Se a URL tiver escape inválido, apenas use o pathname original.
  }

  return /\/Modelos\/produtos\.json$/i.test(pathname) ||
    /\/Modelos\/[^/]+\/produto\.json$/i.test(pathname);
}

async function networkFirstMutableJson(request) {
  try {
    const response = await fetch(request, { cache: 'no-store' });

    if (response.ok) {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
    }

    // HTTP 404/500 é uma resposta atual da rede: não ressuscite JSON antigo.
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;
    throw error;
  }
}

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key.startsWith('4maker-admin-') && key !== CACHE_NAME)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (isMutableProductJson(url)) {
    event.respondWith(networkFirstMutableJson(request));
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
          }
          return response;
        })
        .catch(async () => {
          return (await caches.match(request)) ||
            (await caches.match('./login.html'));
        })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        }
        return response;
      });
    })
  );
});
