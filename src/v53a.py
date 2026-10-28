# v53 = v52 (veröffentlicht) + Kneten → Tonhöhe
SP='/tmp/claude-0/-home-claude/7a374241-3f9e-5855-bfca-0c6038d4b5bf/scratchpad/'
s=open(SP+'base52.html').read()
def rep(a,b,cnt=1):
    global s
    n=s.count(a); assert n==cnt,(n,a[:120]); s=s.replace(a,b)
A="// Verlässt man das Stück, verstummt auch die Schnitt-Schleife"
rep(A, open(SP+'v53.js').read()+"\n"+A)
i=s.rfind('</style>'); s=s[:i]+open(SP+'css53.txt').read()+s[i:]
# Tonhöhe aus u – mit Knet-Stufen (bleibt in der Tonleiter)
rep("""  function pitchFromU(u, base, help, mu, chordDeg) {
    u = clamp(u, 0, 1);
    const raw = base + u * 24;
    if (help < 12) return raw;
    if (help < 38) return Math.round(raw);
    if (help < 63) { const deg = Math.round(u * 14); return base + mu.so(deg); }
    const pcs = mu.chordPcs(chordDeg); let best = base, bd = 1e9;
    for (let m = base - 2; m <= base + 26; m++)""", """  function pitchFromU(u, base, help, mu, chordDeg, kd) {
    u = clamp(u, 0, 1); kd = kd | 0; const ks = kd ? mu.so(kd) : 0;   // v53: Knet-Stufen
    const raw = base + ks + u * 24;
    if (help < 12) return raw;
    if (help < 38) return Math.round(raw);
    if (help < 63) { const deg = Math.round(u * 14); return base + mu.so(deg + kd); }
    const pcs = mu.chordPcs(chordDeg); let best = base + ks, bd = 1e9;
    for (let m = base + ks - 2; m <= base + ks + 26; m++)""")
rep("""const midi = opts.midi != null ? opts.midi + (src === f || f.morph ? 0 : 12 * ((src.snd.oct || 0) - (f.layer.parts[0].snd.oct || 0))) : K.pitchFromU(u, base, help, Music.mu, deg);""",
    """const midi = opts.midi != null ? KneadPitch.tp(f, base, opts.midi + (src === f || f.morph ? 0 : 12 * ((src.snd.oct || 0) - (f.layer.parts[0].snd.oct || 0))), opts.kt) : K.pitchFromU(u, base, help, Music.mu, deg, KneadPitch.deg(f));""")
rep("fire(0.2, 0.85, { midi: tone, dur: len * spb * 0.9 });", "fire(0.2, 0.85, { midi: tone, dur: len * spb * 0.9, kt: 1 });")
rep("{ midi: K.blobMidi(b, base, Music.mu), dur: spb * 3, dir: [b.x, b.y, b.z] }", "{ midi: K.blobMidi(b, base, Music.mu), dur: spb * 3, dir: [b.x, b.y, b.z], kt: 1 }")
rep("opts.midi = this.free ? bm : this.harm(bm);", "opts.midi = this.free ? bm : this.harm(bm); opts.kt = 1;")
rep("const h = Forms.play(f, (k % 14) / 13, vel, { midi });", "const h = Forms.play(f, (k % 14) / 13, vel, { midi, kt: 1 });")
rep(".map(m => Forms.play(f, 0.5, 0.6, { midi: m }));", ".map(m => Forms.play(f, 0.5, 0.6, { midi: m, kt: 1 }));")
T = r"""
    // v53: Kneten → Tonhöhe
    try { const f = Forms.list.find(x => !x.empty && x.kind !== "drum"); if (!f) ok("KP", true, "keine Form"); else {
      const h0 = f.h.slice(), d0 = KneadPitch.deg(f), u = 0.5, b = Forms.baseMidi(Forms.sources(f)[0].src);
      const p0 = K.pitchFromU(u, b, 60, Music.mu, 0, 0);
      for (const d of [[0, 1, 0], [1, 0, 0], [0, 0, 1], [-1, 0, 0]]) K.brush(f.h, d, -0.35, 0.3); Forms.rebuild(f, true); const dUp = KneadPitch.deg(f), pUp = K.pitchFromU(u, b, 60, Music.mu, 0, dUp);
      f.h.set(h0); for (const d of [[0, 1, 0], [1, 0, 0], [0, 0, 1], [-1, 0, 0]]) K.brush(f.h, d, 0.35, 0.3); Forms.rebuild(f, true); const dDn = KneadPitch.deg(f), pDn = K.pitchFromU(u, b, 60, Music.mu, 0, dDn);
      f.h.set(h0); Forms.rebuild(f, true); const dBack = KneadPitch.deg(f);
      const inKey = [pUp, pDn].every(m => Music.mu.so && [...Array(84).keys()].some(k => b + Music.mu.so(k - 35) === m));
      ok("KP", dUp >= 4 && dDn <= -4 && pUp > p0 && pDn < p0 && dBack === d0 && inKey, `Kneten → Tonhöhe: 4× hineindrücken = ${dUp > 0 ? "+" : ""}${dUp} Stufen, 4× herausziehen = ${dDn} Stufen, zurück auf Startform = ${dBack} · Töne bleiben in der Tonart`); } } catch (e) { ok("KP", false, String(e)); }"""
rep('} } catch (e) { ok("BV", false, String(e)); }', '} } catch (e) { ok("BV", false, String(e)); }'+T)
rep('<div class="meta">Version 52 · Mikrofon aus der App: „Im eigenen Fenster öffnen“ · Gescannte Körper aus FORMRAUM SCAN</div>', '<div class="meta">Version 53 · Kneten verändert die Tonhöhe deutlich (in der Tonart)</div>')
rep('this.head("KLANGRAUM · Version 52")','this.head("KLANGRAUM · Version 53")')
open('/home/claude/klangraum.html','w').write(s); print("ok v53", len(s))
