// public/service-worker.js

const CACHE_NAME = 'ollo-cache-v1';

// Adicione aqui todos os arquivos essenciais para o funcionamento offline
const ASSETS_TO_CACHE = [
  '/',
  '/offline.html',
  '/images/android-chrome-192x192.png',   // Ícone OLLO
  '/images/logo_ollo.jpeg',               // Logo principal
  // Adicione outros arquivos importantes se quiser
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Intercepta todas as requisições
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .catch(() => {
        // Se estiver offline, tenta o cache primeiro
        return caches.match(event.request)
          .then((response) => {
            // Se não achar o arquivo no cache, serve o offline.html para páginas de navegação
            if (response) return response;
            if (event.request.mode === 'navigate') {
              return caches.match('/offline.html');
            }
          });
      })
  );
});
