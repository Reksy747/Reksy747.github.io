// Offline support for reksy747.github.io.
// bump VERSION when you deploy changes to cached files (old caches are deleted on activate).
// Pages, JS and CSS are network-first, so online visitors always get the latest CV even if you forget.
const VERSION = 'v2';

const PRECACHE = [
    '/',
    '/cv.html',
    '/portfolio.html',
    '/css/styles.css',
    '/css/terminal.css',
    '/js/scripts.js',
    '/js/terminal/core.js',
    '/js/terminal/data.js',
    '/js/terminal/ui.js',
    '/fonts/barlow-condensed-latin-500-normal.woff2',
    '/fonts/barlow-condensed-latin-600-normal.woff2',
    '/fonts/barlow-condensed-latin-700-normal.woff2',
    '/fonts/jetbrains-mono-latin-500-normal.woff2',
    '/fonts/source-sans-3-latin-400-italic.woff2',
    '/fonts/source-sans-3-latin-400-normal.woff2',
    '/fonts/source-sans-3-latin-600-normal.woff2',
    '/fonts/source-sans-3-latin-700-normal.woff2',
    '/images/profile-192.webp',
    '/images/icon-192.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(caches.open(VERSION).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(keys.filter((key) => key !== VERSION).map((key) => caches.delete(key))))
            .then(() => self.clients.claim())
    );
});

async function networkFirst(request) {
    const cache = await caches.open(VERSION);
    try {
        const response = await fetch(request);
        if (response.ok) cache.put(request, response.clone()).catch(() => {}); // full storage must not break the page
        return response;
    } catch (err) {
        const cached = await cache.match(request, { ignoreSearch: request.mode === 'navigate' });
        if (cached) return cached;
        if (request.mode === 'navigate') {
            const home = await cache.match('/');
            if (home) return home;
        }
        throw err;
    }
}

async function cacheFirst(request) {
    const cache = await caches.open(VERSION);
    const cached = await cache.match(request);
    if (cached) return cached;
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone()).catch(() => {});
    return response;
}

self.addEventListener('fetch', (event) => {
    const { request } = event;
    if (request.method !== 'GET') return;
    const url = new URL(request.url);
    if (url.origin !== self.location.origin) return; // Formspree, Google Drive, GitHub pass straight through

    const fresh = request.mode === 'navigate' || /\.(js|css|html|webmanifest)$/.test(url.pathname);
    event.respondWith(fresh ? networkFirst(request) : cacheFirst(request));
});
