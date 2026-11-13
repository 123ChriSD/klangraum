SP='/tmp/claude-0/-home-claude/7a374241-3f9e-5855-bfca-0c6038d4b5bf/scratchpad/'
s=open(SP+'klangraum_v67_pub.html').read()
def rep(a,b,cnt=1):
    global s
    n=s.count(a); assert n==cnt,(n,a[:120]); s=s.replace(a,b)
A="// Verlässt man das Stück, verstummt auch die Schnitt-Schleife"
rep(A, open(SP+'v68.js').read()+"\n"+A)
i=s.rfind('</style>'); s=s[:i]+open(SP+'css68.txt').read()+s[i:]
rep('} } catch (e) { ok("BV", false, String(e)); }', '} } catch (e) { ok("BV", false, String(e)); }'+open(SP+'t68.js').read())
rep('<ul class="stfeat"><li>Song in 1 Minute</li><li>Melodien auf bunten Tasten</li><li>Klänge kneten</li><li>Mischen wie im Studio</li></ul>', '<ul class="stfeat"><li>Song in 1 Minute</li><li>Einspielen ohne Aufnahmeknopf</li><li>Klänge kneten</li><li>Mischen wie im Studio</li></ul>')
import re
s,n=re.subn(r'<div class="meta">Version 67 · [^<]*</div>', '<div class="meta">Version 68 · Einspielen ohne Aufnahmeknopf · Spuren-Mix im Song · einfacher Bereich Spielen</div>', s, count=1); assert n==1
rep('this.head("KLANGRAUM · Version 67")','this.head("KLANGRAUM · Version 68")')
open('/home/claude/klangraum.html','w').write(s)
H='<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>:root{box-sizing:border-box}body{margin:0;padding:0}img{max-width:100%}[hidden]:not([hidden=until-found i]){display:none!important}</style></head><body>\n'
open('/home/claude/download/klangraum_v68.html','w').write(H+s+'\n</body></html>\n'); print("ok v68")
