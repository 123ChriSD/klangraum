/* ================= Version 78: Bediensystem „Drei Punkte“ · Meine Stücke · Auflegen mit den Formen ================= */
const sv78 = p => `<svg viewBox="0 0 24 24" aria-hidden="true">${p}</svg>`;
const IC78 = {
  star: sv78('<path d="M12 3.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.200 2.700 1-5.800L3.600 9.700l5.800-.800z"/>'),
  save: sv78('<path d="M5 4h11l3 3v13H5z"/><path d="M8 4v5h7V4M8 20v-6h8v6"/>'),
  plus: sv78('<path d="M12 5v14M5 12h14"/>'), copy: sv78('<rect x="8" y="8" width="11" height="11" rx="2"/><path d="M5 15V6a1 1 0 0 1 1-1h9"/>'),
  out: sv78('<path d="M12 4v11M8 11l4 4 4-4M5 19h14"/>'), inn: sv78('<path d="M12 15V4M8 8l4-4 4 4M5 19h14"/>'),
  gear: sv78('<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.600 5.600l2.100 2.100M16.300 16.300l2.100 2.100M5.600 18.400l2.100-2.100M16.300 7.700l2.100-2.100"/>'),
  grid: sv78('<rect x="4" y="4" width="6" height="6" rx="1.500"/><rect x="14" y="4" width="6" height="6" rx="1.500"/><rect x="4" y="14" width="6" height="6" rx="1.500"/><rect x="14" y="14" width="6" height="6" rx="1.500"/>'),
  old: sv78('<rect x="4" y="5" width="16" height="14" rx="2"/><path d="M4 10h16M4 15h16"/>'),
  deck: sv78('<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2"/><path d="M12 4v3"/>'),
  minus: sv78('<path d="M5 12h14"/>'), mood: sv78('<circle cx="12" cy="12" r="8"/><path d="M8.500 14.500c1 1.300 2.200 2 3.500 2s2.500-.700 3.500-2M9 10h.010M15 10h.010"/>'),
  play: sv78('<path d="M8 5.500v13l11-6.500z"/>'), stop: sv78('<rect x="6.500" y="6.500" width="11" height="11" rx="2"/>'), up: sv78('<path d="M6 14l6-6 6 6"/>'),
  home: sv78('<path d="M4 11l8-7 8 7M6 10v10h12V10"/>'), x: sv78('<path d="M6 6l12 12M18 6L6 18"/>'), pen: sv78('<path d="M5 19l1-4L16 5l3 3L9 18z"/>'), bin: sv78('<path d="M5 7h14M9 7V5h6v2M7 7l1 13h8l1-13"/>')
};

/* ---------- 1) Meine Stücke: suchen, Favoriten, sichern, Kopie, als Datei, laden ---------- */
const Stuecke78 = {
  q: "", only: store.get("s78only") === "fav" ? "fav" : "alle", sort: store.get("s78sort") === "name" ? "name" : "zeit", list: [], ren: null,
  when(t) { const d = new Date(t || Date.now()), now = new Date(), hm = d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }); return d.toDateString() === now.toDateString() ? "heute " + hm : d.toLocaleDateString("de-DE", { day: "numeric", month: "short" }) + " " + hm; },
  /* Reihenfolge: Favoriten zuerst, dann zuletzt benutzt oder nach Namen · Filter: Suche und „nur Favoriten“ */
  order(L, o = {}) {
    const q = (o.q || "").trim().toLowerCase(), by = o.sort === "name" ? (a, b) => String(a.name).localeCompare(String(b.name), "de") : (a, b) => (b.updated || 0) - (a.updated || 0);
    return L.filter(p => (!q || String(p.name).toLowerCase().includes(q)) && (o.only !== "fav" || p.fav)).sort((a, b) => (b.fav ? 1 : 0) - (a.fav ? 1 : 0) || by(a, b));
  },
  async load() { try { this.list = await DB.all("projects"); } catch (_) { this.list = []; } const c = Projects.cur; if (c) { const i = this.list.findIndex(p => p.id === c.id); if (i >= 0) this.list[i] = c; else this.list.push(c); } Projects.known = this.list; return this.list; },
  async rec(id) { return Projects.cur && Projects.cur.id === id ? Projects.cur : await DB.get("projects", id); },
  async put(p) { if (Projects.cur && Projects.cur.id === p.id) { await Save.now(); try { await DB.put("projects", Projects.cur); } catch (_) {} } else await DB.put("projects", p); },
  async fav(id, v) { const p = await this.rec(id); if (!p) return false; p.fav = v == null ? !p.fav : !!v; await this.put(p); try { P78.paint(true); } catch (_) {} return p.fav; },
  async rename(id, name) { const v = String(name || "").trim().slice(0, 40); if (!v) return; const p = await this.rec(id); if (!p) return; p.name = v; await this.put(p); if (Projects.cur && Projects.cur.id === id) Projects.name(); },
  async save() { await Save.now(); let cl = false; try { if (Cloud.st === "on") { await Cloud.push(Projects.cur); cl = true; } } catch (_) {} Hud77.show(IC78.save, Projects.cur.name, "gesichert" + (cl ? " · auch in der Cloud" : ""), null, 1500); try { Projects.status(); } catch (_) {} },
  card(p) {
    const cur = Projects.cur && p.id === Projects.cur.id, nm = esc(p.name);
    return `<div class="s78c" data-id="${p.id}" aria-current="${!!cur}">
      <button class="s78o" data-s8="open:${p.id}" aria-label="${nm} ${cur ? "ist geöffnet" : "öffnen"}">${p.thumb ? `<img src="${p.thumb}" alt="">` : `<span class="ph"></span>`}<span class="s78n">${this.ren === p.id ? "" : `<b>${nm}</b>`}<small>${cur ? "geöffnet · " : ""}${this.when(p.updated)} · ${p.nForms ?? 0} Formen</small></span></button>
      ${this.ren === p.id ? `<input class="txt s78in" id="s78Ren" value="${nm}" maxlength="40" aria-label="Neuer Name für ${nm}">` : ""}
      <button class="s78f" data-s8="fav:${p.id}" aria-pressed="${!!p.fav}" aria-label="${nm} ${p.fav ? "ist Favorit – entfernen" : "als Favorit merken"}">${IC78.star}</button>
      <div class="s78a">${cur ? `<button data-s8="save:${p.id}">${IC78.save}<span>Sichern</span></button>` : ""}<button data-s8="dup:${p.id}">${IC78.copy}<span>Kopie</span></button><button data-s8="exp:${p.id}">${IC78.out}<span>Als Datei</span></button><button data-s8="ren:${p.id}">${IC78.pen}<span>Name</span></button><button data-s8="del:${p.id}" class="del">${IC78.bin}<span>Löschen</span></button></div></div>`;
  },
  body() {
    const L = this.order(this.list, this), nf = this.list.filter(p => p.fav).length;
    return `<div class="s78top"><button class="btn primary" data-s8="new">${IC78.plus}<span>Neues Stück</span></button><span class="btn filebtn">${IC78.inn}<span>Datei laden</span><input type="file" id="s78Imp" accept=".json,application/json" aria-label="Stück oder Sicherung aus einer Datei laden"></span><button class="btn" data-s8="backup">${IC78.out}<span>Alle sichern</span></button></div>
      <input class="al73q" id="s78Q" type="search" placeholder="Stück suchen" aria-label="Stück suchen" autocomplete="off" value="${esc(this.q)}">
      <div class="s78fl" role="group" aria-label="Anzeige"><button data-s8="only:alle" aria-pressed="${this.only === "alle"}">Alle <em>${this.list.length}</em></button><button data-s8="only:fav" aria-pressed="${this.only === "fav"}">${IC78.star}<span>Favoriten</span> <em>${nf}</em></button><button data-s8="sort" aria-label="Reihenfolge: ${this.sort === "name" ? "nach Name" : "zuletzt benutzt"} – umschalten">${this.sort === "name" ? "A–Z" : "Zuletzt"}</button></div>
      <div class="s78l" id="s78L">${L.map(p => this.card(p)).join("") || `<p class="s78no">${this.q ? `Kein Stück heißt „${esc(this.q)}“.` : this.only === "fav" ? "Noch keine Favoriten – der Stern an einem Stück merkt es vor." : "Noch kein Stück."}</p>`}</div>
      <div id="s78Cl"></div>
      <p class="wtip">${DB.ok ? "Stücke werden von selbst auf diesem Gerät gespeichert." : "<b style=\"color:var(--warn)\">Dieses Fenster speichert nicht dauerhaft.</b>"} „Als Datei“ legt ein Stück mit allen Aufnahmen als Datei ab – zum Weitergeben oder für ein anderes Gerät. „Datei laden“ holt es zurück.</p>`;
  },
  async open() {
    try { await Save.now(); } catch (_) {} await this.load(); this.ren = null;
    const s = Sheets.open("Projekte", Sheets.head("Meine Stücke") + `<div id="s78S">${this.body()}</div>`); s.classList.add("s78");
    s.addEventListener("click", e => { const b = e.target.closest("[data-s8]"); if (b) this.act(b.dataset.s8, b); });
    s.addEventListener("input", e => { if (e.target.id === "s78Q") { this.q = e.target.value; const l = $("s78L"); if (l) l.innerHTML = this.order(this.list, this).map(p => this.card(p)).join("") || `<p class="s78no">Kein Stück heißt „${esc(this.q)}“.</p>`; } });
    s.addEventListener("change", async e => {
      if (e.target.id === "s78Imp") { const f = e.target.files[0]; e.target.value = ""; if (f) await Projects.importFile(f); }
      if (e.target.id === "s78Ren") { const id = this.ren; this.ren = null; await this.rename(id, e.target.value); await this.sync(); }
    });
    this.cloud(); return s;
  },
  async cloud() { try { if (!(await Cloud.init())) return; const have = new Set(this.list.map(p => p.id)), L = (await Cloud.list()).filter(c => !have.has(String(c.id).replace(/^proj_/, ""))); const box = $("s78Cl"); if (!box || !L.length) return;
    box.innerHTML = `<h3 class="ph3">In der Cloud</h3><div class="s78l">${L.map(c => `<div class="s78c"><button class="s78o" data-s8="cloud:${esc(c.id)}">${c.thumb ? `<img src="${c.thumb}" alt="">` : `<span class="ph"></span>`}<span class="s78n"><b>${esc(c.name || "Stück")}</b><small>${this.when(c.updated)} · laden</small></span></button></div>`).join("")}</div>`; } catch (_) {} },
  async sync() { await this.load(); const b = $("s78S"); if (b) { b.innerHTML = this.body(); this.cloud(); const r = $("s78Ren"); if (r) { r.focus(); r.select(); } } },
  async act(k, b) {
    const i = k.indexOf(":"), a = i < 0 ? k : k.slice(0, i), id = i < 0 ? "" : k.slice(i + 1); Hap(8);
    try {
      if (a === "new") { UI.hideSheets(); return setTimeout(() => NewPiece.open(), 60); }
      if (a === "backup") return Projects.backup();
      if (a === "only") { this.only = id; store.set("s78only", id); return this.sync(); }
      if (a === "sort") { this.sort = this.sort === "name" ? "zeit" : "name"; store.set("s78sort", this.sort); return this.sync(); }
      if (a === "open") { if (Projects.cur && Projects.cur.id === id) return UI.hideSheets(); return Projects.openId(id); }
      if (a === "fav") { const v = await this.fav(id); b.setAttribute("aria-pressed", String(v)); return setTimeout(() => this.sync(), 350); }
      if (a === "save") { await this.save(); return this.sync(); }
      if (a === "dup") { await Projects.duplicate(id); UI.toast("Kopie angelegt", 1400); return this.sync(); }
      if (a === "exp") return Projects.exportOne(id);
      if (a === "ren") { this.ren = this.ren === id ? null : id; return this.sync(); }
      if (a === "del") { if (b.dataset.sure !== "1") { b.dataset.sure = "1"; b.querySelector("span").textContent = "Wirklich?"; return setTimeout(() => { if (b.isConnected) { b.dataset.sure = ""; b.querySelector("span").textContent = "Löschen"; } }, 2600); }
        const p = this.list.find(x => x.id === id); await Projects.remove(id); try { if (Cloud.st === "on") Cloud.drop("proj_" + id); } catch (_) {} UI.toast(`„${p ? p.name : "Stück"}“ gelöscht`, 1600); return this.sync(); }
      if (a === "cloud") { b.querySelector("small").textContent = "wird geladen …"; return Projects.importData(await Cloud.pull(id), true); }
    } catch (e) { console.warn(e); UI.toast("Das hat nicht geklappt", 1800); }
  }
};
Projects.open = function () { return Stuecke78.open(); };

/* ---------- 2) Auflegen: die Formen sind die Plattenteller ---------- */
const Auf78 = {
  on: false, P: new Map(), fx: null,
  formAt(x, y) { try { const h = Scene.hit(x, y, {}); if (h && h.f && !h.f.empty) return h.f; const p = Scene.platterAt(x, y); const f = p && (p.f || p); return f && f.name && !f.empty ? f : null; } catch (_) { return null; } },
  volAt(v0, dy) { let v = clamp(v0 - dy / 170, 0, 1.5); if (v > 0.96 && v < 1.04) v = 1; return Math.round(v * 100) / 100; },
  set(on) {
    on = !!on; if (on === this.on) return; this.on = on; document.body.classList.toggle("auf78", on); Hap(12);
    if (on) { try { if (Tools.knead) Tools.toggleKnead(false); if (Tools.brush) Tools.toggleBrush(false); if (Iso.f) Iso.exit(true); if (UI.tab !== "klang") UI.setTab("klang"); if (Scene.view === "nah") UI.setView("alle"); if (Engine.ctx && !Transport.running) Transport.start(); } catch (_) {}
      Hud77.show(IC78.deck, "Auflegen", "Form tippen · ziehen · halten", null, 2200); }
    else { this.end(); Hud77.show(IC78.deck, "Auflegen aus", "Finger spielen wieder Töne", null, 1400); }
    try { P78.paint(true); } catch (_) {}
  },
  end() { for (const g of this.P.values()) { clearTimeout(g.hold); if (g.solo) this.solo(g.f, false); } this.P.clear(); if (this.fx) { try { Wucht.filter(null); } catch (_) {} this.fx = null; } },
  solo(f, on) { f.solo = !!on; for (const x of Forms.list) Forms.applyMix(x); try { UI.refresh(); } catch (_) {} },
  down(e) {
    if (!this.on || UI.tab !== "klang") return false; const f = this.formAt(e.clientX, e.clientY); if (!f) return false;
    try { e.target.setPointerCapture(e.pointerId); } catch (_) {}
    const g = { f, x0: e.clientX, y0: e.clientY, v0: f.fine.vol, drag: false, solo: false };
    g.hold = setTimeout(() => { if (this.P.get(e.pointerId) !== g || g.drag) return; g.solo = true; Hap(14); this.solo(f, true); Hud77.show(IC78.deck, f.name, "nur diese – solange du hältst", null, 60000); }, 430);
    this.P.set(e.pointerId, g); if (Forms.active !== f) { try { Forms.setActive(f); } catch (_) { Forms.active = f; } } return true;
  },
  move(e) {
    const g = this.P.get(e.pointerId); if (!g) return false; const dy = e.clientY - g.y0;
    if (!g.drag) { if (g.solo && Math.abs(dy) > 24) { g.solo = false; this.solo(g.f, false); } if (g.solo || Math.abs(dy) < 12) return true; g.drag = true; clearTimeout(g.hold); g.y0 = e.clientY - Math.sign(dy) * 12; }
    const v = this.volAt(g.v0, e.clientY - g.y0); if (v !== g.f.fine.vol) { g.f.fine.vol = v; Forms.applyMix(g.f); try { UI.volPill(); } catch (_) {} }
    Hud77.show(IC78.deck, g.f.name, `Lautstärke ${Math.round(v * 100)} %`, null, 900); return true;
  },
  up(e) {
    const g = this.P.get(e.pointerId); if (!g) return false; this.P.delete(e.pointerId); clearTimeout(g.hold);
    if (g.solo) { this.solo(g.f, false); Hud77.hide(); }
    else if (g.drag) Save.soon();
    else if (e.type !== "pointercancel") { const on = !Fade.on(g.f); Fade.set(g.f, on); Hap(10); Hud77.show(on ? IC78.play : IC78.stop, g.f.name, on ? "kommt dazu" : "geht raus", null, 1100); Save.soon(); try { UI.refresh(); } catch (_) {} }
    return true;
  },
  /* ein Finger neben den Formen, seitlich gezogen: Filter über alles (links dumpf, rechts hell) – loslassen: wieder offen */
  pad(e, kind) {
    if (!this.on) return; const p = Input.P.get(e.pointerId);
    if (kind === "down") { if (Input.P.size === 1 && p && p.kind === "empty") this.fx = { id: e.pointerId, x0: e.clientX, on: false, px: Scene.user.px, py: Scene.user.py }; return; }
    const F = this.fx; if (!F || F.id !== e.pointerId) return;
    if (kind === "up" || Input.P.size !== 1) { if (F.on) { try { Wucht.filter(null); } catch (_) {} Hud77.hide(); } this.fx = null; return; }
    if (!F.on && Math.abs(e.clientX - F.x0) < 16) return; F.on = true; Scene.user.px = F.px; Scene.user.py = F.py;
    const u = clamp(e.clientX / innerWidth, 0, 1); try { Wucht.filter(u); } catch (_) {} Hud77.show(IC78.deck, "Filter", u < 0.42 ? "dumpf" : u > 0.58 ? "hell" : "offen", null, 900);
  }
};

/* ---------- 3) Drei Punkte: Stück · Musik · Form ---------- */
const P78 = {
  on: store.get("p78") !== false, cur: null, g: null, tPlay: 0, sig: "", boot: false, recs: {},
  /* kurze Namen: Symbol + höchstens zwei Wörter */
  SH: { "Alle Loops anhalten": "Loops Pause", "Alle Loops weiter": "Loops weiter", "Letzten löschen": "Letzten weg", "Alle löschen": "Alle weg", "Loops von vorn": "Von vorn", "Ganze Ansicht": "Alles sehen", "Set einsetzen": "Set Start", "Set stoppen": "Set Stopp", "Set-Reihenfolge": "Set-Folge", "Set aufnehmen": "Set Aufnahme", "Mikro → Form": "Mikro", "Gesang einsingen": "Gesang", "Mehrere Instrumente": "Mehr Klänge", "Pult & Loops": "Pult", "Alle Formen": "Formen", "Spielen (an)": "Nur spielen", "Spielen (aus)": "Bearbeiten", "Song bauen": "Song bauen", "Melodie je Form": "Melodie wählen", "Was ist das?": "Erklären", "Live-Fläche": "Live-Fläche", "Selbst einspielen": "Einspielen", "Einspielen": "Bunte Tasten", "Klangschrift": "Noten", "Instrument": "Klang", "Ausblenden": "Aus", "Einblenden": "An", "Rückgängig": "Zurück", "Reihenfolge": "Folge", "Zählt ein": "Zählt ein", "Stück": "Aufnahmen", "Bild": "Foto", "Live": "Aufnahme", "Scan-Körper": "Scan", "Alle hören": "Alle hören", "Einzeln aus": "Einzeln", "Formblatt": "Feinheiten", "Bedienung": "Bedienung", "Gemeinsam": "Gemeinsam", "Lautstärke": "Blenden" },
  /* eigene Einträge */
  X: {
    neu: { ic: IC78.plus, n: () => "Neu", run: () => NewPiece.open() },
    pieces: { ic: () => I67.folder, n: () => "Öffnen", run: () => Stuecke78.open() },
    sichern: { ic: IC78.save, n: () => Save.dirty ? "Sichern" : "Gesichert", run: () => Stuecke78.save(), keep: true },
    fav: { ic: IC78.star, n: () => "Favorit", on: () => !!(Projects.cur && Projects.cur.fav), run: async () => { const v = await Stuecke78.fav(Projects.cur.id); Hud77.show(IC78.star, Projects.cur.name, v ? "ist jetzt Favorit" : "kein Favorit mehr"); }, keep: true },
    kopie: { ic: IC78.copy, n: () => "Kopie", run: async () => { const n = await Projects.duplicate(Projects.cur.id); if (n) { await Projects.openId(n.id); Hud77.show(IC78.copy, n.name, "Kopie geöffnet – das Original bleibt", null, 1800); } } },
    export: { ic: IC78.out, n: () => "Als Datei", run: () => Projects.exportOne(Projects.cur.id) },
    import: { ic: IC78.inn, n: () => "Datei laden", run: () => P78.pick() },
    start: { ic: IC78.home, n: () => "Start", run: () => UI.setTab("start") },
    alles: { ic: IC78.grid, n: () => "Suchen", run: () => Alles73.open() },
    einst: { ic: IC78.gear, n: () => "Einstellen", run: () => Sheets.menu() },
    klassisch: { ic: IC78.old, n: () => "Klassisch", run: () => P78.set(false) },
    auflegen: { ic: IC78.deck, n: () => "Auflegen", on: () => Auf78.on, run: () => Auf78.set(!Auf78.on) },
    startstop: { ic: () => (Transport.running ? IC78.stop : IC78.play), n: () => (Transport.running ? "Stopp" : "Start"), on: () => Transport.running, run: () => P78.playStop(), keep: true },
    alltoggle: { ic: () => (P78.anyMoving() ? IC78.stop : IC78.play), n: () => (P78.anyMoving() ? "Alle Stopp" : "Alle weiter"), run: () => Gest77.allToggle(), keep: true },
    "bpm-": { ic: IC78.minus, n: () => "Langsamer", run: () => P78.bpm(-2), keep: true },
    "bpm+": { ic: IC78.plus, n: () => "Schneller", run: () => P78.bpm(2), keep: true },
    bpm: { show: () => `<b>${Math.round(Music.tempo())}</b><span>Tempo</span>` },
    rpb: { show: () => { const f = Forms.active, S = f && !f.empty ? Dreh73.state(f) : null; return `<b>${S && S.mv && S.r > 0 ? Dreh77.name(Dreh77.V[Dreh77.idxOf(S)]) : "–"}</b><span>je Takt</span>`; } },
    mood: { ic: IC78.mood, n: () => Music.mood.name || "Stimmung", run: () => Sheets.mood() },
    vol: { vol: true }
  },
  T: {
    stueck: [["neu", "pieces", "sichern", "fav", "kopie", "export"], ["import", "c:tStueck", "c:tBild", "c:jam", "a:tab:start", "alles"], ["c:undo", "c:help", "a:mk:erkl", "a:mk:gesten", "c:cfg", "einst"], ["c:zonen", "c:scan", "c:ring", "c:phys", "c:formen", "klassisch"]],
    musik: [["startstop", "c:rec", "a:mk:outro", "auflegen", "a:mk:live", "c:pads"], ["a:mk:gen", "a:tab:song", "c:scenes", "a:tab:mix", "c:mixer", "c:tLoop"], ["bpm-", "bpm", "bpm+", "mood", "c:tBeat", "c:tSchnitt"], ["alltoggle", "c:soloall", "c:lpause", "c:lreset", "c:retro", "c:resetAll"], ["c:vnah", "c:valle", "c:vraum", "c:zreset", "c:full", "c:setadd"], ["c:setstart", "c:setstop", "c:setlist", "c:setrec"]],
    form: [["c:playmode", "c:keys", "a:mk:tasten", "a:mk:noten", "c:knead", "c:brush"], ["c:inst", "c:snd", "c:mel", "a:mk:melw", "c:micform", "c:gesang"], ["c:onoff", "c:solo", "vol", "c:vol"], ["c:spin", "c:slower", "rpb", "c:faster", "c:flip", "c:swing"], ["c:loop", "c:lhold", "c:ledit", "c:station", "c:ldel1", "c:ldelall"], ["c:new", "c:copy", "c:sheet", "c:shape0", "c:fine", "c:del"]]
  },
  NAME: { stueck: "Stück", musik: "Musik", form: "Form" },
  /* Befehle, die bewusst nicht einzeln auf einer Tafel liegen – mit Grund */
  OHNE: { bar: "entfällt: die Leiste gibt es nicht mehr", fade: "gleich wie „Blenden“", allgo: "in „Alle Stopp/weiter“", allstop: "in „Alle Stopp/weiter“", unpaint: "liegt beim Malen", fill: "liegt beim Malen", knpitch: "Einstellung, liegt unter „Einstellen“" },
  f() { const f = Forms.active; return f && !f.empty && Forms.list.includes(f) ? f : null; },
  anyMoving() { return Forms.list.some(f => f && !f.empty && !f.still && (Dreh73.rpb(f) > 0 || Motion.moves(f))); },
  item(k) {
    if (this.X[k]) return { k, ...this.X[k] };
    if (k.startsWith("c:")) { const c = Cmd.L[k.slice(2)]; if (!c) return null; return { k, cmd: k.slice(2), ic: c.ic, n: c.n, on: c.on, vis: c.vis, keep: c.keep, warn: c.warn }; }
    if (k.startsWith("a:")) { const [, t, id] = k.split(":"), e = (t === "tab" ? Alles73.AREAS : Alles73.MAKE).find(x => x[0] === id); if (!e) return null; return { k, al: `${t}:${id}`, ic: () => I67[e[1]] || "", n: () => e[2], vis: id === "outro" ? () => Transport.running : id === "mix" ? () => Forms.list.filter(x => !x.empty).length > 1 : null }; }
    return null;
  },
  keys(p) { return this.T[p].flat(); },
  /* lange Wörter bekommen eine Trennstelle, damit sie sauber umbrechen */
  HY: { Gesichert: "Gesi-chert", Aufnahmen: "Auf-nahmen", Aufnahme: "Auf-nahme", Gemeinsam: "Gemein-sam", Bedienung: "Bedie-nung", Einstellen: "Ein-stellen", Klassisch: "Klas-sisch", Mischpult: "Misch-pult", Langsamer: "Lang-samer", Schneller: "Schnel-ler", Rückblick: "Rück-blick", Instrument: "Instru-ment", Klangschrift: "Klang-schrift", Einspielen: "Ein-spielen", Ausblenden: "Aus-blenden", Einblenden: "Ein-blenden", Feinheiten: "Fein-heiten", Startform: "Start-form", Richtung: "Rich-tung", Ausklang: "Aus-klang", Auflegen: "Auf-legen", Anhalten: "An-halten", Aussetzen: "Aus-setzen", Einsetzen: "Ein-setzen", Wirklich: "Wirk-lich", "Live-Fläche": "Live-Fläche", Stimmung: "Stim-mung", Spielring: "Spiel-ring", Erklären: "Erklä-ren", Fröhlich: "Fröh-lich" },
  hy(n) { return esc(n).split(" ").map(w => (this.HY[w] || w).replace(/-(?=[a-zäöü])/g, "&shy;")).join(" "); },
  label(it, f) { let n = ""; try { n = String(it.n(f) || "").replace(/<[^>]+>/g, ""); } catch (_) {} return this.SH[n] || n; },
  cell(k, f, nx) {
    const it = this.item(k); if (!it) return `<span class="p78e"></span>`;
    if (it.vol) return f ? `<label class="p78v"><input type="range" min="0" max="150" step="1" id="p78Vol" value="${Math.round(f.fine.vol * 100)}" aria-label="Lautstärke ${esc(f.name)}"><b id="p78VolV">${Math.round(f.fine.vol * 100)} %</b></label>` : `<span class="p78e p78v"></span>`;
    if (it.show) return `<span class="p78d">${it.show()}</span>`;
    let vis = true; try { if (it.vis) vis = !!it.vis(f); } catch (_) { vis = false; }
    if (it.cmd && !f && !["new", "undo", "help", "cfg", "mixer", "scenes", "rec", "pads", "retro", "full", "zreset", "vnah", "valle", "vraum", "resetAll", "jam", "phys", "formen", "tLoop", "tStueck", "tBeat", "tSchnitt", "tBild", "lpause", "lreset", "soloall", "setstart", "setstop", "setlist", "setrec", "ring", "scan", "playmode"].includes(it.cmd)) vis = false;
    if (!vis) return `<span class="p78e"></span>`;
    let ic = ""; try { ic = typeof it.ic === "function" ? it.ic(f) : it.ic || ""; } catch (_) {} let on = null; try { if (it.on) on = !!it.on(f); } catch (_) {} let w = false; try { w = !!(it.warn && it.warn(f)); } catch (_) {}
    const n = this.label(it, f);
    return `<button class="p78b${nx === k ? " nx" : ""}${w ? " warn" : ""}" data-t="${k}"${on == null ? "" : ` aria-pressed="${on}"`} aria-label="${esc(n)}"><i>${ic}</i><span>${this.hy(n)}</span></button>`;
  },
  title(p) { const f = this.f(); if (p === "stueck") return `<b>${esc(Projects.cur ? Projects.cur.name : "Stück")}</b><small>${Save.dirty ? "wird gespeichert …" : "gesichert"}</small>`; if (p === "musik") return `<b>Musik</b><small>${Math.round(Music.tempo())} · ${esc(Music.mood.name || "")}${Auf78.on ? " · Auflegen" : ""}</small>`; return f ? `<i class="p78ball" style="--c:${colOf(f)}"></i><b>${esc(f.name)}</b><small>${Forms.audible(f) ? "" : "still"}</small>` : `<b>Form</b><small>noch keine</small>`; },
  html(p) { const f = this.f(), nx = this.next(), n = nx && nx[0] === p ? nx[1] : null; return `<div class="p78h">${this.title(p)}</div><div class="p78g">${this.T[p].map(r => r.map(k => this.cell(k, f, n)).join("")).join("")}</div>`; },
  /* der eine nächste Schritt: [Punkt, Eintrag] */
  step(s) {
    if (!s.forms) return ["form", "c:new"];
    if (!s.loops && !s.moving) return ["form", "c:spin"];
    if (!s.loops) return ["form", "c:loop"];
    if (s.forms < 2) return ["form", "c:new"];
    if (!s.song) return ["musik", "a:mk:gen"];
    if (!s.rec) return ["musik", "c:rec"];
    if (!s.fav) return ["stueck", "fav"];
    return ["stueck", "export"];
  },
  state() { const L = Forms.list.filter(f => f && !f.empty); let loops = false, song = false; try { loops = L.some(f => Loops.count(f) > 0); } catch (_) {} try { song = !!(Song.sections && Song.sections.length); } catch (_) {} const c = Projects.cur;
    return { forms: L.length, loops, moving: this.anyMoving(), song, rec: !!(c && this.recs[c.id]), fav: !!(c && c.fav) }; },
  next() { try { return this.step(this.state()); } catch (_) { return null; } },
  el() {
    let e = $("p78"); if (e) return e;
    e = document.createElement("div"); e.id = "p78"; e.className = "p78"; e.hidden = true;
    e.innerHTML = `<button class="p78x" id="p78X" hidden aria-label="Zurück zur Bühne">${IC78.x}<span>Bühne</span></button>
      <div class="p78pts" id="p78P"><button class="p78p" data-p="stueck" aria-label="Stück: neu, öffnen, sichern, Datei, Hilfe, Einstellungen"><i>${IC78.home}</i><b>Stück</b></button>
      <button class="p78p p78m" data-p="musik" aria-label="Start und Stopp. Nach oben wischen oder Pfeil antippen: alles zur Musik. Lange drücken: Loop aufnehmen"><u>${IC78.up}</u><i id="p78Pl">${IC78.play}</i><b>Musik</b></button>
      <button class="p78p" data-p="form" aria-label="Form: spielen, Klang, Lautstärke, Drehen, Loop. Seitlich wischen: nächste Form"><i class="p78ball" id="p78B"><em id="p78Nr"></em></i><b id="p78Fn">Form</b></button></div>
      <div class="p78t" id="p78T" hidden role="dialog" aria-label="Tafel"></div><input type="file" id="p78Imp" accept=".json,application/json" hidden aria-hidden="true" tabindex="-1">`;
    document.body.appendChild(e); this.bind(e); return e;
  },
  pick() { const i = $("p78Imp"); if (i) i.click(); },
  playStop() { Hap(10); const b = $("bPlay"); if (b) b.click(); else if (Transport.running) Transport.stop(); else Transport.start(); setTimeout(() => this.paint(true), 60); },
  bpm(d) { try { Music.setTempo(clamp(Math.round(Music.tempo()) + d, 50, 180)); Save.soon(); } catch (_) {} },
  loopRec() { const f = this.f(); if (!f) return; Hap(18); try { if (UI.tab !== "klang") UI.setTab("klang"); Cmd.run("loop", f); } catch (e) { console.warn(e); } setTimeout(() => { let R = null; try { R = LoopSt.R; } catch (_) {} Hud77.show(I67.loop || IC78.play, "Loop", R ? "nimmt auf – nochmal lange drücken: fertig" : "fertig", null, 1700); this.paint(true); }, 220); },
  recOn() { try { return !!(Rec.on || LoopSt.R); } catch (_) { return !!Rec.on; } },
  open(p, slide) { const t = $("p78T"); if (!t) return; this.cur = p; t.dataset.p = p; t.innerHTML = this.html(p); t.hidden = false; t.classList.toggle("slide", !!slide); document.body.classList.add("p78open"); this.paint(true); },
  close() { const t = $("p78T"); if (t) t.hidden = true; this.cur = null; document.body.classList.remove("p78open"); this.paint(true); },
  refresh() { const t = $("p78T"); if (!this.cur || !t || t.hidden) return; if (document.activeElement && document.activeElement.id === "p78Vol") { const f = this.f(), v = $("p78VolV"); if (f && v) v.textContent = Math.round(f.fine.vol * 100) + " %"; return; } const h = this.html(this.cur); if (h !== this.lastH) { this.lastH = h; t.innerHTML = h; } },
  run(k) {
    const it = this.item(k), f = this.f(); if (!it) return; Hap(8);
    try {
      if (it.cmd) { if (it.keep) { Cmd.run(it.cmd, f); return setTimeout(() => this.refresh(), 30); } this.close(); return Alles73.act("cmd:" + it.cmd); }
      if (it.al) { this.close(); return Alles73.act(it.al); }
      if (it.run) { if (!it.keep) this.close(); const r = it.run(); if (r && r.then) r.then(() => this.refresh(), () => {}); return setTimeout(() => this.refresh(), 30); }
    } catch (e) { console.warn(e); }
  },
  bind(root) {
    const P = root.querySelector("#p78P"), T = root.querySelector("#p78T");
    P.addEventListener("pointerdown", e => {
      const b = e.target.closest(".p78p"); if (!b || this.g) return; e.preventDefault(); try { b.setPointerCapture(e.pointerId); } catch (_) {}
      const r = b.getBoundingClientRect(), g = this.g = { p: b.dataset.p, b, id: e.pointerId, x0: e.clientX, y0: e.clientY, top: e.clientY - r.top < 24, open: false, hov: null };
      g.ts = e.timeStamp || performance.now();
      /* lange drücken: nach einer halben Sekunde zeigt der Punkt es an – ausgelöst wird beim Loslassen, gemessen an der Zeit der Berührung */
      if (g.p === "musik") g.hold = setTimeout(() => { if (this.g === g && !g.open && !g.sw) { g.ready = true; b.classList.add("hold"); Hap(18); } }, 520);
    });
    P.addEventListener("pointermove", e => {
      const g = this.g; if (!g || g.id !== e.pointerId) return; const dx = e.clientX - g.x0, dy = e.clientY - g.y0;
      if (!g.open) {
        if (Math.abs(dx) > 8 || Math.abs(dy) > 8) { clearTimeout(g.hold); g.mv = true; g.b.classList.remove("hold"); }
        if (dy < -14 && Math.abs(dy) > Math.abs(dx)) { g.open = true; this.open(g.p, true); }
        else if (g.p === "form" && !g.sw && Math.abs(dx) > 30 && Math.abs(dy) < 18) { g.sw = true; Hap(8); try { UI.cycle(dx > 0 ? 1 : -1); } catch (_) {} const f = this.f(); if (f) Hud77.show(`<i class="p78ball" style="--c:${colOf(f)}"></i>`, f.name, "gewählt", null, 900); this.paint(true); }
        return;
      }
      const el = document.elementFromPoint(e.clientX, e.clientY), h = el && el.closest ? el.closest(".p78b") : null;
      if (h !== g.hov) { if (g.hov) g.hov.classList.remove("hov"); g.hov = h; if (h) { h.classList.add("hov"); Hap(4); } }
    });
    const end = e => {
      const g = this.g; if (!g || g.id !== e.pointerId) return; this.g = null; this.tEnd = performance.now(); clearTimeout(g.hold); g.b.classList.remove("hold"); if (e.type === "pointercancel") return;
      if (g.open) { T.classList.remove("slide"); if (g.hov && g.hov.isConnected) this.run(g.hov.dataset.t); return; }
      if (g.sw) return;
      if (g.p === "musik" && !g.mv && !g.top && this.isLong(g.ts, e.timeStamp || performance.now())) return this.loopRec();
      this.tap(g.p, g.top);
    };
    P.addEventListener("pointerup", end); P.addEventListener("pointercancel", end);
    P.addEventListener("click", e => { if (e.detail > 0 || performance.now() - (this.tEnd || 0) < 700) return; const b = e.target.closest(".p78p"); if (b) this.tap(b.dataset.p, e.shiftKey); });
    T.addEventListener("click", e => { const b = e.target.closest(".p78b"); if (b) this.run(b.dataset.t); });
    T.addEventListener("input", e => { if (e.target.id !== "p78Vol") return; const f = this.f(); if (!f) return; let v = e.target.value / 100; if (v > 0.97 && v < 1.03) v = 1; f.fine.vol = v; Forms.applyMix(f); try { UI.volPill(); } catch (_) {} $("p78VolV").textContent = Math.round(v * 100) + " %"; Save.soon(); });
    root.querySelector("#p78X").addEventListener("click", () => { Hap(8); UI.setTab("klang"); this.paint(true); });
    root.querySelector("#p78Imp").addEventListener("change", e => { const f = e.target.files[0]; e.target.value = ""; if (f) Projects.importFile(f); });
    document.addEventListener("pointerdown", e => { if (!this.cur || this.g) return; if (e.target.closest && e.target.closest("#p78T, .p78p")) return; this.close(); }, true);
    document.addEventListener("keydown", e => { if (!this.on || !e.target || !e.target.closest || e.target.closest("input, textarea, select") || e.ctrlKey || e.metaKey || e.altKey) return; if (e.key === "Escape" && this.cur) { this.close(); return; } if (Sheets.cur) return; if (e.key === "1") this.tap("stueck"); else if (e.key === "2") this.tap("musik", true); else if (e.key === "3") this.tap("form"); });
  },
  K: 1,   /* Zeitmaß (nur für Prüfungen auf sehr langsamen Rechnern größer) */
  isLong(t0, t1) { return t1 - t0 >= 480 * (this.K || 1); },
  tap(p, top) { Hap(8); if (p === "musik" && !top) { if (this.cur) this.close(); return this.playStop(); } if (this.cur === p) return this.close(); this.open(p); },
  set(on) { this.on = !!on; store.set("p78", this.on); this.close(); this.paint(true); try { Layout.last = ""; Layout.sync(); KSheet.sync(true); } catch (_) {} UI.toastAct(this.on ? "Drei Punkte: Stück · Musik · Form" : "Klassische Bedienung – zurück über Mehr → Alles → Drei Punkte", this.on ? "Klassisch" : "Drei Punkte", () => P78.set(!P78.on), 5200); },
  visible() { if (!this.on || !App.started) return false; const c = document.body.classList; if (c.contains("keinsp") || c.contains("kks70")) return false; try { if (Live70.on) return false; } catch (_) {} if (Sheets.cur) return false; try { if (FBar.mode()) return false; } catch (_) {} return true; },
  paint(force) {
    const b = document.body, e = this.el(); b.classList.toggle("p78", this.on);
    if (this.on && App.started && !this.boot) { this.boot = true; try { if (UI.tab === "start" && Forms.list.some(f => !f.empty)) UI.setTab("klang"); } catch (_) {} }
    let mode = false; try { mode = !!FBar.mode(); } catch (_) {} b.classList.toggle("p78mode", this.on && mode);
    const vis = this.visible(); if (e.hidden === vis) e.hidden = !vis; if (!vis) { if (this.cur) { this.cur = null; $("p78T").hidden = true; b.classList.remove("p78open"); } return; }
    const stage = UI.tab === "klang", f = this.f(), nx = this.cur ? null : this.next(), playing = Input.P.size > 0 || Auf78.P.size > 0;
    if (playing) this.tPlay = performance.now(); b.classList.toggle("p78calm", stage && !this.cur && !this.g && performance.now() - this.tPlay < 1600);
    const sig = [stage, f ? f.id + colOf(f) + f.name : "", Forms.list.length, Transport.running, nx ? nx.join() : "", Auf78.on, Save.dirty, this.cur, this.recOn()].join("|");
    if (sig !== this.sig || force) {
      this.sig = sig; $("p78X").hidden = stage;
      $("p78Pl").innerHTML = Transport.running ? IC78.stop : IC78.play; const B = $("p78B"); B.style.setProperty("--c", f ? colOf(f) : "#5b6480"); { const L = Forms.list.filter(x => x && !x.empty), i = L.indexOf(f); $("p78Fn").textContent = f ? f.name : "Form"; $("p78Nr").textContent = f && L.length > 1 ? `${i + 1}/${L.length}` : ""; }
      for (const p of e.querySelectorAll(".p78p")) { p.classList.toggle("nx", !!nx && nx[0] === p.dataset.p); p.setAttribute("aria-expanded", String(this.cur === p.dataset.p)); if (p.dataset.p === "musik") { p.classList.toggle("run", Transport.running); p.classList.toggle("auf", Auf78.on); p.classList.toggle("rec", this.recOn()); } if (p.dataset.p === "stueck") p.classList.toggle("dirty", !!Save.dirty); }
    }
    this.refresh();
  }
};
setInterval(() => { try { P78.paint(); } catch (e) { console.warn(e); } }, 300);
/* Auflegen: Finger auf einer Form gehören dem Pult; daneben gilt alles wie sonst, ein seitlicher Zug regelt den Filter */
{ const dn = Input.down.bind(Input); Input.down = function (e) { try { if (Auf78.on && Auf78.down(e)) return; } catch (x) { console.warn(x); } const r = dn(e); try { Auf78.pad(e, "down"); } catch (_) {} return r; };
  const mv = Input.move.bind(Input); Input.move = function (e) { try { if (Auf78.P.has(e.pointerId)) return Auf78.move(e); } catch (x) { console.warn(x); } const r = mv(e); try { Auf78.pad(e, "move"); } catch (_) {} return r; };
  const up = Input.up.bind(Input); Input.up = function (e) { try { if (Auf78.P.has(e.pointerId)) return Auf78.up(e); } catch (x) { console.warn(x); } try { Auf78.pad(e, "up"); } catch (_) {} return up(e); }; }
/* gemerkt, ob das Stück schon eine Aufnahme hat (für den nächsten Schritt) */
{ const ad = Recs.add.bind(Recs); Recs.add = function (...a) { try { if (Projects.cur) P78.recs[Projects.cur.id] = true; } catch (_) {} return ad(...a); }; }
try { Alles73.MAKE.push(["drei", "geste", "Drei Punkte", "Neue Bedienung ein oder aus (klassische Leisten)"], ["auflegen", "deck", "Auflegen", "Formen ein- und ausblenden wie am Mischpult"]); const ac = Alles73.act.bind(Alles73); Alles73.act = function (k) { if (k === "mk:drei") { UI.hideSheets(); return P78.set(!P78.on); } if (k === "mk:auflegen") { UI.hideSheets(); return Auf78.set(!Auf78.on); } return ac(k); }; } catch (_) {}
Help.T.push({ id: "v78", ic: "●", t: "Drei Punkte: Stück · Musik · Form", k: "drei punkte tafel bedienung oberfläche klassisch stück musik form speichern sichern favorit stern export import datei laden auflegen dj mischen ein ausblenden filter übersicht stücke",
  h: `<p>Der ganze Bildschirm ist Bühne. Unten sitzen drei Punkte – jeder öffnet <b>eine Tafel</b>, auf der alles zu seinem Thema steht.</p>
  <p><b>Stück</b> (links): Neu, Öffnen, Sichern, Favorit, Kopie, als Datei, Datei laden, Rückgängig, Hilfe, Einstellen.<br><b>Musik</b> (Mitte): Antippen = Start/Stopp. Pfeil antippen oder nach oben wischen = Tafel mit Aufnahme, Auflegen, Song, Mischen, Tempo, Ansicht. Lange drücken = Loop aufnehmen.<br><b>Form</b> (rechts): alles zur gewählten Form – Spielart, Klang, Lautstärke, Drehen, Loop. Seitlich wischen = nächste Form.</p>
  <p><b>In einem Zug:</b> Punkt drücken, nach oben auf einen Knopf ziehen, loslassen. <b>Was leuchtet,</b> ist der nächste sinnvolle Schritt.</p>
  <p><b>Meine Stücke</b> (Stück → Öffnen): suchen, mit dem Stern als Favorit merken, sichern, kopieren, umbenennen, als Datei ablegen und Dateien laden.</p>
  <p><b>Auflegen</b> (Musik → Auflegen): Die Formen sind die Plattenteller. Form antippen = kommt dazu / geht raus (mit ihrer Blende). Auf der Form hoch oder runter ziehen = lauter / leiser. Form halten = nur diese hören. Neben den Formen seitlich ziehen = Filter über alles.</p>
  <p>Zurück zur alten Oberfläche: Stück → Klassisch.</p>` });
/* Das alte Bedienblatt gibt es mit den drei Punkten nur noch als Arbeitsfläche einer Spielart (Kneten, Malen, Melodie) */
{ const vis = KSheet.visible; KSheet.visible = function () { let m = false; try { m = !!FBar.mode(); } catch (_) {} return vis.call(this) && (!P78.on || m); }; }
