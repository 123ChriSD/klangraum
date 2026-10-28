SP='/tmp/claude-0/-home-claude/7a374241-3f9e-5855-bfca-0c6038d4b5bf/scratchpad/'
s=open(SP+'klangraum_v60_pub.html').read()
def rep(a,b,cnt=1):
    global s
    n=s.count(a); assert n==cnt,(n,a[:120]); s=s.replace(a,b)
A="// Verlässt man das Stück, verstummt auch die Schnitt-Schleife"
rep(A, open(SP+'v61.js').read()+"\n"+A)
i=s.rfind('</style>'); s=s[:i]+open(SP+'css61.txt').read()+s[i:]
rep('} } catch (e) { ok("BV", false, String(e)); }', '} } catch (e) { ok("BV", false, String(e)); }'+open(SP+'t61.js').read())
# Takt: eigener Zeitgeber, mitwachsender Vorlauf
rep('this.timer = setInterval(() => this.tick(), 25);','this.timer = Ticker.start(() => this.tick());')
rep('if (this.timer) clearInterval(this.timer); this.timer = null;','if (this.timer) Ticker.stop(this.timer); this.timer = null;')
rep('const horizon = Engine.now() + 0.12;','const horizon = Engine.now() + this.ahead();')
# Klang-Puffer, Notbetrieb größerer Block
rep('this.ctx = new AC({ latencyHint: "interactive" });','this.ctx = new AC({ latencyHint: Stab.hint() });')
rep('B = 2048, sp = c.createScriptProcessor(B, 1, 16);','B = Stab.mobile ? 4096 : 2048, sp = c.createScriptProcessor(B, 1, 16);')
# Klangfaden: Stimmen weich ablösen statt abschneiden (Knackser), Höchstzahl einstellbar
rep('else if (m.t === "stats") { this.late = 0; this.maxV = 0; }','else if (m.t === "stats") { this.late = 0; this.maxV = 0; }\n      else if (m.t === "vmax") { this.vmax = m.v | 0; }')
rep('if (this.voices.length >= 36) { let i = this.voices.findIndex(v => v.rel); if (i < 0) i = 0; this.voices.splice(i, 1); }',
    'let live = 0; for (const v of this.voices) if (!v.steal) live++; if (live >= (this.vmax || 36)) { const v = this.voices.find(v => v.rel && !v.steal) || this.voices.find(v => !v.steal); if (v) v.steal = true; }')
rep('if (j0 < n) v.block(out[0], out[1] || out[0], j0, n, this);',
    'if (v.steal) { if (!this.tL || this.tL.length < n) { this.tL = new Float32Array(n); this.tR = new Float32Array(n); } const L = this.tL, R = this.tR; L.fill(0); R.fill(0); if (j0 < n) v.block(L, R, j0, n, this); const oL = out[0], oR = out[1] || out[0]; for (let j = 0; j < n; j++) { const g = 1 - j / n; oL[j] += L[j] * g; if (oR !== oL) oR[j] += R[j] * g; } v.done = true; }\n      else if (j0 < n) v.block(out[0], out[1] || out[0], j0, n, this);')
import re
s=re.sub(r'<div class="meta">Version 60 · [^<]*</div>', '<div class="meta">Version 61 · Einzelklang → Instrument oder Loop · stabilerer Klang · Loopstation mit Takt-Uhr</div>', s, count=1)
rep('this.head("KLANGRAUM · Version 60")','this.head("KLANGRAUM · Version 61")')
open('/home/claude/klangraum.html','w').write(s)
H='<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>:root{box-sizing:border-box}body{margin:0;padding:0}img{max-width:100%}[hidden]:not([hidden=until-found i]){display:none!important}</style></head><body>\n'
open('/home/claude/download/klangraum_v61.html','w').write(H+s+'\n</body></html>\n'); print("ok v61")
