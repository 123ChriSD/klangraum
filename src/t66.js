
    // v66: Rock – Gitarren-Synthese, Rock-Kits, Stimmungen, Band-Sets
    try { const sr = 48000, bad = []; let info = "";
      for (const k of Object.keys(RockSnd.KIND)) { const x = RockSnd.render(k, k === "bass" ? 33 : 45, sr); let pk = 0, nan = false, e0 = 0, e1 = 0; const n = x.length; for (let i = 0; i < n; i++) { const v = x[i]; if (!isFinite(v)) nan = true; pk = Math.max(pk, Math.abs(v)); if (i < sr * 0.3) e0 += v * v; else if (i > sr * 0.8 && i < sr * 1.1) e1 += v * v; }
        const zc = (() => { let c = 0; for (let i = 1; i < sr * 0.5; i++) if ((x[i - 1] < 0) !== (x[i] < 0)) c++; return c * 2; })();
        if (nan || pk < 0.05 || pk > 4) bad.push(k + " Pegel " + pk.toFixed(2)); info += `${k} ${fmt(pk, 2)}/${zc}Hz · `; }
      // Tonhöhe der Clean-Saite (eine Saite, Grundton deutlich): Autokorrelation
      const y = RockSnd.render("clean", 57, sr), L0 = Math.round(sr * 0.2), W = 4096; let best = 0, bl = 0; for (let l = 60; l < 400; l++) { let s = 0; for (let i = 0; i < W; i++) s += y[L0 + i] * y[L0 + i + l]; if (s > best) { best = s; bl = l; } } const hz = sr / bl;
      ok("RG", !bad.length && Math.abs(hz - 220) < 6, `Rock-Gitarren im Gerät berechnet (Saite → Verstärker → Box): ${info}Clean-A gemessen ${fmt(hz, 1)} Hz (Soll 220)${bad.length ? " · " + bad.join(", ") : ""}`); } catch (e) { ok("RG", false, String(e)); }
    try { const B = BBX.build(48000), ks = ["kit_rock", "kit_grunge", "kit_stoner"], miss = ks.flatMap(k => ["kick", "snare", "hat", "top"].map(z => k + "_" + z)).filter(k => !B[k] || B[k].length < 1000);
      ok("RK", !miss.length, `Rock-Schlagzeug: ${ks.length} Kits × Kick/Snare/Hat/Becken${miss.length ? " · fehlt " + miss.join(",") : ""}`); } catch (e) { ok("RK", false, String(e)); }
    try { const bad = []; for (const S of RockSets.L) { if (!K.MOODS.find(m => m.id === S.mood)) bad.push(S.n + ": Stimmung"); for (const p of S.parts) { const sd = K.seedById(p.seed); if (sd.id !== p.seed) bad.push(p.seed); const len = p.bars * 16; if (p.ev.some(e => e[0] < 0 || e[0] >= len)) bad.push(S.n + "/" + p.name + ": Ton außerhalb"); }
        for (const [nm, ix] of S.scenes) if (ix.some(i => !S.parts[i])) bad.push(S.n + "/" + nm); }
      const sc = RockSets.L.map(S => `${S.n} (${S.parts.length} Formen, ${S.parts.reduce((a, p) => a + p.ev.length, 0)} Töne/Schläge, Szenen ${S.scenes.map(x => x[0]).join("/")})`).join(" · ");
      ok("RS", !bad.length, bad.length ? "Fehler: " + bad.join("; ") : `Band-Sets: ${sc}`); } catch (e) { ok("RS", false, String(e)); }
    try { const keep = Project.data(true), tp = UI.toastAct, cr = Projects.create, sn = Save.now; UI.toastAct = () => {}; Projects.create = async () => {}; Save.now = async () => {};
      try { const n0 = Forms.list.length; while (Forms.list.length) Forms.remove(Forms.list[0]); RockSets.fill(RockSets.byId("grunge"), false);
        const L = Forms.list, gr = L.filter(f => f.takes && f.takes.length), on = L.filter(f => Fade.on(f)).map(f => f.name), sc = Pult.scn.filter(Boolean).map(s => s.name + ":" + s.ids.length).join(" "), m = Music.mood.id, tp0 = Math.round(Music.tempo());
        ok("RL", gr.length === 5 && m === "grunge" && tp0 === 116 && on.length === 3 && Pult.scn[1] && Pult.scn[1].ids.length === 4, `Set „Grunge“ geladen: ${gr.length} Formen mit Riffs, Stimmung ${m}, ${tp0} bpm, an: ${on.join(", ")} · Szenen ${sc}`); }
      finally { UI.toastAct = tp; Projects.create = cr; Save.now = sn; Project.load(keep, true); } } catch (e) { ok("RL", false, String(e)); }
