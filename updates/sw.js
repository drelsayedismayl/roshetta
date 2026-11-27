/* Service worker: offline support + safe updates.
   لما تغيّر أي ملف ضروري ارفع رقم الإصدار هنا (VERSION) عشان الأجهزة تحدّث نفسها. */
try{self.window=self;importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js','https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js','firebase-config.js');if(self.FIREBASE_CONFIG&&self.FIREBASE_CONFIG.apiKey){firebase.initializeApp(self.FIREBASE_CONFIG);firebase.messaging()}}catch(e){}
const VERSION = 'v2026.11.27a';
const CACHE = 'pharma-' + VERSION;
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'data/content.json', 'images/dr.jpg', 'icons/icon-192.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL).catch(() => {})).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('pharma-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  const isData = url.pathname.endsWith('/data/content.json') || url.pathname.endsWith('/index.html') || url.pathname.endsWith('/');
  if (isData) {
    /* المحتوى والصفحة: الأحدث من النت أولًا، ولو مفيش نت من الكاش */
    e.respondWith(fetch(req).then(r => { const c = r.clone(); caches.open(CACHE).then(x => x.put(req, c)); return r; }).catch(() => caches.match(req)));
  } else {
    /* الصور والأيقونات: من الكاش أولًا وتتحدّث في الخلفية */
    e.respondWith(caches.match(req).then(hit => {
      const net = fetch(req).then(r => { const c = r.clone(); caches.open(CACHE).then(x => x.put(req, c)); return r; }).catch(() => hit);
      return hit || net;
    }));
  }
});
