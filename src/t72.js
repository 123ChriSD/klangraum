

    // v72: Bewegung – Lage- und Beschleunigungssensoren
    try { const B = Beweg, st = { on: B.on, lr: B.lr, fb: B.fb, zero: B.zero, got: B.got, ls: B.lastShake, ns: B.nShake }, wc = Wucht.cut, lv = Live70.on; let cuts = 0; Wucht.cut = on => { if (on) cuts++; };
      let o;
      try { B.zero = null; B.got = 0; B.lr = 0; B.fb = 0;
        B.feed(40, 5, 0); const z = B.lr === 0 && B.fb === 0 && B.zero[0] === 5;                                        // die Haltung beim Einschalten ist die Mitte
        for (let i = 0; i < 40; i++) B.feed(40, 5 - 39, 0); const left = B.lr < -0.99 && Math.abs(B.fb) < 0.01;          // 39° nach links = ganz dumpf
        for (let i = 0; i < 40; i++) B.feed(40 - 20, 5, 0); const fwd = Math.abs(B.lr) < 0.01 && Math.abs(B.fb - (20 - 4) / 31) < 0.02;   // obere Kante 20° weg = Echo
        for (let i = 0; i < 40; i++) B.feed(40 + 3, 5 + 3, 0); const dead = B.lr === 0 || Math.abs(B.lr) < 1e-4;          // kleines Zittern tut nichts
        const ax = JSON.stringify([B.axes(10, 20, 0), B.axes(10, 20, 90), B.axes(10, 20, 180), B.axes(10, 20, 270)]) === "[[20,-10],[10,20],[-20,10],[-10,-20]]";
        B.lastShake = -1e9; B.nShake = 0; const s1 = B.shake(20, 1000), s2 = B.shake(20, 1100), s3 = B.shake(5, 2000), s4 = B.shake(15, 2000);
        o = z && left && fwd && dead && ax && s1 && !s2 && !s3 && s4 && cuts === 2 && B.nShake === 2; }
      finally { Wucht.cut = wc; Object.assign(B, { lr: st.lr, fb: st.fb, zero: st.zero, got: st.got, lastShake: st.ls, nShake: st.ns }); }
      let w = true; if (Engine.ctx && Wucht.n) { Wucht.tilt(0.6); const hp = Wucht.n.hp; w = !!hp && hp.type === "highpass"; Wucht.tilt(0); Wucht.echoAmt(0.5); Wucht.echoAmt(0); }
      ok("BG", o && w && B.on === st.on && !B.on && typeof B.start === "function", `Bewegung: die Haltung beim Einschalten ist die Mitte · 39° links = ganz dumpf, 20° nach vorn = halbes Echo, Zittern unter 4° bleibt ohne Wirkung · gedrehter Bildschirm tauscht die Achsen · ein Ruck = ein Stotter, frühestens alle 0,17 s · Hochpass sitzt in der Summe · ohne Einschalten bleibt alles aus`); } catch (e) { ok("BG", false, String(e)); }
    try { const hs = Live70.holdSet, ea = Wucht.echoAmt, mx = Live70.mainXY, st = { X: Live70.X, e: Live70.mtEcho, c: Live70.mtCut, h: Live70.hold }; const log = []; let amt = 0;
      let o; try { Live70.hold = {}; Live70.holdSet = (k, on) => { Live70.hold[k] = on; log.push(k + (on ? "+" : "-")); }; Wucht.echoAmt = a => { amt = a; }; Live70.mainXY = () => [100, 100, 300]; Live70.mtEcho = false; Live70.mtCut = false;
        Live70.X = [{ id: 1, x: 100, y: 190 }]; Live70.mtUpdate(); const a1 = amt; Live70.X[0].y = 400; Live70.mtUpdate(); const a2 = amt;
        Live70.X.push({ id: 2, x: 50, y: 50 }); Live70.mtUpdate(); Live70.X.pop(); Live70.mtUpdate(); Live70.X = []; Live70.mtUpdate();
        o = Math.abs(a1 - 0.5) < 1e-6 && a2 === 1 && log.join(" ") === "echo+ cut+ cut- echo-" && Live70.echoFor(0, 300) === 0.25; }
      finally { Live70.holdSet = hs; Wucht.echoAmt = ea; Live70.mainXY = mx; Live70.X = st.X; Live70.mtEcho = st.e; Live70.mtCut = st.c; Live70.hold = st.h; }
      ok("L2", o, "Live-Fläche mit mehreren Fingern: zweiter Finger schaltet das Echo, sein Abstand zum Punkt regelt die Stärke (nah 25 %, weit 100 %) · dritter Finger = Stille, beim Abheben setzt alles wieder ein · sind alle weiteren Finger weg, ist auch das Echo aus"); } catch (e) { ok("L2", false, String(e)); }
    try { const A = Auto72, st = { on: A.on, c: A.chunks, f: A.frames, q: A.quiet }, ss = store.set, ra = Recs.add, so = Sheets.open, pc = Projects.cur; let saved = null, asked = 0; store.set = () => {};
      let o; try { const sr = A.sr(), blk = (amp, n = sr / 2) => { const a = new Float32Array(n).fill(amp); return [a, a]; };
        A.on = true; A.chunks = []; A.frames = 0; A.quiet = 0;
        for (let i = 0; i < 6; i++) A.push(blk(0.3)); const t1 = Math.abs(A.secs() - 3) < 0.01;                                   // 3 s Klang
        for (let i = 0; i < 20; i++) A.push(blk(0)); const t2 = A.secs() < 4.3 && A.secs() > 3.9;                                    // 10 s Stille: nur gut 1 s bleibt
        for (let i = 0; i < 12; i++) A.push(blk(0.2)); const t3 = A.secs() > 9.9;
        Sheets.open = () => { asked++; return so.apply(Sheets, ["x", "<p></p>"]); }; const p0 = A.ask.call({ ...A, on: true, secs: () => 3, reset() {}, MIN: 8 }, "T");                       // unter 8 s: keine Frage
        Recs.add = async (ch, r, name, kind) => { saved = { n: ch[0].length, r, name, kind, pk: Math.max(...ch[0].slice(0, 200)) }; return { id: "x" }; };
        const pr = A.save("Probe"); o = t1 && t2 && t3 && asked === 0 && p0 instanceof Promise && saved && saved.kind === "mitschnitt" && saved.name === "Probe" && saved.n > 9.9 * sr && Math.abs(saved.pk - 0.3) < 0.001 && A.frames === 0 && pr instanceof Promise;
        const cap = (() => { A.chunks = []; A.frames = 0; A.quiet = 0; const big = blk(0.2, sr * 10); for (let i = 0; i < 40; i++) A.push(big); return A.secs() <= A.max() + 10 && A.secs() >= A.max() - 10; })(); o = o && cap; }
      finally { store.set = ss; Recs.add = ra; Sheets.open = so; try { UI.hideSheets(); } catch (_) {} A.on = st.on; A.chunks = st.c; A.frames = st.f; A.quiet = st.q; }
      ok("AM", o && typeof Projects.openId === "function", "Mitschnitt: was klingt, wird von selbst aufgenommen · lange Stille fällt bis auf gut eine Sekunde weg · höchstens die letzten Minuten bleiben (Speicher) · unter 8 Sekunden wird beim Wechsel nicht gefragt · Speichern legt eine Aufnahme mit unverändertem Pegel an und leert den Mitschnitt"); } catch (e) { ok("AM", false, String(e)); }
    try { const g = { e: Einsp.open, s: Schrift.open, l: Live70.open, lf: Live70.forms, tk: Tools.toggleKnead, st: UI.setTab, sv: UI.setView }, log = [], t0 = UI.tab;
      let o; try { Einsp.open = () => log.push("tasten"); Schrift.open = () => log.push("noten"); Live70.open = () => log.push("live"); Live70.forms = () => [1]; Tools.toggleKnead = on => { if (on) log.push("knet"); }; UI.setTab = t => log.push("tab:" + t); UI.setView = () => {};
        for (const k of ["tasten", "noten", "live", "knet"]) Ber72.go(k); const s = Ber72.strip("noten");
        o = log.join(",") === "tasten,noten,live,tab:klang,knet" && (s.match(/data-ber=/g) || []).length === 4 && /data-ber="noten" aria-pressed="true"/.test(s) && Ber72.cur() === null; }
      finally { Einsp.open = g.e; Schrift.open = g.s; Live70.open = g.l; Live70.forms = g.lf; Tools.toggleKnead = g.tk; UI.setTab = g.st; UI.setView = g.sv; if (UI.tab !== t0) UI.setTab(t0); }
      ok("BR", o, "Bereichswechsel: eine Leiste mit Tasten · Noten · Kneten · Live führt in jeden der vier Bereiche · der aktuelle ist markiert · die Live-Fläche kann schließen, ohne die Musik anzuhalten"); } catch (e) { ok("BR", false, String(e)); }
