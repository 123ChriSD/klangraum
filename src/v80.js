/* ================= Version 80: Autotune für Tonspuren ================= */
/* ---------- 1) Autotune: Tonhöhe messen, auf die Tonleiter ziehen, Dauer bleibt ---------- */
const Tune80 = {
  HOP: 0.01, FMIN: 65, FMAX: 900,
  ARTEN: [["aus", "aus"], ["sanft", "sanft"], ["stark", "stark"]],
  /* Tonhöhe je 10 ms (Hz, 0 = kein klarer Ton) – YIN auf verkleinertem Signal */
  track(x, sr, from = 0, to = null, f0 = null) {
    const D = Math.max(1, Math.round(sr / 12000)), fs = sr / D, n = Math.floor(x.length / D), hop = Math.round(this.HOP * fs), W = Math.round(0.03 * fs), t0 = Math.max(2, Math.floor(fs / this.FMAX)), t1 = Math.ceil(fs / this.FMIN), F = Math.max(0, Math.floor((n - W - t1) / hop));
    if (!this._d || this._dx !== x) { const d = new Float32Array(n); for (let i = 0; i < n; i++) { let s = 0; for (let k = 0; k < D; k++) s += x[i * D + k]; d[i] = s / D; } this._d = d; this._dx = x; }
    const d = this._d, out = f0 || new Float32Array(F + 1), cm = new Float32Array(t1 + 2), end = to == null ? F : Math.min(F, to);
    for (let fr = from; fr < end; fr++) {
      const o = fr * hop; let e = 0; for (let j = 0; j < W; j++) e += d[o + j] * d[o + j];
      if (e / W < 1e-5) { out[fr] = 0; continue; }
      let run = 0, best = -1, bv = 1e9; cm[0] = 1;
      for (let tau = 1; tau <= t1; tau++) { let s = 0; for (let j = 0; j < W; j++) { const q = d[o + j] - d[o + j + tau]; s += q * q; } run += s; cm[tau] = run > 0 ? s * tau / run : 1; }
      for (let tau = t0; tau <= t1; tau++) { if (cm[tau] < 0.15) { while (tau + 1 <= t1 && cm[tau + 1] < cm[tau]) tau++; best = tau; bv = cm[tau]; break; } if (cm[tau] < bv) { bv = cm[tau]; best = tau; } }
      if (best < 0 || bv > 0.35) { out[fr] = 0; continue; }
      let tt = best; if (best > 1 && best < t1) { const a = cm[best - 1], b = cm[best], c = cm[best + 1], q = a - 2 * b + c; if (q > 1e-9) tt = best + 0.5 * (a - c) / q; }
      out[fr] = fs / tt;
    }
    return out;
  },
  /* Ausreißer (Oktavsprünge einzelner Messpunkte) glätten */
  median(f) { const o = new Float32Array(f.length), w = []; for (let i = 0; i < f.length; i++) { w.length = 0; for (let k = -2; k <= 2; k++) { const v = f[i + k]; if (v > 0) w.push(v); } if (!(f[i] > 0) || w.length < 3) { o[i] = f[i] || 0; continue; } w.sort((a, b) => a - b); o[i] = w[w.length >> 1]; } return o; },
  /* erlaubte Töne: Tonklassen der Tonleiter (0–11) oder alle */
  pcs(root, steps) { const s = new Set(); for (const k of steps) s.add(((root + k) % 12 + 12) % 12); return [...s].sort((a, b) => a - b); },
  nearest(m, pcs) { let best = Math.round(m), bd = 99; const c = Math.round(m); for (let k = c - 6; k <= c + 6; k++) { if (!pcs.includes(((k % 12) + 12) % 12)) continue; const d = Math.abs(k - m); if (d < bd) { bd = d; best = k; } } return best; },
  /* Korrektur je Messpunkt in Halbtönen: Zielton mit Hysterese, dann geglättet (sanft) oder sofort (stark) */
  plan(f0, pcs, art) {
    const n = f0.length, c = new Float32Array(n), a = art === "stark" ? 1 : 0.12, amt = art === "stark" ? 1 : 0.85; let tgt = null, cur = 0;
    for (let i = 0; i < n; i++) {
      const f = f0[i]; if (!(f > 0)) { c[i] = 0; cur *= 0.6; tgt = null; continue; }
      const m = 69 + 12 * Math.log2(f / 440), near = this.nearest(m, pcs);
      if (tgt == null || Math.abs(near - m) + 0.3 < Math.abs(tgt - m)) tgt = near;
      const want = (tgt - m) * amt; cur += a * (want - cur); c[i] = cur;
    }
    return c;
  },
  /* Tonhöhe verschieben, ohne die Dauer zu ändern: tonhöhensynchrones Überlagern kurzer Fenster */
  shift(x, sr, f0, corr) {
    const N = x.length, hop = this.HOP * sr, y = new Float32Array(N), ws = new Float32Array(N), Tu = Math.round(sr / 200), marks = [];
    const fr = i => Math.min(f0.length - 1, Math.max(0, Math.round(i / hop)));
    const per = i => { const f = f0[fr(i)]; return f > 0 ? sr / f : Tu; };
    /* Marken im Abstand einer Schwingung, jeweils auf die nächste Spitze gerückt */
    let m = 0; while (m < N) { marks.push(m); const T = per(m), v = f0[fr(m)] > 0; let nx = Math.round(m + T); if (v && nx < N) { const r = Math.round(T / 4); let bi = nx, bv = -1e9; for (let j = Math.max(m + 1, nx - r); j <= Math.min(N - 1, nx + r); j++) if (x[j] > bv) { bv = x[j]; bi = j; } nx = bi; } m = Math.max(m + 8, nx); }
    let ts = 0, j = 0;
    while (ts < N) {
      const p = Math.round(ts), k = fr(p), v = f0[k] > 0, T = per(p), r = v ? Math.pow(2, corr[k] / 12) : 1;
      while (j + 1 < marks.length && Math.abs(marks[j + 1] - p) <= Math.abs(marks[j] - p)) j++;
      const c = marks[j], L = Math.max(8, Math.round(T));
      if (Math.abs(r - 1) < 0.002 && Math.abs(c - p) < T) { ts = c; }   /* nichts zu korrigieren: Fenster bleibt an seinem Platz, der Klang bleibt unberührt */
      for (let q = -L; q < L; q++) { const si = c + q, di = Math.round(ts) + q; if (si < 0 || si >= N || di < 0 || di >= N) continue; const w = 0.5 + 0.5 * Math.cos(Math.PI * q / L); y[di] += x[si] * w; ws[di] += w; }
      ts += T / r;
    }
    for (let i = 0; i < N; i++) y[i] = ws[i] > 0.05 ? y[i] / ws[i] : x[i];
    return y;
  },
  /* alles zusammen, in Häppchen – damit die Oberfläche nicht stockt */
  async run(x, sr, pcs, art, onProg) {
    this._d = null; const F0 = this.track(x, sr, 0, 0), n = F0.length, step = 150;
    for (let a = 0; a < n; a += step) { this.track(x, sr, a, a + step, F0); if (onProg) onProg(Math.min(0.9, 0.9 * (a + step) / n)); await new Promise(r => setTimeout(r, 0)); }
    const f = this.median(F0), c = this.plan(f, pcs, art), y = this.shift(x, sr, f, c); this._d = null; if (onProg) onProg(1);
    let voiced = 0, sum = 0; for (let i = 0; i < f.length; i++) if (f[i] > 0) { voiced++; sum += Math.abs(c[i]); }
    return { y, voiced: f.length ? voiced / f.length : 0, cents: voiced ? Math.round(sum / voiced * 100) : 0 };
  }
};

/* ---------- 2) Tonspuren (bisher „Gesangsspuren“): je Spur Autotune aus / sanft / stark ---------- */
const Spur80 = {
  busy: null,   /* { id, p } solange eine Spur gestimmt wird */
  /* erlaubte Töne: Tonleiter des Stücks oder alle zwölf */
  pcs(leiter) { if (leiter === "alle") return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]; const m = Music.mood, mu = Music.mu, st = []; for (let k = 0; k < 8; k++) st.push(mu.so(k)); return Tune80.pcs(m.root, st); },
  sig(leiter) { return leiter === "alle" ? "alle" : this.pcs("stueck").join(","); },
  stale(t) { return !!(t && t.tune && t.tune.leiter !== "alle" && t.tune.sig !== this.sig("stueck")); },
  say(t) { const b = this.busy; if (b && b.id === t.id) return `wird gestimmt … ${Math.round(b.p * 100)} %`; if (!t.tune) return "so wie aufgenommen"; if (this.stale(t)) return "Die Tonart des Stücks ist jetzt eine andere – „sanft“ oder „stark“ stimmt neu"; return `gestimmt${t.tune.cents != null ? ` · im Mittel ${t.tune.cents} Cent gerückt` : ""}${t.tune.voiced != null && t.tune.voiced < 0.15 ? " · kaum klare Töne gefunden" : ""}`; },
  row(t, i) { const a = t.tune ? t.tune.art : "aus", l = t.tune ? t.tune.leiter : (t.tl || "stueck"), dis = this.busy ? " disabled" : "";
    return `<div class="tn80" data-ti="${i}"><div class="sm74l"><span>Autotune</span><span class="eseg sm74seg" role="group" aria-label="Autotune für ${esc(t.name)}">${Tune80.ARTEN.map(([k, n]) => `<button data-tn="art:${i}:${k}" aria-pressed="${a === k}"${dis}>${n}</button>`).join("")}</span></div>
      <div class="sm74l"><span>zieht auf</span><span class="eseg sm74seg" role="group" aria-label="Töne, auf die gestimmt wird"><button data-tn="lt:${i}:stueck" aria-pressed="${l === "stueck"}"${dis}>Tonart des Stücks</button><button data-tn="lt:${i}:alle" aria-pressed="${l === "alle"}"${dis}>alle Töne</button></span></div>
      <p class="tn80s" aria-live="polite">${esc(this.say(t))}</p></div>`; },
  async drop(id) { if (!id) return; try { await DB.del("recs", id); Sing.bufs.delete(id); Recs.cache && Recs.cache.delete && Recs.cache.delete(id); } catch (_) {} },
  /* Spur stimmen oder zurück auf die Aufnahme. Die Aufnahme selbst bleibt immer erhalten (t.raw). */
  async set(t, art, leiter) {
    if (!t || this.busy) return false; const raw = t.raw || t.rec; leiter = leiter || (t.tune ? t.tune.leiter : t.tl || "stueck"); t.tl = leiter;
    if (art === "aus") { if (!t.tune) { Sing.sync(); return true; } Undo.push(); const old = t.rec; t.rec = raw; t.raw = null; t.tune = null; if (old !== raw) await this.drop(old); await Sing.buf(t); Save.soon(); Sing.sync(); this.again(); Hud77.show(IC78.stop, t.name, "Autotune aus – wie aufgenommen", null, 1500); return true; }
    this.busy = { id: t.id, p: 0 }; Sing.sync();
    try {
      const r = await DB.get("recs", raw); if (!r) throw new Error("Aufnahme fehlt"); const x = K.fromI16(r.ch[0]);
      const R = await Tune80.run(x, r.sr, this.pcs(leiter), art, p => { if (this.busy) { this.busy.p = p; const s = document.querySelector(`.tn80[data-ti="${Sing.tracks.indexOf(t)}"] .tn80s`); if (s) s.textContent = this.say(t); } });
      const nr = await Recs.add([R.y], r.sr, `${t.name} · gestimmt (${art})`, "gesang"); Undo.push();
      const old = t.tune && t.rec !== raw ? t.rec : null; t.raw = raw; t.rec = nr.id; t.tune = { art, leiter, sig: this.sig(leiter), cents: R.cents, voiced: Math.round(R.voiced * 100) / 100 };
      const b = Engine.ctx.createBuffer(1, R.y.length, r.sr); b.copyToChannel(R.y, 0); Sing.bufs.set(nr.id, b); if (old) await this.drop(old);
      Save.soon(); Hap(12); Hud77.show(IC78.play, t.name, R.voiced < 0.15 ? "kaum klare Töne gefunden – fast unverändert" : `gestimmt (${art})`, null, 1700);
    } catch (e) { console.warn(e); UI.toast("Das Stimmen hat nicht geklappt – die Aufnahme ist unverändert", 2600); }
    finally { this.busy = null; Sing.sync(); }
    this.again(); return true;
  },
  /* läuft das Stück gerade, beginnt es von vorn – damit die Spur gleich in der neuen Fassung zu hören ist */
  again() { try { if (Transport.running && Sing.tracks.length) Sing.restart(); } catch (_) {} },
  act(k) { const p = k.split(":"), t = Sing.tracks[+p[1]]; if (!t) return; Hap(8); if (p[0] === "art") return this.set(t, p[2]); if (p[0] === "lt") { if (t.tune) return this.set(t, t.tune.art, p[2]); t.tl = p[2]; return Sing.sync(); } }
};
{ const rn = Sing.render.bind(Sing); Sing.render = function () { const r = rn(); try { const rows = document.querySelectorAll("#singS .sgr"); if (rows.length === this.tracks.length) rows.forEach((el, i) => { if (!el.querySelector(".tn80")) el.insertAdjacentHTML("beforeend", Spur80.row(this.tracks[i], i)); }); } catch (e) { console.warn(e); } return r; };
  const sh = Sing.sheet.bind(Sing); Sing.sheet = function () { const r = sh(); try { const h = document.querySelector("#singS").closest(".sheet").querySelector("h2"); if (h) h.textContent = "Tonspuren"; } catch (_) {} return r; };
  const ld = Sing.load.bind(Sing); Sing.load = function (d) { ld(d); try { const src = d && Array.isArray(d.tracks) ? d.tracks : []; this.tracks.forEach(t => { const o = src.find(x => x && x.id === t.id) || {}; t.raw = o.raw ? String(o.raw) : null; t.tune = o.tune && o.raw ? { art: o.tune.art === "stark" ? "stark" : "sanft", leiter: o.tune.leiter === "alle" ? "alle" : "stueck", sig: String(o.tune.sig || ""), cents: o.tune.cents, voiced: o.tune.voiced } : null; if (!t.tune) t.raw = null; t.tl = o.tl === "alle" ? "alle" : "stueck"; }); } catch (_) {} };
  document.addEventListener("click", e => { const b = e.target.closest && e.target.closest("[data-tn]"); if (b && !b.disabled) Spur80.act(b.dataset.tn); }); }
P78.SH["Gesang einsingen"] = "Tonspur";
Help.T.push({ id: "v80", ic: "🎙", t: "Tonspuren und Autotune", k: "tonspur tonspuren audiospur gesang stimme einsingen aufnehmen band linear ohne form dreht nicht autotune auto-tune stimmen tonhöhe korrigieren schief sauber tonart tonleiter sanft stark roboter",
  h: `<p><b>Tonspur</b> (roter Punkt Aufnahme → Tonspur): eine Aufnahme, die wie auf einem Band <b>ab Takt 1 mitläuft</b>, sobald das Stück startet. Sie ist keine Form und dreht sich nicht. „● Einsingen“ startet das Stück von vorn, zählt einen Takt ein und nimmt auf; „Audiodatei“ holt eine fertige Aufnahme. Je Spur: anhören, stumm, Lautstärke, Takt früher/später, Versatz, löschen.</p>
  <p><b>Autotune</b> (unter jeder Spur): <b>sanft</b> zieht schiefe Töne weich auf den nächsten passenden Ton, Schwingungen der Stimme bleiben; <b>stark</b> rastet sofort ein – der bekannte „Roboter“-Klang. <b>Tonart des Stücks</b> erlaubt nur die Töne der gewählten Stimmung, <b>alle Töne</b> jeden Halbton. Die Länge der Aufnahme bleibt gleich. <b>aus</b> holt jederzeit die unveränderte Aufnahme zurück.</p>
  <p>Autotune braucht einen einzelnen klaren Ton (eine Stimme, ein Melodie-Instrument). Geräusche, Akkorde und Sprache ohne Tonhöhe bleiben, wie sie sind. Ändert sich die Stimmung des Stücks, sagt die Spur es – einmal „sanft“ oder „stark“ antippen stimmt neu.</p>` });
