SP='/tmp/claude-0/-home-claude/7a374241-3f9e-5855-bfca-0c6038d4b5bf/scratchpad/'
s=open(SP+'klangraum_v57_pub.html').read()
def rep(a,b,cnt=1):
    global s
    n=s.count(a); assert n==cnt,(n,a[:120]); s=s.replace(a,b)
A="// Verlässt man das Stück, verstummt auch die Schnitt-Schleife"
rep(A, open(SP+'v58.js').read()+"\n"+A)
i=s.rfind('</style>'); s=s[:i]+open(SP+'css58.txt').read()+s[i:]
rep('<div class="meta">Version 57 · ','<div class="meta">Version 58 · ')
rep('this.head("KLANGRAUM · Version 57")','this.head("KLANGRAUM · Version 58")')
open('/home/claude/klangraum.html','w').write(s)
# Download: derselbe Rahmen wie im Artifact (doctype, utf-8, viewport, Grundregeln inkl. [hidden])
H='<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>:root{box-sizing:border-box}body{margin:0;padding:0}img{max-width:100%}[hidden]:not([hidden=until-found i]){display:none!important}</style></head><body>\n'
open('/home/claude/download/klangraum_v58.html','w').write(H+s+'\n</body></html>\n'); print("ok v58")
