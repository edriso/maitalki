/*
 * MaiTalki offline support.
 *
 * - Pages: network first, so a new deploy shows up immediately; the cached page is the offline fallback.
 * - Built assets and model audio: cache first. Their file names contain a content hash, so a cached
 *   copy is never stale. Older builds of the same asset are removed when a new one is cached.
 * - Audio range requests (Safari always uses them) are answered from the cached file with 206.
 *
 * Recordings are never cached: they are blob: URLs and never reach this worker.
 */
const CACHE = 'maitalki-v1';
const scope = new URL(self.registration.scope);

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    const page = await fetch(scope.href, { cache: 'no-cache' });
    if (!page.ok) return;
    await cache.put(scope.href, page.clone());
    // Precache the entry script and stylesheet so the app opens offline after the first visit.
    const html = await page.text();
    const assets = [...html.matchAll(/(?:src|href)="([^"]+\/assets\/[^"]+)"/g)].map((match) => new URL(match[1], scope).href);
    await cache.addAll([...assets, new URL('manifest.webmanifest', scope).href, new URL('icon.svg', scope).href]);
  })());
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter((name) => name.startsWith('maitalki-') && name !== CACHE).map((name) => caches.delete(name)));
    await self.clients.claim();
  })());
});

const isHashed = (url) => url.pathname.includes('/assets/') || url.pathname.includes('/audio/');

/** "index-CfHMFGhI.js" → "index-", so a new build can replace the old file. */
const assetFamily = (url) => {
  const name = url.pathname.split('/').pop() ?? '';
  return url.pathname.includes('/assets/') ? name.slice(0, name.lastIndexOf('-') + 1) : '';
};

async function cacheFirst(request) {
  const url = new URL(request.url);
  const cache = await caches.open(CACHE);
  const cached = await cache.match(url.href);
  if (cached) return cached;
  const response = await fetch(url.href);
  if (response.ok && response.status === 200) {
    await cache.put(url.href, response.clone());
    const family = assetFamily(url);
    if (family) {
      for (const key of await cache.keys()) {
        const keyUrl = new URL(key.url);
        if (keyUrl.href !== url.href && keyUrl.pathname.includes('/assets/') && assetFamily(keyUrl) === family) await cache.delete(key);
      }
    }
  }
  return response;
}

/** Answer a Range request from a full response, as media elements expect. */
async function rangeResponse(response, rangeHeader) {
  const body = await response.arrayBuffer();
  const size = body.byteLength;
  const match = /bytes=(\d*)-(\d*)/.exec(rangeHeader);
  if (!match || size === 0) return new Response(body, { status: 200, headers: response.headers });
  let start = match[1] ? Number(match[1]) : size - Number(match[2]);
  let end = match[1] && match[2] ? Number(match[2]) : size - 1;
  start = Math.max(0, start);
  end = Math.min(end, size - 1);
  if (start > end) return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${size}` } });
  return new Response(body.slice(start, end + 1), {
    status: 206,
    headers: {
      'Content-Type': response.headers.get('Content-Type') ?? 'audio/mpeg',
      'Content-Range': `bytes ${start}-${end}/${size}`,
      'Content-Length': String(end - start + 1),
      'Accept-Ranges': 'bytes',
    },
  });
}

async function networkFirstPage(request) {
  const cache = await caches.open(CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) await cache.put(scope.href, response.clone());
    return response;
  } catch {
    return (await cache.match(scope.href)) ?? Response.error();
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== scope.origin || !url.href.startsWith(scope.href)) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstPage(request));
    return;
  }
  if (isHashed(url)) {
    event.respondWith((async () => {
      const response = await cacheFirst(request);
      const range = request.headers.get('range');
      return range && response.status === 200 ? rangeResponse(response, range) : response;
    })());
    return;
  }
  // Everything else (manifest, icon): cache, refreshed in the background.
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(url.href);
    const refresh = fetch(request).then(async (response) => {
      if (response.ok && response.status === 200) await cache.put(url.href, response.clone());
      return response;
    }).catch(() => cached ?? Response.error());
    return cached ?? refresh;
  })());
});
