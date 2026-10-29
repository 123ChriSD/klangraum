SP='/tmp/claude-0/-home-claude/7a374241-3f9e-5855-bfca-0c6038d4b5bf/scratchpad/'
s=open(SP+'klangraum_v61_pub.html').read()
def rep(a,b,cnt=1):
    global s
    n=s.count(a); assert n==cnt,(n,a[:120]); s=s.replace(a,b)
A="// Verlässt man das Stück, verstummt auch die Schnitt-Schleife"
rep(A, open(SP+'v62.js').read()+"\n"+A)
i=s.rfind('</style>'); s=s[:i]+open(SP+'css62.txt').read()+s[i:]
rep('} } catch (e) { ok("BV", false, String(e)); }', '} } catch (e) { ok("BV", false, String(e)); }'+open(SP+'t62.js').read())
import re
rep('["loop", ICON.loop, "Loop"]', '["loop", ICON.loop, "Ton-Loop"]')
rep('nT ? "+ Loop" : "Loop", { state: st', 'nT ? "+ Ton-Loop" : "Ton-Loop", { state: st')
rep('const f = fs[0], on0 = QuickPP.on(f); QuickPP.toggle(f); const okC = QuickPP.on(f) !== on0 && !f.fd; QuickPP.toggle(f); const okD = QuickPP.on(f) === on0;',
    'const f = fs[0], k0 = { still: f.still, mute: f.mute, wy: Motion.ph(f).wy, lp: f.lpOff }, p0 = SoloStart.playing(f); QuickPP.toggle(f); const okC = SoloStart.playing(f) !== p0 && !f.fd; QuickPP.toggle(f); const okD = SoloStart.playing(f) === p0; Fade.set(f, !k0.mute, true); f.still = k0.still; Motion.ph(f).gl = null; Motion.ph(f).lk = null; Motion.ph(f).wy = k0.wy; f.lpOff = k0.lp;')
s=re.sub(r'<div class="meta">Version 61 · [^<]*</div>', '<div class="meta">Version 62 · Formen einzeln starten · Loops direkt aufnehmen und im Raum mischen · neue Oberfläche</div>', s, count=1)
rep('this.head("KLANGRAUM · Version 61")','this.head("KLANGRAUM · Version 62")')
open('/home/claude/klangraum.html','w').write(s)
H='<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>:root{box-sizing:border-box}body{margin:0;padding:0}img{max-width:100%}[hidden]:not([hidden=until-found i]){display:none!important}</style></head><body>\n'
open('/home/claude/download/klangraum_v62.html','w').write(H+s+'\n</body></html>\n'); print("ok v62")
