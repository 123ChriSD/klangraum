# v57 = v56 (veröffentlicht) + früher Startwächter + Download-Datei mit richtigem Kopf (doctype, utf-8)
SP='/tmp/claude-0/-home-claude/7a374241-3f9e-5855-bfca-0c6038d4b5bf/scratchpad/'
s=open(SP+'klangraum_v56_pub.html').read()
def rep(a,b,cnt=1):
    global s
    n=s.count(a); assert n==cnt,(n,a[:120]); s=s.replace(a,b)
rep('<script src="https://cdn.jsdelivr.net/npm/three@0.149.0/build/three.min.js">', open(SP+'guard57.html').read()+'<script src="https://cdn.jsdelivr.net/npm/three@0.149.0/build/three.min.js">')
rep('<div class="meta">Version 56 · Start abgesichert · Loopstation: Geräusche, Stimme und Form-Passagen direkt loopen</div>','<div class="meta">Version 57 · Start abgesichert · Loopstation: Geräusche, Stimme und Form-Passagen direkt loopen</div>')
rep('this.head("KLANGRAUM · Version 56")','this.head("KLANGRAUM · Version 57")')
open('/home/claude/klangraum.html','w').write(s)
# Download-Datei: vollständiges Dokument (sonst Quirks-Modus und falsche Zeichenkodierung im Browser)
D='<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>\n'+s+'\n</body></html>\n'
open('/home/claude/download/klangraum_v57.html','w').write(D); print("ok v57", len(s), len(D))
