SP='/tmp/claude-0/-home-claude/7a374241-3f9e-5855-bfca-0c6038d4b5bf/scratchpad/'
s=open(SP+'klangraum_v59_pub.html').read()
def rep(a,b,cnt=1):
    global s
    n=s.count(a); assert n==cnt,(n,a[:120]); s=s.replace(a,b)
A="// Verlässt man das Stück, verstummt auch die Schnitt-Schleife"
rep(A, open(SP+'v60.js').read()+"\n"+A)
i=s.rfind('</style>'); s=s[:i]+open(SP+'css60.txt').read()+s[i:]
rep('} } catch (e) { ok("BV", false, String(e)); }', '} } catch (e) { ok("BV", false, String(e)); }'+open(SP+'t60.js').read())
import re
s=s.replace('v.querySelectorAll(".lqpad").length','v.querySelectorAll(".lxrow").length').replace('big = v && v.querySelector(".lqbig")','big = v && v.querySelector(".lxbig")').replace('getBoundingClientRect().height >= 100','getBoundingClientRect().height >= 80')
s=re.sub(r'<div class="meta">Version 59 · [^<]*</div>', '<div class="meta">Version 60 · Loopstation mit Takt-Uhr und Wellenbild · Loops verschieben · jeder Loop wird eine Form</div>', s, count=1)
rep('this.head("KLANGRAUM · Version 59")','this.head("KLANGRAUM · Version 60")')
open('/home/claude/klangraum.html','w').write(s)
H='<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>:root{box-sizing:border-box}body{margin:0;padding:0}img{max-width:100%}[hidden]:not([hidden=until-found i]){display:none!important}</style></head><body>\n'
open('/home/claude/download/klangraum_v60.html','w').write(H+s+'\n</body></html>\n'); print("ok v60")
