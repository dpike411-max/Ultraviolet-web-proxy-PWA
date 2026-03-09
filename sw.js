// sw.js – Ultraviolet service worker

importScripts('https://esm.sh/@titaniumnetwork-dev/ultraviolet@latest/uv.bundle.js');
importScripts('https://esm.sh/@titaniumnetwork-dev/ultraviolet@latest/uv.config.js?module'); // if needed – adjust
importScripts('https://esm.sh/@mercuryworkshop/bare-mux@latest/bare.as.module.js'); // bare-mux

// IMPORTANT: match prefix from app.js
self.__uv$config = {
  prefix: '/uv/service/',
  bare: 'https://your-bare-server.example.com/', // ← same as app.js
  encodeUrl: Ultraviolet.codec.xor.encode,      // or base64 / plain if preferred
  decodeUrl: Ultraviolet.codec.xor.decode,
  handler: '/uv/uv.handler.js',
  client: '/uv/uv.client.js',
  bundle: '/uv/uv.bundle.js',
  config: '/uv/uv.config.js',
  sw: '/sw.js'
};

const sw = new UVServiceWorker();

self.addEventListener('fetch', event => {
  event.respondWith(
    sw.fetch(event).catch(err => {
      console.error('[UV SW]', err);
      return new Response('Proxy error', { status: 500 });
    })
  );
});
