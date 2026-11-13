/* =====================================================================================
   v68: EINSPIELEN ohne Aufnahmeknopf · Spuren-Mix im Song · einfacher Bereich „Spielen“
   – Einsp: Dauerschleife – was du spielst, bleibt, wird gerade gerückt und wiederholt sich
   – neue Klänge mit Loop kommen von selbst in den Song · Lautstärke direkt in der Song-Zeile
   – Mischen auch für Gesangs- und Audiospuren · Einfach/Profi-Schalter
   ===================================================================================== */
const Einsp = {
  on: false, f: null, t: null, L: 2, q: store.get("einQ") ?? 2, click: store.get("einClick") !== false, made: null, round: -1, hold: new Map(), undone: false,
  QUICK: [["klavier", "Klavier"], ["fingerbass", "Bass"], ["trommel", "Schlagzeug"], ["saite", "Gitarre"], ["floete", "Flöte"], ["epiano", "E-Piano"], ["streicher", "Streicher"], ["kit_909", "Elektro-Beat"]],
  PADS: { kick: ["Bassdrum", "tief, der Puls", 0.15], snare: ["Snare", "der Schlag auf 2 und 4", 0.47], hat: ["Hi-Hat", "das Zischeln", 0.72], top: ["Becken", "der Akzent", 0.92] },
  QS: [[2, "grob"], [1, "fein"], [0, "frei"]],
  drum(f) { return !!f && (f.kind === "drum" || !!(f.layer && f.layer.parts.some(p => p.kind === "drum"))); },
  playable(f) { return !!f && Forms.list.includes(f) && !f.empty && !f.remote && !LoopSt.trackOf(f) && (this.drum(f) || KeysUI.melodic(f)); },
  forms() { return Forms.list.filter(f => this.playable(f)); },
  zones(f) { const sd = K.seedById(f.inst || f.seedId); return sd && sd.kit ? ["kick", "snare", "hat", "top"] : ["kick", "snare", "hat"]; },
  el() { let e = $("einsp"); if (!e) { e = document.createElement("div"); e.id = "einsp"; e.hidden = true; e.setAttribute("role", "dialog"); e.setAttribute("aria-label", "Einspielen"); document.body.appendChild(e); this.bind(e); } return e; },
  // Stelle im Loop (Sechzehntel, mit Bruchteil) – so, wie die Loops abgespielt werden
  local() {
    const spb = Transport.spb, lat = 0.03 + ((Engine.ctx && Engine.ctx.outputLatency) || 0.02), pf = (Engine.now() - lat - Transport.t0) / spb, len = this.L * 16; let ls = pf;
    if (Song.playing) { const a = Song.at(Math.floor(Math.max(0, pf))); if (a) ls = pf - a.startStep; }
    return { pf, len, x: mod(ls - (this.t ? Loops.shift(this.t) : 0), len), abs: Math.floor((ls - (this.t ? Loops.shift(this.t) : 0)) / len) };
  },
  open(f, opt = {}) {
    if (!Engine.ctx) { UI.toast("Erst „Eintauchen“ – dann ist der Ton an"); return; }
    if (Engine.ctx.state !== "running") Engine.ctx.resume();
    try { UI.hideSheets(); if (Erkl.on) Erkl.stop(); } catch (_) {}
    this.f = this.playable(f) ? f : opt.pick ? null : (this.playable(Forms.active) ? Forms.active : null); this.made = null; this.undone = false; this.hold.clear();
    this.setForm(this.f, true); this.on = true; document.body.classList.add("keinsp"); const e = this.el(); e.hidden = false; this.render(); this.start(); cancelAnimationFrame(this.raf); const loop = () => { if (!this.on) return; this.paint(); this.raf = requestAnimationFrame(loop); }; this.raf = requestAnimationFrame(loop);
  },
  tidy() { const f = this.f, t = this.t; if (f && t && !t.ev.length && f.takes) { const i = f.takes.indexOf(t); if (i >= 0) f.takes.splice(i, 1); } },   // leere Loops nicht liegen lassen
  setForm(f, quiet) {
    if (f !== this.f) this.tidy(); this.f = f || null; this.t = f && (f.takes || []).length ? f.takes[0] : null; this.L = this.t ? this.t.bars : (Song.sections.length ? 4 : 2); this.round = -1;
    if (f) { try { Forms.setActive(f); Fade.set(f, true, true); if (f.lpOff) f.lpOff = false; Forms.applyMix(f); SongUI.adopt(f); } catch (e) { console.warn(e); } }
    if (!quiet) this.render();
  },
  // der Takt läuft mit: ein Stück mit Ablauf spielt als Song, sonst laufen einfach alle Loops
  start() {
    try { if (Nav67.songPiece() || (Song.sections.length && Forms.list.some(g => Loops.count(g) > 0))) { if (!Song.playing) SongUI.play(SongUI.sel >= 0 ? SongUI.sel : this.fullest()); }
      else { if (!Transport.running) Transport.start(); LoopCtl.release(); } } catch (e) { console.warn(e); }
  },
  fullest() { let b = 0, n = -1; Song.sections.forEach((s, i) => { if (s.on.length > n) { n = s.on.length; b = i; } }); return b; },
  close() {
    if (!this.on) return; this.on = false; cancelAnimationFrame(this.raf); for (const [, v] of this.hold) { try { Forms.release(v.h); } catch (_) {} } this.hold.clear();
    document.body.classList.remove("keinsp"); const e = $("einsp"); if (e) e.hidden = true;
    const f = this.f, n = f && this.t ? this.t.ev.length : 0;
    if (f && this.made === f && !n) { try { Forms.del(f); } catch (_) {} }      // eben geholt, nichts gespielt: wieder weg
    else if (f && this.t && !n) this.tidy();
    else if (n) { Save.soon(); UI.toast(`${f.name}: dein Loop läuft (${n} ${n === 1 ? "Ton" : "Töne"}, ${this.L} ${this.L === 1 ? "Takt" : "Takte"})${Song.sections.length ? " – im Song hat er eine eigene Zeile" : ""}`, 3200); }
    this.f = null; this.t = null; this.made = null; try { UI.refresh(); if (UI.tab === "song") SongUI.render(true); else if (UI.tab === "mix") MixUI.render(true); else if (UI.tab === "start") Home67.render(true); } catch (_) {}
  },
  take() { const f = this.f; if (this.t && f.takes && f.takes.includes(this.t)) return this.t; if (!this.undone) { Undo.push(); this.undone = true; } this.t = Loops.newTake(f, this.L, [], this.drum(f) ? "Rhythmus" : "Melodie"); this.t.base = 0; this.fresh = true; return this.t; },
  // ein gespielter Ton: klingt sofort und landet (gerade gerückt) im Loop – ab der nächsten Runde spielt ihn der Loop
  press(pid, b, y) {
    const f = this.f; if (!f) return; const dr = this.drum(f), r = b.getBoundingClientRect(), vel = clamp(0.55 + 0.42 * ((y - r.top) / Math.max(1, r.height)), 0.4, 1);
    let h = null, ev;
    if (dr) { const z = b.dataset.z, u = this.PADS[z][2]; h = Forms.play(f, u, vel, { zone: z, help: 50 }); ev = { z, u, d: 1 }; }
    else { const k = +b.dataset.k, m = KeysUI.midi(f, k); h = Forms.play(f, k / 14, vel, { midi: m }); ev = { m, u: clamp((m - 28) / 60, 0, 1), d: 1, k }; }
    b.classList.add("dn"); Hap(4);
    const P = this.local(), q = this.q, len = P.len; let s = q ? mod(Math.round(P.x / q) * q, len) : Math.round(P.x * 100) / 100; if (s >= len) s = 0;
    ev.s = s; ev.v = Math.round(vel * 100) / 100; ev.r = P.abs + (q && Math.round(P.x / q) * q >= len ? 1 : 0);
    const t = this.take(); if (!this.undone) { Undo.push(); this.undone = true; }
    const rec = { ev, t0: Engine.now(), b, h, t }; this.hold.set(pid, rec);
    // erst einfügen, wenn die Stelle vorbei ist – sonst spielt der Loop den Ton gleich noch einmal
    const wait = Math.max(0, (s - P.x) * Transport.spb) + 0.55; rec.tm = setTimeout(() => this.commit(rec), wait * 1000);
    this.ghost(ev);
  },
  commit(rec) {
    if (rec.done) return; rec.done = true; const t = rec.t, e = rec.ev; if (!this.on || !t || !this.f || !(this.f.takes || []).includes(t)) return;
    const i = t.ev.findIndex(x => (e.z ? x.z === e.z : x.m === e.m) && Math.abs(x.s - e.s) < 0.5); const o = { s: e.s, d: e.d, v: e.v, u: e.u, r: e.r }; if (e.z) o.z = e.z; else o.m = e.m;
    if (i >= 0) t.ev[i] = o; else t.ev.push(o); rec.o = o; this.round = Math.max(this.round, e.r); this.dots(); Save.soon();
  },
  lift(pid) {
    const v = this.hold.get(pid); if (!v) return; this.hold.delete(pid); try { Forms.release(v.h); } catch (_) {} v.b.classList.remove("dn");
    if (!v.ev.z) { const d = clamp(Math.round((Engine.now() - v.t0) / Transport.spb * 2) / 2, this.q || 0.5, this.L * 16 - 0.5); v.ev.d = d; if (v.o) { v.o.d = d; this.dots(); } }
  },
  ghost(ev) { const st = $("einStrip"); if (!st) return; const g = document.createElement("i"); g.className = "eg"; g.style.left = (ev.s / (this.L * 16) * 100) + "%"; st.appendChild(g); setTimeout(() => g.remove(), 700); },
  undoRound() {
    const t = this.t; if (!t || !t.ev.length) return; Hap(10); let r = -Infinity; for (const e of t.ev) if (e.r != null && e.r > r) r = e.r;
    if (r === -Infinity) { UI.toast("Das sind Töne von früher – „Alles weg“ leert den Loop", 2400); return; }
    const n0 = t.ev.length; t.ev = t.ev.filter(e => e.r !== r); UI.toast(`${n0 - t.ev.length} ${n0 - t.ev.length === 1 ? "Ton" : "Töne"} der letzten Runde entfernt`, 1600); this.dots(); this.btns(); Save.soon();
  },
  clear() { const t = this.t; if (!t || !t.ev.length) return; Undo.push(); this.undone = true; t.ev = []; Hap(14); UI.toast("Loop geleert – spiel neu ein", 1500); this.dots(); this.btns(); Save.soon(); },
  setLen(n) { if (this.t && this.t.ev.length && n < this.t.bars) { const cut = this.t.ev.filter(e => e.s >= n * 16).length; if (cut) { Undo.push(); this.t.ev = this.t.ev.filter(e => e.s < n * 16); } } this.L = n; if (this.t) this.t.bars = n; this.render(); Save.soon(); },
  async add(seedId, name) {
    if (Forms.list.length >= Forms.MAX) { UI.toast("Im Stück ist kein Platz mehr für einen weiteren Klang", 2400); return; }
    Undo.push(); this.undone = true; const f = Forms.make({ seedId, name }); if (!f) return; Forms.rebuild(f, true); f.still = false; this.made = f; this.setForm(f); Hap(12); UI.refresh();
  },
  colOfEv(e) { if (e.z) return ({ kick: "#FF8A6B", snare: "#FFD76B", hat: "#5FE0C4", top: "#B08CFF" })[e.z] || "#fff"; const f = this.f; for (let k = 0; k <= 14; k++) if (KeysUI.midi(f, k) === e.m) return KeysUI.COL[mod(k, 7)]; return "#C9D3F2"; },
  dots() {
    const st = $("einDots"); if (!st) return; const t = this.t, len = this.L * 16; if (!t || !t.ev.length) { st.innerHTML = ""; this.btns(); return; }
    const dr = this.drum(this.f), ms = t.ev.filter(e => !e.z).map(e => e.m), lo = Math.min(...ms, 999), hi = Math.max(...ms, -999), ZR = { top: 0, hat: 1, snare: 2, kick: 3 };
    st.innerHTML = t.ev.filter(e => e.s < len).map(e => { const y = dr ? 12 + (ZR[e.z] ?? 1) * 22 : (hi > lo ? 86 - (e.m - lo) / (hi - lo) * 74 : 50); return `<i style="left:${(e.s / len * 100).toFixed(2)}%;top:${y.toFixed(1)}%;width:${Math.max(1.2, (dr ? 0.6 : e.d * 0.9) / len * 100).toFixed(2)}%;--c:${this.colOfEv(e)}"${e.r === this.round ? ' class="nw"' : ""}></i>`; }).join("");
    this.btns();
  },
  btns() { const n = this.t ? this.t.ev.length : 0, e = $("einsp"); if (!e) return; e.querySelectorAll('[data-ei="undo"], [data-ei="clear"]').forEach(b => b.disabled = !n); const c = $("einCnt"); if (c) c.textContent = n ? `${n} ${n === 1 ? "Ton" : "Töne"} im Loop` : "noch leer – spiel einfach los"; },
  paint() { const ph = $("einHead"); if (!ph || !Transport.running) { if (ph) ph.style.opacity = "0"; return; } const P = this.local(); ph.style.opacity = "1"; ph.style.left = (P.x / P.len * 100).toFixed(2) + "%"; const bt = Math.floor(mod(P.x, 16) / 4); if (bt !== this.lastBt) { this.lastBt = bt; const e = $("einsp"); if (e) e.querySelectorAll(".ebeat i").forEach((x, i) => x.classList.toggle("on", i === bt)); } },
  render() {
    const e = this.el(), f = this.f, dr = this.drum(f), len = this.L * 16;
    const chips = this.forms().map(g => `<button class="echip" data-ef="${g.id}" aria-pressed="${g === f}" style="--c:${SongGen.col(g)}"><i>${SongGen.icOf(g)}</i>${esc(g.name)}${Loops.count(g) ? "<em></em>" : ""}</button>`).join("");
    const have = new Set(Forms.list.map(g => g.inst || g.seedId)), quick = this.QUICK.filter(([id]) => !have.has(id) && K.seedById(id)).slice(0, f ? 4 : 8).map(([id, n]) => `<button class="echip new" data-en="${id}" data-nm="${n}">＋ ${n}</button>`).join("");
    const grid = Array.from({ length: this.L * 4 }, (_, i) => `<span class="${i % 4 === 0 ? "b1" : ""}" style="left:${(i * 4 / len * 100).toFixed(2)}%">${i % 4 === 0 ? `<b>${i / 4 + 1}</b>` : ""}</span>`).join("");
    let play = "";
    if (f && dr) play = `<div class="epads n${this.zones(f).length}">${this.zones(f).map(z => `<button class="epad" data-z="${z}" style="--c:${this.colOfEv({ z })}"><b>${this.PADS[z][0]}</b><small>${this.PADS[z][1]}</small></button>`).join("")}</div>`;
    else if (f) { const row = (a, b, cls) => { let h = ""; for (let k = a; k <= b; k++) h += `<button class="kyk${mod(k, 7) === 0 ? " root" : ""}${cls === "up" && k === 7 ? " dup" : ""}" data-k="${k}" style="--c:${KeysUI.COL[mod(k, 7)]}" aria-label="Ton ${esc(deN(KeysUI.midi(f, k)))}"><b>${esc(KeysUI.lab(f, k))}</b></button>`; return `<div class="kyrow ${cls}">${h}</div>`; };
      play = `<div class="kykeys ekeys">${row(7, 14, "up")}${row(0, 7, "dn")}</div><div class="eoct"><button data-ei="oct-" aria-label="Eine Oktave tiefer">◀ tiefer</button><span>${esc(KeysUI.keyTxt())} · kein Ton klingt falsch</span><button data-ei="oct+" aria-label="Eine Oktave höher">höher ▶</button></div>`; }
    e.innerHTML = `<div class="ein"><div class="etop"><button class="ex" data-ei="close" aria-label="Schließen">${I67.x}</button><div class="eti"><b>Einspielen</b><small>${f ? "Spiel los – es bleibt und wiederholt sich." : "Womit möchtest du spielen?"}</small></div><button class="eb pp" data-ei="pp" aria-label="${Transport.running ? "Anhalten" : "Weiterlaufen lassen"}">${Transport.running ? I67.stop : I67.play}</button><button class="edone" data-ei="close">Fertig</button></div>
      <div class="echips" aria-label="Klang wählen">${chips}${quick}</div>
      ${f ? `<div class="estrip" id="einStrip"><div class="egrid">${grid}</div><div class="edots" id="einDots"></div><i class="ehead" id="einHead"></i><span class="ecnt" id="einCnt"></span></div>
      <div class="erow"><div class="ebeat" aria-hidden="true"><i></i><i></i><i></i><i></i></div><span class="esp"></span>
        <button class="eb" data-ei="undo" aria-label="Die Töne der letzten Runde entfernen">${I67.left}<span>Letzte Runde</span></button><button class="eb" data-ei="clear" aria-label="Loop leeren">${I67.trash}<span>Alles weg</span></button></div>
      ${play}
      <div class="eopt"><span class="eseg" aria-label="Länge des Loops">${[1, 2, 4].map(n => `<button data-el="${n}" aria-pressed="${this.L === n}">${n} ${n === 1 ? "Takt" : "Takte"}</button>`).join("")}</span>
        <span class="eseg" aria-label="Gerade rücken">${this.QS.map(([v, n]) => `<button data-eq="${v}" aria-pressed="${this.q === v}">${n}</button>`).join("")}</span>
        <button class="eb tg" data-ei="click" aria-pressed="${this.click}" aria-label="Klick im Takt: ${this.click ? "an" : "aus"}"><span>Klick</span></button></div>
      <p class="ehint">„grob“ rückt jeden Ton auf den nächsten halben Schlag – so klingt es auch im Takt, wenn du ungenau triffst. „fein“ lässt schnellere Töne zu, „frei“ ändert nichts.</p>`
      : `<div class="eempty"><div class="sxart"><i></i><i></i><i></i><i></i><i></i></div><p>Tippe oben einen Klang an. Danach spielst du auf bunten Tasten oder Trommel-Feldern – ohne Aufnahmeknopf.</p></div>`}</div>`;
    this.dots(); this.lastBt = -1;
  },
  act(k) {
    if (k === "close") return this.close();
    if (k === "pp") { Hap(10); if (Transport.running) { if (Song.playing) SongUI.stop(); else Transport.stop(); } else this.start(); return setTimeout(() => this.render(), 60); }
    if (k === "undo") return this.undoRound();
    if (k === "clear") return this.clear();
    if (k === "click") { this.click = !this.click; store.set("einClick", this.click); Hap(); return this.render(); }
    if (k === "oct-" || k === "oct+") { KeysUI.oct = clamp(KeysUI.oct + (k === "oct+" ? 1 : -1), -2, 2); store.set("kOct", KeysUI.oct); Hap(); return this.render(); }
  },
  bind(e) {
    e.addEventListener("pointerdown", ev => { const b = ev.target.closest(".kyk[data-k], .epad[data-z]"); if (!b) return; ev.preventDefault(); try { b.setPointerCapture(ev.pointerId); } catch (_) {} this.press(ev.pointerId, b, ev.clientY); });
    const up = ev => this.lift(ev.pointerId); e.addEventListener("pointerup", up); e.addEventListener("pointercancel", up);
    e.addEventListener("click", ev => {
      const a = ev.target.closest("[data-ei]"); if (a && !a.disabled) return this.act(a.dataset.ei);
      const c = ev.target.closest("[data-ef]"); if (c) { const f = Forms.byId(c.dataset.ef); if (f) { Hap(); this.setForm(f); } return; }
      const n = ev.target.closest("[data-en]"); if (n) return this.add(n.dataset.en, n.dataset.nm);
      const l = ev.target.closest("[data-el]"); if (l) { Hap(); return this.setLen(+l.dataset.el); }
      const q = ev.target.closest("[data-eq]"); if (q) { this.q = +q.dataset.eq; store.set("einQ", this.q); Hap(); return this.render(); }
    });
    e.addEventListener("contextmenu", ev => ev.preventDefault());
  }
};
// Klick im Takt, solange eingespielt wird (geht nicht in Aufnahmen)
{ const os = Transport.onStep.bind(Transport); Transport.onStep = function (step, time) { try { if (Einsp.on && Einsp.click && step % 4 === 0) Metro.click(time, mod(Song.loopStep(step), 16) === 0); } catch (_) {} return os(step, time); }; }
// Stück geladen oder rückgängig gemacht: die Einspiel-Ansicht hält keine alten Formen fest
{ const pl = Project.load.bind(Project); Project.load = function (d, mem) { const r = pl(d, mem); try { if (Einsp.on) { const id = Einsp.f && Einsp.f.id, f = id && Forms.byId(id); Einsp.made = null; Einsp.hold.clear(); if (f && Einsp.playable(f)) Einsp.setForm(f); else { Einsp.f = null; Einsp.t = null; Einsp.render(); } } SongUI.had = null; } catch (e) { console.warn(e); } return r; }; }

/* ---------- Song: neue Klänge mit Loop kommen von selbst hinein · Lautstärke in der Zeile ---------- */
// Form in alle Teile aufnehmen, wenn sie noch in keinem vorkommt
SongUI.adopt = function (f) { const S = Song.sections; if (!f || !S.length || S.some(s => s.on.includes(f.id))) return false; for (const s of S) s.on.push(f.id); Save.soon(); return true; };
// beobachten: bekommt eine Form ihren ersten Loop, spielt sie ab jetzt im Song mit
SongUI.watch = function () {
  const cur = new Map(Forms.list.filter(f => !f.empty && !f.remote).map(f => [f.id, this.hasLoop(f)])); const had = this.had; this.had = cur; if (!had || !Song.sections.length) return;
  for (const [id, lp] of cur) if (lp && had.get(id) === false || (lp && !had.has(id))) { const f = Forms.byId(id); if (f && this.adopt(f) && !Einsp.on) UI.toast(`„${f.name}“ spielt jetzt in allen Teilen deines Songs mit – unter „Song“ schaltest du es je Teil an oder aus`, 4200); }
};
{ const tk = SongUI.tick.bind(SongUI); SongUI.tick = function () { try { this.watch(); document.body.classList.toggle("ksopen", KSheet.det === "half"); } catch (_) {} return tk(); }; }
// Zeile im Song: Lautstärke-Regler gleich neben dem Namen (derselbe Regler wie unter „Mischen“)
{ const rn = SongUI.render.bind(SongUI); SongUI.render = function (force) { if (MixUI.drag) return; const r = rn(force); try { const el = this.el(); if (el && !el.hidden) for (const row of el.querySelectorAll(".sxr:not(.sxhd)")) { if (row.querySelector(".sxv")) continue; const nb = row.querySelector(".sxn[data-sf]"), f = nb && Forms.byId(nb.dataset.sf); if (!f) continue; const w = document.createElement("div"); w.className = "sxnw mxr"; nb.replaceWith(w); w.appendChild(nb); w.insertAdjacentHTML("beforeend", `<div class="mxfw sxv">${MixUI.fader(f.id, f.fine.vol, 1.5, f.name + ": Lautstärke")}</div>`); } } catch (e) { console.warn(e); } return r; }; }
{ const so = SongUI.sigOf.bind(SongUI); SongUI.sigOf = function () { return so() + "§" + this.forms().map(f => Math.round(f.fine.vol * 50)).join("."); }; }

/* ---------- Mischen: auch Gesangs- und Audiospuren ---------- */
MixUI.audio = function () { try { return (Sing.tracks || []).filter(t => t && t.rec); } catch (_) { return []; } };
MixUI.setAudio = function (t, v) { t.vol = clamp(v, 0, 1.5); try { for (const e of Sing.srcs) if (e.t === t && e.g) e.g.gain.setTargetAtTime(t.mute ? 0 : t.vol, Engine.now(), 0.03); } catch (_) {} Save.soon(); };
{ const rn = MixUI.render.bind(MixUI); MixUI.render = function (force) { const r = rn(force); try { const el = this.el(), A = this.audio(); if (el && !el.hidden && A.length && !el.querySelector(".mxaud")) { const rows = el.querySelector(".mxrows"); if (rows) rows.insertAdjacentHTML("afterend", `<div class="sxh mxaud"><h3>Gesang und Audiospuren</h3><small>laufen von vorn mit</small></div><div class="mxrows">${A.map(t => `<div class="mxr${t.mute ? " q7off" : ""}" data-aid="${t.id}" style="--c:#FF9AD5"><span class="mxn"><i>${I67.mic}</i><b>${esc(t.name || "Gesang")}</b></span><div class="mxfw">${this.fader("a:" + t.id, t.vol ?? 1, 1.5, (t.name || "Gesang") + ": Lautstärke")}</div><button class="mxb" data-am="${t.id}" aria-pressed="${!!t.mute}" aria-label="${esc(t.name || "Gesang")} ${t.mute ? "wieder einschalten" : "stumm schalten"}">${t.mute ? I67.mute : I67.vol}</button></div>`).join("")}</div>`); } } catch (e) { console.warn(e); } return r; };
  const sv = MixUI.setVol.bind(MixUI); MixUI.setVol = function (id, v, row) { if (String(id).startsWith("a:")) { const t = this.audio().find(x => "a:" + x.id === id); if (!t) return; v = clamp(v, 0, 1.5); if (Math.abs(v - 1) < 0.035) v = 1; this.setAudio(t, v); const u = v / 1.5 * 100, w = row.querySelector(".mxf"); w.querySelector(".mxfill").style.width = u + "%"; w.querySelector(".mxk").style.left = u + "%"; row.querySelector(".mxv").textContent = Math.round(v * 100); return; } return sv(id, v, row); };
  const sg = MixUI.sigOf.bind(MixUI); MixUI.sigOf = function () { return sg() + "§" + this.audio().map(t => t.id + Math.round((t.vol ?? 1) * 100) + (t.mute ? "m" : "")).join("."); }; }
document.addEventListener("click", e => { const b = e.target.closest && e.target.closest("#vMix [data-am]"); if (!b) return; const t = MixUI.audio().find(x => String(x.id) === b.dataset.am); if (!t) return; Undo.push(); t.mute = !t.mute; MixUI.setAudio(t, t.vol ?? 1); Hap(8); MixUI.render(true); });

/* ---------- Einfach oder Profi ---------- */
const Einf68 = {
  profi() { return !!store.get("tabsAll"); },
  sync() { const p = this.profi(); document.body.classList.toggle("ktabsall", p); document.body.classList.toggle("keinf", !p); },
  set(p) { store.set("tabsAll", !!p); this.sync(); try { UI.refresh(); Layout.last = ""; Layout.sync(); } catch (_) {} }
};
Einf68.sync();
try { MixUI.bind($("vSong")); } catch (e) { console.warn(e); }   // Regler in den Song-Zeilen
// im einfachen Bereich „Spielen“ öffnet „Loop“ das Einspielen (statt der Audio-Aufnahme)
for (const tp of ["pointerdown", "pointerup", "click"]) document.addEventListener(tp, e => { if (!document.body.classList.contains("keinf") || Erkl.on) return; const b = e.target.closest && e.target.closest('#ksheet .ksq [data-ks="loop"]'); if (!b) return; e.stopImmediatePropagation(); if (tp === "click") { e.preventDefault(); Hap(8); Einsp.open(Forms.active); } }, true);
// Prüfstand: läuft mit allen Schaltern (Profi) und stellt danach zurück
setTimeout(() => { try { const tr = Tests.run.bind(Tests); Tests.run = function () { const ke = document.body.classList.contains("keinf"), eo = Einsp.on; if (eo) Einsp.close(); document.body.classList.remove("keinf"); try { return tr.apply(null, arguments); } finally { if (ke) document.body.classList.add("keinf"); } }; } catch (e) { console.warn(e); } }, 0);

/* ---------- Einstiege ---------- */
// Start: „Selbst einspielen“ statt „Live auflegen“ (das Pult steht unter „Mehr“)
{ const i = Home67.TILES.findIndex(t => t[0] === "pult"); const tile = ["einsp", "loop", "Selbst einspielen", "Spiel los – es bleibt als Loop", "#F25CC1", "#9B5CFF"]; if (i >= 0) Home67.TILES.splice(i, 1); Home67.TILES.unshift(tile);
  const ha = Home67.act.bind(Home67); Home67.act = function (k) { if (k === "einsp") { Hap(8); return Einsp.open(null, { pick: !Einsp.playable(Forms.active) }); } return ha(k); }; }
// Song: „Klang dazu“ und das Zeilenmenü führen zum Einspielen
{ const sa = SongUI.act.bind(SongUI); SongUI.act = function (k, b) { if (k === "newf") { if (Song.rec) return this.busyRec(); Hap(8); return Einsp.open(null, { pick: true }); } return sa(k, b); };
  const rm = SongUI.rowMenu.bind(SongUI); SongUI.rowMenu = function (f) { rm(f); try { const m = document.querySelector("#sheets .sxmenu"); if (m && Einsp.playable(f)) { m.insertAdjacentHTML("afterbegin", `<button class="sxbtn q7big" data-ein="${f.id}"><i>${I67.loop}</i><span><b>Dazuspielen</b><small>selbst etwas einspielen – es kommt zum Loop dazu</small></span></button>`); m.querySelector("[data-ein]").addEventListener("click", ev => { ev.stopPropagation(); Hap(8); Einsp.open(f); }); } } catch (e) { console.warn(e); } }; }
// Mehr: ein Schalter für alles – einfach oder Profi
{ const mo = Nav67.more.bind(Nav67); Nav67.more = function () { mo(); try { const b = document.querySelector('#sheets [data-mo="all"]'); if (b) { b.querySelector("span").innerHTML = "<b>Profi-Ansicht</b><small>alle Bereiche unten in der Leiste und alle Schalter im Bereich „Spielen“</small>"; b.addEventListener("click", () => setTimeout(() => Einf68.sync(), 0)); }
      const g = document.querySelector("#sheets .mrg"); if (g) { g.insertAdjacentHTML("afterbegin", `<button class="hmt q7wide" data-mo2="einsp" style="--c1:#F25CC1;--c2:#9B5CFF"><i>${I67.loop}</i><b>Selbst einspielen</b><span>Tasten oder Trommel-Felder – was du spielst, bleibt als Loop</span></button>`); g.querySelector("[data-mo2]").addEventListener("click", ev => { ev.stopPropagation(); UI.hideSheets(); Einsp.open(null, { pick: !Einsp.playable(Forms.active) }); }); } } catch (e) { console.warn(e); } }; }
// Erklärungen
Erkl.T.unshift(
  ['[data-hm="einsp"], [data-mo2="einsp"], [data-ein], #ksheet .ksq [data-ks="loop"]', "Selbst einspielen", "Du spielst auf bunten Tasten oder Trommel-Feldern, während der Takt läuft. Es gibt keinen Aufnahmeknopf: Was du spielst, bleibt und wiederholt sich als Loop."],
  [".sxv .mxf", "Lautstärke dieser Zeile", "Nach rechts ziehen = lauter, nach links = leiser. Derselbe Regler steht auch unter „Mischen“."],
  ['[data-mo="all"]', "Profi-Ansicht", "Aus: nur das Wichtigste ist zu sehen. An: alle Bereiche stehen unten in der Leiste, und im Bereich „Spielen“ erscheinen alle Schalter."]
);
Help.T.push({ id: "einspielen", ic: "🔁", t: "Selbst einspielen – ohne Aufnahmeknopf", k: "einspielen loop aufnehmen dauerschleife overdub tasten trommel pads schlagzeug gerade rücken quantisieren raster klick metronom letzte runde einfach profi lautstärke zeile spuren mix gesang",
  h: `<ul><li><b>Öffnen</b>: Start → <b>Selbst einspielen</b> · im Song <b>Klang dazu</b> oder Instrument antippen → <b>Dazuspielen</b> · im Bereich Spielen der Knopf <b>Loop</b>.</li>
  <li>Oben wählst du den Klang (oder holst mit ＋ einen neuen). Der Takt läuft, dein Stück spielt mit.</li>
  <li><b>Es gibt keinen Aufnahmeknopf.</b> Jeder Ton, den du auf den bunten Tasten oder den Trommel-Feldern spielst, erscheint als Punkt im Band und wird ab der nächsten Runde vom Loop gespielt. Du kannst Runde für Runde etwas dazuspielen.</li>
  <li><b>Letzte Runde</b> nimmt zurück, was du zuletzt gespielt hast. <b>Alles weg</b> leert den Loop.</li>
  <li><b>1 · 2 · 4 Takte</b>: Länge des Loops. <b>grob · fein · frei</b>: wie stark gerade gerückt wird – „grob“ setzt jeden Ton auf den nächsten halben Schlag, das klingt auch bei ungenauem Spiel im Takt. <b>Klick</b>: hörbarer Schlag zum Mitzählen (kommt nicht in Aufnahmen).</li>
  <li><b>Fertig</b> schließt. Hat dein Stück einen Ablauf, spielt der neue Klang in allen Teilen mit; unter <b>Song</b> schaltest du ihn je Teil an oder aus.</li>
  <li><b>Lautstärke in der Song-Zeile</b>: neben jedem Instrument steht ein kleiner Regler. Unter <b>Mischen</b> gibt es zusätzlich Regler für Gesangs- und Audiospuren.</li>
  <li><b>Einfach oder Profi</b>: Mehr → <b>Profi-Ansicht</b>. Aus (Standard): im Bereich Spielen stehen nur Tasten, Kneten, Malen und Loop; „▴ Mehr“ zeigt alles. An: alle Schalter und alle Bereiche wie früher.</li></ul>` });
