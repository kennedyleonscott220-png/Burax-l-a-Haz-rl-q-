const V='buraxilis-v23-4',FILES=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-maskable-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
// Şəbəkə-əvvəl: 5 saniyə ərzində cavab gəlməsə keşdən aç (yavaş internetdə gözləməsin), yeni fayl arxa planda keşə yazılır
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;
e.respondWith((async()=>{const c=await caches.open(V);
const net=fetch(r).then(res=>{if(res.ok)c.put(r,res.clone());return res});net.catch(()=>{});
try{return await Promise.race([net,new Promise((_,j)=>setTimeout(j,5000))])}
catch(_){const m=await c.match(r,{ignoreSearch:true})||await c.match('./index.html');return m||net}})())});
// build: V23.4
