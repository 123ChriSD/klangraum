/* ============================================================
   v60: Loopstation selbsterklärend · Loops verschieben · jeder Loop wird eine Form
   - Takt-Uhr oben (Takt x von n, Schläge), je Spur Wellenbild mit Taktstrichen und Abspielkopf, Klartext was gerade passiert und wann.
   - Verschieben: ◀ ▶ um je ein Sechzehntel oder Wellenbild ziehen (rastet auf Sechzehntel).
   - Neuer Loop → neue Form „Loop n“: dreht sie, läuft der Loop (zunächst unverändert). Kneten = Tonhöhe (in der Tonart),
     Spitzen = heller, rund = dunkler, schneller/langsamer drehen = doppelt/halb so schnell (bleibt im Takt), Lautstärke/Einzeln/Raum wie jede Form.
     Antippen spielt den Schlag an der getippten Stelle (unten = Anfang, oben = Ende).
   ============================================================ */
Object.assign(LoopSt, {
  // ---------- Daten (Versatz, Form) ----------
  data() { return { L: this.L, slots: this.slots.map(t => t ? { id: t.id, rec: t.rec, prev: t.prev || null, name: t.name, vol: t.vol, on: !!t.on, bpm: t.bpm, ch: t.ch | 0, src: t.src, shift: t.shift | 0, fid: t.fid || null, r0: t.r0 || 1 } : null) }; },
  load(d) {
    if (!this.R && JSON.stringify(this.data()) === JSON.stringify(d && Array.isArray(d.slots) ? d : { L: 0, slots: this.slots.map(() => null) })) return;
    this.stopAll(); if (this.R) this.cancel(true);
    const S = d && Array.isArray(d.slots) ? d.slots : [];
    const n = clamp(Math.max(4, S.length), 4, this.MAXN);
    this.slots = Array.from({ length: n }, (_, i) => { const t = S[i]; return t && t.rec ? { id: t.id || uid("ls"), rec: String(t.rec), prev: t.prev ? String(t.prev) : null, name: t.name || `Spur ${i + 1}`, vol: t.vol ?? 1, on: t.on !== false, bpm: +t.bpm || Music.tempo(), ch: t.ch | 0 || 1, src: t.src === "form" ? "form" : "mic", shift: t.shift | 0, fid: t.fid || null, r0: +t.r0 || 1, pend: true } : null; });
    this.L = this.slots.some(Boolean) ? (d.L | 0) || 32 : 0;
    this.preload(); this.sync();
  },
  form(t) { if (!t || !t.fid) return null; const f = Forms.list.find(x => x.id === t.fid); return f || null; },
  trackOf(f) { return f ? this.slots.find(t => t && t.fid === f.id) || null : null; },
  idx(t) { return this.slots.indexOf(t); },
  // ---------- Klang aus der Form ----------
  par(t) {
    const f = this.form(t); if (!f) return { run: true, g: 1, sp: 1, semi: 0, cut: 20000, pan: 0, send: 0 };
    const run = !f.still && (Motion.any(f) || Motion.gliding(f, "y"));
    const g = (f.mute || !Forms.audible(f)) ? 0 : f.fine.vol * (f.fadeG ?? 1) * (f.songG ?? 1);
    const r = Move.rpb(f), sp = r > 0.01 ? clamp(Math.pow(2, Math.round(Math.log2(r / (t.r0 || 1)))), 0.25, 4) : 1;
    let semi = 0; try { const kd = KneadPitch.deg(f); if (kd) semi = Music.mu.so(kd) - Music.mu.so(0); } catch (_) {}
    let cut = 20000; try { if (f.an) { const ref = KneadPitch.ref(f); const dS = f.an.S - ref.S; cut = clamp(9000 * Math.pow(2, dS * 3.2), 500, 20000); } } catch (_) {}
    const m = f.mixNow || {}; return { run, g, sp, semi, cut, pan: clamp(m.pan || 0, -1, 1), send: clamp((m.send || 0) * 0.35, 0, 0.8) };
  },
  chain(t) {
    if (t._ch && t._ch.c === Engine.ctx) return t._ch; const c = Engine.ctx;
    const g = c.createGain(), lp = c.createBiquadFilter(), pan = c.createStereoPanner ? c.createStereoPanner() : null, send = c.createGain();
    lp.type = "lowpass"; lp.frequency.value = 20000; lp.Q.value = 0.5; send.gain.value = 0;
    g.connect(lp); if (pan) { lp.connect(pan); pan.connect(this.out()); } else lp.connect(this.out()); lp.connect(send); send.connect(Engine.verb);
    return (t._ch = { c, g, lp, pan, send });
  },
  apply(t, P, time) {
    const ch = this.chain(t), now = Engine.now(), at = Math.max(now, time || now);
    try { ch.g.gain.setTargetAtTime(t.vol * P.g, at, 0.03); ch.lp.frequency.setTargetAtTime(P.cut, at, 0.05); if (ch.pan) ch.pan.pan.setTargetAtTime(P.pan, at, 0.05); ch.send.gain.setTargetAtTime(P.send, at, 0.05); } catch (_) {}
  },
  modeOf(P) { return P.sp === 1 && !P.semi ? "glatt" : "schlag"; },
  // ---------- Abspielen im Takt: mit Versatz, glatt oder in Schlägen (wenn die Form Tempo/Höhe ändert) ----------
  onStep(step, time) {
    const R = this.R; if (R) this.recStep(R, step, time);
    const L = this.L; if (!L) return;
    for (const t of this.slots) {
      if (!t) continue;
      const P = this.par(t), run = t.on && P.run;
      if (!run) { if (this.srcs.some(e => e.t === t)) this.stopT(t, time, true); t.pend = true; t._mode = null; continue; }
      const b = this.bufs.get(t.rec);
      if (!b) { if (!t.missing) this.buf(t); t.pend = true; continue; }
      this.apply(t, P, time);
      const md = this.modeOf(P); if (md !== t._mode) { t._mode = md; t.pend = true; }
      const sh = t.shift | 0;
      if (md === "glatt") {
        const ph = ((step - sh) % L + L) % L;
        if (ph === 0 || t.pend) { this.stopT(t, time); this.startT(t, b, time, ph); t.pend = false; }
      } else if (step % 4 === 0 || t.pend) {   // Schlag-Scheiben: Rhythmus bleibt, Höhe und Tempo ändern sich
        const len = (4 - step % 4) || 4, pos = ((Math.floor(step * P.sp) - sh) % L + L) % L;
        this.stopT(t, time + 0.004); this.slice(t, b, time, pos, len, P); t.pend = false;
      }
    }
  },
  startT(t, b, time, ph) {
    const c = Engine.ctx, s = c.createBufferSource(), g = c.createGain(), rate = Music.tempo() / (t.bpm || Music.tempo());
    s.buffer = b; s.playbackRate.value = rate; g.gain.value = 1; s.connect(g).connect(this.chain(t).g);
    let when = time, off = ph * this.spb0(t); if (when < c.currentTime) { off += (c.currentTime - when) * rate; when = c.currentTime; }
    if (off >= b.duration - 0.002) return;
    s.start(when, off); const e = { s, g, t, t0: when - off / rate, rate, off0: off }; this.srcs.push(e);
    s.onended = () => { const i = this.srcs.indexOf(e); if (i >= 0) this.srcs.splice(i, 1); };
  },
  slice(t, b, time, pos, len, P) {
    const c = Engine.ctx, s = c.createBufferSource(), g = c.createGain(), base = Music.tempo() / (t.bpm || Music.tempo()), rate = base * P.sp * Math.pow(2, P.semi / 12);
    s.buffer = b; s.playbackRate.value = rate; s.connect(g).connect(this.chain(t).g);
    let when = Math.max(time, c.currentTime), off = pos * this.spb0(t); if (off >= b.duration - 0.002) return;
    const dur = len * Transport.spb, end = when + dur;
    g.gain.setValueAtTime(0, when); g.gain.linearRampToValueAtTime(1, when + 0.004); g.gain.setValueAtTime(1, Math.max(when + 0.005, end - 0.008)); g.gain.linearRampToValueAtTime(0, end);
    s.start(when, off); s.stop(end + 0.01); const e = { s, g, t, t0: when - off / rate, rate, off0: off }; this.srcs.push(e);
    s.onended = () => { const i = this.srcs.indexOf(e); if (i >= 0) this.srcs.splice(i, 1); };
  },
  setVol(t, v) { t.vol = v; try { const P = this.par(t); this.apply(t, P); } catch (_) {} },
  playing(t) { return !!t && t.on && Transport.running && !!this.bufs.get(t.rec) && this.par(t).run; },
  // ---------- an/aus: Spur und Form gemeinsam ----------
  toggle(i, v) {
    const t = this.slots[i]; if (!t) return; const on = v == null ? !(t.on && this.par(t).run && Transport.running) : !!v; Hap(6);
    t.on = on; const f = this.form(t);
    if (on) { if (f) { if (f.still) Motion.resume(f); if (!Motion.any(f)) Motion.setTier(f, Motion.tierOfW(Motion.wOfR(t.r0 || 1)) || 3); } t.pend = true; if (!Transport.running && Engine.ctx) Transport.start(); }
    else { if (f && Motion.moves(f)) Motion.pause(f); this.stopT(t, Engine.now(), true); }
    Save.soon(); this.sync(); UI.refresh();
  },
  allToggle() {
    const anyOn = this.slots.some(t => t && t.on && this.par(t).run) && Transport.running;
    this.slots.forEach((t, i) => { if (t) this.toggle(i, !anyOn); });
    if (!anyOn && Engine.ctx) { if (Transport.running) Transport.stop(); Transport.start(); }
  },
  // ---------- Verschieben ----------
  shiftBy(i, d) {
    const t = this.slots[i]; if (!t || !this.L) return; t.shift = (((t.shift | 0) + d) % this.L + this.L) % this.L; t.pend = true; Hap(4);
    Save.soon(); this.render(); UI.toast(`${t.name}: ${this.shiftTxt(t)}`, 900);
  },
  shiftTxt(t) { const s = t.shift | 0, L = this.L; if (!s) return "nicht verschoben"; const v = s > L / 2 ? s - L : s, a = Math.abs(v);
    const w = a % 16 === 0 ? `${a / 16} Takt${a > 16 ? "e" : ""}` : a % 4 === 0 ? `${a / 4} Schl${a > 4 ? "äge" : "ag"}` : `${a}/16`; return `${w} ${v > 0 ? "später" : "früher"}`; },
  // Overdub landet an der richtigen Stelle (Versatz eingerechnet)
  dubIdx(x, N) { const L = this.L, t = this.R && this.slots[this.R.i], sh = t ? t.shift | 0 : 0, sf = (x - Transport.t0) / Transport.spb, ph = (((sf - sh) % L) + L) % L; return Math.min(N - 1, Math.floor(ph / L * N)); },
  // ---------- Loop als Form ----------
  SEEDS: ["kugel", "kiesel", "tropfen", "welle"],
  COLS: ["#E07A68", "#86D3C0", "#EDB46A", "#9AA7F0", "#C79BE8", "#8FDCA5"],
  makeForm(t) {
    if (!t || this.form(t)) return this.form(t); const i = this.idx(t);
    const seeds = this.SEEDS.filter(id => K.seedById(id).id === id), sd = seeds[i % Math.max(1, seeds.length)] || "kugel";
    const f = Forms.make({ seedId: sd, name: `Loop ${i + 1}`, spin: 0 }); if (!f) return null;
    Forms.rebuild(f, true); t.fid = f.id; t.r0 = 1;
    if (Transport.running || t.on) { Motion.setTier(f, 3); }
    try { UI.refresh(); } catch (_) {}
    return f;
  },
  // Antippen der Loop-Form: spielt den Schlag an der getippten Höhe (unten = Anfang des Loops, oben = Ende)
  tapSlice(t, u, vel) {
    const b = this.bufs.get(t.rec); if (!b || !Engine.ctx || !this.L) return; const beats = Math.max(1, this.L / 4), k = clamp(Math.floor(u * beats), 0, beats - 1);
    const P = this.par(t); this.apply(t, { ...P, g: P.g || 1 }); const c = Engine.ctx, s = c.createBufferSource(), g = c.createGain(), base = Music.tempo() / (t.bpm || Music.tempo()), rate = base * Math.pow(2, P.semi / 12);
    s.buffer = b; s.playbackRate.value = rate; s.connect(g).connect(this.chain(t).g); const now = c.currentTime + 0.005, dur = 4 * Transport.spb;
    g.gain.setValueAtTime(0, now); g.gain.linearRampToValueAtTime(clamp(vel || 0.8, 0.2, 1), now + 0.004); g.gain.setValueAtTime(clamp(vel || 0.8, 0.2, 1), now + dur - 0.01); g.gain.linearRampToValueAtTime(0, now + dur);
    s.start(now, k * 4 * this.spb0(t)); s.stop(now + dur + 0.01);
  },
  // ---------- Takt-Uhr ----------
  clock() {
    if (!this.L || !Transport.running) return { bar: 0, bars: this.L / 16, beat: 0, ph: 0 };
    const sf = (Engine.now() - Transport.t0) / Transport.spb, p = ((sf % this.L) + this.L) % this.L;
    return { bar: Math.floor(p / 16) + 1, bars: this.L / 16, beat: Math.floor((p % 16) / 4) + 1, ph: p / this.L };
  },
  // Stelle des Abspielkopfs im Wellenbild einer Spur (0…1), Versatz eingerechnet
  headOf(t) { if (!this.L || !Transport.running) return null; const sf = (Engine.now() - Transport.t0) / Transport.spb, L = this.L; return ((((sf - (t.shift | 0)) % L) + L) % L) / L; },
  peaks(t) {
    const b = this.bufs.get(t.rec); if (!b) return null; if (t._pk && t._pk.b === b) return t._pk.v;
    const n = 96, d = b.getChannelData(0), st = Math.max(1, Math.floor(d.length / n)), v = []; let mx = 0.0001;
    for (let k = 0; k < n; k++) { let m = 0; for (let i = k * st, e = Math.min(d.length, (k + 1) * st); i < e; i += 8) m = Math.max(m, Math.abs(d[i])); v.push(m); mx = Math.max(mx, m); }
    const out = v.map(x => x / mx); t._pk = { b, v: out }; return out;
  },
  waveSvg(t) {
    const v = this.peaks(t), L = this.L, bars = L / 16; if (!v) return `<span class="lxwait">lädt …</span>`;
    const n = v.length, d = v.map((a, k) => { const x = (k + 0.5) / n * 200, h = 2 + a * 24; return `M${x.toFixed(1)} ${(30 - h).toFixed(1)}V${(30 + h).toFixed(1)}`; }).join("");
    const lines = Array.from({ length: bars * 4 + 1 }, (_, k) => { const x = k / (bars * 4) * 200; return `<line x1="${x.toFixed(1)}" x2="${x.toFixed(1)}" y1="${k % 4 ? 22 : 2}" y2="${k % 4 ? 38 : 58}" class="${k % 4 ? "lxt16" : "lxtB"}"/>`; }).join("");
    return `<svg viewBox="0 0 200 60" preserveAspectRatio="none" class="lxsvg" aria-hidden="true">${lines}<path d="${d}" class="lxw"/></svg>`;
  },
  // ---------- Klartext: was passiert gerade, was passiert als Nächstes ----------
  state(i) {
    const R = this.R, t = this.slots[i];
    if (R && R.i === i) { if (R.kind === "dub") return "dub"; if (R.mode !== "free" && R.S != null && this.tStep(R.S) > Engine.now()) return "arm"; return "rec"; }
    if (!t) return "leer"; if (t.missing) return "fehlt";
    if (!t.on || !Transport.running) return "stop";
    return this.par(t).run ? "play" : "still";
  },
  beatsTo(s) { return Math.max(1, Math.ceil((this.tStep(s) - Engine.now()) / (Transport.spb * 4) - 0.05)); },
  label(i) {
    const st = this.state(i), R = this.R, t = this.slots[i], bars = this.L / 16, sx = this.src === "form" ? "🎛 Formen" : "🎤 Mikrofon", f = this.form(t);
    if (st === "arm") return ["Gleich: Aufnahme", `beginnt in ${this.beatsTo(R.S)} Schl${this.beatsTo(R.S) > 1 ? "ägen" : "ag"} · zur Eins`];
    if (st === "rec") { if (R.mode === "free") return ["● Nimmt auf", "nochmal tippen = Loop schließen (bestimmt das Tempo)"]; if (R.mode === "qfree" && !R.ending) return ["● Nimmt auf", "nochmal tippen = endet an der nächsten Eins"];
      const b = Math.min(R.N / 16, Math.floor(((Engine.now() - this.tStep(R.S)) / Transport.spb) / 16) + 1); return ["● Nimmt auf", `Takt ${Math.max(1, b)} von ${R.N / 16} · hört von selbst auf`]; }
    if (st === "dub") return ["✚ Nimmt dazu auf", "nochmal tippen = fertig · wird sofort hörbar"];
    if (st === "play") { const P = this.par(t), m = []; if (P.sp !== 1) m.push(P.sp > 1 ? `${P.sp}× so schnell` : `${1 / P.sp}× so langsam`); if (P.semi) m.push(`${P.semi > 0 ? "+" : ""}${P.semi} Halbtöne`); return ["▶ Läuft", (m.length ? m.join(" · ") + " · " : "") + "tippen = dazu aufnehmen"]; }
    if (st === "still") return ["⏸ Form steht", `„${f ? f.name : "Form"}“ dreht nicht · tippen = läuft weiter`];
    if (st === "stop") return ["■ Gestoppt", "tippen = läuft im Takt weiter"];
    if (st === "fehlt") return ["Aufnahme fehlt", "lang drücken = leeren"];
    if (this.R) return ["Leer", "warten, bis die Aufnahme fertig ist"];
    if (this.L) return [`● Aufnehmen`, `${sx} · ${bars} Takt${bars > 1 ? "e" : ""} · ab der nächsten Eins`];
    if (this.len) return [`● Aufnehmen`, `${sx} · ${this.len} Takt${this.len > 1 ? "e" : ""} · 1 Takt Einzählen`];
    return [`● Aufnehmen`, Transport.running ? `${sx} · ab der nächsten Eins · nochmal tippen = Ende` : `${sx} · sofort · nochmal tippen = Ende → Tempo`];
  },
  nextFree() { return this.R ? -1 : this.slots.findIndex(t => !t); },
  steps() {
    const L = this.L, R = this.R;
    const s1 = !this.any() && !R, s2 = !!R && R.kind === "rec", s3 = this.any() && !R, s4 = !!R && R.kind === "dub";
    return `<ol class="lxsteps"><li class="${s1 ? "on" : this.any() ? "ok" : ""}"><b>Aufnehmen</b> leeres Feld tippen</li><li class="${s2 ? "on" : ""}"><b>Schließen</b> nochmal tippen${L ? ` (oder nach ${L / 16} Takt${L > 16 ? "en" : ""} von selbst)` : ""}</li><li class="${s3 ? "on" : ""}"><b>Läuft</b> im Takt – als Form „Loop n“ im Klang</li><li class="${s4 ? "on" : ""}"><b>Dazu</b> laufendes Feld tippen = Overdub</li></ol>`;
  },
  render() {
    const el = this.el(); if (!el || UI.tab !== "loop") return;
    const L = this.L, bars = L / 16, why = this.why(), anyOn = this.slots.some(t => t && t.on && this.par(t).run) && Transport.running, nf = this.nextFree(), ck = this.clock();
    const rows = this.slots.map((t, i) => {
      const st = this.state(i), [a, b] = this.label(i), c = this.COLS[i % 6], f = this.form(t);
      const top = `<div class="lxtop"><b>Spur ${i + 1}</b>${t ? `<span>${t.src === "form" ? "🎛" : "🎤"} ${bars} Takt${bars > 1 ? "e" : ""}${t.shift ? " · " + this.shiftTxt(t) : ""}</span>` : `<span>${i === nf ? "als Nächstes" : "frei"}</span>`}${f ? `<button class="lxform" data-ls="goform" data-i="${i}" aria-label="Form ${esc(f.name)} zeigen"><i style="background:${colOf(f)}"></i>${esc(f.name)}</button>` : t ? `<button class="lxform" data-ls="mkform" data-i="${i}">＋ als Form</button>` : ""}</div>`;
      const wave = t ? `<div class="lxwave" data-ls="wave" data-i="${i}" title="ziehen = verschieben">${this.waveSvg(t)}<i class="lxhead"></i></div>` : st === "rec" || st === "arm" || st === "dub" ? `<div class="lxwave lxrecw"><i class="lxrecp"></i><span>${st === "arm" ? "wartet auf die Eins …" : "nimmt auf …"}</span></div>` : `<div class="lxwave lxempty"><span>${L ? `${bars} Takt${bars > 1 ? "e" : ""} Platz` : "Länge bestimmst du beim Aufnehmen"}</span></div>`;
      const ctl = t ? `<div class="lxctl"><button data-ls="play" data-i="${i}" class="lxpl">${st === "play" ? "■ Stopp" : "▶ Start"}</button><button data-ls="sl" data-i="${i}" aria-label="ein Sechzehntel früher">◀</button><button data-ls="sr" data-i="${i}" aria-label="ein Sechzehntel später">▶</button><button data-ls="undo" data-i="${i}" aria-label="Letzten Overdub zurücknehmen"${t.prev ? "" : " disabled"}>↶</button><input type="range" data-ls="vol" data-i="${i}" min="0" max="1.5" step="0.05" value="${t.vol}" aria-label="Lautstärke Spur ${i + 1}"><button data-ls="del" data-i="${i}" class="del" aria-label="Spur ${i + 1} leeren">✕</button></div>` : "";
      return `<div class="lxrow st-${st}${i === nf ? " nx" : ""}" style="--c:${c}"><button class="lxbig" data-ls="tap" data-i="${i}" aria-label="Spur ${i + 1}: ${esc(a)} – ${esc(b)}"><b>${a}</b><small>${b}</small><i class="lxlv"></i></button><div class="lxmain">${top}${wave}</div>${ctl}</div>`;
    }).join("");
    const fl = Forms.list.filter(f => Loops.count(f));
    el.innerHTML = `<div class="vsec lxv">
      <div class="vhead"><h2>Loopstation</h2><span class="lqinfo">${L ? `${bars} Takt${bars > 1 ? "e" : ""} · ` : ""}${Math.round(Music.tempo())} BPM</span></div>
      <div class="lxclock" aria-live="off"><div class="lxbars">${L ? Array.from({ length: bars }, (_, k) => `<i data-k="${k + 1}"${ck.bar === k + 1 ? ' class="on"' : ""}>${k + 1}</i>`).join("") : `<em>noch kein Loop – der erste bestimmt Länge und Tempo</em>`}</div><div class="lxbeats">${[1, 2, 3, 4].map(k => `<i data-b="${k}"${ck.beat === k ? ' class="on"' : ""}></i>`).join("")}</div><button class="btn lxtr" data-ls="tr">${Transport.running ? "■ Musik stoppen" : "▶ Musik starten"}</button></div>
      ${this.steps()}
      ${why ? `<div class="lqwarn"><p>${esc(MicFix.TXT[why] || "Das Mikrofon ist hier gesperrt.")}</p><div class="row"><button class="btn primary" data-ls="micfix">🎤 Mikrofon freischalten</button><button class="btn" data-ls="file">Aufnahme-App / Datei</button></div></div>` : ""}
      <div class="lqopt"><div class="seg2" role="group" aria-label="Was wird aufgenommen?"><button data-ls="src" data-v="mic" aria-pressed="${this.src === "mic"}">🎤 Mikrofon</button><button data-ls="src" data-v="form" aria-pressed="${this.src === "form"}">🎛 Formen</button></div>
        <div class="lqlen" role="group" aria-label="Länge">${L ? `<span class="lql">Länge <b>${bars} Takt${bars > 1 ? "e" : ""}</b></span><button class="npc" data-ls="x2"${L * 2 > 512 ? " disabled" : ""}>×2 länger</button>` : [0, 1, 2, 4, 8].map(n => `<button class="npc" data-ls="len" data-v="${n}" aria-pressed="${this.len === n}">${n ? n + " Takt" + (n > 1 ? "e" : "") : "Frei"}</button>`).join("")}</div></div>
      <div class="lxrows">${rows}${this.slots.length < this.MAXN ? `<button class="lqadd lxadd" data-ls="add">＋ Spur</button>` : ""}</div>
      <p class="lxhint">Wellenbild <b>ziehen</b> oder <b>◀ ▶</b> = Loop zeitlich verschieben (Sechzehntel). Jeder Loop ist auch eine <b>Form</b>: drehen = läuft · kneten = höher/tiefer · Spitzen = heller · schneller drehen = doppelt so schnell · antippen = einzelne Schläge.</p>
      <div class="row lqall"><button class="btn primary" data-ls="all"${this.any() ? "" : " disabled"}>${anyOn ? "■ Alle Spuren stoppen" : "▶ Alle Spuren starten"}</button><button class="btn" data-ls="clear"${this.any() ? "" : " disabled"}>Alles leeren</button><button class="btn" data-ls="file2">Datei als Spur …</button></div>
      <label class="lqph"><input type="checkbox" data-ls="phones" ${Sing.phones ? "checked" : ""}> 🎧 Mit Kopfhörern (bester Klang). Ohne Kopfhörer filtert der Browser die Loops aus dem Mikrofon.</label>
      <div class="lqfl"><div class="vhead"><h3>Form-Loops (gespielte Töne)</h3><button class="btn" data-ls="station">Verwalten</button></div>
        ${fl.length ? fl.map(f => `<div class="lqfr"><i style="background:${colOf(f)}"></i><b>${esc(f.name)}</b><small>${Loops.count(f)} Loop${Loops.count(f) > 1 ? "s" : ""}</small><button class="npc" data-ls="fhold" data-f="${f.id}" aria-pressed="${!LoopHold.is(f)}">${LoopHold.is(f) ? "▶ einsetzen" : "⏸ aussetzen"}</button></div>`).join("") : `<p class="cueno">Noch keine. Auf einer Form „● Loop“ nimmt die gespielten Töne auf – sie bleiben veränderbar.</p>`}</div>
    </div>`;
    this._sig = this.sig(); this.anim();
  },
  sig() { return this.slots.map((t, i) => this.state(i) + this.label(i).join("|") + (t ? (t.shift | 0) + ":" + !!this.bufs.get(t.rec) + ":" + (t.fid || "") : "")).join(";") + (this.R ? this.R.mode + (this.R.ending ? 1 : 0) : "") + this.L + Transport.running; },
  anim() {
    clearInterval(this.at); if (UI.tab !== "loop") return;
    this.at = setInterval(() => {
      if (UI.tab !== "loop") { clearInterval(this.at); return; }
      const el = this.el(); if (!el) return; if (this.sig() !== this._sig && !this.vdrag && !this.wdrag) { this.render(); return; }
      const ck = this.clock(); el.querySelectorAll(".lxbars i").forEach(x => x.classList.toggle("on", +x.dataset.k === ck.bar)); el.querySelectorAll(".lxbeats i").forEach(x => x.classList.toggle("on", +x.dataset.b === ck.beat));
      el.querySelectorAll(".lxrow").forEach((r, i) => { const t = this.slots[i], h = r.querySelector(".lxhead"), lv = r.querySelector(".lxlv"), rp = r.querySelector(".lxrecp");
        if (h && t) { const p = this.state(i) === "play" || this.state(i) === "dub" ? this.headOf(t) : null; h.style.display = p == null ? "none" : ""; if (p != null) h.style.left = (p * 100).toFixed(2) + "%"; }
        if (rp && this.R && this.R.i === i) { const R = this.R; const p = R.kind === "rec" && R.N && R.S != null ? clamp((Engine.now() - this.tStep(R.S)) / (R.N * Transport.spb), 0, 1) : R.kind === "dub" ? (this.headOf(t || {}) || 0) : clamp((Engine.now() - (R.T || R.at || 0)) / 8, 0, 1); rp.style.width = (p * 100).toFixed(1) + "%"; }
        if (lv) lv.style.setProperty("--lv", this.R && this.R.i === i ? Math.min(1, this.R.lv * 2.2).toFixed(2) : "0"); });
    }, 60);
  },
  click(e) {
    const b = e.target.closest("[data-ls]"); if (!b || b.disabled) return; const k = b.dataset.ls, i = +b.dataset.i;
    if (k === "tap") { if (this._lp) { this._lp = false; return; } Hap(10); this.tap(i); return; }
    if (k === "wave") return;
    if (k === "play") return this.toggle(i);
    if (k === "sl") return this.shiftBy(i, -1);
    if (k === "sr") return this.shiftBy(i, 1);
    if (k === "undo") return this.undoDub(i);
    if (k === "del") return this.clear(i);
    if (k === "vol") return;
    Hap(6);
    if (k === "tr") { Transport.running ? Transport.stop() : Transport.start(); setTimeout(() => this.render(), 50); return; }
    if (k === "goform") { const f = this.form(this.slots[i]); if (f) { UI.setTab("klang"); Forms.setActive(f); if (Scene.view !== "nah") UI.setView("nah"); } return; }
    if (k === "mkform") { const t = this.slots[i]; if (t) { Undo.push(); this.makeForm(t); Save.soon(); this.render(); } return; }
    if (k === "src") { this.src = b.dataset.v; store.set("lsSrc", this.src); this.render(); if (this.src === "mic" && !this.why()) this.micOpen(); return; }
    if (k === "len") { this.len = +b.dataset.v; store.set("lsLen", this.len); this.render(); return; }
    if (k === "x2") return this.double();
    if (k === "add") return this.addSlot();
    if (k === "all") return this.allToggle();
    if (k === "clear") return this.clearAll();
    if (k === "micfix") { this.micBlocked(this.free()); return; }
    if (k === "file") return this.importPick(this.free(), true);
    if (k === "file2") return this.importPick(this.free(), false);
    if (k === "station") return Looper.open(Forms.active);
    if (k === "fhold") { const f = Forms.list.find(x => x.id === b.dataset.f); if (f) { LoopHold.toggle(f); setTimeout(() => this.render(), 50); } return; }
  },
  bind() {
    const el = this.el(); if (!el || el._ls) return; el._ls = true;
    el.addEventListener("click", e => this.click(e));
    el.addEventListener("input", e => { const r = e.target; if (r.dataset.ls === "vol") { const t = this.slots[+r.dataset.i]; if (t) this.setVol(t, +r.value); } });
    el.addEventListener("change", e => { const r = e.target; if (r.dataset.ls === "vol") { this.vdrag = false; Save.soon(); } if (r.dataset.ls === "phones") { Sing.phones = r.checked; store.set("singPhones", Sing.phones); this.micClose(); UI.toast(r.checked ? "Mit Kopfhörern: Mikrofon ohne Filter" : "Ohne Kopfhörer: der Browser filtert die Loops aus dem Mikrofon", 2000); } });
    el.addEventListener("pointerdown", e => {
      const r = e.target; if (r.dataset && r.dataset.ls === "vol") { this.vdrag = true; return; }
      const w = e.target.closest('[data-ls="wave"]'); if (w) { const i = +w.dataset.i, t = this.slots[i]; if (!t || !this.L) return; e.preventDefault(); try { w.setPointerCapture(e.pointerId); } catch (_) {}
        const rc = w.getBoundingClientRect(), svg = w.querySelector("svg"); this.wdrag = { i, x0: e.clientX, w: rc.width, n: 0, svg }; return; }
      const b = e.target.closest('[data-ls="tap"]'); if (!b) return; const i = +b.dataset.i; clearTimeout(this.lpT); this._lp = false;
      this.lpT = setTimeout(() => { if (this.R && this.R.i === i) { this._lp = true; Hap(14); this.cancel(); return; } if (this.slots[i]) { this._lp = true; this.clear(i); } }, 650); });
    el.addEventListener("pointermove", e => { const D = this.wdrag; if (!D) return; const n = Math.round((e.clientX - D.x0) / D.w * this.L); if (n !== D.n) { D.n = n; Hap(2); } if (D.svg) D.svg.style.transform = `translateX(${(n / this.L * 100).toFixed(2)}%)`; });
    const end = () => { clearTimeout(this.lpT); const D = this.wdrag; if (D) { this.wdrag = null; if (D.svg) D.svg.style.transform = ""; if (D.n) this.shiftBy(D.i, D.n); } };
    el.addEventListener("pointerup", end); el.addEventListener("pointercancel", end); el.addEventListener("pointerleave", () => clearTimeout(this.lpT));
  }
});
// Aufnahme liegt genau dort, wo sie gespielt wurde (Versatz = Starttakt im Loop) und wird eine Form
{ const p0 = LoopSt.put.bind(LoopSt); LoopSt.put = async function (i, chs, sr, bpm, N, src, S) {
  await p0(i, chs, sr, bpm, N, src); const t = this.slots[i]; if (!t) return;
  if (S != null && this.L) t.shift = ((S % this.L) + this.L) % this.L;
  try { const f = this.makeForm(t); if (f) { Motion.setTier(f, 3); UI.toastAct(`🔁 Spur ${i + 1} läuft – und ist jetzt die Form „${f.name}“: drehen = läuft, kneten = Klang & Höhe`, "Form zeigen", () => { UI.setTab("klang"); Forms.setActive(f); }, 5200); } } catch (e) { console.warn(e); }
  Save.soon(); this.sync(); }; }
{ const fin = LoopSt.finish; LoopSt.finish = async function () { const R = this.R; if (R && R.kind === "rec") { const p = this.put; this.put = (i, chs, sr, bpm, N, src) => p.call(this, i, chs, sr, bpm, N, src, R.mode === "free" ? 0 : R.S); try { return await fin.call(this); } finally { this.put = p; } } return fin.call(this); }; }
// Spur leeren → ihre Form verschwindet mit; Form gelöscht → Spur läuft ohne Form weiter
{ const c0 = LoopSt.clear.bind(LoopSt); LoopSt.clear = function (i) { const t = this.slots[i], f = this.form(t); c0(i); if (f) { this._rmF = true; try { Forms.remove(f); } finally { this._rmF = false; } } }; }
{ const c1 = LoopSt.clearAll.bind(LoopSt); LoopSt.clearAll = function () { const fs = this.slots.map(t => this.form(t)).filter(Boolean); c1(); this._rmF = true; try { fs.forEach(f => Forms.remove(f)); } finally { this._rmF = false; } }; }
{ const rm = Forms.remove.bind(Forms); Forms.remove = function (f) { const t = LoopSt.trackOf(f); const r = rm(f); if (t && !LoopSt._rmF) { t.fid = null; t.pend = true; LoopSt.sync(); } return r; }; }
// Loop-Formen spielen keine eigenen Töne: Drehen = Loop läuft, Antippen = Schlag des Loops
{ const st = Motion.step.bind(Motion); Motion.step = function (f, step, time) { if (LoopSt.trackOf(f)) return; return st(f, step, time); }; }
{ const pl = Forms.play.bind(Forms); Forms.play = function (f, u, vel, opts) { const t = LoopSt.trackOf(f); if (t && !(opts && opts.midi != null && opts.loopNote)) { try { LoopSt.tapSlice(t, u, vel); f.glow = Math.min(1.2, (f.glow || 0) + 0.4); } catch (e) { console.warn(e); } return null; } return pl(f, u, vel, opts); }; }
// Steuerfeld der Loop-Form erklärt, was sie tut
{ const cp = FBar.caption.bind(FBar); FBar.caption = function () { const c = cp(); try { const t = LoopSt.trackOf(Forms.active); if (t && !c) { const P = LoopSt.par(t); return `🔁 spielt Spur ${LoopSt.idx(t) + 1} · ${P.run && t.on && Transport.running ? "läuft" : "steht"} · drehen = läuft · kneten = Höhe & Klang · schneller drehen = doppelt so schnell`; } } catch (_) {} return c; }; }
// Hilfe
{ const h = Help.T.find(x => x.id === "loopst"); if (h) h.h = h.h.replace("</ul>", `<li><b>Oben die Takt-Uhr</b>: welcher Takt des Loops gerade läuft und welcher Schlag. Jede Spur zeigt ihr <b>Wellenbild</b> mit Taktstrichen und dem Abspielkopf; der Text im Feld sagt, was gerade passiert und was der nächste Tipp tut (z. B. „Aufnahme beginnt in 2 Schlägen“).</li><li><b>Verschieben</b>: Wellenbild seitlich ziehen oder ◀ ▶ (je ein Sechzehntel).</li><li><b>Jeder Loop ist eine Form</b> („Loop 1“ …): dreht sie, läuft der Loop – zunächst unverändert. Anhalten = Loop pausiert. <b>Kneten</b> verändert die Höhe (in der Tonart), Spitzen machen ihn heller, rund dunkler; <b>schneller drehen</b> = doppelt so schnell, langsamer = halb so schnell (bleibt im Takt); Lautstärke, Einzeln und die Lage im Raum wirken wie bei jeder Form. <b>Antippen</b> spielt einzelne Schläge des Loops (unten = Anfang, oben = Ende).</li></ul>`); }
// Feld tippen: gestoppt oder Form steht → läuft weiter (statt Overdub)
{ const tp = LoopSt.tap.bind(LoopSt); LoopSt.tap = async function (i) { const t = this.slots[i]; if (!this.R && t && !(t.on && Transport.running && this.par(t).run)) return this.toggle(i, true); return tp(i); }; }
