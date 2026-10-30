
    // v63: Pult, Einsatz auf der Eins, harte Bassbeats
    try { const sr = 48000, B = BBX.build(sr), ks = ["kit_hardstyle", "kit_trap808", "kit_bassdrop", "kit_dnbbass"], keys = ks.flatMap(k => ["kick", "snare", "hat", "top"].map(z => k + "_" + z)), bad = keys.filter(k => { const d = B[k]; if (!d) return true; let pk = 0, nan = false; for (const v of d) { if (!isFinite(v)) nan = true; pk = Math.max(pk, Math.abs(v)); } return nan || pk < 0.3; });
      const low = d => { let e = 0, s = 0; for (let i = 0; i < Math.min(d.length, sr * 0.3); i++) { s += d[i] * d[i]; } return s; }; const seeds = ks.every(id => K.seedById(id).id === id);
      ok("HB", !bad.length && seeds && B.kit_trap808_kick.length > sr * 1.2, `Harte Bassbeats: ${ks.length} Kits (${keys.length} Klänge) – Hardstyle-Kick, lange 808 (${(B.kit_trap808_kick.length / sr).toFixed(1)} s), Sub-Drop, Reese-Schlag${bad.length ? " – auffällig: " + bad : ""}`); } catch (e) { ok("HB", false, String(e)); }
    try { if (!App.started) ok("PQ", true, "nicht gestartet"); else { const L = Pult.list().filter(f => !LoopSt.trackOf(f)).slice(0, 2); if (L.length < 2) ok("PQ", true, "zu wenig Formen"); else {
      const keep = Project.data(true), run = Transport.running, tp = UI.toast; UI.toast = () => {};
      try { if (!Transport.running) Transport.start(); Fade.set(L[0], true, true); L[0].still = false; Motion.setTier(L[0], 3); Fade.set(L[1], false, true);
        const p0 = [Pult.playing(L[0]), Pult.playing(L[1])]; Pult.toggle(L[1]); Pult.toggle(L[0]); const queued = Pult.state(L[1]) === "qon" && Pult.state(L[0]) === "qoff" && !Pult.playing(L[1]);
        Pult.onBar(); const after = [Pult.playing(L[0]), Pult.playing(L[1])];
        ok("PQ", p0[0] && !p0[1] && queued && !after[0] && after[1], `Pult: ${L[1].name} „setzt ein …“, ${L[0].name} „stoppt …“ – beides erst auf der nächsten Eins (vorher ${p0}, danach ${after})`); }
      finally { UI.toast = tp; Pult.q.clear(); Project.load(keep, true); if (!run && Transport.running) Transport.stop(); } } } } catch (e) { ok("PQ", false, String(e)); }
    try { if (!App.started) ok("PU", true, "nicht gestartet"); else { const t0 = UI.tab; UI.setTab("loop"); const v = $("pult"), n = v ? v.querySelectorAll(".pp[data-pp]").length : 0, fx = v ? v.querySelectorAll(".pthold").length : 0, ls = !!document.querySelector("#lsbox .lxclock"), tab = ($("tLoop").textContent || "").trim(); UI.setTab(t0 === "loop" ? "klang" : t0);
      ok("PU", n === Pult.list().length && fx === 3 && ls && tab === "Pult", `Bereich „${tab}“: ${n} Felder (eins je Form), Filter + Echo + Break + Mitschnitt, darunter die Loopstation`); } } catch (e) { ok("PU", false, String(e)); }
