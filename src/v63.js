/* ============================================================
   v63: PULT – Live-Bedienung für Laien (Team-Konzept: docs/KONZEPT_PULT.md)
   - Jede Form = großes Feld. Tippen = ein/aus, setzt auf der nächsten Eins ein (nie schief). Halten = nur diese hören.
   - Darunter Live-Effekte: Filter (Schieber), Echo (halten), Break (halten: nur Beats), Mitschnitt, Tempo.
   - Vier neue harte Bassbeat-Kits (Hardstyle, 808 Trap, Bass-Drop, Drum'n'Bass) + Startvorlage „Harter Bassbeat“.
   ============================================================ */

// ---------- 1) Harte Bassbeats: synthetisch (wie die Beatbox-Kits) ----------
Object.assign(BBX.SND, {
  kick_hardstyle(sr, B) { const n = Math.round(sr * 0.7), b = B.mul(B.sine(n, sr, t => 48 + 260 * Math.exp(-t * 28)), B.env(n, sr, t => Math.exp(-t * 3.2))), c = B.mul(B.filt(B.noise(n), "hp", 3000, 0.7, sr), B.env(n, sr, t => Math.exp(-t * 300)));
    return B.norm(B.filt(B.norm(B.mix(n, [b, 1], [c, 0.5]), 1, 5.5), "lp", 4500, 0.7, sr), 0.98, 1.2); },
  kick_808long(sr, B) { const n = Math.round(sr * 1.4), b = B.mul(B.sine(n, sr, t => 49 + 70 * Math.exp(-t * 20)), B.env(n, sr, t => Math.min(1, t * 400) * Math.exp(-t * 2.2))), c = B.mul(B.filt(B.noise(n), "hp", 2500, 0.7, sr), B.env(n, sr, t => Math.exp(-t * 400)));
    return B.norm(B.mix(n, [b, 1], [c, 0.25]), 0.98, 1.9); },
  kick_punch(sr, B) { const n = Math.round(sr * 0.5), a = B.mul(B.sine(n, sr, t => 52 + 150 * Math.exp(-t * 40)), B.env(n, sr, t => Math.exp(-t * 7))), s = B.mul(B.sine(n, sr, t => 44), B.env(n, sr, t => Math.min(1, t * 60) * Math.exp(-t * 4.5)));
    return B.norm(B.mix(n, [a, 1], [s, 0.6]), 0.98, 2.6); },
  kick_dnb(sr, B) { const n = Math.round(sr * 0.32), a = B.mul(B.sine(n, sr, t => 60 + 190 * Math.exp(-t * 55)), B.env(n, sr, t => Math.exp(-t * 13))), c = B.mul(B.filt(B.noise(n), "hp", 2000, 0.7, sr), B.env(n, sr, t => Math.exp(-t * 350)));
    return B.norm(B.mix(n, [a, 1], [c, 0.45]), 0.95, 2.1); },
  snare_clapbig(sr, B) { const n = Math.round(sr * 0.5), y = new Float32Array(n);
    for (const o of [0, 0.011, 0.023]) { const nz = B.filt(B.noise(n), "bp", 1250, 0.9, sr), k0 = Math.round(o * sr); for (let i = k0; i < n; i++) y[i] += nz[i] * Math.exp(-(i - k0) / sr * 110) * 0.8; }
    const tail = B.mul(B.filt(B.noise(n), "bp", 1500, 0.8, sr), B.env(n, sr, t => Math.exp(-t * 8.5)));
    return B.norm(B.mix(n, [y, 1], [tail, 0.55]), 0.88, 1.6); },
  snare_trap(sr, B) { const n = Math.round(sr * 0.26), nz = B.mul(B.filt(B.noise(n), "bp", 2600, 0.9, sr), B.env(n, sr, t => Math.exp(-t * 26))), bd = B.mul(B.sine(n, sr, t => 195), B.env(n, sr, t => Math.exp(-t * 34)));
    return B.norm(B.mix(n, [nz, 1], [bd, 0.6]), 0.85, 1.5); },
  snare_dnb(sr, B) { const n = Math.round(sr * 0.3), nz = B.mul(B.filt(B.noise(n), "hp", 1500, 0.7, sr), B.env(n, sr, t => Math.exp(-t * 21))), bd = B.mul(B.sine(n, sr, t => 180 + 60 * Math.exp(-t * 60)), B.env(n, sr, t => Math.exp(-t * 28)));
    return B.norm(B.mix(n, [nz, 1], [bd, 0.85]), 0.88, 2.2); },
  hat_hard(sr, B) { const n = Math.round(sr * 0.12), y = new Float32Array(n); for (const f of [3150, 4380, 5260, 6170, 7400, 8320]) for (let i = 0; i < n; i++) y[i] += Math.sign(Math.sin(2 * Math.PI * f * i / sr));
    return B.norm(B.mul(B.filt(y, "hp", 6000, 0.7, sr), B.env(n, sr, t => Math.exp(-t * 45))), 0.62, 1.2); },
  hat_trap(sr, B) { const n = Math.round(sr * 0.07); return B.norm(B.mul(B.filt(B.noise(n), "hp", 8000, 0.7, sr), B.env(n, sr, t => Math.exp(-t * 85))), 0.6, 1); },
  top_subdrop(sr, B) { const n = Math.round(sr * 1.8); return B.norm(B.mul(B.sine(n, sr, t => 28 + 90 * Math.exp(-t * 0.9)), B.env(n, sr, t => Math.min(1, t * 30) * Math.exp(-t * 1.2))), 0.95, 1.6); },
  top_808slide(sr, B) { const n = Math.round(sr * 1.0); return B.norm(B.mul(B.sine(n, sr, t => 110 * Math.pow(2, -Math.min(1, t * 4))), B.env(n, sr, t => Math.min(1, t * 300) * Math.exp(-t * 2.5))), 0.95, 2.3); },
  top_reesehit(sr, B) { const n = Math.round(sr * 0.6), a = B.saw(n, sr, 55, 18), b = B.saw(n, sr, 55.9, 18), e = B.env(n, sr, t => Math.min(1, t * 80) * Math.exp(-t * 3));
    return B.norm(B.mul(B.filt(B.mix(n, [a, 1], [b, 1]), "lp", 900, 1.1, sr), e), 0.92, 2.6); }
});
Object.assign(BBX.KITS, {
  kit_hardstyle: ["kick_hardstyle", "snare_clapbig", "hat_hard", "top_subdrop"],
  kit_trap808: ["kick_808long", "snare_trap", "hat_trap", "top_808slide"],
  kit_bassdrop: ["kick_punch", "snare_clapbig", "hat_hard", "top_reesehit"],
  kit_dnbbass: ["kick_dnb", "snare_dnb", "hat_trap", "top_reesehit"]
});
// harte Kits etwas leiser einpegeln (sehr dichte Wellenform, sonst übersteuert die Summe)
{ const b0 = BBX.build.bind(BBX); BBX.build = function (sr) { const r = b0(sr); for (const k of ["kit_hardstyle", "kit_trap808", "kit_bassdrop", "kit_dnbbass"]) for (const z of ["kick", "snare"]) { const d = r[k + "_" + z]; if (d && !d._lv) { for (let i = 0; i < d.length; i++) d[i] *= 0.62; d._lv = 1; } } return r; }; }
{ const ENV = { att: 0.001, dec: 0.5, sus: 0, rel: 0.25, bt: 0.1, nb: 0, nz: 0, mt: 0 };
  K.SEEDS.push(
    { id: "kit_hardstyle", cat: "techno", grp: "Harte Bassbeats", kit: "kit_hardstyle", name: "Hardstyle-Beat", fam: "Bassbeat", kind: "drum", desc: "verzerrte Kick mit Schweif, Riesen-Clap, Metall-Hat, Sub-Drop", size: 1.4, stretch: 0.6, spin: 0, env: ENV, shape: s => { s.spikes(6, 0.2, 0.1, 5); s.cap(-0.8, 0.55, 0.5); } },
    { id: "kit_trap808", cat: "techno", grp: "Harte Bassbeats", kit: "kit_trap808", name: "808-Trap-Beat", fam: "Bassbeat", kind: "drum", desc: "lange 808 dröhnt, Snare, schnelle Hats, 808-Rutscher", size: 1.5, stretch: 0.66, spin: 0, env: ENV, shape: s => { s.cap(-0.9, 0.65, 0.6); s.band(0.35, 0.06, 0.25); } },
    { id: "kit_bassdrop", cat: "techno", grp: "Harte Bassbeats", kit: "kit_bassdrop", name: "Bass-Drop-Beat", fam: "Bassbeat", kind: "drum", desc: "Kick mit Sub, Clap, Hat, Reese-Schlag – oben = Drop", size: 1.45, stretch: 0.62, spin: 0, env: ENV, shape: s => { s.facets(7, 0.16, 0.3); s.cap(-0.85, 0.5, 0.45); } },
    { id: "kit_dnbbass", cat: "techno", grp: "Harte Bassbeats", kit: "kit_dnbbass", name: "Drum'n'Bass-Beat", fam: "Bassbeat", kind: "drum", desc: "trockene Kick, knallende Snare, Reese-Bass oben", size: 1.3, stretch: 0.68, spin: 0, env: ENV, shape: s => { s.lumps(6, 0.12, 0.4, 17); s.band(-0.4, 0.1, 0.3); } });
}
try { NewPiece.SETS.splice(1, 0, ["hartbass", "Harter Bassbeat", ["kit_hardstyle", "rumblebass", "supersaw", "kit_trap808"]]); } catch (_) {}

// ---------- 2) PULT ----------
const Pult = {
  q: new Map(),              // Form-ID → true (setzt ein) / false (stoppt) – zur nächsten Eins
  quant() { return Cfg.get("quant") !== "sofort"; },
  list() { return Forms.list.filter(f => !f.empty && !f.remote); },
  kind(f) {
    if (LoopSt.trackOf(f)) return ["🔁", "Loop"]; if (f.kind === "drum") return ["🥁", "Beat"]; if (f.kind === "sample") return ["🎤", "Klang"];
    const sd = K.seedById(f.inst || f.seedId); if (/Bass/i.test(sd.fam || "") || /bass/i.test(sd.id || "")) return ["〰", "Bass"]; if (sd.cat === "techno") return ["⚡", "Synth"]; return ["🎹", "Ton"];
  },
  playing(f) { return SoloStart.playing(f); },
  toggle(f) {
    if (!f) return; const on = !this.playing(f); Hap(8);
    if (!Transport.running || !this.quant()) { this.apply(f, on); return; }
    if (this.q.has(f.id)) this.q.delete(f.id); else this.q.set(f.id, on);
    this.paint();
  },
  apply(f, on) {
    if (on) SoloStart.start(f); else { Fade.set(f, false, true); }
    this.paint(); Save.soon(); try { KSheet.sync(true); UI.soon(); } catch (_) {}
  },
  onBar() { if (!this.q.size) return; const Q = [...this.q]; this.q.clear(); for (const [id, on] of Q) { const f = Forms.byId(id); if (f) this.apply(f, on); } },
  allStop() { this.q.clear(); if (Transport.running) Transport.stop(); Hap(10); this.paint(); },
  allStart() { if (!Engine.ctx) return; this.q.clear(); if (!Transport.running) Transport.start(); for (const f of this.list()) SoloStart.start(f); Hap(10); this.paint(); },
  // ---- Halten = nur diese Form hören ----
  soloOn(f) { this.solo = f; for (const g of Forms.list) { g._ps = g.solo; g.solo = g === f; } for (const g of Forms.list) Forms.applyMix(g); Hap(14); this.paint(); },
  soloOff() { if (!this.solo) return; this.solo = null; for (const g of Forms.list) { g.solo = !!g._ps; delete g._ps; } for (const g of Forms.list) Forms.applyMix(g); this.paint(); },
  // ---- Live-Effekte ----
  fx() {
    if (this.F && this.F.c === Engine.ctx) return this.F; const c = Engine.ctx; if (!c) return null;
    const lp = c.createBiquadFilter(), hp = c.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 22000; lp.Q.value = 0.9; hp.type = "highpass"; hp.frequency.value = 10; hp.Q.value = 0.9;
    try { Engine.out.disconnect(); Engine.out.connect(lp); lp.connect(hp); hp.connect(c.destination); hp.connect(Engine.recNode.input || Engine.recNode); }
    catch (e) { console.warn(e); try { Engine.out.connect(c.destination); Engine.out.connect(Engine.recNode.input || Engine.recNode); } catch (_) {} return null; }
    return (this.F = { c, lp, hp, v: 0 });
  },
  filter(v) {
    const F = this.fx(); if (!F) return; F.v = v = clamp(+v, -100, 100); const now = Engine.now(), a = Math.abs(v) < 4 ? 0 : v;
    const lf = a < 0 ? 22000 * Math.pow(2, a / 100 * 8.2) : 22000, hf = a > 0 ? 18 * Math.pow(2, a / 100 * 8.6) : 10;
    F.lp.frequency.setTargetAtTime(lf, now, 0.03); F.hp.frequency.setTargetAtTime(hf, now, 0.03); F.lp.Q.setTargetAtTime(a < 0 ? 0.9 + Math.abs(a) / 100 * 5 : 0.9, now, 0.05); F.hp.Q.setTargetAtTime(a > 0 ? 0.9 + a / 100 * 4 : 0.9, now, 0.05);
  },
  filtTxt(v) { v = +v; return Math.abs(v) < 4 ? "aus" : v < 0 ? `dumpf ${Math.round(-v)} %` : `dünn ${Math.round(v)} %`; },
  echo(on) { if (!Engine.ctx) return; const now = Engine.now(); try { Engine.echoOut.gain.setTargetAtTime(on ? 0.95 : Global.echo * 0.7, now, on ? 0.02 : 0.25); } catch (_) {} this.echoOn = !!on; this.paint(); },
  brk(on) {
    if (on) { if (this.brkL) return; this.brkL = this.list().filter(f => f.kind !== "drum" && QuickPP.on(f)); for (const f of this.brkL) Fade.set(f, false, true); Hap(14); }
    else { const L = this.brkL || []; this.brkL = null; if (Transport.running && this.quant()) for (const f of L) this.q.set(f.id, true); else for (const f of L) Fade.set(f, true, true); }
    this.paint();
  },
  // ---- Anzeige ----
  el() { const v = $("vLoop"); if (!v) return null; let p = $("pult"); if (!p) { v.insertAdjacentHTML("afterbegin", `<div id="pult" class="pult"></div><div id="lsbox"></div>`); p = $("pult"); this.bind(p); } return p; },
  state(f) { const q = this.q.get(f.id); if (q === true) return "qon"; if (q === false) return "qoff"; return this.playing(f) ? "on" : "off"; },
  stTxt(st) { return st === "on" ? "läuft" : st === "qon" ? "setzt ein …" : st === "qoff" ? "stoppt …" : "aus"; },
  render() {
    const el = this.el(); if (!el || UI.tab !== "loop") return; const L = this.list(), run = Transport.running, R = LoopSt.R, F = this.F;
    const pads = L.map(f => { const [ic, k] = this.kind(f), st = this.state(f); return `<button class="pp st-${st}" data-pp="${f.id}" style="--c:${colOf(f)}" aria-label="${esc(f.name)}: ${this.stTxt(st)} – tippen = ${st === "on" ? "stoppen" : "starten"}, halten = nur diese hören"><i class="pplv"></i><span class="ppk">${ic} ${k}</span><b>${esc(f.name)}</b><small>${this.stTxt(st)}</small></button>`; }).join("");
    el.innerHTML = `<div class="pthead"><h2>Pult</h2><span class="ptbpm"><button data-pt="tm" aria-label="langsamer">−</button><b>${Math.round(Music.tempo())}</b><small>BPM</small><button data-pt="tp" aria-label="schneller">+</button></span>
        <button class="ptgo${run ? " on" : ""}" data-pt="go" aria-label="${run ? "Alles stoppen" : "Alles starten"}">${run ? "■" : "▶"}</button></div>
      <p class="pthint">Feld tippen = <b>ein/aus</b> – setzt ${this.quant() ? "auf der nächsten <b>Eins</b> ein" : "<b>sofort</b> ein"}. <b>Halten</b> = nur das hören.</p>
      <div class="ppgrid">${pads}<button class="pp ppnew" data-pt="new"><span class="ppk">＋</span><b>Neuer Klang</b><small>Beat, Bass, Instrument</small></button><button class="pp pprec${R ? " rec" : ""}" data-pt="rec"><span class="ppk">${R ? "■" : "🔴"}</span><b>${R ? "Fertig" : "Loop aufnehmen"}</b><small>${R ? LoopSt.label(R.i)[0] : LoopSt.src === "form" ? "was gerade spielt" : "vom Mikrofon"}</small></button></div>
      <div class="ptfx">
        <label class="ptfilt"><span>Filter</span><input type="range" min="-100" max="100" step="1" value="${F ? F.v : 0}" data-pt="filt" aria-label="Filter: links dumpf, rechts dünn"><b>${this.filtTxt(F ? F.v : 0)}</b></label>
        <button class="pthold${this.echoOn ? " on" : ""}" data-pth="echo"><b>Echo</b><small>halten</small></button>
        <button class="pthold${this.brkL ? " on" : ""}" data-pth="brk"><b>Break</b><small>halten: nur Beats</small></button>
        <button class="pthold ptrec${Rec.on ? " on" : ""}" data-pt="mit"><b>${Rec.on ? "■ " + Rec.label() : "● Mitschnitt"}</b><small>${Rec.on ? "tippen = fertig" : "ganzen Track aufnehmen"}</small></button>
      </div>
      <div class="ptopt"><button class="npc" data-pt="quant" aria-pressed="${this.quant()}">${this.quant() ? "⏱ Einsatz auf der Eins" : "⚡ Einsatz sofort"}</button><button class="npc" data-pt="raum">◍ Im Raum mischen</button></div>`;
    this._sig = this.sig(); this.anim();
  },
  sig() { return this.list().map(f => f.id + this.state(f) + f.name).join() + Transport.running + !!LoopSt.R + Rec.on + this.quant() + !!this.brkL + Math.round(Music.tempo()); },
  paint() { try { if (UI.tab === "loop") { if (this.sig() !== this._sig && !this.drag) this.render(); } this.labels(); } catch (e) { console.warn(e); } },
  labels() { document.querySelectorAll(".labels .lbtn").forEach(b => { const q = this.q.get(b.dataset.id); b.classList.toggle("pq", q != null); }); const p = document.querySelector(".fnpp"); if (p && Forms.active) p.classList.toggle("pq", this.q.has(Forms.active.id)); },
  anim() {
    clearInterval(this.at); this.at = setInterval(() => {
      if (UI.tab !== "loop") { clearInterval(this.at); return; } const el = $("pult"); if (!el) return;
      if (this.sig() !== this._sig && !this.drag) { this.render(); return; }
      const lv = Engine.stat.lv || [], bp = Transport.running ? Transport.beatPos() % 1 : 0; el.style.setProperty("--beat", (1 - bp).toFixed(2));
      el.querySelectorAll(".pp[data-pp]").forEach(b => { const f = Forms.byId(b.dataset.pp); if (!f) return; const t = LoopSt.trackOf(f); const v = t ? (this.playing(f) ? 0.5 + 0.5 * (1 - bp) : 0) : Math.min(1, (lv[f.bus] || 0) * 2.4); b.style.setProperty("--lv", v.toFixed(2)); });
      const r = el.querySelector('[data-pt="mit"] b'); if (r && Rec.on) r.textContent = "■ " + Rec.label();
    }, 80);
  },
  bind(el) {
    let lp = null;
    el.addEventListener("pointerdown", e => {
      const h = e.target.closest("[data-pth]"); if (h) { e.preventDefault(); try { h.setPointerCapture(e.pointerId); } catch (_) {} Hap(10); if (h.dataset.pth === "echo") this.echo(true); else this.brk(true); this._hold = h.dataset.pth; return; }
      const p = e.target.closest("[data-pp]"); if (!p) return; const f = Forms.byId(p.dataset.pp); clearTimeout(lp); this._lpd = false;
      lp = setTimeout(() => { this._lpd = true; this.soloOn(f); }, 420);
    });
    const up = () => { clearTimeout(lp); if (this.solo) this.soloOff(); if (this._hold) { const k = this._hold; this._hold = null; if (k === "echo") this.echo(false); else this.brk(false); } };
    el.addEventListener("pointerup", up); el.addEventListener("pointercancel", up); el.addEventListener("lostpointercapture", up);
    el.addEventListener("click", e => {
      const p = e.target.closest("[data-pp]"); if (p) { if (this._lpd) { this._lpd = false; return; } this.toggle(Forms.byId(p.dataset.pp)); return; }
      const b = e.target.closest("[data-pt]"); if (!b) return; const k = b.dataset.pt; Hap(8);
      if (k === "go") { Transport.running ? this.allStop() : this.allStart(); return; }
      if (k === "tm" || k === "tp") { Music.setTempo(clamp(Math.round(Music.tempo()) + (k === "tp" ? 2 : -2), 50, 180)); this.render(); return; }
      if (k === "new") { try { Sheets.seeds(); } catch (_) { UI.setTab("klang"); } return; }
      if (k === "rec") { LoopRec.tap().then(() => setTimeout(() => this.render(), 100)); return; }
      if (k === "mit") { Rec.toggle(); setTimeout(() => this.render(), 120); return; }
      if (k === "quant") { Cfg.set("quant", this.quant() ? "sofort" : "takt"); this.render(); return; }
      if (k === "raum") { UI.setTab("klang"); UI.setView("raum"); return; }
    });
    el.addEventListener("input", e => { const r = e.target; if (r.dataset.pt !== "filt") return; this.drag = true; this.filter(r.value); const b = r.parentElement.querySelector("b"); if (b) b.textContent = this.filtTxt(r.value); });
    el.addEventListener("change", e => { if (e.target.dataset.pt === "filt") this.drag = false; });
    el.addEventListener("dblclick", e => { const r = e.target.closest('[data-pt="filt"]'); if (r) { r.value = 0; this.filter(0); this.render(); } });
  }
};
Object.assign(Cfg.DEF, { quant: "takt" });
// Loopstation lebt unter dem Pult
LoopSt.el = function () { Pult.el(); return $("lsbox"); };
{ const st = UI.setTab.bind(UI); UI.setTab = function (t) { const r = st(t); try { if (t === "loop") { Pult.render(); } } catch (e) { console.warn(e); } return r; }; }
// Takt: geplante Einsätze auf der Eins
{ const os = Transport.onStep.bind(Transport); Transport.onStep = function (step, time) { if (step % 16 === 0) { try { Pult.onBar(); } catch (e) { console.warn(e); } } return os(step, time); }; }
{ const sp = Transport.stop.bind(Transport); Transport.stop = function () { Pult.q.clear(); const r = sp(); try { Pult.paint(); } catch (_) {} return r; }; }
// ▶/⏸ an den Formen (Namen, Raum-Punkte, Form-Ansicht) setzt ebenfalls auf der Eins ein
{ const tg = QuickPP.toggle.bind(QuickPP); QuickPP.toggle = function (f) { if (f && Transport.running && Pult.quant() && !this._now) { const on = !SoloStart.playing(f); Pult.toggle(f); if (Pult.q.has(f.id)) UI.toast(`${f.name} ${on ? "setzt" : "stoppt"} auf der nächsten Eins`, 1100); else UI.toast(`${f.name}: abgebrochen`, 800); return; } return tg(f); }; }
setInterval(() => { try { Pult.labels(); if (UI.tab === "loop") Pult.paint(); } catch (_) {} }, 250);
// Bereich heißt jetzt „Pult“
{ const t = $("tLoop"); if (t) t.innerHTML = `<svg viewBox="0 0 24 24"><rect x="3" y="3" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="2"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2"/></svg>Pult`; }
try { Cmd.L.tLoop.n = () => "Pult & Loops"; } catch (_) {}
// Hilfe
Help.T.push({ id: "pult", ic: "🎛", t: "Pult: live spielen und mischen", k: "pult live performance auflegen dj starten stoppen einsetzen filter echo break drop mitschnitt solo eins takt", h: `<ul>
  <li>Unten <b>Pult</b>: jede Form ist ein großes Feld (🥁 Beat, 〰 Bass, ⚡ Synth, 🎹 Ton, 🎤 Klang, 🔁 Loop). Das Feld leuchtet, wenn es spielt.</li>
  <li><b>Tippen</b> = ein/aus. Läuft Musik, setzt es <b>auf der nächsten Eins</b> ein bzw. stoppt dort (das Feld blinkt so lange) – so passt es immer. Nochmal tippen bricht ab. Steht alles, startet das Feld sofort – nur dieses.</li>
  <li><b>Halten</b> = nur diese Form hören, loslassen = alle wieder da.</li>
  <li><b>Filter</b>: Schieber nach links = dumpf (wie hinter der Wand), nach rechts = dünn; Mitte = aus (doppelt tippen setzt zurück). <b>Echo</b> halten = Echo-Wurf. <b>Break</b> halten = nur die Beats, loslassen = alles kommt auf der Eins zurück.</li>
  <li><b>🔴 Loop aufnehmen</b> nimmt auf, was gerade spielt (oder das Mikrofon), <b>● Mitschnitt</b> nimmt den ganzen Track auf (danach unter Stück → Aufnahmen, teilen als MP3/Video).</li>
  <li><b>⏱ Einsatz auf der Eins</b> / <b>⚡ sofort</b> umschalten. Auch ▶/⏸ an den Formen im Klang-Bereich setzt auf der Eins ein.</li>
  <li>Neue <b>harte Bassbeats</b> (＋ Neu → Techno & Bass → Harte Bassbeats): Hardstyle-Beat, 808-Trap-Beat, Bass-Drop-Beat, Drum'n'Bass-Beat. Neues Stück → „Harter Bassbeat“.</li></ul>` });
{ const c = Help.CATS.find(x => x[0] === "Spielen"); if (c && !c[1].includes("pult")) c[1].unshift("pult"); }
Help.WANT.splice(0, 0, ["Live spielen: Sounds einsetzen und stoppen", "pult"]);
CtxHelp.MAP.loop = "pult";
