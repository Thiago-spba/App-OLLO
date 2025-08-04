// public/service-worker.js

const CACHE_NAME = 'ollo-cache-v1';

// Adicione todos os arquivos essenciais para o funcionamento offline
const ASSETS_TO_CACHE = [
  '/',
  '/offline.html',
  '/site.webmanifest',
  '/images/android-chrome-192x192.png',   // Ícone OLLO
  '/images/android-chrome-512x512.png',
  '/images/logo_ollo.jpeg',
  '/images/apple-touch-icon.png',
  '/images/favicon-32x32.png',
  '/images/favicon-16x16.png',
  // Acrescente aqui seus principais arquivos JS/CSS caso queira rodar 100% offline
  // '/src/main.jsx',  // Se necessário
];

// Instala o service worker e faz cache dos assets essenciais
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

// Ativa o service worker e remove caches antigos
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

// Intercepta todas as requisições e tenta buscar online primeiro, caindo para o cache/offline.html se offline
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Se quiser cache dinâmico, pode salvar aqui
        return response;
      })
      .catch(() => {
        return caches.match(event.request)
          .then((response) => {
            if (response) return response;
            if (event.request.mode === 'navigate') {
              return caches.match('/offline.html');
            }
          });
      })
  );
});

// (Opcional) Suporte a atualização forçada via postMessage
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
