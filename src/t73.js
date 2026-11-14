

    // v73: Start-Melodie, Dreh-Leiste, Alles auf einen Blick
    try { const ma = Mel.add, fl = Forms.list, made = []; let o;
      try { Mel.add = (f, d, n) => { made.push([f.id, d.join(","), n]); }; Forms.list = [{ id: "a", kind: "synth" }, { id: "b", kind: "drum" }, { id: "c", kind: "synth", empty: true }, { id: "d", kind: "sample" }];
        const F = StartMel.apply([0, 2, 4, 7]); o = F.length === 2 && made.length === 2 && made.every(m => m[1] === "0,2,4,7" && m[2] === "Start-Melodie") && made[0][0] === "a" && made[1][0] === "d"; }
      finally { Mel.add = ma; Forms.list = fl; }
      const m0 = StartMel.midi(0), oct = StartMel.midi(7) - m0 === 12, rng = m0 >= 55 && m0 <= 66;
      ok("SM", o && oct && rng && typeof StartMel.after === "function" && typeof NewPiece.go === "function", `Start-Melodie: alle Startformen mit Tonhöhen bekommen dieselbe Melodie als Grundmelodie (Trommel und leere Formen nicht) · acht Tasten = eine Oktave der Tonart ab ${deN(m0)}`); } catch (e) { ok("SM", false, String(e)); }
    try { const f = { rot: 0, bus: -1, pulse: 0, still: false, moff: { x: 0, z: 0 }, mot: { dreh: 0, schwing: 0, puls: 0, kreis: 0, rate: 1 } }, tr = Transport.running, ts = Transport.start, ks = KSheet.sync, ss = Save.soon, us = UI.soon, fa = Forms.active, am = Forms.applyMix; Transport.start = () => {}; KSheet.sync = () => {}; Save.soon = () => {}; UI.soon = () => {}; Forms.applyMix = () => {};
      let o; try { const p = Motion.ph(f);
        Dreh73.act("r:2", f); const a = Math.abs(Dreh73.rpb(f) - 2) < 1e-9 && Dreh73.state(f).i === 3 && Dreh73.state(f).mv;                 // ein Tipp = genau dieser Wert
        Dreh73.act("flip", f); const b = Math.abs(Dreh73.rpb(f) - 2) < 1e-9 && Dreh73.dir(f) === -1;
        Dreh73.act("pp", f); const c = f.still === true && Dreh73.rpb(f) === 0 && !Dreh73.state(f).mv && Dreh73.txt(Dreh73.state(f)) === "angehalten";   // sofort still
        Dreh73.act("pp", f); const d = !f.still && Math.abs(Dreh73.rpb(f) - 2) < 1e-9 && Dreh73.dir(f) === -1;                                   // Weiter: altes Tempo, alte Richtung
        Dreh73.act("r:0.25", f); const e = Math.abs(Dreh73.rpb(f) - 0.25) < 1e-9 && Dreh73.state(f).i === 0;
        Motion.stopForm(f); Motion.push(f, 1.2, 0.3); const h = p.wy !== 0 && p.wx === 0; Motion.stopForm(f); Motion.push(f, 0.2, 1.2); const v = p.wy === 0 && p.wx !== 0; Motion.stopForm(f); Motion.push(f, 1.2, 0.9); const dg = p.wy !== 0 && p.wx !== 0;
        const html = Dreh73.html(f); o = a && b && c && d && e && h && v && dg && (html.match(/data-dr="r:/g) || []).length === 5 && Dreh73.near(1.03) === 2 && Dreh73.near(1.4) === -1; }
      finally { Transport.start = ts; KSheet.sync = ks; Save.soon = ss; UI.soon = us; Forms.applyMix = am; Forms.active = fa; }
      ok("D7", o, "Dreh-Leiste: ein Tipp stellt genau ¼, ½, 1, 2 oder 4 Umdrehungen je Takt ein · Richtung kehrt um bei gleichem Tempo · Stopp hält sofort an, Weiter dreht mit altem Tempo und alter Richtung · waagerechtes Wischen dreht nur, senkrechtes kippt nur, schräges beides"); } catch (e) { ok("D7", false, String(e)); }
    try { const it = Alles73.items(), ids = new Set(it.map(x => x.id)), run = Cmd.run, st = UI.setTab, hs = UI.hideSheets, t0 = UI.tab; const log = [];
      let o; try { UI.hideSheets = () => {}; UI.setTab = t => { log.push("tab:" + t); }; Alles73.act("tab:mix"); o = log.join() === "tab:mix" && it.length >= 50 && ids.size === it.length && it.every(x => x.n && x.gn) && Alles73.AREAS.length === 9 && Alles73.MAKE.length === 9; }
      finally { UI.setTab = st; UI.hideSheets = hs; Cmd.run = run; }
      ok("A7", o, `Alles auf einen Blick: ${it.length} Funktionen in ${new Set(it.map(x => x.g)).size} Gruppen, jede mit Namen · dazu 9 Bereiche und 9 Wege, Musik zu machen · ein Tipp führt hin`); } catch (e) { ok("A7", false, String(e)); }
