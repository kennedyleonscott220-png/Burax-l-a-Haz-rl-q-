const V='buraxilis-v25-0',FILES=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-maskable-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
// Audio Range sorğuları (irəli-geri çəkmə): keşdə varsa 206 kimi kəsib ver, yoxdursa şəbəkədən
async function ranged(r,m){const b=await m.blob(),h=r.headers.get('range').match(/bytes=(\d+)-(\d*)/),s=+h[1],e=h[2]?Math.min(+h[2],b.size-1):b.size-1;return new Response(b.slice(s,e+1),{status:206,headers:{'Content-Type':'audio/mpeg','Content-Range':`bytes ${s}-${e}/${b.size}`,'Content-Length':e-s+1}})}
// Şəbəkə-əvvəl: 5 saniyə ərzində cavab gəlməsə keşdən aç, yeni fayl arxa planda keşə yazılır (yalnız 200 cavablar)
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;
if(r.headers.has('range')){e.respondWith((async()=>{const c=await caches.open(V),m=await c.match(r.url,{ignoreSearch:true});return m?ranged(r,m):fetch(r)})());return}
e.respondWith((async()=>{const c=await caches.open(V);
const net=fetch(r).then(res=>{if(res.status===200)c.put(r,res.clone()).catch(()=>{});return res});net.catch(()=>{});
try{return await Promise.race([net,new Promise((_,j)=>setTimeout(j,5000))])}
catch(_){const m=await c.match(r,{ignoreSearch:true})||await c.match('./index.html');return m||net}})())});
// build: V25.0
