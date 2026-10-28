/* ============================================================
   v55: Loopstation (Geräusche, Stimme, Instrumente und gespielte Form-Passagen direkt aufnehmen und loopen)
        · Drehtempo fein (12 Schritte je Verdopplung, Regler im Steuerfeld) · übersichtlicher (eigener Bereich „Loop“)
   ============================================================ */

// ---------- 1) Drehtempo: feines Raster statt fünf Stufen ----------
// Gekoppelt rasten Drehungen weiter im Takt ein – jetzt aber auf 12 Schritte je Verdopplung (wie Halbtöne beim Tempo).
// Die Rhythmus-Stufe (Halbe … Zweiunddreißigstel) folgt der nächstliegenden Stufe; dazwischen ändert sich, welche Stelle wann vorn ist.
Object.assign(Motion, {
  FINE: 12,
  RMIN: 0.125, RMAX: 4,
  rpbOf(w) { return Math.abs(w || 0) * this.barSec() / K.TAU; },          // Umdrehungen je Takt
  wOfR(r) { return K.TAU * r / this.barSec(); },
  fineR(w, a) {
    const r = this.rpbOf(w); if (!(r > 0)) return 0;
    const max = this.AXES[a || "y"].max, k = clamp(Math.round(this.FINE * Math.log2(r / 0.25)), -this.FINE, this.FINE * (max - 1));
    return 0.25 * Math.pow(2, k / this.FINE);
  }
});
Object.assign(Move, {
  STEP: 2,   // Knopf − / + : zwei Rasterschritte = × 1,12
  rpb(f) { return !f || f.still ? 0 : Motion.rpbOf(Motion.tw(f, "y")); },
  atMax(f) { return this.rpb(f) >= Motion.RMAX * 0.985; },
  // Drehtempo direkt setzen (r = Umdrehungen je Takt, 0 = steht); Richtung bleibt
  setR(f, r, opt = {}) {
    const p = Motion.ph(f); f.mot.dreh = 0;
    const sg = Math.sign(Motion.tw(f, "y")) || Math.sign(p.wy) || (p.dir || {}).y || 1;
    if (r > 0 && Motion.pausing(f)) Motion.unpause(f);
    if (r > 0 && f.still) { Motion.resume(f); if (Glide.rot && opt.soft !== false) p.wy = 0; }
    if (r > 0 && !Transport.running && Engine.ctx) Transport.start();
    Motion.glideTo(f, "y", r > 0 ? sg * Motion.wOfR(clamp(r, Motion.RMIN, Motion.RMAX)) : 0, opt.soft === false ? { soft: false } : {});
    f.motPrevH = 0; if (p.lk) p.lk.y = null;
  },
  rTxt(r) { if (!r) return "steht"; const v = Motion.free ? r : Motion.fineR(Motion.wOfR(r)); return `${v < 1 ? v.toFixed(2).replace(".", ",") : v.toFixed(v < 2 ? 2 : 1).replace(".", ",").replace(/,0+$/, "")} U/Takt`; },
  say(f, r) { const t = r ? Motion.tierOfW(Motion.wOfR(r)) : 0; UI.toast(`${f.name}: ${this.rTxt(r)}${t ? " · " + Motion.TIERS[t].n : ""}`, 1100); },
  faster(f) {
    if (Motion.pausing(f)) Motion.unpause(f);
    const r = this.rpb(f), q = Math.pow(2, this.STEP / Motion.FINE);
    const n = r < Motion.RMIN * 0.98 ? 0.25 : Math.min(Motion.RMAX, Motion.free ? r * q : Motion.fineR(Motion.wOfR(r * q)));
    this.setR(f, n); this.say(f, n);
  },
  slower(f) {
    if (Motion.pausing(f)) Motion.unpause(f);
    if (f.still) Motion.resume(f);
    const r = this.rpb(f), n = r / Math.pow(2, this.STEP / Motion.FINE);
    if (!r || n < Motion.RMIN * 0.98) { Motion.setTier(f, 0); if (!Motion.moves(f)) UI.toast(`${f.name} dreht nicht mehr`, 1400); return; }
    const v = Motion.free ? n : Motion.fineR(Motion.wOfR(n)); this.setR(f, v); this.say(f, v);
  },
  // Regler 0 … 100 (logarithmisch): 0 = steht, 1 = 0,125 U/Takt … 100 = 4 U/Takt
  sv(r) { return r < Motion.RMIN * 0.98 ? 0 : Math.round(clamp(1 + 99 * Math.log(r / Motion.RMIN) / Math.log(Motion.RMAX / Motion.RMIN), 1, 100)); },
  vr(v) { v = +v; return v <= 0 ? 0 : Motion.RMIN * Math.pow(Motion.RMAX / Motion.RMIN, (v - 1) / 99); },
  slider(f) {
    const r = this.rpb(f), nm = esc(f.name);
    return `<label class="fbvol fbspd" aria-label="Drehtempo ${nm}"><input type="range" data-fr="spd" min="0" max="100" step="1" value="${this.sv(r)}"><b>${this.rTxt(r)}</b></label>`;
  }
});
// Steuerfeld „Drehen“: Regler für das Drehtempo
{ const r0 = FBar.rows.bind(FBar); FBar.rows = function (f) { let h = r0(f); try { if (this.cat === "dreh" && f && !f.empty && !this.mode() && !h.includes('data-fr="spd"')) h = h.replace(/<button class="fb sq" data-fb="slower"/, Move.slider(f) + '<button class="fb sq" data-fb="slower"'); } catch (e) { console.warn(e); } return h; }; }
{ const in0 = FBar.input.bind(FBar); FBar.input = function (e) {
  const r = e.target; if (!r || r.dataset.fr !== "spd") return in0(e); const f = Forms.active; if (!f) return;
  if (!this.spdU) { Undo.push(); this.spdU = setTimeout(() => this.spdU = 0, 1500); }
  const v = Move.vr(r.value); if (v) Move.setR(f, v, { soft: false }); else { Motion.setTier(f, 0); }
  const b = r.parentElement.querySelector("b"); if (b) b.textContent = Move.rTxt(v); Save.soon(); }; }

// ---------- 2) Loopstation ----------
// Vier (bis sechs) Spuren. Quelle: Mikrofon (Geräusche, Stimme, Beatbox, Gitarre …) oder die Formen (was gerade erklingt).
// Erster Loop „Frei“: antippen – spielen – antippen; die Länge bestimmt das Tempo. Oder feste Länge 1/2/4/8 Takte.
// Jede Spur: Aufnehmen → läuft → Overdub (dazu aufnehmen) → läuft; stoppen/spielen, Overdub zurücknehmen, Lautstärke, leeren.
const LoopSt = {
  MAXN: 6,
  slots: [null, null, null, null], L: 0,           // L: Loop-Länge in Sechzehnteln (0 = noch keiner)
  src: store.get("lsSrc") === "form" ? "form" : "mic",
  len: [0, 1, 2, 4, 8].includes(+store.get("lsLen")) ? +store.get("lsLen") : 0,
  R: null, bufs: new Map(), srcs: [], mic: null, o: null,
  // ---------- Daten ----------
  data() { return { L: this.L, slots: this.slots.map(t => t ? { id: t.id, rec: t.rec, prev: t.prev || null, name: t.name, vol: t.vol, on: !!t.on, bpm: t.bpm, ch: t.ch | 0, src: t.src } : null) }; },
  load(d) {
    if (!this.R && JSON.stringify(this.data()) === JSON.stringify(d && Array.isArray(d.slots) ? d : { L: 0, slots: this.slots.map(() => null) })) return;
    this.stopAll(); if (this.R) this.cancel(true);
    const S = d && Array.isArray(d.slots) ? d.slots : [];
    const n = clamp(Math.max(4, S.length), 4, this.MAXN);
    this.slots = Array.from({ length: n }, (_, i) => { const t = S[i]; return t && t.rec ? { id: t.id || uid("ls"), rec: String(t.rec), prev: t.prev ? String(t.prev) : null, name: t.name || `Spur ${i + 1}`, vol: t.vol ?? 1, on: t.on !== false, bpm: +t.bpm || Music.tempo(), ch: t.ch | 0 || 1, src: t.src === "form" ? "form" : "mic", pend: true } : null; });
    this.L = this.slots.some(Boolean) ? (d.L | 0) || 32 : 0;
    this.preload(); this.sync();
  },
  any() { return this.slots.some(Boolean); },
  count() { return this.slots.filter(Boolean).length; },
  async buf(t) {
    if (this.bufs.has(t.rec)) return this.bufs.get(t.rec);
    if (t._ld) return null; t._ld = true;
    try { const r = await DB.get("recs", t.rec); if (!r || !Engine.ctx) { t.missing = true; return null; }
      const ch = Recs.audio(r), b = Engine.ctx.createBuffer(ch.length, ch[0].length, r.sr); ch.forEach((c, i) => b.copyToChannel(c, i)); this.bufs.set(t.rec, b); t.missing = false; return b; }
    catch (e) { console.warn(e); return null; } finally { t._ld = false; }
  },
  preload() { for (const t of this.slots) if (t) this.buf(t).catch(() => {}); },
  out() { if (this.o || !Engine.ctx) return this.o; this.o = Engine.ctx.createGain(); this.o.gain.value = 1; this.o.connect(Engine.out); return this.o; },   // nach dem Begrenzer: nicht in der Formen-Aufnahme
  // ---------- Abspielen im Takt ----------
  spb0(t) { return 15 / (t.bpm || Music.tempo()); },   // Puffer-Sekunden je Sechzehntel (Aufnahmetempo)
  onStep(step, time) {
    const R = this.R; if (R) this.recStep(R, step, time);
    const L = this.L; if (!L) return; const ph = ((step % L) + L) % L;
    for (const t of this.slots) {
      if (!t || !t.on) continue; const b = this.bufs.get(t.rec);
      if (!b) { if (!t.missing) this.buf(t); t.pend = true; continue; }
      if (ph === 0 || t.pend) { this.stopT(t, time); this.startT(t, b, time, ph); t.pend = false; }
    }
  },
  startT(t, b, time, ph) {
    const c = Engine.ctx, s = c.createBufferSource(), g = c.createGain(), rate = Music.tempo() / (t.bpm || Music.tempo());
    s.buffer = b; s.playbackRate.value = rate; g.gain.value = t.vol; s.connect(g).connect(this.out());
    let when = time, off = ph * this.spb0(t); if (when < c.currentTime) { off += (c.currentTime - when) * rate; when = c.currentTime; }
    if (off >= b.duration - 0.002) return;
    s.start(when, off); const e = { s, g, t, t0: when - off / rate }; this.srcs.push(e);
    s.onended = () => { const i = this.srcs.indexOf(e); if (i >= 0) this.srcs.splice(i, 1); };
  },
  stopT(t, time, fade) {
    const c = Engine.ctx; if (!c) return;
    for (const e of this.srcs.filter(x => x.t === t)) { const at = Math.max(c.currentTime, time || 0);
      try { if (fade) { e.g.gain.setTargetAtTime(0, at, 0.012); e.s.stop(at + 0.08); } else e.s.stop(at + 0.002); } catch (_) {}
      const i = this.srcs.indexOf(e); if (i >= 0) this.srcs.splice(i, 1); }
  },
  stopAll() { for (const e of this.srcs) try { e.s.stop(); } catch (_) {} this.srcs = []; for (const t of this.slots) if (t) t.pend = true; },
  playing(t) { return !!t && t.on && Transport.running && !!this.bufs.get(t.rec); },
  setVol(t, v) { t.vol = v; for (const e of this.srcs) if (e.t === t) try { e.g.gain.setTargetAtTime(v, Engine.now(), 0.02); } catch (_) {} },
  // Spur an/aus (startet im Takt an der richtigen Stelle)
  toggle(i, v) {
    const t = this.slots[i]; if (!t) return; t.on = v == null ? !t.on : !!v; Hap(6);
    if (t.on) { t.pend = true; if (!Transport.running && Engine.ctx) Transport.start(); } else this.stopT(t, Engine.now(), true);
    Save.soon(); this.sync();
  },
  allToggle() {
    const anyOn = this.slots.some(t => t && t.on) && Transport.running;
    if (anyOn) { for (const t of this.slots) if (t) { t.on = false; this.stopT(t, Engine.now(), true); } }
    else { for (const t of this.slots) if (t) { t.on = true; t.pend = true; } if (Engine.ctx) { if (Transport.running) Transport.stop(); Transport.start(); } }
    Hap(8); Save.soon(); this.sync();
  },
  // ---------- Mikrofon ----------
  why() { return MicFix.reason(null); },
  micBlocked(i) {
    const why = this.why(); if (!why) return false;
    MicLog.add(`Loopstation: Mikrofon gesperrt (${why}) · ${location.protocol}`);
    const cap = () => this.importPick(i, true);
    try {
      if (!window.__KR_WIN && MicWin.embedded() && why === "policy") { MicWin.choose("loop"); this.hookCap('[data-mw="cap"]', cap); return true; }
      if (MicWin.insecure && MicWin.insecure()) { MicWin.chooseFile("loop"); this.hookCap('[data-mf2="cap"]', cap); return true; }
    } catch (e) { console.warn(e); }
    cap(); setTimeout(() => MicFix.tell(why), 400); return true;
  },
  hookCap(sel, fn) { setTimeout(() => { const b = document.querySelector(sel); if (b && !b._ls) { b._ls = 1; b.addEventListener("click", e => { e.stopPropagation(); e.preventDefault(); Hap(8); UI.hideSheets(); fn(); }, true); } }, 0); },
  async micOpen() {
    const m = this.mic; if (m && m.stream.active) return true;
    let stream; try { stream = await Sing.getStream(false); } catch (e) { MicLog.add(`Loopstation getUserMedia: ${e.name} ${e.message || ""}`); MicFix.tell(MicFix.reason(e)); return false; }
    if (Engine.ctx.state !== "running") try { await Engine.ctx.resume(); } catch (_) {}
    const tr = stream.getAudioTracks()[0], st = tr && tr.getSettings ? tr.getSettings() : {};
    let src; try { src = Engine.ctx.createMediaStreamSource(stream); } catch (e) { stream.getTracks().forEach(x => x.stop()); MicFix.tell("rate"); return false; }
    this.mic = { stream, src, inLat: st.latency || 0.01 };
    MicLog.add(`Loopstation: Mikrofon an · ${tr ? tr.label || "Mikrofon" : "?"} · Echo-Filter ${st.echoCancellation}`);
    return true;
  },
  micClose() { const m = this.mic; if (!m || (this.R && this.R.src === "mic")) return; this.mic = null; try { m.src.disconnect(); } catch (_) {} m.stream.getTracks().forEach(x => x.stop()); },
  micIdle() { clearTimeout(this.mt); this.mt = setTimeout(() => { if (UI.tab !== "loop") this.micClose(); }, 4000); },
  // ---------- Aufnahme ----------
  nextBar() { return Math.ceil((Transport.step + 4) / 16) * 16; },
  tStep(s) { return Transport.t0 + s * Transport.spb; },
  outLat() { const c = Engine.ctx; return (c.outputLatency || 0) + (c.baseLatency || 0); },
  // Taktzahl für einen frei aufgenommenen ersten Loop: 1/2/4/8/16 Takte, Tempo möglichst zwischen 70 und 150 BPM
  fitBars(D) {
    let best = 1, bd = 1e9; for (const n of [1, 2, 4, 8, 16]) { const bpm = n * 240 / D, d = bpm < 70 ? 70 - bpm : bpm > 150 ? bpm - 150 : Math.abs(bpm - 110) * 0.01; if (d < bd) { bd = d; best = n; } }
    return { n: best, bpm: best * 240 / D };
  },
  async tap(i) {
    if (!Engine.ctx) return; const R = this.R, t = this.slots[i];
    if (R) {
      if (R.i !== i) { UI.toast(`Erst Spur ${R.i + 1} fertig aufnehmen`, 1400); return; }
      if (R.kind === "dub") return this.dubEnd();
      if (R.mode === "free") return this.freeEnd();
      if (R.mode === "qfree") return this.qfreeEnd();
      UI.toast(`Nimmt genau ${R.N / 16} Takt${R.N > 16 ? "e" : ""} auf – lang drücken bricht ab`, 1600); return;
    }
    if (!t) return this.rec(i);
    if (!t.on) return this.toggle(i, true);
    return this.dub(i);
  },
  async node(src) {
    const c = Engine.ctx, ch = src === "form" ? 2 : 1, n = Engine.makeRec(ch), z = c.createGain(); z.gain.value = 0;
    if (src === "mic") this.mic.src.connect(n.input || n); else Engine.sum.connect(n.input || n);
    n.connect(z).connect(c.destination); return { n, z, ch };
  },
  async begin(R) {
    if (R.src === "mic") { if (this.micBlocked(R.i)) return false; if (!(await this.micOpen())) return false; }
    if (Engine.ctx.state !== "running") try { await Engine.ctx.resume(); } catch (_) {}
    if (this.R) return false;
    const N = await this.node(R.src); Object.assign(R, N, { chunks: [], rt0: null, lv: 0, sr: Engine.ctx.sampleRate });
    R.n.port.onmessage = e => { const d = e.data; if (d.t === "t0") R.rt0 = d.v; else if (d.t === "chunk") R.chunks.push(d.d); else if (d.t === "lvl") R.lv = d.v; else if (d.t === "end" && R.done) R.done(); };
    R.n.port.postMessage({ on: true, ch: R.ch }); R.at = Engine.now();
    this.R = R; return true;
  },
  async collect(R) {
    const end = new Promise(r => { R.done = r; setTimeout(r, 800); }); try { R.n.port.postMessage({ on: false }); } catch (_) {} await end;
    try { if (R.src === "mic" && this.mic) this.mic.src.disconnect(R.n.input || R.n); else Engine.sum.disconnect(R.n.input || R.n); } catch (_) {} try { R.n.disconnect(); } catch (_) {}
    const total = R.chunks.reduce((a, c) => a + c[0].length, 0), x = []; for (let c = 0; c < R.ch; c++) x.push(new Float32Array(total));
    let o = 0; for (const ck of R.chunks) { for (let c = 0; c < R.ch; c++) x[c].set(ck[Math.min(c, ck.length - 1)], o); o += ck[0].length; }
    return x;
  },
  // Ausschnitt [t0, t0 + n Samples) aus der Aufnahme (Zeit = Graph-Zeit des Eingangs), Ränder weich
  cut(x, R, tA, n) {
    const i0 = Math.round((tA - (R.rt0 ?? R.at)) * R.sr), out = x.map(() => new Float32Array(n));
    for (let c = 0; c < x.length; c++) { const s = x[c], d = out[c]; for (let k = 0; k < n; k++) { const j = i0 + k; d[k] = j >= 0 && j < s.length ? s[j] : 0; } }
    const fd = Math.min(160, n >> 4); for (const d of out) for (let k = 0; k < fd; k++) { d[k] *= k / fd; d[n - 1 - k] *= k / fd; }
    return out;
  },
  peak(chs) { let p = 0; for (const d of chs) for (let k = 0; k < d.length; k += 3) { const v = Math.abs(d[k]); if (v > p) p = v; } return p; },
  async rec(i, src) {
    src = src || this.src; const R = { i, kind: "rec", src };
    const was = Transport.running;
    if (!this.L && !this.len && !was) R.mode = "free";
    else if (!this.L && !this.len) R.mode = "qfree";
    else R.mode = "fix";
    if (!(await this.begin(R))) return;
    R.lat = src === "mic" ? this.mic.inLat + (R.mode === "free" ? 0.015 : this.outLat()) : 0;
    if (R.mode === "free") { R.T = Engine.now(); MicLog.add(`Loopstation: Spur ${i + 1} frei · Quelle ${src}`); }
    else {
      if (!Transport.running) { LoopCtl.release && LoopCtl.release(); Transport.start(); R.S = 16; R.click = true; }
      else R.S = this.nextBar();
      if (R.mode === "fix") R.N = this.L || this.len * 16;
      MicLog.add(`Loopstation: Spur ${i + 1} ${R.mode === "fix" ? R.N / 16 + " Takte" : "frei im Takt"} ab Takt ${R.S / 16 + 1} · Quelle ${src}`);
    }
    Hap(12); this.after(R);
  },
  after(R) {
    clearInterval(this.pt); this.pt = setInterval(() => this.pill(), 100); this.pill(); this.sync();
    if (R.src === "form" && UI.tab === "loop") { UI.setTab("klang"); UI.toast("Spiel jetzt die Formen – die rote Leiste oben beendet die Aufnahme", 2600); }
  },
  recStep(R, step, time) {
    if (R.kind !== "rec" || R.mode === "free" || R.S == null) return;
    if (R.click && step < R.S && step % 4 === 0 && step >= R.S - 16) { try { Metro.click(time, step % 16 === 0); } catch (_) {} }
    if (R.N && step === R.S + R.N && !R.ending) { R.ending = true; const wait = Math.max(0.05, time - Engine.now()) + R.lat + 0.12; setTimeout(() => this.finish(), wait * 1000); }
  },
  freeEnd() {
    const R = this.R; if (!R || R.ending) return; const now = Engine.now(), D = now - R.T;
    if (D < 0.5) { UI.toast("Zu kurz – mindestens eine halbe Sekunde", 1600); return; }
    R.ending = true; const { n, bpm } = this.fitBars(D); R.N = n * 16; R.bpm = bpm; R.D = D;
    // Tempo aus der Länge, Takt beginnt genau jetzt (der Loop schließt nahtlos an)
    Music.setTempo(bpm); if (Transport.running) Transport.stop();
    LoopCtl.release && LoopCtl.release(); Transport.start(); Transport.t0 = Transport.nextT = now + 0.004;
    MicLog.add(`Loopstation: frei ${D.toFixed(2)} s → ${n} Takt${n > 1 ? "e" : ""} · ${bpm.toFixed(1)} BPM`);
    setTimeout(() => this.finish(), (R.lat + 0.12) * 1000);
  },
  qfreeEnd() {
    const R = this.R; if (!R || R.ending) return;
    const sf = (Engine.now() - Transport.t0) / Transport.spb; if (sf < R.S + 2) { this.cancel(); UI.toast("Abgebrochen – die Aufnahme hatte noch nicht begonnen", 1600); return; }
    const bars = Math.max(1, Math.round((sf - R.S) / 16)); R.N = bars * 16;
    if (R.S + R.N <= Transport.step) { R.ending = true; const wait = Math.max(0, this.tStep(R.S + R.N) - Engine.now()) + R.lat + 0.12; setTimeout(() => this.finish(), wait * 1000); }
    UI.toast(`Loop: ${bars} Takt${bars > 1 ? "e" : ""}`, 1200); this.pill();
  },
  async finish() {
    const R = this.R; if (!R || R.kind !== "rec" || R.fin) return; R.fin = true;
    const x = await this.collect(R); this.R = null; clearInterval(this.pt); this.pillEl(null);
    if (UI.tab !== "loop") this.micIdle();
    let chs, bpm;
    if (R.mode === "free") { const n = Math.round(R.D * R.sr); chs = this.cut(x, R, R.T + R.lat, n); bpm = R.bpm; }
    else { const n = Math.round(R.N * Transport.spb * R.sr); chs = this.cut(x, R, this.tStep(R.S) + R.lat, n); bpm = Music.tempo(); }
    const pk = this.peak(chs); MicLog.add(`Loopstation: ${(chs[0].length / R.sr).toFixed(2)} s · Spitze ${Math.round(pk * 100)} %`);
    if (pk < 0.003) { UI.toastAct(R.src === "mic" ? "In der Aufnahme war es still – ist das richtige Mikrofon gewählt?" : "Die Formen waren still – erst spielen, dann aufnehmen", "Prüfen", () => R.src === "mic" ? MicFix.sheet() : null, 4200); if (R.mode === "free" && !this.any()) { this.L = 0; } this.sync(); return; }
    await this.put(R.i, chs, R.sr, bpm, R.N, R.src);
    if (R.src === "form") UI.toastAct(`🔁 Spur ${R.i + 1} loopt die Passage – Formen weiterspielen oder anhalten`, "Formen anhalten", () => { Motion.halt(); LoopCtl.pause && !LoopCtl.paused && LoopCtl.any() && LoopCtl.pause(true); }, 5200);
  },
  async put(i, chs, sr, bpm, N, src) {
    if (!Projects.cur) return; Undo.push();
    const name = `Spur ${i + 1}`, r = await Recs.add(chs, sr, `Loop ${name} · ${SetCap.stamp()}`, "loopstation");
    const b = Engine.ctx.createBuffer(chs.length, chs[0].length, sr); chs.forEach((c, k) => b.copyToChannel(c, k)); this.bufs.set(r.id, b);
    if (!this.L) this.L = N;
    this.slots[i] = { id: uid("ls"), rec: r.id, prev: null, name, vol: 1, on: true, bpm, ch: chs.length, src, pend: true };
    if (!Transport.running) Transport.start();
    Save.soon(); this.sync(); Hap(10);
  },
  cancel(silent) {
    const R = this.R; if (!R) return; this.R = null; clearInterval(this.pt); this.pillEl(null);
    try { R.n.port.postMessage({ on: false }); } catch (_) {} try { if (R.src === "mic" && this.mic) this.mic.src.disconnect(R.n.input || R.n); else Engine.sum.disconnect(R.n.input || R.n); R.n.disconnect(); } catch (_) {}
    if (!silent) UI.toast("Aufnahme abgebrochen", 1200); this.sync();
  },
  // ---------- Overdub: dazu aufnehmen, während die Spur läuft ----------
  async dub(i, src) {
    const t = this.slots[i]; if (!t || !this.L) return; if (!Transport.running) { t.on = true; t.pend = true; Transport.start(); }
    const R = { i, kind: "dub", src: src || this.src }; if (!(await this.begin(R))) return;
    R.lat = R.src === "mic" ? this.mic.inLat + this.outLat() : 0; R.tA = Engine.now();
    MicLog.add(`Loopstation: Overdub Spur ${i + 1} · ${R.src}`); Hap(10); this.after(R);
  },
  // Stelle im Loop-Puffer (0 … N) für eine Zeit x (Takt-Zeit)
  dubIdx(x, N) { const L = this.L, sf = (x - Transport.t0) / Transport.spb, ph = ((sf % L) + L) % L; return Math.min(N - 1, Math.floor(ph / L * N)); },
  async dubEnd() {
    const R = this.R; if (!R || R.kind !== "dub" || R.fin) return; R.fin = true; R.tB = Engine.now();
    await new Promise(r => setTimeout(r, (R.lat + 0.08) * 1000));
    const x = await this.collect(R); this.R = null; clearInterval(this.pt); this.pillEl(null); if (UI.tab !== "loop") this.micIdle();
    const t = this.slots[R.i], b = t && this.bufs.get(t.rec); if (!t || !b) { this.sync(); return; }
    const N = b.length, out = []; for (let c = 0; c < b.numberOfChannels; c++) out.push(new Float32Array(b.getChannelData(c)));
    const base = R.rt0 ?? R.at, kA = Math.max(0, Math.round((R.tA + R.lat - base) * R.sr)), kB = Math.min(x[0].length, Math.round((R.tB + R.lat - base) * R.sr));
    if (kB - kA < R.sr * 0.15) { UI.toast("Overdub zu kurz – nichts geändert", 1400); this.sync(); return; }
    const fd = Math.min(480, (kB - kA) >> 3); let pk = 0;
    for (let k = kA; k < kB; k++) { const idx = this.dubIdx(base + k / R.sr - R.lat, N), g = Math.min(1, (k - kA) / fd, (kB - 1 - k) / fd);
      for (let c = 0; c < out.length; c++) { const v = x[Math.min(c, x.length - 1)][k] * g; out[c][idx] += v; if (Math.abs(v) > pk) pk = Math.abs(v); } }
    if (pk < 0.003) { UI.toast("Im Overdub war es still – nichts geändert", 1600); this.sync(); return; }
    for (const d of out) for (let k = 0; k < N; k++) { const v = d[k]; if (v > 0.95 || v < -0.95) d[k] = Math.sign(v) * (0.95 + 0.05 * Math.tanh((Math.abs(v) - 0.95) * 8)); }
    Undo.push(); const r = await Recs.add(out, b.sampleRate, `Loop ${t.name} · Overdub · ${SetCap.stamp()}`, "loopstation");
    const nb = Engine.ctx.createBuffer(out.length, N, b.sampleRate); out.forEach((c, k) => nb.copyToChannel(c, k)); this.bufs.set(r.id, nb);
    if (t.prev && t.prev !== t.rec) { const old = t.prev; setTimeout(() => this.dropRec(old), 500); }
    t.prev = t.rec; t.rec = r.id; t.pend = true; Save.soon(); this.sync();
    UI.toastAct(`✚ Overdub auf ${t.name}`, "Zurücknehmen", () => this.undoDub(R.i), 4200);
  },
  undoDub(i) { const t = this.slots[i]; if (!t || !t.prev) return; const cur = t.rec; t.rec = t.prev; t.prev = null; t.pend = true; Hap(8); setTimeout(() => this.dropRec(cur), 600); Save.soon(); this.sync(); UI.toast(`${t.name}: letzter Overdub zurückgenommen`, 1500); },
  // Aufnahme löschen, wenn keine Spur (auch nicht als Rückgängig-Stand) sie mehr braucht
  async dropRec(id) { if (!id || this.slots.some(t => t && (t.rec === id || t.prev === id))) return; this.bufs.delete(id); try { await Recs.remove(id); } catch (_) {} },
  clear(i) {
    const t = this.slots[i]; if (!t) return; Undo.push(); this.stopT(t, Engine.now(), true); this.slots[i] = null; Hap(10);
    if (!this.any()) this.L = 0; Save.soon(); this.sync();
    UI.toastAct(`${t.name} geleert`, "Rückgängig", () => Undo.undo(), 5000);
  },
  clearAll() { if (!this.any()) return; Undo.push(); this.stopAll(); this.slots = this.slots.map(() => null); this.L = 0; Save.soon(); this.sync(); UI.toastAct("Loopstation geleert", "Rückgängig", () => Undo.undo(), 5000); },
  // Loop verdoppeln: jede Spur zweimal hintereinander – danach sind doppelt lange Spuren möglich
  double() {
    if (!this.L || this.L * 2 > 16 * 32) return; Undo.push();
    const jobs = this.slots.map(async t => { if (!t) return; const b = this.bufs.get(t.rec) || await this.buf(t); if (!b) return; const out = [];
      for (let c = 0; c < b.numberOfChannels; c++) { const d = b.getChannelData(c), y = new Float32Array(d.length * 2); y.set(d); y.set(d, d.length); out.push(y); }
      const r = await Recs.add(out, b.sampleRate, `Loop ${t.name} · ×2`, "loopstation"); const nb = Engine.ctx.createBuffer(out.length, out[0].length, b.sampleRate); out.forEach((c, k) => nb.copyToChannel(c, k)); this.bufs.set(r.id, nb); t.prev = null; t.rec = r.id; t.pend = true; });
    Promise.all(jobs).then(() => { this.L *= 2; Save.soon(); this.sync(); UI.toast(`Loop ist jetzt ${this.L / 16} Takte lang`, 1600); });
  },
  addSlot() { if (this.slots.length < this.MAXN) { this.slots.push(null); Save.soon(); this.sync(); } },
  // ---------- ohne Mikrofon: Aufnahme-App oder Datei als Loop ----------
  importPick(i, capture) {
    let el = $("lsIn"); if (!el) { el = document.createElement("input"); el.type = "file"; el.id = "lsIn"; el.accept = "audio/*"; el.hidden = true; document.body.appendChild(el);
      el.addEventListener("change", async () => { const f = el.files && el.files[0]; el.value = ""; if (f) this.importFile(this._ii ?? 0, f); }); }
    this._ii = i; if (capture) el.setAttribute("capture", ""); else el.removeAttribute("capture"); el.click();
  },
  async importFile(i, file) {
    if (!Engine.ctx) return;
    try { const ab = await AudioIn.decodeFile(file), sr = ab.sampleRate, ch = Math.min(2, ab.numberOfChannels), x = []; for (let c = 0; c < ch; c++) x.push(ab.getChannelData(c));
      let a = 0; const thr = 0.02; while (a < ab.length && Math.abs(x[0][a]) < thr) a++; a = Math.max(0, a - Math.round(sr * 0.01));
      let e = ab.length; while (e > a + sr * 0.3 && Math.abs(x[0][e - 1]) < 0.004) e--;
      let n, bpm, N;
      if (!this.L) { const D = Math.min(40, (e - a) / sr), fb = this.fitBars(D); n = Math.round(D * sr); bpm = fb.bpm; N = fb.n * 16; Music.setTempo(bpm); }
      else { N = this.L; bpm = Music.tempo(); n = Math.round(N * 15 / bpm * sr); }
      const chs = x.map(d => { const y = new Float32Array(n); y.set(d.subarray(a, Math.min(d.length, a + n))); return y; });
      const fd = Math.min(160, n >> 4); for (const d of chs) for (let k = 0; k < fd; k++) { d[k] *= k / fd; d[n - 1 - k] *= k / fd; }
      if (this.peak(chs) < 0.003) { UI.toast("In der Datei war nichts zu hören", 1800); return; }
      if (Transport.running) Transport.stop();
      await this.put(i, chs, sr, bpm, N, "mic"); UI.toast(`🔁 Spur ${i + 1}: Aufnahme als Loop (${N / 16} Takt${N > 16 ? "e" : ""})`, 2400); }
    catch (err) { UI.toast("Diese Datei kann der Browser nicht lesen – M4A, MP3 oder WAV", 3000); }
  },
  // ---------- Anzeige ----------
  state(i) {
    const R = this.R, t = this.slots[i];
    if (R && R.i === i) { if (R.kind === "dub") return "dub"; if (R.mode !== "free" && R.S != null && this.tStep(R.S) > Engine.now()) return "arm"; return "rec"; }
    if (!t) return "leer"; if (t.missing) return "fehlt"; return t.on && Transport.running ? "play" : "stop";
  },
  phase() { if (!this.L || !Transport.running) return 0; const sf = (Engine.now() - Transport.t0) / Transport.spb; return (((sf % this.L) + this.L) % this.L) / this.L; },
  label(i) {
    const st = this.state(i), R = this.R, t = this.slots[i], bars = this.L / 16, sx = this.src === "form" ? "🎛" : "🎤";
    if (st === "arm") { const left = this.tStep(R.S) - Engine.now(); return ["Einzählen …", `${Math.max(1, Math.ceil(left / (Transport.spb * 4) - 0.08))} – gleich ${R.src === "form" ? "spielen" : "loslegen"}`]; }
    if (st === "rec") { if (R.mode === "free") return ["● Aufnahme", "tippen = Loop schließen"]; if (R.mode === "qfree" && !R.ending) return ["● Aufnahme", "tippen = Ende (zur nächsten Eins)"]; const b = Math.min(R.N / 16, Math.floor(((Engine.now() - this.tStep(R.S)) / Transport.spb) / 16) + 1); return ["● Aufnahme", `Takt ${Math.max(1, b)}/${R.N / 16}`]; }
    if (st === "dub") return ["✚ Overdub", "tippen = fertig"];
    if (st === "play") return ["▶ läuft", "tippen = dazu aufnehmen"];
    if (st === "stop") return ["⏸ gestoppt", "tippen = spielen"];
    if (st === "fehlt") return ["Aufnahme fehlt", "lang drücken = leeren"];
    if (this.L) return [`● ${sx} Aufnehmen`, `${bars} Takt${bars > 1 ? "e" : ""} · ab der nächsten Eins`];
    if (this.len) return [`● ${sx} Aufnehmen`, `${this.len} Takt${this.len > 1 ? "e" : ""} · 1 Takt Einzählen`];
    return [`● ${sx} Aufnehmen`, Transport.running ? "tippen = Start · nochmal = Ende" : "tippen = Start · nochmal = Ende → Tempo"];
  },
  tip() {
    if (this.R) return this.R.kind === "dub" ? "Overdub läuft – was du jetzt machst, kommt auf die Spur. Nochmal tippen = fertig." : "Aufnahme läuft …";
    if (!this.any() && !this.len && Transport.running) return `Musik läuft (${Math.round(Music.tempo())} BPM): der erste Loop beginnt zur nächsten Eins und endet an der Eins, die deinem zweiten Tippen am nächsten ist. <button class="btn" data-ls="stopm">■ Musik stoppen</button> – dann bestimmt die Länge des Loops das Tempo.`;
    if (!this.any()) return this.len ? `Feste Länge: tippe ein Feld, nach einem Takt Einzählen nimmst du genau ${this.len} Takt${this.len > 1 ? "e" : ""} auf.` : "Tippe ein Feld und mach ein Geräusch, sing oder spiel – tippe nochmal, wenn der Loop rund ist. Seine Länge bestimmt das Tempo.";
    return "Feld tippen: leer = aufnehmen · läuft = dazu aufnehmen (Overdub) · gestoppt = spielen. Lang drücken = leeren.";
  },
  el() { return $("vLoop"); },
  render() {
    const el = this.el(); if (!el || UI.tab !== "loop") return;
    const L = this.L, bars = L / 16, why = this.why(), anyOn = this.slots.some(t => t && t.on) && Transport.running;
    const pads = this.slots.map((t, i) => { const st = this.state(i), [a, b] = this.label(i), c = ["#E07A68", "#86D3C0", "#EDB46A", "#9AA7F0", "#C79BE8", "#8FDCA5"][i % 6];
      return `<div class="lqpad st-${st}" style="--c:${c}"><button class="lqbig" data-ls="tap" data-i="${i}" aria-label="Spur ${i + 1}: ${esc(a)} – ${esc(b)}"><span class="lqno">${i + 1}${t && t.src === "form" ? " 🎛" : t ? " 🎤" : ""}</span><b>${a}</b><small>${b}</small><i class="lqprog"></i><i class="lqlv"></i></button>
        ${t ? `<div class="lsrow"><button data-ls="play" data-i="${i}" aria-label="${t.on ? "Spur stoppen" : "Spur spielen"}">${t.on && Transport.running ? "■" : "▶"}</button><button data-ls="undo" data-i="${i}" aria-label="Letzten Overdub zurücknehmen"${t.prev ? "" : " disabled"}>↶</button><input type="range" data-ls="vol" data-i="${i}" min="0" max="1.5" step="0.05" value="${t.vol}" aria-label="Lautstärke Spur ${i + 1}"><button data-ls="del" data-i="${i}" class="del" aria-label="Spur ${i + 1} leeren">✕</button></div>` : `<div class="lsrow lqemp"><span>leer</span></div>`}</div>`; }).join("");
    const fl = Forms.list.filter(f => Loops.count(f));
    el.innerHTML = `<div class="vsec lqv">
      <div class="vhead"><h2>Loopstation</h2><span class="lqinfo">${L ? `${bars} Takt${bars > 1 ? "e" : ""} · ${Math.round(Music.tempo())} BPM` : `${Math.round(Music.tempo())} BPM · noch leer`}</span></div>
      <div class="lqbar" aria-hidden="true"><i id="lsPh"></i></div>
      <p class="lqtip">${this.tip()}</p>
      ${why ? `<div class="lqwarn"><p>${esc(MicFix.TXT[why] || "Das Mikrofon ist hier gesperrt.")}</p><div class="row"><button class="btn primary" data-ls="micfix">🎤 Mikrofon freischalten</button><button class="btn" data-ls="file">Aufnahme-App / Datei</button></div></div>` : ""}
      <div class="lqopt"><div class="seg2" role="group" aria-label="Was wird aufgenommen?"><button data-ls="src" data-v="mic" aria-pressed="${this.src === "mic"}">🎤 Mikrofon</button><button data-ls="src" data-v="form" aria-pressed="${this.src === "form"}">🎛 Formen</button></div>
        <div class="lqlen" role="group" aria-label="Länge">${L ? `<span class="lql">Länge <b>${bars} Takt${bars > 1 ? "e" : ""}</b></span><button class="npc" data-ls="x2"${L * 2 > 512 ? " disabled" : ""}>×2 länger</button>` : [0, 1, 2, 4, 8].map(n => `<button class="npc" data-ls="len" data-v="${n}" aria-pressed="${this.len === n}">${n ? n + " T." : "Frei"}</button>`).join("")}</div></div>
      <div class="lqpads">${pads}${this.slots.length < this.MAXN ? `<button class="lqadd" data-ls="add" aria-label="Weitere Spur">＋ Spur</button>` : ""}</div>
      <div class="row lqall"><button class="btn primary" data-ls="all"${this.any() ? "" : " disabled"}>${anyOn ? "■ Alle stoppen" : "▶ Alle spielen"}</button><button class="btn" data-ls="clear"${this.any() ? "" : " disabled"}>Alles leeren</button><button class="btn" data-ls="file2">Datei als Spur …</button></div>
      <label class="lqph"><input type="checkbox" data-ls="phones" ${Sing.phones ? "checked" : ""}> 🎧 Mit Kopfhörern (bester Klang). Ohne Kopfhörer filtert der Browser die Loops aus dem Mikrofon.</label>
      <div class="lqfl"><div class="vhead"><h3>Form-Loops (gespielte Töne)</h3><button class="btn" data-ls="station">Verwalten</button></div>
        ${fl.length ? fl.map(f => `<div class="lqfr"><i style="background:${colOf(f)}"></i><b>${esc(f.name)}</b><small>${Loops.count(f)} Loop${Loops.count(f) > 1 ? "s" : ""}</small><button class="npc" data-ls="fhold" data-f="${f.id}" aria-pressed="${!LoopHold.is(f)}">${LoopHold.is(f) ? "▶ einsetzen" : "⏸ aussetzen"}</button></div>`).join("") : `<p class="cueno">Noch keine. Auf einer Form „● Loop“ nimmt die gespielten Töne auf – sie bleiben veränderbar. Hier oben „🎛 Formen“ nimmt dagegen den Klang der Formen als Audio auf.</p>`}</div>
    </div>`;
    this._sig = this.sig(); this.anim();
  },
  sig() { return this.slots.map((t, i) => this.state(i) + this.label(i).join("|")).join(";") + (this.R ? this.R.mode + (this.R.ending ? 1 : 0) : "") + this.L + Transport.running; },
  anim() {
    clearInterval(this.at); if (UI.tab !== "loop") return;
    this.at = setInterval(() => {
      if (UI.tab !== "loop") { clearInterval(this.at); return; }
      const el = this.el(); if (!el) return; if (this.sig() !== this._sig && !this.vdrag) { this.render(); return; }
      const ph = this.phase(), b = $("lsPh"); if (b) b.style.width = (ph * 100).toFixed(1) + "%";
      el.querySelectorAll(".lqpad").forEach((p, i) => { const st = this.state(i), pr = p.querySelector(".lqprog"), lv = p.querySelector(".lqlv");
        if (pr) pr.style.setProperty("--p", st === "play" || st === "dub" ? ph.toFixed(3) : st === "rec" && this.R && this.R.N && this.R.S != null ? clamp((Engine.now() - this.tStep(this.R.S)) / (this.R.N * Transport.spb), 0, 1).toFixed(3) : "0");
        if (lv) lv.style.setProperty("--lv", this.R && this.R.i === i ? Math.min(1, this.R.lv * 2.2).toFixed(2) : "0"); });
    }, 70);
  },
  sync() { try { if (UI.tab === "loop") this.render(); KSheet.sync && KSheet.sync(true); } catch (e) { console.warn(e); } },
  pillEl(h) { let p = $("lsPill"); if (!h) { if (p) p.remove(); return; } if (!p) { p = document.createElement("button"); p.id = "lsPill"; p.className = "singpill lqpill"; document.body.appendChild(p); p.onclick = () => { Hap(8); if (this.R) this.tap(this.R.i); }; } if (p._h !== h) { p._h = h; p.innerHTML = h; } return p; },
  pill() {
    const R = this.R; if (!R) { this.pillEl(null); return; }
    if (UI.tab === "loop") { this.pillEl(null); return; }
    const [a, b] = this.label(R.i), p = this.pillEl(`<b>🔁 Spur ${R.i + 1} · ${a}</b><small>${b}</small><i style="--lv:${Math.min(1, R.lv * 2.2).toFixed(2)}"></i>`);
    if (p) p.classList.toggle("cnt", this.state(R.i) === "arm");
  },
  chip() { const n = this.count(), r = !!this.R; if (!n && !r) return ""; return `<button class="kchip${r ? " on" : ""}" data-lsc="1" aria-label="Loopstation${n ? ` (${n} Spuren)` : ""}" title="Loopstation">🔁${n ? `<b>${n}</b>` : ""}</button>`; },
  // ---------- Bedienung ----------
  click(e) {
    const b = e.target.closest("[data-ls]"); if (!b || b.disabled) return; const k = b.dataset.ls, i = +b.dataset.i;
    if (k === "tap") { if (this._lp) { this._lp = false; return; } Hap(10); this.tap(i); return; }
    if (k === "play") return this.toggle(i);
    if (k === "undo") return this.undoDub(i);
    if (k === "del") return this.clear(i);
    if (k === "vol") return;
    Hap(6);
    if (k === "src") { this.src = b.dataset.v; store.set("lsSrc", this.src); this.render(); if (this.src === "mic" && !this.why()) this.micOpen(); return; }
    if (k === "len") { this.len = +b.dataset.v; store.set("lsLen", this.len); this.render(); return; }
    if (k === "x2") return this.double();
    if (k === "stopm") { Transport.stop(); this.render(); return; }
    if (k === "add") return this.addSlot();
    if (k === "all") return this.allToggle();
    if (k === "clear") return this.clearAll();
    if (k === "micfix") { this.micBlocked(this.free()); return; }
    if (k === "file") return this.importPick(this.free(), true);
    if (k === "file2") return this.importPick(this.free(), false);
    if (k === "station") return Looper.open(Forms.active);
    if (k === "fhold") { const f = Forms.list.find(x => x.id === b.dataset.f); if (f) { LoopHold.toggle(f); setTimeout(() => this.render(), 50); } return; }
  },
  free() { const i = this.slots.findIndex(t => !t); return i < 0 ? 0 : i; },
  bind() {
    const el = this.el(); if (!el || el._ls) return; el._ls = true;
    el.addEventListener("click", e => this.click(e));
    el.addEventListener("input", e => { const r = e.target; if (r.dataset.ls === "vol") { const t = this.slots[+r.dataset.i]; if (t) this.setVol(t, +r.value); } });
    el.addEventListener("change", e => { const r = e.target; if (r.dataset.ls === "vol") { this.vdrag = false; Save.soon(); } if (r.dataset.ls === "phones") { Sing.phones = r.checked; store.set("singPhones", Sing.phones); this.micClose(); UI.toast(r.checked ? "Mit Kopfhörern: Mikrofon ohne Filter" : "Ohne Kopfhörer: der Browser filtert die Loops aus dem Mikrofon", 2000); } });
    el.addEventListener("pointerdown", e => { const r = e.target; if (r.dataset && r.dataset.ls === "vol") { this.vdrag = true; return; }
      const b = e.target.closest('[data-ls="tap"]'); if (!b) return; const i = +b.dataset.i; clearTimeout(this.lpT); this._lp = false;
      this.lpT = setTimeout(() => { if (this.R && this.R.i === i) { this._lp = true; Hap(14); this.cancel(); return; } if (this.slots[i]) { this._lp = true; this.clear(i); } }, 650); });
    const up = () => { clearTimeout(this.lpT); }; el.addEventListener("pointerup", up); el.addEventListener("pointercancel", up); el.addEventListener("pointerleave", up);
  }
};
// Ein Bereich „Loop“ neben Klang
{ const t = $("tLoop"); if (t) t.onclick = () => UI.setTab("loop"); }
{ const st = UI.setTab.bind(UI); UI.setTab = function (t) {
  const r = st(t); try { const on = t === "loop", v = $("vLoop"), b = $("tLoop"); if (v) v.hidden = !on; if (b) b.setAttribute("aria-current", on ? "page" : "false");
    if (on) { LoopSt.bind(); LoopSt.render(); LoopSt.preload(); if (LoopSt.src === "mic" && !LoopSt.why() && Engine.ctx && store.get("lsMicOk")) LoopSt.micOpen(); LoopSt.pill(); } else { LoopSt.micIdle(); LoopSt.pill(); } } catch (e) { console.warn(e); }
  return r; }; }
{ const tg = CtxHelp.target.bind(CtxHelp); CtxHelp.target = function () { if (UI.tab === "loop") return document.querySelector("#vLoop .vhead"); return tg(); }; CtxHelp.MAP.loop = "loopst"; }
// Takt, Stopp, Speichern, Laden
{ const os = Transport.onStep.bind(Transport); Transport.onStep = function (step, time) { try { LoopSt.onStep(step, time); } catch (e) { console.warn(e); } return os(step, time); }; }
{ const sp = Transport.stop.bind(Transport); Transport.stop = function () { const r = sp(); try { LoopSt.stopAll(); const R = LoopSt.R; if (R && R.mode !== "free" && !R.fin) { if (R.kind === "dub") LoopSt.dubEnd(); else if (!R.ending) LoopSt.cancel(); } LoopSt.sync(); } catch (e) { console.warn(e); } return r; }; }
{ const st0 = Transport.start.bind(Transport); Transport.start = function () { const r = st0(); try { if (UI.tab === "loop") LoopSt.render(); } catch (_) {} return r; }; }
{ const pd = Project.data.bind(Project); Project.data = function (mem) { const d = pd(mem); try { d.ls = LoopSt.data(); } catch (_) {} return d; }; }
{ const pl = Project.load.bind(Project); Project.load = function (d, mem) { const r = pl(d, mem); try { LoopSt.load(d && d.ls); } catch (e) { console.warn(e); } return r; }; }
{ const rm = MicWin.remap; MicWin.remap = function (data, idm) { rm.call(this, data, idm); try { if (data && data.ls) for (const t of data.ls.slots || []) if (t) { if (idm.has(t.rec)) t.rec = idm.get(t.rec); if (t.prev && idm.has(t.prev)) t.prev = idm.get(t.prev); } } catch (_) {} }; }
{ const ra = RecGuard.active.bind(RecGuard); RecGuard.active = function () { return ra() || !!LoopSt.R; }; }
// Mikrofon einmal erlaubt → beim nächsten Öffnen der Loopstation gleich bereit
{ const mo = LoopSt.micOpen.bind(LoopSt); LoopSt.micOpen = async function () { const ok = await mo(); if (ok) store.set("lsMicOk", true); return ok; }; }
// Chip im Steuerfeld (Klang): 🔁 n – führt zur Loopstation bzw. beendet die laufende Aufnahme
{ const ht = KSheet.html; KSheet.html = function () { let h = ht.call(this); if (FBar.mode() || !h.includes('<span class="kschips">')) return h; return h.replace('<span class="kschips">', '<span class="kschips">' + LoopSt.chip()); }; }
document.addEventListener("click", e => { const b = e.target.closest && e.target.closest("[data-lsc]"); if (!b) return; e.stopPropagation(); e.preventDefault(); Hap(6); if (LoopSt.R && LoopSt.R.src === "form") LoopSt.tap(LoopSt.R.i); else UI.setTab("loop"); }, true);
// Steuerfeld „Loops“ einer Form: gespielte Passage als Audio in die Loopstation
{ const r0 = FBar.rows.bind(FBar); FBar.rows = function (f) { let h = r0(f); try { if (this.cat === "loops" && !this.mode() && f && !f.empty && !h.includes('data-fb="lsform"')) h = h.replace(/<\/div>\s*$/, `${this.B("lsform", "🔁", LoopSt.R && LoopSt.R.src === "form" ? "Passage fertig" : "Passage → Loopstation", { p: !!(LoopSt.R && LoopSt.R.src === "form"), a: "Was die Formen spielen, als Audio-Loop in die Loopstation aufnehmen" })}</div>`); } catch (e) { console.warn(e); } return h; }; }
{ const ck = FBar.click.bind(FBar); FBar.click = function (e) { const b = e.target.closest && e.target.closest('[data-fb="lsform"]'); if (b) { Hap(8); const R = LoopSt.R; if (R && R.src === "form") LoopSt.tap(R.i); else if (R) UI.toast("Die Loopstation nimmt gerade auf", 1400); else { const i = LoopSt.free(); if (LoopSt.slots[i]) { UI.toast("Alle Spuren belegt – in der Loopstation eine leeren", 1800); return; } LoopSt.rec(i, "form").then(() => { if (LoopSt.R) UI.toast(LoopSt.R.mode === "free" ? "🔁 Aufnahme läuft – spiel die Passage, dann „Passage fertig“" : "🔁 Aufnahme ab der nächsten Eins", 2200); }); } return; } return ck(e); }; }
// Befehl im Kreis-Menü
Cmd.L.tLoop = { g: "mehr", ic: () => '<svg viewBox="0 0 24 24"><path d="M4 12a6 6 0 0 1 6-6h8l-3-3M20 12a6 6 0 0 1-6 6H6l3 3"/></svg>', n: () => "Loopstation", run: () => UI.setTab("loop") };
{ const g = Cmd.GROUPS.find(x => x[0] === "mehr"); if (g && !g[3].includes("tLoop")) { if (g[3].length < 8) g[3].unshift("tLoop"); } }
// Hilfe
Help.T.push({ id: "loopst", ic: "🔁", t: "Loopstation: Geräusche, Stimme und Form-Passagen loopen", k: "loopstation looper loop aufnehmen overdub geräusch stimme beatbox gitarre mikrofon spur passage formen audio tempo", h: `<ul>
  <li>Unten <b>Loop</b> öffnet die Loopstation: 4 Felder (bis 6 mit „＋ Spur“), jedes eine Spur.</li>
  <li><b>Quelle</b>: <b>🎤 Mikrofon</b> nimmt Geräusche, Stimme, Beatbox oder ein echtes Instrument auf. <b>🎛 Formen</b> nimmt auf, was die Formen gerade spielen – KLANGRAUM wechselt dafür zu den Formen, oben zeigt eine rote Leiste die Aufnahme (antippen = fertig). Auch im Steuerfeld einer Form unter <b>Loops → 🔁 Passage → Loopstation</b>.</li>
  <li><b>Erster Loop „Frei“</b>: Feld tippen – sofort aufnehmen – nochmal tippen, wenn der Loop rund ist. Seine Länge bestimmt das Tempo (1, 2, 4 oder 8 Takte, möglichst 70–150 BPM); alles andere läuft danach in diesem Takt. Läuft schon Musik, beginnt die Aufnahme zur nächsten Eins und endet an der Eins, die deinem Tippen am nächsten ist.</li>
  <li><b>Feste Länge</b> (1 · 2 · 4 · 8 Takte): ein Takt Einzählen, dann genau so lange.</li>
  <li>Spur <b>läuft</b> → Feld tippen = <b>Overdub</b> (dazu aufnehmen, auch über mehrere Runden), nochmal tippen = fertig; „↶“ nimmt den letzten Overdub zurück. <b>■/▶</b> stoppt oder spielt die Spur im Takt. <b>Lang drücken</b> leert die Spur (Rückgängig möglich), während der Aufnahme bricht es ab.</li>
  <li><b>×2 länger</b> verdoppelt den Loop – danach haben neue Spuren doppelt so viel Platz. Tempo ändern spielt die Loops schneller/langsamer (wie ein Band).</li>
  <li><b>🎧 Kopfhörer</b> geben den besten Klang. Ohne Kopfhörer filtert der Browser die Loops aus dem Mikrofon, damit sie sich nicht doppeln.</li>
  <li>Gesperrtes Mikrofon (in der Claude-App, als Datei auf dem Handy): „🎤 Mikrofon freischalten“ öffnet KLANGRAUM im eigenen Fenster bzw. über den sicheren Link; oder „Aufnahme-App / Datei“ – die Aufnahme wird zum Loop.</li>
  <li>Die <b>Form-Loops</b> (gespielte Töne, die veränderbar bleiben) stehen unten in der Loopstation und laufen im selben Takt.</li></ul>` });
{ const c = Help.CATS.find(x => /Aufnehm|Loop|Aufnahme/i.test(x[0])) || Help.CATS[1] || Help.CATS[0]; if (c && !c[1].includes("loopst")) c[1].unshift("loopst"); }
Help.WANT.splice(0, 0, ["Geräusche aufnehmen und loopen (Loopstation)", "loopst"], ["Eine gespielte Passage der Formen loopen", "loopst"]);
{ const v = Help.T.find(x => x.id === "move"); if (v) v.h = v.h.replace(/<\/ul>\s*$/, "<li><b>Drehtempo fein</b>: Steuerfeld → Drehen hat einen Regler (0,125 bis 4 Umdrehungen je Takt); − und + ändern in kleinen Schritten (× 1,12). Gekoppelt rastet die Drehung in 12 Schritten je Verdopplung im Takt ein, der Rhythmus (Halbe … Zweiunddreißigstel) folgt der nächstliegenden Stufe.</li></ul>"); }
// Bereichs-Knopf „Loop“ leuchtet, solange die Loopstation spielt oder aufnimmt
setInterval(() => { try { const b = $("tLoop"); if (b) b.classList.toggle("live", !!LoopSt.R || LoopSt.srcs.length > 0); } catch (_) {} }, 400);
