

    // v75: Ausklang
    try { const O = Outro75, ro = O.role, R = { a: "beat", b: "hook", c: "akk", d: "mel", e: "bass", g: "arp" }, F = Object.keys(R).map(id => ({ id, kind: id === "a" ? "drum" : "synth", songG: id === "d" ? 0.5 : null })); let o;
      try { O.role = f => R[f.id]; const P = O.plan(F), by = k => P.find(e => e.role === k), G = (k, u) => O.gain(by(k), u);
        const order = by("mel").b <= by("arp").b && by("arp").b <= by("beat").b && by("beat").b <= by("bass").b && by("bass").b === 1 && by("akk").b === 1;
        let mono = true; for (const e of P) { let prev = 1e9; for (let u = 0; u <= 1.0001; u += 0.05) { const g = O.gain(e, u); if (g > prev + 1e-9) mono = false; prev = g; } }
        const mid = G("mel", 0.25) > 0.2 && G("mel", 0.25) < 0.3 && G("mel", 0.6) === 0 && G("bass", 0.6) === 1 && G("bass", 0.8) > 0.4 && G("bass", 0.8) < 0.6 && P.every(e => O.gain(e, 1) === 0) && by("mel").g0 === 0.5;
        const en = O.enders(P).map(e => e.role).join(), solo = O.plan([{ id: "d", kind: "synth" }, { id: "b", kind: "synth" }]), last = solo[solo.length - 1].b === 1, drums = O.enders(O.plan([{ id: "a", kind: "drum" }])).length === 1;
        o = order && mono && mid && en === "bass,akk" && last && drums && O.barsFor(60) === 4 && O.barsFor(120) === 6 && O.barsFor(172) === 8 && O.barsFor(40) === 2; }
      finally { O.role = ro; }
      const idle = (() => { const tt = UI.toast; let n = 0; UI.toast = () => { n++; }; const tr = Transport.running; try { if (!tr) { O.start(); return !O.on && n === 1; } return true; } finally { UI.toast = tt; } })();
      ok("O5", o && idle && !O.on, "Ausklang: erst gehen die Melodien, dann Begleitung, Schlagzeug und zuletzt Bass und Akkorde · jede Stimme wird stetig leiser, keine springt · am Ende sind alle still · Schlusston von Bass und Akkord (ohne beide: die letzte Stimme bzw. das Schlagzeug) · etwa zwölf Sekunden: 2 bis 8 Takte je nach Tempo · ohne laufende Musik startet er nicht"); } catch (e) { ok("O5", false, String(e)); }
    try { const sr = 24000, tone = (m, s) => { const n = Math.round(sr * s), a = new Float32Array(n), f = midiHz(m); for (let i = 0; i < n; i++) a[i] = 0.5 * Math.sin(2 * Math.PI * f * i / sr) * Math.min(1, i / 300, (n - i) / 300); return a; }, gap = new Float32Array(Math.round(sr * 0.08));
      const cat = L => { const n = L.reduce((s, a) => s + a.length, 0), x = new Float32Array(n); let o = 0; for (const a of L) { x.set(a, o); o += a.length; } return x; };
      const N = RecNP.track(cat([tone(60, 0.35), gap, tone(64, 0.35), gap, tone(67, 0.35), gap, tone(67, 0.3), gap, tone(55, 0.4)]), sr), quiet = RecNP.track(new Float32Array(sr), sr), noise = (() => { const a = new Float32Array(sr); let s = 7; for (let i = 0; i < sr; i++) { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; a[i] = (s / 4294967296 - 0.5) * 0.6; } return RecNP.track(a, sr); })();
      const mood = K.MOODS.find(m => m.id === "froh") || Music.mood, d = RecNP.degs([60, 64, 67, 72, 48, 62], mood), b0 = StartMel.midiFor(mood, 0), back = d.map(k => mod(StartMel.midiFor(mood, k), 12)).join() === [60, 64, 67, 72, 48, 62].map(m => mod(m, 12)).join();
      ok("R5", N.join() === "60,64,67,67,55" && quiet.length === 0 && noise.length <= 1 && (mod(b0, 12) !== 0 || back) && d.length === 6 && typeof RecNP.after === "function", `Eigener Klang: fünf nacheinander gesungene Töne werden erkannt (${N.join(" ")}), auch ein wiederholter · Stille und Rauschen ergeben keinen Tonverlauf · die Töne werden zu Stufen der gewählten Tonart`); } catch (e) { ok("R5", false, String(e)); }
