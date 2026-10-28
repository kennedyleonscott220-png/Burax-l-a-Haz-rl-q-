/* Buraxilis PWA update flow — V26.25 */
const V='buraxilis-v26-25', VER='V26.25';
const ROOT=self.registration.scope;
const url=(p)=>new URL(p,ROOT).href;
const OPTIONAL=['manifest.webmanifest','icon-192.png','icon-512.png','icon-maskable-512.png'];

// Yeni versiya tam yüklənib yoxlanmadan aktivləşdirilmir.
self.addEventListener('install',event=>{
 event.waitUntil((async()=>{
  const cache=await caches.open(V);
  const htmlURL=url('index.html');
  const response=await fetch(new Request(htmlURL,{cache:'reload'}));
  if(!response.ok)throw new Error('index.html yüklənmədi');
  const type=response.headers.get('content-type')||'';
  if(type && !/text\/html|application\/xhtml\+xml/i.test(type))throw new Error('index.html cavabı düzgün deyil');
  const html=await response.clone().text();
  if(!html.includes("APP_VER='"+VER+"'") && !html.includes('APP_VER="'+VER+'"'))throw new Error('Versiya yoxlaması uğursuz oldu');
  await cache.put(htmlURL,new Response(html,{status:200,headers:response.headers}));
  // Digər resurslar mövcud olduqda keşə əlavə edilir; çatışmayan ikonlar quraşdırmanı pozmur.
  await Promise.all(OPTIONAL.map(async p=>{
   try{const u=url(p),r=await fetch(new Request(u,{cache:'reload'}));if(r.ok)await cache.put(u,r)}catch(_){ }
  }));
  // skipWaiting qəsdən burada çağırılmır: əvvəlki versiya istifadəçinin təsdiqinə qədər aktiv qalır.
 })());
});

self.addEventListener('message',event=>{
 if(event.data==='SKIP_WAITING')event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate',event=>{
 event.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.filter(k=>k.startsWith('buraxilis-v')&&k!==V).map(k=>caches.delete(k)));
  await self.clients.claim();
 })());
});

// İnternet varsa yenilənmiş faylı göstər; bağlantı kəsilsə son yoxlanmış keşdən istifadə et.
self.addEventListener('fetch',event=>{
 const request=event.request;
 if(request.method!=='GET')return;
 const requestURL=new URL(request.url);
 if(requestURL.origin!==location.origin || requestURL.pathname.endsWith('/version.json'))return;
 event.respondWith((async()=>{
  const cache=await caches.open(V);
  try{
   const response=await fetch(request);
   if(response.ok && response.status===200){
    const copy=response.clone();
    await cache.put(request,copy).catch(()=>{});
   }
   return response;
  }catch(error){
   const cached=await cache.match(request,{ignoreSearch:true});
   if(cached)return cached;
   if(request.mode==='navigate'){
    const shell=await cache.match(url('index.html'));
    if(shell)return shell;
   }
   throw error;
  }
 })());
});

// Android/Chrome bu funksiyanı dəstəkləyirsə, vaxtaşırı versiyanı yoxla.
self.addEventListener('periodicsync',event=>{
 if(event.tag!=='upd-check')return;
 event.waitUntil((async()=>{
  try{
   const response=await fetch(url('version.json')+'?t='+Date.now(),{cache:'no-store'});
   if(!response.ok)return;
   const data=await response.json();
   const number=value=>{const m=/(\d+)\.(\d+)/.exec(value||'');return m?Number(m[1])*1000+Number(m[2]):0};
   if(number(data.version)>number(VER)){
    await self.registration.showNotification('Yeni versiya: '+data.version,{
     body:'Yeniləməni yükləmək və yoxlamaq üçün toxun.',icon:url('icon-192.png'),badge:url('icon-192.png'),tag:'upd',data:{url:ROOT}
    });
   }
  }catch(_){ }
 })());
});

self.addEventListener('notificationclick',event=>{
 event.notification.close();
 event.waitUntil((async()=>{
  const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});
  for(const client of windows){if('focus' in client){await client.focus();if('navigate' in client)await client.navigate(ROOT);return}}
  return self.clients.openWindow(ROOT);
 })());
});
