/* ============================================================
   v64: Szenen im Pult · Drop · „Alle“ bei vielen Formen entzerrt · ein Loop-Begriff
   ============================================================ */

// ---------- 1) Szenen: welche Klänge laufen – speichern und mit einem Tipp (auf der Eins) wechseln ----------
Object.assign(Pult, {
  N: 8, scn: [], cur: -1,
  sData() { return this.scn.map(s => s ? { ids: s.ids.slice() } : null); },
  sLoad(d) { this.scn = Array.from({ length: this.N }, (_, i) => d && d[i] && Array.isArray(d[i].ids) ? { ids: d[i].ids.map(String) } : null); this.cur = -1; },
  nowSet() { return this.list().filter(f => this.playing(f) || this.q.get(f.id) === true).filter(f => this.q.get(f.id) !== false).map(f => f.id); },
  same(s) { if (!s) return false; const a = new Set(s.ids.filter(id => Forms.byId(id))), b = new Set(this.nowSet()); return a.size === b.size && [...a].every(x => b.has(x)); },
  sSave(i) { const ids = this.nowSet(); if (!ids.length) { UI.toast("Erst Klänge starten – dann merkt sich die Szene, was läuft", 2200); return; } Undo.push(); this.scn[i] = { ids }; this.cur = i; Save.soon(); Hap(14); UI.toast(`Szene ${i + 1} gemerkt: ${ids.length} Klänge`, 1400); this.render(); },
  sGo(i) {
    const s = this.scn[i]; if (!s) return; const want = new Set(s.ids); this.cur = i; Hap(10);
    if (!Transport.running || !this.quant()) { if (!Transport.running && Engine.ctx) Transport.start(); for (const f of this.list()) { const on = want.has(f.id); if (on !== this.playing(f)) this.apply(f, on); } this.q.clear(); }
    else { this.q.clear(); for (const f of this.list()) { const on = want.has(f.id); if (on !== this.playing(f)) this.q.set(f.id, on); } }
    this.render();
  },
  sDel(i) { if (!this.scn[i]) return; Undo.push(); this.scn[i] = null; if (this.cur === i) this.cur = -1; Save.soon(); this.render(); },
  scenesHtml() {
    return `<div class="ptscn" role="group" aria-label="Szenen"><span class="ptl">Szenen</span>${this.scn.map((s, i) => { const on = s && this.same(s), wait = s && i === this.cur && !on && this.q.size;
      return `<button class="psc${s ? " full" : ""}${on ? " on" : ""}${wait ? " wait" : ""}" data-psc="${i}" aria-label="${s ? `Szene ${i + 1} (${s.ids.length} Klänge) – tippen = wechseln, halten = neu merken` : `Szene ${i + 1} leer – tippen = merken, was gerade läuft`}">${s ? `<b>${i + 1}</b><small>${s.ids.length}</small>` : "＋"}</button>`; }).join("")}</div>`;
  },
  // ---------- 2) Drop: 1 Takt Stille mit Anstieg, dann alles mit Sub-Drop auf der Eins ----------
  dropBufs() {
    if (this.DB && this.DB.c === Engine.ctx) return this.DB; const c = Engine.ctx, sr = c.sampleRate, mk = d => { const b = c.createBuffer(1, d.length, sr); b.copyToChannel(d, 0); return b; };
    const sub = BBX.SND.top_subdrop(sr, BBX), kick = BBX.SND.kick_hardstyle(sr, BBX); for (let i = 0; i < kick.length; i++) kick[i] *= 0.7; for (let i = 0; i < sub.length; i++) sub[i] *= 0.8;
    const n = sr * 4, nz = BBX.noise(n); return (this.DB = { c, sub: mk(sub), kick: mk(kick), nz: mk(nz) });
  },
  riser(t, dur) {
    const c = Engine.ctx, B = this.dropBufs(), s = c.createBufferSource(), bp = c.createBiquadFilter(), g = c.createGain(); s.buffer = B.nz; bp.type = "bandpass"; bp.Q.value = 2.2;
    bp.frequency.setValueAtTime(300, t); bp.frequency.exponentialRampToValueAtTime(7000, t + dur); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.45, t + dur * 0.97); g.gain.linearRampToValueAtTime(0, t + dur);
    s.connect(bp).connect(g).connect(Engine.out); s.start(t); s.stop(t + dur + 0.02);
  },
  boom(t) { const c = Engine.ctx, B = this.dropBufs(); for (const b of [B.sub, B.kick]) { const s = c.createBufferSource(), g = c.createGain(); s.buffer = b; g.gain.value = 0.9; s.connect(g).connect(Engine.out); s.start(t); } },
  drop() {
    if (!Engine.ctx) return; if (this.dropSt) { this.dropSt = null; this.render(); return; }
    if (!Transport.running) { UI.toast("Erst Musik starten – der Drop kommt mitten im Track", 1800); return; }
    this.dropSt = "arm"; Hap(14); this.render();
  },
  dropBar(time) {
    const st = this.dropSt; if (!st) return; const at = ms => setTimeout(ms[0], Math.max(0, (ms[1] - Engine.now()) * 1000)), bar = Transport.spb * 16;
    if (st === "arm") { const L = this.list().filter(f => this.playing(f)); this.dropL = L.map(f => f.id); this.dropSt = "still"; this.riser(time, bar); at([() => { for (const f of L) Fade.set(f, false, true); this.render(); }, time]); }
    else if (st === "still") { const L = (this.dropL || []).map(id => Forms.byId(id)).filter(Boolean); this.dropSt = null; this.dropL = null; this.boom(time); at([() => { for (const f of L) Fade.set(f, true, true); this.render(); try { Hap(30); } catch (_) {} }, time]); }
  }
});
{ const os = Transport.onStep.bind(Transport); Transport.onStep = function (step, time) { if (step % 16 === 0) { try { Pult.dropBar(time); } catch (e) { console.warn(e); } } return os(step, time); }; }
{ const sp = Transport.stop.bind(Transport); Transport.stop = function () { if (Pult.dropSt === "still") { for (const id of Pult.dropL || []) { const f = Forms.byId(id); if (f) Fade.set(f, true, true); } } Pult.dropSt = null; Pult.dropL = null; return sp(); }; }
Pult.sLoad(null);
{ const pd = Project.data.bind(Project); Project.data = function (mem) { const d = pd(mem); try { d.pscn = Pult.sData(); } catch (_) {} return d; }; }
{ const pl = Project.load.bind(Project); Project.load = function (d, mem) { const r = pl(d, mem); try { Pult.sLoad(d && d.pscn); } catch (_) {} return r; }; }
// Pult-Ansicht: Szenen-Zeile und Drop-Knopf
{ const r0 = Pult.render.bind(Pult); Pult.render = function () { r0(); try { const el = $("pult"); if (!el || UI.tab !== "loop") return; const g = el.querySelector(".ppgrid"); if (g) g.insertAdjacentHTML("beforebegin", this.scenesHtml());
    const fx = el.querySelector(".ptfx"); if (fx) { const d = this.dropSt; fx.insertAdjacentHTML("beforeend", `<button class="pthold ptdrop${d ? " on" : ""}" data-pt="drop"><b>${d === "arm" ? "Drop gleich …" : d === "still" ? "… DROP!" : "Drop"}</b><small>${d ? "tippen = abbrechen" : "1 Takt Stille, dann alles"}</small></button>`); } } catch (e) { console.warn(e); } }; }
{ const s0 = Pult.sig.bind(Pult); Pult.sig = function () { return s0() + "|" + this.scn.map(s => s ? s.ids.join(".") : "-").join(",") + this.cur + (this.dropSt || "") + this.scn.map(s => this.same(s) ? 1 : 0).join(""); }; }
{ const b0 = Pult.bind.bind(Pult); Pult.bind = function (el) { b0(el); let lp = null, lpd = false;
  el.addEventListener("pointerdown", e => { const b = e.target.closest("[data-psc]"); if (!b) return; clearTimeout(lp); lpd = false; const i = +b.dataset.psc; lp = setTimeout(() => { lpd = true; if (this.scn[i]) { const old = this.scn[i]; this.sSave(i); UI.toastAct(`Szene ${i + 1} neu gemerkt`, "Löschen", () => this.sDel(i), 4200); } }, 600); });
  const up = () => clearTimeout(lp); el.addEventListener("pointerup", up); el.addEventListener("pointercancel", up);
  el.addEventListener("click", e => { const b = e.target.closest("[data-psc]"); if (b) { if (lpd) { lpd = false; return; } const i = +b.dataset.psc; this.scn[i] ? this.sGo(i) : this.sSave(i); return; }
    const d = e.target.closest('[data-pt="drop"]'); if (d) { e.stopPropagation(); this.drop(); } }, true); }; }

// ---------- 3) „Alle“ bei vielen Formen und im Querformat: Namen kurz, nur die gewählte voll, leere Set-Knöpfe weg ----------
setInterval(() => { try { const n = Forms.list.filter(f => !f.empty).length, many = Scene.view === "alle" && (n > 6 || (innerHeight < 520 && n > 3)); if (document.body.classList.contains("kmany") !== many) document.body.classList.toggle("kmany", many); } catch (_) {} }, 400);

// ---------- 4) Ein Loop-Begriff: „Loop“ nimmt auf, was klingt (Spur im Pult); „Töne loopen“ (bearbeitbar) liegt im Steuerfeld → Loops ----------
{ const L = Cmd.L.loop; if (L) Object.assign(L, { ic: () => LoopSt.R ? ICON3.stop : '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="6" fill="#ff5a6e" stroke="none"/></svg>', n: () => LoopSt.R ? (LoopSt.state(LoopSt.R.i) === "arm" ? "Gleich …" : "Fertig") : "Loop", run: () => LoopRec.tap(), on: () => !!LoopSt.R }); }
{ const a0 = UI.act.bind(UI); UI.act = function (a, b) { if (a === "loop") { Hap(8); LoopRec.tap(); return; } return a0(a, b); }; }
{ const it = Radial.items.bind(Radial); Radial.items = function (f) { return it(f).map(x => x[0] === "loop" ? ["loop", x[1], LoopSt.R ? "Fertig" : "Loop"] : x); }; }
// Steuerfeld: Schalterzeile wieder mit 🎤 Mikro (Loop steht jetzt in der Werkzeugzeile)
{ const rw = FSw.row.bind(FSw); FSw.row = function () { const h = rw(); if (!h) return h; return h.replace(/<button class="fxb lrec2[^"]*"[\s\S]*?<\/button>/, `<button class="fxb mic${MicForm.on ? " rec" : ""}" data-fx="mic" aria-pressed="${MicForm.on}" aria-label="${MicForm.on ? "Mikro-Aufnahme beenden – wird zur Form" : "Mit dem Mikrofon aufnehmen – wird sofort eine Form"}"><b class="fxi">🎤</b><span class="fxt">${MicForm.on ? "Fertig" : "Mikro"}</span></button>`); }; }
setInterval(() => { try { const s = document.querySelector('#tools [data-a="loop"] span'); if (s) { const t = LoopSt.R ? "Fertig" : "Loop"; if (s.textContent !== t) s.textContent = t; } } catch (_) {} }, 400);
// Steuerfeld → Loops: der Ton-Loop heißt „Töne loopen“
{ const r0 = FBar.rows.bind(FBar); FBar.rows = function (f) { let h = r0(f); if (this.cat === "loops") h = h.replace(/>(Loop aufnehmen|Neuer Loop)</, ">Töne loopen<"); return h; }; }

// ---------- Hilfe ----------
{ const h = Help.T.find(x => x.id === "pult"); if (h) h.h = h.h.replace("</ul>", `<li><b>Szenen</b> (Zeile über den Feldern): ＋ tippen = merken, was gerade läuft. Eine gemerkte Szene tippen = genau diese Klänge, auf der nächsten Eins – so baust du Intro, Hauptteil, Break. Halten = neu merken (mit „Löschen“).</li><li><b>Drop</b> tippen: zur nächsten Eins wird es einen Takt lang still, ein Rauschen steigt an – dann kommt alles mit einem Sub-Bass-Schlag zurück.</li><li><b>Loop</b> (Werkzeugzeile, Kreis-Menü, Pult) nimmt auf, was gerade klingt, und legt es als Spur ins Pult. Die gespielten Töne einer Form als bearbeitbaren Loop: Steuerfeld → Loops → „Töne loopen“.</li></ul>`); }
