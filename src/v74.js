/* =====================================================================================
   v74: START NOCH GENAUER EINSTELLEN · MEHR MIT MEHREREN FINGERN · FORMEN GEMEINSAM STEUERN
   – Neues Stück: Melodie-Vorlagen, Zufall, drei Lagen; wer mitspielt, Dreh-Tempo, zusammen oder als Kanon, sofort oder auf Zuruf.
   – Bewegung: Empfindlichkeit, Achsen umkehren, „Mitte neu“ auch in der Live-Fläche.
   – Live-Fläche: 3. Finger = Zerhacker im Takt, 4. Finger = Stille, Leuchtspur; Knopf „Hacken“.
   – Klangschrift: mit zwei Fingern auf- und zuziehen = mehr oder weniger Takte zeigen (auch als Knöpfe).
   – Dreh-Leiste: Schalter „alle“ – Stopp, Tempo und Richtung für alle Formen zugleich; der ältere „Anhalten“-Knopf entfällt dort.
   ===================================================================================== */

/* ---------- 1) Neues Stück: Start-Melodie mit Vorlagen und Start-Einstellungen ---------- */
Object.assign(StartMel, {
  RS: [[0.25, "¼"], [0.5, "½"], [1, "1"], [2, "2"]],
  o(S) { if (!S.mo) S.mo = { oct: 0, r: 1, kanon: false, go: true, off: {} }; return S.mo; },
  drumSeed(id) { const sd = K.seedById(id); return !sd || sd.kind === "drum"; },
  lab(k) { return (mod(k, 7) + 1) + (k >= 7 ? "▴" : k < 0 ? "▾" : ""); },
  sec(S) { const mood = this.mood(), O = this.o(S), seg = (key, L, cur) => `<span class="eseg sm74seg">${L.map(([v, n]) => `<button data-sm="${key}:${v}" aria-pressed="${String(cur) === String(v)}">${n}</button>`).join("")}</span>`;
    return `<div class="sm73" id="sm73S"><h3 class="ph3">Start-Melodie <small>wahlweise</small></h3><p class="kch">Spiel eine kurze Melodie – bis ${this.MAXN} Töne – oder nimm eine Vorlage. Die Formen des neuen Stücks spielen sie zuerst <b>gemeinsam</b>. Bleibt das Feld leer, entsteht das Stück wie gewohnt.</p>
      <div class="sm74pre" aria-label="Vorlagen">${Mel.PRESETS.filter(P => P.d && P.d.length > 1).map(P => `<button class="npc" data-sm="pre:${P.id}">${esc(P.n)}</button>`).join("")}<button class="npc" data-sm="pre:zufall">🎲 Zufall</button></div>
      <div class="sm73row" id="sm73Row" aria-live="polite"></div>
      <div class="sm74lage"><span>Lage</span>${seg("oct", [[-7, "tief"], [0, "mittel"], [7, "hoch"]], O.oct)}</div>
      <div class="sm73keys">${[0, 1, 2, 3, 4, 5, 6, 7].map(k => `<button class="sm73k" data-sm="k:${k}" style="--c:${KeysUI.COL[k % 7]}" aria-label="Ton ${k + 1}"><b>${k + 1}</b><small>${esc(deN(this.midiFor(mood, k + O.oct)).replace(/[’',]/g, ""))}</small></button>`).join("")}</div>
      <div class="sm73bar"><button class="eb" data-sm="undo" aria-label="Letzten Ton entfernen">${I67.left}<span>Zurück</span></button><button class="eb" data-sm="play" aria-label="Melodie anhören">${I67.play}<span>Anhören</span></button><button class="eb" data-sm="clear" aria-label="Melodie leeren">${I67.trash}<span>Leeren</span></button></div>
      <div class="sm74opt" id="sm74Opt"><h4>So startet das Stück</h4>
        <div class="sm74l"><span>Wer spielt mit</span><div class="sm74who">${S.forms.map((id, i) => { const sd = K.seedById(id), dr = this.drumSeed(id); return `<button class="npc" data-sm="who:${i}" aria-pressed="${!dr && O.off[i] !== true}"${dr ? " disabled" : ""}>${esc(sd ? sd.name : id)}${dr ? "<small>ohne Töne</small>" : ""}</button>`; }).join("") || "<small class=\"kch\">Noch keine Formen gewählt.</small>"}</div></div>
        <div class="sm74l"><span>Drehungen je Takt</span>${seg("r", this.RS, O.r)}</div>
        <div class="sm74l"><span>Einsatz</span>${seg("kanon", [[0, "zusammen"], [1, "nacheinander (Kanon)"]], O.kanon ? 1 : 0)}</div>
        <div class="sm74l"><span>Beginn</span>${seg("go", [[1, "spielt sofort"], [0, "wartet auf dich"]], O.go ? 1 : 0)}</div></div></div>`; },
  paint() { const r = $("sm73Row"), S = NewPiece.st; if (!r || !S) return; const d = S.mel || (S.mel = []);
    r.innerHTML = d.length ? d.map(k => `<i style="--c:${KeysUI.COL[mod(k, 7)]}">${this.lab(k)}</i>`).join("") : `<span>Noch keine Melodie – tippe auf die bunten Tasten oder wähl eine Vorlage.</span>`;
    const s = $("sm73S"); if (s) { for (const k of ["undo", "play", "clear"]) { const b = s.querySelector(`[data-sm="${k}"]`); if (b) b.disabled = !d.length; } s.querySelectorAll(".sm73k").forEach(b => { b.disabled = d.length >= this.MAXN; }); const o = $("sm74Opt"); if (o) o.classList.toggle("q7off", !d.length); }
    const go = document.querySelector('#npS [data-np="go"]'); if (go) go.textContent = d.length ? "Stück mit dieser Melodie anlegen" : "Stück anlegen"; },
  zufall() { const n = 8, d = [0]; let rs = (Date.now() ^ (Math.random() * 1e9)) >>> 0; const rnd = () => { rs = (Math.imul(rs, 1664525) + 1013904223) >>> 0; return rs / 4294967296; }; for (let i = 1; i < n; i++) { const st = [-2, -1, -1, 1, 1, 2, 2, 3][Math.floor(rnd() * 8)]; d.push(clamp(d[i - 1] + st, -2, 9)); } d[n - 1] = [0, 2, 4][Math.floor(rnd() * 3)]; return d; },
  act(k) {
    const S = NewPiece.st; if (!S) return; const d = S.mel || (S.mel = []), mood = this.mood(), O = this.o(S), [a, v] = k.split(":");
    const tune = (L, from) => { if (!Engine.ctx) return; const t0 = Engine.ctx.currentTime + 0.05, gap = clamp(30 / (S.bpm || mood.bpm || 108), 0.16, 0.4); L.forEach((n, i) => this.beep(this.midiFor(mood, n), t0 + i * gap, gap * 0.8)); };
    if (a === "k") { if (d.length >= this.MAXN) return; const n = +v + O.oct; d.push(n); this.beep(this.midiFor(mood, n)); Hap(5); return this.paint(); }
    if (a === "undo") { d.pop(); Hap(); return this.paint(); }
    if (a === "clear") { d.length = 0; Hap(10); return this.paint(); }
    if (a === "play") return tune(d);
    if (a === "pre") { const L = v === "zufall" ? this.zufall() : ((Mel.PRESETS.find(P => P.id === v) || {}).d || []).map(x => x + O.oct); d.length = 0; d.push(...L.slice(0, this.MAXN)); Hap(8); tune(d); return this.paint(); }
    Hap(6);
    if (a === "oct") O.oct = +v; else if (a === "r") O.r = +v; else if (a === "kanon") O.kanon = v === "1"; else if (a === "go") O.go = v === "1"; else if (a === "who") { if (O.off[+v]) delete O.off[+v]; else O.off[+v] = true; }
    const y = $("sm73S") ? $("sm73S").getBoundingClientRect().top : null; NewPiece.render(); if (y != null && $("sm73S")) { const sh = $("sm73S").closest(".sheet") || document.scrollingElement, dy = $("sm73S").getBoundingClientRect().top - y; try { (sh.scrollBy ? sh : document.scrollingElement).scrollBy(0, dy); } catch (_) {} }
  },
  // Melodie auf die gewählten Formen legen (off: Stellen der Formen im Blatt, die nicht mitspielen)
  apply(d, off) { const out = [], L = Forms.list, use = off && this.opt && this.opt.n === L.length; L.forEach((f, i) => { if (!f || f.empty || f.remote || f.kind === "drum") return; if (use && off[i]) return; Mel.add(f, d, "Start-Melodie"); out.push(f); }); return out; },
  after(d) { try { const O = this.opt || { r: 1, kanon: false, go: true, off: null, n: -1 }, F = this.apply(d, O.off);
      F.forEach((f, j) => { try { if (O.kanon && j) { const p = Motion.ph(f); p.ry += K.TAU * (2 * j / Math.max(2, d.length)); if (p.lk) p.lk.y = null; } if (O.go) Move.setR(f, O.r || 1, { soft: false }); } catch (_) {} });
      if (F.length && O.go) { try { if (!Transport.running) Transport.start(); } catch (_) {} } Save.soon(); try { UI.refresh(); } catch (_) {}
      UI.toast(!F.length ? "Dieses Stück hat keine Form mit Tonhöhen – die Melodie wurde nicht übernommen." : `${F.length} ${F.length === 1 ? "Form spielt" : "Formen spielen"} deine Melodie${O.kanon && F.length > 1 ? " – nacheinander, als Kanon" : F.length > 1 ? " – alle dasselbe" : ""}.${O.go ? "" : " Tippe unten links auf „Drehen“ – mit „alle“ starten alle zugleich."} Unten links: Stopp, Tempo und Richtung.`, 5800); this.opt = null; return F; } catch (e) { console.warn(e); return []; } }
});
{ const go = NewPiece.go.bind(NewPiece); NewPiece.go = async function () { try { const S = this.st, O = S && S.mo; StartMel.opt = O ? { r: O.r, kanon: !!O.kanon, go: O.go !== false, off: { ...O.off }, n: S.forms.filter(id => this.ok(id)).slice(0, 8).length } : null; } catch (_) { StartMel.opt = null; } return go(); }; }

/* ---------- 2) Bewegung: Empfindlichkeit, Achsen umkehren, Mitte neu ---------- */
Object.assign(Beweg, {
  SENS: { sanft: 50, normal: 35, stark: 22 }, cfg: Object.assign({ sens: "normal", ilr: false, ifb: false }, store.get("bw74") || {}),
  setCfg(k, v) { this.cfg[k] = v; store.set("bw74", this.cfg); this.RANGE = this.SENS[this.cfg.sens] || 35; this.paint(); }
});
Beweg.RANGE = Beweg.SENS[Beweg.cfg.sens] || 35;
{ const ax = Beweg.axes.bind(Beweg); Beweg.axes = function (b, g, a) { const r = ax(b, g, a); return [this.cfg.ilr ? -r[0] : r[0], this.cfg.ifb ? -r[1] : r[1]]; };
  const rw = Beweg.row.bind(Beweg); Beweg.row = function () { const C = this.cfg; return rw().replace(/<\/div><\/div>$/, `</div><div class="b74o" role="group" aria-label="Bewegung einstellen"><button class="eb" data-b74="mid">Mitte neu</button><span class="eseg">${[["sanft", "sanft"], ["normal", "normal"], ["stark", "stark"]].map(([v, n]) => `<button data-b74="sens:${v}" aria-pressed="${C.sens === v}">${n}</button>`).join("")}</span><button class="eb tg" data-b74="ilr" aria-pressed="${C.ilr}" aria-label="Links und rechts vertauschen">↔ umkehren</button><button class="eb tg" data-b74="ifb" aria-pressed="${C.ifb}" aria-label="Vor und zurück vertauschen">↕ umkehren</button></div></div>`); };
  const pt = Beweg.paint.bind(Beweg); Beweg.paint = function () { const r = pt(); try { document.body.classList.toggle("kbw74", this.on); document.querySelectorAll("[data-b74]").forEach(b => { const k = b.dataset.b74; if (k.startsWith("sens:")) b.setAttribute("aria-pressed", this.cfg.sens === k.slice(5)); else if (k === "ilr" || k === "ifb") b.setAttribute("aria-pressed", !!this.cfg[k]); }); } catch (_) {} return r; };
  document.addEventListener("click", e => { const b = e.target.closest && e.target.closest("[data-b74]"); if (!b) return; const k = b.dataset.b74; Hap(8); if (k === "mid") { if (Beweg.on) Beweg.center(); else Beweg.start(); } else if (k.startsWith("sens:")) Beweg.setCfg("sens", k.slice(5)); else { Beweg.setCfg(k, !Beweg.cfg[k]); Beweg.zero = null; } }); }

/* ---------- 3) Live-Fläche: 3. Finger = Zerhacker im Takt, 4. Finger = Stille, Leuchtspur ---------- */
Live70.gate = false; Live70.tr = [];
Live70.gateSet = function (on) { on = !!on; if (this.gate === on) return; this.gate = on; try { const N = Wucht.n; if (N && !on) { const g = N.cut.gain, t = Engine.ctx.currentTime; g.cancelScheduledValues(t); g.setTargetAtTime(this.hold.cut ? 0 : 1, t, 0.008); } } catch (_) {} const b = $("lv70") && $("lv70").querySelector('[data-lh="gate"]'); if (b) b.classList.toggle("q7on", on); };
// jede Sechzehntel: erste Hälfte offen, zweite zu
{ const os = Transport.onStep.bind(Transport); Transport.onStep = function (step, time) { try { if (Live70.on && Live70.gate && !Live70.hold.cut && Wucht.n) { const g = Wucht.n.cut.gain, h = Transport.spb * 0.5; g.cancelScheduledValues(time); g.setValueAtTime(1, time); g.setValueAtTime(0, time + h); Live70.nGate = (Live70.nGate || 0) + 1; } } catch (_) {} return os(step, time); }; }
Live70.mtUpdate = function () {
  const n = this.X.length;
  if (n >= 1) { const [mx, my, sz] = this.mainXY(), a = this.echoFor(Math.hypot(this.X[0].x - mx, this.X[0].y - my), sz); if (!this.hold.echo) this.holdSet("echo", true); this.mtEcho = true; this.mtAmt = a; Wucht.echoAmt(a); }
  else if (this.mtEcho) { this.mtEcho = false; this.mtAmt = 0; this.holdSet("echo", false); }
  const cut = n >= 3, gate = n === 2;
  if (cut !== !!this.mtCut) { this.mtCut = cut; if (cut) this.gateSet(false); this.holdSet("cut", cut); }
  if (gate !== !!this.mtGate) { this.mtGate = gate; this.hold.gate = gate; this.gateSet(gate); }
};
{ const hs = Live70.holdSet.bind(Live70); Live70.holdSet = function (k, on) { if (k !== "gate") return hs(k, on); if (!!this.hold.gate === !!on) return; this.hold.gate = !!on; Hap(on ? 12 : 6); this.gateSet(on); };
  const bd = Live70.bind.bind(Live70); Live70.bind = function (el) { bd(el);
    el.addEventListener("pointerdown", e => { if (!e.target.closest("#lvPad") || this.pid == null || this.pid === e.pointerId || this.X.length !== 2 || this.X.some(q => q.id === e.pointerId)) return; this.X.push({ id: e.pointerId, x: e.clientX, y: e.clientY }); try { $("lvPad").setPointerCapture(e.pointerId); } catch (_) {} e.preventDefault(); this.mtUpdate(); }); };
  const rn = Live70.render.bind(Live70); Live70.render = function () { const r = rn(); try { this.mtGate = false; this.gate = false; this.tr = []; const e = this.el(), bt = e.querySelector(".lvbot");
      if (bt && !bt.querySelector('[data-lh="gate"]')) { const ec = bt.querySelector('[data-lh="echo"]'); if (ec) ec.insertAdjacentHTML("afterend", `<button class="lvh" data-lh="gate" aria-label="Hacken – solange du hältst: die Musik wird im Takt zerhackt"><b>Hacken</b><small>halten</small></button>`); bt.classList.add("q7four"); }
      if (!e.querySelector("#lvMid")) e.insertAdjacentHTML("beforeend", `<button class="lvmid" id="lvMid" data-b74="mid" aria-label="Mitte neu setzen: so, wie du das Gerät jetzt hältst">Mitte neu</button>`);
      const h = $("lvHint"); if (h) h.innerHTML = "Leg den Finger auf die Fläche und zieh:<br><b>hoch</b> = mehr Band · <b>rechts</b> = heller<br><b>2. Finger</b> = Echo · <b>3.</b> = Zerhacker · <b>4.</b> = Stille"; } catch (_) {} return r; };
  const cl = Live70.close.bind(Live70); Live70.close = function (...a) { try { this.gateSet(false); this.mtGate = false; this.hold.gate = false; } catch (_) {} return cl(...a); };
  const dr = Live70.draw.bind(Live70); Live70.draw = function () { const r = dr(); try { const cv = $("lvCv"); if (!cv) return r; const g = cv.getContext("2d"), d = this.dpr || 1, R = cv.getBoundingClientRect(), [mx, my] = this.mainXY(), px = (mx - R.left) * d, py = (my - R.top) * d, T = this.tr;
      if (!T.length || Math.hypot(T[T.length - 1][0] - px, T[T.length - 1][1] - py) > 2) T.push([px, py, performance.now()]); const now = performance.now(); while (T.length && (now - T[0][2] > 650 || T.length > 40)) T.shift();
      if (T.length > 2) { g.save(); g.globalCompositeOperation = "lighter"; g.lineCap = "round"; g.lineJoin = "round"; for (let i = 1; i < T.length; i++) { const a = 1 - (now - T[i][2]) / 650; if (a <= 0) continue; g.strokeStyle = `rgba(255,255,255,${0.5 * a})`; g.lineWidth = (2 + 16 * a) * d; g.beginPath(); g.moveTo(T[i - 1][0], T[i - 1][1]); g.lineTo(T[i][0], T[i][1]); g.stroke(); } g.restore(); }
      if (this.gate) { g.save(); g.globalCompositeOperation = "lighter"; g.fillStyle = `rgba(255,215,107,${0.1 + 0.12 * Math.abs(Math.sin(now / 60))})`; g.fillRect(0, 0, cv.width, cv.height); g.restore(); } } catch (_) {} return r; }; }

/* ---------- 4) Klangschrift: mit zwei Fingern auf- und zuziehen = mehr oder weniger Takte zeigen ---------- */
Schrift.perWant = 0; Schrift.Z = new Map();
{ const lo = Schrift.layout.bind(Schrift); Schrift.layout = function () { lo(); const w = this.perWant; if (!w) return; const e = this.el(), W = Math.min(e.clientWidth || innerWidth, 1180); this.per = Math.min(this.L, w); this.page = clamp(Math.floor(this.page / this.per) * this.per, 0, Math.max(0, this.L - this.per)); this.cw = Math.max(4, Math.floor((W - this.lw - 28) / (this.per * 16) * 100) / 100); };
  Schrift.zoom = function (dir) { const cur = this.per, to = dir > 0 ? (cur >= 4 ? 4 : cur * 2) : Math.max(1, cur >> 1), cap = Math.min(4, Math.max(1, this.L)); const want = Math.min(to, cap >= 4 ? 4 : cap >= 2 ? 2 : 1); if (want === cur) return false; this.perWant = want; Hap(8); this.render(); return true; };
  const rn = Schrift.render.bind(Schrift); Schrift.render = function () { const r = rn(); try { this.Z.clear(); const b = this.el().querySelector(".knbar"); if (b && this.f && this.L > 1 && !b.querySelector(".kn74z")) b.insertAdjacentHTML("beforeend", `<span class="eseg kn74z" aria-label="So viele Takte auf einmal zeigen">${[1, 2, 4].filter(k => k <= this.L).map(k => `<button data-kz="${k}" aria-pressed="${this.per === k}" aria-label="${k} ${k === 1 ? "Takt" : "Takte"} zeigen">🔍 ${k}</button>`).join("")}</span>`); } catch (_) {} return r; };
  const bd = Schrift.bind.bind(Schrift); Schrift.bind = function (el) { bd(el);
    el.addEventListener("click", e => { const b = e.target.closest("[data-kz]"); if (!b) return; this.perWant = +b.dataset.kz; Hap(); this.render(); });
    el.addEventListener("pointerdown", e => { if (!e.target.closest("#knGrid")) return; this.Z.set(e.pointerId, { x: e.clientX, x0: e.clientX }); const D = this.drags.get(e.pointerId); if (D && D.ev) D.o = { s: D.ev.s, d: D.ev.d, m: D.ev.m, z: D.ev.z, u: D.ev.u }; });
    el.addEventListener("pointermove", e => { const q = this.Z.get(e.pointerId); if (!q) return; q.x = e.clientX; if (this.Z.size !== 2) return; const [a, b] = [...this.Z.values()], d0 = Math.abs(a.x0 - b.x0), d1 = Math.abs(a.x - b.x); if (d0 < 30) return; const k = d1 / d0; if (k < 1.4 && k > 0.7) return;
      if ((a.x - a.x0) * (b.x - b.x0) > 0) return;                                                                          // beide Finger in dieselbe Richtung: Töne verschieben, kein Zoom
      for (const D of this.drags.values()) { if (D.g) D.g.remove(); if (D.ev && D.o) Object.assign(D.ev, D.o); } this.drags.clear();   /* angefasste Töne zurück an ihren Platz */ this.Z.clear(); if (!this.zoom(k > 1 ? -1 : 1)) this.notes(); });
    const up = e => this.Z.delete(e.pointerId); el.addEventListener("pointerup", up); el.addEventListener("pointercancel", up); }; }

/* ---------- 5) Dreh-Leiste: „alle“ – Stopp, Tempo und Richtung für alle Formen zugleich ---------- */
Dreh73.all = false;
Dreh73.targets = function (f) { return this.all ? Forms.list.filter(x => x && !x.empty && !x.remote) : [f]; };
{ const ht = Dreh73.html.bind(Dreh73); Dreh73.html = function (f) { const n = Forms.list.filter(x => x && !x.empty && !x.remote).length; return ht(f) + (n > 1 ? `<button class="dr74a" data-dr="all" aria-pressed="${this.all}" aria-label="Alle Formen zugleich steuern: ${this.all ? "an" : "aus"}">alle</button>` : ""); };
  const ac = Dreh73.act.bind(Dreh73); Dreh73.act = function (k, f = Forms.active) {
    if (k === "all") { this.all = !this.all; Hap(8); const el = $("dr73"); if (el) el.dataset.sg = ""; UI.toast(this.all ? "Alle: Stopp, Tempo und Richtung gelten jetzt für alle Formen zugleich" : "Die Leiste steuert wieder nur die gewählte Form", 2400); return this.paint(); }
    if (!this.all || !f || f.empty) return ac(k, f);
    const T = this.targets(f), S = this.state(f); Hap(8);
    try { for (const x of T) {
        if (k === "pp") { if (S.mv) { if (!x.still && (this.rpb(x) > 0 || Motion.moves(x))) this.stop(x); } else if (x.still) Motion.resume(x); else if (!(this.rpb(x) > 0)) Move.setR(x, 1, { soft: false }); }
        else if (k === "flip") { const p = Motion.ph(x), w = Motion.tw(x, "y") || p.wy; if (x.still) Motion.resume(x); x.mot.dreh = 0; Motion.glideTo(x, "y", w ? -w : -Motion.wOfR(1), { soft: false }); if (p.lk) p.lk.y = null; }
        else if (k.startsWith("r:")) Move.setR(x, +k.slice(2), { soft: false }); }
      if (k !== "pp" || !S.mv) { if (!Transport.running && Engine.ctx) Transport.start(); } } catch (e) { console.warn(e); }
    Save.soon(); try { UI.soon(); } catch (_) {} this.paint(); };
  const pt = Dreh73.paint.bind(Dreh73); Dreh73.paint = function () { const r = pt(); try { const el = $("dr73"), on = !!el && !el.hidden; document.body.classList.toggle("kdr73", on); if (on && String(this.all) !== el.dataset.all) { el.dataset.all = String(this.all); el.dataset.sg = ""; pt(); } } catch (_) {} return r; }; }

Help.T.push({ id: "v74", ic: "🎛", t: "Start einstellen, mehr Finger, alle Formen steuern", k: "start einstellen kalibrieren vorlage zufall lage tief hoch kanon nacheinander wer spielt mit dreh tempo empfindlichkeit umkehren mitte neu zerhacker hacken vier finger zoom takte zeigen zwei finger alle formen zugleich",
  h: `<p><b>Neues Stück – der Start noch genauer:</b> Im Abschnitt „Start-Melodie“ gibt es jetzt <b>Vorlagen</b> und <b>Zufall</b>, drei <b>Lagen</b> (tief, mittel, hoch) und „So startet das Stück“: <b>wer mitspielt</b> (jede Form einzeln), <b>Drehungen je Takt</b> (¼ bis 2), <b>zusammen oder nacheinander</b> (Kanon: jede weitere Form setzt zwei Töne später ein) und ob das Stück <b>sofort spielt</b> oder auf dich wartet.</p>
  <p><b>Bewegung einstellen</b> (Mischen → Bewegung): <b>Empfindlichkeit</b> sanft, normal, stark · <b>↔ / ↕ umkehren</b>, falls sich Kippen verkehrt herum anfühlt · <b>Mitte neu</b> – auch als Knopf in der Live-Fläche.</p>
  <p><b>Live-Fläche:</b> zweiter Finger = Echo, <b>dritter Finger = Zerhacker</b> (die Musik wird im Takt zerhackt), <b>vierter Finger = Stille</b>. Der Punkt zieht eine Leuchtspur. „Hacken“ gibt es auch als Knopf zum Halten.</p>
  <p><b>Klangschrift:</b> Mit zwei Fingern im Notenfeld <b>zusammenziehen</b> zeigt mehr Takte, <b>auseinanderziehen</b> weniger. Dasselbe machen die Knöpfe 🔍 1 · 2 · 4.</p>
  <p><b>Dreh-Leiste – alle:</b> Der Schalter „alle“ lässt Stopp, Tempo und Richtung für alle Formen zugleich gelten – so laufen sie im Gleichschritt.</p>` });
