/* ============================================================
   v52: Mikrofon aus der App – „Im eigenen Fenster öffnen“
   In claude.ai läuft KLANGRAUM eingebettet; die Einbettung sperrt das Mikrofon, und die Seite kann das nicht ändern.
   Ausweg: KLANGRAUM (die ganze App + das aktuelle Stück mit Aufnahmen) als eigenständige Seite in einem neuen
   Browserfenster öffnen – gleiche sichere Herkunft, aber nicht eingebettet → der Browser fragt nach dem Mikrofon.
   „⤴ Zurück in die App“ schickt das Stück zurück (Nachricht an das öffnende Fenster), sonst als Datei sichern.
   ============================================================ */
const MicWin = {
  url: null, at: 0, busy: null,
  embedded() { const e = MicFix.env(); return e.framed && e.policy !== true; },
  inWin() { return !!window.__KR_IMPORT || /^blob:/.test(location.href) && !!window.__KR_WIN; },
  // Paket: Stück + Aufnahmen (wie „Als Datei sichern“)
  async pack() {
    await Save.now(); if (!Projects.cur) return null; const p = await DB.get("projects", Projects.cur.id); if (!p) return null;
    return { app: "KLANGRAUM", kind: "sicherung", v: 3, saved: new Date().toISOString(), projects: [await Projects.packProject(p)], win: { from: Projects.cur.id, name: Projects.cur.name } };
  },
  build(pkg) { try { this.lastName = pkg && pkg.win && pkg.win.name; } catch (_) {}
    if (typeof SRC_HTML !== "string") throw new Error("Quelltext fehlt");
    const js = JSON.stringify(pkg || null).replace(/</g, "\\u003c").replace(/[\u2028\u2029]/g, " ");
    const inj = `<script>window.__KR_WIN=1;window.__KR_IMPORT=${js};<\/script>`;
    const i = SRC_HTML.indexOf("<head>"), html = "<!doctype html>" + (i >= 0 ? SRC_HTML.slice(0, i + 6) + inj + SRC_HTML.slice(i + 6) : inj + SRC_HTML);
    if (this.url) URL.revokeObjectURL(this.url); this.url = URL.createObjectURL(new Blob([html], { type: "text/html" })); this.at = Date.now(); return this.url;
  },
  prep() { if (this.busy) return this.busy; this.busy = (async () => { try { return this.build(await this.pack()); } finally { this.busy = null; } })(); return this.busy; },
  // muss im Tipp aufgerufen werden (sonst blockiert der Browser das Fenster)
  open() {
    const fresh = this.url && Date.now() - this.at < 4000;
    if (fresh) { const w = window.open(this.url, "_blank"); if (!w) return this.blocked(); this.watch(w); UI.toast("KLANGRAUM öffnet im eigenen Fenster – dort „Eintauchen“ und das Mikrofon erlauben", 3600); return; }
    // sonst: leeres Fenster sofort öffnen (Nutzergeste), Paket nachreichen
    let w = null; try { w = window.open("", "_blank"); } catch (_) {}
    if (!w) { if (this.url) { const w2 = window.open(this.url, "_blank"); if (w2) { this.watch(w2); UI.toast("Geöffnet mit dem zuletzt vorbereiteten Stand", 3000); return; } } return this.blocked(); }
    try { w.document.write('<!doctype html><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1"><body style="margin:0;display:grid;place-items:center;height:100vh;background:#0b1416;color:#cfe;font:16px system-ui">KLANGRAUM wird geöffnet …</body>'); } catch (_) {}
    this.prep().then(u => { try { w.location.replace(u); this.watch(w); } catch (e) { UI.toast("Das Fenster ließ sich nicht füllen – bitte nochmal tippen", 3000); } }).catch(() => { try { w.close(); } catch (_) {} UI.toast("Das Stück ließ sich nicht vorbereiten", 2600); });
  },
  watch(w) { this.win = w; },
  blocked() {
    UI.toastAct("Das neue Fenster wurde blockiert (z. B. in der Claude-App auf dem Handy oder durch einen Pop-up-Blocker). Den KLANGRAUM-Link in Chrome oder Safari öffnen und dort „Im eigenen Fenster“ tippen – oder Pop-ups für diese Seite erlauben.", "Link kopieren", () => { try { navigator.clipboard.writeText(JamInvite.URL); UI.toast("Link kopiert", 1400); } catch (_) {} }, 9000);
  },
  // ---- Auswahl, wenn das Mikrofon hier gesperrt ist ----
  choose(after) {
    const s = Sheets.open("Mikrofon frei", Sheets.head("🎤 Mikrofon benutzen") + `<div class="mwx">
      <p class="kch">${esc(MicFix.TXT[MicFix.reason(null)] || MicFix.TXT.policy)}</p>
      <button class="btn primary mwbig" data-mw="win" disabled><b>Im eigenen Fenster öffnen</b><small id="mwSt">wird vorbereitet …</small></button>
      <p class="kch">KLANGRAUM öffnet sich mit diesem Stück (Formen, Loops, Aufnahmen, Gesang) als eigene Seite im Browser – dort fragt der Browser nach dem Mikrofon. Mit <b>⤴ Zurück in die App</b> kommt das Stück wieder hierher.</p>
      <button class="btn" data-mw="cap">Stattdessen mit der Aufnahme-App des Handys aufnehmen</button>
      <p class="kch mwnote">Öffnet sich kein Fenster (manche Apps, z. B. die Claude-App auf dem Handy, erlauben das nicht): den KLANGRAUM-Link in Chrome oder Safari öffnen und dort „Im eigenen Fenster“ tippen.</p></div>`);
    const b = s.querySelector('[data-mw="win"]'), st = s.querySelector("#mwSt");
    this.prep().then(() => { b.disabled = false; st.textContent = "Mikrofon direkt · Stück wird mitgenommen"; }).catch(() => { b.disabled = false; st.textContent = "ohne Stück (konnte nicht vorbereitet werden)"; });
    s.addEventListener("click", e => { const t = e.target.closest("[data-mw]"); if (!t) return; Hap(8);
      if (t.dataset.mw === "win") { this.open(); UI.hideSheets(); }
      else if (t.dataset.mw === "cap") { UI.hideSheets(); if (after === "sing") Sing.importPick(true); else MicFix.capture(); } });
  }
};
// ---------- im eigenen Fenster: Stück übernehmen, Leiste „Zurück in die App“ ----------
if (window.__KR_WIN) {
  document.documentElement.classList.add("krwin");
  { const st = document.querySelector("#start .start-inner .meta"); if (st) st.insertAdjacentHTML("afterend", `<p class="jstart">🎤 Eigenes Fenster: Hier funktioniert das Mikrofon. Nach „Eintauchen“ fragt der Browser – bitte <b>Erlauben</b>.</p>`); }
  const t = setInterval(async () => {
    if (!App.started) return; clearInterval(t);
    const d = window.__KR_IMPORT; MicWin.origin = d && d.win ? d.win : null;
    const key = "krwinImp:" + (d && d.saved);
    let done = false; try { done = sessionStorage.getItem(key) === "1"; } catch (_) {}
    if (d && !done) { try { for (const q of d.projects || []) delete q.id; await Projects.importData(d); try { sessionStorage.setItem(key, "1"); } catch (_) {} } catch (e) { UI.toast("Stück konnte nicht übernommen werden – leeres Stück", 3000); } }
    const bar = document.createElement("div"); bar.id = "krwinBar"; bar.className = "krwinbar"; bar.innerHTML = `<span>🎤 Eigenes Fenster</span><button data-kw="back">⤴ Zurück in die App</button>`; document.body.appendChild(bar);
    bar.addEventListener("click", async e => { const b = e.target.closest("[data-kw]"); if (!b) return; Hap(8); b.disabled = true; b.textContent = "Wird übertragen …";
      try { const pkg = await MicWin.pack(); pkg.win = { back: 1, from: MicWin.origin && MicWin.origin.from, name: Projects.cur && Projects.cur.name };
        if (window.opener && !window.opener.closed) { window.opener.postMessage({ kr: "kr-back", data: pkg }, "*"); UI.toast("Stück ist zurück in der App – dieses Fenster kann zu", 3000); b.textContent = "✓ Übertragen"; setTimeout(() => { b.disabled = false; b.textContent = "⤴ Nochmal übertragen"; }, 2500); }
        else { await Projects.exportOne(Projects.cur.id); UI.toast("Die App ist nicht mehr offen – das Stück wurde als Datei gesichert. In der App: Meine Stücke → Sichern und Laden → Datei öffnen.", 6000); b.disabled = false; b.textContent = "⤴ Zurück in die App"; } }
      catch (err) { b.disabled = false; b.textContent = "⤴ Zurück in die App"; UI.toast("Übertragen ging nicht: " + (err && err.message || err), 3000); } });
  }, 400);
}
// ---------- in der App: Stück aus dem Fenster empfangen ----------
window.addEventListener("message", async e => {
  const m = e.data; if (!m || m.kr !== "kr-back" || !m.data || m.data.app !== "KLANGRAUM") return;
  if (e.source !== MicWin.win && e.origin !== location.origin) return;   // nur aus dem selbst geöffneten Fenster
  try { const d = m.data, p = d.projects && d.projects[0]; if (p) { delete p.id; p.name = String((MicWin.lastName || d.win && d.win.name || p.name || "Stück")).replace(/ · mit Mikro$/, "") + " · mit Mikro"; } await Projects.importData(d); UI.toast("🎤 Stück aus dem eigenen Fenster übernommen (mit allen Aufnahmen)", 3200); }
  catch (err) { UI.toast("Übernehmen ging nicht – im Fenster „Als Datei sichern“", 3000); }
});
// ---------- Zugänge: überall, wo das Mikrofon an der Einbettung scheitert ----------
{ const st0 = MicForm.start; MicForm.start = function () { if (!window.__KR_WIN && MicWin.embedded() && MicFix.reason(null) === "policy") { MicWin.choose("form"); return Promise.resolve(); } return st0.apply(this, arguments); }; }
{ const sr0 = Sing.startRec.bind(Sing); Sing.startRec = function () { if (!window.__KR_WIN && MicWin.embedded() && MicFix.reason(null) === "policy") { MicWin.choose("sing"); return Promise.resolve(); } return sr0(); }; }
{ const t0 = MicFix.tell.bind(MicFix); MicFix.tell = function (r) { if (r === "policy" && !window.__KR_WIN) { UI.toastAct(MicFix.TXT.policy, "Eigenes Fenster", () => MicWin.choose("form"), 8000); return; } return t0(r); }; }
{ const ask0 = MicStart.ask.bind(MicStart); MicStart.ask = async function () {
  if (!window.__KR_WIN && store.get("micStart") !== false && MicWin.embedded() && MicFix.reason(null) === "policy") { if (!store.get("mwTold")) { store.set("mwTold", 1); setTimeout(() => UI.toastAct("🎤 In dieser eingebetteten Ansicht sperrt claude.ai das Mikrofon. Im eigenen Fenster geht es.", "Eigenes Fenster", () => MicWin.choose("form"), 12000), 5500); } return; }
  return ask0(); }; }
// Prüfseite: großer Knopf oben, wenn eingebettet
{ const sh0 = MicFix.sheet.bind(MicFix); MicFix.sheet = async function () { await sh0(); const x = document.querySelector(".mfx"); if (x && !window.__KR_WIN && MicWin.embedded()) x.insertAdjacentHTML("afterbegin", `<button class="btn primary mwbig" data-mwo="1"><b>🎤 Im eigenen Fenster öffnen</b><small>dort funktioniert das Mikrofon – das Stück wird mitgenommen</small></button>`); const b = x && x.querySelector("[data-mwo]"); if (b) b.onclick = () => { Hap(8); UI.hideSheets(); MicWin.choose("form"); }; }; }
{ const h0 = MicFix.how.bind(MicFix); MicFix.how = function (env, r, pm) { const L = h0(env, r, pm); if (r === "policy") L.unshift("<b>Am einfachsten:</b> oben <b>„Im eigenen Fenster öffnen“</b> – KLANGRAUM öffnet sich mit diesem Stück als eigene Seite, dort fragt der Browser nach dem Mikrofon. Fertig? <b>⤴ Zurück in die App</b>."); return L; }; }
// Gesang-Blatt: Hinweis mit Knopf
{ const r0 = Sing.render.bind(Sing); Sing.render = function () { r0(); const w = document.querySelector(".sgwarn"); if (w && !window.__KR_WIN && MicWin.embedded() && !w.querySelector("[data-mwo2]")) { w.insertAdjacentHTML("beforeend", ` <button class="btn primary" data-mwo2="1">🎤 Im eigenen Fenster singen</button>`); w.querySelector("[data-mwo2]").onclick = e => { e.stopPropagation(); MicWin.choose("sing"); }; } }; }

// ---------- Import: Aufnahme-Verweise von Gesangsspuren und Schnittraum mitführen ----------
// (die Aufnahmen bekommen beim Laden neue Kennungen – v50 hat die Verweise in d.sing/d.schnitt nicht angepasst)
MicWin.remap = function (data, idm) {
  const walk = o => { if (!o || typeof o !== "object") return; if (Array.isArray(o)) { o.forEach(walk); return; } for (const k of Object.keys(o)) { const v = o[k]; if ((k === "rec" || k === "src") && typeof v === "string" && idm.has(v)) o[k] = idm.get(v); else if (v && typeof v === "object") walk(v); } };
  if (data) { if (data.sing) walk(data.sing); if (data.schnitt) walk(data.schnitt); }
};

// ---------- Datei im Browser geöffnet (Handy: content://, ohne https): zum sicheren KLANGRAUM-Link wechseln, Stück mitnehmen ----------
MicWin.insecure = () => { const r = MicFix.reason(null); return !window.__KR_WIN && (r === "content" || r === "insecure"); };
MicWin.chooseFile = function (after) {
  const s = Sheets.open("Mikrofon frei", Sheets.head("🎤 Mikrofon benutzen") + `<div class="mwx">
    <p class="kch">${esc(MicFix.TXT[MicFix.reason(null)])}</p>
    <button class="btn primary mwbig" data-mf2="link"><b>KLANGRAUM über den sicheren Link öffnen</b><small>dort funktioniert das Mikrofon · dein Stück wird mitgenommen</small></button>
    <ol class="mwsteps"><li>Tippen: dein Stück wird als Datei gesichert und der KLANGRAUM-Link öffnet sich im Browser.</li>
      <li>Dort „Eintauchen“, dann <b>Ordner-Knopf → Sichern und Laden → Datei öffnen</b> und die eben gesicherte Datei wählen.</li>
      <li><b>🎤 Mikro</b> tippen → <b>Im eigenen Fenster öffnen</b> → Mikrofon <b>Erlauben</b>.</li></ol>
    <p class="kch mwnote">Tipp: Den Link als Lesezeichen oder auf dem Startbildschirm speichern und KLANGRAUM künftig darüber öffnen – dann geht das Mikrofon immer, ohne Datei.</p>
    <button class="btn" data-mf2="cap">Stattdessen mit der Aufnahme-App des Handys aufnehmen</button></div>`);
  s.addEventListener("click", async e => { const t = e.target.closest("[data-mf2]"); if (!t) return; Hap(8);
    if (t.dataset.mf2 === "cap") { UI.hideSheets(); if (after === "sing") Sing.importPick(true); else MicFix.capture(); return; }
    const w = window.open(JamInvite.URL, "_blank");   // im Tipp öffnen, sonst blockiert der Browser
    try { if (Projects.cur) await Projects.exportOne(Projects.cur.id); } catch (_) {}
    if (!w) { try { location.href = JamInvite.URL; } catch (_) {} }
    UI.hideSheets(); UI.toast("Stück gesichert · KLANGRAUM-Link geöffnet – dort „Datei öffnen“ und 🎤 Mikro", 5000); });
};
{ const st1 = MicForm.start; MicForm.start = function () { if (MicWin.insecure()) { MicWin.chooseFile("form"); return Promise.resolve(); } return st1.apply(this, arguments); }; }
{ const sr1 = Sing.startRec.bind(Sing); Sing.startRec = function () { if (MicWin.insecure()) { MicWin.chooseFile("sing"); return Promise.resolve(); } return sr1(); }; }
{ const t1 = MicFix.tell.bind(MicFix); MicFix.tell = function (r) { if ((r === "content" || r === "insecure") && !window.__KR_WIN) { UI.toastAct(MicFix.TXT[r], "Mikrofon-Weg", () => MicWin.chooseFile("form"), 9000); return; } return t1(r); }; }
{ const a1 = MicStart.ask.bind(MicStart); MicStart.ask = async function () {
  if (MicWin.insecure() && store.get("micStart") !== false) { if (!store.get("mfFileTold")) { store.set("mfFileTold", 1); setTimeout(() => UI.toastAct("🎤 Diese Datei läuft ohne sichere Adresse – dort sperrt der Browser das Mikrofon. Über den KLANGRAUM-Link geht es.", "So geht's", () => MicWin.chooseFile("form"), 12000), 5500); } return; }
  return a1(); }; }
{ const sh1 = MicFix.sheet.bind(MicFix); MicFix.sheet = async function () { await sh1(); const x = document.querySelector(".mfx"); if (x && MicWin.insecure() && !x.querySelector("[data-mfo]")) { x.insertAdjacentHTML("afterbegin", `<button class="btn primary mwbig" data-mfo="1"><b>🎤 Über den sicheren Link öffnen</b><small>dort funktioniert das Mikrofon – das Stück wird mitgenommen</small></button>`); x.querySelector("[data-mfo]").onclick = () => { UI.hideSheets(); MicWin.chooseFile("form"); }; } }; }
{ const r1 = Sing.render.bind(Sing); Sing.render = function () { r1(); const w = document.querySelector(".sgwarn"); if (w && MicWin.insecure() && !w.querySelector("[data-mfo2]")) { w.insertAdjacentHTML("beforeend", ` <button class="btn primary" data-mfo2="1">🎤 Mikrofon-Weg</button>`); w.querySelector("[data-mfo2]").onclick = e => { e.stopPropagation(); MicWin.chooseFile("sing"); }; } }; }
