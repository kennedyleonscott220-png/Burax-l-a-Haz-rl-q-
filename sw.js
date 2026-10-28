const V='buraxilis-v26-24',VER='V26.24';
const FILES=['./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-maskable-512.png'];
// Quraşdırma: hər faylı ayrıca yüklə; çatışmayan fayl (məs. ikon) quraşdırmanı pozmasın
self.addEventListener('install',e=>{e.waitUntil((async()=>{const c=await caches.open(V);
 await Promise.all(FILES.map(u=>fetch(new Request(u,{cache:'reload'})).then(r=>{if(r.ok)return c.put(u,r)}).catch(()=>{})));
 await self.skipWaiting()})())});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('message',e=>{if(e.data==='SKIP_WAITING')self.skipWaiting()});
// İnternet var: şəbəkədən (4 san.), yoxdur/yavaşdır: yaddaşdan. Yeni fayl arxa planda keşə yazılır
self.addEventListener('fetch',e=>{const r=e.request,u=new URL(r.url);
 if(r.method!=='GET'||u.origin!==location.origin||u.pathname.endsWith('/version.json'))return;
 e.respondWith((async()=>{const c=await caches.open(V);
  const net=fetch(r).then(res=>{if(res.ok&&res.status===200){try{c.put(r,res.clone())}catch(_){}}return res});
  net.catch(()=>{});
  try{return await Promise.race([net,new Promise((_,j)=>setTimeout(j,4000))])}
  catch(_){const m=await c.match(r,{ignoreSearch:true})||(r.mode==='navigate'?await c.match('./index.html'):null);return m||net}})())});
// Arxa planda (Chrome, quraşdırılmış tətbiq) versiyanı yoxla və bildiriş göstər
self.addEventListener('periodicsync',e=>{if(e.tag!=='upd-check')return;e.waitUntil((async()=>{try{
 const r=await fetch('version.json?t='+Date.now(),{cache:'no-store'}),j=await r.json();
 const n=x=>{const m=/(\d+)\.(\d+)/.exec(x||'');return m?(+m[1])*1000+(+m[2]):0};
 if(n(j.version)>n(VER))await self.registration.showNotification('Yeni versiya: '+j.version,{body:'Yeniləmək üçün toxun.',icon:'icon-192.png',badge:'icon-192.png',tag:'upd',data:{url:'./'}})}catch(_){}})())});
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil((async()=>{
 const cl=await clients.matchAll({type:'window',includeUncontrolled:true});
 for(const c of cl){if('focus' in c)return c.focus()}
 return clients.openWindow('./')})())});
// build: V26.3
