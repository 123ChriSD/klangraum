/* =====================================================================================
   v75: AUSKLANG – ein Knopf im Bereich Spielen macht aus dem laufenden Stück ein Outro
   Die Stimmen gehen der Reihe nach leiser (erst Melodien, dann Begleitung, dann Schlagzeug, zuletzt Bass und Akkorde),
   der Klang wird weicher, am Ende steht ein Schlusston auf dem Grundton mit Nachhall. Danach ist das Stück unverändert –
   Lautstärken, Loops und Drehungen sind wie vorher. Nochmal tippen bricht ab.
   ===================================================================================== */
I67.aus = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6v12M8.500 8v8M13 10v4M17.500 11.300v1.400"/><path d="M3 20.500 21 15"/></svg>';
const Outro75 = {
  on: false, fin: false, s0: 0, bars: 4, P: [], u: 0, back: null,
  // Fenster je Rolle (Anteil der Outro-Länge): von … bis ist die Stimme ausgeblendet
  WIN: { hook: [0, 0.5], mel: [0, 0.5], arp: [0.15, 0.65], x: [0.2, 0.7], beat: [0.45, 0.92], akk: [0.55, 1], bass: [0.6, 1] },
  role(f) { try { return SongGen.roleOf(f) || MixUI.role(f) || "x"; } catch (_) { return "x"; } },
  forms() { return Forms.list.filter(f => f && !f.empty && !f.remote); },
  // rund zwölf Sekunden, in ganzen Takten (2 bis 8, gerade)
  barsFor(tempo) { return clamp(Math.round(12 / (240 / tempo) / 2) * 2, 2, 8); },
  plan(F) { const P = F.map(f => { const r = this.role(f), w = this.WIN[r] || this.WIN.x; return { f, role: r, a: w[0], b: w[1], g0: f.songG == null ? 1 : f.songG }; });
    // gibt es nur Melodie-Stimmen (kein Bass, keine Akkorde), trägt die letzte bis zum Schluss
    if (P.length && !P.some(e => e.b >= 1)) { const e = P[P.length - 1]; e.a = 0.55; e.b = 1; } return P; },
  gain(e, u) { if (u <= e.a) return e.g0; if (u >= e.b) return 0; const x = (u - e.a) / (e.b - e.a); return e.g0 * (0.5 + 0.5 * Math.cos(Math.PI * x)); },
  // Stimmen für den Schlusston: Bass und eine Akkord-/Melodie-Stimme, sonst das Schlagzeug
  enders(P) { const bass = P.find(e => e.role === "bass" && e.f.kind !== "drum"), mel = P.find(e => e.role === "akk" && e.f.kind !== "drum") || P.filter(e => e.f.kind !== "drum" && e !== bass).pop(), dr = P.find(e => e.f.kind === "drum"); const out = []; if (bass) out.push(bass); if (mel) out.push(mel); if (!out.length && dr) out.push(dr); return out; },
  start() {
    if (this.on) return this.done(true);
    if (!Engine.ctx || !Transport.running || !this.forms().length) { UI.toast("Der Ausklang braucht laufende Musik – starte erst dein Stück.", 2600); return; }
    try { if (Song.rec) { UI.toast("Dein Song wird gerade aufgenommen – er hat sein eigenes Ende.", 2600); return; } } catch (_) {}
    const song = !!Song.playing; this.back = { song, sec: song ? Math.max(0, Song.cur | 0) : -1, lp: LoopCtl.paused, still: new Map(this.forms().map(f => [f, !!f.still])) };
    this.P = this.plan(this.forms()); if (song) { try { Song.stop(true); } catch (_) {} }            // der Takt läuft weiter; die Stimmen behalten ihre Lautstärke aus dem Abschnitt
    for (const e of this.P) if (e.f.songG == null) e.f.songG = e.g0;
    this.bars = this.barsFor(Music.tempo()); this.s0 = (Math.floor(Transport.step / 16) + 1) * 16; this.on = true; this.fin = false; this.u = 0; try { Wucht.wire(); } catch (_) {}
    Hap(12); UI.toast(`Ausklang: ${this.bars} Takte – erst gehen die Melodien, dann die Begleitung, zuletzt Bass und Akkorde. Nochmal tippen bricht ab.`, 4200); this.paint();
  },
  step(step, time) {
    if (!this.on || this.fin) return; const u = (step - this.s0) / (this.bars * 16); if (u < 0) return; this.u = Math.min(1, u);
    if (u >= 1) return this.final(time);
    for (const e of this.P) { const g = this.gain(e, u); if (Math.abs(g - (e.f.songG == null ? 1 : e.f.songG)) > 0.008) { e.f.songG = g; try { Forms.applyMix(e.f); } catch (_) {} } }
    try { if (!(typeof Beweg !== "undefined" && Beweg.on)) { Wucht.filter(u > 0.35 ? 0.97 - 0.42 * (u - 0.35) / 0.65 : null); Wucht.echoAmt(u > 0.55 ? 0.4 * (u - 0.55) / 0.45 : 0); } } catch (_) {}
  },
  // letzter Schlag: alles andere schweigt, Bass und Akkord spielen den Grundton, der Hall klingt aus
  final(time) {
    this.fin = true; this.u = 1; const E = this.enders(this.P), R = mod(Music.mood.root, 12);
    try { LoopCtl.paused = true; } catch (_) {}
    for (const e of this.P) { try { e.f.still = true; e.f.songG = E.includes(e) ? Math.max(0.55, e.g0 * 0.8) : 0; Forms.applyMix(e.f); } catch (_) {} }
    try { Wucht.filter(0.86); Wucht.echoAmt(0.5); } catch (_) {}
    this.hits = 0;
    for (const e of E) { try { const f = e.f;
        if (f.kind === "drum") { for (const z of ["kick", "top"]) { Forms.play(f, z === "kick" ? 0.1 : 0.9, 0.9, { zone: z, time, help: 50 }); this.hits++; } continue; }
        const P = Perf.prof(f), lo = P && P.lo != null ? P.lo : 48, hi = P && P.hi != null ? P.hi : 72; let m = R + 12 * Math.ceil((lo - R) / 12); if (m > hi) m -= 12;
        const L = e.role === "bass" ? [m] : [m, m + Music.mu.so(2), m + Music.mu.so(4)].filter(x => x <= hi + 7);
        L.forEach((x, i) => { const h = Forms.play(f, clamp((x - 28) / 60, 0, 1), 0.85, { midi: x, time: time + i * 0.03, dur: 2.2 }); this.hits++; if (h) setTimeout(() => { try { Forms.release(h); } catch (_) {} }, 2300); }); } catch (err) { console.warn(err); } }
    clearTimeout(this.to); this.to = setTimeout(() => this.done(false), 3000); this.paint();
  },
  done(abort) {
    if (!this.on) return; clearTimeout(this.to); const B = this.back || {}, fin = this.fin; this.on = false; this.fin = false; this.u = 0;
    try { if (!abort) { let rec = false; try { rec = !!Rec.on; } catch (_) {} try { Song.stop(true); } catch (_) {} if (Transport.running) Transport.stop(); if (rec) { try { Rec.stop(); } catch (_) {} } } } catch (e) { console.warn(e); }
    try { LoopCtl.paused = !!B.lp; } catch (_) {}
    for (const e of this.P) { try { if (B.still && B.still.has(e.f)) e.f.still = B.still.get(e.f); e.f.songG = null; Forms.applyMix(e.f); } catch (_) {} }
    try { if (!(typeof Beweg !== "undefined" && Beweg.on)) { Wucht.filter(null); Wucht.echoAmt(0); } } catch (_) {}
    if (abort) { try { if (B.song && Transport.running && !fin) SongUI.play(B.sec); } catch (_) {} }
    this.P = []; this.back = null; Hap(abort ? 6 : 14); UI.toast(abort ? "Ausklang abgebrochen – alles spielt wieder wie vorher" : "Ausgeklungen. Dein Stück ist unverändert – „Hören“ spielt es wieder von vorn.", 3200);
    try { UI.refresh(); KSheet.sync(true); } catch (_) {} this.paint();
  },
  // Knopf im Bereich Spielen (neben dem runden Abspielknopf bzw. unter dem Ansichtsschalter)
  el() { let e = $("ou75"); if (!e) { e = document.createElement("button"); e.id = "ou75"; e.className = "ou75"; e.hidden = true; e.addEventListener("click", () => this.start()); document.body.appendChild(e); } return e; },
  show() { try { return !!(App.started && UI.tab === "klang" && this.forms().length && KSheet.visible() && !Full.on && !FBar.mode() && !Mel.rec && !Einsp.on && !Schrift.on && !Live70.on && !document.body.classList.contains("kerkl")); } catch (_) { return false; } },
  paint() { const el = this.el(), on = this.show(); if (el.hidden === on) el.hidden = !on; if (!on) return;
    try { const a = document.querySelector("#formname .fnpp"), r = a && a.offsetParent ? a.getBoundingClientRect() : null, v = $("vseg"), q = v && v.offsetParent ? v.getBoundingClientRect() : null; let x = 16, y = 140; if (r && r.width) { x = r.right + 8; y = r.top + (r.height - 34) / 2; } else if (q) { x = q.left; y = q.bottom + 8; } const L = Math.round(x) + "px", T = Math.round(y) + "px"; if (el.style.left !== L) el.style.left = L; if (el.style.top !== T) el.style.top = T; } catch (_) {}
    const sg = this.on ? "on" + Math.round(this.u * 20) : "off"; if (el.dataset.sg === sg) return; el.dataset.sg = sg; el.classList.toggle("q7on", this.on); el.style.setProperty("--p", (this.u * 100).toFixed(0) + "%");
    el.setAttribute("aria-label", this.on ? "Ausklang läuft – tippen bricht ab" : "Ausklang: das Stück mit einem Outro beenden"); el.setAttribute("aria-pressed", this.on); el.innerHTML = `<i>${I67.aus}</i><span>${this.on ? (this.fin ? "Schlusston" : "klingt aus …") : "Ausklang"}</span>`; }
};
{ const os = Transport.onStep.bind(Transport); Transport.onStep = function (step, time) { try { Outro75.step(step, time); } catch (e) { console.warn(e); } return os(step, time); }; }
setInterval(() => { try { Outro75.paint(); } catch (_) {} }, 300);
// wird die Musik anders angehalten oder das Stück gewechselt, endet der Ausklang sauber
{ const ts = Transport.stop.bind(Transport); Transport.stop = function (...a) { const r = ts(...a); try { if (Outro75.on && !Outro75._in) { Outro75._in = true; Outro75.done(true); Outro75._in = false; } } catch (_) { Outro75._in = false; } return r; };
  const pl = Project.load.bind(Project); Project.load = function (...a) { try { if (Outro75.on) Outro75.done(true); } catch (_) {} return pl(...a); }; }
try { Alles73.MAKE.push(["outro", "aus", "Ausklang", "Das laufende Stück mit einem Outro beenden"]); const ac = Alles73.act.bind(Alles73); Alles73.act = function (k) { if (k === "mk:outro") { UI.hideSheets(); UI.setTab("klang"); return setTimeout(() => Outro75.start(), 80); } return ac(k); }; } catch (_) {}
try { Erkl.T.push(["#ou75", "Ausklang", "Beendet das laufende Stück mit einem Outro: Die Stimmen gehen der Reihe nach leiser, am Ende steht ein Schlusston mit Nachhall. Dein Stück bleibt unverändert. Nochmal tippen bricht ab."]); } catch (_) {}
Help.T.push({ id: "v75", ic: "🌅", t: "Ausklang: das Stück mit einem Outro beenden", k: "ausklang fade out outro ende beenden ausblenden schluss schlusston leiser stück aufhören",
  h: `<p>Im Bereich <b>Spielen</b> steht oben links der Knopf <b>Ausklang</b>. Läuft dein Stück, macht ein Tipp daraus ein Ende von etwa zwölf Sekunden (2 bis 8 Takte, je nach Tempo):</p>
  <ul><li>Zuerst gehen die <b>Melodien</b>, dann die <b>Begleitung</b>, dann das <b>Schlagzeug</b>, zuletzt <b>Bass und Akkorde</b> – jede Stimme sanft, keine bricht ab.</li><li>Der Klang wird dabei weicher, und ein Echo kommt dazu.</li><li>Am Ende spielen Bass und Akkord einen <b>Schlusston</b> auf dem Grundton, der ausklingt.</li></ul>
  <p>Danach steht die Musik. Dein Stück ist <b>unverändert</b>: Lautstärken, Loops und Drehungen sind wie vorher, „Hören“ spielt es wieder. <b>Nochmal tippen</b> während des Ausklangs bricht ab, alles spielt weiter. Läuft eine Aufnahme, endet sie mit dem Ausklang.</p>` });

/* ---------- Neues Stück: Töne aufnehmen – daraus wird eine Form, die die Start-Melodie oder ihre eigene spielt ---------- */
const RecNP = {
  MAX: 12, rec: null, node: null, stream: null, t0: 0, chunks: [], tick: 0, src: null,
  S() { return NewPiece.st; },
  // Tonhöhen-Verlauf: gesungene oder gespielte Töne als Folge von Halbtönen (MIDI), höchstens 16
  track(x, sr) {
    const q = Math.max(1, Math.round(sr / 12000)), n = Math.floor(x.length / q), y = new Float32Array(n), r = sr / q; let pk = 0;
    for (let i = 0; i < n; i++) { let s = 0; for (let k = 0; k < q; k++) s += x[i * q + k]; y[i] = s / q; const a = Math.abs(y[i]); if (a > pk) pk = a; }
    if (pk < 0.01) return [];
    const N = 1024, hop = 512, lo = Math.max(2, Math.floor(r / 1000)), hi = Math.min(N - 2, Math.ceil(r / 75)), W = N - hi, fr = [], lv = [];
    for (let s = 0; s + N <= n; s += hop) {
      let e = 0; for (let i = 0; i < W; i++) e += y[s + i] * y[s + i]; const rms = Math.sqrt(e / W); lv.push(rms); if (rms < pk * 0.07) { fr.push(null); continue; }
      let run = 0, tau = -1, dPrev = 1e9; const d = new Float32Array(hi + 1);
      for (let t = 1; t <= hi; t++) { let acc = 0; for (let i = 0; i < W; i++) { const v = y[s + i] - y[s + i + t]; acc += v * v; } run += acc; d[t] = run > 0 ? acc * t / run : 1; }
      for (let t = lo; t < hi; t++) { if (d[t] < 0.18 && d[t] <= d[t + 1]) { tau = t; break; } }
      if (tau < 0) { fr.push(null); continue; }
      const a = d[tau - 1] ?? d[tau], b = d[tau], c = d[tau + 1] ?? d[tau], den = a - 2 * b + c, off = den ? clamp(0.5 * (a - c) / den, -0.5, 0.5) : 0;
      fr.push(Math.round(69 + 12 * Math.log2(r / (tau + off) / 440)));
    }
    const out = []; let cur = null, len = 0; const flush = () => { if (cur != null && len >= 2 && out.length < 16) out.push(cur); };
    let top = 0; fr.forEach((m, i) => { const v = lv[i], dip = m === cur && cur != null && len >= 2 && i > 0 && lv[i - 1] < top * 0.6 && v > lv[i - 1] * 1.5;      /* derselbe Ton neu angesetzt */
      if (m === cur && !dip) { len++; if (v > top) top = v; } else { flush(); cur = m; len = 1; top = v; } }); flush();
    return out;
  },
  // Töne → Stufen der Tonart (so wie die bunten Tasten der Start-Melodie zählen)
  degs(notes, mood) { const b0 = StartMel.midiFor(mood, 0); return notes.map(m => { while (m < b0 - 5) m += 12; while (m > b0 + 17) m -= 12; let bk = 0, bd = 1e9; for (let k = -4; k <= 11; k++) { const dd = Math.abs(StartMel.midiFor(mood, k) - m); if (dd < bd) { bd = dd; bk = k; } } return bk; }); },
  sec(S) { const R = S.rec, has = !!(R && R.x), d = has ? R.d : [], why = (() => { try { return AudioIn.why(); } catch (_) { return ""; } })();
    return `<div class="rn75" id="rn75S"><h3 class="ph3">Eigener Klang <small>wahlweise</small></h3><p class="kch">Nimm einen Ton auf – deine Stimme, ein Instrument, ein Geräusch. Daraus wird eine <b>eigene Form</b> im neuen Stück, die du in jeder Tonhöhe spielen kannst.</p>
      <div class="rn75bar"><button class="eb rn75go${this.rec ? " q7rec" : ""}" data-rn="mic" aria-pressed="${!!this.rec}"><i class="lvdot"></i><span>${this.rec ? "Stopp" : has ? "Neu aufnehmen" : "Aufnehmen"}</span></button><span class="btn filebtn rn75f">Audiodatei<input type="file" id="rn75File" accept="audio/*,.mp3,.m4a,.wav,.ogg,.oga,.opus,.aac,.flac,.webm" aria-label="Audiodatei wählen"></span>${has ? `<button class="eb" data-rn="play" aria-label="Aufnahme anhören">${I67.play}<span>Anhören</span></button><button class="eb" data-rn="drop" aria-label="Aufnahme verwerfen">${I67.trash}</button>` : ""}</div>
      <div class="meter rn75m"><i id="rn75Lv"></i></div>
      <p class="rn75msg" id="rn75Msg" aria-live="polite">${has ? `Aufnahme: ${fmt(R.x.length / R.sr, 1)} s${d.length >= 2 ? ` · erkannte Töne: ${d.map(k => StartMel.lab(k)).join(" ")}` : " · kein Tonverlauf erkannt (ein Ton oder ein Geräusch)"}` : why ? esc(why) + " „Audiodatei“ geht trotzdem." : "Bis zu zwölf Sekunden. Singst oder spielst du mehrere Töne nacheinander, erkennt KLANGRAUM die Melodie."}</p>
      ${has ? `<div class="sm74l"><span>Die neue Form spielt</span><span class="eseg sm74seg"><button data-rn="mode:start" aria-pressed="${R.mode === "start"}">die Start-Melodie</button><button data-rn="mode:eigen" aria-pressed="${R.mode === "eigen"}"${d.length < 2 ? " disabled" : ""}>ihre eigene${d.length >= 2 ? " (gesungen)" : ""}</button><button data-rn="mode:frei" aria-pressed="${R.mode === "frei"}">nichts vor</button></span></div>
      ${d.length >= 2 ? `<button class="eb rn75all" data-rn="all">Gesungene Töne als Start-Melodie für alle nehmen</button>` : ""}` : ""}</div>`; },
  msg(t) { const m = $("rn75Msg"); if (m) m.textContent = t; },
  rerender() { const y = $("rn75S") ? $("rn75S").getBoundingClientRect().top : null; NewPiece.render(); try { if (y != null && $("rn75S")) { const sh = $("rn75S").closest(".sheet"), dy = $("rn75S").getBoundingClientRect().top - y; if (sh && sh.scrollBy) sh.scrollBy(0, dy); } } catch (_) {} },
  got(x, sr, name) {
    const S = this.S(); if (!S) return; let pk = 0; for (let i = 0; i < x.length; i += 4) { const a = Math.abs(x[i]); if (a > pk) pk = a; }
    if (x.length < sr * 0.15 || pk < 0.01) { S.rec = null; this.rerender(); this.msg("Zu leise oder zu kurz – bitte näher ans Mikrofon und etwas länger."); return; }
    const mood = StartMel.mood(), notes = this.track(x, sr), d = this.degs(notes, mood);
    S.rec = { x, sr, name: name || "Aufnahme", notes, d, mode: (S.mel && S.mel.length) || d.length < 2 ? "start" : "eigen" }; Hap(12); this.rerender();
  },
  async mic() {
    if (this.rec) return this.stop(); if (!Engine.ctx) { UI.toast("Erst „Eintauchen“ – dann ist der Ton an"); return; }
    let stream; try { if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw new Error("none"); stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } }); }
    catch (e) { let w = ""; try { w = AudioIn.why(); } catch (_) {} this.msg((w || "Das Mikrofon wurde nicht freigegeben.") + " Wähle stattdessen eine Audiodatei."); return; }
    if (!this.S() || !$("rn75S")) { stream.getTracks().forEach(t => t.stop()); return; }
    try { const c = Engine.ctx; if (c.state !== "running") c.resume(); const src = c.createMediaStreamSource(stream), node = Engine.makeRec(1), z = c.createGain(); z.gain.value = 0; src.connect(node.input || node); node.connect(z).connect(c.destination);
      this.chunks = []; this.rec = true; this.stream = stream; this.node = node; this.t0 = performance.now();
      node.port.onmessage = e => { if (e.data.t === "chunk") this.chunks.push(e.data.d[0]); else if (e.data.t === "lvl") { const l = $("rn75Lv"); if (l) l.style.width = Math.min(100, e.data.v * 140) + "%"; } else if (e.data.t === "end") this.finish(); };
      node.port.postMessage({ on: true, ch: 1 }); this.rerender();
      clearInterval(this.tick); this.tick = setInterval(() => { const s = (performance.now() - this.t0) / 1000; this.msg(`● Nimmt auf … ${fmt(s, 1)} s (höchstens ${this.MAX} s) – „Stopp“ beendet`); if (s >= this.MAX || !$("rn75S")) this.stop(); }, 100);
    } catch (e) { console.warn(e); try { stream.getTracks().forEach(t => t.stop()); } catch (_) {} this.rec = null; this.msg("Die Aufnahme ließ sich nicht starten."); }
  },
  stop() { if (!this.rec) return; this.rec = null; clearInterval(this.tick); try { this.node.port.postMessage({ on: false }); } catch (_) {} try { this.stream.getTracks().forEach(t => t.stop()); } catch (_) {} clearTimeout(this.ft); this.ft = setTimeout(() => this.finish(), 600); },   /* falls das Ende-Signal ausbleibt */
  finish() { clearTimeout(this.ft); if (!this.node) return; const n = this.chunks.reduce((s, c) => s + c.length, 0), x = new Float32Array(n); let o = 0; for (const c of this.chunks) { x.set(c, o); o += c.length; } try { this.node.disconnect(); } catch (_) {} this.node = null; this.chunks = []; const l = $("rn75Lv"); if (l) l.style.width = "0%"; this.got(x, Engine.ctx.sampleRate, "Stimme"); },
  async file(f) { if (!Engine.ctx || !f) return; try { const ab = await AudioIn.decodeFile(f), n = Math.min(ab.length, ab.sampleRate * this.MAX), x = new Float32Array(n); for (let c = 0; c < ab.numberOfChannels; c++) { const d = ab.getChannelData(c); for (let i = 0; i < n; i++) x[i] += d[i] / ab.numberOfChannels; } this.got(x, ab.sampleRate, f.name.replace(/\.[^.]+$/, "").slice(0, 18) || "Aufnahme"); } catch (e) { this.msg("Diese Datei kann der Browser nicht lesen. WAV, MP3 oder M4A gehen meistens."); } },
  play() { const R = this.S() && this.S().rec; if (!R || !Engine.ctx) return; try { if (this.src) this.src.stop(); } catch (_) {} try { const c = Engine.ctx, b = c.createBuffer(1, R.x.length, R.sr); b.getChannelData(0).set(R.x); const s = c.createBufferSource(); s.buffer = b; s.connect(Engine.sum || Engine.out); s.start(); this.src = s; } catch (e) { console.warn(e); } },
  act(k) {
    const S = this.S(); if (!S) return; Hap(8);
    if (k === "mic") return this.mic();
    if (k === "play") return this.play();
    if (k === "drop") { S.rec = null; return this.rerender(); }
    if (k.startsWith("mode:") && S.rec) { S.rec.mode = k.slice(5); return this.rerender(); }
    if (k === "all" && S.rec && S.rec.d.length >= 2) { S.mel = S.rec.d.slice(0, StartMel.MAXN); S.rec.mode = "start"; this.rerender(); try { StartMel.act("play"); } catch (_) {} UI.toast("Deine gesungenen Töne sind jetzt die Start-Melodie für alle Formen", 2800); }
  },
  // nach dem Anlegen des Stücks: aus der Aufnahme wird eine Form
  after(R, d, O) {
    try { let f = null; try { AudioIn.keep(R.x, R.sr, R.name); } catch (_) {} const act = Forms.active, tab = UI.tab, n0 = Forms.list.filter(g => g && !g.empty && g.kind !== "drum").length;
      f = AudioIn.process(R.x, R.sr, R.name); if (!f) { UI.toast("Die Aufnahme war zu leise oder zu kurz – das Stück ist ohne sie angelegt.", 3600); return null; }
      const mel = R.mode === "start" && d.length ? d : R.mode === "eigen" && R.d.length >= 2 ? R.d : null;
      if (mel) { Mel.add(f, mel, R.mode === "start" ? "Start-Melodie" : "Gesungen"); if (O.go !== false) { try { if (O.kanon && R.mode === "start" && n0) { const p = Motion.ph(f); p.ry += K.TAU * (2 * n0 / Math.max(2, mel.length)); if (p.lk) p.lk.y = null; } Move.setR(f, O.r || 1, { soft: false }); if (!Transport.running) Transport.start(); } catch (_) {} } }
      try { if (Forms.list.length > 1) UI.setView("alle"); UI.refresh(); } catch (_) {} Save.soon();
      UI.toast(`„${f.name}“ ist deine eigene Form${mel ? (R.mode === "start" ? " und spielt die Start-Melodie mit" : " und spielt, was du gesungen hast") : " – tippe sie an oder dreh sie"}.`, 4600); return f;
    } catch (e) { console.warn(e); return null; }
  }
};
{ const rn = NewPiece.render.bind(NewPiece); NewPiece.render = function () { const r = rn(); try { const a = $("sm73S") || document.querySelector("#npS .np-go"); if (a && this.st && !$("rn75S")) { a.insertAdjacentHTML("beforebegin", RecNP.sec(this.st)); const fi = $("rn75File"); if (fi) fi.onchange = e => { const f = e.target.files[0]; e.target.value = ""; if (f) RecNP.file(f); }; } } catch (e) { console.warn(e); } return r; };
  const go = NewPiece.go.bind(NewPiece); NewPiece.go = async function () { let R = null, d = [], O = {}; try { if (RecNP.rec) RecNP.stop(); const S = this.st; R = S && S.rec && S.rec.x ? S.rec : null; d = S && Array.isArray(S.mel) ? S.mel.slice() : []; O = S && S.mo ? { r: S.mo.r, kanon: !!S.mo.kanon, go: S.mo.go !== false } : { r: 1, kanon: false, go: true }; } catch (_) {} const r = await go(); if (R) RecNP.after(R, d, O); return r; };
  document.addEventListener("click", e => { const b = e.target.closest && e.target.closest("#rn75S [data-rn]"); if (b) RecNP.act(b.dataset.rn); }); }
Help.T.push({ id: "v75b", ic: "🎤", t: "Neues Stück: Töne aufnehmen und als Form mitnehmen", k: "aufnehmen mikrofon stimme singen neues stück eigene form eigener klang hauptmelodie start melodie gesungen erkannt audiodatei",
  h: `<p>Im Blatt <b>Neues Stück</b> gibt es den Abschnitt <b>Eigener Klang</b>. <b>Aufnehmen</b> nimmt bis zu zwölf Sekunden über das Mikrofon auf (oder „Audiodatei“). Beim Anlegen wird daraus eine <b>eigene Form</b>, die du in jeder Tonhöhe spielen, kneten und drehen kannst.</p>
  <p><b>Die neue Form spielt</b> – du wählst: <b>die Start-Melodie</b> (dasselbe wie die anderen Formen), <b>ihre eigene</b> (das, was du gesungen oder gespielt hast – KLANGRAUM erkennt die Töne nacheinander) oder <b>nichts vor</b>. Mit „Gesungene Töne als Start-Melodie für alle nehmen“ singst du die Melodie, statt sie zu tippen.</p>
  <p>Erkannt werden einzelne, klare Töne nacheinander (Stimme, Flöte, Pfeifen). Akkorde und Geräusche ergeben keinen Tonverlauf – die Form entsteht trotzdem. Ist das Mikrofon gesperrt (zum Beispiel in einer eingebetteten Ansicht), nimm eine Audiodatei.</p>` });
