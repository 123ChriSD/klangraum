/* =====================================================================================
   v70: KLANGSCHRIFT · LIVE-FLÄCHE · FETTE KLÄNGE · WUCHT
   – Schrift: ein eigenes Notensystem – Farbe = Ton (1 bis 7), Länge = Dauer, Höhe = Tonhöhe.
              Lesen UND schreiben: tippen setzt einen Ton, ziehen macht ihn länger, nochmal tippen löscht ihn.
   – Live70:  ein Finger formt den ganzen Song: hoch = mehr Band, rechts = heller. Dazu „Stille“ und „Echo“ zum Halten.
   – Fett:    sechs neue Klänge (im Gerät berechnet), ein fettes Schlagzeug, drei neue Song-Stile.
   – Wucht:   Klangwucht auf der Summe (Bassfundament, Glanz, Sättigung, Verdichtung) – ein Regler im Mischen.
   ===================================================================================== */
Object.assign(I67, {
  bolt: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.2 3 5.5 13.6h5.2L9.6 21l8.9-11.4h-5.6z"/></svg>',
  noten: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4.6" width="9" height="3.8" rx="1.9"/><rect x="9" y="10.1" width="12" height="3.8" rx="1.9"/><rect x="5" y="15.6" width="7.5" height="3.8" rx="1.9"/></svg>',
  live: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="2.6"/><circle cx="12" cy="12" r="6.6"/><path d="M12 1.8v2.2M12 20v2.2M1.8 12H4M20 12h2.2"/></svg>'
});

/* ---------- 1) FETT: Klänge aus Sägezähnen – gestapelt, gefiltert, gesättigt ---------- */
const Fett = {
  // osc: [Halbtöne, Cent, Pegel, Welle] · Filter läuft von f0 nach f1 (Zeitmaß ft) · q Güte · drv Sättigung · dec Abklingen (1/s; 0 = hält) · att Einschwingen
  K: {
    reese: { osc: [[0, -15, 1, "saw"], [0, 15, 1, "saw"], [0, 0, 0.45, "sq"]], sub: 0.4, f0: 3200, f1: 760, ft: 0.3, q: 1.5, drv: 2.6, dur: 3.6, dec: 0.45, att: 0.004, hp: 28 },
    sub: { osc: [[0, 0, 1, "sin"]], glide: [14, 0.03], f0: 1200, f1: 1200, ft: 1, q: 0.7, drv: 3.4, dur: 4.2, dec: 0.7, att: 0.002, hp: 22, click: 0.4 },
    saw: { osc: [[0, -27, 0.8, "saw"], [0, -17, 0.9, "saw"], [0, -8, 1, "saw"], [0, 0, 1, "saw"], [0, 8, 1, "saw"], [0, 17, 0.9, "saw"], [0, 27, 0.8, "saw"], [12, -6, 0.32, "saw"], [12, 7, 0.32, "saw"]], f0: 9500, f1: 5600, ft: 0.5, q: 0.8, drv: 1.3, dur: 3.4, dec: 0, att: 0.012, hp: 120 },
    pluck: { osc: [[0, -7, 1, "saw"], [0, 7, 1, "saw"], [12, 0, 0.4, "sq"]], f0: 7800, f1: 430, ft: 0.15, q: 2.4, drv: 1.5, dur: 1.9, dec: 2.4, att: 0.001, hp: 90 },
    lead: { osc: [[0, -9, 1, "saw"], [0, 9, 1, "saw"], [0, 0, 0.6, "sq"], [12, 4, 0.3, "saw"]], f0: 7000, f1: 3800, ft: 0.25, q: 1.4, drv: 2.1, dur: 3.2, dec: 0, att: 0.006, hp: 150 },
    brass: { osc: [[0, -11, 1, "saw"], [0, 11, 1, "saw"], [-12, 0, 0.45, "saw"]], f0: 420, f1: 3900, ft: 0.06, q: 1.1, drv: 1.7, dur: 2.9, dec: 1.0, att: 0.01, hp: 70 }
  },
  blep(t, dt) { if (t < dt) { t /= dt; return t + t - t * t - 1; } if (t > 1 - dt) { t = (t - 1) / dt; return t * t + t + t + 1; } return 0; },
  render(kind, midi, sr) {
    const P = this.K[kind] || this.K.saw, n = Math.round(sr * P.dur), x = new Float32Array(n), f0 = midiHz(midi); let rs = 7001 + midi * 97 + kind.length * 13;
    const rnd = () => { rs = (Math.imul(rs, 1664525) + 1013904223) >>> 0; return rs / 4294967296; };
    for (const [st, ct, a, w] of P.osc) { const dt0 = f0 * Math.pow(2, st / 12 + ct / 1200) / sr; let p = w === "sin" ? 0 : rnd();
      for (let i = 0; i < n; i++) { const dt = P.glide ? dt0 * Math.pow(2, P.glide[0] / 12 * Math.exp(-i / sr / P.glide[1])) : dt0; p += dt; if (p >= 1) p -= 1; let v;
        if (w === "sin") v = Math.sin(2 * Math.PI * p);
        else if (w === "sq") { const p2 = p + 0.5 >= 1 ? p - 0.5 : p + 0.5; v = (p < 0.5 ? 1 : -1) + this.blep(p, dt) - this.blep(p2, dt); }
        else v = 2 * p - 1 - this.blep(p, dt);
        x[i] += v * a; } }
    // Tiefpass mit laufender Eckfrequenz (Zustandsvariablen-Filter)
    { let ic1 = 0, ic2 = 0, a1 = 0, a2 = 0, a3 = 0; const k = 1 / P.q;
      for (let i = 0; i < n; i++) { if ((i & 15) === 0) { const fc = Math.min(sr * 0.45, P.f1 + (P.f0 - P.f1) * Math.exp(-i / sr / P.ft)), g = Math.tan(Math.PI * fc / sr); a1 = 1 / (1 + g * (g + k)); a2 = g * a1; a3 = g * a2; }
        const v3 = x[i] - ic2, v1 = a1 * ic1 + a2 * v3, v2 = ic2 + a2 * ic1 + a3 * v3; ic1 = 2 * v1 - ic1; ic2 = 2 * v2 - ic2; x[i] = v2; } }
    let pk = 1e-6; for (let i = 0; i < n; i++) { const a = Math.abs(x[i]); if (a > pk) pk = a; }
    const G = P.drv / pk, nt = Math.tanh(P.drv), at = Math.max(1, Math.round(sr * P.att)), fo = Math.round(sr * 0.06), w0 = 2 * Math.PI * f0 / sr;
    for (let i = 0; i < n; i++) { let v = Math.tanh(x[i] * G) / nt; if (P.sub) v += P.sub * Math.sin(w0 * i);
      x[i] = v * (i < at ? i / at : 1) * (P.dec ? Math.exp(-i / sr * P.dec) : 1); }
    if (P.click) { let lp = 0; for (let i = 0; i < sr * 0.02 && i < n; i++) { const nz = rnd() * 2 - 1; lp += 0.4 * (nz - lp); x[i] += (nz - lp) * P.click * Math.exp(-i / sr * 300); } }
    RockSnd.bq(x, "hp", P.hp, 0.7, sr);
    for (let i = 0; i < fo; i++) x[n - 1 - i] *= i / fo;
    return x;
  }
};
// die Klangsätze „syn“ (v66) berechnen jetzt auch die fetten Klänge
{ const rr = RockSnd.render.bind(RockSnd); RockSnd.render = function (k, m, sr) { return typeof k === "string" && k.startsWith("f7:") ? Fett.render(k.slice(3), m, sr) : rr(k, m, sr); }; }

// fettes Schlagzeug: Kick mit langem Bauch · Clap-Snare · knappe Hi-Hat · Einschlag (Becken mit Tiefton)
Object.assign(BBX.SND, {
  kick_fett(sr, B) { const n = Math.round(sr * 0.75), b = B.mul(B.sine(n, sr, t => 45 + 165 * Math.exp(-t * 36)), B.env(n, sr, t => Math.exp(-t * 9))), cl = B.mul(B.filt(B.noise(n), "bp", 3800, 0.9, sr), B.env(n, sr, t => Math.exp(-t * 240)));
    return B.norm(B.mix(n, [b, 0.85], [cl, 0.55]), 0.6, 3.2); },
  snare_fett(sr, B) { const n = Math.round(sr * 0.55), cE = t => { let e = 0; for (const t0 of [0, 0.011, 0.023]) if (t >= t0) e += Math.exp(-(t - t0) * 190); return e * 0.6 + (t > 0.03 ? Math.exp(-(t - 0.03) * 17) : 0); },
      clap = B.mul(B.filt(B.noise(n), "bp", 1700, 0.9, sr), B.env(n, sr, cE)), air = B.mul(B.filt(B.noise(n), "hp", 5200, 0.7, sr), B.env(n, sr, t => Math.exp(-t * 24))), body = B.mul(B.sine(n, sr, t => 195 + 60 * Math.exp(-t * 60)), B.env(n, sr, t => Math.exp(-t * 26)));
    return B.norm(B.mix(n, [clap, 1], [air, 0.45], [body, 0.7]), 0.92, 2); },
  hat_fett(sr, B) { const n = Math.round(sr * 0.1), y = new Float32Array(n); for (const f of [3170, 4410, 5530, 6690, 8030, 9310]) { const p = Math.random() * 6; for (let i = 0; i < n; i++) y[i] += Math.sign(Math.sin(2 * Math.PI * f * i / sr + p)); }
    return B.norm(B.mul(B.filt(B.filt(y, "hp", 8200, 0.7, sr), "lp", 14000, 0.7, sr), B.env(n, sr, t => Math.exp(-t * 58))), 0.58, 1); },
  top_fett(sr, B) { const n = Math.round(sr * 2.4), y = new Float32Array(n); for (const f of [3310, 4130, 5570, 6820, 8130, 9450]) { const p = Math.random() * 6; for (let i = 0; i < n; i++) y[i] += Math.sign(Math.sin(2 * Math.PI * f * i / sr + p)) * 0.5; }
    const nz = B.noise(n); for (let i = 0; i < n; i++) y[i] += nz[i] * 1.2;
    const cr = B.mul(B.filt(y, "hp", 3000, 0.6, sr), B.env(n, sr, t => Math.min(1, t * 300) * Math.exp(-t * 1.6))), boom = B.mul(B.sine(n, sr, t => 38 + 60 * Math.exp(-t * 9)), B.env(n, sr, t => Math.exp(-t * 2.6)));
    return B.norm(B.mix(n, [cr, 0.7], [boom, 1]), 0.9, 1.6); }
});
Object.assign(BBX.KITS, { kit_fett: ["kick_fett", "snare_fett", "hat_fett", "top_fett"] });

{ const G = (n, rel, ring, lvl, k, range, loop) => ({ n, ts: n, rel, ring, lvl, loop: !!loop, syn: { k: "f7:" + k, range } }), ENVP = { att: 0.002, dec: 0.6, sus: 0.6, rel: 0.15, bt: 0.4, nb: 0.02, nz: 0, mt: 0 }, ENVL = { att: 0.008, dec: 0.5, sus: 0.92, rel: 0.2, bt: 0, nb: 0.02, nz: 0, mt: 0 }, ENVD = { att: 0.001, dec: 0.5, sus: 0, rel: 0.25, bt: 0.1, nb: 0, nz: 0, mt: 0 };
  K.SEEDS.push(
    { id: "f7_reese", cat: "techno", grp: "Fett (neu)", name: "Monster-Bass", fam: "Techno-Bass", kind: "synth", desc: "zwei verstimmte Sägezähne, knurrt und drückt", size: 1.5, stretch: 0.85, spin: 0, gm: G("f7_reese", 0.12, 0.8, 0.7, "reese", [24, 60, 4]), env: ENVP, shape: s => { s.cap(-0.8, 0.5, 0.5); s.lumps(5, 0.12, 0.4, 11); } },
    { id: "f7_sub", cat: "techno", grp: "Fett (neu)", name: "Donner-Bass", fam: "Techno-Bass", kind: "synth", desc: "ganz tief, lang, mit Schlag am Anfang", size: 1.6, stretch: 0.8, spin: 0, gm: G("f7_sub", 0.2, 1.4, 0.72, "sub", [24, 52, 4]), env: ENVP, shape: s => { s.cap(-0.9, 0.6, 0.55); s.band(0.2, 0.06, 0.3); } },
    { id: "f7_saw", cat: "techno", grp: "Fett (neu)", name: "Hymnen-Säge", fam: "Krasser Sound", kind: "synth", desc: "neun Sägezähne, breit wie ein Stadion", size: 1.2, stretch: 1.15, spin: 0.5, gm: G("f7_saw", 0.3, 0.8, 0.92, "saw", [40, 84, 4], true), env: ENVL, shape: s => { s.spikes(9, 0.14, 0.08, 17); s.tilt(0.1); } },
    { id: "f7_pluck", cat: "techno", grp: "Fett (neu)", name: "Laser-Zupfer", fam: "Krasser Sound", kind: "synth", desc: "kurz, hell, schnappt zu", size: 0.9, stretch: 1.3, spin: 0.3, gm: G("f7_pluck", 0.12, 0.9, 0.95, "pluck", [48, 88, 4]), env: ENVP, shape: s => { s.facets(8, 0.12, 0.25); s.spikes(4, 0.1, 0.1, 5); } },
    { id: "f7_lead", cat: "techno", grp: "Fett (neu)", name: "Sirenen-Lead", fam: "Krasser Sound", kind: "synth", desc: "schneidet durch alles – für die große Melodie", size: 1.0, stretch: 1.35, spin: 0.7, gm: G("f7_lead", 0.2, 0.6, 0.9, "lead", [48, 88, 4], true), env: ENVL, shape: s => { s.spikes(7, 0.13, 0.08, 31); s.tilt(0.18); } },
    { id: "f7_brass", cat: "techno", grp: "Fett (neu)", name: "Synth-Bläser", fam: "Krasser Sound", kind: "synth", desc: "geht auf wie eine Bläsergruppe", size: 1.15, stretch: 1.05, spin: 0.15, gm: G("f7_brass", 0.16, 1.0, 0.95, "brass", [36, 80, 4]), env: ENVP, shape: s => { s.lumps(6, 0.1, 0.45, 23); s.facets(6, 0.08, 0.3); } },
    { id: "kit_fett", cat: "techno", grp: "Fett (neu)", kit: "kit_fett", name: "Fettes Kit", fam: "Techno-Drums", kind: "drum", desc: "Kick mit Bauch, Clap, knappe Hi-Hat, Einschlag", size: 1.3, stretch: 0.64, spin: 0, env: ENVD, shape: s => { s.box(0.12); s.cap(-0.8, 0.45, 0.4); } });
  Object.assign(Perf.REG, { f7_reese: [26, 50, "bass"], f7_sub: [24, 46, "bass"], f7_saw: [48, 76, "arp"], f7_pluck: [52, 84, "arp"], f7_lead: [55, 84, "lead"], f7_brass: [45, 72, "arp"] });
}
// drei neue Stile für den Song-Erzeuger
Object.assign(SongGen.DR, { dnb: [{ K: "x.........x.....", S: "....x.......x...", H: "x.x.x.x.x.x.x.x." }, { K: "x.........x.....", K2: "x......x..x.....", S: "....x.......x..o", H: "x.x.xox.x.x.xox." }] });
Object.assign(SongGen.BS, { reese: [[[0, 0, 6, 0.95], [6, 0, 2, 0.8], [10, 3, 2, 0.7], [12, 0, 3.6, 0.85]], [[0, 0, 10, 0.95], [10, 2, 2, 0.75], [12, 0, 3.6, 0.85]]] });
Object.assign(SongGen.RH, { fest: [[[0, 2.8, 1], [3, 2.8, 0.9], [6, 1.8, 0.85], [8, 2.8, 1], [11, 2.8, 0.9], [14, 1.8, 0.85]], [[0, 3.6, 1], [4, 1.8, 0.8], [6, 1.8, 0.85], [8, 3.6, 1], [12, 1.8, 0.8], [14, 1.8, 0.85]]] });
SongGen.STYLES.unshift(
  { id: "festival", n: "Festival", d: "riesige Sägezähne, fetter Bass, Hände hoch", mood: "episch", bpm: 128, c: ["#FF3CAC", "#7A3CFF"], ic: "bolt",
    parts: [{ r: "beat", seed: "kit_fett", dr: "four", vol: 0.8 }, { r: "bass", seed: "f7_reese", bs: "off", vol: 0.6 }, { r: "akk", seed: "f7_saw", rh: "fest", lo: 55, vol: 0.8 }, { r: "arp", seed: "f7_pluck", ap: 1, lo: 62, d: 1.1, vol: 0.55 }, { r: "mel", seed: "glocke", base: 64, dens: 0, vol: 0.7 }, { r: "hook", seed: "f7_lead", base: 64, dens: 1, vol: 0.85 }] },
  { id: "trap", n: "Trap", d: "Donner-Bass, rasende Hi-Hats, düster", mood: "melan", bpm: 140, c: ["#FF5C5C", "#5C2BD9"], ic: "bolt",
    parts: [{ r: "beat", seed: "kit_fett", dr: "trap", vol: 0.8 }, { r: "bass", seed: "f7_sub", bs: "trap", vol: 0.6 }, { r: "akk", seed: "f7_brass", rh: "dark", lo: 48, vol: 0.85 }, { r: "arp", seed: "f7_pluck", ap: 2, lo: 60, d: 1.5, vol: 0.6 }, { r: "mel", seed: "glocke", base: 69, dens: 0, vol: 0.7 }, { r: "hook", seed: "f7_lead", base: 64, dens: 0, vol: 0.8 }] },
  { id: "dnb", n: "Drum & Bass", d: "rasend schnell, tiefer Bass, weite Flächen", mood: "nacht", bpm: 172, c: ["#35E0D0", "#3C5CFF"], ic: "bolt",
    parts: [{ r: "beat", seed: "kit_fett", dr: "dnb", vol: 0.8 }, { r: "bass", seed: "f7_reese", bs: "reese", vol: 0.6 }, { r: "akk", seed: "f7_saw", rh: "long", lo: 55, vol: 0.6 }, { r: "arp", seed: "f7_pluck", ap: 2, lo: 60, d: 1.6, vol: 0.55 }, { r: "mel", seed: "epiano", base: 60, dens: 0, vol: 0.85 }, { r: "hook", seed: "f7_lead", base: 67, dens: 0, vol: 0.75 }] });

// Messung v70: in Hip-Hop, House und Techno erdrückte die Bassdrum alles andere (über 80 % der Energie unter 150 Hz) – Beat und Bass etwas zurück
{ const V = { hiphop: { beat: 0.5, bass: 0.45 }, house: { beat: 0.5 }, techno: { beat: 0.45, bass: 0.45 } }; for (const [id, o] of Object.entries(V)) { const S = SongGen.byId(id); if (S) for (const p of S.parts) if (o[p.r] != null) p.vol = o[p.r]; } }

/* ---------- 2) WUCHT: Klangwucht auf der Summe + Filter, Echo und Stille für die Live-Fläche ---------- */
const Wucht = {
  v: clamp(+(store.get("wucht") ?? 0.4) || 0, 0, 1), n: null, glue: null,
  word(w = this.v) { return w < 0.08 ? "aus" : w < 0.35 ? "sanft" : w < 0.65 ? "kräftig" : w < 0.9 ? "fett" : "maximal"; },
  // Summe → Filter → Bassfundament → Entmulmen → Glanz → Sättigung → (Stille) → vorhandene Verdichter und Begrenzer
  wire() {
    const c = Engine.ctx; if (this.n) return true; if (!c || !Engine.sum || !this.glue) return false;
    try { Engine.sum.disconnect(this.glue); } catch (e) { console.warn(e); return false; }
    const N = {}, bq = (type, f, q, g) => { const b = c.createBiquadFilter(); b.type = type; b.frequency.value = f; if (q != null) b.Q.value = q; if (g != null) b.gain.value = g; return b; };
    N.lp = bq("lowpass", c.sampleRate * 0.49, 0); N.lo = bq("lowshelf", 75, null, 0); N.mid = bq("peaking", 260, 0.9, 0); N.pr = bq("peaking", 3200, 0.8, 0); N.hi = bq("highshelf", 8500, null, 0);
    N.pre = c.createGain(); N.sh = c.createWaveShaper(); N.sh.oversample = "2x"; N.post = c.createGain(); N.cut = c.createGain();
    N.es = c.createGain(); N.es.gain.value = 0; N.dl = c.createDelay(2); N.dl.delayTime.value = 0.35; N.fb = c.createGain(); N.fb.gain.value = 0.52; N.ef = bq("bandpass", 1500, 0.45); N.eo = c.createGain(); N.eo.gain.value = 0.9;
    Engine.sum.connect(N.lp).connect(N.lo).connect(N.mid).connect(N.pr).connect(N.hi).connect(N.pre).connect(N.sh).connect(N.post).connect(N.cut).connect(this.glue);
    N.post.connect(N.es).connect(N.dl).connect(N.ef).connect(N.fb).connect(N.dl); N.ef.connect(N.eo).connect(this.glue);
    this.n = N; this.apply(true); return true;
  },
  apply(now) {
    const N = this.n; if (!N) return; const w = this.v, t = Engine.ctx.currentTime, tc = now ? 0.001 : 0.05, g = this.glue;
    N.lo.gain.setTargetAtTime(3.5 * w, t, tc); N.mid.gain.setTargetAtTime(-2.5 * w, t, tc); N.pr.gain.setTargetAtTime(2.5 * w, t, tc); N.hi.gain.setTargetAtTime(3.5 * w, t, tc);
    if (w < 0.02) { N.sh.curve = null; N.pre.gain.setTargetAtTime(1, t, tc); N.post.gain.setTargetAtTime(1, t, tc); }
    else { const Kk = 0.2 + 2.8 * w, nt = Math.tanh(Kk), cv = new Float32Array(2049); for (let i = 0; i < 2049; i++) cv[i] = Math.tanh(Kk * (i / 1024 - 1)) / nt; N.sh.curve = cv;
      N.pre.gain.setTargetAtTime(0.5, t, tc); N.post.gain.setTargetAtTime((1 + 0.9 * w) * nt / (0.5 * Kk), t, tc); }
    try { g.threshold.setTargetAtTime(-16 - 5 * w, t, tc); g.ratio.setTargetAtTime(2.6 + 2 * w, t, tc); } catch (_) {}
  },
  set(w) { this.v = clamp(w, 0, 1); store.set("wucht", Math.round(this.v * 100) / 100); this.apply(); },
  // Klangfarbe der ganzen Musik: 0 dumpf … 1 offen
  filter(u) { const N = this.n; if (!N) return; const t = Engine.ctx.currentTime, open = u == null || u >= 0.97, fc = open ? 22000 : 170 * Math.pow(105, clamp(u, 0, 1) / 0.97); N.lp.frequency.setTargetAtTime(open ? Engine.ctx.sampleRate * 0.49 : Math.min(fc, Engine.ctx.sampleRate * 0.45), t, 0.03); N.lp.Q.setTargetAtTime(open ? 0 : 2 + 8 * Math.pow(Math.sin(Math.PI * clamp(u, 0, 1)), 2), t, 0.03); },
  echo(on) { const N = this.n; if (!N) return; const t = Engine.ctx.currentTime; if (on) N.dl.delayTime.setTargetAtTime(clamp(Transport.spb * 3, 0.06, 1.9), t, 0.01); N.es.gain.setTargetAtTime(on ? 0.75 : 0, t, 0.02); },
  cut(on) { const N = this.n; if (!N) return; N.cut.gain.setTargetAtTime(on ? 0 : 1, Engine.ctx.currentTime, 0.008); },
  row() { const u = this.v * 100; return `<div class="mxr wu70" style="--c:#FFB25C"><span class="mxn"><i>${I67.bolt}</i><b>Wucht</b></span><div class="mxfw"><div class="wuf" data-wu role="slider" tabindex="0" aria-label="Wucht: macht den ganzen Klang fetter und lauter" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(u)}"><i class="mxfill" style="width:${u}%"></i><i class="mxk" style="left:${u}%"></i></div><b class="mxv wuv">${this.word()}</b></div></div>`; },
  ui(w, el) { this.set(w); const u = this.v * 100; el.querySelector(".mxfill").style.width = u + "%"; el.querySelector(".mxk").style.left = u + "%"; el.setAttribute("aria-valuenow", Math.round(u)); const b = el.parentElement.querySelector(".wuv"); if (b) b.textContent = this.word(); }
};
// beim Aufbau der Klangerzeugung den ersten Verdichter merken – davor wird die Wucht eingeschleift
{ const bd = Engine.build.bind(Engine); Engine.build = function () { const c = this.ctx, got = []; let r;
    try { const cc = c.createDynamicsCompressor.bind(c); c.createDynamicsCompressor = () => { const n = cc(); got.push(n); return n; }; } catch (_) {}
    try { r = bd(); } finally { try { delete c.createDynamicsCompressor; } catch (_) {} }
    Wucht.glue = got[0] || null; Wucht.n = null; try { Wucht.wire(); } catch (e) { console.warn(e); } return r; }; }
// Regler im Mischen
{ const rn = MixUI.render.bind(MixUI); MixUI.render = function (force) { const r = rn(force); try { const el = this.el(), m = el && !el.hidden && el.querySelector(".mxr.q7master"); if (m && !el.querySelector(".wu70")) m.insertAdjacentHTML("afterend", Wucht.row()); } catch (e) { console.warn(e); } return r; };
  const at = (e, el) => { const r = el.getBoundingClientRect(); return (e.clientX - r.left) / Math.max(1, r.width); };
  document.addEventListener("pointerdown", e => { const el = e.target.closest && e.target.closest("[data-wu]"); if (!el) return; Wucht.drag = { el, pid: e.pointerId, x0: e.clientX, y0: e.clientY, go: e.pointerType === "mouse" }; if (Wucht.drag.go) Wucht.ui(at(e, el), el); try { el.setPointerCapture(e.pointerId); } catch (_) {} });
  document.addEventListener("pointermove", e => { const D = Wucht.drag; if (!D || D.pid !== e.pointerId) return; if (!D.go) { const dx = Math.abs(e.clientX - D.x0), dy = Math.abs(e.clientY - D.y0); if (dy > 10 && dy > dx) { Wucht.drag = null; return; } if (dx < 5) return; D.go = true; } Wucht.ui(at(e, D.el), D.el); });
  const end = e => { const D = Wucht.drag; if (!D || D.pid !== e.pointerId) return; if (!D.go && e.type === "pointerup") Wucht.ui(at(e, D.el), D.el); Wucht.drag = null; };
  document.addEventListener("pointerup", end); document.addEventListener("pointercancel", end);
  document.addEventListener("keydown", e => { const el = e.target && e.target.matches && e.target.matches("[data-wu]") ? e.target : null; if (!el) return; const d = e.key === "ArrowRight" || e.key === "ArrowUp" ? 0.05 : e.key === "ArrowLeft" || e.key === "ArrowDown" ? -0.05 : 0; if (!d) return; e.preventDefault(); Wucht.ui(Wucht.v + d, el); }); }

/* ---------- 3) KLANGSCHRIFT: das Notensystem zum Lesen und Schreiben ---------- */
const Schrift = {
  on: false, f: null, t: null, L: 2, page: 0, per: 1, lo: 0, hi: 14, cw: 22, rh: 26, len: store.get("knLen") || 2, drag: null, undone: false, soloBy: null,
  ZN: { top: ["Becken", "#B08CFF"], hat: ["Hi-Hat", "#5FE0C4"], snare: ["Snare", "#FFD76B"], kick: ["Bassdrum", "#FF8A6B"] },
  LEN: [[1, "kurz"], [2, "mittel"], [4, "lang"]],
  R0() { return 12 + mod(Music.mood.root, 12); },
  midiOf(r) { return this.R0() + Music.mu.so(r); },
  // Zeile (Stufe der Tonleiter, fortlaufend gezählt) zu einem Ton; sharp > 0: der Ton liegt zwischen zwei Zeilen
  rowOf(m) { const R0 = this.R0(); let r = Math.floor((m - R0) / 12) * 7; while (R0 + Music.mu.so(r + 1) <= m) r++; return { r, sharp: m - (R0 + Music.mu.so(r)) }; },
  drum(f) { return Einsp.drum(f); },
  zones(f) { return Einsp.zones(f).slice().reverse(); },     // oben Becken … unten Bassdrum
  forms() { return Einsp.forms(); },
  el() { let e = $("kn70"); if (!e) { e = document.createElement("div"); e.id = "kn70"; e.hidden = true; e.setAttribute("role", "dialog"); e.setAttribute("aria-label", "Klangschrift"); document.body.appendChild(e); this.bind(e); } return e; },
  colOf(e) { if (e.z) return (this.ZN[e.z] || ["", "#fff"])[1]; return KeysUI.COL[mod(this.rowOf(e.m).r, 7)]; },
  span(f, t) {
    if (this.drum(f)) { this.lo = 0; this.hi = this.zones(f).length - 1; return; }
    const ms = t ? t.ev.filter(e => !e.z && e.m != null).map(e => e.m) : []; let lo, hi;
    if (ms.length) { lo = this.rowOf(Math.min(...ms)).r - 2; hi = this.rowOf(Math.max(...ms)).r + 2; } else { lo = this.rowOf(KeysUI.midi(f, 0)).r; hi = lo + 14; }
    while (hi - lo < 11) { hi++; if (hi - lo < 11) lo--; }
    this.lo = lo; this.hi = hi;
  },
  open(f, opt = {}) {
    if (!Engine.ctx) { UI.toast("Erst „Eintauchen“ – dann ist der Ton an"); return; }
    if (Engine.ctx.state !== "running") Engine.ctx.resume();
    try { if (Einsp.on) Einsp.close(); if (Live70.on) Live70.close(); UI.hideSheets(); if (Erkl.on) Erkl.stop(); } catch (_) {}
    const F = this.forms(); if (!Einsp.playable(f)) f = Einsp.playable(Forms.active) && !opt.pick ? Forms.active : (F.find(g => Loops.count(g) > 0) || (opt.pick ? null : F[0]) || null);
    this.on = true; this.undone = false; this.soloBy = null; document.body.classList.add("kks70"); const e = this.el(); e.hidden = false; this.setForm(f, true); this.render(); if (this.f) { this.start(); setTimeout(() => { if (this.on) this.top(); }, 80); }
    cancelAnimationFrame(this.raf); const loop = () => { if (!this.on) return; this.paint(); this.raf = requestAnimationFrame(loop); }; this.raf = requestAnimationFrame(loop);
  },
  start() { try { Einsp.start(); } catch (e) { console.warn(e); } },
  tidy() { const f = this.f, t = this.t; if (f && t && !t.ev.length && f.takes) { const i = f.takes.indexOf(t); if (i >= 0) f.takes.splice(i, 1); } },
  setForm(f, quiet) {
    if (f !== this.f) { this.tidy(); this.unsolo(); } this.f = f || null; this.t = f && (f.takes || []).length ? f.takes[0] : null; this.L = this.t ? clamp(this.t.bars | 0, 1, 8) : (Song.sections.length ? 4 : 2); this.page = 0;
    if (f) { this.span(f, this.t); try { Forms.setActive(f); Fade.set(f, true, true); if (f.lpOff) f.lpOff = false; Forms.applyMix(f); } catch (e) { console.warn(e); } }
    if (!quiet) { this.render(); this.start(); setTimeout(() => { if (this.on) this.top(); }, 80); }
  },
  unsolo() { if (this.soloBy && this.soloBy.solo) { try { UI.toggleSolo(this.soloBy); } catch (_) {} } this.soloBy = null; },
  close() {
    if (!this.on) return; this.on = false; cancelAnimationFrame(this.raf); this.drag = null; this.unsolo(); document.body.classList.remove("kks70"); const e = $("kn70"); if (e) e.hidden = true;
    const f = this.f, n = f && this.t ? this.t.ev.length : 0; this.tidy(); if (n && this.undone) { Save.soon(); UI.toast(`${f.name}: ${n} ${n === 1 ? "Ton" : "Töne"} in der Klangschrift – der Loop spielt sie`, 2600); }
    this.f = null; this.t = null; try { UI.refresh(); if (UI.tab === "song") SongUI.render(true); else if (UI.tab === "mix") MixUI.render(true); else if (UI.tab === "start") Home67.render(true); } catch (_) {}
  },
  take() { const f = this.f; if (this.t && f.takes && f.takes.includes(this.t)) return this.t; this.t = Loops.newTake(f, this.L, [], this.drum(f) ? "Rhythmus" : "Melodie"); this.t.base = 0; try { SongUI.adopt(f); } catch (_) {} return this.t; },
  mark() { if (!this.undone) { Undo.push(); this.undone = true; } },
  // Stelle im Loop – wie beim Einspielen
  local() {
    const pf = (Engine.now() - 0.05 - Transport.t0) / Transport.spb, len = this.L * 16; let ls = pf;
    if (Song.playing) { const a = Song.at(Math.floor(Math.max(0, pf))); if (a) ls = pf - a.startStep; }
    return mod(ls - (this.t ? Loops.shift(this.t) : 0), len);
  },
  top() { const b = this.el().querySelector('[data-ks="pp"]'); if (b) { b.innerHTML = Transport.running ? I67.stop : I67.play; b.setAttribute("aria-label", Transport.running ? "Anhalten" : "Abspielen"); } },
  nRows() { return this.hi - this.lo + 1; },
  // Zeile eines Ereignisses von oben gezählt (−1: liegt außerhalb)
  rowIx(e) { if (e.z) { const i = this.zones(this.f).indexOf(e.z); return i; } const r = this.rowOf(e.m).r; return r < this.lo || r > this.hi ? -1 : this.hi - r; },
  hit(row, step) { const t = this.t; if (!t) return -1; for (let i = t.ev.length - 1; i >= 0; i--) { const e = t.ev[i]; if (this.rowIx(e) === row && step >= Math.floor(e.s + 0.01) && step < Math.max(Math.floor(e.s + 0.01) + 1, e.s + (e.z ? 1 : e.d) - 0.01)) return i; } return -1; },
  evAt(row, step, d) { const f = this.f; if (this.drum(f)) { const z = this.zones(f)[row]; return { s: step, d: 1, z, v: 0.9, u: Einsp.PADS[z][2] }; } const m = this.midiOf(this.hi - row); return { s: step, d, m, v: 0.8, u: clamp((m - 28) / 60, 0, 1) }; },
  sound(e) { const f = this.f; if (!f) return; try { const h = e.z ? Forms.play(f, e.u, e.v, { zone: e.z, help: 50 }) : Forms.play(f, e.u, e.v, { midi: e.m }); if (!e.z) setTimeout(() => { try { Forms.release(h); } catch (_) {} }, clamp(e.d * Transport.spb, 0.12, 0.6) * 1000); } catch (err) { console.warn(err); } },
  add(row, step, d) {
    const len = this.L * 16; if (row < 0 || row >= this.nRows() || step < 0 || step >= len) return; this.mark(); const t = this.take(), e = this.evAt(row, step, clamp(d, 1, len - step));
    t.ev = t.ev.filter(x => !(this.rowIx(x) === row && x.s < e.s + e.d - 0.01 && x.s + (x.z ? 1 : x.d) > e.s + 0.01)); t.ev.push(e); this.sound(e); Hap(5); Save.soon(); this.notes();
  },
  remove(i) { const t = this.t; if (!t || !t.ev[i]) return; this.mark(); t.ev.splice(i, 1); Hap(8); Save.soon(); this.notes(); },
  clear() { const t = this.t; if (!t || !t.ev.length) return; Undo.push(); this.undone = true; t.ev = []; Hap(14); UI.toast("Alle Töne entfernt – mit ↶ oben kommen sie zurück", 2200); Save.soon(); this.notes(); },
  setLen(n) { const t = this.t; if (t && t.ev.some(e => e.s >= n * 16)) { this.mark(); t.ev = t.ev.filter(e => e.s < n * 16); } this.L = n; if (t) t.bars = n; this.page = Math.min(this.page, Math.max(0, n - 1)); Save.soon(); this.render(); },
  more(up) { if (this.drum(this.f)) return; if (up) { if (this.midiOf(this.hi + 7) <= 108) this.hi += 7; } else if (this.midiOf(this.lo - 7) >= 24) this.lo -= 7; Hap(); this.render(); const g = $("knGw"); if (g) g.scrollTop = up ? 0 : g.scrollHeight; },
  // die ganze Schleife als kleines Bild (auch für Menüs)
  svg(f, t, cls) {
    const dr = this.drum(f), L = (t ? t.bars : 2) * 16, ev = t ? t.ev.filter(e => e.s < L) : []; let lo = 0, hi = 3;
    if (!dr && ev.length) { const rs = ev.map(e => this.rowOf(e.m).r); lo = Math.min(...rs); hi = Math.max(...rs); if (hi - lo < 4) { hi += 2; lo -= 2; } } const n = hi - lo + 1, Z = dr ? this.zones(f) : null;
    const bars = Array.from({ length: L / 16 - 1 }, (_, i) => `<path d="M${(i + 1) * 16} 0V${n}" stroke="rgba(255,255,255,.16)" stroke-width=".25"/>`).join("");
    return `<svg class="${cls || "knmini"}" viewBox="0 0 ${L} ${n}" preserveAspectRatio="none" aria-hidden="true">${bars}${ev.map(e => { const y = dr ? Z.indexOf(e.z) : hi - this.rowOf(e.m).r; return y < 0 ? "" : `<rect x="${(+e.s).toFixed(2)}" y="${y + 0.12}" width="${Math.max(0.7, (dr ? 0.8 : e.d) - 0.15).toFixed(2)}" height=".76" rx=".38" fill="${this.colOf(e)}"/>`; }).join("")}</svg>`;
  },
  layout() {
    const e = this.el(), W = Math.min(e.clientWidth || innerWidth, 1180), H = e.clientHeight || innerHeight, lw = this.lw = this.drum(this.f) ? 78 : 50; this.per = Math.min(this.L, W >= 1000 ? 4 : W >= 600 ? 2 : 1); this.page = clamp(Math.floor(this.page / this.per) * this.per, 0, Math.max(0, this.L - this.per));
    this.cw = Math.max(14, Math.floor((W - lw - 28) / (this.per * 16) * 100) / 100); const n = this.nRows(), dr = this.drum(this.f), room = H - (H < 520 ? 150 : 330); this.rh = dr ? clamp(Math.floor(room / n), 40, 64) : clamp(Math.floor(room / n), H < 520 ? 22 : 24, 34);
  },
  render() {
    const e = this.el(), f = this.f, dr = this.drum(f); this.drag = null;
    const chips = this.forms().map(g => `<button class="echip" data-kf="${g.id}" aria-pressed="${g === f}" style="--c:${SongGen.col(g)}"><i>${SongGen.icOf(g)}</i>${esc(g.name)}${Loops.count(g) ? "<em></em>" : ""}</button>`).join("");
    const top = `<div class="etop"><button class="ex" data-ks="home" aria-label="Zur Startseite">${I67.home}</button><div class="eti"><b>Klangschrift</b><small>${f ? "Farbe = Ton · Länge = Dauer · Höhe = Tonhöhe" : "Welchen Klang möchtest du lesen und schreiben?"}</small></div>${f ? `<button class="eb pp" data-ks="pp" aria-label="${Transport.running ? "Anhalten" : "Abspielen"}">${Transport.running ? I67.stop : I67.play}</button>` : ""}<button class="edone" data-ks="close">Fertig</button></div>`;
    if (!f) { e.innerHTML = `<div class="ein kn7">${top}<div class="echips" aria-label="Klang wählen">${chips}</div><div class="eempty"><div class="sxart"><i></i><i></i><i></i><i></i><i></i></div><p>${chips ? "Tippe oben einen Klang an. Seine Töne erscheinen als bunte Balken – du kannst sie lesen, setzen und löschen." : "Dein Stück hat noch keinen Klang zum Spielen. Lass dir einen Song bauen – danach kannst du jede Stimme hier lesen und ändern."}</p>${chips ? "" : `<button class="edone" data-ks="gen">Song bauen</button>`}</div></div>`; return; }
    this.layout(); const n = this.nRows(), cw = this.cw, rh = this.rh, per = this.per, cols = per * 16, Z = dr ? this.zones(f) : null;
    let labs = "", rows = "", chord = "";
    for (let i = 0; i < n; i++) {
      if (dr) labs += `<span style="height:${rh}px;--c:${this.ZN[Z[i]][1]}" class="q7dr"><b>${this.ZN[Z[i]][0]}</b></span>`;
      else { const r = this.hi - i, j = mod(r, 7), m = this.midiOf(r); labs += `<span style="height:${rh}px;--c:${KeysUI.COL[j]}"${j === 0 ? ' class="q7root"' : ""}><b>${j + 1}</b><small>${esc(deN(m))}</small></span>`; if (j === 0) rows += `<i class="knroot" style="top:${i * rh}px;height:${rh}px"></i>`; }
    }
    if (!dr) { const P = Music.mood.prog || [0]; for (let b = 0; b < per; b++) { const dg = P[(this.page + b) % P.length]; for (let i = 0; i < n; i++) { const j = mod(this.hi - i - dg, 7); if (j === 0 || j === 2 || j === 4) chord += `<i class="knch" style="left:${b * 16 * cw}px;top:${i * rh}px;width:${16 * cw}px;height:${rh}px"></i>`; } } }
    const nums = Array.from({ length: per * 4 }, (_, i) => `<span style="left:${i * 4 * cw}px"${i % 4 === 0 ? ' class="b1"' : ""}>${i % 4 === 0 ? `<b>Takt ${this.page + i / 4 + 1}</b>` : i % 4 + 1}</span>`).join("");
    const leg = dr ? "" : `<div class="knleg" aria-label="Die sieben Töne">${[0, 1, 2, 3, 4, 5, 6].map(j => `<button data-kl="${j}" style="--c:${KeysUI.COL[j]}" aria-label="Ton ${j + 1} anhören"><b>${j + 1}</b><small>${esc(deN(this.midiOf(j)).replace(/[0-9’',]/g, ""))}</small></button>`).join("")}</div>`;
    const pages = Math.ceil(this.L / per);
    e.innerHTML = `<div class="ein kn7">${top}
      <div class="echips" aria-label="Klang wählen">${chips}</div>
      ${leg}
      <button class="knov" id="knOv" data-ks="ov" aria-label="Übersicht über den ganzen Loop – tippen springt zum Takt"><span id="knOvS"></span><i class="knwin" style="left:${this.page / this.L * 100}%;width:${per / this.L * 100}%"></i><i class="knoh" id="knOh"></i></button>
      <div class="kngw" id="knGw" style="--cw:${cw}px;--rh:${rh}px"><div class="knlab" style="flex-basis:${this.lw}px">${dr ? "" : `<button class="knmore" data-ks="up" aria-label="Höhere Töne zeigen">▲</button>`}<div class="knnum0"></div>${labs}${dr ? "" : `<button class="knmore" data-ks="dn" aria-label="Tiefere Töne zeigen">▼</button>`}</div>
        <div class="kncol">${dr ? "" : `<div class="knmsp"></div>`}<div class="knnum" style="width:${cols * cw}px">${nums}</div><div class="kngrid${dr ? " q7dr" : ""}" id="knGrid" style="width:${cols * cw}px;height:${n * rh}px" role="application" aria-label="Notenfeld: tippen setzt einen Ton, ziehen macht ihn länger, nochmal tippen löscht ihn">${rows}${chord}<div id="knNotes"></div><i class="knph" id="knPh"></i></div>${dr ? "" : `<div class="knmsp"></div>`}</div></div>
      <div class="knbar">${pages > 1 ? `<span class="knpg"><button class="eb" data-ks="prev" aria-label="Vorherige Takte"${this.page <= 0 ? " disabled" : ""}>${I67.left}</button><b>Takt ${this.page + 1}${per > 1 ? "–" + (this.page + per) : ""} von ${this.L}</b><button class="eb" data-ks="next" aria-label="Nächste Takte"${this.page + per >= this.L ? " disabled" : ""}>${I67.right}</button></span>` : ""}
        ${dr ? "" : `<span class="eseg" aria-label="Länge eines getippten Tons">${this.LEN.map(([v, nm]) => `<button data-kd="${v}" aria-pressed="${this.len === v}">${nm}</button>`).join("")}</span>`}
        <span class="eseg" aria-label="Länge des Loops">${[1, 2, 4].map(k => `<button data-kb="${k}" aria-pressed="${this.L === k}">${k} ${k === 1 ? "Takt" : "Takte"}</button>`).join("")}</span></div>
      <div class="knbar"><button class="eb tg" data-ks="solo" aria-pressed="${!!f.solo}" aria-label="Nur diesen Klang hören: ${f.solo ? "an" : "aus"}">${I67.solo}<span>Allein hören</span></button><button class="eb" data-ks="ein" aria-label="Diesen Klang auf Tasten einspielen">${I67.keys}<span>Einspielen</span></button><button class="eb" data-ks="clear" aria-label="Alle Töne entfernen">${I67.trash}<span>Alles weg</span></button></div>
      <p class="ehint">${dr ? "Tippe ins Feld: ein Punkt ist ein Schlag. Nochmal tippen löscht ihn. Vier Kästchen sind ein Schlag, sechzehn ein Takt." : "Tippen setzt einen Ton, nach rechts ziehen macht ihn länger, nochmal tippen löscht ihn. Die Zahl im Balken ist der Ton der Tonleiter (1 = Grundton). Helle Zeilen passen besonders gut zum Akkord des Takts."}</p></div>`;
    this.notes();
  },
  notes() {
    const box = $("knNotes"), t = this.t, f = this.f; if (!box || !f) return; const cw = this.cw, rh = this.rh, s0 = this.page * 16, s1 = s0 + this.per * 16, dr = this.drum(f); let h = "", out = 0;
    if (t) t.ev.forEach((e, i) => { const row = this.rowIx(e); if (row < 0) { if (e.s >= s0 && e.s < s1) out++; return; } const d = dr ? 1 : e.d; if (e.s + d <= s0 || e.s >= s1) return; const x = (e.s - s0) * cw, w = Math.max(dr ? cw - 4 : 8, d * cw - 3), sh = !dr && this.rowOf(e.m).sharp;
      h += `<i class="knn${dr ? " q7hit" : ""}${sh ? " q7sh" : ""}" style="left:${(x + 1.5).toFixed(1)}px;top:${row * rh + 2}px;width:${w.toFixed(1)}px;height:${rh - 4}px;--c:${this.colOf(e)};opacity:${(0.55 + 0.45 * clamp(e.v ?? 0.8, 0, 1)).toFixed(2)}">${dr ? "" : w >= 15 ? (mod(this.rowOf(e.m).r, 7) + 1) + (sh ? "♯" : "") : ""}</i>`; });
    box.innerHTML = h; const ov = $("knOvS"); if (ov) ov.innerHTML = this.svg(f, t || { bars: this.L, ev: [] }, "knovs");
    const cl = this.el().querySelector('[data-ks="clear"]'); if (cl) cl.disabled = !(t && t.ev.length);
  },
  paint() { const ph = $("knPh"), oh = $("knOh"); if (!ph) return; if (!Transport.running || !this.f) { ph.style.opacity = "0"; if (oh) oh.style.opacity = "0"; return; } const x = this.local(), len = this.L * 16, s0 = this.page * 16, vis = x >= s0 && x < s0 + this.per * 16;
    ph.style.opacity = vis ? "1" : "0"; if (vis) ph.style.transform = `translateX(${((x - s0) * this.cw).toFixed(1)}px)`; if (oh) { oh.style.opacity = "1"; oh.style.left = (x / len * 100).toFixed(2) + "%"; } },
  cell(e) { const g = $("knGrid"), r = g.getBoundingClientRect(); return { col: Math.floor((e.clientX - r.left) / this.cw), row: Math.floor((e.clientY - r.top) / this.rh), r }; },
  act(k) {
    if (k === "close") return this.close();
    if (k === "home") { this.close(); return Heim.go(); }
    if (k === "gen") { this.close(); return SongGen.open(); }
    if (k === "pp") { Hap(10); if (Transport.running) { if (Song.playing) SongUI.stop(); else Transport.stop(); } else this.start(); return setTimeout(() => { if (this.on) this.top(); }, 80); }
    if (k === "prev" || k === "next") { this.page = clamp(this.page + (k === "next" ? this.per : -this.per), 0, Math.max(0, this.L - this.per)); Hap(); return this.render(); }
    if (k === "up" || k === "dn") return this.more(k === "up");
    if (k === "clear") return this.clear();
    if (k === "solo") { const f = this.f; if (!f) return; Hap(); UI.toggleSolo(f); this.soloBy = f.solo ? f : null; return this.render(); }
    if (k === "ein") { const f = this.f; this.close(); return Einsp.open(f); }
  },
  bind(el) {
    el.addEventListener("click", e => {
      const kf = e.target.closest("[data-kf]"); if (kf) { const f = Forms.byId(kf.dataset.kf); if (f) { Hap(); this.setForm(f); } return; }
      const kl = e.target.closest("[data-kl]"); if (kl && this.f) { const base = this.rowOf(KeysUI.midi(this.f, 0)).r, r = base - mod(base, 7) + (+kl.dataset.kl) + (mod(base, 7) > +kl.dataset.kl ? 7 : 0), m = this.midiOf(r); return this.sound({ m, d: 3, v: 0.85, u: clamp((m - 28) / 60, 0, 1) }); }
      const kd = e.target.closest("[data-kd]"); if (kd) { this.len = +kd.dataset.kd; store.set("knLen", this.len); Hap(); return this.render(); }
      const kb = e.target.closest("[data-kb]"); if (kb) { Hap(); return this.setLen(+kb.dataset.kb); }
      const ov = e.target.closest("#knOv"); if (ov) { const r = ov.getBoundingClientRect(), b = clamp(Math.floor((e.clientX - r.left) / r.width * this.L), 0, this.L - 1); this.page = clamp(Math.floor(b / this.per) * this.per, 0, Math.max(0, this.L - this.per)); Hap(); return this.render(); }
      const b = e.target.closest("[data-ks]"); if (b) this.act(b.dataset.ks);
    });
    // Notenfeld: tippen = setzen/löschen · waagerecht ziehen = Länge · senkrecht = blättern
    el.addEventListener("pointerdown", e => { const g = e.target.closest("#knGrid"); if (!g || !this.f || this.drag) return; const c = this.cell(e); if (c.col < 0 || c.col >= this.per * 16 || c.row < 0 || c.row >= this.nRows()) return;
      this.drag = { pid: e.pointerId, x0: e.clientX, y0: e.clientY, col: c.col, row: c.row, hit: this.hit(c.row, this.page * 16 + c.col), d: 0, g: null }; });
    el.addEventListener("pointermove", e => { const D = this.drag; if (!D || D.pid !== e.pointerId) return; const dx = e.clientX - D.x0, dy = e.clientY - D.y0;
      if (!D.d) { if (Math.abs(dy) > 12 && Math.abs(dy) > Math.abs(dx)) { this.drag = null; return; } if (D.hit >= 0 || this.drum(this.f) || dx < 7) return; }
      const c = this.cell(e), d = clamp(c.col - D.col + 1, 1, this.L * 16 - (this.page * 16 + D.col)); if (d === D.d) return; D.d = d;
      if (!D.g) { D.g = document.createElement("i"); D.g.className = "knn q7ghost"; const b = $("knNotes"); if (b) b.appendChild(D.g); try { $("knGrid").setPointerCapture(e.pointerId); } catch (_) {} }
      D.g.style.cssText = `left:${D.col * this.cw + 1.5}px;top:${D.row * this.rh + 2}px;width:${d * this.cw - 3}px;height:${this.rh - 4}px;--c:${KeysUI.COL[mod(this.hi - D.row, 7)]}`; });
    el.addEventListener("pointerup", e => { const D = this.drag; if (!D || D.pid !== e.pointerId) return; this.drag = null; if (D.g) D.g.remove();
      if (D.hit >= 0 && !D.d) return this.remove(D.hit); this.add(D.row, this.page * 16 + D.col, D.d || this.len); });
    el.addEventListener("pointercancel", e => { const D = this.drag; if (D && D.pid === e.pointerId) { if (D.g) D.g.remove(); this.drag = null; } });
  }
};
addEventListener("resize", () => { try { if (Schrift.on) Schrift.render(); if (Live70.on) Live70.size(); } catch (_) {} });

/* ---------- 4) LIVE-FLÄCHE: ein Finger formt den ganzen Song ---------- */
const Live70 = {
  on: false, x: 1, y: 0.62, pid: null, L: [], rings: [], sm: new Float32Array(8), lv: 0, touched: false, recBy: false, hold: {},
  ORDER: ["akk", "bass", "beat", "arp", "mel", "hook"],
  NAME: { akk: "Akkorde", bass: "Bass", beat: "Beat", arp: "Begleitung", mel: "Melodie", hook: "Refrain" },
  forms() { return Forms.list.filter(f => !f.empty && !f.remote && Loops.count(f) > 0); },
  // Reihenfolge, in der die Klänge dazukommen (von unten nach oben)
  layers() {
    const rk = r => { const k = this.ORDER.indexOf(r); return k < 0 ? 3.5 : k; }, F = this.forms().map((f, i) => ({ f, role: SongGen.roleOf(f) || MixUI.role(f), i })).sort((a, b) => rk(a.role) - rk(b.role) || a.i - b.i), n = F.length;
    F.forEach((l, k) => { l.at = n <= 1 ? 0 : k / n * 0.9; l.to = 9; });
    const hook = F.filter(l => l.role === "hook"), mel = F.filter(l => l.role === "mel" && SongGen.roleOf(l.f)); if (hook.length && mel.length) { const h0 = Math.min(...hook.map(l => l.at)); for (const l of mel) l.to = h0; }
    return F;
  },
  isOn(l, y = this.y) { return y >= l.at - 1e-6 && y < l.to; },
  el() { let e = $("lv70"); if (!e) { e = document.createElement("div"); e.id = "lv70"; e.hidden = true; e.setAttribute("role", "dialog"); e.setAttribute("aria-label", "Live-Fläche"); document.body.appendChild(e); this.bind(e); } return e; },
  open() {
    if (!Engine.ctx) { UI.toast("Erst „Eintauchen“ – dann ist der Ton an"); return; }
    if (Song.rec) { UI.toast("Dein Song wird gerade aufgenommen – danach geht es auf die Live-Fläche", 2600); return; }
    if (!this.forms().length) { UI.toastAct("Die Live-Fläche spielt mit den Loops deines Stücks. Lass dir zuerst einen Song bauen – dann formst du ihn mit einem Finger.", "Song bauen", () => SongGen.open(), 5200); return; }
    if (Engine.ctx.state !== "running") Engine.ctx.resume();
    try { if (Einsp.on) Einsp.close(); if (Schrift.on) Schrift.close(); UI.hideSheets(); if (Erkl.on) Erkl.stop(); } catch (_) {}
    try { if (Song.playing) SongUI.stop(); SongUI.prep(); } catch (e) { console.warn(e); }
    Wucht.wire(); this.L = this.layers(); this.on = true; this.touched = false; this.rings = []; this.hold = {}; this.x = 1; this.y = 0.62; document.body.classList.add("klv70");
    const e = this.el(); e.hidden = false; this.render(); this.size(); this.apply(true);
    try { if (!Transport.running) Transport.start(); LoopCtl.release(); } catch (err) { console.warn(err); }
    cancelAnimationFrame(this.raf); const loop = () => { if (!this.on) return; this.draw(); this.raf = requestAnimationFrame(loop); }; this.raf = requestAnimationFrame(loop);
  },
  close() {
    if (!this.on) return; this.on = false; cancelAnimationFrame(this.raf); this.pid = null;
    try { Wucht.filter(null); Wucht.echo(false); Wucht.cut(false); } catch (_) {}
    const rec = this.recBy && Rec.on; this.recBy = false;
    try { if (Transport.running) Transport.stop(); } catch (_) {} try { SongUI.clearG(); } catch (_) {}
    document.body.classList.remove("klv70"); const e = $("lv70"); if (e) e.hidden = true;
    if (rec) { try { Rec.stop(); } catch (err) { console.warn(err); } }
    try { UI.refresh(); if (UI.tab === "song") SongUI.render(true); else if (UI.tab === "mix") MixUI.render(true); else if (UI.tab === "start") Home67.render(true); } catch (_) {}
  },
  // Stellung des Fingers anwenden: y schaltet Klänge zu, x färbt den Klang
  apply(force) {
    for (const l of this.L) { const g = this.isOn(l) ? 1 : 0; if (force || (l.f.songG ?? 1) !== g) { l.f.songG = g; try { Forms.applyMix(l.f); } catch (_) {} } if (l.el) l.el.classList.toggle("q7on", !!g); }
    Wucht.filter(this.x);
    const p = $("lvPad"); if (p) { p.setAttribute("aria-valuetext", this.say()); }
  },
  say() { const n = this.L.filter(l => this.isOn(l)).length; return `${n} von ${this.L.length} Klängen spielen, Klang ${this.x >= 0.97 ? "offen" : this.x < 0.34 ? "dumpf" : this.x < 0.67 ? "mittel" : "hell"}`; },
  set(x, y) { this.x = clamp(x, 0, 1); this.y = clamp(y, 0, 1); this.touched = true; this.apply(); },
  size() { const cv = $("lvCv"); if (!cv) return; const r = cv.getBoundingClientRect(), d = Math.min(2, devicePixelRatio || 1); cv.width = Math.max(2, Math.round(r.width * d)); cv.height = Math.max(2, Math.round(r.height * d)); this.dpr = d; const p = $("lvPad"), q = p && p.getBoundingClientRect(); if (q) { this.ox = (q.left - r.left) * d; this.oy = (q.top - r.top) * d; this.pw = q.width * d; this.ph = q.height * d; } },
  beat(time, strong) { if (!this.on) return; try { Visual.at(time, () => { if (this.on && this.rings.length < 12) this.rings.push({ t: performance.now(), s: strong ? 1 : 0.55 }); }); } catch (_) {} },
  draw() {
    const cv = $("lvCv"); if (!cv) return; const g = cv.getContext("2d"), W = cv.width, H = cv.height, d = this.dpr || 1, now = performance.now();
    const lv = (Engine.stat && Engine.stat.lv) || []; let sum = 0; for (let i = 0; i < 8; i++) { const v = Transport.running ? Math.min(1, (lv[i] || 0) * 1.7) : 0; this.sm[i] += (v - this.sm[i]) * (v > this.sm[i] ? 0.5 : 0.12); sum += this.sm[i]; }
    this.lv += (Math.min(1, sum / 2.4) - this.lv) * 0.25; const L = this.hold.cut ? 0 : this.lv;
    const px = (this.ox || 0) + this.x * (this.pw || W), py = (this.oy || 0) + (1 - this.y) * (this.ph || H), hue = 250 + this.x * 140, R = Math.max(W, H);
    g.globalCompositeOperation = "source-over"; g.fillStyle = "#05070e"; g.fillRect(0, 0, W, H);
    const bg = g.createRadialGradient(px, py, 0, px, py, R * (0.55 + 0.25 * L)); bg.addColorStop(0, `hsla(${hue},95%,${34 + 20 * this.y + 12 * L}%,${0.6 + 0.35 * this.y})`); bg.addColorStop(0.4, `hsla(${hue - 45},90%,${16 + 14 * this.y}%,.6)`); bg.addColorStop(1, "rgba(5,7,14,0)"); g.fillStyle = bg; g.fillRect(0, 0, W, H);
    // Raster aus Punkten, das vom Finger weggedrückt wird
    const st = Math.max(26 * d, Math.min(W, H) / 14); g.fillStyle = `hsla(${hue + 20},80%,78%,.34)`;
    for (let y = st / 2; y < H; y += st) for (let x = st / 2; x < W; x += st) { const dx = x - px, dy = y - py, q = Math.hypot(dx, dy) + 1, k = Math.exp(-q / (R * 0.22)) * (10 + 46 * L) * d; g.beginPath(); g.arc(x + dx / q * k, y + dy / q * k, (1 + 2.2 * Math.exp(-q / (R * 0.3)) * (0.4 + L)) * d, 0, 6.2832); g.fill(); }
    // Ringe im Takt
    g.globalCompositeOperation = "lighter"; this.rings = this.rings.filter(r => now - r.t < 1400);
    for (const r of this.rings) { const a = (now - r.t) / 1400; g.strokeStyle = `hsla(${hue + 30},95%,72%,${(1 - a) * 0.55 * r.s})`; g.lineWidth = (1 + 5 * (1 - a) * r.s) * d; g.beginPath(); g.arc(px, py, 34 * d + a * R * 0.5, 0, 6.2832); g.stroke(); }
    // Strahlenkranz: die Lautstärke jeder Stimme
    const r0 = (30 + 10 * L) * d, nb = 48; g.lineCap = "round"; g.lineWidth = 3.2 * d;
    for (let j = 0; j < nb; j++) { const v = this.sm[j % 8] * (0.55 + 0.45 * Math.sin(now / 300 + j * 1.7) ** 2), a = j / nb * 6.2832 + now / 5200, r1 = r0 + (8 + v * 120) * d * (0.5 + this.y * 0.7); g.strokeStyle = `hsla(${hue + j * 3},95%,${62 + 20 * v}%,${0.35 + 0.6 * v})`; g.beginPath(); g.moveTo(px + Math.cos(a) * r0, py + Math.sin(a) * r0); g.lineTo(px + Math.cos(a) * r1, py + Math.sin(a) * r1); g.stroke(); }
    const bl = g.createRadialGradient(px, py, 0, px, py, r0 * 1.5); bl.addColorStop(0, "rgba(255,255,255,.95)"); bl.addColorStop(0.35, `hsla(${hue},100%,72%,.85)`); bl.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = bl; g.beginPath(); g.arc(px, py, r0 * 1.5, 0, 6.2832); g.fill();
    g.globalCompositeOperation = "source-over";
    const rb = $("lvRec"); if (rb) { const on = !!Rec.on; const tx = on ? "Stopp " + Rec.label() : "Aufnehmen", sp = rb.querySelector("span"); if (sp.textContent !== tx) { sp.textContent = tx; rb.setAttribute("aria-pressed", on); rb.setAttribute("aria-label", on ? "Aufnahme beenden und speichern" : "Dein Spiel aufnehmen"); } }
  },
  render() {
    const e = this.el(), n = this.L.length, tiny = n > 7;
    e.innerHTML = `<canvas id="lvCv" aria-hidden="true"></canvas>
      <div class="lvpad" id="lvPad" role="slider" tabindex="0" aria-label="Live-Fläche: nach oben spielen mehr Klänge, nach rechts wird der Klang heller. Pfeiltasten bewegen den Punkt." aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(this.y * 100)}"></div>
      <div class="lvtop"><button class="ex" data-lv="home" aria-label="Zur Startseite">${I67.home}</button><div class="eti"><b>Live-Fläche</b><small>Ein Finger formt deinen Song</small></div><button class="eb tg" id="lvRec" data-lv="rec" aria-pressed="false" aria-label="Dein Spiel aufnehmen"><i class="lvdot"></i><span>Aufnehmen</span></button><button class="edone" data-lv="close">Fertig</button></div>
      <div class="lvlay${tiny ? " q7tiny" : ""}" aria-hidden="true">${this.L.map((l, i) => `<span class="lvl" data-i="${i}" style="bottom:${(l.at * 100).toFixed(1)}%;--c:${SongGen.col(l.f)}"><i>${SongGen.icOf(l.f)}</i><b>${esc(l.f.name)}</b></span>`).join("")}</div>
      <span class="lvax q7y" aria-hidden="true">wenig ← Band → viel</span><span class="lvax q7x" aria-hidden="true">dumpf ← Klang → hell</span>
      <p class="lvhint" id="lvHint">Leg den Finger auf die Fläche und zieh:<br><b>hoch</b> = mehr Band · <b>rechts</b> = heller</p>
      <div class="lvbot"><button class="lvh" data-lh="cut" aria-label="Stille – solange du hältst. Loslassen: alles ist wieder da."><b>Stille</b><small>halten · loslassen = Einsatz</small></button><button class="lvh" data-lh="echo" aria-label="Echo – solange du hältst"><b>Echo</b><small>halten</small></button></div>`;
    e.querySelectorAll(".lvl").forEach(s => { this.L[+s.dataset.i].el = s; });
  },
  holdSet(k, on) { if (!!this.hold[k] === !!on) return; this.hold[k] = !!on; Hap(on ? 12 : 6); if (k === "cut") { Wucht.cut(on); if (!on) this.rings.push({ t: performance.now(), s: 1.4 }); } else Wucht.echo(on); const b = this.el().querySelector(`[data-lh="${k}"]`); if (b) b.classList.toggle("q7on", !!on); },
  rec() { if (Rec.on) { this.recBy = true; return this.close(); }   /* erst die Musik anhalten, dann zeigt KLANGRAUM die fertige Aufnahme */ try { Rec.start(); this.recBy = !!Rec.on; if (Rec.on) UI.toast("Aufnahme läuft – spiel auf der Fläche. „Stopp“ speichert sie bei deinen Aufnahmen.", 3200); } catch (e) { console.warn(e); } },
  bind(el) {
    const pos = e => { const r = $("lvPad").getBoundingClientRect(); this.set((e.clientX - r.left) / Math.max(1, r.width), 1 - (e.clientY - r.top) / Math.max(1, r.height)); const h = $("lvHint"); if (h) h.classList.add("q7gone"); };
    el.addEventListener("pointerdown", e => {
      const h = e.target.closest("[data-lh]"); if (h) { e.preventDefault(); try { h.setPointerCapture(e.pointerId); } catch (_) {} h._pid = e.pointerId; return this.holdSet(h.dataset.lh, true); }
      if (e.target.closest("#lvPad") && this.pid == null) { this.pid = e.pointerId; try { $("lvPad").setPointerCapture(e.pointerId); } catch (_) {} Hap(6); pos(e); e.preventDefault(); } });
    el.addEventListener("pointermove", e => { if (this.pid === e.pointerId) pos(e); });
    const up = e => { const h = e.target.closest && e.target.closest("[data-lh]"); if (h && h._pid === e.pointerId) { h._pid = null; return this.holdSet(h.dataset.lh, false); } if (this.pid === e.pointerId) this.pid = null; };
    el.addEventListener("pointerup", up); el.addEventListener("pointercancel", up);
    el.addEventListener("click", e => { const b = e.target.closest("[data-lv]"); if (b) { const k = b.dataset.lv; if (k === "close") return this.close(); if (k === "home") { this.close(); return Heim.go(); } if (k === "rec") { Hap(12); return this.rec(); } }
      const h = e.target.closest("[data-lh]"); if (h && e.detail === 0) { const k = h.dataset.lh; this.holdSet(k, !this.hold[k]); } });   // mit der Tastatur: an / aus
    el.addEventListener("keydown", e => { if (!e.target.matches || !e.target.matches("#lvPad")) return; const s = 0.05, m = { ArrowUp: [0, s], ArrowDown: [0, -s], ArrowLeft: [-s, 0], ArrowRight: [s, 0] }[e.key]; if (!m) return; e.preventDefault(); this.set(this.x + m[0], this.y + m[1]); e.target.setAttribute("aria-valuenow", Math.round(this.y * 100)); const h = $("lvHint"); if (h) h.classList.add("q7gone"); });
    el.addEventListener("contextmenu", e => e.preventDefault());
  }
};
// der Takt lässt die Ringe pulsieren
{ const os = Transport.onStep.bind(Transport); Transport.onStep = function (step, time) { try { if (Live70.on && step % 4 === 0) Live70.beat(time, step % 16 === 0); } catch (_) {} return os(step, time); }; }

/* ---------- 5) Einbinden: Startseite · Song · Einspielen · Heimweg · Zurück-Taste · Erklären · Hilfe ---------- */
{ const i = Math.min(1, Home67.TILES.length); Home67.TILES.splice(i, 0, ["live", "live", "Live-Fläche", "Ein Finger formt den ganzen Song", "#FF3CAC", "#7A3CFF"], ["noten", "noten", "Klangschrift", "Töne als bunte Balken lesen und setzen", "#35C0E0", "#6FD45A"]);
  const ac = Home67.act.bind(Home67); Home67.act = function (k) { if (k === "live") { Hap(8); return Live70.open(); } if (k === "noten") { Hap(8); return Schrift.open(null, { pick: true }); } return ac(k); }; }
// Song: Knopf zur Live-Fläche neben „wiederholen“
{ const rn = SongUI.render.bind(SongUI); SongUI.render = function (force) { const r = rn(force); try { const el = $("vSong"), lp = el && !el.hidden && el.querySelector(".sxtop .sxlp"); if (lp && !el.querySelector('[data-v70="live"]')) lp.insertAdjacentHTML("beforebegin", `<button class="sxlp q7live" data-v70="live" aria-label="Live-Fläche: den Song mit einem Finger formen">${I67.live}</button>`); } catch (e) { console.warn(e); } return r; }; }
document.addEventListener("click", e => { const b = e.target.closest && e.target.closest("[data-v70]"); if (!b) return; const k = b.dataset.v70; Hap(8); if (k === "live") Live70.open(); else if (k === "noten") { const f = Forms.byId(b.dataset.f); UI.hideSheets(); Schrift.open(f); } });
// Zeilenmenü im Song: die Töne als Klangschrift – antippen öffnet sie
{ const rm = SongUI.rowMenu.bind(SongUI); SongUI.rowMenu = function (f) { const r = rm(f); try { const m = document.querySelector("#sheets .sheet .sxmenu"); if (m && Einsp.playable(f) && !m.querySelector('[data-v70="noten"]')) { const t = (f.takes || [])[0];
      m.insertAdjacentHTML("afterbegin", `<button class="sxbtn q7big knrow" data-v70="noten" data-f="${f.id}"><i>${I67.noten}</i><span><b>Noten lesen und ändern</b><small>${t && t.ev.length ? "die Töne dieses Klangs als bunte Balken" : "Töne als bunte Balken setzen"}</small>${t && t.ev.length ? Schrift.svg(f, t) : ""}</span></button>`); } } catch (e) { console.warn(e); } return r; }; }
// Einspielen: zur Klangschrift wechseln
{ const rn = Einsp.render.bind(Einsp); Einsp.render = function () { const r = rn(); try { const u = $("einsp").querySelector('.erow [data-ei="undo"]'); if (u && !$("einsp").querySelector('[data-ei="noten"]')) u.insertAdjacentHTML("beforebegin", `<button class="eb" data-ei="noten" aria-label="Die Töne als Klangschrift lesen und ändern">${I67.noten}<span>Noten</span></button>`); } catch (_) {} return r; };
  const ac = Einsp.act.bind(Einsp); Einsp.act = function (k) { if (k === "noten") { const f = this.f; if (this.made === f) this.made = null; this.close(); return Schrift.open(f); } return ac(k); }; }
// Heimweg und Zurück-Taste kennen die neuen Flächen
{ const cl = Heim.clean.bind(Heim); Heim.clean = function () { try { if (Schrift.on) Schrift.close(); } catch (_) {} try { if (Live70.on) Live70.close(); } catch (_) {} return cl(); };
  const ov = Heim.over.bind(Heim); Heim.over = function () { return Schrift.on || Live70.on || ov(); }; }
setTimeout(() => { try {
  const ct = Nav.closeTop, dp = Nav.depth;
  Nav.closeTop = function (fromPop) { if (Schrift.on) { Schrift.close(); try { this.sync(); } catch (_) {} return true; } if (Live70.on) { Live70.close(); try { this.sync(); } catch (_) {} return true; } return ct.call(this, fromPop); };
  Nav.depth = function () { return (Schrift.on ? 1 : 0) + (Live70.on ? 1 : 0) + dp.call(this); };
} catch (e) { console.warn(e); } }, 0);
// Projektwechsel, Rückgängig: offene Flächen passen sich an
{ const pl = Project.load.bind(Project); Project.load = function (...a) { try { if (Schrift.on) Schrift.close(); if (Live70.on) Live70.close(); } catch (_) {} return pl(...a); }; }
{ const wrap = k => { const u = Undo[k].bind(Undo); Undo[k] = function (...a) { const r = u(...a); try { if (Schrift.on) { const f = Schrift.f && Forms.byId(Schrift.f.id); Schrift.f = null; Schrift.t = null; Schrift.setForm(f || null, true); Schrift.render(); } if (Live70.on) { Live70.L = Live70.layers(); if (!Live70.L.length) Live70.close(); else { Live70.render(); Live70.size(); Live70.apply(true); } } } catch (e) { console.warn(e); } return r; }; }; wrap("undo"); wrap("redo"); }
try { Erkl.T.push(
  ['[data-hm="live"]', "Live-Fläche", "Dein Stück läuft, und ein Finger formt es: nach oben spielen mehr Klänge mit, nach rechts wird der Klang heller. „Stille“ und „Echo“ hältst du gedrückt. Dein Spiel kannst du aufnehmen."],
  ['[data-hm="noten"]', "Klangschrift", "Die Noten von KLANGRAUM: Jeder Ton ist ein bunter Balken. Die Farbe und die Zahl sagen, welcher Ton es ist, die Länge, wie lange er klingt, die Höhe, wie hoch er ist. Tippen setzt einen Ton, nochmal tippen löscht ihn."],
  ['[data-v70="live"]', "Live-Fläche", "Öffnet die Live-Fläche: Der Song läuft, und du bestimmst mit einem Finger, wie viele Klänge spielen und wie hell es klingt."],
  [".wu70", "Wucht", "Macht den ganzen Klang fetter: mehr Bassfundament, mehr Glanz, dichter und lauter. Ganz links ist die Wucht aus."]); } catch (_) {}
Help.T.push({ id: "v70", ic: "⚡", t: "Klangschrift, Live-Fläche und Wucht", k: "noten notensystem klangschrift farbnoten balken lesen schreiben setzen live fläche finger xy filter energie stille echo wucht fett laut bass festival trap drum and bass monster donner säge",
  h: `<p><b>Klangschrift</b> ist das Notensystem von KLANGRAUM. Jeder Ton ist ein bunter Balken: <b>Farbe und Zahl</b> sagen, welcher Ton der Tonleiter es ist (1 ist der Grundton), die <b>Länge</b> des Balkens, wie lange er klingt, die <b>Höhe</b>, wie hoch er ist. Vier Kästchen sind ein Schlag, sechzehn ein Takt. Tippen setzt einen Ton, nach rechts ziehen macht ihn länger, nochmal tippen löscht ihn. Helle Zeilen passen zum Akkord des Takts. Du findest sie auf der Startseite, im Song (Klang antippen → „Noten lesen und ändern“) und im Einspielen („Noten“).</p>
  <p><b>Live-Fläche</b>: Dein Stück läuft, ein Finger formt es. <b>Nach oben</b> kommen die Klänge der Reihe nach dazu (links stehen ihre Namen), <b>nach rechts</b> wird der Klang heller. Der Punkt bleibt liegen, wo du loslässt. <b>Stille</b> hältst du gedrückt – beim Loslassen setzt alles wieder ein. <b>Echo</b> wirft die Musik im Takt nach. Mit <b>Aufnehmen</b> landet dein Spiel bei den Aufnahmen.</p>
  <p><b>Wucht</b> im Bereich „Mischen“ macht den ganzen Klang fetter und lauter. Neue Klänge stehen bei den Formen unter „Techno &amp; Bass → Fett (neu)“, neue Stile im Song-Erzeuger: Festival, Trap, Drum &amp; Bass.</p>` });
