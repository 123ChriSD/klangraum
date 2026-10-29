/* ============================================================
   v62: Formen einzeln starten · Loops direkt aufnehmen · Loops im Raum mischen · neue Oberfläche
   ============================================================ */

// ---------- 1) Einzeln starten: steht alles, startet ein ▶ einer Form nur diese ----------
// Bisher: oben ■ hält alles an; ein ▶ an einer Form startete den Takt – und damit auch alle anderen, die vorher liefen.
const SoloStart = {
  f: null,
  // spielt die Form hörbar? (Takt läuft, nicht ausgeblendet, sie dreht oder ihre Loops laufen)
  playing(g) {
    if (!g || !Transport.running || !QuickPP.on(g)) return false;
    const t = LoopSt.trackOf(g); if (t) return t.on && LoopSt.par(t).run;
    return Motion.moves(g) || (Loops.count(g) > 0 && !g.lpOff) || !!g.lebt;
  },
  // nur f soll beim Start laufen: die anderen anhalten (sie behalten ihren Schwung, ▶ holt sie dazu)
  only(f) {
    let n = 0;
    for (const g of Forms.list) { if (g === f || g.empty) continue; let any = false;
      if (!g.still && (Motion.any(g) || g.lebt || Motion.gliding(g))) { Motion.pause(g); any = true; }
      if (Loops.count(g) && !g.lpOff) { g.lpOff = true; any = true; }
      if (any) n++; }
    for (const t of LoopSt.slots) if (t && !t.fid && t.on) { t.on = false; n++; }
    if (n) setTimeout(() => UI.toast(`Nur ${f.name} läuft – die anderen holst du mit ihrem ▶ dazu (oben ▶ = alle)`, 2600), 60);
    return n;
  },
  // eine Form zum Klingen bringen (ohne die anderen mitzustarten, wenn der Takt steht)
  start(f) {
    if (!f) return; const cold = !Transport.running && !!Engine.ctx;
    if (cold) this.only(f);
    if (!QuickPP.on(f)) Fade.set(f, true, true);
    f.lpOff = false;
    const t = LoopSt.trackOf(f); if (t) { t.on = true; t.pend = true; }
    if (f.still) Motion.resume(f);
    if (!Motion.any(f) && !(Loops.count(f)) && !f.empty) Motion.setTier(f, t ? (Motion.tierOfW(Motion.wOfR(t.r0 || 1)) || 3) : 2);
    if (!Transport.running && Engine.ctx) { this.f = f; try { LoopCtl.release && LoopCtl.release(); Transport.start(); } finally { this.f = null; } }
    Hap(10); UI.soon(); try { KSheet.sync(true); } catch (_) {} Save.soon();
  }
};
// ▶/⏸ an Namen, Punkten und in der Form-Ansicht: zeigt, ob die Form wirklich klingt; ▶ startet nur sie
{ QuickPP.icon = function (f) { return SoloStart.playing(f) ? "⏸" : "▶"; };
  const tg = QuickPP.toggle.bind(QuickPP); QuickPP.toggle = function (f) { if (!f) return; if (SoloStart.playing(f)) return tg(f); SoloStart.start(f); UI.toast(`${f.name} läuft`, 800); setTimeout(() => { try { Cue.sync(); } catch (_) {} }, 30); }; }
// „Drehen/Weiter“ und Anschubsen bei stehendem Takt: nur diese Form
{ const mt = Move.toggle.bind(Move); Move.toggle = function (f) { if (f && !Transport.running && Engine.ctx && !f.empty) { SoloStart.start(f); UI.toast(`${f.name} dreht`, 900); return; } return mt(f); }; }
for (const k of ["resume", "setAxis", "push"]) { const o = Motion[k].bind(Motion); Motion[k] = function (f, ...a) { if (f && f.mot && !Transport.running && Engine.ctx && App.started && SoloStart.f !== f && !SoloStart._in) { SoloStart._in = true; try { SoloStart.only(f); SoloStart.f = f; return o(f, ...a); } finally { SoloStart._in = false; SoloStart.f = null; } } return o(f, ...a); }; }

// ---------- 2) Loops direkt aufnehmen: 🔴 Loop im Steuerfeld jeder Form ----------
const LoopRec = {
  label() { const R = LoopSt.R; if (R) { const st = LoopSt.state(R.i); return st === "arm" ? `Gleich …` : R.kind === "dub" ? "Fertig" : "Fertig"; } return "Loop"; },
  sub() { const R = LoopSt.R; if (R) { const [a, b] = LoopSt.label(R.i); return a; } return LoopSt.src === "form" ? "🎛 Formen" : "🎤 Mikro"; },
  async tap() {
    const R = LoopSt.R; if (R) return LoopSt.tap(R.i);
    const i = LoopSt.free(); if (LoopSt.slots[i]) { UI.toastAct("Alle Spuren belegt", "Loopstation", () => UI.setTab("loop"), 3200); return; }
    await LoopSt.rec(i, LoopSt.src);
    if (LoopSt.R) UI.toast(LoopSt.R.mode === "free" ? `🔴 Spur ${i + 1} nimmt auf – nochmal tippen schließt den Loop` : `🔴 Spur ${i + 1} beginnt zur nächsten Eins`, 2200);
  },
  flip() { LoopSt.src = LoopSt.src === "form" ? "mic" : "form"; store.set("lsSrc", LoopSt.src); Hap(12); UI.toast(`Loop-Aufnahme von: ${LoopSt.src === "form" ? "🎛 den Formen (was du spielst)" : "🎤 dem Mikrofon"} · lang drücken = wechseln`, 2200); try { KSheet.sync(true); } catch (_) {} }
};
if (!store.get("lsSrc")) LoopSt.src = "form";   // in der Klang-Ansicht ist das Naheliegende: die gespielten Formen loopen
{ const rw = FSw.row.bind(FSw); FSw.row = function () { let h = rw(); if (!h) return h; const R = LoopSt.R;
  const btn = `<button class="fxb lrec2${R ? " rec" : ""}" data-fx="lsrec" aria-pressed="${!!R}" aria-label="Loop aufnehmen (${LoopRec.sub()}) – lang drücken: Quelle wechseln"><b class="fxi">${R ? "■" : "🔴"}</b><span class="fxt">${LoopRec.label()}</span></button>`;
  return h.replace(/<button class="fxb mic[^"]*"[\s\S]*?<\/button>/, btn); }; }
{ const ck = FSw.click.bind(FSw); FSw.click = function (e) { const b = e.target.closest("[data-fx]"); if (b && b.dataset.fx === "lsrec") { e.stopPropagation(); e.preventDefault(); if (LoopRec._lp) { LoopRec._lp = false; return true; } Hap(10); LoopRec.tap().then(() => this.refresh()); setTimeout(() => this.refresh(), 250); return true; } return ck(e); }; }
document.addEventListener("pointerdown", e => { const b = e.target.closest && e.target.closest('#ksheet [data-fx="lsrec"]'); if (!b) return; clearTimeout(LoopRec.lpT); LoopRec._lp = false; LoopRec.lpT = setTimeout(() => { if (LoopSt.R) return; LoopRec._lp = true; LoopRec.flip(); }, 600); }, true);
document.addEventListener("pointerup", () => clearTimeout(LoopRec.lpT), true);
setInterval(() => { try { const b = document.querySelector('#ksheet [data-fx="lsrec"]'); if (!b) return; const want = `${!!LoopSt.R}${LoopRec.label()}`; if (LoopRec._w !== want) { LoopRec._w = want; KSheet.sync(true); } } catch (_) {} }, 300);

// ---------- 3) Loops im Raum mischen: Lage der Loop-Form = Lautstärke, Panorama, Hall ----------
{ const p0 = LoopSt.par.bind(LoopSt); LoopSt.par = function (t) { const P = p0(t), f = this.form(t); if (!f || !f.mixNow) return P;
  const m = f.mixNow, g = (f.mute || !Forms.audible(f)) ? 0 : clamp(m.gain / 0.893, 0, 1.5);
  return { ...P, g, pan: clamp(m.pan || 0, -1, 1), send: clamp((m.send || 0) * 0.45 + (m.echo || 0) * 0.05, 0, 0.9), lo: m.lo || 0, hi: m.hi || 0 }; }; }
{ const ch0 = LoopSt.chain.bind(LoopSt); LoopSt.chain = function (t) { const fresh = !(t._ch && t._ch.c === Engine.ctx); const ch = ch0(t);
  if (fresh || !ch.lo) { try { const c = Engine.ctx, lo = c.createBiquadFilter(), hi = c.createBiquadFilter(); lo.type = "lowshelf"; lo.frequency.value = 200; hi.type = "highshelf"; hi.frequency.value = 3200; ch.g.disconnect(); ch.g.connect(lo).connect(hi).connect(ch.lp); ch.lo = lo; ch.hi = hi; } catch (e) { console.warn(e); } }
  return ch; }; }
{ const ap = LoopSt.apply.bind(LoopSt); LoopSt.apply = function (t, P, time) { ap(t, P, time); try { const ch = t._ch; if (ch && ch.lo) { const at = Math.max(Engine.now(), time || 0); ch.lo.gain.setTargetAtTime(P.lo || 0, at, 0.05); ch.hi.gain.setTargetAtTime(P.hi || 0, at, 0.05); } } catch (_) {} }; }
// Jede Spur bekommt ihre Form (auch ältere ohne), damit alle Loops im Raum stehen
{ const iv = setInterval(() => { if (!App.started) return; clearInterval(iv); try { let n = 0; for (const t of LoopSt.slots) if (t && !LoopSt.form(t) && !t.noForm) { LoopSt.makeForm(t); n++; } if (n) Save.soon(); } catch (e) { console.warn(e); } }, 1200); }
// Loop-Ansicht: „Im Raum mischen“
{ const r0 = LoopSt.render.bind(LoopSt); LoopSt.render = function () { r0(); try { const el = this.el(); if (!el || UI.tab !== "loop") return; const all = el.querySelector(".lqall");
    if (all && !el.querySelector("[data-ls=raum]") && this.any()) all.insertAdjacentHTML("afterbegin", `<button class="btn lxraum" data-ls="raum">◍ Im Raum mischen</button>`); } catch (_) {} }; }
{ const c0 = LoopSt.click.bind(LoopSt); LoopSt.click = function (e) { const b = e.target.closest("[data-ls]"); if (b && b.dataset.ls === "raum") { Hap(8); UI.setTab("klang"); UI.setView("raum"); UI.toast("Loops im Raum: Form ziehen = näher/lauter, links/rechts = Panorama, oben = mehr Hall · Punkt tippen = ▶/⏸", 3600); return; } return c0(e); }; }
// Raum: Loop-Formen am Punkt erkennbar
setInterval(() => { try { const L = $("rdots"); if (!L || L.hidden) return; L.querySelectorAll(".rdot").forEach(d => { const f = Forms.byId(d.dataset.id), on = !!LoopSt.trackOf(f); if (d.classList.contains("isloop") !== on) d.classList.toggle("isloop", on); }); } catch (_) {} }, 500);

// ---------- 4) Hilfe ----------
{ const h = Help.T.find(x => x.id === "loopst"); if (h) h.h = h.h.replace("</ul>", `<li><b>Direkt aufnehmen</b>: im Steuerfeld jeder Form <b>🔴 Loop</b> tippen – nimmt auf, was du spielst (🎛 Formen) oder das Mikrofon (🎤) in die nächste freie Spur; nochmal tippen = fertig. <b>Lang drücken</b> wechselt die Quelle.</li><li><b>Im Raum mischen</b>: jede Spur ist eine Form im Raum. Näher = lauter, links/rechts = Panorama, höher = mehr Hall; Höhen/Tiefen und Lautstärke der Form wirken auf den Loop. Loop-Formen haben im Raum einen Ring am Punkt.</li></ul>`); }
{ const h = Help.T.find(x => x.id === "schalten"); if (h) h.h = h.h.replace(/<\/ul>\s*$/, `<li><b>Einzeln starten</b>: Steht alles (oben ■), startet ▶ an einer Form <b>nur diese</b> – die anderen holst du mit ihrem eigenen ▶ dazu. Oben ▶ startet alle.</li></ul>`); }
// Overdub-Stelle: Rundungsfehler an der Loop-Grenze abfangen
{ const di = LoopSt.dubIdx.bind(LoopSt); LoopSt.dubIdx = function (x, N) { const L = this.L, t = this.R && this.slots[this.R.i], sh = t ? t.shift | 0 : 0, sf = Math.round(((x - Transport.t0) / Transport.spb) * 1e6) / 1e6; let ph = (((sf - sh) % L) + L) % L; if (ph >= L - 1e-6) ph = 0; return Math.min(N - 1, Math.floor(ph / L * N)); }; }
// zwei Loop-Arten klar unterscheiden: „Ton-Loop“ (gespielte Töne der Form, veränderbar) und „🔴 Loop“ (Audio in die Loopstation)
{ const L = Cmd.L.loop; if (L && typeof L.n === "function") { const n0 = L.n; L.n = f => String(n0(f)).replace(/^(\+ )?Loop$/, "$1Ton-Loop"); } }
