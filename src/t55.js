
    // v55: Loopstation, feines Drehtempo
    try { const k = { s: LoopSt.slots, L: LoopSt.L, st: LoopSt.startT, sp: LoopSt.stopT, R: LoopSt.R }, hits = [];
      LoopSt.R = null; LoopSt.slots = [{ id: "x", rec: "rX", on: true, bpm: 120, vol: 1, ch: 1, pend: false }, null, { id: "y", rec: "rY", on: false, bpm: 120, vol: 1, ch: 1 }, null]; LoopSt.L = 32; LoopSt.bufs.set("rX", { duration: 4, length: 192000 }); LoopSt.bufs.set("rY", { duration: 4, length: 192000 });
      LoopSt.startT = (t, b, time, ph) => hits.push(time + ":" + ph); LoopSt.stopT = () => {};
      for (let st = 0; st < 100; st++) LoopSt.onStep(st, st); LoopSt.slots[0].pend = true; LoopSt.onStep(105, 105);
      Object.assign(LoopSt, { slots: k.s, L: k.L, startT: k.st, stopT: k.sp, R: k.R }); LoopSt.bufs.delete("rX"); LoopSt.bufs.delete("rY");
      ok("LS1", hits.join() === "0:0,32:0,64:0,96:0,105:9", `Loopstation: 2-Takt-Loop startet bei Schritt ${hits.join(" · ")} (immer zur Loop-Eins, nach dem Einschalten an der richtigen Stelle); gestoppte Spur schweigt`); } catch (e) { ok("LS1", false, String(e)); }
    try { const a = LoopSt.fitBars(4), b = LoopSt.fitBars(10), c = LoopSt.fitBars(2.2), d = LoopSt.fitBars(25);
      ok("LS2", a.n === 2 && Math.abs(a.bpm - 120) < 1e-9 && b.n === 4 && Math.abs(b.bpm - 96) < 1e-9 && c.n === 1 && d.n === 8, `Frei aufgenommen: 4 s → ${a.n} Takte ${a.bpm.toFixed(0)} BPM · 10 s → ${b.n} Takte ${b.bpm.toFixed(0)} BPM · 2,2 s → ${c.n} Takt ${c.bpm.toFixed(0)} BPM · 25 s → ${d.n} Takte ${d.bpm.toFixed(0)} BPM`); } catch (e) { ok("LS2", false, String(e)); }
    try { const L0 = LoopSt.L, N = 1000; LoopSt.L = 32; const sp = Transport.spb, t0 = Transport.t0;
      const i1 = LoopSt.dubIdx(t0 + 8 * sp, N), i2 = LoopSt.dubIdx(t0 + 40 * sp, N), i3 = LoopSt.dubIdx(t0 - 8 * sp, N), i4 = LoopSt.dubIdx(t0 + 31.99 * sp, N); LoopSt.L = L0;
      ok("LS3", i1 === 250 && i2 === 250 && i3 === 750 && i4 === 999, `Overdub landet an der Loop-Stelle: Schritt 8 → ${i1}, Schritt 40 (2. Runde) → ${i2}, vor dem Start → ${i3}, Ende → ${i4} (von ${N})`); } catch (e) { ok("LS3", false, String(e)); }
    try { const keep = LoopSt.data();
      LoopSt.load({ L: 32, slots: [{ id: "a", rec: "rT1", name: "Spur 1", vol: 0.8, on: true, bpm: 120, ch: 1, src: "mic" }, null, { id: "b", rec: "rT2", prev: "rT0", name: "Spur 3", vol: 1, on: false, bpm: 100, ch: 2, src: "form" }] });
      const d = LoopSt.data(), pd = Project.data(true).ls; const idm = new Map([["rT1", "rN1"], ["rT0", "rN0"]]), cp = JSON.parse(JSON.stringify({ ls: d })); MicWin.remap(cp, idm);
      const pass = d.L === 32 && d.slots.length === 4 && d.slots[0].rec === "rT1" && d.slots[0].vol === 0.8 && d.slots[2].src === "form" && d.slots[2].prev === "rT0" && !d.slots[1] && pd && pd.slots[2].bpm === 100 && cp.ls.slots[0].rec === "rN1" && cp.ls.slots[2].prev === "rN0";
      LoopSt.load(keep); ok("LS4", pass, `Loopstation wird mit dem Stück gespeichert (Länge ${d.L / 16} Takte, ${d.slots.filter(Boolean).length} Spuren, Quelle, Lautstärke, Overdub-Rückgängig) und beim Übertragen mitgenommen`); } catch (e) { ok("LS4", false, String(e)); }
    try { if (!App.started) ok("LS5", true, "nicht gestartet"); else { const t0 = UI.tab; UI.setTab("loop"); const v = $("vLoop"), pads = v ? v.querySelectorAll(".lqpad").length : 0, cur = $("tLoop").getAttribute("aria-current"), big = v && v.querySelector(".lqbig");
      const vis = v && !v.hidden && big && big.getBoundingClientRect().height >= 100; UI.setTab(t0 === "loop" ? "klang" : t0); const back = $("vLoop").hidden;
      ok("LS5", pads >= 4 && cur === "page" && vis && back, `Bereich „Loop“: ${pads} große Felder (${big ? Math.round(big.getBoundingClientRect().height) : 0} px hoch), Knopf unten markiert, beim Wechsel wieder zu`); } } catch (e) { ok("LS5", false, String(e)); }
    try { const f = Forms.list.find(x => !x.empty); if (!f) ok("FT", true, "keine Form"); else {
      const p = Motion.ph(f), sv = { wy: p.wy, wx: p.wx, gl: p.gl, still: f.still, dreh: f.mot.dreh, lk: p.lk }, cat = FBar.cat, run = Transport.running;
      const q1 = Motion.fineR(Motion.level(3)), q2 = Motion.fineR(Motion.level(3) * 1.06), q3 = Motion.fineR(Motion.level(5) * 3);
      p.gl = null; f.still = false; p.wy = Motion.level(3); Move.faster(f); const r1 = Move.rpb(f); Move.slower(f); Move.slower(f); const r2 = Move.rpb(f);
      FBar.cat = "dreh"; const h = FBar.rows(f); FBar.cat = cat; const sl = Move.sv(1), back = Move.vr(sl);
      Object.assign(p, { wy: sv.wy, wx: sv.wx, gl: sv.gl, lk: null }); f.still = sv.still; f.mot.dreh = sv.dreh; if (!run && Transport.running) Transport.stop();
      ok("FT", q1 === 1 && Math.abs(q2 - Math.pow(2, 1 / 12)) < 1e-12 && q3 === 4 && Math.abs(r1 - Math.pow(2, 1 / 6)) < 1e-9 && Math.abs(r2 - Math.pow(2, -1 / 6)) < 1e-9 && h.includes('data-fr="spd"') && Math.abs(back - 1) < 0.02,
        `Drehtempo fein: + → ${r1.toFixed(3)}, 2× − → ${r2.toFixed(3)} U/Takt (vorher nur 0,5 · 1 · 2); Raster ${q2.toFixed(4)} = 2^(1/12); Regler im Steuerfeld (1 U/Takt ↔ ${sl})`); } } catch (e) { ok("FT", false, String(e)); }
