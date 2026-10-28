/* ============================================================
   v61: Einzelklang (Geräusch, Ton, Wort, Gesang) aufnehmen → Instrument-Form und/oder Loop · Loop → Instrument
        Klang stabiler: vorausschauender Takt (wächst bei Rucklern), Takt-Uhr im eigenen Faden, weiches Stimmen-Ablösen,
        Klang-Puffer wählbar · Stücke dauerhaft speichern (Browser-Speicher schützen)
   ============================================================ */

// ---------- 1) Takt stabil: eigener Zeitgeber + mitwachsender Vorlauf ----------
const Ticker = {
  w: null, cbs: new Map(), seq: 0, ok: null,
  start(fn) {
    const id = ++this.seq; this.cbs.set(id, fn);
    if (this.ok !== false && !this.w) { try { const src = "let t=null;onmessage=e=>{if(e.data==='go'){if(!t)t=setInterval(()=>postMessage(0),20);}else{clearInterval(t);t=null;}};"; this.w = new Worker(URL.createObjectURL(new Blob([src], { type: "text/javascript" }))); this.w.onmessage = () => this.fire(); this.ok = true; } catch (e) { this.ok = false; } }
    if (this.w) { this.w.postMessage("go"); return id; }
    const t = setInterval(fn, 25); this.cbs.set(id, { t }); return id;
  },
  stop(id) { const c = this.cbs.get(id); if (c && c.t) clearInterval(c.t); this.cbs.delete(id); if (this.w && ![...this.cbs.values()].some(v => typeof v === "function")) this.w.postMessage("stop"); },
  fire() { for (const fn of this.cbs.values()) if (typeof fn === "function") { try { fn(); } catch (e) { console.warn(e); } } }
};
Object.assign(Transport, {
  _ah: 0.12, _lt: 0, gapMax: 0,
  // Vorlauf: normal 0,12 s; hakt der Hauptfaden (Bild, Kneten, Speichern), wächst er bis 0,4 s und sinkt langsam zurück
  ahead() {
    const now = performance.now(), g = this._lt ? (now - this._lt) / 1000 : 0; this._lt = now;
    if (g > 0.05) { this._ah = Math.max(this._ah, Math.min(0.4, g * 1.5 + 0.06)); this.gapMax = Math.max(this.gapMax, g); }
    else this._ah = Math.max(Stab.base(), this._ah - 0.0006);
    return this._ah;
  }
});
// Klang-Puffer: auto (Handy etwas größer), kurz (schnellste Reaktion), stabil (größter Puffer)
const Stab = {
  mobile: /Android|iPhone|iPad|iPod/i.test(navigator.userAgent),
  mode() { const v = Cfg.get("klPuffer"); return v === "kurz" || v === "stabil" ? v : "auto"; },
  hint() { const m = this.mode(); return m === "kurz" ? "interactive" : m === "stabil" ? "playback" : this.mobile ? "balanced" : "interactive"; },
  base() { const m = this.mode(); return m === "stabil" ? 0.25 : m === "kurz" ? 0.1 : this.mobile ? 0.16 : 0.12; },
  vmax() { return this.mode() === "stabil" || this.mobile ? 28 : 36; },
  NAMES: { auto: "automatisch", kurz: "schnell (wenig Puffer)", stabil: "stabil (mehr Puffer)" },
  cycle() { const o = ["auto", "stabil", "kurz"], nx = o[(o.indexOf(this.mode()) + 1) % o.length]; Cfg.set("klPuffer", nx); UI.toastAct(`Klang: ${this.NAMES[nx]} – wirkt nach dem Neuladen`, "Neu laden", () => { Save.now && Save.now(); setTimeout(() => location.reload(), 300); }, 6000); return nx; }
};
Object.assign(Cfg.DEF, { klPuffer: "auto" });
// Stimmen-Höchstzahl an den Klangfaden (Handy: weniger, damit nichts knackt)
{ const iv = setInterval(() => { if (!App.started || !Engine.node) return; clearInterval(iv); try { Engine.post({ t: "vmax", v: Stab.vmax() }); } catch (_) {} }, 400); }
// Menü: Klang-Puffer umschalten
{ const op = Sheets.open.bind(Sheets); Sheets.open = function (name, html, ...r) { const s = op(name, html, ...r);
  try { if (name === "Menü" && s && !s.querySelector("[data-mkl]")) { const a = s.querySelector(".mkp") || s.querySelector(".mmic") || s.querySelector(".mjam"); if (a) { a.insertAdjacentHTML("afterend", `<div class="row mkl"><button class="btn" data-mkl="1">🔊 Klang: <b>${Stab.NAMES[Stab.mode()]}</b></button></div>`); s.querySelector("[data-mkl]").onclick = ev => { Hap(); const v = Stab.cycle(); ev.currentTarget.querySelector("b").textContent = Stab.NAMES[v]; }; } } } catch (e) { console.warn(e); }
  return s; }; }

// ---------- 2) Stücke dauerhaft speichern ----------
{ const iv = setInterval(async () => { if (!App.started) return; clearInterval(iv); try { if (navigator.storage && navigator.storage.persist && !(await navigator.storage.persisted())) { const ok = await navigator.storage.persist(); store.set("persist", !!ok); } } catch (_) {} }, 1500); }

// ---------- 3) Einzelklang: kurz aufnehmen → Instrument-Form und/oder Loop ----------
Object.assign(LoopSt, {
  one: null,
  async oneShot() {
    if (this.one) return this.oneStop(); if (this.R) { UI.toast("Erst die laufende Aufnahme beenden", 1400); return; }
    if (this.micBlocked(this.free())) return; if (!(await this.micOpen())) return;
    const N = await this.node("mic"); const O = this.one = Object.assign(N, { src: "mic", ch: 1, chunks: [], rt0: null, lv: 0, sr: Engine.ctx.sampleRate, at: Engine.now() });
    O.n.port.onmessage = e => { const d = e.data; if (d.t === "t0") O.rt0 = d.v; else if (d.t === "chunk") O.chunks.push(d.d); else if (d.t === "lvl") O.lv = d.v; else if (d.t === "end" && O.done) O.done(); };
    O.n.port.postMessage({ on: true, ch: 1 }); O.tm = setTimeout(() => this.oneStop(), 8000); Hap(12);
    MicLog.add("Loopstation: Einzelklang aufnehmen"); this.render(); this.onePill();
  },
  onePill() { clearInterval(this.opt); if (UI.tab === "loop") { this.pillEl(null); return; } this.opt = setInterval(() => { const O = this.one; if (!O) { clearInterval(this.opt); this.pillEl(null); return; } const s = Engine.now() - O.at; this.pillEl(`<b>🎤 Einzelklang · ${s.toFixed(1)} s</b><small>tippen = fertig (höchstens 8 s)</small><i style="--lv:${Math.min(1, O.lv * 2.2).toFixed(2)}"></i>`); }, 120); },
  async oneStop() {
    const O = this.one; if (!O) return; this.one = null; clearTimeout(O.tm); clearInterval(this.opt); this.pillEl(null);
    const x = (await this.collect(O))[0], sr = O.sr; if (UI.tab !== "loop") this.micIdle();
    const y = this.trimSound(x, sr, 6); if (!y) { UI.toastAct("In der Aufnahme war es still – ist das richtige Mikrofon gewählt?", "Prüfen", () => MicFix.sheet(), 4200); this.render(); return; }
    this.oneChoice(y, sr); this.render();
  },
  // Klang ausschneiden: ab dem ersten deutlichen Einsatz bis zum Ausklingen (höchstens max s), Ränder weich
  trimSound(x, sr, max) {
    let pk = 0; for (let i = 0; i < x.length; i++) { const a = Math.abs(x[i]); if (a > pk) pk = a; } if (pk < 0.004) return null;
    let a = 0; while (a < x.length && Math.abs(x[a]) < pk * 0.08) a++; a = Math.max(0, a - Math.round(sr * 0.012));
    let e = x.length - 1; while (e > a && Math.abs(x[e]) < pk * 0.02) e--; e = Math.min(x.length, e + Math.round(sr * 0.12), a + Math.round(sr * max));
    if (e - a < sr * 0.05) return null; const y = x.slice(a, e), fd = Math.min(Math.round(sr * 0.03), y.length >> 3);
    for (let i = 0; i < Math.min(64, y.length); i++) y[i] *= i / 64; for (let i = 0; i < fd; i++) y[y.length - 1 - i] *= i / fd;
    const g = 0.9 / pk; for (let i = 0; i < y.length; i++) y[i] *= g; return y;
  },
  oneChoice(y, sr) {
    const dur = y.length / sr, s = Sheets.open("Einzelklang", Sheets.head("🎤 Dein Klang") + `<div class="lxone">
      <p class="kch">Aufgenommen: <b>${dur.toFixed(1)} s</b>. Was soll daraus werden?</p>
      <button class="btn" data-o1="hear">▶ Anhören</button>
      <button class="btn primary lxob" data-o1="form"><b>🎹 Instrument-Form</b><small>spielbar in der Tonart: tippen = Töne, drehen = Melodie, kneten = Klang</small></button>
      <button class="btn lxob" data-o1="loop"><b>🔁 Loop</b><small>${this.L ? this.L / 16 + " Takt" + (this.L > 16 ? "e" : "") : "1 Takt"}, der Klang auf der Eins – wiederholt sich im Takt (auch als Form)</small></button>
      <button class="btn lxob" data-o1="both"><b>Beides</b><small>Instrument-Form und Loop</small></button></div>`);
    s.addEventListener("click", e => { const b = e.target.closest("[data-o1]"); if (!b) return; Hap(8); const k = b.dataset.o1;
      if (k === "hear") { try { const c = Engine.ctx, buf = c.createBuffer(1, y.length, sr); buf.copyToChannel(y, 0); const src = c.createBufferSource(); src.buffer = buf; src.connect(Engine.out); src.start(); } catch (_) {} return; }
      UI.hideSheets(); if (k === "form" || k === "both") { const f = MicFix.toForm(y.slice(), sr); if (f) f.name = `Klang ${Forms.list.filter(x => /^Klang \d/.test(x.name)).length + 1}`; if (f && k === "form") { UI.setTab("klang"); Forms.setActive(f); } }
      if (k === "loop" || k === "both") this.oneLoop(y, sr); });
  },
  async oneLoop(y, sr) {
    const i = this.slots.findIndex(t => !t); if (i < 0) { UI.toast("Alle Spuren belegt – in der Loopstation eine leeren oder „＋ Spur“", 2200); return; }
    const L = this.L || 16, bpm = Music.tempo(), n = Math.round(L * 15 / bpm * sr), z = new Float32Array(n); z.set(y.subarray(0, Math.min(y.length, n)));
    const fd = Math.min(160, n >> 4); for (let k = 0; k < fd; k++) z[n - 1 - k] *= k / fd;
    await this.put(i, [z], sr, bpm, L, "mic", 0); UI.toast(`🔁 Spur ${i + 1}: dein Klang auf der Eins, ${L / 16} Takt${L > 16 ? "e" : ""} im Loop`, 2400);
  },
  // Loop → Instrument: den lautesten Klang der Spur als spielbare Form
  toInst(i) {
    const t = this.slots[i], b = t && this.bufs.get(t.rec); if (!b) return; const d = b.getChannelData(0), sr = b.sampleRate;
    let mi = 0, mv = 0; for (let k = 0; k < d.length; k += 16) { const a = Math.abs(d[k]); if (a > mv) { mv = a; mi = k; } }
    let a = mi; const thr = mv * 0.06; while (a > 0 && mi - a < sr * 0.4 && Math.abs(d[a]) > thr) a -= 32;
    const y = this.trimSound(d.slice(Math.max(0, a), Math.min(d.length, a + sr * 2.5)), sr, 2.5); if (!y) { UI.toast("In dieser Spur ist kein deutlicher Klang", 1600); return; }
    const f = MicFix.toForm(y, sr); if (f) { f.name = `Klang ${i + 1}`; UI.toastAct(`🎹 „${f.name}“: der Klang aus Spur ${i + 1} als Instrument – tippen spielt ihn in der Tonart`, "Zeigen", () => { UI.setTab("klang"); Forms.setActive(f); }, 4800); }
  }
});
// Ansicht: Knopf „Einzelklang“ und je Spur „🎹“
{ const r0 = LoopSt.render.bind(LoopSt); LoopSt.render = function () { r0(); try { const el = this.el(); if (!el || UI.tab !== "loop") return; const opt = el.querySelector(".lqopt"); const O = this.one;
    if (opt && !el.querySelector("[data-ls=one]")) opt.insertAdjacentHTML("afterend", `<button class="lxonebtn${O ? " on" : ""}" data-ls="one"><b>${O ? "■ Fertig" : "🎤 Einzelklang aufnehmen"}</b><small>${O ? "nimmt auf … (höchstens 8 s)" : "ein Geräusch, Ton, Wort oder eine Gesangszeile → Instrument-Form und/oder Loop"}</small><i class="lxonelv"></i></button>`);
    el.querySelectorAll(".lxctl").forEach(c => { const del = c.querySelector('[data-ls="del"]'); if (del && !c.querySelector('[data-ls="inst"]')) del.insertAdjacentHTML("beforebegin", `<button data-ls="inst" data-i="${del.dataset.i}" aria-label="Klang dieser Spur als Instrument-Form">🎹</button>`); }); } catch (e) { console.warn(e); } }; }
{ const c0 = LoopSt.click.bind(LoopSt); LoopSt.click = function (e) { const b = e.target.closest("[data-ls]"); if (b && b.dataset.ls === "one") { Hap(10); this.oneShot(); return; } if (b && b.dataset.ls === "inst") { Hap(8); this.toInst(+b.dataset.i); return; } return c0(e); }; }
{ const s0 = LoopSt.sig.bind(LoopSt); LoopSt.sig = function () { return s0() + (this.one ? "O" : ""); }; }
{ const a0 = LoopSt.anim.bind(LoopSt); LoopSt.anim = function () { a0(); clearInterval(this.oat); this.oat = setInterval(() => { if (UI.tab !== "loop") { clearInterval(this.oat); return; } const l = document.querySelector(".lxonelv"); if (l) l.style.width = (this.one ? Math.min(1, this.one.lv * 2.2) * 100 : 0).toFixed(0) + "%"; }, 80); }; }
{ const pp = LoopSt.pillEl.bind(LoopSt); LoopSt.pillEl = function (h) { const p = pp(h); if (p && !p._one) { p._one = 1; p.addEventListener("click", () => { if (LoopSt.one) LoopSt.oneStop(); }, true); } return p; }; }
// Hilfe
{ const h = Help.T.find(x => x.id === "loopst"); if (h) h.h = h.h.replace("</ul>", `<li><b>🎤 Einzelklang aufnehmen</b> (in der Loopstation): ein Geräusch, einen Ton, ein Wort oder eine Gesangszeile aufnehmen (höchstens 8 s, nochmal tippen = fertig). Danach wählen: <b>🎹 Instrument-Form</b> (spielbar in der Tonart – tippen spielt Töne, drehen spielt eine Melodie, kneten verändert den Klang), <b>🔁 Loop</b> (der Klang auf der Eins, wiederholt sich im Takt und ist auch eine Form) oder <b>beides</b>. Mit <b>🎹</b> in einer Spur wird der deutlichste Klang eines Loops zur Instrument-Form.</li><li><b>Ruckelt der Klang?</b> Menü → 🔊 Klang: „stabil (mehr Puffer)“ und neu laden. KLANGRAUM plant Töne vorausschauend und vergrößert den Vorlauf selbst, wenn das Handy kurz hakt.</li></ul>`); }
{ const p = Help.T.find(x => x.id === "proj"); if (p) p.h = p.h.replace(/<\/ul>\s*$/, `<li><b>Wo liegen meine Stücke?</b> Im Speicher <b>dieses Browsers auf diesem Gerät</b>, getrennt je Adresse (die GitHub-Seite, die Claude-Ansicht und eine heruntergeladene Datei haben jeweils ihren eigenen Speicher). Nichts davon wird ins Internet hochgeladen. KLANGRAUM bittet den Browser, den Speicher dauerhaft zu behalten. Zum Sichern oder Umziehen: Meine Stücke → <b>Sichern und Laden → Als Datei sichern</b>, auf dem anderen Gerät bzw. der anderen Adresse <b>Datei öffnen</b>. Browserdaten löschen löscht auch die Stücke.</li></ul>`); }
