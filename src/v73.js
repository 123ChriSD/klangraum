/* =====================================================================================
   v73: START-MELODIE · DREH-LEISTE · ALLES AUF EINEN BLICK
   – StartMel: beim Anlegen eines neuen Stücks eine Melodie spielen – alle Startformen bekommen sie als Grundmelodie
               und spielen zunächst dasselbe (nur in diesem neuen Stück).
   – Dreh73:   Drehen, Tempo, Richtung und Anhalten direkt unter der Form: ein Tipp = genau ein Wert, Stopp = sofort.
               Wischen und Loslassen wirken nur noch auf die gemeinte Achse.
   – Alles73:  alle Bereiche und Funktionen in einem Blatt, nach Aufgaben geordnet, mit Suche.
   ===================================================================================== */
Object.assign(I67, {
  dreh: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.500 12a7.500 7.500 0 1 1-2.400-5.500"/><path d="M19.800 3.800v4.400h-4.400"/></svg>',
  raster: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.500" y="3.500" width="7" height="7" rx="1.800"/><rect x="13.500" y="3.500" width="7" height="7" rx="1.800"/><rect x="3.500" y="13.500" width="7" height="7" rx="1.800"/><rect x="13.500" y="13.500" width="7" height="7" rx="1.800"/></svg>'
});

/* ---------- 1) Start-Melodie: im Blatt „Neues Stück“ eine Melodie spielen – alle Formen des neuen Stücks spielen sie zuerst ---------- */
const StartMel = {
  MAXN: 16,
  midiFor(mood, k) { const mu = K.music(mood); let b = 60 + mod(mood.root, 12); if (b > 66) b -= 12; return b + mu.so(k); },
  midi(k) { return this.midiFor(Music.mood, k); },
  mood() { const S = NewPiece.st; return (S && K.MOODS.find(m => m.id === S.mood)) || Music.mood; },
  beep(m, when, dur = 0.32) { const c = Engine.ctx; if (!c) return; try { if (c.state !== "running") c.resume(); const t = Math.max(c.currentTime, when || 0), o = c.createOscillator(), o2 = c.createOscillator(), g = c.createGain(), g2 = c.createGain(), f = midiHz(m); o.type = "triangle"; o.frequency.value = f; o2.type = "sine"; o2.frequency.value = f * 2; g2.gain.value = 0.25;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.32, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.25); o.connect(g); o2.connect(g2).connect(g); g.connect(Engine.sum || Engine.out); o.start(t); o2.start(t); o.stop(t + dur + 0.3); o2.stop(t + dur + 0.3); } catch (e) { console.warn(e); } },
  // Abschnitt für das Blatt „Neues Stück“
  sec(S) { const mood = this.mood();
    return `<div class="sm73" id="sm73S"><h3 class="ph3">Start-Melodie <small>wahlweise</small></h3><p class="kch">Spiel hier eine kurze Melodie – bis ${this.MAXN} Töne. Alle Formen des neuen Stücks bekommen sie und spielen zuerst <b>dasselbe</b>. Lässt du das Feld leer, bleibt alles wie gewohnt.</p>
      <div class="sm73row" id="sm73Row" aria-live="polite"></div>
      <div class="sm73keys">${[0, 1, 2, 3, 4, 5, 6, 7].map(k => `<button class="sm73k" data-sm="k:${k}" style="--c:${KeysUI.COL[k % 7]}" aria-label="Ton ${k + 1}"><b>${k + 1}</b><small>${esc(deN(this.midiFor(mood, k)).replace(/[0-9’',]/g, ""))}</small></button>`).join("")}</div>
      <div class="sm73bar"><button class="eb" data-sm="undo" aria-label="Letzten Ton entfernen">${I67.left}<span>Zurück</span></button><button class="eb" data-sm="play" aria-label="Melodie anhören">${I67.play}<span>Anhören</span></button><button class="eb" data-sm="clear" aria-label="Melodie leeren">${I67.trash}<span>Leeren</span></button></div></div>`; },
  paint() { const r = $("sm73Row"), S = NewPiece.st; if (!r || !S) return; const d = S.mel || (S.mel = []);
    r.innerHTML = d.length ? d.map(k => `<i style="--c:${KeysUI.COL[k % 7]}">${k + 1}</i>`).join("") : `<span>Noch keine Melodie – tippe auf die bunten Tasten.</span>`;
    const s = $("sm73S"); if (s) { for (const k of ["undo", "play", "clear"]) { const b = s.querySelector(`[data-sm="${k}"]`); if (b) b.disabled = !d.length; } s.querySelectorAll(".sm73k").forEach(b => { b.disabled = d.length >= this.MAXN; }); }
    const go = document.querySelector('#npS [data-np="go"]'); if (go) go.textContent = d.length ? "Stück mit dieser Melodie anlegen" : "Stück anlegen"; },
  act(k) {
    const S = NewPiece.st; if (!S) return; const d = S.mel || (S.mel = []), mood = this.mood();
    if (k.startsWith("k:")) { const n = +k.slice(2); if (d.length >= this.MAXN) return; d.push(n); this.beep(this.midiFor(mood, n)); Hap(5); }
    else if (k === "undo") { d.pop(); Hap(); }
    else if (k === "clear") { d.length = 0; Hap(10); }
    else if (k === "play" && Engine.ctx) { const t0 = Engine.ctx.currentTime + 0.05, bpm = S.bpm || mood.bpm || 108, gap = clamp(30 / bpm, 0.16, 0.4); d.forEach((n, i) => this.beep(this.midiFor(mood, n), t0 + i * gap, gap * 0.8)); return; }
    this.paint();
  },
  // Melodie auf alle Formen des (eben angelegten) Stücks legen, die Töne spielen können
  apply(d) { const out = []; for (const f of Forms.list) { if (!f || f.empty || f.remote || f.kind === "drum") continue; Mel.add(f, d, "Start-Melodie"); out.push(f); } return out; },
  after(d) { try { const F = this.apply(d); for (const f of F) { try { Move.setR(f, 1, { soft: false }); } catch (_) {} }                // alle drehen gleich schnell: eine Umdrehung je Takt = die ganze Melodie
      if (F.length) { try { if (!Transport.running) Transport.start(); } catch (_) {} } Save.soon(); try { UI.refresh(); } catch (_) {}
      UI.toast(F.length ? `${F.length} ${F.length === 1 ? "Form spielt" : "Formen spielen"} deine Melodie – alle dasselbe. Unten links: Stopp, Tempo und Richtung für die gewählte Form.` : "Dieses Stück hat keine Form mit Tonhöhen – die Melodie wurde nicht übernommen.", 5600); return F; } catch (e) { console.warn(e); return []; } },
  // Einstieg von der Startseite: das Blatt „Neues Stück“ öffnen und zur Melodie springen
  open() { if (!Engine.ctx) { UI.toast("Erst „Eintauchen“ – dann ist der Ton an"); return; } NewPiece.open(); setTimeout(() => { try { const s = $("sm73S"); if (s) { s.scrollIntoView({ block: "center" }); s.classList.add("q7hi"); setTimeout(() => s.classList.remove("q7hi"), 1800); } } catch (_) {} }, 120); }
};
{ const rn = NewPiece.render.bind(NewPiece); NewPiece.render = function () { const r = rn(); try { const go = document.querySelector("#npS .np-go"); if (go && this.st && !$("sm73S")) { go.insertAdjacentHTML("beforebegin", StartMel.sec(this.st)); StartMel.paint(); } } catch (e) { console.warn(e); } return r; };
  const go = NewPiece.go.bind(NewPiece); NewPiece.go = async function () { const d = this.st && Array.isArray(this.st.mel) ? this.st.mel.slice() : []; const r = await go(); if (d.length) StartMel.after(d); return r; };
  document.addEventListener("click", e => { const b = e.target.closest && e.target.closest("#sm73S [data-sm]"); if (b) StartMel.act(b.dataset.sm); });
  document.addEventListener("click", e => { const b = e.target.closest && e.target.closest("[data-sm0]"); if (!b) return; Hap(8); UI.hideSheets(); setTimeout(() => StartMel.open(), 60); }); }

/* ---------- 2) Dreh-Leiste: genau drehen, sofort anhalten ---------- */
const Dreh73 = {
  R: [[0.25, "¼"], [0.5, "½"], [1, "1"], [2, "2"], [4, "4"]],
  rpb(f) { try { return f && !f.still ? Motion.rpbOf(Motion.tw(f, "y")) : 0; } catch (_) { return 0; } },
  near(r) { if (!(r > 0)) return -1; let b = -1, bd = 0.09; this.R.forEach(([x], i) => { const d = Math.abs(Math.log2(r / x)); if (d < bd) { bd = d; b = i; } }); return b; },
  dir(f) { try { const p = Motion.ph(f); return (Math.sign(Motion.tw(f, "y")) || Math.sign(p.wy) || 1) < 0 ? -1 : 1; } catch (_) { return 1; } },
  state(f) { const r = this.rpb(f), mv = !!f && !f.still && (r > 0 || Motion.moves(f)); return { r, mv, still: !!(f && f.still), i: this.near(r), dir: this.dir(f) }; },
  txt(S) { return S.still ? "angehalten" : S.r > 0 ? `${S.r < 1 ? S.r.toFixed(2).replace(".", ",").replace(/0$/, "") : String(Math.round(S.r * 10) / 10).replace(".", ",")} je Takt` : S.mv ? "bewegt sich" : "steht"; },
  html(f) { const S = this.state(f);
    return `<button class="dr73p" data-dr="pp" aria-pressed="${S.mv}" aria-label="${S.mv ? "Sofort anhalten" : S.still ? "Weiterdrehen" : "Drehen lassen"} – ${this.txt(S)}"><i>${S.mv ? I67.stop : I67.play}</i><b>${S.mv ? "Stopp" : S.still ? "Weiter" : "Drehen"}</b></button><span class="dr73s" role="group" aria-label="Umdrehungen je Takt">${this.R.map(([x, n], i) => `<button data-dr="r:${x}" aria-pressed="${S.i === i}" aria-label="${n} ${x === 1 ? "Umdrehung" : "Umdrehungen"} je Takt">${n}</button>`).join("")}</span><button class="dr73d" data-dr="flip" aria-label="Drehrichtung umkehren – jetzt ${S.dir < 0 ? "linksherum" : "rechtsherum"}"><i class="${S.dir < 0 ? "q7l" : ""}">${I67.dreh}</i></button>`; },
  el() { let e = $("dr73"); if (!e) { e = document.createElement("div"); e.id = "dr73"; e.className = "dr73"; e.hidden = true; e.setAttribute("role", "group"); e.setAttribute("aria-label", "Drehen der gewählten Form"); document.body.appendChild(e); } return e; },
  show() { try { const f = Forms.active; return !!(App.started && UI.tab === "klang" && f && !f.empty && !f.remote && (Scene.view === "nah" || Scene.view === "alle") && !FBar.mode() && !Mel.rec && KSheet.visible() && !Full.on && !Einsp.on && !Schrift.on && !Live70.on && !document.body.classList.contains("kerkl")); } catch (_) { return false; } },
  // sofort und genau anhalten (kein Auslaufen) · Weiter dreht mit dem alten Tempo
  stop(f) { Motion.finishGlides(f); Motion.pause(f); },
  act(k, f = Forms.active) {
    if (!f || f.empty) return; Hap(8);
    try {
      if (k === "pp") { const S = this.state(f); if (S.mv) this.stop(f); else if (S.still) { Motion.resume(f); if (!(this.rpb(f) > 0) && !Motion.moves(f)) Move.setR(f, 1, { soft: false }); } else Move.setR(f, 1, { soft: false }); }
      else if (k === "flip") { const p = Motion.ph(f), w = Motion.tw(f, "y") || p.wy; if (f.still) Motion.resume(f); f.mot.dreh = 0; Motion.glideTo(f, "y", w ? -w : -Motion.wOfR(1), { soft: false }); if (p.lk) p.lk.y = null; if (!Transport.running && Engine.ctx) Transport.start(); }
      else if (k.startsWith("r:")) Move.setR(f, +k.slice(2), { soft: false });
    } catch (e) { console.warn(e); }
    Save.soon(); try { UI.soon(); } catch (_) {} this.paint();
  },
  // Anzeige nachführen (auch wenn die Form mit dem Finger angeschubst wurde)
  paint() { const el = this.el(), on = this.show(); if (el.hidden === on) el.hidden = !on; if (!on) return; try { const ks = $("ksheet"), top = ks && !ks.hidden ? ks.getBoundingClientRect().top : 0; if (top > 80) { const b = Math.round(innerHeight - top + 8) + "px"; if (el.style.bottom !== b) el.style.bottom = b; } } catch (_) {} const f = Forms.active, S = this.state(f), sg = `${f.id}|${S.mv}|${S.still}|${S.i}|${S.dir}`; if (el.dataset.sg === sg) return; el.dataset.sg = sg; el.innerHTML = this.html(f); }
};
document.addEventListener("click", e => { const b = e.target.closest && e.target.closest("[data-dr]"); if (b) Dreh73.act(b.dataset.dr); });
setInterval(() => { try { Dreh73.paint(); } catch (_) {} }, 300);
// Wischen und Loslassen: nur die gemeinte Achse. Schräge Bewegungen (über 60 % Anteil) wirken weiter auf beide.
{ const pu = Motion.push.bind(Motion); Motion.push = function (f, vx, vy) { const ax = Math.abs(vx), ay = Math.abs(vy); if (ay < ax * 0.6) vy = 0; else if (ax < ay * 0.6) vx = 0; return pu(f, vx, vy); };
  const re = Motion.release.bind(Motion); Motion.release = function (f, wy, wx) { if (wx != null) { const ay = Math.abs(wy), ax = Math.abs(wx); if (ax < ay * 0.6) wx = 0; else if (ay < ax * 0.6) wy = 0; } return re(f, wy, wx); }; }

/* ---------- 3) Alles auf einen Blick ---------- */
const Alles73 = {
  AREAS: [["start", "home", "Start"], ["klang", "blob", "Spielen"], ["song", "song", "Song"], ["mix", "mix", "Mischen"], ["loop", "deck", "Pult"], ["beat", "drum", "Beat"], ["schnitt", "song", "Schnitt"], ["bild", "photo", "Foto"], ["stueck", "folder", "Loops"]],
  MAKE: [["gen", "magic", "Song bauen", "Ein fertiger Song in einer Minute"], ["smel", "note", "Stück mit Melodie", "Eine Melodie spielen – alle Startformen spielen sie"], ["tasten", "keys", "Einspielen", "Auf bunten Tasten in den Loop spielen"], ["noten", "noten", "Klangschrift", "Töne als bunte Balken lesen und setzen"], ["knet", "blob", "Klang kneten", "Form mit den Fingern drücken und ziehen"], ["live", "live", "Live-Fläche", "Ein Finger formt den ganzen Song"], ["pieces", "folder", "Meine Stücke", "Öffnen, neu anlegen, sichern"], ["help", "help", "Hilfe", "Alles erklärt, mit Suche"], ["erkl", "help", "Was ist das?", "Antippen und erklären lassen"]],
  items() { const out = []; try { for (const g of Cmd.GROUPS) for (const id of g[3]) { const c = Cmd.L[id]; if (!c) continue; let n = id, a = ""; try { n = c.n(Forms.active) || id; } catch (_) {} try { a = c.a ? c.a(Forms.active) || "" : ""; } catch (_) {} let ic = ""; try { ic = typeof c.ic === "function" ? c.ic(Forms.active) : c.ic || ""; } catch (_) {} out.push({ id, g: g[0], gn: g[1], n: String(n).replace(/<[^>]+>/g, ""), a: String(a).replace(/<[^>]+>/g, ""), ic }); } } catch (e) { console.warn(e); } return out.filter((x, i, A) => A.findIndex(y => y.id === x.id) === i); },
  open() {
    Hap(8); const it = this.items(), groups = [...new Set(it.map(x => x.g))];
    const s = Sheets.open("Alles", Sheets.head("Alles auf einen Blick") + `<input class="al73q" id="al73Q" type="search" placeholder="Suchen: z. B. Echo, Tempo, Aufnahme" aria-label="Funktion suchen" autocomplete="off">
      <div id="al73B">
      <h3 class="al73h">Bereiche</h3><div class="al73g q7ar">${this.AREAS.map(([k, ic, n]) => `<button class="al73t" data-al="tab:${k}" data-q="${esc((n + " bereich").toLowerCase())}"><i>${I67[ic] || ""}</i><b>${n}</b></button>`).join("")}</div>
      <h3 class="al73h">Musik machen</h3><div class="al73g q7w">${this.MAKE.map(([k, ic, n, d]) => `<button class="al73t q7wide" data-al="mk:${k}" data-q="${esc((n + " " + d).toLowerCase())}"><i>${I67[ic] || ""}</i><b>${n}</b><small>${d}</small></button>`).join("")}</div>
      ${groups.map(g => { const L = it.filter(x => x.g === g); return `<h3 class="al73h">${esc(L[0].gn)}${g !== "mehr" && g !== "ansicht" && g !== "set" ? ` <small>für die gewählte Form${Forms.active && !Forms.active.empty ? " „" + esc(Forms.active.name) + "“" : ""}</small>` : ""}</h3><div class="al73g">${L.map(x => `<button class="al73t" data-al="cmd:${x.id}" data-q="${esc((x.n + " " + x.a + " " + x.gn).toLowerCase())}" title="${esc(x.a)}"><i>${x.ic}</i><b>${esc(x.n)}</b></button>`).join("")}</div>`; }).join("")}
      <p class="al73no" id="al73No" hidden><span></span> <button class="lnk" data-al="hq">In der Hilfe danach suchen</button></p></div>`);
    s.classList.add("al73");
    const q = s.querySelector("#al73Q"); q.addEventListener("input", () => { const v = q.value.trim().toLowerCase(); let any = false; s.querySelectorAll(".al73t").forEach(b => { const on = !v || b.dataset.q.includes(v); b.hidden = !on; if (on) any = true; }); s.querySelectorAll(".al73g").forEach(g => { const vis = [...g.children].some(b => !b.hidden); g.hidden = !vis; if (g.previousElementSibling) g.previousElementSibling.hidden = !vis; }); const no = s.querySelector("#al73No"); no.hidden = !v; no.firstElementChild.textContent = any ? "Nicht dabei?" : `Keine Funktion heißt „${q.value.trim()}“.`; this.q = q.value.trim(); });
    s.addEventListener("click", e => { const b = e.target.closest("[data-al]"); if (!b || b.dataset.al === "open") return; e.stopPropagation(); this.act(b.dataset.al); });
  },
  act(k) {
    Hap(8); UI.hideSheets(); if (k === "hq") return Help.open(this.q || ""); const [t, id] = k.split(":");
    try {
      if (t === "tab") return UI.setTab(id);
      if (t === "cmd") { if (UI.tab !== "klang" && !["tLoop", "tStueck", "tBeat", "tSchnitt", "tBild", "help", "cfg", "mixer"].includes(id)) UI.setTab("klang"); return setTimeout(() => { try { Cmd.run(id, Forms.active && !Forms.active.empty ? Forms.active : null); } catch (e) { console.warn(e); } }, 80); }
      if (id === "gen") return SongGen.open(); if (id === "smel") return StartMel.open(); if (id === "pieces") return Projects.open(); if (id === "help") return Help.open(); if (id === "erkl") return Erkl.start();
      return Ber72.go(id);
    } catch (e) { console.warn(e); }
  }
};
document.addEventListener("click", e => { const b = e.target.closest && e.target.closest('[data-al="open"]'); if (!b) return; UI.hideSheets(); setTimeout(() => Alles73.open(), 40); });
// Einstiege: Startseite (unten) und Blatt „Mehr“ (oben)
{ const rn = Home67.render.bind(Home67); Home67.render = function (force) { const r = rn(force); try { const h = this.el() && this.el().querySelector(".hm"); if (h && !h.querySelector(".al73go")) h.insertAdjacentHTML("beforeend", `<div class="al73row"><button class="al73go" data-al="open"><i>${I67.raster}</i><span><b>Alles auf einen Blick</b><small>Jede Funktion, geordnet und mit Suche</small></span></button><button class="al73go" data-sm0="1"><i>${I67.note || ""}</i><span><b>Stück mit Melodie</b><small>Erst spielen, dann spielen alle Formen mit</small></span></button></div>`); } catch (e) { console.warn(e); } return r; };
  const mo = Nav67.more.bind(Nav67); Nav67.more = function (...a) { const r = mo(...a); try { const g = document.querySelector("#sheets .sheet .mrg"); if (g && !g.parentElement.querySelector(".al73go")) g.insertAdjacentHTML("beforebegin", `<button class="al73go q7top" data-al="open"><i>${I67.raster}</i><span><b>Alles auf einen Blick</b><small>Jede Funktion, geordnet und mit Suche</small></span></button>`); } catch (_) {} return r; }; }
try { Erkl.T.push([".dr73", "Dreh-Leiste", "Hier drehst du die gewählte Form genau: „Drehen“ startet, „Stopp“ hält sofort an, die Zahlen sind Umdrehungen je Takt (¼ bis 4), der Pfeil kehrt die Richtung um."], [".al73go", "Alles auf einen Blick", "Öffnet eine Übersicht mit allen Bereichen und Funktionen – geordnet nach Aufgaben und mit Suche."]); } catch (_) {}
Help.T.push({ id: "v73", ic: "🧭", t: "Start-Melodie, Dreh-Leiste, Alles auf einen Blick", k: "start melodie neues stück alle formen gleich startformen drehen anschieben anschubsen anhalten stopp tempo richtung umdrehungen genau übersicht alle funktionen suche",
  h: `<p><b>Stück mit eigener Melodie:</b> Im Blatt <b>Neues Stück</b> (Startseite → „Stück mit Melodie“ oder Meine Stücke → ＋ Neues Stück) gibt es den Abschnitt <b>Start-Melodie</b>. Tippe auf den bunten Tasten eine kurze Melodie, bis 16 Töne – sie passt zur gewählten Stimmung. „Stück mit dieser Melodie anlegen“ gibt sie allen Formen des neuen Stücks als Grundmelodie; sie drehen gleich schnell und spielen zunächst <b>dasselbe</b>. Schlagzeug hat keine Tonhöhen und bleibt stehen. Andere Stücke bleiben unberührt. Lässt du das Feld leer, entsteht das Stück wie gewohnt. Danach änderst du jede Form einzeln (Klang &amp; Effekt → Melodie).</p>
  <p><b>Dreh-Leiste</b> (im Bereich Spielen, unten links über dem Steuerfeld): <b>Drehen / Stopp / Weiter</b> – Stopp hält <b>sofort</b> an, Weiter dreht mit dem alten Tempo. Die Zahlen <b>¼ · ½ · 1 · 2 · 4</b> sind Umdrehungen je Takt: ein Tipp stellt genau diesen Wert ein. Der Pfeil kehrt die Richtung um. Die Leiste zeigt immer den aktuellen Stand, auch wenn du die Form mit dem Finger anschubst.</p>
  <p><b>Mit dem Finger:</b> Waagerecht wischen dreht, senkrecht wischen kippt (Melodie). Leicht schräge Bewegungen zählen nur noch für die Hauptrichtung – die Form kippt nicht mehr ungewollt mit. Festhalten und loslassen hält sie an.</p>
  <p><b>Alles auf einen Blick:</b> Startseite unten oder „Mehr“: alle Bereiche und Funktionen, nach Aufgaben geordnet, mit Suche.</p>` });
