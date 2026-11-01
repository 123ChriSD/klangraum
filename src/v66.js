/* ============================================================
   v66: ROCK – verzerrte Gitarren (Saiten-Synthese + Verstärker + Box), Rock-Bass, drei Rock-Schlagzeuge,
        drei Stimmungen und drei fertige Band-Sets mit eigenen Riffs:
        Stoner-Groove (Wüstenrock im Shuffle) · Grunge (90er, laut-leise) · Post-Grunge (Drop-D, große Refrains)
   ============================================================ */

// ---------- 1) Gitarren-Klänge: gezupfte Saite (Karplus-Strong) → Verzerrer → Gitarrenbox ----------
const RockSnd = {
  rs: 12345,
  rnd() { this.rs = (Math.imul(this.rs, 1664525) + 1013904223) >>> 0; return this.rs / 4294967296 * 2 - 1; },
  // eine Saite: Rauschimpuls, Anschlagsposition, Verlust je Umlauf (Ausklingzeit T60), Helligkeit
  ks(n, sr, f, T60, bright, pos, out, at, amp) {
    const N = sr / f, a = clamp(bright, 0.5, 0.99), D = N - (1 - a), g = Math.pow(10, -3 / (T60 * f)), y = new Float32Array(n), M = Math.ceil(N);
    let lp = 0; const k = 1 - Math.exp(-2 * Math.PI * (1200 + 9000 * (bright - 0.4)) / sr), e = new Float32Array(M + 2);
    for (let i = 0; i < M; i++) { lp += k * (this.rnd() - lp); e[i] = lp; }
    const P = Math.max(1, Math.round(N * pos)); for (let i = M - 1; i >= P; i--) e[i] -= e[i - P];
    const rd = t => { if (t < 0) return 0; const j = Math.floor(t), fr = t - j; return y[j] * (1 - fr) + (j + 1 < n ? y[j + 1] : 0) * fr; };
    for (let i = 0; i < n; i++) { const c = rd(i - D), p = rd(i - D - 1); y[i] = (i < M ? e[i] : 0) + g * (a * c + (1 - a) * p); }
    for (let i = 0; i < n - at; i++) out[i + at] += y[i] * amp;
  },
  // RBJ-Biquad mit Kuhschwanz/Glocke
  bq(x, type, f, q, sr, db = 0) {
    const A = Math.pow(10, db / 40), w = 2 * Math.PI * f / sr, c = Math.cos(w), s = Math.sin(w), al = s / (2 * q); let b0, b1, b2, a0, a1, a2;
    if (type === "lp") { b0 = (1 - c) / 2; b1 = 1 - c; b2 = b0; a0 = 1 + al; a1 = -2 * c; a2 = 1 - al; }
    else if (type === "hp") { b0 = (1 + c) / 2; b1 = -(1 + c); b2 = b0; a0 = 1 + al; a1 = -2 * c; a2 = 1 - al; }
    else { b0 = 1 + al * A; b1 = -2 * c; b2 = 1 - al * A; a0 = 1 + al / A; a1 = -2 * c; a2 = 1 - al / A; }
    let x1 = 0, x2 = 0, y1 = 0, y2 = 0; for (let i = 0; i < x.length; i++) { const v = (b0 * x[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0; x2 = x1; x1 = x[i]; y2 = y1; y1 = v; x[i] = v; } return x;
  },
  KIND: {
    //        Saiten (Halbtöne)  Ausklang  Hell  Anschlag  Dauer  Verzerrung  Vorspannung  Box (Tiefpass)  Glocke     Senke
    crunch: { st: [0, 7, 12], T: 3.4, br: 0.62, pos: 0.16, dur: 2.8, G: 9, bias: 0.15, lp: 4800, pk: [1700, 4], dip: [450, -3], hp: 90 },
    fuzz: { st: [0, 7, 12], T: 4.6, br: 0.58, pos: 0.2, dur: 3.2, G: 30, bias: 0.25, oct: 0.16, lp: 3200, pk: [850, 3], dip: [2600, -4], hp: 65 },
    dropd: { st: [0, 7, 12], T: 1.1, br: 0.5, pos: 0.12, dur: 1.6, G: 15, bias: 0.12, lp: 4300, pk: [110, 4], dip: [650, -4], hp: 55 },
    clean: { st: [0], T: 3.6, br: 0.8, pos: 0.18, dur: 3.4, G: 0, cho: 0.42, lp: 7000, pk: [2600, 2], dip: [300, -2], hp: 80 },
    lead: { st: [0], T: 7, br: 0.66, pos: 0.15, dur: 2.6, G: 18, bias: 0.1, lp: 5200, pk: [1500, 5], dip: [400, -3], hp: 120 },
    bass: { st: [0], T: 2.6, br: 0.52, pos: 0.22, dur: 2.2, G: 2.6, bias: 0.05, sub: 0.45, lp: 2600, pk: [800, 3], dip: [250, -2], hp: 32 }
  },
  render(kind, midi, sr) {
    const P = this.KIND[kind] || this.KIND.crunch, n = Math.round(sr * P.dur), x = new Float32Array(n), f0 = midiHz(midi); this.rs = 9001 + midi * 131 + kind.length * 7;
    P.st.forEach((s, i) => this.ks(n, sr, f0 * Math.pow(2, s / 12), P.T * (1 - i * 0.12), P.br, P.pos + i * 0.03, x, Math.round(sr * 0.004 * i), i ? 0.8 : 1));
    if (P.cho) { this.ks(n, sr, f0 * Math.pow(2, 7 / 1200), P.T, P.br, P.pos + 0.05, x, Math.round(sr * 0.007), P.cho); this.ks(n, sr, f0 * Math.pow(2, -6 / 1200), P.T, P.br, P.pos + 0.09, x, Math.round(sr * 0.011), P.cho * 0.8); }
    if (P.sub) { let p = 0; for (let i = 0; i < n; i++) { p += 2 * Math.PI * f0 / sr; x[i] += P.sub * Math.sin(p) * Math.exp(-i / sr * 1.6) * Math.min(1, i / (sr * 0.004)); } }
    this.bq(x, "hp", P.hp, 0.7, sr);
    if (P.G > 0) { let pk = 1e-6; for (const v of x) pk = Math.max(pk, Math.abs(v)); const G = P.G / pk, b = P.bias || 0, tb = Math.tanh(b);
      for (let i = 0; i < n; i++) { let v = Math.tanh(x[i] * G + b) - tb; if (P.oct) v += P.oct * (Math.abs(v) - 0.3); x[i] = v; } }
    this.bq(x, "pk", P.pk[0], 1.1, sr, P.pk[1]); this.bq(x, "pk", P.dip[0], 0.9, sr, P.dip[1]); this.bq(x, "lp", P.lp, 0.75, sr); this.bq(x, "lp", P.lp * 1.35, 0.6, sr); this.bq(x, "hp", P.hp * 0.8, 0.6, sr);
    const fo = Math.round(sr * 0.06); for (let i = 0; i < fo; i++) x[n - 1 - i] *= i / fo;
    return x;
  }
};
// Klangsätze „syn“: werden beim ersten Gebrauch im Gerät berechnet (ohne Netz, ohne Dateien)
{ const mr = Inst.makeRec.bind(Inst); Inst.makeRec = function (key, gm) {
  if (!gm || !gm.syn) return mr(key, gm);
  const [a, b, st] = gm.syn.range, avail = []; for (let m = a; m <= b; m += st) avail.push(m);
  const s = this.sets[key] = { kind: "syn", st: "ok", gm, ts: gm.ts, avail, names: new Map(avail.map(m => [m, String(m)])), emb: new Set(avail), zones: new Map(), n: 0, fails: 0 };
  for (const z of avail) s.zones.set(z, "busy"); this.queue.push(...avail.map(z => ({ key, z }))); this.pump(); return s; }; }
{ const dc = Inst.decode.bind(Inst); Inst.decode = async function (s, z, hq) {
  if (!s || s.kind !== "syn") return dc(s, z, hq); if (hq) return;
  const sr = Engine.ctx.sampleRate, x = RockSnd.render(s.gm.syn.k, z, sr), hz = midiHz(z), zp = K.prepZone(x, sr, hz, { loop: !!s.gm.loop, lvl: s.gm.lvl || 1 });
  if (!zp) throw new Error("leer"); Engine.post({ t: "iz", key: "rec:" + s.ts, m: z, hz, d: zp.d, ls: zp.ls, le: zp.le }, [zp.d.buffer]); }; }

// ---------- 2) Rock-Schlagzeug (synthetisch wie die Beatbox-Kits): Kick · Snare mit Raum · Hi-Hat · Becken ----------
Object.assign(BBX.SND, {
  kick_rock(sr, B) { const n = Math.round(sr * 0.5), b = B.mul(B.sine(n, sr, t => 54 + 95 * Math.exp(-t * 32)), B.env(n, sr, t => Math.exp(-t * 7.5))), cl = B.mul(B.filt(B.noise(n), "bp", 3200, 1.2, sr), B.env(n, sr, t => Math.exp(-t * 260)));
    return B.norm(B.mix(n, [b, 1], [cl, 0.35]), 0.97, 1.8); },
  kick_stoner(sr, B) { const n = Math.round(sr * 0.6), b = B.mul(B.sine(n, sr, t => 47 + 70 * Math.exp(-t * 26)), B.env(n, sr, t => Math.exp(-t * 5.5))), cl = B.mul(B.filt(B.noise(n), "lp", 1800, 0.8, sr), B.env(n, sr, t => Math.exp(-t * 120)));
    return B.norm(B.mix(n, [b, 1], [cl, 0.4]), 0.97, 2.6); },
  snare_rock(sr, B) { const n = Math.round(sr * 0.7), body = B.mul(B.sine(n, sr, t => 185 + 40 * Math.exp(-t * 50)), B.env(n, sr, t => Math.exp(-t * 22))), wire = B.mul(B.filt(B.noise(n), "bp", 3800, 0.6, sr), B.env(n, sr, t => Math.exp(-t * 16))),
      room = B.mul(B.filt(B.noise(n), "lp", 3500, 0.7, sr), B.env(n, sr, t => Math.min(1, t * 60) * Math.exp(-t * 6)));
    return B.norm(B.mix(n, [body, 0.9], [wire, 1], [room, 0.35]), 0.9, 1.7); },
  snare_grunge(sr, B) { const n = Math.round(sr * 0.9), body = B.mul(B.sine(n, sr, t => 170 + 30 * Math.exp(-t * 40)), B.env(n, sr, t => Math.exp(-t * 15))), wire = B.mul(B.filt(B.noise(n), "bp", 3000, 0.55, sr), B.env(n, sr, t => Math.exp(-t * 12))),
      room = B.mul(B.filt(B.noise(n), "lp", 2800, 0.7, sr), B.env(n, sr, t => Math.min(1, t * 40) * Math.exp(-t * 3.6)));
    return B.norm(B.mix(n, [body, 1], [wire, 0.9], [room, 0.55]), 0.9, 2.2); },
  snare_stoner(sr, B) { const n = Math.round(sr * 0.4), body = B.mul(B.sine(n, sr, t => 160 + 35 * Math.exp(-t * 45)), B.env(n, sr, t => Math.exp(-t * 18))), wire = B.mul(B.filt(B.noise(n), "bp", 2600, 0.7, sr), B.env(n, sr, t => Math.exp(-t * 24)));
    return B.norm(B.mix(n, [body, 1.1], [wire, 0.8]), 0.88, 2.4); },
  hat_rock(sr, B) { const n = Math.round(sr * 0.22), y = new Float32Array(n); for (const f of [2950, 4220, 5310, 6390, 7710, 8820]) { const p = Math.random() * 6; for (let i = 0; i < n; i++) y[i] += Math.sign(Math.sin(2 * Math.PI * f * i / sr + p)); }
    return B.norm(B.mul(B.filt(B.filt(y, "hp", 7000, 0.7, sr), "lp", 13000, 0.7, sr), B.env(n, sr, t => Math.exp(-t * 22))), 0.6, 1); },
  top_crash(sr, B) { const n = Math.round(sr * 2.2), y = new Float32Array(n); for (const f of [3310, 4130, 5570, 6820, 8130, 9450, 11200]) { const p = Math.random() * 6; for (let i = 0; i < n; i++) y[i] += Math.sign(Math.sin(2 * Math.PI * f * i / sr + p)) * 0.5; }
    const nz = B.noise(n); for (let i = 0; i < n; i++) y[i] += nz[i] * 1.2;
    return B.norm(B.mul(B.filt(y, "hp", 3200, 0.6, sr), B.env(n, sr, t => Math.min(1, t * 300) * Math.exp(-t * 1.7))), 0.75, 1.1); },
  top_ride(sr, B) { const n = Math.round(sr * 1.4), y = new Float32Array(n); for (const [f, a, d] of [[612, 0.7, 2.2], [1380, 0.5, 2.6], [2810, 0.35, 3.2], [4930, 0.3, 4], [7120, 0.25, 5]]) for (let i = 0; i < n; i++) y[i] += a * Math.sin(2 * Math.PI * f * i / sr) * Math.exp(-i / sr * d);
    const nz = B.mul(B.filt(B.noise(n), "hp", 6000, 0.7, sr), B.env(n, sr, t => Math.exp(-t * 9))); for (let i = 0; i < n; i++) y[i] += nz[i] * 0.5;
    return B.norm(y, 0.7, 1.2); }
});
Object.assign(BBX.KITS, { kit_rock: ["kick_rock", "snare_rock", "hat_rock", "top_crash"], kit_grunge: ["kick_rock", "snare_grunge", "hat_rock", "top_crash"], kit_stoner: ["kick_stoner", "snare_stoner", "hat_rock", "top_ride"] });

// ---------- 3) Formen der Kategorie „Rock“ ----------
{ const G = (n, rel, ring, lvl, k, range, loop) => ({ n, ts: n, rel, ring, lvl, loop: !!loop, syn: { k, range } }), ENVP = { att: 0.002, dec: 0.6, sus: 0.6, rel: 0.15, bt: 0.4, nb: 0.02, nz: 0, mt: 0 }, ENVL = { att: 0.008, dec: 0.5, sus: 0.92, rel: 0.2, bt: 0, nb: 0.02, nz: 0, mt: 0 }, ENVD = { att: 0.001, dec: 0.5, sus: 0, rel: 0.25, bt: 0.1, nb: 0, nz: 0, mt: 0 };
  K.SEEDS.push(
    { id: "rk_crunch", cat: "rock", grp: "Gitarren", name: "Crunch-Gitarre", fam: "Rock-Gitarre", kind: "synth", desc: "Powerchords, angezerrt, offen klingend", size: 1.0, stretch: 1.2, spin: 0.1, gm: G("rk_crunch", 0.14, 1.4, 1, "crunch", [40, 76, 4]), env: ENVP, shape: s => { s.facets(9, 0.13, 0.22); s.tilt(0.12); } },
    { id: "rk_fuzz", cat: "rock", grp: "Gitarren", name: "Fuzz-Gitarre", fam: "Rock-Gitarre", kind: "synth", desc: "fetter Fuzz, tief, staubig – Stoner", size: 1.15, stretch: 1.1, spin: 0.05, gm: G("rk_fuzz", 0.16, 1.6, 0.95, "fuzz", [36, 72, 4]), env: ENVP, shape: s => { s.lumps(6, 0.14, 0.4, 19); s.spikes(5, 0.1, 0.1, 3); } },
    { id: "rk_dropd", cat: "rock", grp: "Gitarren", name: "Drop-D-Gitarre", fam: "Rock-Gitarre", kind: "synth", desc: "tief gestimmt, gedämpftes Riffing, Druck", size: 1.25, stretch: 0.85, spin: 0, gm: G("rk_dropd", 0.08, 0.8, 1.05, "dropd", [36, 68, 4]), env: ENVP, shape: s => { s.box(0.1); s.facets(6, 0.12, 0.3); } },
    { id: "rk_clean", cat: "rock", grp: "Gitarren", name: "Clean-Gitarre", fam: "Rock-Gitarre", kind: "synth", desc: "klar mit Chorus – für Strophen und Arpeggien", size: 0.95, stretch: 1.45, spin: 0.2, gm: G("rk_clean", 0.3, 1.8, 0.95, "clean", [40, 84, 4]), env: ENVP, shape: s => { s.lumps(4, 0.07, 0.5, 7); } },
    { id: "rk_lead", cat: "rock", grp: "Gitarren", name: "Lead-Gitarre", fam: "Rock-Gitarre", kind: "synth", desc: "singend, lang gehalten – fürs Solo", size: 0.9, stretch: 1.3, spin: 0.7, gm: G("rk_lead", 0.22, 0.6, 0.9, "lead", [52, 88, 4], true), env: ENVL, shape: s => { s.spikes(8, 0.12, 0.08, 29); s.tilt(0.15); } },
    { id: "rk_bass", cat: "rock", grp: "Bass", name: "Rock-Bass", fam: "Bass", kind: "synth", desc: "Plektrum, leicht angezerrt, trägt das Riff", size: 1.4, stretch: 0.9, spin: 0, gm: G("rk_bass", 0.12, 0.7, 1.1, "bass", [24, 56, 4]), env: ENVP, shape: s => { s.cap(-0.7, 0.45, 0.4); s.facets(5, 0.08, 0.3); } },
    { id: "kit_rock", cat: "rock", grp: "Schlagzeug", kit: "kit_rock", name: "Rock-Kit", fam: "Rock-Drums", kind: "drum", desc: "Kick mit Klick, Snare mit Raum, Hi-Hat, Crash", size: 1.2, stretch: 0.65, spin: 0, env: ENVD, shape: s => { s.box(0.1); s.band(0.3, 0.07, 0.3); } },
    { id: "kit_grunge", cat: "rock", grp: "Schlagzeug", kit: "kit_grunge", name: "Grunge-Kit", fam: "Rock-Drums", kind: "drum", desc: "große, hallige Snare – 90er-Proberaum", size: 1.25, stretch: 0.7, spin: 0, env: ENVD, shape: s => { s.lumps(5, 0.1, 0.45, 13); s.band(0.1, 0.08, 0.3); } },
    { id: "kit_stoner", cat: "rock", grp: "Schlagzeug", kit: "kit_stoner", name: "Stoner-Kit", fam: "Rock-Drums", kind: "drum", desc: "trocken, fette Kick, Ride statt Crash", size: 1.3, stretch: 0.62, spin: 0, env: ENVD, shape: s => { s.cap(-0.8, 0.4, 0.45); s.facets(7, 0.08, 0.3); } });
  Object.assign(Perf.REG, { rk_crunch: [40, 64, "arp"], rk_fuzz: [36, 60, "arp"], rk_dropd: [38, 60, "arp"], rk_clean: [45, 72, "arp"], rk_lead: [55, 79, "lead"], rk_bass: [28, 50, "bass"] });
  Sheets.SEEDCATS.push(["rock", "Rock"]);
}

// ---------- 4) Stimmungen für Rock ----------
K.MOODS.push(
  { id: "stoner", name: "Stoner", desc: "tief, groovend, staubig", color: "#C98A4B", root: 64, mode: "dorian", penta: [0, 2, 3, 4, 6], prog: [0, 0, 2, 3], bpm: 100, groove: "four" },
  { id: "grunge", name: "Grunge", desc: "rau, laut und leise, 90er", color: "#8A9A6B", root: 64, mode: "aeolian", penta: [0, 2, 3, 4, 6], prog: [0, 5, 2, 6], bpm: 116, groove: "pop" },
  { id: "postgrunge", name: "Post-Grunge", desc: "schwer, Drop-D, große Refrains", color: "#6E7FA8", root: 62, mode: "aeolian", penta: [0, 2, 3, 4, 6], prog: [0, 5, 2, 6], bpm: 92, groove: "epic" });

// ---------- 5) Band-Sets: Formen + eigene Riffs (Loops) + Pult-Szenen ----------
// Schreibweise: Töne [Schritt in 16teln, Länge, MIDI, Stärke] · Trommeln [Schritt, Zone, Stärke]. Alle Riffs sind eigene Kompositionen im Stil.
const RockSets = {
  // Hilfen zum Bauen der Spuren
  arp(voic, pat, every = 2, d = 2.4, v = 0.62) { const ev = []; voic.forEach((V, b) => pat.forEach((k, j) => ev.push([b * 16 + j * every, d, V[Math.min(k, V.length - 1)], v - (j % 2) * 0.08]))); return ev; },
  hits(roots, rh, v = 0.86) { const ev = []; roots.forEach((r, b) => rh.forEach(([s, d, a]) => ev.push([b * 16 + s, d, r, v * (a || 1)]))); return ev; },
  bass8(roots, scale) { const ev = [], inS = m => scale.includes(((m % 12) + 12) % 12); roots.forEach((r, b) => { const nx = roots[(b + 1) % roots.length]; for (let s = 0; s < 12; s += 2) ev.push([b * 16 + s, 1.8, r, s % 4 ? 0.7 : 0.85]); ev.push([b * 16 + 12, 1.8, r + 7, 0.75]); const ap = inS(nx - 1) ? nx - 1 : nx - 2; ev.push([b * 16 + 14, 1.8, ap < r - 7 ? ap + 12 : ap, 0.72]); }); return ev; },
  beat(bars, o) { const ev = []; for (let b = 0; b < bars; b++) { const B = b * 16, last = b === bars - 1;
      for (const s of o.kick(b)) ev.push([B + s, "kick", 0.95]); for (const s of (last && o.fill ? o.fill : o.snare)) ev.push([B + s, "snare", s === 4 || s === 12 ? 0.92 : 0.62]);
      for (const s of o.hat) if (!(last && o.fill && s >= 12)) ev.push([B + s, "hat", s % 4 === 0 ? 0.62 : 0.42]);
      if (o.top && o.top(b)) ev.push([B, "top", 0.7]); } return ev; },
  SW: 2.67,   // Shuffle: die Achtel nach dem Schlag kommt als Triole später
  get L() {
    if (this._L) return this._L; const S = this.SW;
    const ePent = [4, 7, 9, 10, 11, 2], eAeol = [4, 6, 7, 9, 11, 0, 2], dAeol = [2, 4, 5, 7, 9, 10, 0];
    // --- Stoner-Groove (E dorisch, 100 bpm, Shuffle) ---
    const stRiff = [[0, 2.4, 40, 0.95], [S, 1.2, 40, 0.75], [4, 2, 43, 0.88], [4 + S, 1.2, 45, 0.8], [8, 2, 45, 0.9], [8 + S, 1.2, 43, 0.75], [12, 2, 40, 0.92], [12 + S, 1.2, 38, 0.8],
      [16, 5, 40, 0.95], [20 + S, 1.2, 43, 0.78], [24, 1.2, 45, 0.85], [25.33, 1.2, 46, 0.82], [26.67, 1.2, 45, 0.8], [28, 1.6, 43, 0.85], [28 + S, 1.2, 40, 0.78]];
    const stLead = [[32, 2, 64, 0.82], [32 + S, 1.2, 67, 0.75], [36, 1.2, 69, 0.85], [37.33, 1.2, 70, 0.8], [38.67, 3, 71, 0.9], [42.67, 1.2, 74, 0.82], [44, 2, 71, 0.85], [46.67, 1.2, 69, 0.78], [48, 8, 64, 0.9], [57.33, 1.2, 67, 0.7], [58.67, 1.2, 69, 0.74], [60, 4, 71, 0.8]];
    const stKit = this.beat(2, { kick: b => b ? [0, 6.67, 8, 14.67] : [0, 6.67, 8, 10.67], snare: [4, 12], hat: [0, S, 4, 4 + S, 8, 8 + S, 12, 12 + S], top: b => b === 0 });
    // --- Grunge (E äolisch, 116 bpm): Em – C – G – D ---
    const gV = [[40, 47, 52, 55, 59, 64], [48, 52, 55, 60, 64], [43, 47, 50, 55, 59, 67], [50, 57, 62, 66]];
    const gKit = this.beat(4, { kick: b => b % 2 ? [0, 8, 10] : [0, 7, 8], snare: [4, 12], hat: [0, 2, 4, 6, 8, 10, 12, 14], top: b => b % 2 === 0, fill: [4, 12, 13, 14, 15] });
    const gLead = [[0, 4, 67, 0.8], [4, 2, 69, 0.78], [6, 6, 71, 0.88], [12, 2, 74, 0.82], [14, 2, 76, 0.85], [16, 4, 74, 0.86], [20, 4, 71, 0.8], [24, 4, 69, 0.78], [28, 4, 67, 0.8],
      [32, 3, 64, 0.82], [35, 1, 67, 0.7], [36, 4, 69, 0.85], [40, 2, 71, 0.8], [42, 6, 69, 0.82], [48, 6, 67, 0.84], [54, 2, 66, 0.75], [56, 8, 64, 0.9]];
    // --- Post-Grunge (D äolisch, 92 bpm, Drop-D): Dm – B♭ – F – C ---
    const pRiff = [[0, 2.5, 38, 0.95], [3, 0.8, 38, 0.6], [4, 1.5, 38, 0.8], [6, 2, 41, 0.9], [8, 3, 43, 0.92], [11, 0.8, 41, 0.6], [12, 2, 38, 0.88], [14, 2, 41, 0.86],
      [16, 2.5, 38, 0.95], [19, 0.8, 38, 0.6], [20, 1.5, 38, 0.8], [22, 2, 41, 0.9], [24, 4, 46, 0.95], [28, 4, 45, 0.92]];
    const pV = [[50, 57, 62, 65, 69], [46, 53, 58, 62, 65], [41, 48, 53, 57, 60, 65], [48, 52, 55, 60, 64]];
    const pKit = this.beat(4, { kick: b => [0, 6, 8, b % 2 ? 11 : 10], snare: [4, 12], hat: [0, 2, 4, 6, 8, 10, 12, 14], top: b => b % 2 === 0, fill: [4, 10, 12, 14, 15] });
    const pLead = [[0, 8, 69, 0.85], [8, 4, 67, 0.8], [12, 4, 65, 0.8], [16, 8, 67, 0.84], [24, 8, 65, 0.8], [32, 8, 65, 0.84], [40, 4, 64, 0.78], [44, 4, 60, 0.76], [48, 16, 62, 0.9]];
    return (this._L = [
      { id: "stoner", n: "Stoner-Groove", d: "Fuzz-Riffs im Shuffle, der Bass spielt das Riff mit, trockenes Schlagzeug mit Ride – Wüstenrock, der groovt.", mood: "stoner", bpm: 100,
        parts: [{ seed: "rk_fuzz", name: "Fuzz-Riff", bars: 2, ev: stRiff },
          { seed: "rk_bass", name: "Riff-Bass", bars: 2, ev: stRiff.map(([s, d, m, v]) => [s, d, m - 12, v]) },
          { seed: "kit_stoner", name: "Stoner-Kit", bars: 2, ev: stKit },
          { seed: "rk_lead", name: "Blues-Solo", bars: 4, ev: stLead }],
        scenes: [["Riff", [0, 1, 2]], ["Solo", [0, 1, 2, 3]], ["Break", [1, 2]]] },
      { id: "grunge", n: "Grunge", d: "Leise Strophe mit klarer Gitarre und Arpeggio, lauter Refrain mit angezerrten Akkorden und Melodie-Solo – Em, C, G, D.", mood: "grunge", bpm: 116,
        parts: [{ seed: "rk_clean", name: "Strophe (clean)", bars: 4, ev: this.arp(gV, [0, 2, 3, 4, 5, 4, 3, 2]) },
          { seed: "rk_crunch", name: "Refrain-Akkorde", bars: 4, ev: this.hits([40, 48, 43, 50], [[0, 5.5], [6, 1.5, 0.8], [8, 3.5], [12, 1.5, 0.8], [14, 1.8, 0.85]]) },
          { seed: "rk_bass", name: "Bass", bars: 4, ev: this.bass8([28, 36, 31, 38], eAeol) },
          { seed: "kit_grunge", name: "Grunge-Kit", bars: 4, ev: gKit },
          { seed: "rk_lead", name: "Melodie-Solo", bars: 4, ev: gLead }],
        scenes: [["Strophe", [0, 2, 3]], ["Refrain", [1, 2, 3, 4]], ["Laut", [1, 2, 3]]] },
      { id: "postgrunge", n: "Post-Grunge", d: "Tief gestimmtes Drop-D-Riff, ruhige Strophe mit Arpeggio, schwerer Refrain mit Powerchords und Melodie – Dm, B♭, F, C.", mood: "postgrunge", bpm: 92,
        parts: [{ seed: "rk_dropd", name: "Drop-D-Riff", bars: 2, ev: pRiff },
          { seed: "rk_clean", name: "Strophe (clean)", bars: 4, ev: this.arp(pV, [0, 1, 2, 3, 4, 3, 2, 1]) },
          { seed: "rk_dropd", name: "Refrain-Powerchords", bars: 4, ev: this.hits([38, 46, 41, 48], [[0, 1.8], [2, 1.8, 0.75], [4, 1.8, 0.85], [6, 1.8, 0.75], [8, 1.8], [10, 1.8, 0.75], [12, 3.6, 0.9]]) },
          { seed: "rk_bass", name: "Bass", bars: 4, ev: this.bass8([26, 34, 29, 36], dAeol) },
          { seed: "kit_rock", name: "Rock-Kit", bars: 4, ev: pKit },
          { seed: "rk_lead", name: "Refrain-Melodie", bars: 4, ev: pLead }],
        scenes: [["Riff", [0, 4]], ["Strophe", [1, 3, 4]], ["Refrain", [2, 3, 4, 5]]] }
    ]);
  },
  byId(id) { return this.L.find(s => s.id === id) || null; },
  zoneU: { kick: 0.15, snare: 0.47, hat: 0.72, top: 0.92 },
  // Set laden: als neues Stück (Standard) oder dazu ins aktuelle Stück
  async load(id, add) {
    const S = this.byId(id); if (!S) return; Hap(14);
    if (!add) await Projects.create(S.n, "leer"); else Undo.push();
    const made = this.fill(S, add); if (!made) return;
    if (made[0]) Forms.setActive(made[0]); UI.hideSheets(); UI.setTab("loop"); UI.refresh(); Save.soon(); try { await Save.now(); } catch (_) {}
    UI.toastAct(`„${S.n}“ ist da: ${made.length} Formen mit Riffs · ▶ startet „${S.scenes[0][0]}“, die Szenen oben wechseln zu ${S.scenes.slice(1).map(s => "„" + s[0] + "“").join(" und ")}`, "Los", () => { if (!Transport.running) Pult.sGo(0); }, 6400);
  },
  // Formen, Riffs und Szenen anlegen (ohne Warten – auch für den Prüfstand)
  fill(S, add) {
    if (!add) { const m = K.MOODS.find(x => x.id === S.mood); if (m) Music.set(m); Music.setTempo(S.bpm); }
    const room = Forms.MAX - Forms.list.length; if (room < S.parts.length) { UI.toast(`Dafür fehlen ${S.parts.length - room} Plätze – erst Formen löschen`, 2600); return null; }
    const n = S.parts.length, made = [];
    S.parts.forEach((p, i) => {
      const ang = (i / n) * Math.PI * 2, r = 2.8, f = Forms.make({ seedId: p.seed, name: p.name, pos: add ? undefined : { x: Math.sin(ang) * r, y: 0, z: -Math.cos(ang) * r * 0.8 - 0.6 } }); if (!f) return;
      Forms.rebuild(f, true); f.still = false; f.takes = []; f.fine.vol = p.vol ?? ({ rk_bass: 0.78, rk_crunch: 1.2, rk_fuzz: 1.15, rk_dropd: 1.2, rk_lead: 1.05 })[p.seed] ?? (f.kind === "drum" ? 0.9 : 1); Forms.applyMix(f);
      const drum = f.kind === "drum", ev = p.ev.map(e => drum ? { s: e[0], d: 1, z: e[1], v: e[2], u: this.zoneU[e[1]] || 0.5 } : { s: e[0], d: e[1], m: e[2], v: e[3], u: clamp((e[2] - 28) / 60, 0, 1) });
      const t = Loops.newTake(f, p.bars, ev, p.name.slice(0, 22)); t.base = 0; made.push(f);
    });
    // Pult-Szenen: jede Szene = welche Formen laufen; die erste ist gleich aktiv
    try { const base = add ? Pult.scn.findIndex(x => !x) : 0; if (!add) Pult.sLoad(null); S.scenes.forEach(([nm, ix], k) => { const at = add ? (base < 0 ? -1 : base + k) : k; if (at >= 0 && at < Pult.N) Pult.scn[at] = { ids: ix.map(i => made[i] && made[i].id).filter(Boolean), name: nm }; });
      const first = new Set(S.scenes[0][1]); made.forEach((f, i) => Fade.set(f, first.has(i), true)); Pult.cur = add ? -1 : 0; } catch (e) { console.warn(e); }
    return made;
  },
  open(id) {
    const S = this.byId(id); if (!S) return; const m = K.MOODS.find(x => x.id === S.mood);
    const s = Sheets.open("Rock-Set", Sheets.head(S.n) + `<p>${esc(S.d)}</p>
      <p class="wtip">${esc(m ? m.name : "")} · ${S.bpm} Schläge/min · Szenen im Pult: ${S.scenes.map(x => "<b>" + esc(x[0]) + "</b>").join(" → ")}</p>
      <div class="rkparts">${S.parts.map(p => `<span class="npt">${esc(p.name)} <small>${esc(K.seedById(p.seed).name)} · ${p.bars} T.</small></span>`).join("")}</div>
      <div class="row"><button class="btn primary" data-rk="new">Als neues Stück</button><button class="btn" data-rk="add">Zum aktuellen Stück dazu</button></div>
      <p class="wtip">Alles bleibt veränderbar: kneten färbt den Klang, Steuerfeld → Loops → Töne bearbeiten, Tempo im Pult. Die Riffs sind eigene Kompositionen im Stil.</p>`);
    s.addEventListener("click", e => { const b = e.target.closest("[data-rk]"); if (b) this.load(id, b.dataset.rk === "add"); });
  }
};
// Pult: Gitarren als Gitarren zeigen
{ const kd = Pult.kind.bind(Pult); Pult.kind = function (f) { const id = f && (f.inst || f.seedId) || ""; if (/^rk_/.test(id) && id !== "rk_bass") return ["🎸", "Gitarre"]; return kd(f); }; }
// Szenen-Namen in den Pult-Knöpfen zeigen (z. B. „Riff“, „Refrain“)
{ const sd = Pult.sData.bind(Pult); Pult.sData = function () { return sd().map((x, i) => x && this.scn[i] && this.scn[i].name ? { ...x, name: this.scn[i].name } : x); }; }
{ const sl = Pult.sLoad.bind(Pult); Pult.sLoad = function (d) { sl(d); try { (d || []).forEach((x, i) => { if (x && x.name && this.scn[i]) this.scn[i].name = String(x.name).slice(0, 12); }); } catch (_) {} }; }
{ const sh = Pult.scenesHtml.bind(Pult); Pult.scenesHtml = function () { let h = sh(); this.scn.forEach((s, i) => { if (s && s.name) h = h.replace(new RegExp(`(data-psc="${i}"[^>]*>)<b>${i + 1}</b>`), `$1<b class="pscn">${esc(s.name)}</b>`); }); return h; }; }

// Einstieg 1: ＋ Neu → Kategorie „Rock“, oben die drei Band-Sets
{ const so = Sheets.seeds.bind(Sheets); Sheets.seeds = function (replaceFor, ...r) { const r0 = so(replaceFor, ...r), s = (r0 && r0.querySelector ? r0 : null) || document.querySelector("#sheets .sheet"); try { if (!replaceFor && s) { const c = s.querySelector('.seedcat[data-cat="rock"]');
  if (c && !c.querySelector(".rksets")) c.insertAdjacentHTML("afterbegin", `<h3 class="wh sgh">Band-Sets <small>3</small></h3><p class="wtip">Fertige Rock-Besetzung mit eigenen Riffs, Stimmung, Tempo und Pult-Szenen (Strophe, Refrain, Solo) – antippen, dann ▶.</p>
    <div class="rksets">${RockSets.L.map(S => `<button class="rkset" data-rkset="${S.id}"><b>${esc(S.n)}</b><small>${esc(S.d)}</small><em>${S.parts.length} Formen · ${S.bpm} bpm</em></button>`).join("")}</div><h3 class="wh sgh">Einzelne Formen</h3>`);
  s.addEventListener("click", e => { const b = e.target.closest("[data-rkset]"); if (b) { e.stopPropagation(); Hap(8); RockSets.open(b.dataset.rkset); } }, true); } } catch (e) { console.warn(e); } return r0; }; }
// Einstieg 2: Neues Stück → Formen „Stoner“, „Grunge“, „Post-Grunge“ (mit Riffs)
try { NewPiece.SETS.splice(NewPiece.SETS.length - 1, 0, ["r_stoner", "Stoner", ["rk_fuzz", "rk_bass", "kit_stoner", "rk_lead"]], ["r_grunge", "Grunge", ["rk_clean", "rk_crunch", "rk_bass", "kit_grunge", "rk_lead"]], ["r_postgrunge", "Post-Grunge", ["rk_dropd", "rk_clean", "rk_dropd", "rk_bass", "kit_rock", "rk_lead"]]); } catch (_) {}
{ const go = NewPiece.go.bind(NewPiece); NewPiece.go = async function () { const k = this.st && this.st.set; if (k && /^r_/.test(k)) { store.set("npLast", { mood: this.st.mood, bpm: this.st.bpm, set: k, forms: this.st.forms.slice() }); return RockSets.load(k.slice(2)); } return go(); }; }

// ---------- 6) Hilfe ----------
Help.T.push({ id: "rock", ic: "🎸", t: "Rock spielen: Stoner, Grunge, Post-Grunge", k: "rock gitarre e-gitarre verzerrt fuzz crunch powerchord riff drop-d grunge stoner post-grunge band schlagzeug bass solo neunziger 90er",
  h: `<ul><li><b>＋ Neu → Rock → Band-Sets</b> (oder Neues Stück → Stoner / Grunge / Post-Grunge): eine komplette Besetzung mit eigenen Riffs, passender Stimmung, Tempo und <b>Pult-Szenen</b>. Danach ▶ – und mit den Szenen im Pult wechselst du zwischen Strophe, Refrain und Solo, immer auf der Eins.</li>
  <li><b>Stoner-Groove</b>: Fuzz-Riff im Shuffle, der Bass spielt mit, trockenes Kit mit Ride, Blues-Solo (E dorisch, 100 bpm).</li>
  <li><b>Grunge</b>: leise Strophe mit Clean-Gitarre und Arpeggio, lauter Refrain mit Crunch-Akkorden und Melodie-Solo (Em – C – G – D, 116 bpm).</li>
  <li><b>Post-Grunge</b>: Drop-D-Riff, ruhige Strophe, schwerer Refrain mit Powerchords (Dm – B♭ – F – C, 92 bpm).</li>
  <li>Einzelne Formen: <b>Crunch-, Fuzz-, Drop-D-, Clean- und Lead-Gitarre</b>, <b>Rock-Bass</b>, <b>Rock-, Grunge- und Stoner-Kit</b>. Die Gitarren werden im Gerät berechnet (gezupfte Saite, Verstärker, Box) – sie klingen auch ohne Internet.</li>
  <li>Eigene Riffs: Form wählen → 🎹 Tasten → Melodie aufnehmen. Kneten macht die Gitarre spitzer (heller, schärfer) oder runder (wärmer).</li></ul>` });
