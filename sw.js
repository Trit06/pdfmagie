/* PDF Magie : fonctionnement hors connexion.
   Page : réseau d'abord (pour recevoir les mises à jour), sinon la copie en cache.
   Images, icônes et polices : cache d'abord. */
const CACHE = 'pdfmagie-v1';
const SOCLE = ['./', 'index.html', 'manifest.json', 'icons/icone-192.png', 'icons/icone-512.png', 'icons/icone-180.png',
  'assets/texture-papier.jpg', 'assets/laurier-monde-or.png', 'assets/laurier-france-or.png',
  'assets/laurier-monde-brun.png', 'assets/laurier-france-brun.png', 'assets/illusion-scene.jpg', 'assets/illusion-beige.jpg',
  'assets/polaroid-illusion-scene.jpg', 'assets/polaroid-ballons.jpg', 'assets/polaroid-bulles.jpg', 'assets/polaroid-decouverte.jpg'];

self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(SOCLE)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(cles => Promise.all(cles.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const memoriser = rep => { if (rep.ok || rep.type === 'opaque') { const copie = rep.clone(); caches.open(CACHE).then(c => c.put(req, copie)); } return rep; };
  if (req.mode === 'navigate'){
    e.respondWith(fetch(req).then(memoriser).catch(() => caches.match(req).then(r => r || caches.match('index.html'))));
    return;
  }
  /* bibliothèque de pictos (jsdelivr) gardée aussi pour un usage hors connexion */
  if (url.origin === location.origin || /fonts\.(googleapis|gstatic)\.com$|cdn\.jsdelivr\.net$/.test(url.hostname))
    e.respondWith(caches.match(req).then(r => r || fetch(req).then(memoriser)));
});
