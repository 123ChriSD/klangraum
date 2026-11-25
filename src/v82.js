/* ================= Version 82: Klangfeld – alle Instrumente mit Gesten spielen, ohne Noten ================= */
I67.feld = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19V5M9 19V5M14 19V5M19 19V5"/><circle cx="9" cy="14" r="2.200" fill="currentColor" stroke="none"/><circle cx="14" cy="8.500" r="2.200" fill="currentColor" stroke="none"/><path d="M9 14l5-5.500"/></svg>`;
const Feld82 = {
  on: false, f: null, t: null, L: 2, q: 2, mem: store.get("f82mem") === true, chord: false, made: null, undone: false, round: -1, panel: false,
  hold: new Map(), fx: [], COLS: 8, lastBt: -1, flash: 0,
  DR: { kick: ["Bassdrum", "#FF8A6B", 0.15], snare: ["Snare", "#FFD76B", 0.47], hat: ["Hi-Hat", "#5FE0C4", 0.72], top: ["Becken", "#B08CFF", 0.92] },
  drum(f) { return Einsp.drum(f); },
  forms() { return Einsp.forms(); },
  /* Aufbau des Feldes: Spalten = Stufen der Tonleiter, Zeilen = Oktaven (unten tief). Schlagzeug: Zeilen = Trommeln. */
  rows(f) { return this.drum(f) ? Einsp.zones(f).length : (this.geoH || 600) < 330 ? 2 : 3; },
  cellOf(G, x, y) { const c = clamp(Math.floor((x - G.x) / G.cw), 0, G.cols - 1), r = clamp(Math.floor((y - G.y) / G.rh), 0, G.rows - 1); return { c, r, fx: clamp((x - G.x) / G.cw - c, 0, 1), fy: clamp((y - G.y) / G.rh - r, 0, 1) }; },
  /* Stufe der Tonleiter: jede Zeile eine Oktave höher, die achte Spalte ist schon der erste Ton der nächsten Zeile */
  kOf(c, r, rows) { return c + (rows - 1 - r) * 7; },
  /* unten in der Zelle kräftig, oben zart */
  velAt(fy) { return Math.round(clamp(0.5 + 0.48 * fy, 0.4, 1) * 100) / 100; },
  /* Wackeln: seitlicher Weg seit dem Aufsetzen biegt den Ton, höchstens einen Viertelton */
  bend(dx, cw) { return Math.round(clamp(dx / Math.max(1, cw) * 100, -50, 50)); },
  chordKs(k) { return [k, k + 2, k + 4]; },
  zoneOf(f, r) { const Z = Einsp.zones(f).slice().reverse(); return Z[clamp(r, 0, Z.length - 1)]; },
  el() {
    let e = $("feld82"); if (e) return e; e = document.createElement("div"); e.id = "feld82"; e.hidden = true; e.setAttribute("role", "dialog"); e.setAttribute("aria-label", "Klangfeld");
    e.innerHTML = `<div class="f82top"><button class="f82b" data-f8="close" aria-label="Klangfeld schließen">${I67.x}</button><div class="f82ti"><b>Klangfeld</b><small id="f82Sub"></small></div><button class="f82b" data-f8="pp" id="f82PP" aria-label="Begleitung starten oder anhalten"></button><button class="f82done" data-f8="close">Fertig</button></div>
      <div class="f82chips" id="f82Chips" aria-label="Instrument wählen"></div>
      <div class="f82wrap"><canvas id="f82C" aria-label="Spielfläche: tippen, halten und wischen spielt Töne"></canvas><div class="f82empty" id="f82E" hidden><p>Womit möchtest du spielen?</p><button class="f82big" data-f8="inst">${I67.feld}<span>Instrument wählen</span></button></div></div>
      <div class="f82bar" id="f82Bar"></div>
      <div class="f82pan" id="f82Pan" hidden></div>`;
    document.body.appendChild(e); this.bind(e); return e;
  },
  open(f) {
    if (!Engine.ctx) { UI.toast("Erst „Eintauchen“ – dann ist der Ton an"); return; }
    try { if (Engine.ctx.state !== "running") Engine.ctx.resume(); UI.hideSheets(); P78.close(); if (Erkl.on) Erkl.stop(); if (Auf78.on) Auf78.set(false); if (Tools.knead) Tools.toggleKnead(false); if (Tools.brush) Tools.toggleBrush(false); } catch (_) {}
    const e = this.el(); this.on = true; this.made = null; this.undone = false; this.panel = false; this.hold.clear(); this.fx = []; document.body.classList.add("kfeld82"); e.hidden = false;
    this.setForm(Einsp.playable(f) ? f : Einsp.playable(Forms.active) ? Forms.active : this.forms()[0] || null);
    try { Einsp.start(); } catch (_) {}
    cancelAnimationFrame(this.raf); const loop = () => { if (!this.on) return; try { this.draw(); } catch (x) { console.warn(x); } this.raf = requestAnimationFrame(loop); }; this.raf = requestAnimationFrame(loop);
    try { P78.paint(true); } catch (_) {}
  },
  tidy() { const f = this.f, t = this.t; if (f && t && !t.ev.length && f.takes) { const i = f.takes.indexOf(t); if (i >= 0 && this.fresh === t) f.takes.splice(i, 1); } },
  setForm(f) {
    this.stopAll(); if (f !== this.f) { this.tidy(); this.dropUnused(f); }
    this.f = f || null; this.t = f && (f.takes || []).length ? f.takes[0] : null; this.L = this.t ? this.t.bars : (Song.sections.length ? 4 : 2); this.round = -1;
    if (f) { try { Forms.setActive(f); Fade.set(f, true, true); if (f.lpOff) f.lpOff = false; Forms.applyMix(f); SongUI.adopt(f); } catch (e) { console.warn(e); } }
    this.render();
  },
  /* ein eben geholtes Instrument, auf dem nichts gemerkt wurde, verschwindet beim Wechsel wieder – so kann man alle durchprobieren */
  dropUnused(next) { const m = this.made; if (!m || m === next) return; this.made = null; try { if (Forms.list.includes(m) && !Loops.count(m)) Forms.del(m); } catch (_) {} },
  add(seedId, name) {
    this.panel = false; this.stopAll(); this.tidy(); this.dropUnused(null);
    if (Forms.list.length >= Forms.MAX) { UI.toast("Im Stück ist kein Platz mehr für ein weiteres Instrument", 2400); return this.render(); }
    if (!this.undone) { Undo.push(); this.undone = true; } const f = Forms.make({ seedId, name }); if (!f) return this.render(); Forms.rebuild(f, true); f.still = false; this.made = f; this.f = null; this.setForm(f); Hap(12); try { UI.refresh(); } catch (_) {}
  },
  close() {
    if (!this.on) return; this.on = false; cancelAnimationFrame(this.raf); this.stopAll(); document.body.classList.remove("kfeld82"); const e = $("feld82"); if (e) e.hidden = true;
    const f = this.f, n = f && this.t ? this.t.ev.length : 0; this.tidy();
    if (f && this.made === f && !Loops.count(f)) { try { Forms.del(f); } catch (_) {} }
    else if (n && this.mem) { Save.soon(); UI.toast(`${f.name}: dein Loop läuft (${n} ${n === 1 ? "Ton" : "Töne"})`, 2600); }
    this.f = null; this.t = null; this.made = null; try { UI.refresh(); P78.paint(true); if (UI.tab === "song") SongUI.render(true); } catch (_) {}
  },
  stopAll() { for (const [, v] of this.hold) this.rel(v); this.hold.clear(); },
  take() { const f = this.f; if (this.t && f.takes && f.takes.includes(this.t)) return this.t; if (!this.undone) { Undo.push(); this.undone = true; } this.t = Loops.newTake(f, this.L, [], this.drum(f) ? "Rhythmus" : "Melodie"); this.t.base = 0; this.fresh = this.t; return this.t; },
  /* gemerkt wird wie beim Einspielen: gerade gerückt auf halbe Schläge, ab der nächsten Runde spielt es der Loop */
  note(ev) {
    if (!this.mem) return null; const P = Einsp.local.call(this), q = this.q, len = P.len; let s = q ? mod(Math.round(P.x / q) * q, len) : Math.round(P.x * 100) / 100; if (s >= len) s = 0;
    ev.s = s; ev.r = P.abs + (q && Math.round(P.x / q) * q >= len ? 1 : 0); const t = this.take(), R = { ev, t0: Engine.now(), t };
    R.tm = setTimeout(() => this.commit(R), (Math.max(0, (s - P.x) * Transport.spb) + 0.55) * 1000); return R;
  },
  commit(R) { if (R.done) return; R.done = true; const t = R.t, e = R.ev; if (!this.on || !t || !this.f || !(this.f.takes || []).includes(t)) return;
    const i = t.ev.findIndex(x => (e.z ? x.z === e.z : x.m === e.m) && Math.abs(x.s - e.s) < 0.5), o = { s: e.s, d: e.d, v: e.v, u: e.u, r: e.r }; if (e.z) o.z = e.z; else o.m = e.m;
    if (i >= 0) t.ev[i] = o; else t.ev.push(o); R.o = o; this.round = Math.max(this.round, e.r); this.count(); Save.soon(); },
  /* einen Ton (oder Dreiklang, oder Trommelschlag) für die Zelle anschlagen */
  strike(G, cell) {
    const f = this.f, vel = this.velAt(cell.fy), out = { hs: [], recs: [], c: cell.c, r: cell.r, col: "#fff", ms: [] };
    if (this.drum(f)) { const z = this.zoneOf(f, cell.r), D = this.DR[z]; out.col = D[1]; out.z = z; out.hs.push(Forms.play(f, D[2], vel, { zone: z, help: 50 })); const R = this.note({ z, u: D[2], d: 1, v: vel }); if (R) out.recs.push(R); return out; }
    const k = this.kOf(cell.c, cell.r, G.rows); out.k = k; out.col = KeysUI.COL[mod(k, 7)];
    for (const kk of (this.chord ? this.chordKs(k) : [k])) { const m = KeysUI.midi(f, kk), u = clamp((m - 28) / 60, 0, 1); out.ms.push(m); out.hs.push(Forms.play(f, u, kk === k ? vel : vel * 0.8, { midi: m })); const R = this.note({ m, u, d: 1, v: kk === k ? vel : Math.round(vel * 80) / 100, k: kk }); if (R) out.recs.push(R); }
    return out;
  },
  rel(v) { for (const h of v.hs) { try { Forms.release(h); } catch (_) {} } const d = clamp(Math.round((Engine.now() - v.t0) / Transport.spb * 2) / 2, this.q || 0.5, this.L * 16 - 0.5); for (const R of v.recs) { if (!R.ev.z) { R.ev.d = d; if (R.o) R.o.d = d; } } },
  geo() { const c = $("f82C"), r = c.getBoundingClientRect(), rows = this.rows(this.f), cols = this.drum(this.f) ? 4 : this.COLS; this.geoH = r.height; return { x: 0, y: 0, w: r.width, h: r.height, cols, rows, cw: r.width / cols, rh: r.height / rows, left: r.left, top: r.top }; },
  down(e) {
    if (!this.f || this.panel) return; const c = $("f82C"); try { c.setPointerCapture(e.pointerId); } catch (_) {} e.preventDefault();
    const G = this.geo(), x = e.clientX - G.left, y = e.clientY - G.top, cell = this.cellOf(G, x, y), v = this.strike(G, cell);
    v.t0 = Engine.now(); v.x = x; v.y = y; v.x0 = x; v.tr = [[x, y, performance.now()]]; v.cents = 0; this.hold.set(e.pointerId, v); this.ring(x, y, v.col); Hap(4);
  },
  move(e) {
    const v = this.hold.get(e.pointerId); if (!v || !this.f) return; const G = this.geo(), x = e.clientX - G.left, y = e.clientY - G.top, cell = this.cellOf(G, x, y);
    v.x = x; v.y = y; v.tr.push([x, y, performance.now()]); if (v.tr.length > 24) v.tr.shift();
    if (cell.c !== v.c || cell.r !== v.r) {   /* in die nächste Zelle gewischt: der nächste Ton – so entstehen Melodien in einem Zug */
      this.rel(v); const n = this.strike(G, cell); n.t0 = Engine.now(); n.x = x; n.y = y; n.x0 = G.cw * (cell.c + 0.5); n.tr = v.tr; n.cents = 0; this.hold.set(e.pointerId, n); this.ring(x, y, n.col); Hap(3); return;
    }
    if (!v.z) { const ct = this.bend(x - v.x0, G.cw); if (Math.abs(ct - v.cents) >= 3) { v.cents = ct; const r = Math.pow(2, ct / 1200); v.hs.forEach((h, i) => { if (h && h.vids) for (const id of h.vids) { try { Engine.glide(id, 440 * Math.pow(2, (v.ms[i] - 69) / 12) * r); } catch (_) {} } }); } }
  },
  up(e) { const v = this.hold.get(e.pointerId); if (!v) return; this.hold.delete(e.pointerId); this.rel(v); },
  ring(x, y, col) { this.fx.push({ x, y, col, t: performance.now() }); if (this.fx.length > 40) this.fx.shift(); },
  bind(e) {
    const c = e.querySelector("#f82C");
    c.addEventListener("pointerdown", ev => this.down(ev)); c.addEventListener("pointermove", ev => this.move(ev));
    for (const k of ["pointerup", "pointercancel", "lostpointercapture"]) c.addEventListener(k, ev => this.up(ev));
    c.addEventListener("contextmenu", ev => ev.preventDefault());
    e.addEventListener("click", ev => { const b = ev.target.closest("[data-f8], [data-ff], [data-fs]"); if (!b || b.disabled) return; if (b.dataset.ff) { Hap(8); return this.setForm(Forms.byId(b.dataset.ff)); } if (b.dataset.fs) { return this.add(b.dataset.fs, b.dataset.nm); } this.act(b.dataset.f8); });
    document.addEventListener("keydown", ev => { if (this.on && ev.key === "Escape") { if (this.panel) { this.panel = false; this.render(); } else this.close(); } });
  },
  act(k) {
    Hap(8);
    if (k === "close") return this.close();
    if (k === "pp") { if (Transport.running) { if (Song.playing) SongUI.stop(); else Transport.stop(); } else Einsp.start(); return setTimeout(() => this.render(), 80); }
    if (k === "inst") { this.panel = !this.panel; return this.render(); }
    if (k === "chord") { this.chord = !this.chord; return this.render(); }
    if (k === "mem") { this.mem = !this.mem; store.set("f82mem", this.mem); if (this.mem) { try { Einsp.start(); } catch (_) {} } return this.render(); }
    if (k === "oct-" || k === "oct+") { this.stopAll(); KeysUI.oct = clamp(KeysUI.oct + (k === "oct+" ? 1 : -1), -2, 2); store.set("kOct", KeysUI.oct); return this.render(); }
    if (k === "undo") { const t = this.t; if (!t || !t.ev.length) return; let r = -Infinity; for (const e of t.ev) if (e.r != null && e.r > r) r = e.r; if (r === -Infinity) return UI.toast("Das sind Töne von früher – „Alles weg“ leert den Loop", 2400); t.ev = t.ev.filter(e => e.r !== r); Save.soon(); return this.count(); }
    if (k === "clear") { const t = this.t; if (!t || !t.ev.length) return; Undo.push(); this.undone = true; t.ev = []; Save.soon(); return this.count(); }
  },
  count() { const n = this.t ? this.t.ev.length : 0, c = $("f82Cnt"); if (c) c.textContent = this.mem ? (n ? `${n} ${n === 1 ? "Ton" : "Töne"} gemerkt` : "spiel – es bleibt") : ""; const e = $("feld82"); if (e) e.querySelectorAll('[data-f8="undo"], [data-f8="clear"]').forEach(b => { b.disabled = !n; }); },
  /* alle Instrumente, nach Art geordnet */
  groups() { const G = new Map(), put = (g, s) => { if (!G.has(g)) G.set(g, []); G.get(g).push(s); };
    for (const s of K.SEEDS) { if (!s || !s.id || ["wolke", "kugel", "kristall"].includes(s.id)) continue; const fam = s.fam === "stimme" ? "Stimmen" : s.fam; put(s.kind === "drum" && !s.fam ? "Schlagzeug" : fam || (s.kind === "drum" ? "Schlagzeug" : "Instrumente"), s); }
    return [...G.entries()].sort((a, b) => (a[0] === "Instrumente" ? -1 : b[0] === "Instrumente" ? 1 : 0)); },
  render() {
    const e = this.el(), f = this.f, dr = this.drum(f);
    $("f82Sub").textContent = f ? (dr ? "Tippen = Schlag · Wischen = Wirbel" : "Tippen · Halten · Wischen · Wackeln") : "";
    $("f82PP").innerHTML = Transport.running ? I67.stop : I67.play;
    $("f82Chips").innerHTML = this.forms().map(g => `<button class="f82chip" data-ff="${g.id}" aria-pressed="${g === f}" style="--c:${SongGen.col(g)}"><i>${SongGen.icOf(g)}</i><span>${esc(g.name)}</span></button>`).join("") + `<button class="f82chip new" data-f8="inst" aria-pressed="${this.panel}">＋ Instrument</button>`;
    $("f82E").hidden = !!f; $("f82C").style.visibility = f ? "" : "hidden";
    $("f82Bar").innerHTML = f ? `${dr ? "" : `<button class="f82k" data-f8="chord" aria-pressed="${this.chord}" aria-label="Akkord: ein Finger spielt drei Töne"><b>Akkord</b></button><button class="f82k" data-f8="oct-" aria-label="Eine Oktave tiefer"${KeysUI.oct <= -2 ? " disabled" : ""}><b>◀ tiefer</b></button><button class="f82k" data-f8="oct+" aria-label="Eine Oktave höher"${KeysUI.oct >= 2 ? " disabled" : ""}><b>höher ▶</b></button>`}
      <button class="f82k mem" data-f8="mem" aria-pressed="${this.mem}" aria-label="Merken: was du spielst, bleibt als Loop"><i></i><b>Merken</b></button>${this.mem ? `<button class="f82k" data-f8="undo" aria-label="Die Töne der letzten Runde entfernen"><b>Runde weg</b></button><button class="f82k" data-f8="clear" aria-label="Loop leeren"><b>Alles weg</b></button>` : ""}<span class="f82cnt" id="f82Cnt"></span>` : "";
    const P = $("f82Pan"); P.hidden = !this.panel;
    if (this.panel) { const have = new Set(Forms.list.map(g => g.inst || g.seedId)); P.innerHTML = `<div class="f82ph"><b>Alle Instrumente</b><button class="f82b" data-f8="inst" aria-label="Liste schließen">${I67.x}</button></div><div class="f82pl">${this.groups().map(([g, L]) => `<h3>${esc(g)}</h3><div class="f82pg">${L.map(s => `<button class="f82s" data-fs="${s.id}" data-nm="${esc(s.name)}"${have.has(s.id) ? ' data-have="1"' : ""}>${esc(s.name)}</button>`).join("")}</div>`).join("")}</div>`; }
    this.count(); this.size();
  },
  size() { const c = $("f82C"); if (!c) return; const r = c.getBoundingClientRect(), d = Math.min(2, window.devicePixelRatio || 1), w = Math.round(r.width * d), h = Math.round(r.height * d); if (w > 0 && h > 0 && (c.width !== w || c.height !== h)) { c.width = w; c.height = h; } this.dpr = d; },
  draw() {
    const c = $("f82C"), f = this.f; if (!c || !f) return; this.size(); const g = c.getContext("2d"), d = this.dpr || 1, G = this.geo(), now = performance.now(), dr = this.drum(f);
    g.setTransform(d, 0, 0, d, 0, 0); g.clearRect(0, 0, G.w, G.h);
    /* Takt: ein Lichtband läuft durch den Takt, auf jeden Schlag atmet das Feld */
    let beat = 0, bar = 0; if (Transport.running) { const pf = (Engine.now() - Transport.t0) / Transport.spb; bar = mod(pf, 16) / 16; beat = 1 - mod(pf, 4) / 4; }
    const bg = g.createLinearGradient(0, 0, 0, G.h); bg.addColorStop(0, "#070B1C"); bg.addColorStop(1, "#02040C"); g.fillStyle = bg; g.fillRect(0, 0, G.w, G.h);
    const held = new Set(); for (const [, v] of this.hold) held.add(v.c + ":" + v.r);
    for (let r = 0; r < G.rows; r++) for (let cI = 0; cI < G.cols; cI++) {
      const x = cI * G.cw, y = r * G.rh, k = dr ? 0 : this.kOf(cI, r, G.rows), j = mod(k, 7), col = dr ? this.DR[this.zoneOf(f, r)][1] : KeysUI.COL[j], on = held.has(cI + ":" + r), home = !dr && j === 0, safe = !dr && (j === 2 || j === 4);
      const a = on ? 0.55 : (home ? 0.17 : safe ? 0.11 : 0.07) + beat * 0.03 * (home ? 1.6 : 1);
      const gr = g.createLinearGradient(0, y, 0, y + G.rh); gr.addColorStop(0, this.rgba(col, a * 0.35)); gr.addColorStop(1, this.rgba(col, a)); g.fillStyle = gr; g.fillRect(x + 1.5, y + 1.5, G.cw - 3, G.rh - 3);
      g.strokeStyle = this.rgba(col, on ? 0.95 : home ? 0.55 : 0.26); g.lineWidth = on ? 2 : 1; g.strokeRect(x + 2, y + 2, G.cw - 4, G.rh - 4);
      const cx = x + G.cw / 2, cy = y + G.rh / 2, rr = on ? 9 : home ? 6 : 3.5; g.beginPath(); if (home) { g.moveTo(cx, cy - rr); g.lineTo(cx + rr, cy); g.lineTo(cx, cy + rr); g.lineTo(cx - rr, cy); g.closePath(); } else g.arc(cx, cy, rr, 0, 6.2832); g.fillStyle = this.rgba(col, on ? 1 : home ? 0.9 : 0.55); g.fill();
      if (!dr && r === G.rows - 1) { g.fillStyle = this.rgba(col, 0.75); g.font = "700 11px system-ui, sans-serif"; g.textAlign = "center"; g.fillText(String(j + 1), cx, y + G.rh - 9); }
      if (dr && cI === 0) { g.fillStyle = this.rgba(col, 0.9); g.font = "700 12px system-ui, sans-serif"; g.textAlign = "left"; g.fillText(this.DR[this.zoneOf(f, r)][0], x + 10, y + 20); }
    }
    if (!dr) { g.fillStyle = "rgba(200,210,240,.5)"; g.font = "600 10px system-ui, sans-serif"; g.textAlign = "left"; const nm = G.rows === 3 ? ["hoch", "mitte", "tief"] : ["hoch", "tief"]; for (let r = 0; r < G.rows; r++) g.fillText(nm[r], 8, r * G.rh + 16); }
    if (Transport.running) { const bx = bar * G.w; const lg = g.createLinearGradient(bx - 40, 0, bx, 0); lg.addColorStop(0, "rgba(180,92,255,0)"); lg.addColorStop(1, "rgba(180,92,255,.5)"); g.fillStyle = lg; g.fillRect(bx - 40, 0, 40, 3); g.fillRect(bx - 40, G.h - 3, 40, 3); }
    g.globalCompositeOperation = "lighter";
    for (const [, v] of this.hold) { const T = v.tr; for (let i = 1; i < T.length; i++) { const age = (now - T[i][2]) / 420; if (age > 1) continue; g.strokeStyle = this.rgba(v.col, (1 - age) * 0.8); g.lineWidth = 7 * (1 - age) + 1; g.lineCap = "round"; g.beginPath(); g.moveTo(T[i - 1][0], T[i - 1][1]); g.lineTo(T[i][0], T[i][1]); g.stroke(); }
      const pr = 22 + 4 * Math.sin(now / 90); const rg = g.createRadialGradient(v.x, v.y, 2, v.x, v.y, pr * 1.8); rg.addColorStop(0, this.rgba(v.col, 0.9)); rg.addColorStop(1, this.rgba(v.col, 0)); g.fillStyle = rg; g.beginPath(); g.arc(v.x, v.y, pr * 1.8, 0, 6.2832); g.fill(); }
    this.fx = this.fx.filter(q => now - q.t < 620); for (const q of this.fx) { const a = (now - q.t) / 620; g.strokeStyle = this.rgba(q.col, (1 - a) * 0.85); g.lineWidth = 3 * (1 - a) + 0.5; g.beginPath(); g.arc(q.x, q.y, 14 + a * 70, 0, 6.2832); g.stroke(); }
    g.globalCompositeOperation = "source-over";
  },
  rgba(hex, a) { const n = parseInt(hex.slice(1), 16); return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${Math.max(0, Math.min(1, a)).toFixed(3)})`; }
};
addEventListener("resize", () => { if (Feld82.on) Feld82.size(); });
/* Punkte unten ruhen, solange das Klangfeld offen ist */
{ const vis = P78.visible.bind(P78); P78.visible = function () { return !Feld82.on && vis(); }; }
P78.HY.Klangfeld = "Klang-feld";
try { Alles73.MAKE.push(["feld", "feld", "Klangfeld", "Jedes Instrument mit Fingern spielen – tippen, halten, wischen"]); const ac = Alles73.act.bind(Alles73); Alles73.act = function (k) { if (k === "mk:feld") { UI.hideSheets(); return setTimeout(() => Feld82.open(P78.f()), 80); } return ac(k); }; } catch (_) {}
P78.T.form[0] = ["a:mk:feld", "c:keys", "a:mk:tasten", "a:mk:noten", "c:knead", "c:brush"]; P78.T.form[5] = ["c:new", "c:copy", "c:sheet", "c:del", "c:playmode"];
Help.T.push({ id: "v82", ic: "✦", t: "Klangfeld: alle Instrumente mit Gesten spielen", k: "klangfeld feld spielen instrument instrumente gesten finger multitouch wischen tippen halten melodie ohne noten akkord dreiklang oktave merken loop schlagzeug trommel futuristisch",
  h: `<p><b>Klangfeld</b> (Form → Klangfeld): eine leuchtende Fläche, auf der du jedes Instrument mit den Fingern spielst – ohne Noten. <b>Kein Ton klingt falsch:</b> Das Feld kennt nur die Töne, die zur Stimmung des Stücks passen.</p>
  <p><b>Aufbau:</b> Jede Spalte ist ein Ton (Farbe und Ziffer wie bei den bunten Tasten), nach rechts wird es höher. Jede Zeile ist eine Oktave: unten tief, oben hoch. Die Raute ◆ zeigt den Grundton – dort klingt es „zu Hause“.</p>
  <p><b>Gesten:</b> <b>Tippen</b> = kurzer Ton · <b>Halten</b> = der Ton bleibt · <b>Wischen</b> über die Spalten = eine Melodie in einem Zug · <b>Wackeln</b> auf der Stelle = der Ton schwingt · weiter <b>unten</b> in der Zelle = kräftiger · <b>mehrere Finger</b> = mehrere Töne.</p>
  <p><b>Akkord:</b> ein Finger spielt drei Töne. <b>tiefer / höher:</b> verschiebt das ganze Feld. <b>Merken:</b> Was du spielst, bleibt als Loop und wiederholt sich (gerade gerückt, damit es im Takt klingt); „Runde weg“ nimmt die letzte Runde zurück.</p>
  <p><b>＋ Instrument</b> zeigt alle Instrumente. Ein Instrument, auf dem du nichts gemerkt hast, verschwindet beim Wechsel wieder – so probierst du alle durch, ohne das Stück zu füllen. Beim <b>Schlagzeug</b> sind die Zeilen die Trommeln; wischen ergibt einen Wirbel.</p>` });
