#!/usr/bin/env python3
"""Legt die bisher veröffentlichte Website-Fassung als „vorige Version“ ab (vor dem Überschreiben von index.html aufrufen).
Aufruf (im Repo): python3 tools/mkvorige.py            → nimmt index.html aus dem letzten Commit (HEAD)
                  python3 tools/mkvorige.py v62        → nimmt index.html aus dem Git-Tag v62
Ergebnis: vorige/index.html – ohne Service Worker und Manifest, mit <base href="../"> (Instrumente unter s/ werden gefunden)
und einem kleinen Hinweis oben rechts mit Link zur aktuellen Version. Speicher (IndexedDB) ist derselbe wie in der aktuellen Version."""
import sys, re, subprocess, os
ref = sys.argv[1] if len(sys.argv) > 1 else "HEAD"
s = subprocess.run(["git", "show", f"{ref}:index.html"], capture_output=True, check=True).stdout.decode("utf-8")
ver = (re.search(r'Version (\d+)', s) or [0, "?"])[1]
s = s.replace('<head>', '<head><base href="../">', 1)
s = re.sub(r'<link rel="manifest"[^>]*>', '', s, count=1)
s = re.sub(r'<script>\s*if \("serviceWorker" in navigator[\s\S]*?</script>\s*', '', s, count=1)
note = ('<a href="./" style="position:fixed;z-index:2147483000;top:env(safe-area-inset-top,0px);left:50%;transform:translateX(-50%);'
        'background:#3a2a10;color:#ffd58a;font:600 10px/1.2 system-ui,sans-serif;padding:2px 8px;border-radius:0 0 10px 10px;text-decoration:none;opacity:.92">'
        f'Vorige Version {ver} · zur aktuellen →</a>')
s = s.replace('<body>', '<body>' + note, 1)
s = s.replace('<title>', f'<title>(Vorige {ver}) ', 1)
os.makedirs("vorige", exist_ok=True)
open("vorige/index.html", "w").write(s)
print("vorige/index.html = Version", ver, len(s))
