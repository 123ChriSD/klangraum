const C = "klangraum-62-202610292039";
const CORE = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];
self.addEventListener("install", e => { self.skipWaiting(); e.waitUntil(caches.open(C).then(c => c.addAll(CORE)).catch(() => {})); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith("klangraum-") && k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
// eigene Dateien: sofort aus dem Speicher, im Hintergrund auffrischen · Bibliotheken und Instrumente aus dem Netz: einmal laden, dann behalten
self.addEventListener("fetch", e => {
  const r = e.request; if (r.method !== "GET") return; const u = new URL(r.url);
  const own = u.origin === location.origin, lib = /cdn\.jsdelivr\.net|unpkg\.com|cdnjs\.cloudflare\.com|nbrosowsky\.github\.io/.test(u.host);
  if (!own && !lib) return;
  e.respondWith(caches.open(C).then(async c => {
    const hit = await c.match(r, { ignoreSearch: own });
    const net = fetch(r).then(res => { if (res && (res.ok || res.type === "opaque")) c.put(r, res.clone()).catch(() => {}); return res; }).catch(() => hit);
    if (hit) { if (own && /\/$|index\.html$/.test(u.pathname)) e.waitUntil(net.catch(() => {})); return hit; }
    return net;
  }));
});
