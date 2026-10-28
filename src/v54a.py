# v54 = v53 (veröffentlicht) + Beatbox · Zonen · Audiospuren/Riffs · robuste Aufnahme
SP='/tmp/claude-0/-home-claude/7a374241-3f9e-5855-bfca-0c6038d4b5bf/scratchpad/'
s=open(SP+'base53.html').read()
def rep(a,b,cnt=1):
    global s
    n=s.count(a); assert n==cnt,(n,a[:120]); s=s.replace(a,b)
A="// Verlässt man das Stück, verstummt auch die Schnitt-Schleife"
rep(A, open(SP+'v54.js').read()+"\n"+A)
i=s.rfind('</style>'); s=s[:i]+open(SP+'css54.txt').read()+s[i:]
# Gesangsspuren: Kernfunktionen an die neue Fassung weiterreichen (Hüllen aus v51/v52 bleiben)
rep("""  async startRec() {
    if (this.rec || !Engine.ctx) return; const why = MicFix.reason(null);""", """  async startRec() { return this.startRec2(); },
  async startRecV50() {
    if (this.rec || !Engine.ctx) return; const why = MicFix.reason(null);""")
rep("""  async stopRec(cancel) {
    const R = this.rec; if (!R) return;""", """  async stopRec(cancel) { return this.stopRec2(cancel); },
  async stopRecV50(cancel) {
    const R = this.rec; if (!R) return;""")
rep("""  render() {
    const el = $("singS"); if (!el) return;""", """  render() { return this.render2(); },
  renderV50() {
    const el = $("singS"); if (!el) return;""")
# Zonen mitspeichern
rep("d.layer = { parts: f.layer.parts.map(p => part(p, false)), bal: f.layer.bal ?? 0.5 };", "d.layer = { parts: f.layer.parts.map(p => part(p, false)), bal: f.layer.bal ?? 0.5, zones: f.layer.zones || 0 };")
rep("d.layer = { parts: f.layer.parts.map(p => part(p, true)), bal: f.layer.bal ?? 0.5 };", "d.layer = { parts: f.layer.parts.map(p => part(p, true)), bal: f.layer.bal ?? 0.5, zones: f.layer.zones || 0 };")
rep("o.layer = { bal: fd.layer.bal ?? 0.5, parts:", "o.layer = { zones: fd.layer.zones || 0, bal: fd.layer.bal ?? 0.5, parts:")
# Zonen: aufgenommene Töne nicht um Oktaven der ersten Zone verschieben
rep("opts.midi + (src === f || f.morph ? 0 :", "opts.midi + (src === f || f.morph || f.layer.zones ? 0 :")
T = r"""
    // v54: Beatbox, Zonen, Riffs
    try { const sr = 48000, B = BBX.build(sr), keys = Object.keys(B), bad = keys.filter(k => { const d = B[k]; let pk = 0, nan = false; for (const v of d) { if (!isFinite(v)) nan = true; pk = Math.max(pk, Math.abs(v)); } return nan || pk < 0.2 || pk > 1 || d.length < sr * 0.05; });
      const seeds = ["kit_bbx", "kit_bbx_hart", "kit_bbx_bass", "kit_bbx_mund"].every(id => K.seedById(id).id === id && K.seedById(id).kind === "drum");
      ok("BB", keys.length === 16 && !bad.length && seeds, `Beatbox: ${keys.length} Mundklänge in 4 Kits (B, Kehlbass, Summ-Bass, Pop · Pf, eingezogenes K, K, Psh · ts, tk, Klick, tch · tsss, Lippenroller, Klickrolle, Klock)${bad.length ? " – auffällig: " + bad : ""}`); } catch (e) { ok("BB", false, String(e)); }
    try { const f0 = Forms.list.find(x => !x.empty && !x.layer); if (!f0) ok("ZN", true, "keine Form"); else {
      const n0 = Forms.list.length, nf = Zones.apply(f0, ["kit_bbx", "fingerbass", "klavier"], true), ks = [0.1, 0.5, 0.9].map(u => { const h = Forms.play(nf, u, 0.5, { dur: 0.05 }); const r = h && [h.zk, h.zone, h.midi]; Forms.release(h); return r; });
      const d = Project.formData ? null : null, data = Project.data(true), saved = data.forms.find(x => x.id === nf.id);
      ok("ZN", ks[0][0] === 0 && ks[0][1] && ks[1][0] === 1 && ks[1][2] != null && ks[2][0] === 2 && ks[2][2] > ks[1][2] - 30 && saved && saved.layer && saved.layer.zones === 3, `Mehrere Instrumente: unten ${ks[0][1]} (Beatbox), Mitte Ton ${ks[1][2]} (Bass), oben Ton ${ks[2][2]} (Klavier) · gespeichert mit ${saved && saved.layer ? saved.layer.zones : "?"} Zonen`);
      Forms.remove(nf); } } catch (e) { ok("ZN", false, String(e)); }
    try { const keep = Sing.tracks; Sing.tracks = [{ id: "g1", rec: "rX", name: "R", at: 16, off: 0, vol: 1, mute: false, loop: 2, bpm: 120 }]; const hits = []; const pl = Sing.playLoop; Sing.bufs.set("rX", { duration: 4 }); Sing.playLoop = (t, b, time) => hits.push(time); for (let st = 0; st < 120; st++) Sing.onStep(st, st); Sing.playLoop = pl; Sing.bufs.delete("rX"); Sing.tracks = keep;
      ok("RF", hits.join() === "16,48,80,112" && typeof Sing.startRec2 === "function", `Riff-Loop: 2 Takte ab Takt 2 spielt bei Schritt ${hits.join(", ")} (alle 32 Schritte) · Aufnahme mit Umweg und Protokoll`); } catch (e) { ok("RF", false, String(e)); }"""
rep('} } catch (e) { ok("BV", false, String(e)); }', '} } catch (e) { ok("BV", false, String(e)); }'+T)
rep('<div class="meta">Version 53 · Kneten verändert die Tonhöhe deutlich (in der Tonart)</div>', '<div class="meta">Version 54 · Beatbox · Mehrere Instrumente auf einem Körper · Riffs als Loop einspielen</div>')
rep('this.head("KLANGRAUM · Version 53")','this.head("KLANGRAUM · Version 54")')
open('/home/claude/klangraum.html','w').write(s); print("ok v54", len(s))
s=open('/home/claude/klangraum.html').read()
rep('Sheets.head("🎙 Gesangsspuren")', 'Sheets.head("🎙 Audiospuren · Gesang & Riffs")')
rep('🎙 Gesangsspuren${Sing.tracks.length', '🎙 Audiospuren · Gesang & Riffs${Sing.tracks.length')
open('/home/claude/klangraum.html','w').write(s); print("ok names")
