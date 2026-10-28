# v55 = v54 (veröffentlicht) + Loopstation · feines Drehtempo · Bereich „Loop“
SP='/tmp/claude-0/-home-claude/7a374241-3f9e-5855-bfca-0c6038d4b5bf/scratchpad/'
s=open(SP+'base54.html').read()
def rep(a,b,cnt=1):
    global s
    n=s.count(a); assert n==cnt,(n,a[:120]); s=s.replace(a,b)
A="// Verlässt man das Stück, verstummt auch die Schnitt-Schleife"
rep(A, open(SP+'v55.js').read()+"\n"+A)
i=s.rfind('</style>'); s=s[:i]+open(SP+'css55.txt').read()+s[i:]
# Bereich „Loop“ (Knopf + Ansicht)
rep('<section class="view" id="vBeat" hidden aria-label="Beat"></section>', '<section class="view" id="vBeat" hidden aria-label="Beat"></section>\n<section class="view lsview" id="vLoop" hidden aria-label="Loopstation"></section>')
import re
m=re.search(r'<button id="tKlang"[^>]*>.*?</button>', s, re.S); assert m
s=s[:m.end()]+'\n    <button id="tLoop" aria-current="false"><svg viewBox="0 0 24 24"><path d="M4 12a6 6 0 0 1 6-6h8l-3-3M20 12a6 6 0 0 1-6 6H6l3 3"/></svg>Loop</button>'+s[m.end():]
# Drehungen: feines Raster (12 Schritte je Verdopplung) statt nur der fünf Stufen
rep("""        const base = a === "y" ? f.rot : 0; let L = p.lk[a];
        if (!L || L.t !== t || L.s !== s || L.tempo !== tempo) L = p.lk[a] = { t, s, tempo, phi: base + p[rk] - s * K.TAU * this.RPB[t] * bars };
        p[wk] = s * this.level(t);
        p[rk] = L.phi + s * K.TAU * this.RPB[t] * bars - base;""", """        const base = a === "y" ? f.rot : 0, q = this.fineR(w, a); let L = p.lk[a];
        if (!L || L.q !== q || L.s !== s || L.tempo !== tempo) L = p.lk[a] = { t, q, s, tempo, phi: base + p[rk] - s * K.TAU * q * bars };
        p[wk] = s * K.TAU * q / this.barSec();
        p[rk] = L.phi + s * K.TAU * q * bars - base;""")
s=s.replace('t >= 5 && !f.still', 'Move.atMax(f) && !f.still')
# Befehle ohne Form
rep('const needF = !["new", "mixer", "help", "cfg", "tStueck",', 'const needF = !["new", "mixer", "help", "cfg", "tLoop", "tStueck",')

# Prüfungen an das feine Raster anpassen
rep("lockY = Math.abs(Math.abs(p.wy) - Motion.level(Motion.tierOfW(p.wy))) < 1e-9", "lockY = Math.abs(Math.abs(p.wy) - Motion.wOfR(Motion.fineR(p.wy))) < 1e-9")
rep("rastet auf ${Motion.RPB[Motion.tierOfW(ws[ws.length - 1])]} Umdrehung(en) je Takt ein", "rastet auf ${fmt(Motion.fineR(ws[ws.length - 1]), 2)} Umdrehung(en) je Takt ein (feines Raster)")
rep("pass = Math.abs(turns - Math.round(turns)) < 1e-6 && turns >= 1 && xOnly", "pass = Math.abs(turns - Motion.fineR(7)) < 1e-6 && turns >= 1 && xOnly")
rep("↻ Rhythmus: nach einem Takt genau ${fmt(turns, 2)} Umdrehungen", "↻ Rhythmus: nach einem Takt genau ${fmt(turns, 2)} Umdrehungen (= Raster ${fmt(Motion.fineR(7), 2)})")
rep("""          Move.faster(f); const t1 = Move.tier(f); Move.faster(f); Move.faster(f); const t3 = Move.tier(f);
          Move.slower(f); const t2 = Move.tier(f); Move.toggle(f); const st = f.still; Move.toggle(f); const go = !f.still && Move.tier(f) === t2;""", """          Move.faster(f); const t1 = Move.tier(f); Move.faster(f); Move.faster(f); const t3 = Move.rpb(f);
          Move.slower(f); const t2 = Move.rpb(f); Move.toggle(f); const st = f.still; Move.toggle(f); const go = !f.still && Math.abs(Move.rpb(f) - t2) < 1e-9;""")
rep("for (let k = 0; k < 6; k++) Move.slower(f); const t0 = Move.tier(f);", "for (let k = 0; k < 9; k++) Move.slower(f); const t0 = Move.tier(f);")
rep("pass = t1 === 1 && t3 === 3 && t2 === 2 && st && go", "pass = t1 === 1 && Math.abs(t3 - 0.25 * Math.pow(2, 4 / 12)) < 1e-9 && Math.abs(t2 - 0.25 * Math.pow(2, 2 / 12)) < 1e-9 && st && go")
rep("det = `schneller 0 → ${t1} → ${t3}, langsamer → ${t2},", "det = `schneller 0 → Stufe ${t1} → ${fmt(t3, 3)} U/Takt, langsamer → ${fmt(t2, 3)} (feine Schritte ×1,12),")
T = open(SP+'t55.js').read()
rep('} } catch (e) { ok("BV", false, String(e)); }', '} } catch (e) { ok("BV", false, String(e)); }'+T)
rep('<div class="meta">Version 54 · Beatbox · Mehrere Instrumente auf einem Körper · Riffs als Loop einspielen</div>', '<div class="meta">Version 55 · Loopstation: Geräusche, Stimme und Form-Passagen direkt loopen · feineres Drehtempo</div>')
rep('this.head("KLANGRAUM · Version 54")','this.head("KLANGRAUM · Version 55")')
open('/home/claude/klangraum.html','w').write(s); print("ok v55", len(s))
