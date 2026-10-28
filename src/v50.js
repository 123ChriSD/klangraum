/* ============================================================
   v50: Gesangsspuren – einsingen wie auf Band, laufen linear ab Takt 1 mit (keine Form)
        Aufnahmeschutz – während Loop-, Live- oder Gesangsaufnahme gilt automatisch „Spielen“ (kein Kreis beim langen Drücken)
   ============================================================ */
const Sing = {
  tracks: [], bufs: new Map(), srcs: [], rec: null, fromStart: store.get("singFromStart") !== false, phones: !!store.get("singPhones"),
  // ---------- Daten ----------
  data() { return { tracks: this.tracks.map(t => ({ ...t })) }; },
  load(d) { this.stopAll(); this.tracks = d && Array.isArray(d.tracks) ? d.tracks.filter(t => t && t.rec).map(t => ({ id: t.id || uid("g"), rec: String(t.rec), name: t.name || "Gesang", at: t.at | 0, off: +t.off || 0, vol: t.vol ?? 1, mute: !!t.mute, len: +t.len || 0 })) : []; this.sync(); },
  async buf(t) {
    if (this.bufs.has(t.rec)) return this.bufs.get(t.rec);
    const r = await DB.get("recs", t.rec); if (!r || !Engine.ctx) return null; const ch = Recs.audio(r), b = Engine.ctx.createBuffer(1, ch[0].length, r.sr); b.copyToChannel(ch[0], 0);
    this.bufs.set(t.rec, b); if (!t.len) t.len = b.duration; return b;
  },
  preload() { for (const t of this.tracks) this.buf(t).catch(() => {}); },
  // ---------- Ausgang: über die Summe (mit etwas Hall), damit Live-Mitschnitt und Export den Gesang enthalten ----------
  out() {
    if (this.o || !Engine.ctx) return this.o; const c = Engine.ctx; this.o = c.createGain(); this.o.gain.value = 1;
    this.o.connect(Engine.out); const s = c.createGain(); s.gain.value = 0.14; this.o.connect(s).connect(Engine.verb); return this.o;
  },
  // ---------- Abspielen im Takt ----------
  onStep(step, time) {
    if (this.rec && this.rec.S != null && step < this.rec.S && step % 4 === 0 && step >= this.rec.S - 16) { try { Metro.click(time, step % 16 === 0); } catch (_) {} }
    for (const t of this.tracks) { if (t.mute || t.at !== step) continue; const b = this.bufs.get(t.rec); if (!b) { this.buf(t); continue; } this.play(t, b, time); }
  },
  play(t, b, time, from = 0) {
    const c = Engine.ctx, s = c.createBufferSource(), g = c.createGain(); s.buffer = b; g.gain.value = t.vol; s.connect(g).connect(this.out());
    let when = time + t.off / 1000, off = from; if (when < c.currentTime) { off += c.currentTime - when; when = c.currentTime; } if (off >= b.duration) return;
    s.start(when, off); const e = { s, g, t }; this.srcs.push(e); s.onended = () => { const i = this.srcs.indexOf(e); if (i >= 0) this.srcs.splice(i, 1); this.sync(); }; this.sync();
  },
  stopAll() { for (const e of this.srcs) try { e.s.stop(); } catch (_) {} this.srcs = []; },
  playing(t) { return this.srcs.some(e => e.t === t); },
  restart() { if (Transport.running) Transport.stop(); LoopCtl.release && LoopCtl.release(); setTimeout(() => Transport.start(), 60); },
  // ---------- Einsingen ----------
  async startRec() {
    if (this.rec || !Engine.ctx) return; const why = MicFix.reason(null);
    if (why) { this.importPick(true); setTimeout(() => MicFix.tell(why), 400); return; }   // im selben Tipp: Aufnahme-App
    if (Engine.ctx.state !== "running") try { await Engine.ctx.resume(); } catch (_) {}
    const restart = this.fromStart || !Transport.running; if (restart && Transport.running) Transport.stop();   // erst das Band anhalten, dann aufnehmen
    let stream; try { stream = this.phones ? await MicFix.get() : await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: false, autoGainControl: false } }); }
    catch (e) { MicFix.tell(MicFix.reason(e)); return; }
    const c = Engine.ctx, sr = c.sampleRate; let src; try { src = c.createMediaStreamSource(stream); } catch (e) { stream.getTracks().forEach(t => t.stop()); MicFix.tell("rate"); return; }
    const n = Engine.makeRec(1), z = c.createGain(); z.gain.value = 0; src.connect(n.input || n); n.connect(z).connect(c.destination);
    const R = this.rec = { stream, src, n, chunks: [], rt0: null, lv: 0, S: null, sr, set: null };
    n.port.onmessage = e => { const d = e.data; if (d.t === "t0") R.rt0 = d.v; else if (d.t === "chunk") R.chunks.push(d.d[0]); else if (d.t === "lvl") R.lv = d.v; else if (d.t === "end" && R.done) R.done(); };
    n.port.postMessage({ on: true, ch: 1 });
    // Startpunkt: von vorn (Band zurück, 1 Takt Einzählen) oder zur nächsten Eins
    if (restart) { LoopCtl.release && LoopCtl.release(); Transport.start(); R.S = 16; }
    else R.S = Math.ceil((Transport.step + 4) / 16) * 16;
    R.T = () => Transport.t0 + R.S * Transport.spb;
    UI.hideSheets(); Hap(12); this.tick = setInterval(() => this.pill(), 120); this.pill(); this.sync(); document.body.classList.add("ksing");
  },
  async stopRec(cancel) {
    const R = this.rec; if (!R) return; clearInterval(this.tick); this.pillEl(null); document.body.classList.remove("ksing");
    const end = new Promise(r => { R.done = r; setTimeout(r, 700); }); R.n.port.postMessage({ on: false }); await end;
    try { R.src.disconnect(); R.n.disconnect(); } catch (_) {} R.stream.getTracks().forEach(t => t.stop()); this.rec = null; this.sync();
    if (cancel) { UI.toast("Gesangsaufnahme verworfen", 1400); return; }
    const total = R.chunks.reduce((a, c) => a + c.length, 0), x = new Float32Array(total); let o = 0; for (const ch of R.chunks) { x.set(ch, o); o += ch.length; }
    // Laufzeit ausgleichen: was man zum Takt singt, kommt um Ausgabe- + Eingabeverzögerung später an
    const c = Engine.ctx, tr = R.stream.getAudioTracks()[0], inLat = (tr && tr.getSettings && tr.getSettings().latency) || 0.01, outLat = (c.outputLatency || 0) + (c.baseLatency || 0);
    const i0 = Math.round((R.T() + outLat + inLat - (R.rt0 ?? R.T())) * R.sr);
    if (i0 >= total - R.sr * 0.3) { UI.toast("Zu kurz – die Aufnahme beginnt erst zur Eins nach dem Einzählen", 2600); return; }
    let y = i0 >= 0 ? x.slice(i0) : (() => { const a = new Float32Array(total - i0); a.set(x, -i0); return a; })();
    let pk = 0; for (let i = 0; i < y.length; i += 5) pk = Math.max(pk, Math.abs(y[i])); if (pk < 0.003) { UI.toast("In der Aufnahme war es still – Mikrofon prüfen (Menü → 🎤 Prüfen)", 3000); return; }
    // leise Enden abschneiden, sanft ausblenden
    let e = y.length; while (e > R.sr && Math.abs(y[e - 1]) < 0.002) e--; y = y.slice(0, Math.min(y.length, e + R.sr * 0.3)); for (let i = 0; i < Math.min(2000, y.length); i++) y[y.length - 1 - i] *= i / 2000;
    await this.add(y, R.sr, R.S);
  },
  async add(y, sr, at) {
    if (!Projects.cur) return; const n = this.tracks.length + 1, name = `Gesang ${n}`;
    const r = await Recs.add([y], sr, `${name} · ${SetCap.stamp()}`, "gesang"); Undo.push();
    const t = { id: uid("g"), rec: r.id, name, at, off: 0, vol: 1, mute: false, len: y.length / sr }; this.tracks.push(t);
    const b = Engine.ctx.createBuffer(1, y.length, sr); b.copyToChannel(y, 0); this.bufs.set(r.id, b); Save.soon(); this.sync();
    UI.toastAct(`🎙 ${name} liegt ab Takt ${Math.floor(at / 16) + 1} – ▶ spielt alles von vorn`, "Anhören", () => this.restart(), 4200); return t;
  },
  // ---------- ohne Mikrofon: Aufnahme-App oder Datei ----------
  importPick(capture) {
    let i = $("singIn"); if (!i) { i = document.createElement("input"); i.type = "file"; i.id = "singIn"; i.accept = "audio/*"; i.hidden = true; document.body.appendChild(i);
      i.addEventListener("change", async () => { const f = i.files && i.files[0]; i.value = ""; if (!f || !Engine.ctx) return;
        try { const ab = await AudioIn.decodeFile(f), n = Math.min(ab.length, ab.sampleRate * 600), y = new Float32Array(n); for (let c = 0; c < ab.numberOfChannels; c++) { const d = ab.getChannelData(c); for (let k = 0; k < n; k++) y[k] += d[k] / ab.numberOfChannels; }
          const t = await this.add(y, ab.sampleRate, 0); if (t) UI.toast("Gesangsspur ab Takt 1 – mit Takt ◀ ▶ und Versatz an die richtige Stelle schieben", 3600); this.sheet(); }
        catch (e) { UI.toast("Diese Datei kann der Browser nicht lesen – M4A, MP3 oder WAV", 3000); } }); }
    if (capture) i.setAttribute("capture", ""); else i.removeAttribute("capture"); i.click();
  },
  // ---------- Anzeige ----------
  pillEl(h) { let p = $("singPill"); if (!h) { if (p) p.remove(); return; } if (!p) { p = document.createElement("button"); p.id = "singPill"; p.className = "singpill"; document.body.appendChild(p); p.onclick = () => { Hap(8); this.stopRec(); }; } if (p._h !== h) { p._h = h; p.innerHTML = h; } return p; },
  pill() {
    const R = this.rec; if (!R) return; const left = R.T() - Engine.now(), beat = Transport.spb * 4;
    const txt = left > 0 ? `<b>🎙 Einzählen … ${Math.max(1, Math.ceil(left / beat - 0.08))}</b><small>gleich singen</small>` : `<b>🎙 Gesang · Takt ${Math.floor(-left / (beat * 4)) + 1}</b><small>tippen = fertig</small>`;
    const p = this.pillEl(txt + `<i style="--lv:${Math.min(1, R.lv * 2.2).toFixed(2)}"></i>`); if (p) p.classList.toggle("cnt", left > 0);
  },
  fmt(s) { return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`; },
  sync() { try { if (Sheets.cur === "Gesang") this.render(); KSheet.sync && KSheet.sync(true); } catch (_) {} },
  sheet() { const s = Sheets.open("Gesang", Sheets.head("🎙 Gesangsspuren") + `<div id="singS"></div>`); s.addEventListener("click", e => this.click(e)); s.addEventListener("input", e => this.input(e)); this.render(); this.preload(); },
  render() {
    const el = $("singS"); if (!el) return; const why = MicFix.reason(null), barSec = Transport.spb * 16;
    const rows = this.tracks.map((t, i) => { const bars = t.len ? Math.max(1, Math.round(t.len / barSec)) : 0, pl = this.playing(t);
      return `<div class="sgr${t.mute ? " mute" : ""}${pl ? " pl" : ""}"><div class="sgh"><b>${esc(t.name)}</b><small>ab Takt ${Math.floor(t.at / 16) + 1}${t.at % 16 ? `.${(t.at % 16) / 4 + 1}` : ""} · ${t.len ? this.fmt(t.len) + ` · ≈ ${bars} Takte` : "…"}${t.off ? ` · Versatz ${t.off > 0 ? "+" : ""}${t.off} ms` : ""}</small></div>
        <div class="sgc"><button data-sg="pre" data-i="${i}" aria-label="${esc(t.name)} allein anhören">▶</button><button data-sg="mute" data-i="${i}" aria-pressed="${t.mute}" aria-label="stumm">${t.mute ? "🔇" : "🔊"}</button>
          <input type="range" min="0" max="1.5" step="0.05" value="${t.vol}" data-sg="vol" data-i="${i}" aria-label="Lautstärke ${esc(t.name)}">
          <button data-sg="barm" data-i="${i}" aria-label="einen Takt früher">◀ Takt</button><button data-sg="barp" data-i="${i}" aria-label="einen Takt später">Takt ▶</button>
          <button data-sg="offm" data-i="${i}" aria-label="20 ms früher">−20 ms</button><button data-sg="offp" data-i="${i}" aria-label="20 ms später">+20 ms</button>
          <button data-sg="del" data-i="${i}" class="del" aria-label="${esc(t.name)} löschen">✕</button></div></div>`; }).join("");
    el.innerHTML = `<p class="kch">Gesang läuft wie auf einem Band <b>linear ab Takt 1</b> mit, sobald ▶ startet – er wird keine Form und dreht sich nicht. Beliebig viele Spuren übereinander.</p>
      ${why ? `<p class="sgwarn">${esc(MicFix.TXT[why])} „● Einsingen“ öffnet dann die Aufnahme-App; die Spur liegt ab Takt 1 und lässt sich mit Takt ◀ ▶ / Versatz anlegen. <button class="btn" data-sg="why">Warum?</button></p>` : ""}
      <div class="row sgrec"><button class="btn primary" data-sg="rec">${this.rec ? "■ Fertig" : "● Einsingen"}</button><button class="btn" data-sg="play">${Transport.running ? "■ Stopp" : "▶ Alles von vorn"}</button></div>
      <div class="sgopt"><label><input type="checkbox" data-sg="start" ${this.fromStart ? "checked" : ""}> Von vorn mit 1 Takt Einzählen (sonst ab der nächsten Eins)</label>
        <label><input type="checkbox" data-sg="phones" ${this.phones ? "checked" : ""}> 🎧 Ich singe mit Kopfhörern (bester Klang; ohne Kopfhörer filtert KLANGRAUM die Musik aus dem Mikrofon)</label></div>
      <div class="sgl">${rows || `<p class="cueno">Noch keine Gesangsspur. „● Einsingen“: die Musik startet von vorn, nach einem Takt Einzählen singst du – „■ Fertig“ oben beendet.</p>`}</div>
      <div class="row"><button class="btn" data-sg="file">Audiodatei als Gesangsspur …</button></div>`;
  },
  input(e) { const t = e.target; if (t.dataset.sg === "vol") { const k = this.tracks[+t.dataset.i]; if (!k) return; k.vol = +t.value; for (const x of this.srcs) if (x.t === k) x.g.gain.setTargetAtTime(k.vol, Engine.now(), 0.03); Save.soon(); } },
  click(e) {
    const b = e.target.closest("[data-sg]"); if (!b || b.dataset.sg === "vol") return; const k = b.dataset.sg, t = this.tracks[+b.dataset.i]; Hap(6);
    if (k === "rec") { if (this.rec) this.stopRec(); else this.startRec(); return; }
    if (k === "play") { if (Transport.running) Transport.stop(); else this.restart(); setTimeout(() => this.render(), 120); return; }
    if (k === "start") { this.fromStart = b.checked; store.set("singFromStart", this.fromStart); return; }
    if (k === "phones") { this.phones = b.checked; store.set("singPhones", this.phones); return; }
    if (k === "file") { this.importPick(false); return; }
    if (k === "why") { MicFix.sheet(); return; }
    if (!t) return;
    if (k === "pre") { this.buf(t).then(bf => { if (!bf) return; Recs.stop(); const c = Engine.ctx, s = c.createBufferSource(); s.buffer = bf; const g = c.createGain(); g.gain.value = t.vol; s.connect(g).connect(c.destination); s.start(); Recs.player = { src: s, t0: Engine.now(), r: null }; }); return; }
    Undo.push();
    if (k === "mute") t.mute = !t.mute; else if (k === "barm") t.at = Math.max(0, t.at - 16); else if (k === "barp") t.at += 16; else if (k === "offm") t.off -= 20; else if (k === "offp") t.off += 20;
    else if (k === "del") { this.tracks.splice(this.tracks.indexOf(t), 1); for (const x of [...this.srcs]) if (x.t === t) try { x.s.stop(); } catch (_) {} UI.toastAct(`${t.name} gelöscht`, "Rückgängig", () => Undo.undo(), 5000); }
    if (k === "mute") for (const x of this.srcs) if (x.t === t) x.g.gain.setTargetAtTime(t.mute ? 0 : t.vol, Engine.now(), 0.03);
    Save.soon(); this.render();
  },
  chip() { const n = this.tracks.length, r = !!this.rec; if (!n && !r) return ""; return `<button class="kchip${r ? " on" : ""}" data-sing="1" aria-label="Gesangsspuren${n ? ` (${n})` : ""}" title="Gesangsspuren">🎙${n ? `<b>${n}</b>` : ""}</button>`; }
};
// Takt, Stopp, Speichern, Laden
{ const os = Transport.onStep.bind(Transport); Transport.onStep = function (step, time) { try { Sing.onStep(step, time); } catch (e) { console.warn(e); } return os(step, time); }; }
{ const st = Transport.stop.bind(Transport); Transport.stop = function () { Sing.stopAll(); if (Sing.rec) Sing.stopRec(); return st(); }; }
{ const pd = Project.data.bind(Project); Project.data = function (mem) { const d = pd(mem); try { d.sing = Sing.data(); } catch (_) {} return d; }; }
{ const pl = Project.load.bind(Project); Project.load = function (d, mem) { const r = pl(d, mem); try { Sing.load(d && d.sing); Sing.preload(); } catch (_) {} return r; }; }
// Zugang: Chip im Steuerfeld, Menü, Kreis
{ const ht = KSheet.html; KSheet.html = function () { let h = ht.call(this); if (FBar.mode() || !h.includes('<span class="kschips">')) return h; return h.replace('<span class="kschips">', '<span class="kschips">' + Sing.chip()); }; }
document.addEventListener("click", e => { const b = e.target.closest && e.target.closest("[data-sing]"); if (!b) return; e.stopPropagation(); e.preventDefault(); Hap(6); if (Sing.rec) Sing.stopRec(); else Sing.sheet(); }, true);
Cmd.L.gesang = { g: "set", ic: () => '<svg viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>', n: () => Sing.rec ? "Gesang fertig" : "Gesang einsingen", run: () => { if (Sing.rec) Sing.stopRec(); else Sing.sheet(); } };
{ const g = Cmd.GROUPS.find(x => x[0] === "set"); if (g && !g[3].includes("gesang")) g[3].push("gesang"); }
{ const run0 = Cmd.run.bind(Cmd); Cmd.run = function (id, f) { if (id === "gesang") { Hap(6); Cmd.L.gesang.run(); return; } return run0(id, f); }; }
{ const op = Sheets.open.bind(Sheets); Sheets.open = function (name, html, ...r) { const s = op(name, html, ...r);
  try { if (name === "Menü" && s && !s.querySelector("[data-msing]")) { const a = s.querySelector(".mjam"); if (a) { a.insertAdjacentHTML("beforeend", `<button class="btn" data-msing="1">🎙 Gesangsspuren${Sing.tracks.length ? ` (${Sing.tracks.length})` : ""}</button>`); s.querySelector("[data-msing]").onclick = () => { Hap(); UI.hideSheets(); Sing.sheet(); }; } } } catch (e) { console.warn(e); }
  return s; }; }

// ---------- Aufnahmeschutz: während einer Aufnahme nur spielen ----------
const RecGuard = {
  active() { try { return Forms.list.some(f => Loops.busy(f)) || !!(typeof Rec !== "undefined" && Rec.on) || !!Sing.rec || !!(MicForm && MicForm.on) || !!(SetCap && SetCap.busy); } catch (_) { return false; } },
  was: false,
  tick() { const a = this.active(); if (a !== this.was) { this.was = a; document.body.classList.toggle("krecguard", a); if (a && Cfg.get("play") === "bearbeiten") UI.toast("Aufnahme läuft: Formen nur spielen – langes Drücken öffnet kein Menü (Kreis über ◉)", 2200); if (!a) try { Radial.close(); } catch (_) {} } }
};
{ const po = Play.on.bind(Play); Play.on = function () { return po() || RecGuard.active(); }; }
// Sicherung: ein Halten auf der Form (mit Finger-ID) öffnet während der Aufnahme keinen Kreis – über Namen oder ◉ geht es weiter
{ const of = Radial.openFor; Radial.openFor = function (...a) { RecGuard.fromName = true; try { return of.apply(this, a); } finally { RecGuard.fromName = false; } }; }
{ const op = Radial.open; Radial.open = function (f, x, y, pid, ...r) { if (RecGuard.active() && pid != null && !RecGuard.fromName) return; return op.call(this, f, x, y, pid, ...r); }; }
setInterval(() => { try { RecGuard.tick(); } catch (_) {} }, 150);

// ---------- Hilfe ----------
Help.T.push({ id: "gesang", ic: "🎙", t: "Gesangsspuren einsingen", k: "gesang singen stimme spur einsingen band linear aufnahme vocal mikrofon kopfhörer", h: `<ul>
  <li><b>🎙 Gesang</b> im Steuerfeld (oder Menü → 🎙 Gesangsspuren) → <b>● Einsingen</b>: die Musik startet von vorn, ein Takt wird eingezählt (Klicks), dann singst du. Oben zeigt die rote Anzeige Takt und Pegel – antippen = <b>fertig</b>.</li>
  <li>Die Spur wird <b>keine Form</b>: sie läuft wie auf einem Band <b>linear ab ihrem Takt</b> mit, sobald ▶ startet, und ist im Live-Mitschnitt und Export enthalten. Beliebig viele Spuren übereinander – beim Einsingen hörst du die vorigen.</li>
  <li>Je Spur: ▶ allein anhören · 🔊/🔇 · Lautstärke · <b>Takt ◀ ▶</b> verschiebt um einen Takt · <b>±20 ms</b> Feinversatz · ✕ löschen (↶ holt sie zurück).</li>
  <li>Mit <b>Kopfhörern</b> klingt es am besten (Häkchen setzen); ohne filtert KLANGRAUM die Musik aus dem Mikrofon heraus.</li>
  <li>Ohne direktes Mikrofon (Claude-App, Datei auf Android) öffnet „● Einsingen“ die Aufnahme-App; die Spur liegt dann ab Takt 1 und wird mit Takt ◀ ▶ / Versatz angelegt. Auch jede Audiodatei kann eine Gesangsspur werden.</li></ul>` });
{ const c = Help.CATS.find(x => x[0] === "Aufnehmen"); if (c && !c[1].includes("gesang")) c[1].splice(2, 0, "gesang"); }
Help.WANT.splice(6, 0, ["Gesang einsingen (läuft linear mit)", "gesang"]);
{ const p = Help.T.find(x => x.id === "loop"); if (p) p.h = p.h.replace("</ul>", "<li><b>Während der Aufnahme</b> gilt automatisch „Spielen“: langes Drücken auf eine Form spielt einen langen Ton und öffnet kein Menü. Den Kreis gibt es dann über ◉ oder den Namen.</li></ul>"); }
