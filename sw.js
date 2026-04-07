const CACHE='tj-v6';
const ASSETS=['/','/index.html','/manifest.json'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});

self.addEventListener('fetch',e=>{
  const url = e.request.url;
  // Nooit cachen: Supabase API calls en externe resources
  if(url.includes('supabase.co') || url.includes('cdnjs.cloudflare.com')){
    e.respondWith(fetch(e.request));
    return;
  }
  // Alleen lokale bestanden cachen
  e.respondWith(
    caches.match(e.request).then(cached=>{
      if(cached) return cached;
      return fetch(e.request).then(res=>{
        if(res && res.status===200 && e.request.method==='GET'){
          caches.open(CACHE).then(c=>c.put(e.request,res.clone()));
        }
        return res;
      }).catch(()=>cached);
    })
  );
});
