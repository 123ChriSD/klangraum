#!/usr/bin/env python3
"""Baut index.html der Website aus dem App-Rumpf (ohne Kopf, so wie ins Artifact veröffentlicht).
Aufruf: python3 tools/mksite.py <app_rumpf.html> <ziel/index.html>"""
import sys
s = open(sys.argv[1]).read()
a = 'URL: "https://claude.ai/artifact/AcerFy2AcGdzZhqXA8sjUf",'
if a in s:
    s = s.replace(a, 'URL: (location.protocol === "https:" && !/claude\\.ai|claudeusercontent|claude\\.site/.test(location.host) ? location.origin + location.pathname : "https://claude.ai/artifact/AcerFy2AcGdzZhqXA8sjUf"),')
H = '''<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#0A1315"><meta name="description" content="KLANGRAUM – Formen, die klingen. Loopstation, Beatbox, Instrumente.">
<link rel="manifest" href="manifest.webmanifest"><link rel="icon" href="icon-192.png"><link rel="apple-touch-icon" href="icon-192.png">
<meta name="mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<style>:root{box-sizing:border-box}body{margin:0;padding:0}img{max-width:100%}[hidden]:not([hidden=until-found i]){display:none!important}</style></head><body>
'''
# Schneller Start: Service Worker hält App und Klänge auf dem Gerät (zweiter Start ohne Download, auch offline)
import re, os, time
ver = (re.search(r'Version (\d+)', s) or [0, "x"])[1] + "-" + time.strftime("%Y%m%d%H%M")
REG = """<script>
if ("serviceWorker" in navigator && location.protocol === "https:") {
  addEventListener("load", function () {
    navigator.serviceWorker.register("sw.js").then(function (reg) {
      reg.addEventListener("updatefound", function () { var w = reg.installing; if (!w) return; w.addEventListener("statechange", function () {
        if (w.state === "installed" && navigator.serviceWorker.controller) { try { var t = function () { if (typeof UI !== "undefined" && UI.toastAct && typeof App !== "undefined" && App.started) UI.toastAct("Neue KLANGRAUM-Version geladen", "Neu starten", function () { try { Save.now(); } catch (e) {} setTimeout(function () { location.reload(); }, 300); }, 9000); else setTimeout(t, 1500); }; t(); } catch (e) {} }
      }); });
    }).catch(function () {});
  });
}
</script>
"""
open(sys.argv[2], 'w').write(H + REG + s + '\n</body></html>\n')
SW = """const C = "klangraum-%s";
const CORE = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];
self.addEventListener("install", e => { self.skipWaiting(); e.waitUntil(caches.open(C).then(c => c.addAll(CORE)).catch(() => {})); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith("klangraum-") && k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
// eigene Dateien: sofort aus dem Speicher, im Hintergrund auffrischen · Bibliotheken und Instrumente aus dem Netz: einmal laden, dann behalten
self.addEventListener("fetch", e => {
  const r = e.request; if (r.method !== "GET") return; const u = new URL(r.url);
  const own = u.origin === location.origin, lib = /cdn\\.jsdelivr\\.net|unpkg\\.com|cdnjs\\.cloudflare\\.com|nbrosowsky\\.github\\.io/.test(u.host);
  if (!own && !lib) return;
  e.respondWith(caches.open(C).then(async c => {
    const hit = await c.match(r, { ignoreSearch: own });
    const net = fetch(r).then(res => { if (res && (res.ok || res.type === "opaque")) c.put(r, res.clone()).catch(() => {}); return res; }).catch(() => hit);
    if (hit) { if (own && /\\/$|index\\.html$/.test(u.pathname)) e.waitUntil(net.catch(() => {})); return hit; }
    return net;
  }));
});
""" % ver
open(os.path.join(os.path.dirname(os.path.abspath(sys.argv[2])), "sw.js"), "w").write(SW)
print("index.html", len(H + s))
