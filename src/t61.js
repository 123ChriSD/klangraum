
    // v61: Einzelklang, Takt-Vorlauf, Klang-Puffer
    try { const sr = 48000, x = new Float32Array(sr * 3); for (let i = sr; i < sr * 1.5; i++) x[i] = Math.sin(i / sr * 2 * Math.PI * 330) * 0.5 * Math.exp(-(i - sr) / sr * 4);
      const y = LoopSt.trimSound(x, sr, 6), st = y ? y.length / sr : 0, pk = y ? Math.max(...Array.from(y.subarray(0, 4000)).map(Math.abs)) : 0;
      ok("EK", !!y && st > 0.3 && st < 0.75 && pk > 0.5, `Einzelklang ausgeschnitten: ${st.toFixed(2)} s aus 3 s Aufnahme (Stille davor/danach entfernt), Pegel angeglichen · Wahl Instrument-Form / Loop / beides`); } catch (e) { ok("EK", false, String(e)); }
    try { const keep = { ah: Transport._ah, lt: Transport._lt }; Transport._lt = performance.now() - 200; const a1 = Transport.ahead(); Transport._lt = performance.now() - 20; let a2 = a1; for (let k = 0; k < 400; k++) { Transport._lt = performance.now() - 20; a2 = Transport.ahead(); } Object.assign(Transport, { _ah: keep.ah, _lt: keep.lt });
      ok("TV", a1 >= 0.3 && a1 <= 0.4 && Math.abs(a2 - Stab.base()) < 0.02 && typeof Ticker.start === "function", `Takt-Vorlauf: nach 200 ms Hänger ${Math.round(a1 * 1000)} ms, danach zurück auf ${Math.round(a2 * 1000)} ms · Zeitgeber ${Ticker.ok ? "im eigenen Faden" : "im Hauptfaden"} · Klang-Puffer ${Stab.mode()} (${Stab.hint()}), höchstens ${Stab.vmax()} Stimmen`); } catch (e) { ok("TV", false, String(e)); }
