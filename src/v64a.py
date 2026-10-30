SP='/tmp/claude-0/-home-claude/7a374241-3f9e-5855-bfca-0c6038d4b5bf/scratchpad/'
s=open(SP+'klangraum_v63_pub.html').read()
def rep(a,b,cnt=1):
    global s
    n=s.count(a); assert n==cnt,(n,a[:120]); s=s.replace(a,b)
A="// Verlässt man das Stück, verstummt auch die Schnitt-Schleife"
rep(A, open(SP+'v64.js').read()+"\n"+A)
i=s.rfind('</style>'); s=s[:i]+open(SP+'css64.txt').read()+s[i:]
rep('} } catch (e) { ok("BV", false, String(e)); }', '} } catch (e) { ok("BV", false, String(e)); }'+open(SP+'t64.js').read())
rep('fx === 3 && ls', 'fx === 4 && ls')
rep('/data-fx="lsrec"/.test(h || "")', '/data-fx="mic"/.test(h || "") && Cmd.L.loop.n() !== "Ton-Loop"')
import re
s=re.sub(r'<div class="meta">Version 63 · [^<]*</div>', '<div class="meta">Version 64 · Pult mit Szenen und Drop · ein Loop · harte Bassbeats</div>', s, count=1)
rep('this.head("KLANGRAUM · Version 63")','this.head("KLANGRAUM · Version 64")')
open('/home/claude/klangraum.html','w').write(s)
H='<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>:root{box-sizing:border-box}body{margin:0;padding:0}img{max-width:100%}[hidden]:not([hidden=until-found i]){display:none!important}</style></head><body>\n'
open('/home/claude/download/klangraum_v64.html','w').write(H+s+'\n</body></html>\n'); print("ok v64")
