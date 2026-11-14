/* ================= Version 77: Dreh-Knopf zum Ein- und Ausblenden · Gesten ================= */
/* ---------- 1) Anzeige für erkannte Gesten ---------- */
I67.geste = `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="8" cy="9" r="2.6"/><circle cx="16.5" cy="13.5" r="2.6"/><path d="M4 16.5c2.2 3.4 6.4 4.6 10 3.2M20 6.5C17.8 3.4 13.8 2.3 10.300 3.500"/></svg>`;
I67.zu = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>`;
const Hud77 = {
  t: 0,
  el() { let e = $("g77"); if (!e) { e = document.createElement("div"); e.id = "g77"; e.className = "g77"; e.hidden = true; e.setAttribute("role", "status"); e.setAttribute("aria-live", "polite"); document.body.appendChild(e); } return e; },
  /* pos: Stelle auf der Tempo-Reihe (0…10) oder null */
  show(ic, t, s, pos = null, ms = 1100) {
    const e = this.el();
    e.innerHTML = `<i>${ic || ""}</i><b>${esc(t)}</b>${s ? `<small>${esc(s)}</small>` : ""}${pos == null ? "" : `<span class="g77d" aria-hidden="true">${Dreh77.V.map((v, i) => `<u class="${i === pos ? "on" : ""}${v === 0 ? " z" : ""}"></u>`).join("")}</span>`}`;
    e.hidden = false; clearTimeout(this.t); this.t = setTimeout(() => { e.hidden = true; }, ms);
  },
  hide() { clearTimeout(this.t); const e = $("g77"); if (e) e.hidden = true; }
};

/* ---------- 2) Dreh-Knopf: klein, aufklappbar, ganz ausblendbar ---------- */
const Dreh77 = {
  V: [-4, -2, -1, -0.5, -0.25, 0, 0.25, 0.5, 1, 2, 4],   /* eine Reihe: rückwärts – Stopp – vorwärts */
  mode: "mini", open: false, used: 0, drag: null, guard: 0, AUTO: 8000,
  init() { const m = store.get("dr77"); this.mode = m === "auf" || m === "weg" ? m : "mini"; this.open = false; },
  name(v) { if (!v) return "Stopp"; const a = Math.abs(v), r = Dreh73.R.find(x => x[0] === a); return r ? r[1] : String(Math.round(a * 100) / 100).replace(".", ","); },
  say(v) { return v ? `${this.name(v)} je Takt · ${v < 0 ? "linksherum" : "rechtsherum"}` : "angehalten"; },
  /* Stelle der Form auf der Reihe V */
  idxOf(S) { if (!S || !S.mv || !(S.r > 0)) return 5; let i = S.i; if (!(i >= 0)) { let bd = 1e9; Dreh73.R.forEach(([x], j) => { const d = Math.abs(Math.log2(S.r / x)); if (d < bd) { bd = d; i = j; } }); } return 5 + (S.dir < 0 ? -1 : 1) * (i + 1); },
  idx(f) { try { return this.idxOf(Dreh73.state(f)); } catch (_) { return 5; } },
  step(i0, n) { return Math.max(0, Math.min(this.V.length - 1, i0 + n)); },
  /* Tempo und Richtung genau setzen (0 = sofort anhalten) – für die Form oder, bei „alle“, für alle */
  apply(f, v) {
    if (!f || f.empty) return;
    let T = [f]; try { T = Dreh73.targets(f); } catch (_) {}
    for (const x of T) { try {
      if (!v) { if (!x.still && (Dreh73.rpb(x) > 0 || Motion.moves(x))) Dreh73.stop(x); continue; }
      Move.setR(x, Math.abs(v), { soft: false });
      if (Dreh73.dir(x) !== Math.sign(v)) { const p = Motion.ph(x), w = Motion.tw(x, "y") || p.wy; x.mot.dreh = 0; Motion.glideTo(x, "y", w ? -w : Math.sign(v) * Motion.wOfR(Math.abs(v)), { soft: false }); if (p.lk) p.lk.y = null; }
    } catch (e) { console.warn(e); } }
    try { Save.soon(); UI.soon(); } catch (_) {} this.fresh();
  },
  hud(f, i) { const v = this.V[i]; Hud77.show(v ? `<span class="${v < 0 ? "q7l" : ""}">${I67.dreh}</span>` : I67.stop, (Dreh73.all ? "Alle Formen" : f.name), v ? this.say(v) : "angehalten", i, 1300); },
  expanded() { return this.mode === "auf" || (this.mode === "mini" && this.open); },
  fresh() { try { const el = $("dr73"); if (el) el.dataset.sg = ""; Dreh73.paint(); } catch (_) {} },
  set(m, quiet) {
    this.mode = m === "auf" || m === "weg" ? m : "mini"; this.open = false; this.used = performance.now(); store.set("dr77", this.mode); this.fresh();
    if (!quiet) { if (this.mode === "weg") UI.toastAct("Dreh-Knopf ausgeblendet · Gesten steuern weiter (Mehr → Alles → Gesten)", "Zurückholen", () => Dreh77.set("mini", true), 5200); }
    try { Gest77.sync(); } catch (_) {}
  },
  chip(f) { const S = Dreh73.state(f), i = this.idxOf(S), v = this.V[i], on = S.mv && S.r > 0;
    return `<button class="dr77c" data-dr="open" aria-pressed="${on}" aria-label="Dreh-Knopf: ${esc(f.name)} ${on ? this.say(v) : S.still ? "angehalten" : S.mv ? "bewegt sich" : "steht"}. Antippen öffnet die Leiste, hoch oder runter ziehen ändert das Tempo, lange drücken blendet den Knopf aus"><i class="${S.dir < 0 ? "q7l" : ""}">${on ? I67.dreh : S.still ? I67.stop : I67.play}</i><b>${on ? this.name(v) : S.still ? "Stopp" : S.mv ? "läuft" : "steht"}</b></button>`; },
  /* Knopf: tippen = aufklappen · ziehen = Tempo · lange drücken = ausblenden */
  bind() {
    const el = Dreh73.el(); if (el.dataset.b77) return; el.dataset.b77 = "1";
    el.addEventListener("pointerdown", e => {
      this.used = performance.now(); if (this.expanded() || this.drag) return; const f = Forms.active; if (!f || f.empty) return;
      try { el.setPointerCapture(e.pointerId); } catch (_) {} e.preventDefault();
      const i0 = this.idx(f), d = this.drag = { id: e.pointerId, y0: e.clientY, t0: performance.now(), f, i0, i: i0, dial: false, long: false };
      d.hold = setTimeout(() => { if (this.drag === d && !d.dial) { d.long = true; Hap(14); this.drag = null; try { el.releasePointerCapture(d.id); } catch (_) {} this.guard = performance.now() + 500; this.set("weg"); } }, 650);
    });
    el.addEventListener("pointermove", e => {
      const d = this.drag; if (!d || d.id !== e.pointerId) return; const dy = d.y0 - e.clientY;
      if (!d.dial) { if (Math.abs(dy) > 6) clearTimeout(d.hold); if (Math.abs(dy) < 12) return; d.dial = true; clearTimeout(d.hold); d.y0 = e.clientY + Math.sign(dy) * 12; }
      const i = this.step(d.i0, Math.round((d.y0 - e.clientY) / 24));
      if (i !== d.i) { d.i = i; Hap(6); this.apply(d.f, this.V[i]); } this.hud(d.f, d.i);
    });
    const end = e => {
      const d = this.drag; if (!d || d.id !== e.pointerId) return; clearTimeout(d.hold); this.drag = null; this.guard = performance.now() + 400;
      if (!d.dial && !d.long && e.type === "pointerup") { Hap(8); this.open = true; this.used = performance.now(); }
      this.fresh();
    };
    el.addEventListener("pointerup", end); el.addEventListener("pointercancel", end);
  }
};
Dreh77.init();
{ const ht = Dreh73.html.bind(Dreh73); /* Dreh73.html(f) bleibt die Leiste – nur beim Zeichnen des eingeklappten Knopfs kommt der Knopf */
  Dreh73.html = function (f) { return Dreh77.expanded() || !Dreh77.inPaint ? ht(f) + `<button class="dr77x" data-dr="mini" aria-label="Dreh-Leiste einklappen">${I67.zu}</button>` : Dreh77.chip(f); };
  const sh = Dreh73.show.bind(Dreh73); Dreh73.show = function () { return Dreh77.mode !== "weg" && sh(); };
  const ac = Dreh73.act.bind(Dreh73); Dreh73.act = function (k, ...a) {
    if (k === "open" || k === "mini") { if (performance.now() < Dreh77.guard) return; Hap(8); Dreh77.used = performance.now(); if (k === "mini" && Dreh77.mode === "auf") return Dreh77.set("mini", true); Dreh77.open = k === "open"; return Dreh77.fresh(); }
    if (performance.now() < Dreh77.guard && a.length === 0) return;   /* kein Geister-Tipp direkt nach dem Aufklappen */
    Dreh77.used = performance.now(); return ac(k, ...a); };
  const pt = Dreh73.paint.bind(Dreh73); Dreh73.paint = function () {
    try { Dreh77.bind(); const el = $("dr73"), ex = Dreh77.expanded();
      if (Dreh77.mode === "mini" && Dreh77.open && performance.now() - Dreh77.used > Dreh77.AUTO && !el.matches(":hover")) { Dreh77.open = false; el.dataset.sg = ""; }
      const mini = !Dreh77.expanded(); if (el.classList.contains("dr77m") !== mini) { el.classList.toggle("dr77m", mini); el.dataset.sg = ""; } void ex;
      if (Dreh77.drag) { /* während des Ziehens bleibt der Knopf stehen */ const b = el.querySelector(".dr77c b"); if (b) b.textContent = Dreh77.name(Dreh77.V[Dreh77.drag.i]); return; }
    } catch (_) {}
    Dreh77.inPaint = true; try { return pt(); } finally { Dreh77.inPaint = false; } }; }

/* ---------- 3) Gesten: mehrere Finger verstehen ---------- */
const Gest77 = {
  on: true, S: null, K: 1,   /* K: Zeitmaß (nur für Prüfungen auf sehr langsamen Rechnern größer) */
  init() { this.on = store.get("g77") !== false; },
  set(v) { this.on = !!v; store.set("g77", this.on); if (!this.on) this.S = null; this.sync(); UI.toast(this.on ? "Gesten an" : "Gesten aus – Finger auf den Formen spielen und drehen wie bisher", 2200); },
  beside(p) { return !!p && (p.kind === "empty" || p.kind === "gest" || p.kind === "plat"); },
  /* Zeit der Berührung selbst (nicht die der Verarbeitung) – so zählt ein kurzer Tipp auch auf langsamen Geräten als kurz */
  ts(e) { return e && e.timeStamp > 0 ? e.timeStamp : performance.now(); },
  norm(a) { return Math.atan2(Math.sin(a), Math.cos(a)); },
  /* Tipp mit zwei oder drei Fingern neben den Formen */
  tapKind(n, allBeside, moved, dur, gap) { if (!allBeside || moved) return null; const k = this.K || 1; if (n === 2 && dur < 380 * k && gap < 260 * k) return "form"; if (n === 3 && dur < 480 * k && gap < 320 * k) return "alle"; return null; },
  /* zwei Finger drehen sich umeinander (und werden dabei nicht wesentlich enger oder weiter) */
  isTwist(da, ratio, d0) { return d0 > 40 && Math.abs(da) > 0.38 && ratio > 0.72 && ratio < 1.38 && Math.abs(da) > 1.5 * Math.abs(ratio - 1); },
  onDown(e, n0) {
    if (!this.on || !App.started) return; const p = Input.P.get(e.pointerId); if (!p) return; const now = this.ts(e);
    if (n0 === 0 || !this.S) this.S = { t0: now, tl: now, max: 0, moved: false, pts: new Map(), allBeside: true, dial: null, done: false, zoom0: Scene.user.zoom, px0: Scene.user.px, py0: Scene.user.py };
    const S = this.S; S.pts.set(p.id, { x0: p.x, y0: p.y, x: p.x, y: p.y, moved: false }); S.max = Math.max(S.max, Input.P.size); S.tl = now;
    if (!this.beside(p)) S.allBeside = false;
    if (Input.P.size === 2) { const [a, b] = [...Input.P.values()], A = S.pts.get(a.id), B = S.pts.get(b.id); if (A && B) { S.a0 = Math.atan2(b.y - a.y, b.x - a.x); S.d0 = Math.hypot(b.x - a.x, b.y - a.y); S.pair = [a.id, b.id]; } }
  },
  onMove(e) {
    const S = this.S; if (!S || !this.on) return; const p = Input.P.get(e.pointerId), sp = S.pts.get(e.pointerId); if (!p || !sp) return;
    sp.x = p.x; sp.y = p.y; if (!sp.moved && Math.hypot(sp.x - sp.x0, sp.y - sp.y0) > 14) { sp.moved = true; S.moved = true; }
    if (S.done) return;
    if (S.dial) return this.dialMove();
    if (S.max === 2 && Input.P.size === 2 && S.pair) {
      const a = Input.P.get(S.pair[0]), b = Input.P.get(S.pair[1]); if (!a || !b) return;
      const ang = Math.atan2(b.y - a.y, b.x - a.x), d = Math.hypot(b.x - a.x, b.y - a.y), da = this.norm(ang - S.a0), ratio = d / Math.max(1, S.d0);
      /* neben den Formen: wie einen Knopf drehen = Tempo der gewählten Form */
      if (S.allBeside && Input.gest && !Input.gest.switched && Scene.view !== "raum" && this.isTwist(da, ratio, S.d0)) {
        const f = Forms.active; if (!f || f.empty || f.remote) return;
        Input.gest.switched = true; Scene.user.zoom = S.zoom0; Scene.user.px = S.px0; Scene.user.py = S.py0; Scene.camFast = false; try { UI.zoomBtn(); } catch (_) {}
        const i0 = Dreh77.idx(f); S.dial = { f, i0, i: i0, la: ang, acc: 0, n0: Math.sign(da) }; return this.dialMove();
      }
    }
  },
  dialMove() {
    const S = this.S, D = S.dial, a = Input.P.get(S.pair[0]), b = Input.P.get(S.pair[1]); if (!a || !b) return;
    const ang = Math.atan2(b.y - a.y, b.x - a.x); D.acc += this.norm(ang - D.la); D.la = ang;
    const i = Dreh77.step(D.i0, D.n0 + Math.trunc(D.acc / 0.4));
    if (i !== D.i) { D.i = i; Hap(6); Dreh77.apply(D.f, Dreh77.V[i]); }
    Dreh77.hud(D.f, D.i);
  },
  /* eine Form (oder bei „alle“ in der Leiste: alle) anhalten oder weiterdrehen */
  toggle(f, single) {
    if (!f || f.empty) return; const was = Dreh73.all; if (single) Dreh73.all = false;
    try { const mv = Dreh73.state(f).mv; Dreh73.act("pp", f); Hud77.show(mv ? I67.stop : I67.play, f.name, mv ? "angehalten" : "dreht weiter"); } finally { Dreh73.all = was; }
  },
  allToggle() {
    const L = Forms.list.filter(f => f && !f.empty && !f.remote), mv = L.filter(f => !f.still && (Dreh73.rpb(f) > 0 || Motion.moves(f)));
    if (mv.length) { for (const f of mv) Dreh73.stop(f); Hud77.show(I67.stop, "Alle Formen", mv.length === 1 ? "eine angehalten" : `${mv.length} angehalten`); }
    else { const st = L.filter(f => f.still); for (const f of st) Motion.resume(f); if (st.length && !Transport.running && Engine.ctx) Transport.start(); Hud77.show(I67.play, "Alle Formen", st.length ? (st.length === 1 ? "eine dreht weiter" : `${st.length} drehen weiter`) : "nichts in Bewegung"); }
    Hap(10); try { Save.soon(); UI.refresh(); } catch (_) {} Dreh77.fresh(); return mv.length;
  },
  onUp(e, had) {
    const S = this.S; if (!S || !had) return; S.pts.delete(e.pointerId);
    if (Input.P.size > 0) return; this.S = null; if (!this.on) return;
    if (S.dial) { try { Save.soon(); } catch (_) {} return; }
    if (S.done) return;
    const k = this.tapKind(S.max, S.allBeside, S.moved, this.ts(e) - S.t0, S.tl - S.t0);
    if (k === "form") { const f = Forms.active; if (f && !f.empty && !f.remote) this.toggle(f); }
    else if (k === "alle") this.allToggle();
    if (k && !store.get("g77hint")) { store.set("g77hint", true); UI.toastAct("Geste erkannt · alle Gesten ansehen?", "Gesten", () => Gest77.open(), 4200); }
  },
  /* kleine Bilder für die Übersicht */
  pic(k) {
    const dot = (x, y) => `<circle cx="${x}" cy="${y}" r="4.2" class="g77f"/>`, s = p => `<svg viewBox="0 0 44 44" aria-hidden="true">${p}</svg>`;
    if (k === "t2") return s(dot(16, 22) + dot(28, 22) + `<path d="M10 12l-3-3M34 12l3-3M22 9V5"/>`);
    if (k === "t3") return s(dot(12, 24) + dot(22, 18) + dot(32, 24) + `<path d="M8 12l-3-3M36 12l3-3M22 8V4"/>`);
    if (k === "tw") return s(dot(14, 28) + dot(30, 16) + `<path d="M9 18c1-6 6-10 12-11M35 26c-1 6-6 10-12 11M18 5l3 2-2 3M26 39l-3-2 2-3"/>`);
    if (k === "sp") return s(`<circle cx="22" cy="22" r="9" class="g77o"/>` + dot(22, 13) + dot(14, 27) + dot(30, 27) + `<path d="M22 7V3M9 31l-3 3M35 31l3 3"/>`);
    if (k === "ro") return s(`<circle cx="22" cy="22" r="15" class="g77o"/>` + dot(15, 27) + dot(29, 17) + `<path d="M12 19c1-3 3-5 6-6M32 25c-1 3-3 5-6 6"/>`);
    if (k === "pi") return s(dot(13, 31) + dot(31, 13) + `<path d="M17 27l5-5M27 17l-5 5M22 22h-4M22 22v4"/>`);
    if (k === "sw") return s(`<circle cx="22" cy="22" r="13" class="g77o"/>` + dot(16, 22) + `<path d="M21 22h14M31 18l4 4-4 4"/>`);
    if (k === "kn") return s(`<circle cx="22" cy="22" r="11" class="g77o"/><path d="M22 6v-3M22 41v-3M19 6l3-3 3 3M19 38l3 3 3-3"/>` + dot(22, 22));
    return s(dot(22, 22));
  },
  L: [
    ["Neben den Formen", [
      ["t2", "Mit zwei Fingern tippen", "Die gewählte Form hält sofort an – nochmal tippen: sie dreht weiter."],
      ["t3", "Mit drei Fingern tippen", "Alle Formen halten an – nochmal tippen: alle drehen weiter."],
      ["tw", "Zwei Finger drehen wie einen Knopf", "Tempo der gewählten Form: rechtsherum schneller, linksherum langsamer – über Stopp hinaus dreht sie rückwärts."],
      ["pi", "Zwei Finger zusammen oder auseinander", "Näher heran, alle Formen zeigen, in den Raum wechseln – das geht auch auf den Formen."]]],
    ["Auf einer Form", [
      ["sw", "Tippen, halten, wischen", "Tippen und halten spielt Töne (mehrere Finger = mehrere Töne). Wischen dreht die Form und schubst sie an."],
      ["ro", "Zwei Finger gegeneinander drehen", "Die Form rollt – das verändert den Raumklang."],
      ["sp", "Drei Finger auseinanderziehen", "Nur diese Form hören. Drei Finger zusammenziehen: alle wieder dabei."]]],
    ["Am Dreh-Knopf", [
      ["kn", "Tippen · ziehen · lange drücken", "Tippen klappt die Leiste auf. Hoch oder runter ziehen ändert das Tempo. Lange drücken blendet den Knopf aus."]]]
  ],
  html() {
    return `<div class="g77row"><span><b>Gesten</b><small>Tippen und Drehen mit mehreren Fingern</small></span><button class="b72sw" data-g7="tog" role="switch" aria-checked="${this.on}" aria-label="Gesten mit mehreren Fingern"><i></i></button></div>
      <div class="g77row"><span><b>Dreh-Knopf</b><small id="g77dkS">${this.dkSay()}</small></span><span class="g77seg" role="group" aria-label="Dreh-Knopf anzeigen">${[["mini", "Knopf"], ["auf", "Leiste"], ["weg", "aus"]].map(([k, n]) => `<button data-g7="dk:${k}" aria-pressed="${Dreh77.mode === k}">${n}</button>`).join("")}</span></div>
      ${this.L.map(([h, rows]) => `<h3 class="g77h">${h}</h3><div class="g77l">${rows.map(([k, t, d]) => `<div class="g77r"><i>${this.pic(k)}</i><span><b>${t}</b><small>${d}</small></span></div>`).join("")}</div>`).join("")}`;
  },
  dkSay() { return Dreh77.mode === "auf" ? "Die Leiste bleibt immer offen" : Dreh77.mode === "weg" ? "Ausgeblendet – Gesten steuern weiter" : "Kleiner Knopf, klappt bei Bedarf auf"; },
  open() { Hap(8); Sheets.open("Gesten", Sheets.head("Gesten und Dreh-Knopf") + `<div id="g77S">${this.html()}</div>`); },
  sync() { const b = $("g77S"); if (b) b.innerHTML = this.html(); }
};
Gest77.init();
document.addEventListener("click", e => { const b = e.target.closest && e.target.closest("[data-g7]"); if (!b) return; const k = b.dataset.g7; Hap(8); if (k === "tog") Gest77.set(!Gest77.on); else if (k.startsWith("dk:")) Dreh77.set(k.slice(3), true); });
{ const dn = Input.down.bind(Input); Input.down = function (e) { const n0 = this.P.size, r = dn(e); try { Gest77.onDown(e, n0); } catch (x) { console.warn(x); } return r; };
  const mv = Input.move.bind(Input); Input.move = function (e) { const r = mv(e); try { Gest77.onMove(e); } catch (x) { console.warn(x); } return r; };
  const up = Input.up.bind(Input); Input.up = function (e) { const had = this.P.has(e.pointerId), r = up(e); try { Gest77.onUp(e, had); } catch (x) { console.warn(x); } return r; }; }
try { Alles73.MAKE.push(["gesten", "geste", "Gesten", "Was Finger können · Dreh-Knopf ein- und ausblenden"]); const ac = Alles73.act.bind(Alles73); Alles73.act = function (k) { if (k === "mk:gesten") { UI.hideSheets(); return setTimeout(() => Gest77.open(), 80); } return ac(k); }; } catch (_) {}
try { Erkl.T.push(["#dr73", "Dreh-Knopf", "Zeigt, wie schnell sich die gewählte Form dreht. Antippen klappt die Leiste auf (Stopp, Tempo, Richtung, alle). Hoch oder runter ziehen ändert das Tempo direkt. Lange drücken blendet den Knopf aus – zurück über Mehr → Alles → Gesten."]); } catch (_) {}
Help.T.push({ id: "v77", ic: "✌", t: "Gesten und der Dreh-Knopf", k: "gesten geste multitouch zwei finger drei finger tippen drehen knopf tempo geschwindigkeit regler ausblenden einklappen leiste stopp anhalten weiter rückwärts",
  h: `<p><b>Dreh-Knopf:</b> Unten links sitzt nur noch ein kleiner runder Knopf. <b>Antippen</b> klappt die Leiste auf (Stopp, ¼ bis 4 Umdrehungen je Takt, Richtung, „alle“); sie klappt nach ein paar Sekunden von selbst wieder ein, der Pfeil rechts klappt sie sofort ein. <b>Hoch oder runter ziehen</b> ändert das Tempo direkt. <b>Lange drücken</b> blendet den Knopf ganz aus.</p>
  <p><b>Gesten neben den Formen:</b> Mit <b>zwei Fingern tippen</b> = die gewählte Form hält an oder dreht weiter. Mit <b>drei Fingern tippen</b> = alle Formen. <b>Zwei Finger drehen</b> wie einen Knopf = Tempo: rechtsherum schneller, linksherum langsamer, über Stopp hinaus rückwärts.</p>
  <p><b>Auf einer Form</b> bleibt alles beim Spielen: tippen und halten = Töne, wischen = drehen und anschubsen, zwei Finger gegeneinander drehen = rollen. Deshalb gelten die Tipp-Gesten nur <b>neben</b> den Formen – ein Akkord mit zwei oder drei Fingern hält nichts an.</p>
  <p>Alles zum Nachsehen und zum Abschalten: <b>Mehr → Alles → Gesten</b>. Dort stellst du auch ein, ob der Dreh-Knopf klein, als Leiste oder gar nicht erscheint.</p>` });
