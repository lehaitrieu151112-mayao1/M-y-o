const CACHE='myo-game-hub-v3';
const CORE=['/','/index.html','/pc.html','/manifest.webmanifest','/assets/styles.css','/assets/games.js','/assets/app.js','/assets/pc.css','/assets/pc-storage.js','/assets/software-apps.js','/assets/pc-downloads.js','/assets/pc-apps.js','/assets/pc-browser.js','/assets/pc-explorer.js','/assets/pc.js','/assets/pwa.js','/assets/app-icon.svg'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('myo-game-hub-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',event=>{
 const req=event.request;if(req.method!=='GET')return;
 const u=new URL(req.url);if(u.origin!==self.location.origin)return;
 event.respondWith(caches.match(req).then(cached=>cached||fetch(req).then(resp=>{if(resp.ok&&resp.type==='basic'){const copy=resp.clone();caches.open(CACHE).then(c=>c.put(req,copy))}return resp}).catch(()=>caches.match('/index.html'))));
});