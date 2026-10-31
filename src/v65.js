/* ============================================================
   v65: Melodien gezielt spielen (Tasten, Akkorde, Lieder nachspielen, als Loop) · Rückblick-Schnitt (Ausschnitt → Schnittraum,
        Loop, Form) · Kneten wirkt auch auf Drum-Kits und Loop-Formen · Tonstufen-Anzeige verschwindet zuverlässig ·
        Loops bis 16 Takte · vorige Version unter /vorige/
   ============================================================ */

// ---------- 0) Kleinigkeiten ----------
const deN = m => ({ "Db": "D♭", "Eb": "E♭", "Gb": "G♭", "Ab": "A♭", "Bb": "B", "B": "H" })[K.NOTE_NAMES[mod(m, 12)]] || K.NOTE_NAMES[mod(m, 12)];
const MODE_DE = { ionian: "Dur", aeolian: "Moll", dorian: "Dorisch", phrygian: "Phrygisch" };

// ---------- 1) Kneten → Klang: auch Drum-Kits (heller, metallischer, rauer, verzerrter) ----------
// Bisher bekamen Schlagzeug-Formen nur Stimmung (Größe) und Ausklang – Spitzen, Beulen und Rauheit änderten am Klang fast nichts.
const KneadDrum = {
  md(src) {
    const sd = K.seedById(src.seedId); if (!src.snd0 || src.snd0Key !== sd.id) { const h0 = K.seedShape(sd); src.snd0 = K.soundOf({ ...sd, h: h0, size: sd.size, stretch: sd.stretch, spin: sd.spin, fine: {}, kind: sd.kind }, K.analyze(h0)); src.snd0Key = sd.id; }
    return K.instMod(src.snd, src.snd0);
  }
};
{ const fo = Forms.fpOf.bind(Forms); Forms.fpOf = function (src, owner) {
  const o = fo(src, owner);
  try { if (src && src.kind === "drum" && src.snd && !Inst.gmOf(src)) { const md = KneadDrum.md(src);
    o.it = clamp(md.it * 1.35, -0.9, 1.8); o.im = clamp(md.im * 0.8, 0, 0.8); o.ir = clamp(md.ir * 0.9, 0, 0.9);
    if (md.ir > 0.12) o.drive = Math.max(o.drive || 0, clamp((md.ir - 0.12) * 0.9, 0, 0.55));
    o.gain = (o.gain ?? 1) * clamp(1 / (1 + Math.max(0, o.it) * 0.55 + (o.drive || 0) * 1.1), 0.4, 1); } } catch (_) {}
  return o; }; }

// ---------- 2) Kneten → Klang bei Loop-Formen (Audio-Loops): spitz = heller, rund = dumpfer, rau = angezerrt ----------
const LoopKnead = {
  ref: new Map(),
  of(f) {
    if (!f || !f.an) return { cut: 20000, hi: 0, drv: 0 };
    const id = f.seedId || "kugel"; let r = this.ref.get(id); if (!r) { const a = K.analyze(K.seedShape(K.seedById(id))); r = { S: a.S, R: a.R }; this.ref.set(id, r); }
    const dS = f.an.S - r.S, dR = f.an.R - r.R;
    return { cut: dS < 0 ? clamp(20000 * Math.pow(2, dS * 9), 350, 20000) : 20000, hi: dS > 0 ? clamp(dS * 26, 0, 11) : 0, drv: clamp(dR * 1.8, 0, 0.85) };
  },
  curve(d) { const n = 1024, c = new Float32Array(n), k = 1 + d * 14, t = Math.tanh(k); for (let i = 0; i < n; i++) { const x = i / (n - 1) * 2 - 1; c[i] = Math.tanh(k * x) / t; } return c; }
};
{ const p0 = LoopSt.par.bind(LoopSt); LoopSt.par = function (t) { const P = p0(t); try { const f = this.form(t); if (!f) return P; const q = LoopKnead.of(f); return { ...P, cut: q.cut, hi: (P.hi || 0) + q.hi, drv: q.drv }; } catch (_) { return P; } }; }
{ const ch0 = LoopSt.chain.bind(LoopSt); LoopSt.chain = function (t) { const ch = ch0(t);
  if (ch && ch.hi && !ch.sh) { try { const sh = Engine.ctx.createWaveShaper(); sh.oversample = "2x"; ch.hi.disconnect(); ch.hi.connect(sh).connect(ch.lp); ch.sh = sh; ch.shd = 0; } catch (e) { console.warn(e); } }
  return ch; }; }
{ const ap = LoopSt.apply.bind(LoopSt); LoopSt.apply = function (t, P, time) { ap(t, P, time); try { const ch = t._ch; if (ch && ch.sh) { const d = Math.round((P.drv || 0) * 10) / 10; if (d !== ch.shd) { ch.shd = d; ch.sh.curve = d > 0.05 ? LoopKnead.curve(d) : null; } } } catch (_) {} }; }

// ---------- 3) Tonstufen-Anzeige („♪ 2 Stufen höher“) geht zuverlässig wieder weg ----------
// Vorher: im Knet-Modus wurde sie alle 0,5 s neu eingeblendet und nach dem Verlassen des Modus nie mehr ausgeblendet.
Object.assign(KneadPitch, {
  show(f) {
    let b = $("kpBadge"); if (!b) { b = document.createElement("div"); b.id = "kpBadge"; b.className = "kpbadge"; b.setAttribute("aria-live", "polite"); document.body.appendChild(b); }
    const d = this.deg(f); b.textContent = this.txt(d); b.dataset.d = d > 0 ? "up" : d < 0 ? "down" : "0"; b.hidden = false; b.classList.add("on");
    this.lastShow = performance.now(); clearTimeout(this.ht); this.ht = setTimeout(() => this.hide(), 2200);
  },
  hide() { const b = $("kpBadge"); clearTimeout(this.ht); if (!b || b.hidden) return; b.classList.remove("on"); setTimeout(() => { if (!b.classList.contains("on")) b.hidden = true; }, 350); },
  tick(b) { if (!b || b.hidden) return; if (UI.tab !== "klang" || Sheets.cur || !Forms.active || performance.now() - (this.lastShow || 0) > 2600) this.hide(); }
});
{ const st = UI.setTab.bind(UI); UI.setTab = function (t) { try { KneadPitch.hide(); } catch (_) {} return st(t); }; }

// ---------- 4) Lieder: gemeinfreie Melodien als Tonstufen (0 = Grundton) und Längen in Sechzehnteln, mit Akkorden je Takt ----------
const Lieder = {
  L: [
    { id: "entchen", n: "Alle meine Entchen", d: "Kinderlied", bpm: 100, prog: [0, 0, 3, 0, 3, 0, 3, 0, 4, 0],
      m: [[0, 4], [1, 4], [2, 4], [3, 4], [4, 8], [4, 8], [5, 4], [5, 4], [5, 4], [5, 4], [4, 16], [5, 4], [5, 4], [5, 4], [5, 4], [4, 16], [3, 4], [3, 4], [3, 4], [3, 4], [2, 8], [2, 8], [1, 4], [1, 4], [1, 4], [1, 4], [0, 16]] },
    { id: "haenschen", n: "Hänschen klein", d: "Kinderlied", bpm: 104, prog: [0, 4, 0, 4, 0, 4, 0, 0],
      m: [[4, 4], [2, 4], [2, 8], [3, 4], [1, 4], [1, 8], [0, 4], [1, 4], [2, 4], [3, 4], [4, 4], [4, 4], [4, 8], [4, 4], [2, 4], [2, 8], [3, 4], [1, 4], [1, 8], [0, 4], [2, 4], [4, 4], [4, 4], [0, 16]] },
    { id: "jakob", n: "Bruder Jakob", d: "Kanon", bpm: 96, prog: [0, 0, 0, 0, 0, 0, 0, 0],
      m: [[0, 4], [1, 4], [2, 4], [0, 4], [0, 4], [1, 4], [2, 4], [0, 4], [2, 4], [3, 4], [4, 8], [2, 4], [3, 4], [4, 8], [4, 2], [5, 2], [4, 2], [3, 2], [2, 4], [0, 4], [4, 2], [5, 2], [4, 2], [3, 2], [2, 4], [0, 4], [0, 4], [-3, 4], [0, 8], [0, 4], [-3, 4], [0, 8]] },
    { id: "freude", n: "Ode an die Freude", d: "Beethoven", bpm: 108, prog: [0, 4, 0, 4, 0, 4, 0, 0],
      m: [[2, 4], [2, 4], [3, 4], [4, 4], [4, 4], [3, 4], [2, 4], [1, 4], [0, 4], [0, 4], [1, 4], [2, 4], [2, 6], [1, 2], [1, 8], [2, 4], [2, 4], [3, 4], [4, 4], [4, 4], [3, 4], [2, 4], [1, 4], [0, 4], [0, 4], [1, 4], [2, 4], [1, 6], [0, 2], [0, 8]] },
    { id: "weihnachtsmann", n: "Morgen kommt der Weihnachtsmann", d: "Volksweise (Mozart-Thema)", bpm: 100, prog: [0, 3, 3, 4, 4, 0, 4, 0],
      m: [[0, 4], [0, 4], [4, 4], [4, 4], [5, 4], [5, 4], [4, 8], [3, 4], [3, 4], [2, 4], [2, 4], [1, 4], [1, 4], [0, 8], [4, 4], [4, 4], [3, 4], [3, 4], [2, 4], [2, 4], [1, 8], [4, 4], [4, 4], [3, 4], [3, 4], [2, 4], [2, 4], [1, 8]] },
    { id: "jingle", n: "Jingle Bells", d: "Refrain", bpm: 120, prog: [0, 0, 0, 0, 3, 0, 1, 4],
      m: [[2, 4], [2, 4], [2, 8], [2, 4], [2, 4], [2, 8], [2, 4], [4, 4], [0, 6], [1, 2], [2, 16], [3, 4], [3, 4], [3, 6], [3, 2], [3, 4], [2, 4], [2, 4], [2, 2], [2, 2], [2, 4], [1, 4], [1, 4], [2, 4], [1, 8], [4, 8]] },
    { id: "kanon", n: "Kanon in D", d: "Pachelbel · die Pop-Akkordfolge", bpm: 72, prog: [0, 4, 5, 2, 3, 0, 3, 4],
      m: [[2, 16], [1, 16], [0, 16], [-1, 16], [-2, 16], [-3, 16], [-2, 16], [-1, 16]] }
  ],
  byId(id) { return this.L.find(s => s.id === id) || null; },
  bars(s) { return Math.round(s.m.reduce((a, x) => a + x[1], 0) / 16); },
  shift(s) { return Math.min(...s.m.filter(x => x[0] != null).map(x => x[0])) < 0 ? 7 : 0; },
  // Noten mit Startschritt: [{k (Taste), s (Schritt), l (Länge)}]
  notes(s) { const sh = this.shift(s), out = []; let p = 0; for (const [d, l] of s.m) { if (d != null) out.push({ k: d + sh, s: p, l }); p += l; } return out; }
};

// Lied-Akkorde: solange ein Lied gewählt ist, folgen alle Formen (Begleitung, Drehen, Bässe) seinen Akkorden statt denen der Stimmung
const Lied = {
  cur: null,
  prog() { return this.cur && this.cur.on && Array.isArray(this.cur.prog) && this.cur.prog.length ? this.cur.prog : null; },
  set(s) { this.cur = { id: s.id, n: s.n, prog: s.prog.slice(), on: true }; Save.soon(); },
  toggle() { if (!this.cur) return; this.cur.on = !this.cur.on; Save.soon(); },
  off() { this.cur = null; Save.soon(); }
};
{ const cd = Transport.chordDeg.bind(Transport); Transport.chordDeg = function () { const P = Lied.prog(); if (!P) return cd(); const curBar = Engine.ctx ? Math.floor(Math.max(0, Engine.now() - this.t0) / (this.spb * 16)) : 0; if (this.userChord != null && curBar <= this.userChordUntil) return this.userChord; return P[mod(curBar, P.length)]; }; }
{ const ca = Transport.chordAtStep.bind(Transport); Transport.chordAtStep = function (step) { const P = Lied.prog(); if (!P) return ca(step); const b = Math.floor(step / 16); if (this.userChord != null && b <= this.userChordUntil) return this.userChord; return P[mod(b, P.length)]; }; }
{ const pd = Project.data.bind(Project); Project.data = function (mem) { const d = pd(mem); try { d.lied = Lied.cur ? { ...Lied.cur, prog: Lied.cur.prog.slice() } : null; } catch (_) {} return d; }; }
{ const pl = Project.load.bind(Project); Project.load = function (d, mem) { const r = pl(d, mem); try { const x = d && d.lied; Lied.cur = x && Array.isArray(x.prog) && x.prog.length ? { id: String(x.id || ""), n: String(x.n || "Lied"), prog: x.prog.map(v => v | 0), on: x.on !== false } : null; } catch (_) { Lied.cur = null; } return r; }; }

// ---------- 5) Tasten: Melodien spielen ohne Noten – nur Töne der Tonart, zwei Reihen (oben = eine Oktave höher) ----------
const KeysUI = {
  f: null, oct: +(store.get("kOct") || 0), names: store.get("kNames") || "zahl", acc: store.get("kAcc") !== false,
  song: null, idx: 0, demoT: [], demoH: [], hold: new Map(), chH: new Map(), s: null,
  COL: ["#FF5A6E", "#FF9A3C", "#F2CD3C", "#6FD45A", "#33C7B0", "#4E9BFF", "#AE7BFF"],
  QUICK: ["klavier", "epiano", "saite", "floete", "streicher", "marimba", "supersaw", "acid303", "stimme_aah"],
  melodic(f) { return !!f && Forms.list.includes(f) && !f.empty && f.kind !== "drum" && !(f.layer && f.layer.parts.some(p => p.kind === "drum")) && !(typeof LoopSt !== "undefined" && LoopSt.trackOf(f)); },
  forms() { return Forms.list.filter(f => this.melodic(f)); },
  pick() { if (this.melodic(this.f)) return this.f; return this.melodic(Forms.active) ? Forms.active : this.forms()[0] || null; },
  isOpen() { return Sheets.cur === "Melodie" && !!$("kyBody"); },
  base(f) { return Forms.baseMidi(Forms.sources(f)[0].src) + 12 * this.oct; },
  midi(f, k) { return this.base(f) + Music.mu.so(k); },
  lab(f, k) { const j = mod(k, 7), up = k >= 14 ? "’’" : k >= 7 ? "’" : ""; if (this.names === "solmi") return ["Do", "Re", "Mi", "Fa", "So", "La", "Ti"][j] + up; if (this.names === "name") return deN(this.midi(f, k)); return (j + 1) + up; },
  sub(f, k) { return this.names === "zahl" ? deN(this.midi(f, k)) : String(mod(k, 7) + 1); },
  keyTxt() { const m = Music.mood; return `${deN(m.root)}-${MODE_DE[m.mode] || m.mode} · ${m.name}`; },
  chordName(d) { const c = Music.mu.chordMidi(d, 60), minor = c[1] - c[0] === 3, dim = c[2] - c[0] === 6; return deN(c[0]) + (dim ? "°" : minor ? "m" : ""); },
  open(f) {
    this.f = this.melodic(f) ? f : this.pick(); this.song = null; this.idx = 0;
    const s = Sheets.open("Melodie", Sheets.head("🎹 Melodie spielen") + `<div id="kyBody" class="kybody"></div>`, true);
    s.classList.add("kysheet"); this.s = s; this.bind(s); this.render(); clearInterval(this.iv); this.iv = setInterval(() => this.tick(), 250); Hints.did && Hints.did("keys");
  },
  close() { clearInterval(this.iv); this.iv = 0; this.stopDemo(); for (const [, v] of this.hold) Forms.release(v.h); this.hold.clear(); for (const [, v] of this.chH) v.hs.forEach(h => Forms.release(h)); this.chH.clear(); },
  render() {
    const el = $("kyBody"); if (!el) return; const f = this.f = this.pick();
    const chips = this.forms().map(g => `<button class="fchip" data-kf="${g.id}" aria-pressed="${g === f}" style="--c:${colOf(g)}"><i></i>${esc(g.name)}</button>`).join("");
    const have = new Set(Forms.list.map(g => g.seedId)), quick = this.QUICK.filter(id => !have.has(id)).slice(0, 5).map(id => `<button class="fchip kyq" data-kn="${id}">＋ ${esc(K.seedById(id).name)}</button>`).join("");
    const keyRow = (a, b, cls) => { let h = ""; for (let k = a; k <= b; k++) h += `<button class="kyk${mod(k, 7) === 0 ? " root" : ""}${cls === "up" && k === 7 ? " dup" : ""}" data-k="${k}" style="--c:${this.COL[mod(k, 7)]}" aria-label="Ton ${esc(deN(this.midi(f, k)))}"><b>${this.lab(f, k)}</b><small>${esc(this.sub(f, k))}</small></button>`; return `<div class="kyrow ${cls}">${h}</div>`; };
    const degs = [0, 3, 4, 5, 1, 2], P = Lied.prog();
    const chords = degs.map(d => `<button class="kyc" data-kc="${d}" style="--c:${this.COL[d]}" aria-label="Akkord ${esc(this.chordName(d))}"><b>${esc(this.chordName(d))}</b><small>${["I", "II", "III", "IV", "V", "VI", "VII"][d]}</small></button>`).join("");
    const busy = f && Loops.busy(f), bars = Loops.bars;
    const songs = Lieder.L.map(s => `<div class="kysong${this.song === s ? " on" : ""}"><div class="kyst"><b>${esc(s.n)}</b><small>${esc(s.d)} · ${Lieder.bars(s)} Takte</small></div><button class="btn" data-ks="play" data-id="${s.id}" aria-label="${esc(s.n)} vorspielen">▶</button><button class="btn" data-ks="learn" data-id="${s.id}">Nachspielen</button><button class="btn primary" data-ks="loop" data-id="${s.id}">Als Loop</button></div>`).join("");
    el.innerHTML = !f ? `<p>Für Melodien brauchst du eine Form mit Instrument. Wähle eins:</p><div class="chips kyinst">${quick || `<button class="fchip kyq" data-kn="klavier">＋ Klavier</button>`}</div>` : `
      <div class="chips kyinst" aria-label="Instrument">${chips}${this.forms().length < 8 ? quick : ""}</div>
      <div class="kyhd"><button class="btn kyo" data-ky="oct-" aria-label="Eine Oktave tiefer">◀ tiefer</button><span class="kykey"><b>${esc(this.keyTxt())}</b><small>nur Töne der Tonart – nichts klingt falsch</small></span><button class="btn kyo" data-ky="oct+" aria-label="Eine Oktave höher">höher ▶</button></div>
      <div class="kylern" id="kyLern"${this.song ? "" : " hidden"}></div>
      <div class="kykeys" id="kyKeys">${keyRow(7, 14, "up")}${keyRow(0, 7, "dn")}</div>
      <div class="kychords" aria-label="Akkorde – halten klingt, alle Formen folgen">${chords}</div>
      <div class="kyrec"><button class="btn primary kyrb${busy ? " rec" : ""}" data-ky="rec" id="kyRec"><i class="recdot"></i><span id="kyRecT">${busy ? "Fertig" : "Melodie aufnehmen"}</span></button>
        <span class="seg2" aria-label="Länge">${[1, 2, 4, 8, 0].map(b => `<button data-kb="${b}" aria-pressed="${bars === b}">${b ? b + " T." : "frei"}</button>`).join("")}</span>
        <button class="btn" data-ky="go" id="kyGo">${Transport.running ? "■ Takt" : "▶ Takt"}</button></div>
      <p class="wtip" id="kyTip">${busy ? "" : "Aufnehmen: es zählt ein, dann spielst du – die Melodie wird ein Loop dieser Form (bleibt veränderbar: kneten, Instrument wechseln, Töne verschieben)."}</p>
      <div class="kyopt"><span class="seg2" aria-label="Beschriftung">${[["zahl", "1 2 3"], ["solmi", "Do Re Mi"], ["name", "C D E"]].map(([k, n]) => `<button data-kl="${k}" aria-pressed="${this.names === k}">${n}</button>`).join("")}</span>
        ${Lied.cur ? `<button class="btn" data-ky="lied" aria-pressed="${!!P}">Akkorde: ${P ? "„" + esc(Lied.cur.n) + "“" : "Stimmung"}</button>` : ""}</div>
      <h3 class="wh">Lieder zum Nachspielen</h3>
      ${Music.mood.mode !== "ionian" ? `<p class="wtip">Die Stimmung „${esc(Music.mood.name)}“ ist ${esc(MODE_DE[Music.mood.mode] || "")} – Lieder klingen dann darin. <button class="lnk" data-ky="dur">Auf Dur stellen</button></p>` : ""}
      <div class="kysongs">${songs}</div>
      <label class="kyacc"><input type="checkbox" data-ky="acc"${this.acc ? " checked" : ""}> Bei „Als Loop“ Begleit-Akkorde als eigene Form dazu</label>`;
    this.lern(); this.mark();
  },
  // Lernzeile: die nächsten Töne als farbige Punkte, der nächste leuchtet auch auf der Taste
  lern() {
    const el = $("kyLern"); if (!el) return; const s = this.song; if (!s) { el.hidden = true; return; } el.hidden = false;
    const N = Lieder.notes(s), f = this.f, a = Math.max(0, this.idx - 2), seen = N.slice(a, a + 14);
    el.innerHTML = `<div class="kylh"><b>${esc(s.n)}</b><small>${Math.min(this.idx, N.length)} / ${N.length}</small><button class="btn" data-ky="demo">▶ Vorspielen</button><button class="btn" data-ky="restart">Von vorn</button><button class="btn" data-ky="lend" aria-label="Nachspielen beenden">✕</button></div>
      <div class="kybub">${seen.map((n, i) => `<span class="kyb${a + i === this.idx ? " cur" : a + i < this.idx ? " done" : ""}" style="--c:${this.COL[mod(n.k, 7)]};--w:${Math.min(3, Math.max(1, n.l / 4))}">${f ? this.lab(f, n.k) : ""}</span>`).join("")}</div>`;
  },
  mark() { const el = $("kyKeys"); if (!el) return; el.querySelectorAll(".next").forEach(b => b.classList.remove("next")); if (!this.song) return; const n = Lieder.notes(this.song)[this.idx]; if (!n) return; el.querySelectorAll(`[data-k="${n.k}"]`).forEach(b => b.classList.add("next")); },
  tick() {
    if (!this.isOpen()) { this.close(); return; }
    const f = this.f, b = $("kyRec"), t = $("kyRecT"), g = $("kyGo"); if (!f || !b) return;
    const L = f.loop, busy = Loops.busy(f); b.classList.toggle("rec", busy);
    let txt = "Melodie aufnehmen"; if (busy) { const spb = Transport.spb, now = Engine.now(); txt = L.st === "arm" ? `gleich … ${Math.max(1, Math.ceil((L.startT - now) / (4 * spb) - 1e-3))}` : `■ Fertig · Takt ${Math.min(L.bars, Math.floor(Math.max(0, now - L.startT) / (16 * spb)) + 1)}${L.free ? "" : "/" + L.bars}`; }
    if (t.textContent !== txt) t.textContent = txt; if (g) { const gt = Transport.running ? "■ Takt" : "▶ Takt"; if (g.textContent !== gt) g.textContent = gt; }
  },
  audible(f) { if (Forms.audible(f)) return true; if (!Fade.on(f)) { Fade.set(f, true, true); } if (f.mute) { f.mute = false; Forms.applyMix(f); } return Forms.audible(f); },
  ready() { if (!Engine.ctx) { UI.toast("Erst einmal eine Form antippen – dann ist der Ton an"); return false; } if (Engine.ctx.state !== "running") Engine.ctx.resume(); return true; },
  press(pid, b, y) {
    const f = this.f; if (!f || !this.ready()) return; const k = +b.dataset.k; this.audible(f);
    const r = b.getBoundingClientRect(), vel = clamp(0.5 + 0.45 * ((y - r.top) / Math.max(1, r.height)), 0.35, 1);
    const h = Forms.play(f, k / 14, vel, { midi: this.midi(f, k) }); this.hold.set(pid, { k, b, h }); b.classList.add("dn"); Hap(4);
    if (this.song) { const N = Lieder.notes(this.song), n = N[this.idx]; if (n && n.k === k) { this.idx++; if (this.idx >= N.length) this.won(); this.lern(); this.mark(); } else if (n) { b.classList.add("miss"); setTimeout(() => b.classList.remove("miss"), 260); } }
  },
  lift(pid) { const v = this.hold.get(pid); if (!v) return; this.hold.delete(pid); Forms.release(v.h); v.b.classList.remove("dn"); },
  won() { const s = this.song; Hap(30); UI.toastAct(`Geschafft: „${s.n}“ komplett nachgespielt!`, "Als Loop", () => this.asLoop(s), 5200); this.idx = 0; },
  chord(pid, d, on) {
    const f = this.f; if (!f) return;
    if (!on) { const v = this.chH.get(pid); if (v) { v.hs.forEach(h => Forms.release(h)); d = v.d; } this.chH.delete(pid); document.querySelectorAll(`.kyc[data-kc="${d}"]`).forEach(b => b.classList.remove("dn")); return; }
    if (!this.ready()) return; this.audible(f); Transport.userChord = d; Transport.userChordUntil = Transport.bar() + 1;
    const ns = Music.mu.chordMidi(d, this.base(f)); this.chH.set(pid, { d, hs: ns.map((m, i) => Forms.play(f, 0.5, 0.62 - i * 0.05, { midi: m })) }); document.querySelectorAll(`.kyc[data-kc="${d}"]`).forEach(b => b.classList.add("dn")); Hap(6);
  },
  stopDemo() { this.demoT.forEach(clearTimeout); this.demoT = []; this.demoH.forEach(h => { try { Forms.release(h); } catch (_) {} }); this.demoH = []; document.querySelectorAll(".kyk.demo").forEach(b => b.classList.remove("demo")); },
  demo(s) {
    const f = this.f; if (!f || !this.ready()) return; this.stopDemo(); this.audible(f);
    const spb = 60 / Music.tempo() / 4, t0 = Engine.now() + 0.12;
    for (const n of Lieder.notes(s)) {
      const t = t0 + n.s * spb, h = Forms.play(f, n.k / 14, 0.8, { midi: this.midi(f, n.k), time: t, dur: n.l * spb * 0.92 }); if (h) this.demoH.push(h);
      this.demoT.push(setTimeout(() => { document.querySelectorAll(`#kyKeys [data-k="${n.k}"]`).forEach(b => { b.classList.add("demo"); setTimeout(() => b.classList.remove("demo"), Math.max(120, n.l * spb * 900)); }); }, Math.max(0, (t - Engine.now()) * 1000)));
    }
  },
  // Lied als Loop auf die gewählte Form (+ Begleit-Akkorde als eigene Form) – die anderen Formen folgen den Lied-Akkorden
  asLoop(s, fIn) {
    const f = fIn || this.f; if (!f) { UI.toast("Erst ein Instrument wählen"); return null; } Undo.push();
    const bars = Lieder.bars(s), ev = Lieder.notes(s).map(n => ({ s: n.s, d: Math.max(0.5, n.l * 0.92), m: this.midi(f, n.k), v: 0.82, u: n.k / 14 }));
    const t = Loops.newTake(f, bars, ev, s.n.slice(0, 22)); t.base = 0; t.on = true; this.audible(f); Lied.set(s);
    let acc = null;
    if (this.acc && Forms.list.length < Forms.MAX) {
      acc = Forms.list.find(g => g.lied === s.id && g.kind !== "drum") || Forms.make({ seedId: "epiano", name: "Begleitung" });
      if (acc) { acc.lied = s.id; Forms.rebuild(acc, true); acc.takes = (acc.takes || []).filter(x => !x.lied); const b0 = Forms.baseMidi(Forms.sources(acc)[0].src), aev = [];
        s.prog.forEach((d, i) => Music.mu.chordMidi(d, b0).forEach(m => aev.push({ s: i * 16, d: 15.5, m, v: 0.4, u: 0.5 })));
        const at = Loops.newTake(acc, bars, aev, "Akkorde"); at.base = 0; at.lied = s.id; acc.fine.vol = Math.min(acc.fine.vol ?? 1, 0.8); this.audible(acc); Forms.applyMix(acc); }
    }
    if (!Transport.running && Engine.ctx) Transport.start();
    UI.refresh(); Save.soon(); if (this.isOpen()) this.render(); Hap(14);
    UI.toastAct(`„${s.n}“ läuft als Loop auf ${f.name}${acc ? " + Begleitung" : ""} · alle Formen folgen jetzt den Lied-Akkorden`, "Töne bearbeiten", () => { UI.hideSheets(); UI.setTab("stueck"); Stueck.editLoop(f, t.id); }, 5600);
    return t;
  },
  bind(s) {
    const kk = () => $("kyKeys");
    s.addEventListener("pointerdown", e => {
      const b = e.target.closest(".kyk"); if (b && kk() && kk().contains(b)) { e.preventDefault(); try { kk().setPointerCapture(e.pointerId); } catch (_) {} this.press(e.pointerId, b, e.clientY); return; }
      const c = e.target.closest("[data-kc]"); if (c) { e.preventDefault(); try { c.setPointerCapture(e.pointerId); } catch (_) {} this.chord(e.pointerId, +c.dataset.kc, true); return; }
    });
    s.addEventListener("pointermove", e => {
      const v = this.hold.get(e.pointerId); if (!v) return; const el = document.elementFromPoint(e.clientX, e.clientY), b = el && el.closest && el.closest(".kyk");
      if (b && b !== v.b && kk() && kk().contains(b)) { this.lift(e.pointerId); this.press(e.pointerId, b, e.clientY); }
    });
    const up = e => { this.lift(e.pointerId); if (this.chH.has(e.pointerId)) this.chord(e.pointerId, 0, false); };
    s.addEventListener("pointerup", up); s.addEventListener("pointercancel", up);
    s.addEventListener("change", e => { if (e.target.dataset.ky === "acc") { this.acc = e.target.checked; store.set("kAcc", this.acc); } });
    s.addEventListener("click", e => {
      const t = e.target;
      const fc = t.closest("[data-kf]"); if (fc) { const g = Forms.byId(fc.dataset.kf); if (g) { this.f = g; Forms.setActive(g); this.render(); } return; }
      const qn = t.closest("[data-kn]"); if (qn) { const g = Forms.make({ seedId: qn.dataset.kn }); if (g) { Forms.rebuild(g, true); Forms.setActive(g); this.f = g; Save.soon(); UI.refresh(); this.render(); UI.toast(`${g.name} ist da – die Tasten spielen es`, 1600); } return; }
      const kb = t.closest("[data-kb]"); if (kb) { Loops.bars = +kb.dataset.kb; store.set("loopBars2", Loops.bars); this.render(); return; }
      const kl = t.closest("[data-kl]"); if (kl) { this.names = kl.dataset.kl; store.set("kNames", this.names); this.render(); return; }
      const ks = t.closest("[data-ks]"); if (ks) { const s = Lieder.byId(ks.dataset.id); if (!s) return; Hap(8);
        if (ks.dataset.ks === "play") this.demo(s); else if (ks.dataset.ks === "learn") { this.song = s; this.idx = 0; this.render(); const L = $("kyLern"); if (L) L.scrollIntoView({ block: "nearest" }); } else this.asLoop(s); return; }
      const a = t.closest("[data-ky]"); if (!a) return; const k = a.dataset.ky; Hap(6);
      if (k === "oct-" || k === "oct+") { this.oct = clamp(this.oct + (k === "oct+" ? 1 : -1), -2, 2); store.set("kOct", this.oct); this.render(); return; }
      if (k === "rec") { const f = this.f; if (!f || !this.ready()) return; this.audible(f); if (Loops.busy(f)) Loops.stop(f); else Loops.arm(f); setTimeout(() => this.tick(), 50); return; }
      if (k === "go") { if (!this.ready()) return; Transport.toggle(); setTimeout(() => this.tick(), 50); return; }
      if (k === "demo" && this.song) { this.demo(this.song); return; }
      if (k === "restart") { this.idx = 0; this.lern(); this.mark(); return; }
      if (k === "lend") { this.song = null; this.stopDemo(); this.render(); return; }
      if (k === "lied") { Lied.toggle(); this.render(); return; }
      if (k === "dur") { const m = K.MOODS.find(x => x.mode === "ionian"); if (m) { Music.set(m); this.render(); } return; }
    });
  }
};
// Schließt jemand das Blatt, verstummen gehaltene Töne und das Vorspielen
{ const hs = UI.hideSheets.bind(UI); UI.hideSheets = function (soft) { const was = Sheets.cur; const r = hs(soft); try { if (was === "Melodie" && !KeysUI.isOpen()) KeysUI.close(); if (was === "Rückblick" && !$("rbCv")) RetroEd.closed(); } catch (_) {} return r; }; }

// ---------- 6) Rückblick: Ausschnitt wählen (auf Takte), anhören, in den Schnittraum / als Loop / als Form ----------
{ const i0 = Retro.init.bind(Retro); Retro.init = function () { const had = this.node; i0(); if (!had && this.node) { this.tot = 0; this.rt0 = null; const n = this.node;
  n.port.onmessage = e => { const d = e.data; if (!d) return; if (d.t === "chunk") { this.push(d.d); this.tot += d.d[0].length; } else if (d.t === "t0") this.rt0 = d.v; }; } }; }
const RetroEd = {
  r: null, a: 0, b: 0, v0: 0, v1: 0, grid: null, snap: true, ph: null, raf: 0, ok: false,
  async take() {
    if (!Engine.ctx) return; const sr = Engine.ctx.sampleRate, n = Retro.frames;
    if (n < sr * 1) { UI.toast("Noch nichts zu sichern – der Rückblick läuft ab dem ersten Ton mit."); return; }
    const L = new Float32Array(n), R = new Float32Array(n); let o = 0; for (const c of Retro.chunks) { L.set(c[0], o); R.set(c[1] || c[0], o); o += c[0].length; }
    let pk = 0; for (let i = 0; i < n; i++) { const v = Math.abs(L[i]) > Math.abs(R[i]) ? Math.abs(L[i]) : Math.abs(R[i]); if (v > pk) pk = v; }
    if (pk < 1e-4) { UI.toast("In den letzten Sekunden war es still – nichts gesichert."); return; }
    // Zeit des ersten Samples auf der Uhr des Audiosystems → Taktraster
    const t0 = Retro.rt0 != null && Retro.tot ? Retro.rt0 + (Retro.tot - n) / sr : Engine.ctx.currentTime - n / sr - 0.2;
    const thr = pk * 0.003; let a = 0; while (a < n && Math.abs(L[a]) < thr && Math.abs(R[a]) < thr) a++; let b = n - 1; while (b > a && Math.abs(L[b]) < thr && Math.abs(R[b]) < thr) b--;
    const hm = new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
    try {
      const r = await Recs.add([L, R], sr, `Rückblick ${hm} · ${Math.round(n / sr)} s`, "mitschnitt"); r.peak = pk; r.cut = (a > sr * 0.3 || b < n - sr * 0.6) ? { start: Math.max(0, a / sr - 0.05), end: Math.min(n / sr, b / sr + 0.4), fadeIn: 0, fadeOut: 0.02 } : null;
      r.rt = { t0, bar: Transport.spb * 16, tt0: Transport.t0, run: Transport.running || (Transport.stopT != null && Engine.now() - Transport.stopT < n / sr) }; await Recs.update(r); Hap(14);
      this.open(r, a / sr, b / sr);
    } catch (e) { UI.toast("Rückblick ließ sich nicht speichern: " + (e && e.message || e)); }
  },
  dur() { return this.r ? this.r.dur : 0; },
  // Taktgrenzen im Rückblick (Sekunden ab Beginn) – nur wenn der Takt lief
  bars() { const q = this.r && this.r.rt; if (!q || !q.run || !(q.bar > 0.2)) return null; const out = []; const k0 = Math.ceil((q.t0 - q.tt0) / q.bar - 1e-6); for (let k = k0; ; k++) { const x = q.tt0 + k * q.bar - q.t0; if (x > this.dur() + 1e-6) break; if (x >= -1e-6) out.push(Math.max(0, x)); } return out.length > 1 ? out : null; },
  near(x) { const g = this.grid; if (!g || !this.snap) return x; let best = g[0]; for (const v of g) if (Math.abs(v - x) < Math.abs(best - x)) best = v; return best; },
  open(r, a, b) {
    this.r = r; this.grid = this.bars(); this.ok = false; const d = r.dur;
    if (this.grid && this.snap) { const g = this.grid, last = g[g.length - 1]; this.b = last; let s = this.near(Math.max(0, a)); if (this.b - s < 0.5) s = g[Math.max(0, g.length - 5)]; this.a = s; }
    else { this.a = Math.max(0, a || 0); this.b = Math.min(d, b || d); }
    this.v0 = 0; this.v1 = d;
    const s = Sheets.open("Rückblick", Sheets.head(`Rückblick · ${fmt(d, 0)} s`) + `
      <p class="wtip">Wähle den Ausschnitt: <b>Griffe ziehen</b> oder über die Welle wischen · antippen = ab dort anhören.${this.grid ? " Rastet auf Takte ein." : ""}</p>
      <div class="rbw"><canvas id="rbCv" class="rbcv"></canvas></div>
      <div class="row rbrow"><button class="btn primary" data-rb="play" id="rbPlay">▶ Ausschnitt anhören</button><span class="rbsel" id="rbSel"></span></div>
      <div class="row rbrow"><button class="btn" data-rb="all">Alles</button><button class="btn" data-rb="zoom" id="rbZoom">⤢ Ausschnitt groß</button>${this.grid ? `<button class="btn" data-rb="snap" aria-pressed="${this.snap}">Auf Takte: ${this.snap ? "an" : "aus"}</button><button class="btn" data-rb="b-">− Takt</button><button class="btn" data-rb="b+">+ Takt</button>` : ""}</div>
      <h3 class="wh">Was soll mit dem Ausschnitt passieren?</h3>
      <div class="rbact">
        <button class="btn primary" data-rb="cut">✂ In den Schnittraum<small>als Spur – dort übereinanderlegen, schneiden, mischen</small></button>
        <button class="btn" data-rb="loop">🔁 Als Loop ins Pult<small>läuft im Takt weiter</small></button>
        <button class="btn" data-rb="form">🎹 Als Klang-Form<small>spielbar in der Tonart</small></button>
        <button class="btn" data-rb="save">💾 Als eigene Aufnahme<small>unter Stück → Aufnahmen</small></button>
        <button class="btn" data-rb="share">Teilen …<small>WhatsApp, Mail, WAV</small></button>
        <button class="btn rbdel" data-rb="del">🗑 Rückblick verwerfen</button>
      </div>
      <p class="wtip">Der ganze Rückblick liegt schon sicher unter <b>Stück → Aufnahmen</b> – auch wenn du dieses Blatt schließt.</p>`, true);
    this.bind(s); requestAnimationFrame(() => this.draw()); this.info();
  },
  closed() { const r = this.r; Recs.stop(); cancelAnimationFrame(this.raf); if (!r || this.ok) return; UI.toastAct(`Rückblick liegt unter Stück → Aufnahmen`, "Wieder öffnen", () => DB.get("recs", r.id).then(x => x && this.open(x, this.a, this.b)), 5200); },
  info() { const el = $("rbSel"); if (!el) return; const len = this.b - this.a, bars = this.grid && this.snap ? Math.round(len / this.r.rt.bar) : null; el.textContent = `${fmtT(this.a)} – ${fmtT(this.b)} · ${fmt(len, 1)} s${bars ? ` · ${bars} Takt${bars === 1 ? "" : "e"}` : ""}`; },
  x2t(cv, x) { const r = cv.getBoundingClientRect(); return this.v0 + clamp((x - r.left) / Math.max(1, r.width), 0, 1) * (this.v1 - this.v0); },
  t2x(w, t) { return (t - this.v0) / Math.max(1e-6, this.v1 - this.v0) * w; },
  draw() {
    const cv = $("rbCv"); if (!cv || !this.r) return; const dpr = Math.min(2, devicePixelRatio || 1), W = cv.clientWidth || 320, H = cv.clientHeight || 110;
    if (cv.width !== Math.round(W * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
    const g = cv.getContext("2d"); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
    const ch = Recs.audio(this.r), L = ch[0], R = ch[1] || L, sr = this.r.sr, i0 = Math.floor(this.v0 * sr), i1 = Math.min(L.length, Math.ceil(this.v1 * sr)), step = Math.max(1, (i1 - i0) / W);
    let pk = 1e-4; for (let i = i0; i < i1; i += Math.max(1, Math.floor(step / 4))) { const v = Math.max(Math.abs(L[i]), Math.abs(R[i])); if (v > pk) pk = v; }
    const xa = this.t2x(W, this.a), xb = this.t2x(W, this.b), mid = H / 2;
    g.fillStyle = "rgba(123,92,255,.16)"; g.fillRect(xa, 0, xb - xa, H);
    if (this.grid) { g.strokeStyle = "rgba(255,255,255,.14)"; g.lineWidth = 1; g.beginPath(); for (const t of this.grid) { const x = Math.round(this.t2x(W, t)) + 0.5; if (x >= 0 && x <= W) { g.moveTo(x, 0); g.lineTo(x, H); } } g.stroke(); }
    for (let x = 0; x < W; x++) {
      const a = i0 + Math.floor(x * step), b = Math.min(i1, a + Math.ceil(step)); let m = 0; for (let i = a; i < b; i += Math.max(1, Math.floor(step / 24))) { const v = Math.max(Math.abs(L[i]), Math.abs(R[i])); if (v > m) m = v; }
      const h = Math.max(1, m / pk * (H / 2 - 6)), inn = x >= xa && x <= xb; g.fillStyle = inn ? "#B79BFF" : "rgba(220,230,240,.32)"; g.fillRect(x, mid - h, 1, h * 2);
    }
    for (const [x, lab] of [[xa, "a"], [xb, "b"]]) { g.fillStyle = "#fff"; g.fillRect(x - 1.5, 0, 3, H); g.beginPath(); g.arc(x, lab === "a" ? 12 : H - 12, 9, 0, Math.PI * 2); g.fill(); g.fillStyle = "#3b2a7a"; g.font = "bold 10px system-ui"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(lab === "a" ? "◀" : "▶", x, lab === "a" ? 12 : H - 12); }
    const p = Recs.player && Recs.player.r === this.r ? Recs.pos() : null; if (p != null) { const x = this.t2x(W, p); g.fillStyle = "#FFD58A"; g.fillRect(x - 1, 0, 2, H); }
  },
  anim() { cancelAnimationFrame(this.raf); const go = () => { if (!$("rbCv")) return; this.draw(); if (Recs.player) this.raf = requestAnimationFrame(go); else { const b = $("rbPlay"); if (b) b.textContent = "▶ Ausschnitt anhören"; this.draw(); } }; this.raf = requestAnimationFrame(go); },
  play(from) { if (!Engine.ctx) return; const b = $("rbPlay"); if (Recs.player && from == null) { Recs.stop(); return; } Recs.play(this.r, from ?? this.a, this.b, () => { const x = $("rbPlay"); if (x) x.textContent = "▶ Ausschnitt anhören"; }); if (b) b.textContent = "■ Stopp"; this.anim(); },
  slice() { const ch = Recs.audio(this.r), sr = this.r.sr, a = Math.max(0, Math.round(this.a * sr)), b = Math.min(ch[0].length, Math.round(this.b * sr)); return ch.map(c => c.slice(a, b)); },
  stepS() { const q = this.r.rt; return q ? q.bar / 16 : Transport.spb; },
  async act(k) {
    const r = this.r; if (!r) return; const sr = r.sr, len = this.b - this.a; if (len < 0.1 && k !== "del") { UI.toast("Ausschnitt zu kurz"); return; }
    if (k === "cut") {
      this.ok = true; Recs.stop(); Undo.push(); const d = Schnitt.st(); Schnitt.meta.set(r.id, r); const tr = Schnitt.addTrack(r.name.replace(/ · \d+ s$/, "").slice(0, 20));
      const pos = d.clips.length ? Math.max(0, d.ph) : 0, c = { id: uid("c"), tr: tr.id, rec: r.id, pos, off: this.a, len, dur: r.dur, gain: 1, fi: 0.005, fo: 0.02, rev: false };
      d.clips.push(c); Schnitt.sel = c.id; Save.soon(); UI.hideSheets(); UI.setTab("schnitt"); Schnitt.render(); Schnitt.scrollTo(c.pos);
      UI.toast(`Ausschnitt (${fmt(len, 1)} s) liegt auf „${tr.name}“ – ziehen = verschieben, Ränder = kürzen, ▶ spielt alle Spuren zusammen`, 3800); return;
    }
    if (k === "loop") {
      const q = r.rt; if (!this.grid || !this.snap) { UI.toast("Als Loop geht es, wenn der Takt lief und „Auf Takte“ an ist – dann passt er genau"); return; }
      const spS = this.stepS(), nb = Math.max(1, Math.round(len / q.bar)); let pb = [1, 2, 4, 8, 16].filter(x => x <= nb).pop() || 1, N = pb * 16;
      if (LoopSt.L && N !== LoopSt.L) { N = LoopSt.L; UI.toast(`Loop-Länge im Pult ist ${LoopSt.L / 16} Takt${LoopSt.L > 16 ? "e" : ""} – Ausschnitt angepasst`, 2600); }
      else if (pb !== nb) UI.toast(`Loops laufen in 1, 2, 4 oder 8 Takten – genommen: die letzten ${pb} des Ausschnitts`, 2600);
      const need = N * spS; if (N / 16 <= nb) this.a = Math.max(0, this.b - need); if (this.a + need > r.dur + 0.02) { this.a = Math.max(0, this.near(r.dur - need)); }
      this.b = Math.min(r.dur, this.a + need); this.info(); this.draw();
      let i = LoopSt.slots.findIndex(x => !x); if (i < 0 && LoopSt.slots.length < LoopSt.MAXN) { LoopSt.slots.push(null); i = LoopSt.slots.length - 1; } if (i < 0) { UI.toast("Alle Spuren im Pult sind belegt – erst eine leeren"); return; }
      const chs = this.slice(), want = Math.round(need * sr); for (let c = 0; c < chs.length; c++) if (chs[c].length !== want) { const x = new Float32Array(want); x.set(chs[c].subarray(0, want)); chs[c] = x; }
      const S = Math.round((q.t0 + this.a - q.tt0) / spS);
      this.ok = true; Recs.stop(); UI.hideSheets(); await LoopSt.put(i, chs, sr, Music.tempo(), N, "form", S); UI.setTab("loop"); return;
    }
    if (k === "form") { const ch = this.slice(), m = new Float32Array(ch[0].length); for (let j = 0; j < m.length; j++) m[j] = (ch[0][j] + (ch[1] || ch[0])[j]) / 2; const mx = Math.min(m.length, Math.round(8 * sr)); this.ok = true; Recs.stop(); UI.hideSheets(); AudioIn.process(m.subarray(0, mx), sr, "Rückblick-Klang"); return; }
    if (k === "save" || k === "share") { const nr = await Recs.add(this.slice(), sr, `${r.name.replace(/ · \d+ s$/, "")} · Ausschnitt`, "mitschnitt"); nr.peak = r.peak; await Recs.update(nr); if (k === "share") { this.ok = true; Recs.stop(); Sheets.share(nr); } else UI.toast(`„${nr.name}“ (${fmt(len, 1)} s) liegt unter Stück → Aufnahmen`, 2400); return; }
    if (k === "del") { this.ok = true; Recs.stop(); await Recs.remove(r.id); UI.hideSheets(); UI.toast("Rückblick verworfen", 1400); }
  },
  bind(s) {
    const cv = s.querySelector("#rbCv"); let drag = null;
    cv.addEventListener("pointerdown", e => {
      e.preventDefault(); try { cv.setPointerCapture(e.pointerId); } catch (_) {} const rc = cv.getBoundingClientRect(), x = e.clientX - rc.left, W = rc.width, xa = this.t2x(W, this.a), xb = this.t2x(W, this.b), t = this.x2t(cv, e.clientX);
      drag = Math.abs(x - xa) < 26 && Math.abs(x - xa) <= Math.abs(x - xb) ? { h: "a" } : Math.abs(x - xb) < 26 ? { h: "b" } : { h: "new", t0: t, x0: e.clientX, moved: false };
    });
    cv.addEventListener("pointermove", e => { if (!drag) return; const t = this.x2t(cv, e.clientX);
      if (drag.h === "a") this.a = clamp(this.near(t), 0, this.b - 0.05); else if (drag.h === "b") this.b = clamp(this.near(t), this.a + 0.05, this.dur());
      else { if (Math.abs(e.clientX - drag.x0) < 8 && !drag.moved) return; drag.moved = true; const p = this.near(drag.t0), q = this.near(t); this.a = Math.min(p, q); this.b = Math.max(p, q); if (this.b - this.a < 0.05) this.b = Math.min(this.dur(), this.a + (this.grid ? this.r.rt.bar : 0.5)); }
      this.info(); this.draw(); });
    const up = e => { if (!drag) return; const d = drag; drag = null; if (d.h === "new" && !d.moved) { this.play(clamp(this.x2t(cv, e.clientX), 0, this.b - 0.02)); } };
    cv.addEventListener("pointerup", up); cv.addEventListener("pointercancel", () => drag = null);
    s.addEventListener("click", e => { const b = e.target.closest("[data-rb]"); if (!b) return; const k = b.dataset.rb; Hap(6);
      if (k === "play") { this.play(); return; }
      if (k === "all") { this.a = this.grid && this.snap ? this.grid[0] : 0; this.b = this.grid && this.snap ? this.grid[this.grid.length - 1] : this.dur(); this.v0 = 0; this.v1 = this.dur(); }
      else if (k === "zoom") { if (this.v1 - this.v0 < this.dur() - 0.01) { this.v0 = 0; this.v1 = this.dur(); b.textContent = "⤢ Ausschnitt groß"; } else { const m = (this.b - this.a) * 0.25 + 0.2; this.v0 = Math.max(0, this.a - m); this.v1 = Math.min(this.dur(), this.b + m); b.textContent = "⤡ Ganze Welle"; } }
      else if (k === "snap") { this.snap = !this.snap; b.textContent = `Auf Takte: ${this.snap ? "an" : "aus"}`; b.setAttribute("aria-pressed", this.snap); if (this.snap) { this.a = this.near(this.a); this.b = this.near(this.b); if (this.b <= this.a) this.b = Math.min(this.dur(), this.a + this.r.rt.bar); } }
      else if (k === "b-" || k === "b+") { const bar = this.r.rt.bar; this.a = clamp(this.a + (k === "b-" ? bar : -bar), 0, this.b - bar * 0.99); if (this.a < 0.01 && k === "b+") this.a = 0; }
      else { this.act(k); return; }
      this.info(); this.draw(); });
  }
};
Retro.save = function () { return RetroEd.take(); };

// ---------- 7) Einstiege: Werkzeugzeile, Kreis-Menü, Pult ----------
Cmd.L.keys = { g: "werk", ic: () => '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M8 5v9M12 5v9M16 5v9"/><path d="M8 14v5M12 14v5M16 14v5" opacity=".5"/></svg>', n: () => "Tasten", a: () => "Melodien auf Tasten spielen, Lieder nachspielen, als Loop aufnehmen", run: f => KeysUI.open(f) };
{ if (!Cmd.GROUPS.some(x => x[3].includes("keys"))) { const g = [Cmd.GROUPS.find(x => x[0] === "werk"), ...Cmd.GROUPS].find(x => x && x[3].length < 8 && x[0] !== "set"); if (g) g[3].unshift("keys"); else Cmd.GROUPS.push(["melodie", "Melodie", ICON.mel, ["keys"]]); } }
Cfg.DEF.bar = ["keys", ...Cfg.DEF.bar.filter(x => x !== "keys")].slice(0, 7);
try { if (!store.get("keys65")) { store.set("keys65", 1); const s = store.get("cfg34"); if (s && Array.isArray(s.bar) && !s.bar.includes("keys")) { s.bar = ["keys", ...s.bar].slice(0, 7); store.set("cfg34", s); } } } catch (_) {}
Cfg.v = null;
{ const r0 = Pult.render.bind(Pult); Pult.render = function () { r0(); try { const el = $("pult"); if (!el || UI.tab !== "loop") return; const n = el.querySelector(".ppnew"); if (n && !el.querySelector(".ppkeys")) n.insertAdjacentHTML("beforebegin", `<button class="pp ppkeys" data-pt="keys"><span class="ppk">🎹</span><b>Melodie spielen</b><small>Tasten · Lieder · Akkorde</small></button>`); } catch (e) { console.warn(e); } }; }
{ const b0 = Pult.bind.bind(Pult); Pult.bind = function (el) { b0(el); el.addEventListener("click", e => { const b = e.target.closest('[data-pt="keys"]'); if (b) { e.stopPropagation(); Hap(8); KeysUI.open(); } }, true); }; }

// ---------- 8) Hilfe ----------
Help.T.push({ id: "melodie", ic: "🎹", t: "Melodien und Lieder spielen – ohne Noten", k: "melodie lied lieder tasten klavier keyboard noten nachspielen akkorde begleitung tonart do re mi zahlen kinderlied loop einspielen",
  h: `<ul><li><b>Tasten</b> (Werkzeugzeile, Kreis → Werkzeuge oder im Pult „🎹 Melodie spielen“): zwei Reihen farbiger Tasten – nur Töne der Tonart, nichts klingt falsch. <b>Obere Reihe = dieselben Töne eine Oktave höher</b> (gleiche Farbe genau darüber). Über die Tasten wischen = Lauf. Weiter unten auf der Taste = lauter.</li>
  <li><b>Instrument</b> oben wählen: jede Form mit Instrument (auch geknetete – ihr Klang spielt mit) oder ＋ ein neues. ◀ tiefer / höher ▶ verschiebt um eine Oktave. Beschriftung: <b>1 2 3</b> (Stufen), <b>Do Re Mi</b> oder <b>C D E</b>.</li>
  <li><b>Akkorde</b> unter den Tasten: halten = Akkord klingt, und alle drehenden Formen folgen diesem Akkord.</li>
  <li><b>Melodie aufnehmen</b>: Länge wählen (1–8 Takte oder frei), tippen – es zählt ein, du spielst, die Melodie wird ein Loop der Form. Danach im Steuerfeld → Loops oder unter Stück: Töne verschieben, verlängern, löschen.</li>
  <li><b>Lieder</b>: Alle meine Entchen, Hänschen klein, Bruder Jakob, Ode an die Freude, Morgen kommt der Weihnachtsmann, Jingle Bells, Kanon in D. <b>▶</b> spielt vor (die Tasten leuchten mit), <b>Nachspielen</b> zeigt Ton für Ton, welche Taste dran ist – ohne Zeitdruck. <b>Als Loop</b> legt das Lied fertig auf die Form, auf Wunsch mit Begleit-Akkorden als eigene Form; alle Formen spielen dann in den Akkorden des Lieds („Akkorde: Stimmung“ schaltet zurück).</li>
  <li>In Moll-Stimmungen klingen Lieder in Moll – „Auf Dur stellen“ holt die gewohnte Fassung.</li></ul>` });
{ const h = Help.T.find(x => x.id === "schnitt"); if (h) h.h = h.h.replace(/<\/(ol|ul)>\s*$/, m => `<li><b>Aus dem Rückblick:</b> Rückblick tippen → Ausschnitt wählen (rastet auf Takte ein) → „✂ In den Schnittraum“. Der Ausschnitt liegt als Clip auf einer neuen Spur – dort verschieben, kürzen, teilen und mit anderen Spuren übereinanderlegen.</li>${m}`); }
{ const h = Help.T.find(x => x.id === "edit") || Help.T.find(x => x.id === "forms"); if (h) h.h = h.h.replace(/<\/ul>\s*$/, `<li><b>Kneten färbt jeden Klang</b>: spitz = heller und härter, rund = weicher und dumpfer, rau = körnig bis angezerrt, Beulen = metallischer – bei Instrumenten, Synths, Aufnahmen, <b>Drum-Kits</b> und <b>Loop-Formen</b>.</li></ul>`); }
