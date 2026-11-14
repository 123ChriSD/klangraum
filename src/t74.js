

    // v74: Start einstellen, Bewegung einstellen, Zerhacker, Zoom, alle Formen
    try { const ma = Mel.add, fl = Forms.list, op = StartMel.opt, made = []; let o;
      try { Mel.add = (f, d, n) => { made.push(f.id); }; Forms.list = [{ id: "a", kind: "synth" }, { id: "b", kind: "drum" }, { id: "c", kind: "synth" }, { id: "d", kind: "sample" }];
        StartMel.opt = { n: 4, off: { 2: true } }; const F = StartMel.apply([0, 2, 4], StartMel.opt.off), a = made.join() === "a,d" && F.length === 2;
        made.length = 0; StartMel.opt = { n: 7, off: { 2: true } }; StartMel.apply([0, 2], StartMel.opt.off); const b = made.join() === "a,c,d";       // passt die Liste nicht zum Blatt, spielen alle mit
        const z = StartMel.zufall(), zz = z.length === 8 && z[0] === 0 && z.every(k => k >= -2 && k <= 9) && [0, 2, 4].includes(z[7]);
        o = a && b && zz && StartMel.lab(0) === "1" && StartMel.lab(7) === "1▴" && StartMel.lab(-3) === "5▾" && StartMel.midiFor(Music.mood, 7) - StartMel.midiFor(Music.mood, 0) === 12 && StartMel.midiFor(Music.mood, -7) - StartMel.midiFor(Music.mood, 0) === -12; }
      finally { Mel.add = ma; Forms.list = fl; StartMel.opt = op; }
      ok("S4", o, "Start einstellen: abgewählte Formen bekommen die Melodie nicht · Zufall liefert acht Töne, beginnt auf dem Grundton und endet auf einem Ton des Grundakkords · tiefe und hohe Lage liegen genau eine Oktave tiefer bzw. höher"); } catch (e) { ok("S4", false, String(e)); }
    try { const B = Beweg, st = { cfg: { ...B.cfg }, R: B.RANGE, lr: B.lr, fb: B.fb, zero: B.zero, got: B.got }, ss = store.set; store.set = () => {}; let o;
      try { B.cfg = { sens: "normal", ilr: false, ifb: false }; B.RANGE = 35; const a0 = B.axes(10, 20, 0); B.cfg.ilr = true; const a1 = B.axes(10, 20, 0); B.cfg.ifb = true; const a2 = B.axes(10, 20, 0); B.cfg.ilr = false; B.cfg.ifb = false;
        const full = s => { B.setCfg("sens", s); B.zero = null; B.got = 0; B.lr = 0; B.fb = 0; B.feed(0, 0, 0); for (let i = 0; i < 60; i++) B.feed(0, 25, 0); return B.lr; }, s1 = full("sanft"), s2 = full("normal"), s3 = full("stark");
        o = a0[0] === 20 && a0[1] === -10 && a1[0] === -20 && a1[1] === -10 && a2[0] === -20 && a2[1] === 10 && s1 < s2 && s2 < s3 && s3 > 0.999 && Math.abs(s2 - 21 / 31) < 0.01; }
      finally { store.set = ss; B.cfg = st.cfg; B.RANGE = st.R; B.lr = st.lr; B.fb = st.fb; B.zero = st.zero; B.got = st.got; }
      ok("B5", o, "Bewegung einstellen: ↔ und ↕ kehren je eine Achse um · bei 25° Neigung reicht „stark“ für den vollen Ausschlag, „normal“ für zwei Drittel, „sanft“ für weniger"); } catch (e) { ok("B5", false, String(e)); }
    try { const hs = Live70.holdSet, ea = Wucht.echoAmt, mx = Live70.mainXY, gs = Live70.gateSet, st = { X: Live70.X, e: Live70.mtEcho, c: Live70.mtCut, g: Live70.mtGate, h: Live70.hold, gate: Live70.gate }; const log = [];
      let o; try { Live70.hold = {}; Live70.holdSet = (k, on) => { Live70.hold[k] = on; log.push(k + (on ? "+" : "-")); }; Live70.gateSet = on => { log.push("gate" + (on ? "+" : "-")); }; Wucht.echoAmt = () => {}; Live70.mainXY = () => [100, 100, 300]; Live70.mtEcho = false; Live70.mtCut = false; Live70.mtGate = false;
        const P = n => { Live70.X = Array.from({ length: n }, (_, i) => ({ id: i, x: 150 + i * 30, y: 150 })); Live70.mtUpdate(); }; P(1); P(2); P(3); P(2); P(1); P(0);
        o = log.join(" ") === "echo+ gate+ gate- cut+ gate- cut- gate+ gate- echo-"; }
      finally { Live70.holdSet = hs; Wucht.echoAmt = ea; Live70.mainXY = mx; Live70.gateSet = gs; Live70.X = st.X; Live70.mtEcho = st.e; Live70.mtCut = st.c; Live70.mtGate = st.g; Live70.hold = st.h; Live70.gate = st.gate; }
      ok("L4", o, "Live-Fläche: zweiter Finger = Echo, dritter = Zerhacker, vierter = Stille (der Zerhacker ruht dann) – und beim Abheben in umgekehrter Reihenfolge zurück"); } catch (e) { ok("L4", false, String(e)); }
    try { const S = Schrift, st = { L: S.L, per: S.per, page: S.page, cw: S.cw, pw: S.perWant, f: S.f, lw: S.lw, rh: S.rh, lo: S.lo, hi: S.hi }, rn = S.render, hp = window.Hap; let o;
      try { S.render = () => { S.layout(); }; S.f = S.f || { kind: "synth" }; S.L = 4; S.page = 3; S.perWant = 0; S.layout(); const p0 = S.per, c0 = S.cw;
        const z1 = S.zoom(1), p1 = S.per, c1 = S.cw, pg = S.page; S.zoom(1); const p2 = S.per; const z3 = S.zoom(1); S.zoom(-1); S.zoom(-1); S.zoom(-1); const p3 = S.per, z4 = S.zoom(-1);
        o = p1 === Math.min(4, p0 * 2) && (p1 === p0 || c1 < c0) && pg % p1 === 0 && p2 === 4 && z3 === false && p3 === 1 && z4 === false; }
      finally { S.render = rn; Object.assign(S, { L: st.L, per: st.per, page: st.page, cw: st.cw, perWant: st.pw, f: st.f, lw: st.lw, rh: st.rh, lo: st.lo, hi: st.hi }); }
      ok("Z4", o, "Klangschrift-Ansicht: zusammenziehen zeigt doppelt so viele Takte (bis 4), auseinanderziehen halb so viele (bis 1) · die Seite beginnt immer auf einem passenden Takt"); } catch (e) { ok("Z4", false, String(e)); }
    try { const mk = id => ({ id, rot: 0, bus: -1, pulse: 0, still: false, moff: { x: 0, z: 0 }, mot: { dreh: 0, schwing: 0, puls: 0, kreis: 0, rate: 1 } }), A = mk("a"), Bf = mk("b"), C = mk("c"), fl = Forms.list, ts = Transport.start, ss = Save.soon, us = UI.soon, tt = UI.toast, am = Forms.applyMix, all0 = Dreh73.all; Transport.start = () => {}; Save.soon = () => {}; UI.soon = () => {}; UI.toast = () => {}; Forms.applyMix = () => {};
      let o; try { Forms.list = [A, Bf, C]; Dreh73.all = true; Dreh73.act("r:2", A); const a = [A, Bf, C].every(f => Math.abs(Dreh73.rpb(f) - 2) < 1e-9);
        Dreh73.act("pp", A); const b = [A, Bf, C].every(f => f.still && Dreh73.rpb(f) === 0); Dreh73.act("pp", A); const c = [A, Bf, C].every(f => !f.still && Math.abs(Dreh73.rpb(f) - 2) < 1e-9);
        Dreh73.act("flip", A); const d = [A, Bf, C].every(f => Dreh73.dir(f) === -1);
        Dreh73.all = false; Dreh73.act("r:0.5", A); const e = Math.abs(Dreh73.rpb(A) - 0.5) < 1e-9 && Math.abs(Dreh73.rpb(Bf) - 2) < 1e-9;
        o = a && b && c && d && e && Dreh73.html(A).includes('data-dr="all"'); }
      finally { Forms.list = fl; Transport.start = ts; Save.soon = ss; UI.soon = us; UI.toast = tt; Forms.applyMix = am; Dreh73.all = all0; }
      ok("D4", o, "Dreh-Leiste „alle“: Tempo, Stopp, Weiter und Richtung gelten für alle Formen zugleich · ohne „alle“ nur für die gewählte"); } catch (e) { ok("D4", false, String(e)); }
