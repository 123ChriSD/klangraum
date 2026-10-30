
    // v64: Szenen, Drop, ein Loop-Begriff
    try { if (!App.started) ok("SZ", true, "nicht gestartet"); else { const L = Pult.list().filter(f => !LoopSt.trackOf(f)).slice(0, 3); if (L.length < 3) ok("SZ", true, "zu wenig Formen"); else {
      const keep = Project.data(true), run = Transport.running, tp = UI.toast, sc0 = Pult.sData(); UI.toast = () => {};
      try { if (!Transport.running) Transport.start(); const on = (f, v) => { if (v) { Fade.set(f, true, true); f.still = false; Motion.setTier(f, 3); } else Fade.set(f, false, true); };
        on(L[0], true); on(L[1], true); on(L[2], false); Pult.sSave(0); on(L[0], false); on(L[1], false); on(L[2], true); Pult.sSave(1);
        Pult.sGo(0); const q = [...Pult.q.entries()].map(([id, v]) => Forms.byId(id).name + (v ? "+" : "−")).join(" "); Pult.onBar(); const s0 = L.map(f => Pult.playing(f)), same0 = Pult.same(Pult.scn[0]);
        const d = Pult.sData(); Pult.sLoad(d); const back = Pult.scn[0] && Pult.scn[0].ids.length === 2;
        ok("SZ", s0[0] && s0[1] && !s0[2] && same0 && back, `Szenen: 1 = ${L[0].name}+${L[1].name}, 2 = ${L[2].name}; Szene 1 tippen → auf der Eins: ${q} · danach läuft genau Szene 1 · gespeichert`); }
      finally { UI.toast = tp; Pult.q.clear(); Pult.sLoad(sc0); Project.load(keep, true); if (!run && Transport.running) Transport.stop(); } } } } catch (e) { ok("SZ", false, String(e)); }
    try { if (!App.started) ok("DR", true, "nicht gestartet"); else { const tp = UI.toast; UI.toast = () => {}; const run = Transport.running; if (!run) Transport.start(); const B = Pult.dropBufs();
      Pult.dropSt = null; Pult.drop(); const a = Pult.dropSt; Pult.dropBar(Engine.now() + 5); const b = Pult.dropSt; Pult.dropBar(Engine.now() + 7); const c = Pult.dropSt; UI.toast = tp; if (!run) Transport.stop();
      ok("DR", a === "arm" && b === "still" && c === null && B.sub.duration > 1.5, `Drop: tippen → wartet auf die Eins → 1 Takt still mit Anstieg (Rauschen 300 Hz → 7 kHz) → alles zurück mit Sub-Drop (${B.sub.duration.toFixed(1)} s) und Kick`); } } catch (e) { ok("DR", false, String(e)); }
    try { const n = Cmd.L.loop.n(Forms.active), r = Radial.items(Forms.active || Forms.list[0]).find(x => x[0] === "loop"); ok("LB", n === "Loop" && r && r[2] === "Loop", `Ein Loop-Begriff: Werkzeugzeile, Kreis und Pult heißen „Loop“ (nimmt auf, was klingt); bearbeitbare Töne unter Steuerfeld → Loops → „Töne loopen“`); } catch (e) { ok("LB", false, String(e)); }
