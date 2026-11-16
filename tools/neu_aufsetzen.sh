#!/bin/sh
# Setzt den Arbeitsordner der Sitzung neu auf, wenn er leer ist. Aufruf im Repository: sh tools/neu_aufsetzen.sh <Arbeitsordner>
# Danach liegt dort: klangraum_vNN_pub.html (App-Rumpf der veröffentlichten Fassung), Werkzeuge, Proben pNN*.txt, three.js r149.
set -e
SP="$1"; [ -n "$SP" ] || { echo "Arbeitsordner angeben"; exit 1; }
mkdir -p "$SP/www" "$SP/tj/build" /home/claude/download /home/claude/proj
python3 - "$SP" <<'PY'
import re, sys
SP = sys.argv[1] + "/"; s = open("index.html").read()
i = s.index("</script>\n", s.index('navigator.serviceWorker.register("sw.js")')) + len("</script>\n")
body = s[i:]; assert body.endswith("\n</body></html>\n"); body = body[:-len("\n</body></html>\n")]
b = 'URL: (location.protocol === "https:" && !/claude\\.ai|claudeusercontent|claude\\.site/.test(location.host) ? location.origin + location.pathname : "https://claude.ai/artifact/AcerFy2AcGdzZhqXA8sjUf"),'
assert body.count(b) == 1; body = body.replace(b, 'URL: "https://claude.ai/artifact/AcerFy2AcGdzZhqXA8sjUf",')
v = re.search(r'<div class="meta">Version (\d+)', body).group(1)
open(SP + "klangraum_v%s_pub.html" % v, "w").write(body); print("App-Rumpf Version", v, len(body))
PY
cp tools/xp.py tools/prf65.py tools/pprf.txt tools/srv.sh tools/mkwww.sh tools/audit.py tools/audit.js tools/build*.sh "$SP/"
for f in tools/t7*_*.txt tools/t8*_*.txt; do [ -f "$f" ] || continue; b=$(basename "$f" .txt); cp "$f" "$SP/$(echo "$b" | sed 's/^t\([0-9]*\)_\(.*\)$/p\1\2/').txt"; done
N=$(ls src | grep -o '^v[0-9]*\.js' | sort -V | tail -1 | grep -o '[0-9]*'); cp src/v$N.js src/css$N.txt src/t$N.js src/v${N}a.py "$SP/"
if [ ! -f "$SP/tj/build/three.min.js" ]; then (cd "$SP" && rm -rf tjgit && git clone -q --depth 1 --branch r149 --filter=blob:none --sparse https://github.com/mrdoob/three.js tjgit && cd tjgit && git sparse-checkout set --no-cone /build/three.min.js && cp build/three.min.js ../tj/build/); fi
echo "Pfade oben in srv.sh, xp.py, audit.py, mkwww.sh, build*.sh und vNNa.py prüfen (Arbeitsordner der Sitzung)."
