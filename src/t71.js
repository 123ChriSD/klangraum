

    // v71: mit allen Fingern modellieren – Klangschrift (mehrere Finger, verschieben, längen) und Kneten mit Ton
    try { const f = App.started ? Forms.list.find(x => Einsp.playable(x) && !Einsp.drum(x)) : null;
      if (!f) ok("MT", typeof Schrift.moveEv === "function" && Schrift.drags instanceof Map, "Klangschrift mit mehreren Fingern: ohne spielbaren Klang nicht prüfbar");
      else { const tk = f.takes ? f.takes.slice() : null, ev0 = tk && tk[0] ? tk[0].ev.slice() : null, b0 = tk && tk[0] ? tk[0].bars : 0, es = Einsp.start, tp = UI.toast, up = Undo.push, fp = Forms.play, ss = Save.soon, ad = SongUI.adopt, t0 = UI.tab; let played = 0; Einsp.start = () => {}; UI.toast = () => {}; Undo.push = () => {}; Forms.play = () => { played++; return null; }; Save.soon = () => {}; SongUI.adopt = () => {};
        try { if (f.takes) f.takes = []; Schrift.open(f); const g = $("knGrid"), R = g.getBoundingClientRect(), cw = Schrift.cw, rh = Schrift.rh, cue = !!$("knCue");
          const pe = (type, id, col, row) => g.dispatchEvent(new PointerEvent(type, { pointerId: id, bubbles: true, cancelable: true, clientX: R.left + (col + 0.5) * cw, clientY: R.top + (row + 0.5) * rh, pointerType: "touch" }));
          pe("pointerdown", 71, 2, 3); pe("pointerdown", 72, 2, 5); pe("pointerdown", 73, 2, 7); const three = Schrift.drags.size === 3; pe("pointerup", 71, 2, 3); pe("pointerup", 72, 2, 5); pe("pointerup", 73, 2, 7);
          const t = Schrift.t, chord = !!t && t.ev.length === 3 && t.ev.every(e => e.s === 2) && new Set(t.ev.map(e => e.m)).size === 3 && !$("knCue");
          // zwei Töne gleichzeitig verschieben: einer zwei Zeilen höher und drei Schritte später, einer eine Zeile tiefer
          const a = Schrift.evAtCell(3, 2), b = Schrift.evAtCell(7, 2), am = a.m, bm = b.m, p0 = played;
          pe("pointerdown", 74, 2, 3); pe("pointerdown", 75, 2, 7); pe("pointermove", 74, 5, 1); pe("pointermove", 75, 2, 8); pe("pointerup", 74, 5, 1); pe("pointerup", 75, 2, 8);
          const moved = t.ev.length === 3 && a.s === 5 && a.m === Schrift.midiOf(Schrift.hi - 1) && a.m > am && b.s === 2 && b.m === Schrift.midiOf(Schrift.hi - 8) && b.m < bm && played >= p0 + 2;
          // am rechten Ende länger ziehen (Ton mit Länge 4), dann antippen = löschen
          Schrift.add(9, 0, 4); const c = Schrift.evAtCell(9, 0); g.dispatchEvent(new PointerEvent("pointerdown", { pointerId: 76, bubbles: true, clientX: R.left + 3.8 * cw, clientY: R.top + 9.5 * rh })); pe("pointermove", 76, 6, 9); pe("pointerup", 76, 6, 9); const sized = c.d === 7 && c.s === 0;
          pe("pointerdown", 77, 1, 9); pe("pointerup", 77, 1, 9); const gone = !t.ev.includes(c) && t.ev.length === 3 && Schrift.drags.size === 0;
          ok("MT", cue && three && chord && moved && sized && gone, `Klangschrift mit mehreren Fingern: drei Finger setzen drei Töne auf denselben Schlag (Akkord) · zwei Töne werden gleichzeitig verschoben (Tonhöhe hörbar, Zeit) · am rechten Ende ziehen ändert die Länge (4 → ${c.d}) · antippen löscht · leeres Feld zeigt „Tippe ins Feld“`); }
        finally { try { if (Schrift.on) Schrift.close(); } catch (_) {} if (tk) { f.takes = tk; if (tk[0] && ev0) { tk[0].ev = ev0; tk[0].bars = b0; } } else delete f.takes; Einsp.start = es; UI.toast = tp; Undo.push = up; Forms.play = fp; Save.soon = ss; SongUI.adopt = ad; if (UI.tab !== t0) UI.setTab(t0); } } } catch (e) { ok("MT", false, String(e)); }
    try { const fp = Forms.play, fr = Forms.release, cn = Knet71.can; let pl = 0, rl = 0; Forms.play = () => { pl++; return { id: pl }; }; Forms.release = () => { rl++; }; Knet71.can = () => true;
      let o1, o2, o3; try { const p = { id: 9001, f: Forms.active || {}, u: 0.4, dir: [0, 1, 0], x: 100, y: 100, x0: 100, y0: 100 }, q = { id: 9002, f: p.f, u: 0.7, dir: [1, 0, 0], x: 200, y: 120, x0: 200, y0: 120 };
        Knet71.tone(p); Knet71.tone(q); o1 = pl === 2 && !!p.kh && !!q.kh; Knet71.tone(p, 0.5); o2 = pl === 3 && rl === 1; Knet71.hush(p); Knet71.hush(q); o3 = rl === 3 && !p.kh && !q.kh;
        Knet71.dot(p, true); Knet71.dot(q, true); o3 = o3 && document.querySelectorAll(".kn71dot").length === 2; Knet71.dot(p, false); Knet71.clear(); o3 = o3 && !document.querySelector(".kn71dot"); }
      finally { Forms.play = fp; Forms.release = fr; Knet71.can = cn; }
      const fake = { empty: false }, tr = Transport.running, lc = Loops.count, au = Forms.audible; let busy; try { Transport.running = true; Loops.count = () => 1; Forms.audible = () => true; busy = Engine.ctx ? Knet71.can(fake) === false : true; } finally { Transport.running = tr; Loops.count = lc; Forms.audible = au; }
      const tile = (Home67.TILES.find(t => t[0] === "play") || [])[2] === "Klang kneten";
      ok("KT", o1 && o2 && o3 && busy && tile && Knet71.can({ empty: true }) === false, `Kneten klingt: jeder knetende Finger hat seinen eigenen Ton und seinen eigenen Ring, beim Weiterkneten klingt er neu, beim Loslassen endet er · spielt die Form gerade ihren Loop, bleibt der Knet-Ton aus · Kachel „Klang kneten“ auf der Startseite`); } catch (e) { ok("KT", false, String(e)); }
