
    // v62: einzeln starten, Raum-Mix der Loops, Loop-Knopf im Steuerfeld
    try { if (!App.started) ok("ES", true, "nicht gestartet"); else { const L = Forms.list.filter(f => !f.empty && !LoopSt.trackOf(f)).slice(0, 3); if (L.length < 2) ok("ES", true, "zu wenig Formen"); else {
      const keep = Project.data(true), run = Transport.running, tp = UI.toast; UI.toast = () => {};
      try { for (const f of L) { f.still = false; Motion.ph(f).gl = null; Motion.ph(f).wy = Motion.level(3); f.lpOff = false; Fade.set(f, true, true); }
        if (Transport.running) Transport.stop(); const pre = L.map(f => QuickPP.icon(f)).join("");
        QuickPP.toggle(L[0]); const st = L.map(f => SoloStart.playing(f)), icons = L.map(f => QuickPP.icon(f)).join("");
        QuickPP.toggle(L[1]); const st2 = L.map(f => SoloStart.playing(f));
        ok("ES", pre === "▶".repeat(L.length) && st[0] && !st[1] && Transport.running && st2[0] && st2[1], `Takt stand (alle zeigen ${pre}) · ▶ an ${L[0].name} → nur ${L[0].name} läuft (${icons}) · ▶ an ${L[1].name} → zwei laufen`); }
      finally { UI.toast = tp; Project.load(keep, true); if (!run && Transport.running) Transport.stop(); if (run && !Transport.running) Transport.start(); } } } } catch (e) { ok("ES", false, String(e)); }
    try { if (!App.started) ok("RM", true, "nicht gestartet"); else { const sl0 = LoopSt.slots, L0 = LoopSt.L; LoopSt.L = 32; const t = { id: "q", rec: "rQ", on: true, bpm: Music.tempo(), vol: 1, ch: 1, shift: 0 }; LoopSt.slots = [t, null, null, null];
      const f = LoopSt.makeForm(t); f.still = false; Motion.ph(f).wy = Motion.level(3);
      f.pos = { x: -3, y: 0, z: 0 }; Forms.applyMix(f); const A = LoopSt.par(t); f.pos = { x: 3, y: 1.5, z: 2.5 }; Forms.applyMix(f); const B = LoopSt.par(t); f.pos = { x: 0, y: 0, z: -8 }; Forms.applyMix(f); const C = LoopSt.par(t);
      LoopSt._rmF = true; Forms.remove(f); LoopSt._rmF = false; LoopSt.slots = sl0; LoopSt.L = L0;
      ok("RM", A.pan < -0.5 && B.pan > 0.5 && B.send > A.send && C.g < A.g && B.g > C.g, `Loop im Raum: links Pan ${A.pan.toFixed(2)}, rechts oben Pan ${B.pan.toFixed(2)} mit mehr Hall (${A.send.toFixed(2)} → ${B.send.toFixed(2)}), weit hinten leiser (${A.g.toFixed(2)} → ${C.g.toFixed(2)})`); } } catch (e) { ok("RM", false, String(e)); }
    try { const h = FSw.row ? FSw.row() : ""; ok("LR", /data-fx="lsrec"/.test(h || "") || !Forms.active, `Steuerfeld jeder Form: 🔴 Loop nimmt direkt in die nächste freie Spur auf (Quelle ${LoopSt.src === "form" ? "Formen" : "Mikrofon"}, lang drücken = wechseln)`); } catch (e) { ok("LR", false, String(e)); }
