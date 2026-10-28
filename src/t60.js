
    // v60: Versatz, Loop-Form, Takt-Uhr
    try { const k = { s: LoopSt.slots, L: LoopSt.L, st: LoopSt.startT, sp: LoopSt.stopT, R: LoopSt.R }, hits = [];
      LoopSt.R = null; LoopSt.slots = [{ id: "x", rec: "rX", on: true, bpm: 120, vol: 1, ch: 1, pend: false, shift: 4 }, null, null, null]; LoopSt.L = 32; LoopSt.bufs.set("rX", { duration: 4, length: 192000 });
      LoopSt.startT = (t, b, time, ph) => hits.push(time + ":" + ph); LoopSt.stopT = () => {};
      for (let st = 0; st < 70; st++) LoopSt.onStep(st, st);
      Object.assign(LoopSt, { slots: k.s, L: k.L, startT: k.st, stopT: k.sp, R: k.R }); LoopSt.bufs.delete("rX");
      ok("LX1", hits.join() === "0:28,4:0,36:0,68:0", `Verschobener Loop (Versatz 4/16) startet sofort an der passenden Stelle (28/32) und beginnt dann bei Schritt 4 · 36 · 68 statt 0 · 32 · 64`); } catch (e) { ok("LX1", false, String(e)); }
    try { const L0 = LoopSt.L, sl0 = LoopSt.slots, R0 = LoopSt.R; LoopSt.L = 32; const t = { id: "y", shift: 8 }; LoopSt.slots = [t, null, null, null]; LoopSt.R = { i: 0 };
      const sp = Transport.spb, t0 = Transport.t0, a = LoopSt.dubIdx(t0 + 8 * sp, 1000), b = LoopSt.dubIdx(t0 + 16 * sp, 1000); LoopSt.L = L0; LoopSt.slots = sl0; LoopSt.R = R0;
      ok("LX2", a === 0 && b === 250, `Overdub auf verschobener Spur landet richtig: Schritt 8 → ${a}, Schritt 16 → ${b}`); } catch (e) { ok("LX2", false, String(e)); }
    try { if (!App.started) ok("LX3", true, "nicht gestartet"); else { const sl0 = LoopSt.slots, L0 = LoopSt.L; LoopSt.L = 32; const t = { id: "z", rec: "rZ", on: true, bpm: Music.tempo(), vol: 1, ch: 1, shift: 0 }; LoopSt.slots = [t, null, null, null];
      const n0 = Forms.list.length, f = LoopSt.makeForm(t), made = !!f && Forms.list.length === n0 + 1 && LoopSt.trackOf(f) === t;
      const p = Motion.ph(f); f.still = false; p.gl = null; p.wy = Motion.level(3); const P1 = LoopSt.par(t); p.wy = Motion.level(4); f._kd = 2; const P2 = LoopSt.par(t); p.wy = Motion.level(2); f._kd = -2; const P3 = LoopSt.par(t); f.still = true; const P4 = LoopSt.par(t);
      let silent = true; const ep = Engine.post; try { Motion.step(f, 0, Engine.now() + 0.1); } catch (_) {} 
      const h = Forms.play(f, 0.5, 0.8, {}); silent = h === null;
      LoopSt._rmF = true; Forms.remove(f); LoopSt._rmF = false; LoopSt.slots = sl0; LoopSt.L = L0;
      ok("LX3", made && P1.run && P1.sp === 1 && !P1.semi && P2.sp === 2 && P2.semi > 0 && P3.sp === 0.5 && P3.semi < 0 && !P4.run && silent, `Loop als Form „${f && f.name}“: dreht normal → unverändert (×${P1.sp}, ${P1.semi} HT) · schneller + hineingedrückt → ×${P2.sp}, +${P2.semi} HT · langsamer + herausgezogen → ×${P3.sp}, ${P3.semi} HT · angehalten → Loop pausiert · Antippen spielt einen Schlag des Loops statt eines Synth-Tons`); } } catch (e) { ok("LX3", false, String(e)); }
    try { const keep = LoopSt.data(); LoopSt.load({ L: 32, slots: [{ id: "a", rec: "rT1", name: "Spur 1", vol: 1, on: true, bpm: 120, ch: 1, src: "mic", shift: 6, fid: "f999", r0: 1 }] }); const d = LoopSt.data(); LoopSt.load(keep);
      ok("LX4", d.slots[0].shift === 6 && d.slots[0].fid === "f999", `Versatz (${d.slots[0].shift}/16) und zugehörige Form werden mit dem Stück gespeichert`); } catch (e) { ok("LX4", false, String(e)); }
    try { if (!App.started) ok("LX5", true, "nicht gestartet"); else { const t0 = UI.tab; UI.setTab("loop"); const v = $("vLoop"), rows = v.querySelectorAll(".lxrow").length, clock = !!v.querySelector(".lxclock"), steps = v.querySelectorAll(".lxsteps li").length, lab = (v.querySelector(".lxbig small") || {}).textContent || ""; UI.setTab(t0 === "loop" ? "klang" : t0);
      ok("LX5", rows >= 4 && clock && steps === 4 && lab.length > 8, `Loopstation: Takt-Uhr, 4 Schritte als Anleitung, ${rows} Spuren mit Klartext („${lab}“)`); } } catch (e) { ok("LX5", false, String(e)); }
