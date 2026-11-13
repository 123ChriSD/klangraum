SP='/tmp/claude-0/-home-claude/7a374241-3f9e-5855-bfca-0c6038d4b5bf/scratchpad/'
s=open(SP+'klangraum_v66_pub.html').read()
def rep(a,b,cnt=1):
    global s
    n=s.count(a); assert n==cnt,(n,a[:120]); s=s.replace(a,b)
A="// Verlässt man das Stück, verstummt auch die Schnitt-Schleife"
rep(A, open(SP+'v67.js').read()+"\n"+A)
i=s.rfind('</style>'); s=s[:i]+open(SP+'css67.txt').read()+s[i:]
rep('} } catch (e) { ok("BV", false, String(e)); }', '} } catch (e) { ok("BV", false, String(e)); }'+open(SP+'t67.js').read())
# Startbild: kurz sagen, was man hier machen kann
rep('<p>Formen, die klingen – wie echte Instrumente oder als Synthesizer. Tippe sie an, um zu spielen. Schalte <b>Kneten</b> ein, und du formst sie: rund klingt weich, spitz klingt hell. Setz sie in Bewegung, male sie an, leg deine eigenen Aufnahmen darauf. Wische zur Seite für die nächste Form, mit zwei und drei Fingern regelst du Lautstärke, Tempo, Höhen und Tiefen.</p>',
    '<p>Musik machen ohne Vorkenntnisse: Wähle einen Stil, und KLANGRAUM baut dir einen ganzen Song. Oder spiel, forme und mische deine Klänge selbst – nichts klingt falsch.</p><ul class="stfeat"><li>Song in 1 Minute</li><li>Melodien auf bunten Tasten</li><li>Klänge kneten</li><li>Mischen wie im Studio</li></ul>')
import re
s,n=re.subn(r'<div class="meta">Version 66 · [^<]*</div>', '<div class="meta">Version 67 · Studio: Song in 1 Minute · Song-Ansicht · Mischen · Erklär-Modus</div>', s, count=1); assert n==1
rep('this.head("KLANGRAUM · Version 66")','this.head("KLANGRAUM · Version 67")')
open('/home/claude/klangraum.html','w').write(s)
H='<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>:root{box-sizing:border-box}body{margin:0;padding:0}img{max-width:100%}[hidden]:not([hidden=until-found i]){display:none!important}</style></head><body>\n'
open('/home/claude/download/klangraum_v67.html','w').write(H+s+'\n</body></html>\n'); print("ok v67")
