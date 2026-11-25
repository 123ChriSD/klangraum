
    // v82: Klangfeld
    try { const F = Feld82, G = { x: 0, y: 0, w: 400, h: 600, cols: 8, rows: 3, cw: 50, rh: 200 }, c = (x, y) => { const q = F.cellOf(G, x, y); return [q.c, q.r, Math.round(q.fy * 100)].join(); };
      const a = c(10, 590) === "0,2,95" && c(399, 5) === "7,0,3" && c(-20, 900) === "0,2,100" && c(125, 300) === "2,1,50";
      const b = F.kOf(0, 2, 3) === 0 && F.kOf(7, 2, 3) === 7 && F.kOf(0, 1, 3) === 7 && F.kOf(7, 0, 3) === 21 && F.kOf(3, 0, 2) === 10;
      const d = F.velAt(1) === 0.98 && F.velAt(0) === 0.5 && F.bend(0, 50) === 0 && F.bend(25, 50) === 50 && F.bend(-500, 50) === -50 && F.bend(10, 50) === 20 && F.chordKs(3).join() === "3,5,7";
      ok("KF", a && b && d, "Klangfeld: jede Spalte ist eine Stufe der Tonleiter, jede Zeile eine Oktave (unten tief) – es gibt nur passende Töne · weiter unten in der Zelle klingt es kräftiger · Wackeln biegt den Ton höchstens einen Viertelton · „Akkord“ legt Terz und Quinte der Tonleiter dazu"); } catch (e) { ok("KF", false, String(e)); }
    try { const g = Feld82.groups(), all = g.flatMap(x => x[1]), ids = new Set(all.map(s => s.id));
      ok("KG", g.length >= 8 && all.length >= 90 && ids.has("klavier") && ids.has("trommel") && ids.has("kit_909") && ids.has("stimme_aah") && ids.size === all.length && g.some(x => x[0] === "Schlagzeug") && g.every(x => x[0] && x[1].length) && Alles73.MAKE.some(m => m[0] === "feld") && P78.keys("form").includes("a:mk:feld") && Help.T.some(t => t.id === "v82") && Feld82.rgba("#FF8000", 0.5) === "rgba(255,128,0,0.500)", "Klangfeld: alle Instrumente der App stehen zur Wahl, nach Art geordnet (keines doppelt) · erreichbar über Form → Klangfeld"); } catch (e) { ok("KG", false, String(e)); }
