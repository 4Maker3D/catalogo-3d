const CACHE_NAME = '4maker-admin-v4.2.3.4';
const STATIC_ASSETS = [
  './login.html',
  './painel.html',
  './logo.png',
  './manifest.webmanifest'
];

const CACHE_BUST_PARAM = '_4mcb';

function decodedPathname(url) {
  let pathname = url.pathname;

  try {
    pathname = decodeURIComponent(pathname);
  } catch (_) {
    // Escape inválido: use o pathname original.
  }

  return pathname;
}

function isMutableProductResource(url) {
  const pathname = decodedPathname(url);

  return /\/Modelos\/produtos\.json$/i.test(pathname) ||
    /\/Modelos\/[^/]+\/produto\.json$/i.test(pathname) ||
    /\/Modelos\/[^/]+\/modelo\.stl$/i.test(pathname);
}

function stableMutableCacheKey(url) {
  const stable = new URL(url.href);
  stable.searchParams.delete(CACHE_BUST_PARAM);
  return stable.href;
}

async function networkFirstMutableResource(request, url) {
  const cacheKey = stableMutableCacheKey(url);

  try {
    const networkRequest = new Request(request, { cache: 'no-store' });
    const response = await fetch(networkRequest);

    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(cacheKey, response.clone());
    }

    // 404/500 atuais da rede devem ser respeitados.
    // Não ressuscite uma versão antiga apenas porque existe em cache.
    return response;
  } catch (error) {
    const cached = await caches.match(cacheKey);
    if (cached) return cached;
    throw error;
  }
}

function stableNavigationCacheKey(url) {
  const stable = new URL(url.href);

  // Parâmetros usados apenas para forçar uma navegação nova não devem
  // criar cópias permanentes adicionais do mesmo HTML no cache offline.
  stable.searchParams.delete('_4mnav');
  stable.searchParams.delete('v');

  return stable.href;
}

async function networkFirstNavigation(request, url) {
  const cacheKey = stableNavigationCacheKey(url);

  try {
    // O ponto crítico deste hotfix: a própria navegação precisa ignorar
    // o HTTP cache do navegador. Assim um index.html antigo não impede
    // a execução do código novo de atualização/cache-busting dos produtos.
    const networkRequest = new Request(request, { cache: 'no-store' });
    const response = await fetch(networkRequest);

    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(cacheKey, response.clone());
    }

    // Uma resposta HTTP atual (404/500) deve prevalecer sobre HTML antigo.
    return response;
  } catch (error) {
    const cached = await caches.match(cacheKey);
    if (cached) return cached;

    // Mantém o fallback offline administrativo já existente.
    const login = await caches.match('./login.html');
    if (login) return login;

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

  if (isMutableProductResource(url)) {
    event.respondWith(networkFirstMutableResource(request, url));
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstNavigation(request, url));
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
