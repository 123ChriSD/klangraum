/* ============================================================
   v49: Mikrofon – Ursache erkennen, klar sagen, immer einen Weg haben
   Gründe, warum der Browser kein Mikrofon gibt: Datei ohne sichere Adresse (Android öffnet Downloads als content://),
   eingebettete Ansicht ohne Freigabe (claude.ai), Erlaubnis verweigert, Mikrofon belegt, kein Mikrofon, Firefox mit
   anderer Abtastrate. Für jeden Fall: genaue Meldung + Ersatzweg (Aufnahme-App des Handys) + Prüfseite im Menü.
   ============================================================ */
const MicFix = {
  C: { audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } },
  // ---- Diagnose ohne Nachfrage ----
  env() {
    const p = location.protocol, fp = document.permissionsPolicy || document.featurePolicy;
    let framed = false; try { framed = window.top !== window.self; } catch (_) { framed = true; }
    return { proto: p, secure: !!window.isSecureContext, api: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
      policy: fp && fp.allowsFeature ? fp.allowsFeature("microphone") : null, framed, android: /Android/i.test(navigator.userAgent), ios: /iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1),
      ff: /Firefox\//.test(navigator.userAgent) };
  },
  async perm() { try { if (!navigator.permissions || !navigator.permissions.query) return null; const r = await navigator.permissions.query({ name: "microphone" }); return r.state; } catch (_) { return null; } },
  // Grund als Kennwort
  reason(e, env = this.env()) {
    if (!env.secure || !env.api) return env.proto === "content:" || env.android && env.proto !== "https:" ? "content" : "insecure";
    if (env.policy === false) return "policy";
    if (!e) return null;
    const n = e.name || "";
    if (n === "NotAllowedError" || n === "SecurityError" || n === "PermissionDeniedError") return env.framed && env.policy !== true ? "policy" : "denied";
    if (n === "NotFoundError" || n === "DevicesNotFoundError") return "nodevice";
    if (n === "NotReadableError" || n === "TrackStartError" || n === "AbortError") return "busy";
    if (n === "OverconstrainedError") return "constraint";
    if (n === "NotSupportedError" || /sample.?rate/i.test(e.message || "")) return "rate";
    return "other";
  },
  TXT: {
    content: "Die heruntergeladene Datei ist auf dem Handy ohne sichere Adresse geöffnet (Android zeigt sie als „content://“). Dort gibt der Browser kein Mikrofon frei.",
    insecure: "Diese Seite ist ohne sichere Adresse (https) geöffnet. Dort gibt der Browser kein Mikrofon frei.",
    policy: "Diese eingebettete Ansicht (z. B. in der Claude-App) darf das Mikrofon nicht benutzen.",
    denied: "Das Mikrofon wurde für diese Seite nicht erlaubt.",
    nodevice: "Es wurde kein Mikrofon gefunden.",
    busy: "Das Mikrofon ist gerade belegt (Anruf, Sprachmemo, andere App oder anderer Tab).",
    constraint: "Das Mikrofon kann die gewünschte Einstellung nicht – KLANGRAUM versucht es mit Standardwerten.",
    rate: "Der Browser kann das Mikrofon nicht direkt mit der Klang-Maschine verbinden – KLANGRAUM nimmt über einen Umweg auf.",
    other: "Das Mikrofon ließ sich nicht starten."
  },
  // ---- Mikrofon holen: mit Rückfall auf Standardwerte ----
  async get() {
    if (MicStart.stream && MicStart.stream.active) return MicStart.stream.clone();
    try { return await navigator.mediaDevices.getUserMedia(this.C); }
    catch (e) { if (e && (e.name === "OverconstrainedError" || e.name === "TypeError" && this.env().api)) return await navigator.mediaDevices.getUserMedia({ audio: true }); throw e; }
  },
  // ---- Ersatzweg: Aufnahme-App des Handys (geht auch ohne sichere Adresse) ----
  captureInput() {
    let i = $("mfCap"); if (!i) { i = document.createElement("input"); i.type = "file"; i.id = "mfCap"; i.accept = "audio/*"; i.setAttribute("capture", ""); i.hidden = true; document.body.appendChild(i);
      i.addEventListener("change", async () => { const f = i.files && i.files[0]; i.value = ""; if (!f) return; await this.fromFile(f); }); }
    return i;
  },
  capture() { try { this.captureInput().click(); Hap(8); } catch (e) { UI.toast("Die Aufnahme-App ließ sich nicht öffnen – im Menü „🎤 Mikrofon prüfen“", 3200); } },
  async fromFile(f) {
    if (!Engine.ctx) return; if (Engine.ctx.state !== "running") try { await Engine.ctx.resume(); } catch (_) {}
    try { const ab = await AudioIn.decodeFile(f), n = Math.min(ab.length, ab.sampleRate * 20), x = new Float32Array(n);
      for (let c = 0; c < ab.numberOfChannels; c++) { const d = ab.getChannelData(c); for (let i = 0; i < n; i++) x[i] += d[i] / ab.numberOfChannels; }
      this.toForm(x, ab.sampleRate); }
    catch (e) { UI.toast("Diese Aufnahme kann der Browser nicht lesen – bitte als M4A, MP3 oder WAV aufnehmen", 3200); }
  },
  // Aufnahme → neue spielbare Form, ohne Dialog (wie 🎤 Mikro)
  toForm(x, sr) {
    const name = ("Mikro " + new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })).slice(0, 16);
    const ft = x.length > sr * 0.1 ? K.audioFeatures(x, sr, 12) : null; if (!ft) { UI.toast("Aufnahme zu leise oder zu kurz – nichts angelegt", 2200); return null; }
    if (Projects.cur) Recs.add([x], sr, `${name} · ${SetCap.stamp()}`, "stimme");
    const sh = K.shapeFromAudio(ft), f0 = ft.f0 || midiHz(60), y = K.fromI16(K.toI16(ft.y)), oct = Math.round((K.hzMidi(f0) - Music.mu.melRoot) / 12) - K.sizeOct(sh.size);
    Undo.push(); const f = Forms.make({ seedId: "kugel", name, kind: "sample", h: sh.h, size: sh.size, stretch: sh.stretch, spin: 0.1, oct, env: { att: 0.004, dec: 1, sus: 1, rel: 0.25, bt: -1, nb: 0, nz: 0, mt: 0 }, sample: { d: y, f0, sr, name, sum: AudioIn.sum(y) } });
    if (!f) return null; Forms.rebuild(f, true); Forms.setActive(f); UI.soon(); Save.soon(); Hap(14); UI.toast(`🎤 ${name} ist eine neue Form – antippen zum Spielen`, 2200); return f;
  },
  // Meldung mit passendem Ausweg
  tell(r) {
    const t = this.TXT[r] || this.TXT.other;
    if (r === "content" || r === "insecure" || r === "policy") UI.toastAct(t + " Weiter mit der Aufnahme-App des Handys.", "Aufnehmen", () => this.capture(), 7000);
    else if (r === "denied") UI.toastAct(t + " Schloss-Symbol neben der Adresse → Mikrofon → Zulassen, dann neu laden.", "Prüfen", () => this.sheet(), 7000);
    else UI.toastAct(t, "Prüfen", () => this.sheet(), 6000);
  },
  // ---- Aufnahme über MediaRecorder (wenn die direkte Verbindung scheitert, z. B. Firefox mit anderer Abtastrate) ----
  async mrStart(stream) {
    const mime = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"].find(m => window.MediaRecorder && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(m)) || "";
    const mr = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined), parts = []; mr.ondataavailable = e => { if (e.data && e.data.size) parts.push(e.data); };
    const done = new Promise(r => mr.onstop = r); mr.start(250);
    MicForm.mr = { mr, parts, done, stream, mime }; MicForm.on = true; MicForm.t0 = performance.now(); Hap(10);
    MicForm.tick = setInterval(() => { const s = (performance.now() - MicForm.t0) / 1000; MicForm.pill(`🎤 ${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")} · tippen = fertig`, 0.3); if (s > 20) MicForm.stop(); }, 150);
    MicForm.pill("🎤 0:00 · tippen = fertig", 0); UI.soon();
  },
  async mrStop() {
    const M = MicForm.mr; MicForm.mr = null; MicForm.on = false; clearInterval(MicForm.tick); MicForm.pill(null);
    try { M.mr.stop(); } catch (_) {} await Promise.race([M.done, new Promise(r => setTimeout(r, 1500))]); M.stream.getTracks().forEach(t => t.stop());
    const blob = new Blob(M.parts, { type: M.mime || "audio/webm" }); await this.fromFile(new File([blob], "mikro", { type: blob.type })); UI.soon();
  },
  // ---- Prüfseite: alles auf einen Blick, mit Pegeltest ----
  async sheet() {
    const env = this.env(), pm = await this.perm(), r = this.reason(null, env);
    const row = (k, ok, v) => `<div class="mfrow"><span>${k}</span><b class="${ok === true ? "ok" : ok === false ? "no" : ""}">${v}</b></div>`;
    const s = Sheets.open("Mikrofon", Sheets.head("🎤 Mikrofon prüfen") + `<div class="mfx">
      ${row("Adresse", env.secure, env.proto === "content:" ? "content:// (Datei aus Downloads)" : env.proto.replace(":", "") + (env.secure ? " · sicher" : " · nicht sicher"))}
      ${row("Mikrofon-Schnittstelle", env.api, env.api ? "vorhanden" : "fehlt (unsichere Adresse)")}
      ${row("Eingebettet", env.framed ? (env.policy === false ? false : null) : true, env.framed ? (env.policy === false ? "ja – Mikrofon gesperrt" : "ja") : "nein")}
      ${!env.api ? row("Erlaubnis", null, "– (ohne Schnittstelle nicht abfragbar)") : row("Erlaubnis", pm === "granted" ? true : pm === "denied" ? false : null, pm === "granted" ? "erlaubt" : pm === "denied" ? "verweigert" : pm === "prompt" ? "wird gefragt" : "unbekannt")}
      ${row("Beim Start", MicStart.stream && MicStart.stream.active ? true : null, MicStart.stream && MicStart.stream.active ? "bereit" : store.get("micStart") === false ? "abgeschaltet" : "nicht aktiv")}
      <div class="meter mfmeter"><i id="mfLv"></i></div><p id="mfMsg" class="kch">${r ? esc(this.TXT[r]) : "Alles bereit – „Pegel testen“ zeigt, ob Ton ankommt."}</p>
      <div class="row"><button class="btn primary" id="mfTest"${env.api && env.secure ? "" : " disabled"}>Pegel testen (3 s)</button><button class="btn" id="mfCapB">Mit Aufnahme-App aufnehmen</button></div>
      <h3 class="ph3">So bekommst du das Mikrofon direkt</h3>
      <ul class="mfhow">${this.how(env, r, pm).map(x => `<li>${x}</li>`).join("")}</ul></div>`);
    s.querySelector("#mfCapB").onclick = () => this.capture();
    s.querySelector("#mfTest").onclick = async ev => { const b = ev.currentTarget; b.disabled = true; const msg = t => { const m = $("mfMsg"); if (m) m.textContent = t; };
      let st; try { st = await this.get(); } catch (e) { const rr = this.reason(e); msg(this.TXT[rr] || String(e && e.name)); b.disabled = false; return; }
      try { if (Engine.ctx.state !== "running") await Engine.ctx.resume(); const an = Engine.ctx.createAnalyser(); an.fftSize = 1024; const src = Engine.ctx.createMediaStreamSource(st); src.connect(an); const d = new Float32Array(an.fftSize); let mx = 0; const t0 = performance.now();
        msg("Sprich oder klatsche …");
        await new Promise(res => { const step = () => { an.getFloatTimeDomainData(d); let p = 0; for (const v of d) p = Math.max(p, Math.abs(v)); mx = Math.max(mx, p); const l = $("mfLv"); if (l) l.style.width = Math.min(100, p * 160) + "%"; if (performance.now() - t0 < 3000) requestAnimationFrame(step); else res(); }; step(); });
        src.disconnect(); msg(mx > 0.02 ? `✓ Mikrofon funktioniert (Spitze ${Math.round(mx * 100)} %). 🎤 Mikro im Steuerfeld nimmt eine Form auf.` : "Kein Ton angekommen – ist das richtige Mikrofon gewählt oder stummgeschaltet?"); }
      catch (e) { msg(this.TXT.rate + " (Aufnahmen gehen trotzdem.)"); }
      finally { st.getTracks().forEach(t => t.stop()); b.disabled = false; } };
  },
  how(env, r, pm) {
    const L = [];
    if ((r === "insecure" || r === "policy") && !env.android) L.push("<b>Sofort:</b> <b>🎤 Mikro</b> öffnet hier automatisch die Aufnahme-App bzw. die Audio-Auswahl des Geräts – die Aufnahme wird sofort eine Form.");
    if (r === "content" || (env.android && !env.secure)) L.push("<b>Android:</b> Die Datei aus „Downloads“ läuft ohne sichere Adresse – dort gibt es grundsätzlich kein Mikrofon. Mit <b>🎤 Mikro</b> öffnet KLANGRAUM dann automatisch die <b>Aufnahme-App</b> des Handys; die Aufnahme wird sofort eine Form.");
    if (r === "policy") L.push("<b>In der Claude-App/claude.ai</b> ist das Mikrofon gesperrt. Die heruntergeladene Datei am <b>Rechner</b> per Doppelklick in Chrome, Edge oder Firefox öffnen – dort geht es direkt.");
    if (!env.secure || r === "policy") L.push("<b>Dauerhaft auf dem Handy:</b> KLANGRAUM unter einer eigenen <b>https-Adresse</b> ablegen (z. B. kostenlos über GitHub Pages oder Cloudflare Pages: Ordner mit <i>index.html</i> = KLANGRAUM-Datei hochladen). Dann fragt der Browser beim Start nach dem Mikrofon und alles geht ohne Umweg.");
    if (pm === "denied" || r === "denied") L.push("<b>Erlaubnis zurückholen:</b> Schloss- bzw. Einstellungs-Symbol links neben der Adresse → Mikrofon → <b>Zulassen</b> → Seite neu laden. iPhone: Einstellungen → Safari → Mikrofon → Fragen.");
    if (r === "busy") L.push("Anruf beenden, Sprachmemo-App oder andere Tabs mit Mikrofon schließen, dann erneut.");
    if (env.ios) L.push("<b>iPhone/iPad:</b> Eine Datei aus der Dateien-App öffnet nur eine Vorschau ohne Mikrofon – KLANGRAUM über eine https-Adresse in Safari öffnen.");
    if (!L.length) L.push("Alles in Ordnung. Wenn es trotzdem nicht klappt: Seite neu laden und beim Start „Erlauben“ tippen.");
    return L;
  }
};
// 🎤 Mikro → Form: sofort Ersatzweg, wenn der Browser hier kein Mikrofon gibt; Fehler genau benennen; Umweg bei Abtastrate
{ const st0 = MicForm.start, sp0 = MicForm.stop;
  MicForm.start = function () {
    const env = MicFix.env(), r0 = MicFix.reason(null, env);
    if (r0) { MicFix.capture(); if (!store.get("mfTold")) { store.set("mfTold", 1); setTimeout(() => MicFix.tell(r0), 600); } return Promise.resolve(); }   // im selben Tipp – sonst sperrt der Browser das Öffnen
    return (async () => {
      if (!Engine.ctx) return; if (Engine.ctx.state !== "running") try { await Engine.ctx.resume(); } catch (_) {}
      let stream; try { stream = await MicFix.get(); } catch (e) { MicFix.tell(MicFix.reason(e)); return; }
      // direkte Verbindung versuchen (gleiche Abtastrate) – sonst Umweg über MediaRecorder
      const md = navigator.mediaDevices, keep = md.getUserMedia; md.getUserMedia = async () => stream;
      try { await st0.call(this); } catch (e) { console.warn("MicForm direkt", e); } finally { md.getUserMedia = keep; }
      if (this.on && this.stream !== stream) stream.getTracks().forEach(t => t.stop());   // die Start-Freigabe wurde benutzt
      if (!this.on) { try { await MicFix.mrStart(stream); } catch (e) { stream.getTracks().forEach(t => t.stop()); MicFix.tell("other"); } }
      if (Engine.ctx.state !== "running") try { await Engine.ctx.resume(); } catch (_) {}   // iOS: nach der Freigabe läuft der Ton sonst nicht weiter
    })();
  };
  MicForm.stop = function () { if (this.mr) return MicFix.mrStop(); return sp0.call(this); };
}
// Beim Start: Grund sagen statt still nichts zu tun (einmal), und nach der Freigabe den Ton wieder anwerfen
{ const ask0 = MicStart.ask.bind(MicStart); MicStart.ask = async function () {
  if (store.get("micStart") === false) return; const env = MicFix.env(), r = MicFix.reason(null, env);
  if (r) { if (!store.get("mfStartTold")) { store.set("mfStartTold", 1); setTimeout(() => UI.toastAct("🎤 " + MicFix.TXT[r] + " 🎤 Mikro nutzt dann die Aufnahme-App.", "Warum?", () => MicFix.sheet(), 7000), 2500); } return; }
  try { const s = await MicFix.get(); this.stream = s; store.set("micOk", true); document.body.classList.add("kmic"); UI.toast("🎤 Mikrofon ist bereit – 🎤 Mikro im Steuerfeld nimmt sofort eine Form auf", 2600); }
  catch (e) { const rr = MicFix.reason(e); store.set("micOk", false); if (!store.get("mfDenyTold")) { store.set("mfDenyTold", 1); setTimeout(() => MicFix.tell(rr), 1500); } }
  setTimeout(() => { try { if (Engine.ctx && Engine.ctx.state !== "running") Engine.ctx.resume(); } catch (_) {} }, 300);
  void ask0;
}; }
// Live-Session: Mikrofon-Fehler genau benennen
{ const sm = Rec.setMic && Rec.setMic.bind(Rec); if (sm) Rec.setMic = async function (on) { const r = MicFix.reason(null); if (on && r) { MicFix.tell(r); return; } return sm(on); }; }
// Aufnahme-Blatt (Neu → Aufnahme): Grund genau benennen
{ const w0 = AudioIn.why.bind(AudioIn); AudioIn.why = function () { const r = MicFix.reason(null); return r ? MicFix.TXT[r] : w0(); }; }
// Menü: „🎤 Mikrofon prüfen“
{ const op = Sheets.open.bind(Sheets); Sheets.open = function (name, html, ...r) { const s = op(name, html, ...r);
  try { if (name === "Menü" && s && !s.querySelector("[data-mfx]")) { const a = s.querySelector(".mmic"); if (a) { a.insertAdjacentHTML("beforeend", `<button class="btn" data-mfx="1">Prüfen</button>`); s.querySelector("[data-mfx]").onclick = () => { Hap(); UI.hideSheets(); MicFix.sheet(); }; } } } catch (e) { console.warn(e); }
  return s; }; }
// Hilfe ergänzen
{ const m = Help.T.find(x => x.id === "mikro"); if (m) m.h = `<ul>
    <li>Beim Start fragt KLANGRAUM nach dem Mikrofon. Erlaubt: es ist sofort bereit.</li>
    <li><b>🎤 Mikro</b> in der Schalterzeile: tippen = Aufnahme, nochmal tippen = sofort eine neue, spielbare Form.</li>
    <li><b>Geht nicht?</b> Menü → <b>🎤 Mikrofon … Prüfen</b> zeigt den Grund und einen Pegeltest. Häufigster Grund: auf Android läuft die heruntergeladene Datei ohne sichere Adresse („content://“) – dort gibt der Browser kein Mikrofon. Dann öffnet <b>🎤 Mikro</b> automatisch die <b>Aufnahme-App</b> des Handys, und die Aufnahme wird sofort eine Form.</li>
    <li>In der Claude-App ist das Mikrofon gesperrt. Am Rechner die Datei per Doppelklick im Browser öffnen; auf dem Handy dauerhaft über eine eigene https-Adresse (z. B. GitHub Pages).</li>
    <li>Verweigert? Schloss-Symbol neben der Adresse → Mikrofon → Zulassen → neu laden.</li></ul>`; m.k += " geht nicht prüfen pegel content https erlaubnis aufnahme-app"; }
