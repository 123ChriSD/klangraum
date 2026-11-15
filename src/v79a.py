SP='/tmp/claude-0/-home-claude/7a374241-3f9e-5855-bfca-0c6038d4b5bf/scratchpad/'
s=open(SP+'klangraum_v78_pub.html').read()
def rep(a,b,cnt=1):
    global s
    n=s.count(a); assert n==cnt,(n,a[:120]); s=s.replace(a,b)
A="// Verlässt man das Stück, verstummt auch die Schnitt-Schleife"
rep(A, open(SP+'v79.js').read()+"\n"+A)
rep('["stueck", "musik", "form"]', '(P78.PTS || ["stueck", "musik", "form"])', 3)
rep('"form,c:new;form,c:spin;form,c:loop;form,c:new;musik,a:mk:gen;musik,c:rec;stueck,fav;stueck,export"', '"form,c:new;form,c:spin;aufn,c:loop;form,c:new;musik,a:mk:gen;aufn,c:rec;stueck,fav;stueck,export"')
rep('ok("PK", n === 3 && P78.isLong', 'ok("PK", n === P78.PTS.length && P78.isLong')
rep('"Drei Punkte: genau drei ständige Bedienelemente · jede Tafel', '"Punkte unten: nur sie sind ständig da (Stück · Aufnahme · Musik · Form) · jede Tafel')
rep('"Drei Tafeln (Stück · Musik · Form): jede Funktion', '"Tafeln (Stück · Aufnahme · Musik · Form): jede Funktion')
# Geister-Tipp: der Tipp, der eine Tafel öffnet, darf nicht gleich einen Knopf darunter auslösen
rep('T.addEventListener("click", e => { const b = e.target.closest(".p78b"); if (b) this.run(b.dataset.t); });', 'T.addEventListener("click", e => { if (!this.armed) return; const b = e.target.closest(".p78b"); if (b) this.run(b.dataset.t); });')
rep('const P = root.querySelector("#p78P"), T = root.querySelector("#p78T");', 'const P = root.querySelector("#p78P"), T = root.querySelector("#p78T"); T.addEventListener("pointerdown", () => { this.armed = true; }); T.addEventListener("keydown", () => { this.armed = true; });   /* erst ein eigener Fingerdruck auf der Tafel schaltet ihre Knöpfe scharf */')
rep('open(p, slide) { const t = $("p78T"); if (!t) return; this.cur = p;', 'open(p, slide) { const t = $("p78T"); if (!t) return; this.armed = false; this.cur = p;')
i=s.rfind('</style>'); s=s[:i]+open(SP+'css79.txt').read()+s[i:]
rep('} } catch (e) { ok("BV", false, String(e)); }', '} } catch (e) { ok("BV", false, String(e)); }'+open(SP+'t79.js').read())
import re
s,n=re.subn(r'<div class="meta">Version 78 · [^<]*</div>', '<div class="meta">Version 79 · Aufnahme-Punkt, Klang-Bibliothek, mehrere Start-Klänge und Text wird Musik (Foto lesen, Buchstaben und Wörter werden Töne)</div>', s, count=1); assert n==1
rep('this.head("KLANGRAUM · Version 78")','this.head("KLANGRAUM · Version 79")')




open('/home/claude/klangraum.html','w').write(s)
H='<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>:root{box-sizing:border-box}body{margin:0;padding:0}img{max-width:100%}[hidden]:not([hidden=until-found i]){display:none!important}</style></head><body>\n'
open('/home/claude/download/klangraum_v79.html','w').write(H+s+'\n</body></html>\n'); print("ok v79")
