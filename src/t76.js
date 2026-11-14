

    // v76: Start-Melodie für alle, eigene Melodien einzeln
    try { const ma = Mel.add, ms = Mel.set, fl = Forms.list, op = StartMel.opt, up = Undo.push, ss = Save.soon, ur = UI.refresh; const made = []; let o;
      try { Undo.push = () => {}; Save.soon = () => {}; UI.refresh = () => {};
        Mel.add = (f, d, n) => { made.push(f.id + ":" + n); const m = { id: "x" + made.length, name: n, d: d.slice() }; (f.mels = f.mels || []).push(m); f.mel = m; return m; };
        const mk = () => [{ id: "a", kind: "synth" }, { id: "b", kind: "drum" }, { id: "c", kind: "synth" }, { id: "d", kind: "sample" }, { id: "e", kind: "sample" }]; Forms.list = mk();
        StartMel.opt = { n: 4, own: { 2: "wellen", 3: "auto" } }; const F = StartMel.apply([0, 2, 4]);
        const a = made.join() === "a:Start-Melodie,c:Start-Melodie,c:Wellen,d:Start-Melodie" && F.map(f => f.id).join() === "a,c,d" && Forms.list[0].mel.name === "Start-Melodie" && Forms.list[2].mel.name === "Wellen" && Forms.list[3].mel === null && Forms.list[3].mels.length === 1 && !Forms.list[4].mels;   // die fünfte Form (Aufnahme) gehört nicht zum Blatt
        made.length = 0; Forms.list = mk(); StartMel.opt = { n: 4, own: { 0: "fanfare" } }; const F2 = StartMel.apply([]); const b = made.join() === "a:Fanfare" && F2.length === 1;                                                    // ohne Start-Melodie: nur die eigene
        made.length = 0; Forms.list = mk(); StartMel.opt = null; StartMel.apply([0, 1]); const c = made.length === 4;                                                                                                               // ohne Angaben: alle Formen mit Tonhöhen
        // im Stück: Start-Melodie finden, einer Form eine eigene geben, alle zurückstellen
        Forms.list = mk(); StartMel.opt = { n: 5, own: {} }; StartMel.apply([0, 2, 4, 7]); const st = MelWahl76.start(), f0 = Forms.list[0]; Mel.add(f0, [5, 4], "Melodie 1"); const own = MelWahl76.label(f0) === "Melodie 1" && MelWahl76.label(Forms.list[2]) === "Start-Melodie";
        const n = MelWahl76.setStartAll([1, 3]); const d = st.join() === "0,2,4,7" && own && n === 4 && Forms.list.filter(f => f.kind !== "drum").every(f => f.mel.name === "Start-Melodie" && f.mel.d.join() === "1,3") && f0.mels.length === 2 && MelWahl76.start().join() === "1,3" && MelWahl76.label({ mel: null }) === "frei";
        o = a && b && c && d && StartMel.pick("start") === null && StartMel.pick("ruhig").d.length === 4 && StartMel.pick("zufall").d.length === 8; }
      finally { Mel.add = ma; Mel.set = ms; Forms.list = fl; StartMel.opt = op; Undo.push = up; Save.soon = ss; UI.refresh = ur; }
      ok("M6", o, "Start-Melodie für alle: jede Form mit Tonhöhen bekommt sie in ihre Sammlung · wer eine eigene gewählt hat, spielt diese und behält die Start-Melodie zum Zurückwechseln · „frei“ spielt keine feste Melodie · im Stück: eigene Melodie nur für eine Form, neue Start-Melodie für alle, alle zurück auf die Start-Melodie"); } catch (e) { ok("M6", false, String(e)); }
