SP='/tmp/claude-0/-home-claude/7a374241-3f9e-5855-bfca-0c6038d4b5bf/scratchpad/'
s=open(SP+'klangraum_v62_pub.html').read()
def rep(a,b,cnt=1):
    global s
    n=s.count(a); assert n==cnt,(n,a[:120]); s=s.replace(a,b)
A="// Verlässt man das Stück, verstummt auch die Schnitt-Schleife"
rep(A, open(SP+'v63.js').read()+"\n"+A)
i=s.rfind('</style>'); s=s[:i]+open(SP+'css63.txt').read()+s[i:]
rep('} } catch (e) { ok("BV", false, String(e)); }', '} } catch (e) { ok("BV", false, String(e)); }'+open(SP+'t63.js').read())
# ältere Prüfungen: ▶/⏸ sofort (nicht auf der Eins)
rep('QuickPP.toggle(L[0]); const st = L.map(f => SoloStart.playing(f)),','QuickPP._now = true; QuickPP.toggle(L[0]); const st = L.map(f => SoloStart.playing(f)),')
rep('finally { UI.toast = tp; Project.load(keep, true); if (!run && Transport.running) Transport.stop(); if (run && !Transport.running) Transport.start(); } } } } catch (e) { ok("ES"','finally { QuickPP._now = false; UI.toast = tp; Project.load(keep, true); if (!run && Transport.running) Transport.stop(); if (run && !Transport.running) Transport.start(); } } } } catch (e) { ok("ES"')
rep('p0 = SoloStart.playing(f); QuickPP.toggle(f);','p0 = SoloStart.playing(f); QuickPP._now = true; QuickPP.toggle(f);')
rep('const okD = SoloStart.playing(f) === p0;','const okD = SoloStart.playing(f) === p0; QuickPP._now = false;')
rep('keys.length === 16 && !bad.length && seeds', 'keys.filter(k => k.startsWith("kit_bbx")).length === 16 && !bad.length && seeds')
import re
s=re.sub(r'<div class="meta">Version 62 · [^<]*</div>', '<div class="meta">Version 63 · Pult: live einsetzen und stoppen auf der Eins · Filter, Echo, Break · harte Bassbeats</div>', s, count=1)
rep('this.head("KLANGRAUM · Version 62")','this.head("KLANGRAUM · Version 63")')
open('/home/claude/klangraum.html','w').write(s)
H='<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>:root{box-sizing:border-box}body{margin:0;padding:0}img{max-width:100%}[hidden]:not([hidden=until-found i]){display:none!important}</style></head><body>\n'
open('/home/claude/download/klangraum_v63.html','w').write(H+s+'\n</body></html>\n'); print("ok v63")
