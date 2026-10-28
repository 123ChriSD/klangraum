/* ============================================================
   v54: Beatbox-Kits (16 Mundklänge) · Mehrere Instrumente auf einem Körper (Zonen) ·
        Audiospuren: echte Riffs als Loop einspielen (1/2/4/8 Takte, Eingang wählbar) · Gesangsaufnahme robuster + Protokoll
   ============================================================ */

// ---------- 0) Aufnahme-Protokoll: jeder Schritt mit Zeit, sichtbar in „Mikrofon prüfen“ ----------
const MicLog = {
  L: [],
  add(s) { const t = new Date().toLocaleTimeString("de-DE"); this.L.push(`${t} ${s}`); if (this.L.length > 40) this.L.shift(); try { console.info("[KLANGRAUM Mikro]", s); } catch (_) {} },
  text() { return this.L.join("\n") || "noch keine Aufnahme versucht"; }
};

// ---------- 1) Beatbox: Mundklänge synthetisch (Lippen, Zunge, Kehle, Atem) ----------
const BBX = {
  ok: false,
  rnd: 1,
  noise(n) { const x = new Float32Array(n); let s = this.rnd = (this.rnd * 9301 + 49297) % 233280 || 7; for (let i = 0; i < n; i++) { s = (s * 1664525 + 1013904223) >>> 0; x[i] = (s / 4294967296) * 2 - 1; } return x; },
  // RBJ-Biquad (lp, hp, bp)
  filt(x, type, f, q = 0.707, sr) {
    const w = 2 * Math.PI * f / sr, c = Math.cos(w), s = Math.sin(w), a = s / (2 * q); let b0, b1, b2, a0 = 1 + a, a1 = -2 * c, a2 = 1 - a;
    if (type === "lp") { b0 = (1 - c) / 2; b1 = 1 - c; b2 = b0; } else if (type === "hp") { b0 = (1 + c) / 2; b1 = -(1 + c); b2 = b0; } else { b0 = a; b1 = 0; b2 = -a; }
    const y = new Float32Array(x.length); let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
    for (let i = 0; i < x.length; i++) { const v = (b0 * x[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0; x2 = x1; x1 = x[i]; y2 = y1; y1 = v; y[i] = v; }
    return y;
  },
  mix(n, ...parts) { const y = new Float32Array(n); for (const [x, g] of parts) for (let i = 0; i < Math.min(n, x.length); i++) y[i] += x[i] * g; return y; },
  env(n, sr, fn) { const e = new Float32Array(n); for (let i = 0; i < n; i++) e[i] = fn(i / sr); return e; },
  mul(x, e) { for (let i = 0; i < x.length; i++) x[i] *= e[i]; return x; },
  sine(n, sr, fHz, ph = 0) { const y = new Float32Array(n); let p = ph; for (let i = 0; i < n; i++) { const t = i / sr; p += 2 * Math.PI * fHz(t) / sr; y[i] = Math.sin(p); } return y; },
  saw(n, sr, f0, nh = 14) { const y = new Float32Array(n); for (let k = 1; k <= nh; k++) { const a = 1 / k; for (let i = 0; i < n; i++) y[i] += a * Math.sin(2 * Math.PI * f0 * k * i / sr); } return y; },
  norm(x, pk = 0.9, drive = 1) { for (let i = 0; i < x.length; i++) x[i] = Math.tanh(x[i] * drive); let m = 0; for (const v of x) m = Math.max(m, Math.abs(v)); if (m > 0) for (let i = 0; i < x.length; i++) x[i] *= pk / m; const f = Math.min(64, x.length >> 3); for (let i = 0; i < f; i++) x[x.length - 1 - i] *= i / f; return x; },
  SND: {
    // Kick: Lippen-„B“ – Plosiv mit tiefem Druckstoß
    kick_b(sr, B) { const n = Math.round(sr * 0.3), th = B.mul(B.sine(n, sr, t => 46 + 80 * Math.exp(-t * 38)), B.env(n, sr, t => Math.exp(-t * 13))), burst = B.mul(B.filt(B.noise(n), "lp", 700, 0.7, sr), B.env(n, sr, t => Math.exp(-t * 70))), vo = B.mul(B.filt(B.saw(n, sr, 110, 6), "lp", 500, 0.8, sr), B.env(n, sr, t => Math.min(1, t * 200) * Math.exp(-t * 22)));
      return B.norm(B.mix(n, [th, 1], [burst, 0.7], [vo, 0.18]), 0.95, 1.6); },
    // Kick: Kehlbass – tief, knurrend
    kick_throat(sr, B) { const n = Math.round(sr * 0.36), th = B.mul(B.sine(n, sr, t => 40 + 55 * Math.exp(-t * 26)), B.env(n, sr, t => Math.exp(-t * 8) * (1 + 0.45 * Math.sin(2 * Math.PI * 34 * t)))), g = B.filt(B.mul(B.saw(n, sr, 68, 10), B.env(n, sr, t => Math.min(1, t * 120) * Math.exp(-t * 10))), "lp", 900, 1.2, sr);
      return B.filt(B.norm(B.mix(n, [th, 1], [g, 0.35]), 0.95, 3), "lp", 1400, 0.7, sr); },
    // Kick: gesummter Bass „mm“
    kick_hum(sr, B) { const n = Math.round(sr * 0.38), v = B.filt(B.filt(B.saw(n, sr, 55, 16), "lp", 380, 0.9, sr), "bp", 260, 1.4, sr), e = B.env(n, sr, t => Math.min(1, t * 90) * Math.exp(-t * 6)), th = B.mul(B.sine(n, sr, t => 55 + 25 * Math.exp(-t * 40)), B.env(n, sr, t => Math.exp(-t * 14)));
      return B.norm(B.mix(n, [B.mul(v, e), 1.4], [th, 0.8]), 0.9, 1.4); },
    // Kick: Mund-Pop (Wange)
    kick_pop(sr, B) { const n = Math.round(sr * 0.16), p = B.mul(B.sine(n, sr, t => 300 + 700 * Math.exp(-t * 70)), B.env(n, sr, t => Math.exp(-t * 38))), lo = B.mul(B.sine(n, sr, t => 85), B.env(n, sr, t => Math.exp(-t * 30)));
      return B.norm(B.mix(n, [p, 1], [lo, 0.7]), 0.9, 1.3); },
    // Snare: „Pf“ – Lippen-Plosiv mit F-Schweif
    snare_pf(sr, B) { const n = Math.round(sr * 0.24), nz = B.noise(n), body = B.mul(B.filt(nz, "bp", 2100, 1.0, sr), B.env(n, sr, t => Math.exp(-t * 34))), f = B.mul(B.filt(nz, "hp", 3200, 0.7, sr), B.env(n, sr, t => Math.min(1, t * 60) * Math.exp(-t * 13))), clk = B.mul(B.filt(B.noise(n), "hp", 1500, 0.7, sr), B.env(n, sr, t => Math.exp(-t * 400)));
      return B.norm(B.mix(n, [body, 1], [f, 0.45], [clk, 0.5]), 0.85, 1.2); },
    // Snare: eingezogenes K (inward K-snare)
    snare_inward(sr, B) { const n = Math.round(sr * 0.2), nz = B.filt(B.noise(n), "bp", 1250, 3.2, sr), e = B.env(n, sr, t => t < 0.025 ? t / 0.025 : Math.exp(-(t - 0.025) * 42)), wh = B.mul(B.sine(n, sr, t => 1250 - 200 * t), B.env(n, sr, t => (t < 0.02 ? t / 0.02 : Math.exp(-(t - 0.02) * 60)) * 0.3));
      return B.norm(B.mix(n, [B.mul(nz, e), 1], [wh, 0.6]), 0.85, 2); },
    // Snare: K – Zungenklick
    snare_k(sr, B) { const n = Math.round(sr * 0.13), hi = B.mul(B.filt(B.noise(n), "bp", 3400, 2, sr), B.env(n, sr, t => Math.exp(-t * 70))), tn = B.mul(B.sine(n, sr, t => 1800), B.env(n, sr, t => Math.exp(-t * 95))), lo = B.mul(B.sine(n, sr, t => 230), B.env(n, sr, t => Math.exp(-t * 45)));
      return B.norm(B.mix(n, [hi, 1], [tn, 0.35], [lo, 0.35]), 0.85, 1.4); },
    // Snare: „Psh“ (Rimshot-Zisch)
    snare_psh(sr, B) { const n = Math.round(sr * 0.3), p = B.mul(B.filt(B.noise(n), "lp", 900, 0.7, sr), B.env(n, sr, t => Math.exp(-t * 90))), sh = B.mul(B.filt(B.noise(n), "bp", 2700, 0.8, sr), B.env(n, sr, t => Math.min(1, t * 80) * Math.exp(-t * 17)));
      return B.norm(B.mix(n, [p, 0.8], [sh, 1]), 0.8, 1.2); },
    // Hat: „ts“
    hat_ts(sr, B) { const n = Math.round(sr * 0.11), t1 = B.mul(B.filt(B.noise(n), "hp", 5200, 0.7, sr), B.env(n, sr, t => Math.exp(-t * 420))), s = B.mul(B.filt(B.noise(n), "bp", 7200, 1.3, sr), B.env(n, sr, t => Math.exp(-t * 44)));
      return B.norm(B.mix(n, [t1, 0.8], [s, 1]), 0.7, 1); },
    // Hat: „tk“ (doppelt)
    hat_tk(sr, B) { const n = Math.round(sr * 0.13), a = B.mul(B.filt(B.noise(n), "hp", 4300, 0.9, sr), B.env(n, sr, t => Math.exp(-t * 160))), b = B.mul(B.filt(B.noise(n), "bp", 2600, 2, sr), B.env(n, sr, t => t < 0.045 ? 0 : Math.exp(-(t - 0.045) * 150)));
      return B.norm(B.mix(n, [a, 1], [b, 0.8]), 0.7, 1.2); },
    // Hat: Zungenklick hell
    hat_cl(sr, B) { const n = Math.round(sr * 0.09), r = B.mul(B.sine(n, sr, t => 2450), B.env(n, sr, t => Math.exp(-t * 120))), c = B.mul(B.filt(B.noise(n), "hp", 3000, 0.7, sr), B.env(n, sr, t => Math.exp(-t * 500)));
      return B.norm(B.mix(n, [r, 1], [c, 0.6]), 0.7, 1.2); },
    // Hat: „tch“
    hat_ch(sr, B) { const n = Math.round(sr * 0.14), a = B.mul(B.filt(B.noise(n), "bp", 4200, 1.1, sr), B.env(n, sr, t => Math.min(1, t * 300) * Math.exp(-t * 30))), b = B.mul(B.filt(B.noise(n), "hp", 6000, 0.7, sr), B.env(n, sr, t => Math.exp(-t * 300)));
      return B.norm(B.mix(n, [a, 1], [b, 0.6]), 0.7, 1); },
    // Top: offenes „tsss“
    top_tss(sr, B) { const n = Math.round(sr * 0.5), s = B.mul(B.filt(B.noise(n), "bp", 6600, 0.8, sr), B.env(n, sr, t => Math.min(1, t * 200) * Math.exp(-t * 6.5)));
      return B.norm(s, 0.65, 1); },
    // Top: Lippenroller (lip roll)
    top_lip(sr, B) { const n = Math.round(sr * 0.48), buzz = B.filt(B.saw(n, sr, 95, 10), "lp", 650, 1, sr), am = B.env(n, sr, t => 0.5 + 0.5 * Math.sin(2 * Math.PI * 27 * t)), e = B.env(n, sr, t => Math.min(1, t * 40) * Math.exp(-t * 3.5));
      return B.norm(B.mul(B.mul(buzz, am), e), 0.85, 1.6); },
    // Top: Zungen-Klickrolle
    top_clickroll(sr, B) { const n = Math.round(sr * 0.42), y = new Float32Array(n), one = B.mul(B.sine(Math.round(sr * 0.02), sr, t => 1500), B.env(Math.round(sr * 0.02), sr, t => Math.exp(-t * 300)));
      for (let k = 0; k < 13; k++) { const o = Math.round(k * sr / 32), g = Math.exp(-k * 0.12); for (let i = 0; i < one.length && o + i < n; i++) y[o + i] += one[i] * g; } return B.norm(y, 0.75, 1.2); },
    // Top: Zungen-„Klock“
    top_cloc(sr, B) { const n = Math.round(sr * 0.16), r = B.mul(B.sine(n, sr, t => 560 + 160 * Math.exp(-t * 60)), B.env(n, sr, t => Math.exp(-t * 52))), c = B.mul(B.filt(B.noise(n), "hp", 2000, 0.7, sr), B.env(n, sr, t => Math.exp(-t * 600)));
      return B.norm(B.mix(n, [r, 1], [c, 0.4]), 0.85, 1.3); },
    // Top: „Shh“-Becken
    top_shh(sr, B) { const n = Math.round(sr * 0.55), s = B.mul(B.filt(B.noise(n), "bp", 3000, 0.7, sr), B.env(n, sr, t => Math.min(1, t * 50) * Math.exp(-t * 4.5)));
      return B.norm(s, 0.7, 1); }
  },
  KITS: {
    kit_bbx: ["kick_b", "snare_pf", "hat_ts", "top_tss"],
    kit_bbx_hart: ["kick_throat", "snare_inward", "hat_tk", "top_lip"],
    kit_bbx_bass: ["kick_hum", "snare_k", "hat_cl", "top_clickroll"],
    kit_bbx_mund: ["kick_pop", "snare_psh", "hat_ch", "top_cloc"]
  },
  LV: [0.95, 0.8, 0.5, 0.55],
  bufs: {},
  build(sr) { for (const [kit, ids] of Object.entries(this.KITS)) ids.forEach((id, k) => { const d = this.SND[id](sr, this); for (let i = 0; i < d.length; i++) d[i] *= this.LV[k]; this.bufs[kit + "_" + ["kick", "snare", "hat", "top"][k]] = d; }); return this.bufs; },
  post() { if (this.ok || !Engine.ctx) return; this.ok = true; const sr = Engine.ctx.sampleRate; this.build(sr); for (const [key, d] of Object.entries(this.bufs)) Engine.post({ t: "iz", key: "drum:" + key, m: 60, hz: midiHz(60), d: d.slice(0), ls: 0, le: 0 }); }
};
{ const kt = Techno.kits.bind(Techno); Techno.kits = function () { const r = kt(); try { BBX.post(); } catch (e) { console.warn("BBX", e); } return r; }; }
// Beatbox-Kits als Formen (Kategorie Stimmen)
{ const ENV = { att: 0.001, dec: 0.35, sus: 0, rel: 0.18, bt: 0.1, nb: 0, nz: 0, mt: 0 };
  K.SEEDS.push(
    { id: "kit_bbx", cat: "stimme", kit: "kit_bbx", name: "Beatbox", fam: "Beatbox", kind: "drum", desc: "B · Pf · ts · tsss – klassisch aus dem Mund", size: 1.05, stretch: 0.85, spin: 0, env: ENV, shape: s => { s.cap(0.85, 0.35, 0.25); s.band(-0.2, 0.08, 0.3); } },
    { id: "kit_bbx_hart", cat: "stimme", kit: "kit_bbx_hart", name: "Beatbox hart", fam: "Beatbox", kind: "drum", desc: "Kehlbass · eingezogenes K · tk · Lippenroller", size: 1.12, stretch: 0.75, spin: 0, env: ENV, shape: s => { s.spikes(5, 0.18, 0.12, 9); s.band(0, 0.1, 0.3); } },
    { id: "kit_bbx_bass", cat: "stimme", kit: "kit_bbx_bass", name: "Beatbox Bass", fam: "Beatbox", kind: "drum", desc: "gesummter Bass · K-Klick · Zungenklick · Klickrolle", size: 1.2, stretch: 0.7, spin: 0, env: ENV, shape: s => { s.waves(4, 0.07); s.band(-0.45, 0.14, 0.3); } },
    { id: "kit_bbx_mund", cat: "stimme", kit: "kit_bbx_mund", name: "Mund-Percussion", fam: "Beatbox", kind: "drum", desc: "Wangen-Pop · Psh · tch · Zungen-Klock", size: 0.95, stretch: 0.9, spin: 0, env: ENV, shape: s => { s.lumps(5, 0.09, 0.4, 31); } });
}

// ---------- 2) Mehrere Instrumente auf einem Körper: Zonen unten → oben ----------
const Zones = {
  PRESETS: [
    ["band", "Band", ["kit_909", "fingerbass", "westerngitarre", "klavier"]],
    ["bbx", "Beatbox-Band", ["kit_bbx", "synthbass", "stimme_aah"]],
    ["akustik", "Akustik", ["kontrabass", "westerngitarre", "floete"]],
    ["elektro", "Elektro", ["kit_minimal", "acid303", "supersaw"]],
    ["orchester", "Orchester", ["kontrabass", "cello", "streicher", "harfe"]],
    ["jazz", "Jazz", ["kit_bbx_mund", "kontrabass", "klavier", "saxofon"]]
  ],
  on(f) { return !!(f && f.layer && f.layer.zones); },
  n(f) { return this.on(f) ? f.layer.parts.length : 0; },
  zoneOf(f, u) { const n = this.n(f); return clamp(Math.floor(clamp(u, 0, 0.9999) * n), 0, n - 1); },
  part(id, f) {
    const sd = K.seedById(id); let h; try { h = K.seedShape(sd); } catch (_) { h = Float32Array.from(f.h); }
    return { kind: sd.kind || "synth", seedId: sd.id, inst: sd.id, real: !!sd.gm, name: sd.name, h, size: sd.size || 1, stretch: sd.stretch || 1, spin: 0, oct: sd.oct || 0, env: { ...sd.env } };
  },
  // Form mit Zonen anlegen (auf die gewählte Form legen: Gestalt, Farbe, Platz, Loops bleiben)
  apply(f, ids, asNew) {
    ids = ids.filter(id => K.seedById(id).id === id).slice(0, 4); if (ids.length < 2) { UI.toast("Mindestens zwei Instrumente wählen", 2000); return null; }
    Undo.push(); const parts = ids.map(id => this.part(id, f)), first = K.seedById(ids[0]);
    const name = ids.map(id => K.seedById(id).name).join(" · ").slice(0, 40);
    const nf = Forms.make({ seedId: ids.find(id => K.seedById(id).kind !== "drum") || ids[0], name, kind: "synth", h: Float32Array.from(f ? f.h : K.seedShape(first)), size: f ? f.size : 1, stretch: f ? f.stretch : 1, spin: f ? f.spin : 0.2, env: { ...(K.seedById(ids.find(id => K.seedById(id).kind !== "drum") || ids[0]).env) },
      layer: { parts, bal: 0.5, zones: ids.length }, paint: f && f.paint, pw: f && f.pw, pos: f && !asNew ? { ...f.pos } : undefined });
    if (!nf) { UI.toast("Kein Platz für eine weitere Form", 2000); return null; }
    if (f && !asNew) { nf.takes = f.takes || []; nf.fine = { ...(f.fine || {}) }; try { if (f.fade) nf.fade = { ...f.fade }; } catch (_) {} Forms.remove(f); }
    Forms.rebuild(nf, true); Forms.setActive(nf); UI.refresh(); Save.soon();
    UI.toast(`${nf.name}: unten ${K.seedById(ids[0]).name} … oben ${K.seedById(ids[ids.length - 1]).name} – tippen spielt die Zone`, 3600); return nf;
  },
  // Anzeige: Zonenliste unter dem Namen, die gespielte leuchtet auf
  legend() {
    const fn = $("formname"), f = Forms.active; if (!fn) return; let L = fn.querySelector(".zlegend");
    const show = f && this.on(f) && Scene.view === "nah" && UI.tab === "klang";
    if (!show) { if (L) L.remove(); return; }
    if (!L) { L = document.createElement("div"); L.className = "zlegend"; fn.appendChild(L); }
    const h = f.layer.parts.map((p, k) => `<span data-z="${k}">${k === f.layer.parts.length - 1 ? "▲" : k === 0 ? "▼" : "■"} ${esc(p.name)}</span>`).reverse().join("");
    if (L._h !== h) { L._h = h; L.innerHTML = h; }
  },
  flash(f, k) { if (f !== Forms.active) return; const s = document.querySelector(`.zlegend [data-z="${k}"]`); if (!s) return; s.classList.add("hit"); clearTimeout(s._t); s._t = setTimeout(() => s.classList.remove("hit"), 220); },
  // Blatt: Instrumente wählen
  sheet() {
    const f = Forms.active, cur = this.on(f) ? f.layer.parts.map(p => p.seedId) : ["kit_909", "fingerbass", "klavier"];
    this.sel = cur.slice();
    const s = Sheets.open("Zonen", Sheets.head("🎛 Mehrere Instrumente auf einem Körper") + `<div id="zoS"></div>`);
    s.addEventListener("click", e => this.click(e)); s.addEventListener("change", e => this.change(e)); this.render();
  },
  opts() { if (this._o) return this._o; const list = K.SEEDS.filter(sd => !sd.hidden && sd.name && sd.fam && sd.kind !== "fx" && !String(sd.id).startsWith("t_"));
    const grp = {}; for (const sd of list) (grp[sd.kind === "drum" ? "Schlagzeug & Beatbox" : sd.cat === "techno" ? "Techno & Bass" : sd.cat === "stimme" ? "Stimmen" : "Instrumente"] ||= []).push(sd);
    return this._o = Object.entries(grp).map(([g, L]) => `<optgroup label="${esc(g)}">${L.map(sd => `<option value="${sd.id}">${esc(sd.name)}</option>`).join("")}</optgroup>`).join(""); },
  render() {
    const el = $("zoS"); if (!el) return; const f = Forms.active, S = this.sel;
    const rows = S.map((id, k) => `<div class="zrow"><span class="zpos">${k === S.length - 1 ? "oben" : k === 0 ? "unten" : "Mitte"}</span><select class="txt" data-zi="${k}">${this.opts()}</select>${S.length > 2 ? `<button data-zo="rm" data-i="${k}" aria-label="Zone entfernen">✕</button>` : ""}</div>`).reverse().join("");
    el.innerHTML = `<p class="kch">Der Körper wird von <b>unten nach oben</b> in Zonen geteilt – jede Zone ist ein eigenes Instrument mit vollem Tonumfang. <b>Tippen</b> spielt das Instrument der Zone, <b>mehrere Finger</b> spielen mehrere zugleich, <b>drehen</b> lässt alle Zonen im Takt spielen. Loops merken sich die Zone.</p>
      <div class="npm">${this.PRESETS.map(([k, n, L]) => `<button class="npc" data-zo="pre" data-k="${k}">${n}<small>${L.length}</small></button>`).join("")}</div>
      <div class="zlist">${rows}</div>
      ${S.length < 4 ? `<button class="btn" data-zo="add">＋ Zone</button>` : ""}
      <div class="row"><button class="btn primary" data-zo="apply"${f ? "" : " disabled"}>Auf „${esc(f ? f.name : "–")}“ legen</button><button class="btn" data-zo="new">Als neue Form</button></div>
      <p class="kch">Gestalt, Farbe, Platz und Loops der Form bleiben. ↶ macht es rückgängig.</p>`;
    el.querySelectorAll("select[data-zi]").forEach(x => x.value = S[+x.dataset.zi]);
  },
  change(e) { const t = e.target; if (t.dataset.zi != null) this.sel[+t.dataset.zi] = t.value; },
  click(e) { const b = e.target.closest("[data-zo]"); if (!b) return; Hap(6); const k = b.dataset.zo;
    if (k === "pre") { this.sel = (this.PRESETS.find(p => p[0] === b.dataset.k) || [, , []])[2].filter(id => K.seedById(id).id === id); this.render(); return; }
    if (k === "add") { if (this.sel.length < 4) this.sel.push("klavier"); this.render(); return; }
    if (k === "rm") { this.sel.splice(+b.dataset.i, 1); this.render(); return; }
    if (k === "apply" || k === "new") { const nf = this.apply(Forms.active, this.sel, k === "new"); if (nf) UI.hideSheets(); } }
};
// Spielen: die Zone wählt das Instrument; innerhalb der Zone voller Tonumfang
{ const pl0 = Forms.play.bind(Forms), sr0 = Forms.sources.bind(Forms);
  Forms.sources = function (f) { const L = sr0(f); return f && f.layer && this._only ? L.filter(s => s.src === this._only) : L; };
  Forms.play = function (f, u, vel, opts = {}) {
    if (!Zones.on(f)) return pl0(f, u, vel, opts);
    const k = opts.zk != null ? opts.zk : Zones.zoneOf(f, u), n = Zones.n(f), ul = clamp(u * n - k, 0, 1), keep = this._only;
    this._only = f.layer.parts[k];
    try { const h = pl0(f, ul, vel, Object.assign({}, opts, { zone: f.layer.parts[k].kind === "drum" ? (opts.zone || K.kitZone(ul)) : opts.zone })); if (h) { h.zk = k; h.u = u; } Zones.flash(f, k); return h; }
    finally { this._only = keep; }
  };
}
setInterval(() => { try { Zones.legend(); } catch (_) {} }, 300);
// Kreis, Menü, Steuerfeld
Cmd.L.zonen = { g: "klang", ic: () => '<svg viewBox="0 0 24 24"><rect x="5" y="3" width="14" height="18" rx="7"/><path d="M5 9h14M5 15h14"/></svg>', n: f => Zones.on(f) ? "Zonen ändern" : "Mehrere Instrumente", run: () => Zones.sheet() };
{ const g = Cmd.GROUPS.find(x => x[0] === "klang"); if (g && !g[3].includes("zonen") && g[3].length < 8) g[3].push("zonen"); else { const g2 = Cmd.GROUPS.find(x => x[3].length < 8 && !x[3].includes("zonen")); if (g2) g2[3].push("zonen"); } }
{ const run0 = Cmd.run.bind(Cmd); Cmd.run = function (id, f) { if (id === "zonen") { Hap(6); Zones.sheet(); return; } return run0(id, f); }; }
// „+ Neu“: Kachel „Mehrere Instrumente“
{ const sd0 = Sheets.seeds.bind(Sheets); Sheets.seeds = function (replaceFor) { const r = sd0(replaceFor); try { if (!replaceFor) { const g = document.querySelector('#seedGrid .seedcat[data-cat="inst"] .grid2'); if (g && !g.querySelector("[data-zones]")) { g.insertAdjacentHTML("afterbegin", `<button class="tile ztile" data-zones="1"><strong>🎛 Mehrere Instrumente</strong><span>ein Körper, unten → oben verschiedene Instrumente – live spielen</span></button>`); g.querySelector("[data-zones]").addEventListener("click", e => { e.stopPropagation(); Hap(); UI.hideSheets(); Zones.sheet(); }, true); } } } catch (e) { console.warn(e); } return r; }; }

// ---------- 3) Audiospuren: Gesang linear · Riffs als Loop · Eingang wählbar · robuste Aufnahme ----------
Object.assign(Sing, {
  mode: store.get("singMode") || "gesang",          // gesang | riff
  bars: +store.get("singBars") || 2,
  dev: store.get("singDev") || "",
  constraints(instr) {
    const a = { echoCancellation: !instr && !this.phones, noiseSuppression: false, autoGainControl: false };
    if (this.dev) a.deviceId = { exact: this.dev };
    return { audio: a };
  },
  async getStream(instr) {
    if (!this.dev && (instr || this.phones) && MicStart.stream && MicStart.stream.active) { MicLog.add("Mikrofon: Start-Freigabe wird benutzt"); return MicStart.stream.clone(); }
    try { return await navigator.mediaDevices.getUserMedia(this.constraints(instr)); }
    catch (e) { MicLog.add(`getUserMedia: ${e.name} ${e.message || ""}`); if (e.name === "OverconstrainedError" || e.name === "NotFoundError" && this.dev) { this.dev = ""; store.set("singDev", ""); return await navigator.mediaDevices.getUserMedia({ audio: true }); } throw e; }
  },
  async startRec2() {
    if (this.rec || !Engine.ctx) return; const why = MicFix.reason(null), instr = this.mode === "riff";
    MicLog.add(`Aufnahme ${instr ? "Riff " + this.bars + " Takte" : "Gesang"} · Adresse ${location.protocol} · ${why || "Mikrofon erlaubt"}`);
    if (why) { this.importPick(true); setTimeout(() => MicFix.tell(why), 400); return; }
    if (Engine.ctx.state !== "running") try { await Engine.ctx.resume(); } catch (_) {}
    const restart = this.fromStart || !Transport.running; if (restart && Transport.running) Transport.stop();
    let stream; try { stream = await this.getStream(instr); } catch (e) { MicFix.tell(MicFix.reason(e)); return; }
    const tr = stream.getAudioTracks()[0], st = tr && tr.getSettings ? tr.getSettings() : {};
    MicLog.add(`Spur: ${tr ? tr.label || "Mikrofon" : "?"} · ${st.sampleRate || "?"} Hz · Echo ${st.echoCancellation} · Latenz ${st.latency != null ? Math.round(st.latency * 1000) + " ms" : "?"}`);
    if (Engine.ctx.state !== "running") try { await Engine.ctx.resume(); } catch (_) {}   // iOS: Freigabe kann den Ton anhalten
    const c = Engine.ctx, sr = c.sampleRate, R = this.rec = { stream, chunks: [], rt0: null, lv: 0, S: null, sr, instr, loop: instr ? this.bars : 0, way: "worklet" };
    try { R.src = c.createMediaStreamSource(stream); R.n = Engine.makeRec(1); R.z = c.createGain(); R.z.gain.value = 0; R.src.connect(R.n.input || R.n); R.n.connect(R.z).connect(c.destination);
      R.n.port.onmessage = e => { const d = e.data; if (d.t === "t0") R.rt0 = d.v; else if (d.t === "chunk") R.chunks.push(d.d[0]); else if (d.t === "lvl") R.lv = d.v; else if (d.t === "end" && R.done) R.done(); };
      R.n.port.postMessage({ on: true, ch: 1 }); }
    catch (e) { MicLog.add(`Direktweg geht nicht (${e.name || e}) → Umweg MediaRecorder`); this.mrOn(R); }
    // Wächter: kommt vom Direktweg nichts an, nimmt der Browser selbst auf
    setTimeout(() => { if (this.rec === R && R.way === "worklet" && !R.chunks.length) { MicLog.add("Direktweg liefert nichts → Umweg MediaRecorder"); try { R.n.port.postMessage({ on: false }); R.src.disconnect(); } catch (_) {} this.mrOn(R); } }, 1300);
    if (restart) { LoopCtl.release && LoopCtl.release(); Transport.start(); R.S = 16; } else R.S = Math.ceil((Transport.step + 4) / 16) * 16;
    R.T = () => Transport.t0 + R.S * Transport.spb; R.bpm = Music.tempo();
    if (R.loop) { const dur = R.loop * 16 * Transport.spb; R.endT = setTimeout(() => { if (this.rec === R) this.stopRec(); }, Math.max(500, (R.T() - Engine.now() + dur + 0.35) * 1000)); }
    MicLog.add(`läuft · Start Takt ${R.S / 16 + 1}`);
    UI.hideSheets(); Hap(12); this.tick = setInterval(() => this.pill(), 120); this.pill(); this.sync(); document.body.classList.add("ksing");
  },
  mrOn(R) {
    const mime = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"].find(m => window.MediaRecorder && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(m)) || "";
    try { R.mr = new MediaRecorder(R.stream, mime ? { mimeType: mime } : undefined); } catch (e) { MicLog.add("MediaRecorder fehlt: " + (e.name || e)); return; }
    R.parts = []; R.mime = mime; R.mr.ondataavailable = e => { if (e.data && e.data.size) R.parts.push(e.data); }; R.mrDone = new Promise(r => R.mr.onstop = r);
    R.mr.start(200); R.way = "mr"; R.rt0 = Engine.now() + 0.03; R.lv = 0.3;
  },
  async stopRec2(cancel) {
    const R = this.rec; if (!R) return; clearTimeout(R.endT); clearInterval(this.tick); this.pillEl(null); document.body.classList.remove("ksing");
    let x = null;
    if (R.way === "mr") { try { R.mr.stop(); } catch (_) {} await Promise.race([R.mrDone, new Promise(r => setTimeout(r, 1500))]); R.stream.getTracks().forEach(t => t.stop()); this.rec = null; this.sync();
      if (cancel) { UI.toast("Aufnahme verworfen", 1400); return; }
      try { const ab = await AudioIn.decodeFile(new File([new Blob(R.parts, { type: R.mime || "audio/webm" })], "a")); R.sr = ab.sampleRate; x = new Float32Array(ab.length); for (let c = 0; c < ab.numberOfChannels; c++) { const d = ab.getChannelData(c); for (let i = 0; i < ab.length; i++) x[i] += d[i] / ab.numberOfChannels; } }
      catch (e) { MicLog.add("Umweg-Aufnahme nicht lesbar: " + (e.name || e)); UI.toastAct("Die Aufnahme ließ sich nicht lesen", "Prüfen", () => MicFix.sheet(), 5000); return; } }
    else { const end = new Promise(r => { R.done = r; setTimeout(r, 700); }); try { R.n.port.postMessage({ on: false }); } catch (_) {} await end;
      try { R.src.disconnect(); R.n.disconnect(); } catch (_) {} R.stream.getTracks().forEach(t => t.stop()); this.rec = null; this.sync();
      if (cancel) { UI.toast("Aufnahme verworfen", 1400); return; }
      const total = R.chunks.reduce((a, c) => a + c.length, 0); x = new Float32Array(total); let o = 0; for (const ch of R.chunks) { x.set(ch, o); o += ch.length; } }
    MicLog.add(`gestoppt · ${(x.length / R.sr).toFixed(1)} s aufgenommen (${R.way === "mr" ? "Umweg" : "direkt"})`);
    const c = Engine.ctx, tr = R.stream.getAudioTracks()[0], inLat = (tr && tr.getSettings && tr.getSettings().latency) || 0.01, outLat = (c.outputLatency || 0) + (c.baseLatency || 0);
    const i0 = Math.round((R.T() + outLat + inLat - (R.rt0 ?? R.T())) * R.sr);
    if (i0 >= x.length - R.sr * 0.3) { MicLog.add("zu kurz – vor der Eins beendet"); UI.toast("Zu kurz – die Aufnahme beginnt erst zur Eins nach dem Einzählen", 2600); return; }
    let y = i0 >= 0 ? x.slice(i0) : (() => { const a = new Float32Array(x.length - i0); a.set(x, -i0); return a; })();
    let pk = 0; for (let i = 0; i < y.length; i += 5) pk = Math.max(pk, Math.abs(y[i])); MicLog.add(`Spitzenpegel ${Math.round(pk * 100)} %`);
    if (pk < 0.003) { UI.toastAct("In der Aufnahme war es still – ist das richtige Mikrofon gewählt?", "Prüfen", () => MicFix.sheet(), 5000); return; }
    if (R.loop) {   // Riff: genau N Takte, Ränder weich
      const len = Math.round(R.loop * 16 * Transport.spb * R.sr); const z = new Float32Array(len); z.set(y.subarray(0, len)); y = z; const fd = Math.min(220, len >> 4); for (let i = 0; i < fd; i++) { y[i] *= i / fd; y[len - 1 - i] *= i / fd; }
    } else { let e = y.length; while (e > R.sr && Math.abs(y[e - 1]) < 0.002) e--; y = y.slice(0, Math.min(y.length, e + R.sr * 0.3)); for (let i = 0; i < Math.min(2000, y.length); i++) y[y.length - 1 - i] *= i / 2000; }
    await this.add(y, R.sr, R.S, R.loop ? { loop: R.loop, bpm: R.bpm, kind: "riff" } : { kind: "gesang" });
  },
  // Abspielen: linear oder als Loop im Takt
  onStep(step, time) {
    if (this.rec && this.rec.S != null && step < this.rec.S && step % 4 === 0 && step >= this.rec.S - 16) { try { Metro.click(time, step % 16 === 0); } catch (_) {} }
    for (const t of this.tracks) {
      if (t.mute) continue; const L = (t.loop | 0) * 16;
      const hit = L ? step >= t.at && (step - t.at) % L === 0 : t.at === step; if (!hit) continue;
      const b = this.bufs.get(t.rec); if (!b) { this.buf(t); continue; }
      if (L) { this.srcs.filter(e => e.t === t).forEach(e => { try { e.s.stop(time + 0.004); } catch (_) {} }); this.playLoop(t, b, time, L * Transport.spb); } else this.play(t, b, time);
    }
  },
  playLoop(t, b, time, dur) {
    const c = Engine.ctx, s = c.createBufferSource(), g = c.createGain(); s.buffer = b; g.gain.value = t.vol; s.connect(g).connect(this.out());
    let when = time + t.off / 1000, off = 0; if (when < c.currentTime) { off = c.currentTime - when; when = c.currentTime; } if (off >= Math.min(dur, b.duration)) return;
    s.start(when, off, Math.max(0.01, Math.min(dur, b.duration) - off)); const e = { s, g, t }; this.srcs.push(e); s.onended = () => { const i = this.srcs.indexOf(e); if (i >= 0) this.srcs.splice(i, 1); }; this.sync();
  },
  async inputs() { try { const L = await navigator.mediaDevices.enumerateDevices(); return L.filter(d => d.kind === "audioinput"); } catch (_) { return []; } },
  render2() {
    const el = $("singS"); if (!el) return; const why = MicFix.reason(null), barSec = Transport.spb * 16;
    const rows = this.tracks.map((t, i) => { const bars = t.len ? Math.max(1, Math.round(t.len / barSec)) : 0, pl = this.playing(t), riff = (t.loop | 0) > 0;
      const tempoWarn = riff && t.bpm && Math.abs(t.bpm - Music.tempo()) > 0.5 ? ` · ⚠ aufgenommen bei ${Math.round(t.bpm)} BPM` : "";
      return `<div class="sgr${t.mute ? " mute" : ""}${pl ? " pl" : ""}${riff ? " riff" : ""}"><div class="sgh"><b>${riff ? "🎸" : "🎙"} ${esc(t.name)}</b><small>${riff ? `Loop ${t.loop} Takt${t.loop > 1 ? "e" : ""} ab Takt ${Math.floor(t.at / 16) + 1}` : `ab Takt ${Math.floor(t.at / 16) + 1}${t.at % 16 ? `.${(t.at % 16) / 4 + 1}` : ""} · ${t.len ? this.fmt(t.len) + ` · ≈ ${bars} Takte` : "…"}`}${t.off ? ` · Versatz ${t.off > 0 ? "+" : ""}${t.off} ms` : ""}${tempoWarn}</small></div>
        <div class="sgc"><button data-sg="pre" data-i="${i}" aria-label="${esc(t.name)} allein anhören">▶</button><button data-sg="mute" data-i="${i}" aria-pressed="${t.mute}" aria-label="stumm">${t.mute ? "🔇" : "🔊"}</button>
          <input type="range" min="0" max="1.5" step="0.05" value="${t.vol}" data-sg="vol" data-i="${i}" aria-label="Lautstärke ${esc(t.name)}">
          <button data-sg="barm" data-i="${i}" aria-label="einen Takt früher">◀ Takt</button><button data-sg="barp" data-i="${i}" aria-label="einen Takt später">Takt ▶</button>
          <button data-sg="offm" data-i="${i}" aria-label="20 ms früher">−20 ms</button><button data-sg="offp" data-i="${i}" aria-label="20 ms später">+20 ms</button>
          <button data-sg="del" data-i="${i}" class="del" aria-label="${esc(t.name)} löschen">✕</button></div></div>`; }).join("");
    const ins = this._ins || [], insOk = ins.length > 1 || ins.some(d => d.label);
    if (!this._insAt || Date.now() - this._insAt > 8000) { this._insAt = Date.now(); this.inputs().then(L => { const k = L.map(d => d.deviceId + d.label).join(); if (k !== (this._insK || "")) { this._ins = L; this._insK = k; if (Sheets.cur === "Gesang") this.render(); } }); }
    el.innerHTML = `<p class="kch"><b>Gesang</b> läuft wie auf einem Band linear ab seinem Takt mit. Ein <b>Riff</b> (z. B. echte Gitarre) wird genau 1, 2, 4 oder 8 Takte lang aufgenommen und läuft dann <b>im Takt endlos</b> – wie ein Loop, aber als echte Aufnahme.</p>
      ${why ? `<p class="sgwarn">${esc(MicFix.TXT[why])} „● Aufnehmen“ öffnet dann die Aufnahme-App; die Spur liegt ab Takt 1 und lässt sich mit Takt ◀ ▶ / Versatz anlegen. <button class="btn" data-sg="why">Warum?</button></p>` : ""}
      <div class="seg2 sgmode" role="group" aria-label="Art der Aufnahme"><button data-sg="mode" data-v="gesang" aria-pressed="${this.mode === "gesang"}">🎙 Gesang</button><button data-sg="mode" data-v="riff" aria-pressed="${this.mode === "riff"}">🎸 Riff als Loop</button></div>
      ${this.mode === "riff" ? `<div class="npm sgbars">${[1, 2, 4, 8].map(b => `<button class="npc" data-sg="bars" data-v="${b}" aria-pressed="${this.bars === b}">${b} Takt${b > 1 ? "e" : ""}</button>`).join("")}</div>` : ""}
      <div class="row sgrec"><button class="btn primary" data-sg="rec">${this.rec ? "■ Fertig" : this.mode === "riff" ? `● Riff aufnehmen (${this.bars} Takt${this.bars > 1 ? "e" : ""})` : "● Einsingen"}</button><button class="btn" data-sg="play">${Transport.running ? "■ Stopp" : "▶ Alles von vorn"}</button></div>
      <div class="sgopt">
        ${insOk ? `<label>Eingang <select class="txt" data-sg="dev"><option value="">Standard-Mikrofon</option>${ins.map(d => `<option value="${esc(d.deviceId)}"${d.deviceId === this.dev ? " selected" : ""}>${esc(d.label || "Eingang " + d.deviceId.slice(0, 5))}</option>`).join("")}</select></label>` : ""}
        <label><input type="checkbox" data-sg="start" ${this.fromStart ? "checked" : ""}> Von vorn mit 1 Takt Einzählen (sonst ab der nächsten Eins)</label>
        <label><input type="checkbox" data-sg="phones" ${this.phones ? "checked" : ""}> 🎧 Mit Kopfhörern (bester Klang). ${this.mode === "riff" ? "Riffs werden immer ohne Sprachfilter aufgenommen." : "Ohne Kopfhörer filtert KLANGRAUM die Musik aus dem Mikrofon."}</label></div>
      <div class="sgl">${rows || `<p class="cueno">Noch keine Audiospur. „● Einsingen“ oder „● Riff aufnehmen“: die Musik startet von vorn, nach einem Takt Einzählen spielst du.</p>`}</div>
      <div class="row"><button class="btn" data-sg="file">Audiodatei als Spur …</button><button class="btn" data-sg="log">Aufnahme-Protokoll</button></div>`;
  }
});
// Daten: Loop und Tempo der Spur mitspeichern
{ const ld = Sing.load.bind(Sing); Sing.load = function (d) { ld(d); try { const src = d && Array.isArray(d.tracks) ? d.tracks : []; this.tracks.forEach(t => { const o = src.find(x => x && x.id === t.id) || {}; t.loop = o.loop | 0; t.bpm = +o.bpm || 0; t.kind = o.kind || (t.loop ? "riff" : "gesang"); }); } catch (_) {} }; }
{ const ad = Sing.add.bind(Sing); Sing.add = async function (y, sr, at, meta) {
  const riff = meta && meta.loop; const t = await ad(y, sr, at); if (!t) return t;
  if (riff) { t.loop = meta.loop; t.bpm = meta.bpm; t.kind = "riff"; t.name = `Riff ${this.tracks.filter(x => x.loop).length}`; Save.soon(); this.sync(); UI.toastAct(`🎸 ${t.name}: ${t.loop} Takt${t.loop > 1 ? "e" : ""} im Loop ab Takt ${Math.floor(at / 16) + 1}`, "Anhören", () => this.restart(), 4200); }
  MicLog.add(`gespeichert als ${t.name}`); return t; }; }
// Bedienung im Blatt
{ const ck = Sing.click.bind(Sing); Sing.click = function (e) {
  const b = e.target.closest("[data-sg]"); if (!b) return; const k = b.dataset.sg;
  if (k === "mode") { Hap(6); this.mode = b.dataset.v; store.set("singMode", this.mode); this.render(); return; }
  if (k === "bars") { Hap(6); this.bars = +b.dataset.v; store.set("singBars", this.bars); this.render(); return; }
  if (k === "log") { Hap(6); MicFix.sheet(); return; }
  if (k === "dev") return;
  return ck(e); }; }
document.addEventListener("change", e => { const t = e.target; if (t && t.dataset && t.dataset.sg === "dev") { Sing.dev = t.value; store.set("singDev", Sing.dev); MicLog.add("Eingang gewählt: " + (t.selectedOptions[0] ? t.selectedOptions[0].textContent : t.value)); } });
// Anzeige während der Aufnahme: Riff zählt seine Takte
{ const p0 = Sing.pill.bind(Sing); Sing.pill = function () { const R = this.rec; if (!R || !R.loop) return p0();
  const left = R.T() - Engine.now(), beat = Transport.spb * 4, bar = Math.floor(-left / (beat * 4)) + 1;
  const txt = left > 0 ? `<b>🎸 Einzählen … ${Math.max(1, Math.ceil(left / beat - 0.08))}</b><small>gleich spielen – ${R.loop} Takt${R.loop > 1 ? "e" : ""}</small>` : `<b>🎸 Riff · Takt ${Math.min(R.loop, bar)}/${R.loop}</b><small>stoppt von selbst · tippen = früher fertig</small>`;
  const p = this.pillEl(txt + `<i style="--lv:${Math.min(1, R.lv * 2.2).toFixed(2)}"></i>`); if (p) p.classList.toggle("cnt", left > 0); }; }
// Menü/Chip-Beschriftung
{ const c0 = Sing.chip.bind(Sing); Sing.chip = function () { const h = c0(); return h.replace('aria-label="Gesangsspuren', 'aria-label="Audiospuren'); }; }
// Prüfseite: Protokoll zeigen
{ const sh = MicFix.sheet.bind(MicFix); MicFix.sheet = async function () { await sh(); const x = document.querySelector(".mfx"); if (!x || x.querySelector(".mflog")) return;
  x.insertAdjacentHTML("beforeend", `<h3 class="ph3">Aufnahme-Protokoll</h3><pre class="mflog">${esc(MicLog.text())}</pre><div class="row"><button class="btn" data-mfl="copy">Protokoll kopieren</button></div>`);
  x.querySelector("[data-mfl]").onclick = async () => { try { await navigator.clipboard.writeText(`KLANGRAUM ${navigator.userAgent}\n` + MicLog.text()); UI.toast("Protokoll kopiert – einfach an Claude schicken", 2200); } catch (_) { UI.toast("Kopieren gesperrt – bitte Bildschirmfoto", 2200); } }; }; }
// Protokoll auch bei Mikro → Form
{ const m0 = MicForm.start; MicForm.start = function () { MicLog.add(`Mikro → Form · ${location.protocol} · ${MicFix.reason(null) || "Mikrofon erlaubt"}`); return m0.apply(this, arguments); }; }
{ const a0 = MicStart.ask.bind(MicStart); MicStart.ask = async function () { MicLog.add(`Start · ${location.protocol} · eingebettet ${MicFix.env().framed} · ${MicFix.reason(null) || "Mikrofon erlaubt"}`); const r = await a0(); MicLog.add(`Start-Freigabe: ${MicStart.stream && MicStart.stream.active ? "bereit" : "nicht aktiv"}`); return r; }; }

// ---------- Hilfe ----------
{ const g = Help.T.find(x => x.id === "gesang"); if (g) { g.t = "Audiospuren: Gesang & echte Riffs"; g.k += " riff gitarre instrument loop interface eingang usb echte"; g.h = g.h.replace("</ul>", `<li><b>🎸 Riff als Loop</b>: oben „Riff als Loop“, Länge 1/2/4/8 Takte wählen, „● Riff aufnehmen“ – nach einem Takt Einzählen spielst du (z. B. Gitarre ins Mikrofon oder über ein USB-Audio-Interface), nach genau N Takten stoppt es von selbst und läuft dann <b>im Takt endlos</b>. Riffs werden ohne Sprachfilter aufgenommen. Bei anderem Tempo neu aufnehmen (⚠-Hinweis).</li><li><b>Eingang</b>: bei mehreren Mikrofonen/Interfaces im Blatt wählen.</li><li>Klappt es nicht? <b>Aufnahme-Protokoll</b> im Blatt zeigt jeden Schritt – „Protokoll kopieren“ und an Claude schicken.</li></ul>`); } }
Help.T.push({ id: "zonen", ic: "🎛", t: "Mehrere Instrumente auf einem Körper", k: "zonen mehrere instrumente körper form band beatbox live spielen", h: `<ul>
  <li><b>＋ Neu → 🎛 Mehrere Instrumente</b> oder Kreis → Klang → „Mehrere Instrumente“: bis zu 4 Instrumente wählen (oder Vorlage: Band, Beatbox-Band, Akustik, Elektro, Orchester, Jazz).</li>
  <li>Der Körper wird <b>von unten nach oben</b> in Zonen geteilt. <b>Tippen</b> spielt das Instrument der Zone (mit vollem Tonumfang), <b>mehrere Finger</b> mehrere zugleich, <b>drehen</b> lässt alle Zonen im Takt spielen. Unter dem Namen steht, welche Zone welches Instrument ist; die gespielte leuchtet auf.</li>
  <li>„Auf diese Form legen“ behält Gestalt, Farbe, Platz und Loops. ↶ macht es rückgängig.</li></ul>` });
{ const c = Help.CATS.find(x => x[0] === "Klang formen"); if (c && !c[1].includes("zonen")) c[1].push("zonen"); }
Help.WANT.splice(8, 0, ["Mehrere Instrumente auf einen Körper legen", "zonen"], ["Ein echtes Gitarren-Riff einspielen", "gesang"]);
{ const v = Help.T.find(x => x.id === "forms"); if (v) v.h = v.h.replace("</ul>", "<li><b>Beatbox</b> (Stimmen): vier Kits aus Mundklängen – Beatbox (B · Pf · ts · tsss), Beatbox hart (Kehlbass · eingezogenes K · tk · Lippenroller), Beatbox Bass (gesummter Bass · K · Zungenklick · Klickrolle), Mund-Percussion (Pop · Psh · tch · Klock). Unten Kick, Mitte Snare, oben Hat, ganz oben Effekt.</li></ul>"); }
// Zonen nach sichtbarer Höhe (Welt), nicht nach der mitdrehenden Form – unten bleibt unten
{ const hit0 = Scene.hit.bind(Scene); let box = null; Scene.hit = function (x, y, opts) { const r = hit0(x, y, opts); if (!box && typeof THREE !== "undefined") box = new THREE.Box3();
  try { if (r && r.type === "form" && Zones.on(r.f) && r.point) { const m = this.meshes.get(r.f.id); if (m && box) { box.setFromObject(m); const hgt = box.max.y - box.min.y; if (hgt > 1e-3) r.u = clamp((r.point.y - box.min.y) / hgt, 0, 1); } } } catch (_) {}
  return r; }; }
