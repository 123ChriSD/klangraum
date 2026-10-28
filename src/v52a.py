# v52 = veröffentlichte Fassung (inkl. v51 FORMRAUM-SCAN aus anderer Sitzung) + Mikrofon im eigenen Fenster
import re
SP='/tmp/claude-0/-home-claude/7a374241-3f9e-5855-bfca-0c6038d4b5bf/scratchpad/'
LIVE='/root/.claude/projects/-home-claude/7a374241-3f9e-5855-bfca-0c6038d4b5bf/tool-results/artifact-4ddc9af7-1792834226-db91.html'
s=open(LIVE).read()
# Artifact-Hülle entfernen (mkwww.sh setzt sie für Tests wieder drumherum)
b=s.find('<body>'); e=s.rfind('</body></html>'); assert s.startswith('<!doctype html><html><head>') and b>0 and e>0
s=s[b+6:e]
def rep(a,bb,cnt=1):
    global s
    n=s.count(a); assert n==cnt,(n,a[:120]); s=s.replace(a,bb)
A="// Verlässt man das Stück, verstummt auch die Schnitt-Schleife"
rep(A, open(SP+'v52.js').read()+"\n"+A)
i=s.rfind('</style>'); s=s[:i]+open(SP+'css52.txt').read()+s[i:]
rep("""        await DB.put("projects", np); n++; if (!first) first = np;
        const idm = new Map((recs || []).map(r => [r.id, uid("r")]));""", """        const idm = new Map((recs || []).map(r => [r.id, uid("r")]));
        try { if (np.data) { np.data = JSON.parse(JSON.stringify(np.data)); MicWin.remap(np.data, idm); } } catch (_) {}   // v52: Gesang/Schnitt zeigen auf die neuen Aufnahmen
        await DB.put("projects", np); n++; if (!first) first = np;""")
T = r"""
    // v52: eigenes Fenster
    try { const pkg = { app: "KLANGRAUM", kind: "sicherung", projects: [{ name: "x", data: { forms: [] } }] }, u = MicWin.build(pkg), idm = new Map([["rA", "rB"]]), D = { sing: { tracks: [{ rec: "rA" }] }, schnitt: { tracks: [{ clips: [{ rec: "rA" }] }] } }; MicWin.remap(D, idm);
      ok("MW", /^blob:/.test(u) && D.sing.tracks[0].rec === "rB" && D.schnitt.tracks[0].clips[0].rec === "rB", `Mikrofon im eigenen Fenster: Seite mit Stück gebaut (${Math.round(SRC_HTML.length / 1e6)} MB) · Aufnahme-Verweise beim Laden angepasst`); URL.revokeObjectURL(u); MicWin.url = null; } catch (e) { ok("MW", false, String(e)); }"""
rep('} } catch (e) { ok("BV", false, String(e)); }', '} } catch (e) { ok("BV", false, String(e)); }'+T)
m=re.search(r'<div class="meta">Version 51 · ([^<]*)</div>', s); assert m
rep(m.group(0), '<div class="meta">Version 52 · Mikrofon aus der App: „Im eigenen Fenster öffnen“ · Gescannte Körper aus FORMRAUM SCAN</div>')
rep('this.head("KLANGRAUM · Version 50")','this.head("KLANGRAUM · Version 52")')
open('/home/claude/klangraum.html','w').write(s); print("ok v52", len(s))
