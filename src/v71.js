/* =====================================================================================
   v71: MODELLIEREN MIT ALLEN FINGERN – UND MAN HÖRT ES
   – Klangschrift: jeder Finger setzt seinen eigenen Ton (Akkord mit einem Griff). Töne lassen sich anfassen und
                   verschieben (höher/tiefer, früher/später) oder am rechten Ende länger und kürzer ziehen.
   – Kneten:       jeder Finger knetet für sich (bis zu fünf), und die Form klingt dabei – man hört sofort, was sich ändert.
   – Live-Fläche:  ein zweiter Finger auf der Fläche = Echo.
   – Startseite:   Kachel „Klang kneten“ führt direkt ins Kneten.
   ===================================================================================== */

/* ---------- 1) Kneten: mehrere Finger, mit Ton ---------- */
const Knet71 = {
  GAP: 300,                                    // frühestens so oft (ms) klingt ein knetender Finger neu
  dots: new Map(),
  // soll das Kneten selbst klingen? Nicht, wenn die Form ohnehin gerade ihre Loops spielt oder eine Aufnahme läuft
  can(f) { try { if (!f || f.empty || !Engine.ctx) return false; if (typeof RecGuard !== "undefined" && RecGuard.active()) return false; if (Transport.running && Loops.count(f) > 0 && !f.lpOff && Forms.audible(f)) return false; return true; } catch (_) { return false; } },
  tone(p, u) { this.hush(p); if (!this.can(p.f)) return; try { p.kh = Forms.play(p.f, u == null ? p.u : u, 0.62, { dir: p.dir }); p.kt = performance.now(); p.kx = p.x; p.ky = p.y; this.n = (this.n || 0) + 1; } catch (e) { console.warn(e); } },
  hush(p) { if (p && p.kh) { try { Forms.release(p.kh); } catch (_) {} p.kh = null; } },
  dot(p, on) {
    let d = this.dots.get(p.id);
    if (!on) { if (d) { d.remove(); this.dots.delete(p.id); } return; }
    if (!d) { d = document.createElement("i"); d.className = "kn71dot"; d.setAttribute("aria-hidden", "true"); document.body.appendChild(d); this.dots.set(p.id, d); }
    d.style.transform = `translate(${p.x}px,${p.y}px)`;
  },
  fingers() { return [...Input.P.values()].filter(q => q.kind === "knead"); },
  clear() { for (const d of this.dots.values()) d.remove(); this.dots.clear(); }
};
{ const d0 = Input.down0.bind(Input); Input.down0 = function (e) { const r = d0(e); try { const p = this.P.get(e.pointerId);
      if (p && p.kind === "knead") { Knet71.tone(p); Knet71.dot(p, true); }
      for (const q of this.P.values()) if (q.kind !== "knead" && (q.kh || Knet71.dots.has(q.id))) { Knet71.hush(q); Knet71.dot(q, false); }   // aus Kneten wurde „Größe ändern“
    } catch (err) { console.warn(err); } return r; };
  const dn = Input.down.bind(Input); Input.down = function (e) { const r = dn(e); if (Tools.knead && this.tri) this.tri = null; return r; };   // beim Kneten gehören alle Finger der Form – keine Drei-Finger-Geste
  const mv = Input.move.bind(Input); Input.move = function (e) { const r = mv(e); try { const p = this.P.get(e.pointerId); if (p) { if (p.kind === "knead") { Knet71.dot(p, true);
          if (performance.now() - (p.kt || 0) > Knet71.GAP && Math.hypot(p.x - (p.kx ?? p.x0), p.y - (p.ky ?? p.y0)) > 6) { const h = Scene.hit(p.x, p.y, { only: p.f }); Knet71.tone(p, h ? h.u : p.u); } }
        else if (p.kh || Knet71.dots.has(p.id)) { Knet71.hush(p); Knet71.dot(p, false); } } } catch (err) { console.warn(err); } return r; };
  const up = Input.up.bind(Input); Input.up = function (e) { const p = this.P.get(e.pointerId), kn = p && p.kind === "knead", f = p && p.f; if (p) { Knet71.hush(p); Knet71.dot(p, false); } const r = up(e);
    try { if (kn) { const rest = Knet71.fingers().find(q => q.f === f) || Knet71.fingers()[0]; if (rest) { this.kneadForm = rest.f; this.ind(true, rest.x, rest.y); } } if (!this.P.size) Knet71.clear(); } catch (_) {} return r; }; }
// Hinweise in Worten, die auch Kinder verstehen
{ const md = UI.modes.bind(UI); UI.modes = function (...a) { const r = md(...a); try { const mb = $("modebar"); if (mb && !mb.hidden && Tools.knead && mb.className === "modebar") mb.textContent = "Kneten: drück und zieh an der Form – mit einem Finger oder mit mehreren. Du hörst sofort, wie sich der Klang ändert."; if (!Tools.knead) Knet71.clear(); } catch (_) {} return r; };
  const cp = FBar.caption.bind(FBar); FBar.caption = function () { try { if (this.mode() === "knead") return "Mit einem oder mehreren Fingern drücken und ziehen: rausziehen = Spitze oder Beule, reindrücken = Delle. Zwei Finger zugleich aufsetzen und spreizen = größer."; } catch (_) {} return cp(); }; }
// Startseite: „Klang kneten“ führt direkt ins Kneten
{ const t = Home67.TILES.find(x => x[0] === "play"); if (t) { t[2] = "Klang kneten"; t[3] = "Drücken und ziehen – du hörst es sofort"; }
  const ac = Home67.act.bind(Home67); Home67.act = function (k) { if (k !== "play") return ac(k); Hap(8); UI.setTab("klang");
    if (!this.nForms()) { setTimeout(() => Sheets.seeds(), 150); return; }
    try { const f = Forms.active && !Forms.active.empty ? Forms.active : Forms.list.find(x => !x.empty && !x.remote); if (f) Forms.setActive(f); if (Scene.view !== "nah") UI.setView("nah"); Tools.toggleKnead(true); UI.toast("Drück und zieh an der Form – mit so vielen Fingern, wie du magst. Du hörst, wie sich der Klang ändert.", 3600); } catch (e) { console.warn(e); } }; }

/* ---------- 2) Klangschrift: jeder Finger ein Ton · Töne anfassen, verschieben, längen ---------- */
Schrift.drags = new Map();
Schrift.evAtCell = function (row, step) { const i = this.hit(row, step); return i < 0 ? null : this.t.ev[i]; };
Schrift.remove = function (x) { const t = this.t; if (!t) return; const i = typeof x === "number" ? x : t.ev.indexOf(x); if (i < 0 || !t.ev[i]) return; this.mark(); t.ev.splice(i, 1); Hap(8); Save.soon(); this.notes(); };
Schrift.ghost = function () { const g = $("knGrid"); if (!g) return null; let l = $("knGhost"); if (!l) { l = document.createElement("div"); l.id = "knGhost"; g.appendChild(l); } return l; };
// einen angefassten Ton an eine neue Stelle setzen (Zeile = Tonhöhe bzw. Trommel, Schritt = Zeit)
Schrift.moveEv = function (ev, row, step) {
  const f = this.f, dr = this.drum(f), len = this.L * 16; row = clamp(row, 0, this.nRows() - 1); const d = dr ? 1 : ev.d; step = clamp(step, 0, len - Math.max(1, Math.ceil(d - 0.01))); let ch = false, pitch = false;
  if (dr) { const z = this.zones(f)[row]; if (z && z !== ev.z) { ev.z = z; ev.u = Einsp.PADS[z][2]; ch = pitch = true; } }
  else { const m = this.midiOf(this.hi - row); if (m !== ev.m) { ev.m = m; ev.u = clamp((m - 28) / 60, 0, 1); ch = pitch = true; } }
  if (Math.abs(ev.s - step) > 0.01) { ev.s = step; ch = true; }
  if (pitch) this.sound(ev); return ch;
};
// nach dem Verschieben: was auf derselben Zeile darunterliegt, weicht
Schrift.settle = function (ev) { const t = this.t; if (!t) return; const row = this.rowIx(ev), d = ev.z ? 1 : ev.d; t.ev = t.ev.filter(x => x === ev || !(this.rowIx(x) === row && x.s < ev.s + d - 0.01 && x.s + (x.z ? 1 : x.d) > ev.s + 0.01)); };
{ const rn = Schrift.render.bind(Schrift); Schrift.render = function () { this.drags.clear(); const r = rn(); try { const g = $("knGrid"); if (g && this.f && !(this.t && this.t.ev.length)) g.insertAdjacentHTML("beforeend", `<span class="kncue" id="knCue">Tippe ins Feld.<br>Jeder Finger setzt einen Ton.</span>`); const h = this.el().querySelector(".ehint"); if (h && this.f) h.textContent = this.drum(this.f) ? "Tippen setzt einen Schlag – mit mehreren Fingern mehrere auf einmal. Einen Schlag anfassen und ziehen verschiebt ihn. Nochmal tippen löscht ihn." : "Tippen setzt einen Ton – mit mehreren Fingern einen ganzen Akkord. Nach rechts ziehen macht ihn länger. Einen Ton anfassen und ziehen verschiebt ihn, am rechten Ende ziehen ändert die Länge. Nochmal tippen löscht ihn. Helle Zeilen passen zum Akkord."; } catch (_) {} return r; };
  const nt = Schrift.notes.bind(Schrift); Schrift.notes = function () { const r = nt(); try { const c = $("knCue"); if (c && this.t && this.t.ev.length) c.remove(); } catch (_) {} return r; }; }
Schrift.bind = function (el) {
  el.addEventListener("click", e => {
    const kf = e.target.closest("[data-kf]"); if (kf) { const f = Forms.byId(kf.dataset.kf); if (f) { Hap(); this.setForm(f); } return; }
    const kl = e.target.closest("[data-kl]"); if (kl && this.f) { const base = this.rowOf(KeysUI.midi(this.f, 0)).r, r = base - mod(base, 7) + (+kl.dataset.kl) + (mod(base, 7) > +kl.dataset.kl ? 7 : 0), m = this.midiOf(r); return this.sound({ m, d: 3, v: 0.85, u: clamp((m - 28) / 60, 0, 1) }); }
    const kd = e.target.closest("[data-kd]"); if (kd) { this.len = +kd.dataset.kd; store.set("knLen", this.len); Hap(); return this.render(); }
    const kb = e.target.closest("[data-kb]"); if (kb) { Hap(); return this.setLen(+kb.dataset.kb); }
    const ov = e.target.closest("#knOv"); if (ov) { const r = ov.getBoundingClientRect(), b = clamp(Math.floor((e.clientX - r.left) / r.width * this.L), 0, this.L - 1); this.page = clamp(Math.floor(b / this.per) * this.per, 0, Math.max(0, this.L - this.per)); Hap(); return this.render(); }
    const b = e.target.closest("[data-ks]"); if (b) this.act(b.dataset.ks);
  });
  const cellOf = e => { const g = $("knGrid"), r = g.getBoundingClientRect(), fx = (e.clientX - r.left) / this.cw; return { col: Math.floor(fx), fx, row: Math.floor((e.clientY - r.top) / this.rh) }; };
  el.addEventListener("pointerdown", e => { const g = e.target.closest("#knGrid"); if (!g || !this.f || this.drags.size >= 6 || this.drags.has(e.pointerId)) return; const c = cellOf(e); if (c.col < 0 || c.col >= this.per * 16 || c.row < 0 || c.row >= this.nRows()) return; e.preventDefault();
    const step = this.page * 16 + c.col, ev = this.evAtCell(c.row, step), dr = this.drum(this.f); let mode = null, ds = 0;
    if (ev) { ds = step - Math.floor(ev.s + 0.01); const end = ev.s + ev.d - this.page * 16; mode = !dr && ev.d >= 2 && end - c.fx < Math.min(0.9, ev.d * 0.3) ? "size?" : "move?"; }
    this.drags.set(e.pointerId, { pid: e.pointerId, x0: e.clientX, y0: e.clientY, col: c.col, row: c.row, ev, ds, mode, d: 0, g: null, ch: false }); try { g.setPointerCapture(e.pointerId); } catch (_) {} });
  el.addEventListener("pointermove", e => { const D = this.drags.get(e.pointerId); if (!D || !$("knGrid")) return; const dx = e.clientX - D.x0, dy = e.clientY - D.y0, c = cellOf(e), dr = this.drum(this.f), len = this.L * 16;
    if (D.ev) {
      if (D.mode === "move?" || D.mode === "size?") { if (Math.hypot(dx, dy) < 8) return; D.mode = D.mode.slice(0, 4); this.mark(); }
      let ch = false;
      if (D.mode === "size") { const d = clamp(this.page * 16 + c.col - Math.floor(D.ev.s + 0.01) + 1, 1, len - Math.floor(D.ev.s + 0.01)); if (d !== D.ev.d) { D.ev.d = d; ch = true; } }
      else ch = this.moveEv(D.ev, c.row, this.page * 16 + clamp(c.col, 0, this.per * 16 - 1) - D.ds);
      if (ch) { D.ch = true; this.notes(); } return;
    }
    if (dr) return; if (!D.d && dx < 7) return;
    const d = clamp(c.col - D.col + 1, 1, len - (this.page * 16 + D.col)); if (d === D.d) return; D.d = d;
    if (!D.g) { D.g = document.createElement("i"); D.g.className = "knn q7ghost"; const b = this.ghost(); if (b) b.appendChild(D.g); }
    D.g.style.cssText = `left:${D.col * this.cw + 1.5}px;top:${D.row * this.rh + 2}px;width:${d * this.cw - 3}px;height:${this.rh - 4}px;--c:${KeysUI.COL[mod(this.hi - D.row, 7)]}`; });
  const end = (e, cancel) => { const D = this.drags.get(e.pointerId); if (!D) return; this.drags.delete(e.pointerId); if (D.g) D.g.remove(); if (cancel && !D.ch) return;
    if (D.ev) { if (D.mode === "move" || D.mode === "size") { if (D.ch) { this.settle(D.ev); Hap(5); Save.soon(); this.notes(); } return; } if (cancel) return; return this.remove(D.ev); }
    if (cancel) return; this.add(D.row, this.page * 16 + D.col, D.d || this.len); };
  el.addEventListener("pointerup", e => end(e, false)); el.addEventListener("pointercancel", e => end(e, true));
};

/* ---------- 3) Live-Fläche: zweiter Finger = Echo ---------- */
{ const bd = Live70.bind.bind(Live70); Live70.bind = function (el) { bd(el);
    el.addEventListener("pointerdown", e => { if (!e.target.closest("#lvPad") || this.pid == null || this.pid === e.pointerId || this.pid2 != null) return; this.pid2 = e.pointerId; try { $("lvPad").setPointerCapture(e.pointerId); } catch (_) {} this.holdSet("echo", true); e.preventDefault(); });
    const up = e => { if (this.pid2 === e.pointerId) { this.pid2 = null; this.holdSet("echo", false); } };
    el.addEventListener("pointerup", up); el.addEventListener("pointercancel", up); };
  const rn = Live70.render.bind(Live70); Live70.render = function () { const r = rn(); try { this.pid2 = null; const h = $("lvHint"); if (h) h.innerHTML = "Leg den Finger auf die Fläche und zieh:<br><b>hoch</b> = mehr Band · <b>rechts</b> = heller<br><b>zweiter Finger</b> = Echo"; } catch (_) {} return r; };
  const cl = Live70.close.bind(Live70); Live70.close = function () { this.pid2 = null; return cl(); }; }

try { Erkl.T.push(['[data-hm="play"]', "Klang kneten", "Zeigt deine Klang-Form und schaltet das Kneten ein: Drück und zieh mit einem oder mehreren Fingern an der Form. Sie klingt dabei – du hörst sofort, wie sich der Klang ändert."]); } catch (_) {}
Help.T.push({ id: "v71", ic: "🖐", t: "Mit allen Fingern modellieren", k: "multitouch mehrere finger kneten modellieren ton klingt klangschrift akkord verschieben länger kürzer echo zweiter finger kinderleicht",
  h: `<p><b>Klang kneten</b> (Startseite oder „Kneten“ unten im Bereich Spielen): Drück und zieh an der Form – mit einem Finger oder mit mehreren zugleich. Jeder Finger knetet für sich, und die Form <b>klingt dabei</b>. So hörst du sofort, was sich ändert. Zwei Finger gleichzeitig aufsetzen und spreizen macht die Form größer oder kleiner. Spielt die Form gerade ihren Loop, hörst du die Änderung am Loop.</p>
  <p><b>Klangschrift</b>: Jeder Finger setzt seinen eigenen Ton – drei Finger auf einmal sind ein Akkord. Einen Ton <b>anfassen und ziehen</b> verschiebt ihn: hoch und runter ändert die Tonhöhe (du hörst sie), links und rechts die Zeit. Am <b>rechten Ende</b> ziehen macht ihn länger oder kürzer. Antippen löscht ihn. Auch das geht mit mehreren Fingern gleichzeitig.</p>
  <p><b>Live-Fläche</b>: Ein zweiter Finger auf der Fläche schaltet das Echo ein, solange er liegt.</p>` });
