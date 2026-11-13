/* =====================================================================================
   v69: IMMER ZURÜCK ZUM START · beschriftete Kopfknöpfe · „Dein Weg“ auf der Startseite
   – Heim: Start-Knopf oben links, in jedem Blatt, im Einspielen, im Vollbild
   – Nav: die Zurück-Taste des Handys schließt Schritt für Schritt und führt zum Start
   ===================================================================================== */
const Heim = {
  // alles schließen, was über der Startseite liegen kann
  clean() {
    const t = fn => { try { fn(); } catch (_) {} };
    t(() => { if (Einsp.on) Einsp.close(); }); t(() => { if (Erkl.on) Erkl.stop(); }); t(() => Radial.close()); t(() => FPop.close()); t(() => Cfg.close()); t(() => { const j = $("kjam"); if (j) j.remove(); });
    t(() => { const c = $("coach"); if (c && !c.hidden) Coach.close(); }); t(() => UI.hideSheets()); t(() => { if (Full.on) Full.toggle(false); }); t(() => { if (Tools.knead) Tools.toggleKnead(false); }); t(() => { if (Tools.brush) Tools.toggleBrush(false); });
  },
  over() { try { return Einsp.on || Erkl.on || !!document.querySelector("#sheets .sheet") || !!$("kjam") || !!$("kcfg") || !!Full.on; } catch (_) { return false; } },
  atHome() { return UI.tab === "start" && !this.over(); },
  go() { Hap(8); this.clean(); if (UI.tab !== "start") UI.setTab("start"); else Home67.render(true); const v = $("vStart"); if (v) v.scrollTop = 0; },
  init() {
    const top = document.querySelector(".top"); if (top && !$("bHome")) { const b = document.createElement("button"); b.className = "peb"; b.id = "bHome"; b.setAttribute("aria-label", "Zur Startseite"); b.innerHTML = I67.home; top.insertBefore(b, top.firstChild); b.onclick = () => this.go(); }
    if (!$("q7home")) { const f = document.createElement("button"); f.id = "q7home"; f.setAttribute("aria-label", "Zur Startseite"); f.innerHTML = I67.home + "<span>Start</span>"; document.body.appendChild(f); f.onclick = () => this.go(); }
    document.addEventListener("click", e => { const b = e.target.closest && e.target.closest("[data-home]"); if (b) { e.stopPropagation(); this.go(); } }, true);
    document.body.classList.add("k69");
  }
};
Heim.init();
// jedes Blatt bekommt den Start-Knopf neben dem Schließen-Knopf
{ const sh = Sheets.head; Sheets.head = t => sh(t).replace('<button class="peb close"', `<button class="peb q7hb" data-home aria-label="Zur Startseite">${I67.home}</button><button class="peb close"`); }
// Einspielen: links oben geht es zur Startseite, „Fertig“ schließt
{ const rn = Einsp.render.bind(Einsp); Einsp.render = function () { const r = rn(); try { const x = $("einsp").querySelector(".ex"); if (x) { x.innerHTML = I67.home; x.dataset.ei = "home"; x.setAttribute("aria-label", "Zur Startseite"); } } catch (_) {} return r; };
  const ac = Einsp.act.bind(Einsp); Einsp.act = function (k) { if (k === "home") { this.close(); return Heim.go(); } return ac(k); }; }
// im Kopf zeigen, wo man ist
{ const st = UI.setTab.bind(UI); UI.setTab = function (t) { const r = st(t); try { const b = $("bHome"); if (b) b.setAttribute("aria-current", t === "start" ? "page" : "false"); } catch (_) {} return r; }; }

/* ---------- Zurück-Taste: schließt Schritt für Schritt, dann Startseite ---------- */
// Die vorhandene Zurück-Logik (Nav) kannte „Klang“ als Grundseite. Jetzt ist die Startseite der Grund,
// und Einspielen, Erklär-Modus, Vollbild und die Dialoge zählen als Ebenen mit.
setTimeout(() => { try {
  Nav.closeTop = function (fromPop) {
    const t = fn => { try { return fn(); } catch (_) { return false; } };
    if (t(() => Einsp.on)) { Einsp.close(); this.sync(); return true; }
    if (t(() => Erkl.on)) { Erkl.stop(); this.sync(); return true; }
    if (Coach.open) { Coach.close(); return true; }
    const over = document.querySelector(".over"); if (over) { if (Measure.k2run) return true; Measure.close(); this.sync(); return true; }
    if ($("kjam")) { $("kjam").remove(); this.sync(); return true; } if ($("kcfg")) { t(() => Cfg.close()); this.sync(); return true; }
    if (Sheets.cur) { if (this.stack.length) this.back(); else UI.hideSheets(); return true; }
    if (t(() => Full.on)) { Full.toggle(false); this.sync(); return true; }
    if (UI.tab === "stueck" && Stueck.mode !== "list") { Stueck.back(); this.sync(); return true; }
    if (Tools.brush || Tools.knead) { Tools.brush = false; Tools.knead = false; UI.modes(); this.sync(); return true; }
    if (UI.tab === "klang" && Scene.view !== "nah") { UI.setView("nah"); this.sync(); return true; }
    if (fromPop && UI.tab !== "start") { UI.setTab("start"); this.sync(); return true; }     // nur die Zurück-Taste führt zum Start, Esc nicht
    return false;
  };
  Nav.depth = function () { const t = fn => { try { return fn() ? 1 : 0; } catch (_) { return 0; } };
    return t(() => Einsp.on) + t(() => Erkl.on) + (Coach.open ? 1 : 0) + (document.querySelector(".over") ? 1 : 0) + ($("kjam") || $("kcfg") ? 1 : 0) + (Sheets.cur ? 1 : 0) + t(() => Full.on) + (UI.tab === "stueck" && Stueck.mode !== "list" ? 1 : 0) + (UI.tab !== "start" ? 1 : 0) + (Tools.brush || Tools.knead ? 1 : 0) + (UI.tab === "klang" && Scene.view !== "nah" ? 1 : 0); };
  setInterval(() => { try { Nav.sync(); } catch (_) {} }, 500);    // auch Einspielen und Vollbild bekommen ihren Verlaufseintrag
} catch (e) { console.warn(e); } }, 0);

/* ---------- Startseite: „Dein Weg“ – vier Schritte zum fertigen Lied ---------- */
Home67.way = function () {
  const song = (() => { try { return Song.sections.length > 0 && Forms.list.some(f => Loops.count(f) > 0); } catch (_) { return false; } })();
  const own = (() => { try { const R = (SongGen.meta && SongGen.meta.roles) || {}; return Forms.list.some(f => !R[f.id] && Loops.count(f) > 0); } catch (_) { return false; } })();
  return [["w1", "Song bauen", song], ["w2", "Dazuspielen", own], ["w3", "Mischen", false], ["w4", "Aufnehmen", false]];
};
{ const rn = Home67.render.bind(Home67); Home67.render = function (force) { const r = rn(force); try { const el = this.el(), row = el && el.querySelector(".hmrow"); if (row && !row.dataset.w) { row.dataset.w = "1"; row.classList.add("hmway");
      row.innerHTML = `<small>Dein Weg zum fertigen Lied</small><div class="hmsteps">${this.way().map(([k, n, ok], i) => `<button data-hm="${k}"${ok ? ' class="q7ok"' : ""}><i>${ok ? "✓" : i + 1}</i><b>${n}</b></button>`).join("")}</div><button class="hmlink" data-hm="pieces">${I67.folder}<span>Meine Stücke</span></button>`; } } catch (e) { console.warn(e); } return r; };
  const so = Home67.sigOf.bind(Home67); Home67.sigOf = function () { return so() + "§" + this.way().map(w => w[2] ? 1 : 0).join(""); };
  const ha = Home67.act.bind(Home67); Home67.act = function (k) {
    if (k === "w1") { Hap(8); return this.way()[0][2] ? UI.setTab("song") : SongGen.open(); }
    if (k === "w2") { Hap(8); return Einsp.open(null, { pick: !Einsp.playable(Forms.active) }); }
    if (k === "w3") { Hap(8); return UI.setTab("mix"); }
    if (k === "w4") { Hap(8); if (!this.way()[0][2]) { UI.toastAct("Zum Aufnehmen brauchst du erst einen Song.", "Song bauen", () => SongGen.open(), 4200); return; } UI.setTab("song"); setTimeout(() => { const b = document.querySelector("#vSong .sxrec"); if (b) { b.scrollIntoView({ block: "center", behavior: "smooth" }); b.classList.add("q7pulse"); setTimeout(() => b.classList.remove("q7pulse"), 2600); } }, 200); return; }
    return ha(k); }; }
Erkl.T.unshift(
  ["#bHome, #q7home, [data-home], #einsp .ex", "Zur Startseite", "Bringt dich von überall zurück zur Startseite. Deine Musik läuft dabei weiter, nichts geht verloren."],
  ['[data-hm="w1"]', "Schritt 1: Song bauen", "Lass dir einen Song bauen oder öffne den Ablauf deines Stücks."],
  ['[data-hm="w2"]', "Schritt 2: Dazuspielen", "Spiel selbst etwas ein – es bleibt als Loop und kommt in deinen Song."],
  ['[data-hm="w3"]', "Schritt 3: Mischen", "Stell ein, wie laut jeder Klang ist und wo er steht."],
  ['[data-hm="w4"]', "Schritt 4: Aufnehmen", "Nimm den fertigen Song als Audio-Datei auf und teile ihn."]
);
Help.T.push({ id: "heim", ic: "⌂", t: "Zurück zur Startseite – von überall", k: "start startseite zurück home heim verlaufen wo bin ich zurücktaste back weg schritte",
  h: `<ul><li><b>Start-Knopf oben links</b> (Haus): bringt dich aus jedem Bereich zur Startseite. Die Musik läuft weiter, nichts geht verloren.</li>
  <li>Derselbe Knopf steht in <b>jedem Blatt</b> neben dem ✕, im <b>Einspielen</b> oben links und im <b>Vollbild</b> unten links.</li>
  <li><b>Zurück-Taste des Handys</b> (oder Zurück im Browser): schließt zuerst, was offen ist (Blatt, Einspielen, Vollbild), und führt dann zur Startseite. Erst von dort verlässt sie die App.</li>
  <li><b>Dein Weg</b> auf der Startseite: vier Schritte – Song bauen, Dazuspielen, Mischen, Aufnehmen. Ein Haken zeigt, was schon da ist.</li>
  <li>In der einfachen Ansicht sind die Knöpfe oben beschriftet: Start · dein Stück · Abspielen · Zurück (letzten Schritt zurücknehmen) · Stimmung · Menü.</li></ul>` });
