

    // v65: Kneten wirkt auf Drum-Kits und Loop-Formen, Tonstufen-Anzeige, Lieder, Rückblick-Raster, Loops bis 16 Takte
    try { const f = { seedId: "kit_909", kind: "drum", h: K.seedShape(K.seedById("kit_909")), size: 1.15, stretch: 0.62, spin: 0, env: K.seedById("kit_909").env, fine: { att: 1, rel: 1 }, mute: false };
      f.an = K.analyze(f.h); f.snd = K.soundOf(f, f.an); const o0 = Forms.fpOf(f, f);
      const h = f.h.slice(), r = K.rng(5); for (let k = 0; k < 14; k++) { const z = r() * 2 - 1, th = r() * 6.283, q = Math.sqrt(1 - z * z); K.brush(h, [q * Math.cos(th), z, q * Math.sin(th)], 0.45, 0.07); }
      f.h = h; f.an = K.analyze(h); f.snd = K.soundOf(f, f.an); const o1 = Forms.fpOf(f, f);
      ok("KD", Math.abs(o0.it || 0) < 0.05 && (o1.it || 0) > 0.4 && (o1.ir || 0) > 0.1, `Drum-Kit geknetet: Startform neutral (Helligkeit ${fmt(o0.it || 0, 2)}), spitz → heller ${fmt(o1.it, 2)}, rauer ${fmt(o1.ir, 2)}${o1.drive ? `, angezerrt ${fmt(o1.drive, 2)}` : ""} – vorher blieb der Klang gleich`); } catch (e) { ok("KD", false, String(e)); }
    try { const sd = K.seedById("kugel"), mk = h => ({ seedId: "kugel", an: K.analyze(h) }), h0 = K.seedShape(sd), hs = h0.slice(), hr = h0.slice(), r = K.rng(9);
      for (let k = 0; k < 14; k++) { const z = r() * 2 - 1, th = r() * 6.283, q = Math.sqrt(1 - z * z); K.brush(hs, [q * Math.cos(th), z, q * Math.sin(th)], 0.45, 0.07); }
      const a = LoopKnead.of(mk(h0)), b = LoopKnead.of(mk(hs)), dull = { seedId: "wolke", an: K.analyze(h0) }, c = LoopKnead.of(dull);
      ok("LK", a.cut === 20000 && a.hi === 0 && b.hi > 3 && b.drv > 0.1 && c.cut < 16000, `Loop-Form: Startform neutral · spitz → +${fmt(b.hi, 1)} dB Höhen, ${fmt(b.drv * 100, 0)} % Anzerrung · rund (Wolke-Spitzen weg) → Tiefpass ${fmt(c.cut, 0)} Hz`); } catch (e) { ok("LK", false, String(e)); }
    try { const f = Forms.active || Forms.list[0]; if (!f) ok("KB", true, "keine Form"); else { KneadPitch.show(f); const b = $("kpBadge"), vis = !b.hidden; KneadPitch.lastShow = performance.now() - 5000; KneadPitch.tick(b);
      ok("KB", vis && !b.classList.contains("on"), `Tonstufen-Anzeige erscheint beim Kneten und verschwindet nach gut 2 s von selbst (auch im Knet-Modus, beim Wechsel des Bereichs, bei offenen Blättern)`); } } catch (e) { ok("KB", false, String(e)); }
    try { const bad = []; for (const s of Lieder.L) { const tot = s.m.reduce((a, x) => a + x[1], 0), bars = tot / 16, ks = Lieder.notes(s).map(n => n.k); if (bars !== Math.round(bars) || bars > 16 || bars < 1 || s.prog.length !== bars || Math.min(...ks) < 0 || Math.max(...ks) > 14) bad.push(`${s.n} (${bars} Takte, Akkorde ${s.prog.length}, Tasten ${Math.min(...ks)}…${Math.max(...ks)})`); }
      ok("LI", !bad.length, bad.length ? "Lied fehlerhaft: " + bad.join("; ") : `${Lieder.L.length} Lieder: ganze Takte, Akkord je Takt, alle Töne auf den 15 Tasten (${Lieder.L.map(s => Lieder.bars(s)).join("/")} Takte)`); } catch (e) { ok("LI", false, String(e)); }
    try { const f = KeysUI.forms()[0]; if (!f) ok("AL", true, "keine Instrument-Form"); else { const keep = Project.data(true), tp = UI.toast, ta = UI.toastAct, acc = KeysUI.acc; UI.toast = () => {}; UI.toastAct = () => {}; KeysUI.acc = true;
      try { const s = Lieder.byId("entchen"), n0 = Forms.list.length, t = KeysUI.asLoop(s, f), m = t.ev.map(e => e.m), st = m.map(x => x - m[0]);
        const ch = s.prog.map((_, i) => Transport.chordAtStep(i * 16)).join(""), want = s.prog.join(""), b = Forms.list.find(g => g.lied === s.id);
        const sem = st.slice(0, 5).join(","), durOk = Music.mood.mode !== "ionian" || sem === "0,2,4,5,7";
        ok("AL", t.bars === 10 && t.ev.length === 27 && durOk && ch === want, `„${s.n}“ als Loop: ${t.bars} Takte, ${t.ev.length} Töne auf ${f.name} (Abstände ${sem})${b ? " + Begleitung (" + b.takes[b.takes.length - 1].ev.length + " Akkordtöne)" : ""} · Akkorde aller Formen folgen dem Lied (${ch === want ? "ja" : "nein: " + ch + " statt " + want})`); }
      finally { UI.toast = tp; UI.toastAct = ta; KeysUI.acc = acc; Project.load(keep, true); } } } catch (e) { ok("AL", false, String(e)); }
    try { const L = Lied.prog(); ok("LO", !L || Lied.cur, `Lied-Akkorde nach dem Zurücksetzen: ${Lied.cur ? "„" + Lied.cur.n + "“" : "aus (Stimmung)"}`); } catch (e) { ok("LO", false, String(e)); }
    try { const r = { dur: 10, sr: 48000, rt: { t0: 100.3, bar: 2, tt0: 50, run: true } }; RetroEd.r = r; const g = RetroEd.bars(); RetroEd.r = null;
      ok("RE", g && g.length === 5 && Math.abs(g[0] - 1.7) < 1e-6 && Math.abs(g[4] - 9.7) < 1e-6, `Rückblick kennt die Taktgrenzen (Uhr des Audiosystems): ${g ? g.map(x => fmt(x, 1)).join(" · ") : "–"} s → Ausschnitte rasten auf Takte ein, Loops passen genau`); } catch (e) { ok("RE", false, String(e)); }
    try { const f = { takes: [] }; const t = Loops.newTake(f, 12, []); ok("TB", t.bars === 12, `Loops bis 16 Takte (für ganze Lieder): neuer Loop mit 12 Takten → ${t.bars}`); } catch (e) { ok("TB", false, String(e)); }
