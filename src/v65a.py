SP='/tmp/claude-0/-home-claude/7a374241-3f9e-5855-bfca-0c6038d4b5bf/scratchpad/'
s=open(SP+'klangraum_v64_pub.html').read()
def rep(a,b,cnt=1):
    global s
    n=s.count(a); assert n==cnt,(n,a[:120]); s=s.replace(a,b)
A="// Verlässt man das Stück, verstummt auch die Schnitt-Schleife"
rep(A, open(SP+'v65.js').read()+"\n"+A)
i=s.rfind('</style>'); s=s[:i]+open(SP+'css65.txt').read()+s[i:]
rep('} } catch (e) { ok("BV", false, String(e)); }', '} } catch (e) { ok("BV", false, String(e)); }'+open(SP+'t65.js').read())
# Fehlerbehebungen an Ort und Stelle
rep('if (Recs.player && Recs.player.r && /^pv_/.test(Recs.player.r.id)) Recs.stop(); } catch (_) {} return hs(); }; }', 'if (Recs.player && Recs.player.r && /^pv_/.test(Recs.player.r.id)) Recs.stop(); } catch (_) {} return hs(...arguments); }; }')
rep('Stueck.editLoop = f => { el(f); Nav.sync(); };', 'Stueck.editLoop = (f, tid) => { el(f, tid); Nav.sync(); };')
rep('if (Tools.knead && Forms.active && KneadPitch.str() > 0) { if (!b || b.hidden) KneadPitch.show(Forms.active); }', 'if (KneadPitch.tick) KneadPitch.tick(b);')
rep('bars: clamp(t.bars | 0 || 2, 1, 8)', 'bars: clamp(t.bars | 0 || 2, 1, 16)')
rep('bars: clamp(bars | 0 || 2, 1, 8)', 'bars: clamp(bars | 0 || 2, 1, 16)')
rep('this.v.bar = (this.v.bar || []).filter(id => Cmd.L[id]).slice(0, 6)', 'this.v.bar = (this.v.bar || []).filter(id => Cmd.L[id]).slice(0, 7)')
import re
s,n=re.subn(r'<div class="meta">Version 64 · [^<]*</div>', '<div class="meta">Version 65 · Melodien und Lieder auf Tasten · Rückblick schneiden · Kneten färbt jeden Klang</div>', s, count=1); assert n==1
rep('this.head("KLANGRAUM · Version 64")','this.head("KLANGRAUM · Version 65")')
open('/home/claude/klangraum.html','w').write(s)
H='<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>:root{box-sizing:border-box}body{margin:0;padding:0}img{max-width:100%}[hidden]:not([hidden=until-found i]){display:none!important}</style></head><body>\n'
open('/home/claude/download/klangraum_v65.html','w').write(H+s+'\n</body></html>\n'); print("ok v65")
