# KLANGRAUM – Projektgedächtnis

> **Zweck:** Alles, was ein neuer Chat braucht, um KLANGRAUM ohne Rückfragen sicher weiterzuentwickeln.
> **Lesereihenfolge:** diese Datei → `claude/KLANGRAUM_STAND.md` (Änderungen je Version) → `claude/KLANGRAUM_HILFE.md` (Bedienung aus Nutzersicht) → `claude/KLANGRAUM_KONZEPT_BEDIENUNG.md` (Bedienkonzept ab v32).
> **Stand:** Version 65 · 30.10.2026

---

## 0 · Steckbrief

| | |
|---|---|
| **Produkt** | KLANGRAUM – Browser-Musik-App mit spielbaren 3D-Klangformen, Smartphone zuerst, auch Maus/Tastatur |
| **Eigentümer** | Christian (Antworten immer auf Deutsch) |
| **Live** | https://claude.ai/artifact/AcerFy2AcGdzZhqXA8sjUf („jeder mit dem Link“) |
| **Form** | **eine** HTML-Datei, ~13,5 MB (Instrumententöne als MP3/base64 eingebettet) |
| **Technik** | Vanilla JS, three.js 0.149 (CDN `cdn.jsdelivr.net/npm/three@0.149.0/build/three.min.js`), AudioWorklet, IndexedDB |
| **Capabilities** | `downloads`, `db`, `user`, `assets`, `room` – Publish **ohne** `capabilities` übernimmt sie |
| **Auslieferung** | Artifact-Publish + Download `klangraum_vNN.html` (SendUserFile) + Doku-Update |
| **Prüfstand** | `Tests.run()` im Browser – 89 Prüfungen (v51), dazu Playwright-Skripte und Layout-Audit |

---

## 1 · Arbeitsregeln (verbindlich)

1. **Nie „lazy“** – volle Gründlichkeit und Tiefe; für große Aufträge Teamarbeit (Recherche-/QA-Agenten mit klarem Auftrag).
2. **Chirurgisch patchen:** nur eindeutige Anker ersetzen (`rep()` prüft die Trefferzahl), danach `node --check` auf das extrahierte Haupt-Skript.
3. **Jede Version vollständig ausliefern** (Definition of Done, Abschnitt 3).
4. **Versionsnummer an zwei Stellen** hochzählen: `<div class="meta">Version NN · …</div>` (Startbild) und `this.head("KLANGRAUM · Version NN")` (Menü).
5. **Klang:** echte Instrumente statt Synth (außer Synth/Techno ist gewünscht); alles bleibt harmonisch (Tonart, Akkordtöne).
6. **Bedienung:** einfach, intuitiv, feinfühlig – Menüs dürfen das Spielen nicht stören; keine neuen festen Leisten unten; nichts darf Formen verdecken.
7. **Ehrlich** sagen, was künstlich ist (Formant-Gesang, Synth-Bässe) und was hier nicht testbar ist (öffentliche Vermittler, echte Handy-Sensoren, Mikrofon in der Claude-App).
8. Nicht mit Rückfragen bremsen, wenn der Auftrag klar ist; am Ende **Verbesserungsvorschläge** anbieten, wenn Christian darum bittet.

---

## 2 · Wiedereinstieg in einem neuen Chat

1. **Quelle holen:** `Artifact action=read url=<Live-URL>` (zählt als „gesehen“), dann `action=read path=index.html` → Datei nach `/home/claude/klangraum.html`.
2. **Werkzeuge** aus `claude/tools/` holen (Abschnitt 9) – vor allem `mkwww.sh`, `patch_vorlage.py`, `e2e_vorlage.py`, `audit_layout.py` + `audit.js`, `mqtt_testbroker.py`, `scn48.py`/`mkscn48.py`.
3. **three.js für Tests:** `npm pack three@0.149.0` → `tj/build/three.min.js`; Tests leiten Anfragen auf `three…js` dorthin um.
4. **Test-Server:** `sh mkwww.sh` → `www/index.html`; `cd www && python3 -m http.server 8765` (im Hintergrund, Zeitlimit hoch setzen – Hintergrundprozesse werden sonst beendet).
5. **Neues Modul einfügen:** vor dem Anker `// Verlässt man das Stück, verstummt auch die Schnitt-Schleife` (steht in jeder Version genau einmal). Neues CSS vor `</style>`.
6. **Prüfen:** `node --check`, `Tests.run()` (Hoch- und Querformat), `audit_layout.py` (Ziel: 0 Überlappungen), gezielte Playwright-Tests.

> In dieser Arbeitsumgebung sind pip/npm-Downloads oft gesperrt; das Netz ist auf eine Allowlist beschränkt. Öffentliche Vermittler (EMQX/HiveMQ/Mosquitto) sind hier **nicht** erreichbar – dafür gibt es den lokalen Test-Vermittler.

---

## 3 · Definition of Done (jede Version)

- [ ] Module/CSS geschrieben, Build ohne Fehler, `node --check` grün
- [ ] Versionslabel an beiden Stellen
- [ ] `Tests.run()` bei 412×892 **und** 700×330: nur bekannte Headless-Ausreißer (T3 Bilder/s, gelegentlich I1/P1/K2)
- [ ] Layout-Audit 412×892 und 700×330: TOTAL 0
- [ ] Neue Funktionen per Playwright mit **Touch und Maus** geprüft, Screenshots angesehen
- [ ] Bei größeren Änderungen: unabhängiger QA-Agent
- [ ] Publish an dieselbe URL **ohne** `capabilities`, `label` „vNN …“
- [ ] `klangraum_vNN.html` per SendUserFile
- [ ] Projekt-Doku: STAND („Neu in vNN“), GEDÄCHTNIS (Versionstabelle, Basis), HILFE (betroffene Abschnitte), ggf. Werkzeuge
- [ ] Antwort an Christian: kurz, was neu ist, was getestet wurde, Grenzen, ggf. Vorschläge

---

## 4 · Architektur

### 4.1 Aufbau der Datei
- **HTML-Gerüst:** Kopfleiste (Projekt, ■, ↶, Stimmung, Vollbild, Menü), `#strip` (Formen-Kugeln), `#formname`, `#labels` (Namensschilder), Reiter `.tabs` (Klang · Stück · Beat · Schnitt · Bild), Ansichten `#vStueck`, `#vBeat`, `#vSchnitt`, `#vBild`, Startbild `#start` mit `#enter` („Eintauchen“).
- **`<script type="application/json" id="klangEMB">`:** alle Instrumententöne `{ schlüssel: { "Cs3": base64mp3 } }` (Töne alle 3 Halbtöne).
- **Ein Haupt-`<script>`** mit Modulen als `const`-Objekten; spätere Versionen erweitern frühere durch **Hüllen** (`const x = Obj.f.bind(Obj); Obj.f = function () { … x() … }`). Ab v40 beginnt jedes Versionsmodul mit einem Kommentarkopf `/* ===… vNN: … */`.

### 4.2 Kernmodule (Auswahl)
| Bereich | Module |
|---|---|
| Rechenkern | `K` (Seeds `K.SEEDS`, Harmonie, `K.MOODS`, Bildanalyse `K.analyzeImage`, Formate) |
| Audio | `Engine` (Worklet, 32 Kanäle), `Inst`, `Music` (`set(mood)`, `tempo()`, `setTempo`, `setRaw`), `Transport` (16tel, `onStep`), `Loops`, `LoopCtl`, `Fade`, `Rec`, `Recs` |
| Formen | `Forms` (`make`, `rebuild`, `applyMix`, `setActive`, `list` = Reihenfolge), `Perf.REG`, `Motion`, `Bew`, `Phys` |
| Szene | `Scene` (`view` nah/alle/raum, `labels()`, `grid()`, `fitGoal()`, `formScreen()`, `planePoint()`, `meshes`), `Input`, `Pinch` |
| Oberfläche | `UI`, `Sheets`, `KSheet` (Steuerfeld), `FBar`, `Radial` (Ring), `Cmd`/`Cfg`, `Chips`, `Feel.volDrag`, `FPop`, `Help`, `Coach`, `Layout`/`Lay33` |
| Stück | `Project`, `Projects` (`create`, `open`, `openId`), `Save`, `Cloud`, `Undo`, `Song`, `Stueck`, `Schnitt`, `Techno` (Beat) |
| Bild | `Bild`, `BildX`, `BildK` (Szenen → Stil → Komposition) |

### 4.3 Versionsmodule ab v40 (Reihenfolge im Haupt-Skript)
| Datei (Arbeitsname) | Inhalt |
|---|---|
| `v40b.js` | `BildK`: Bildcharakter (`feat`), 12 Stile (`STYLES`), Szenennamen (`SCN`), 8-taktige Motiv-Komposition |
| `v40l.js` | `Logo` (animierte Klangwolke) |
| `v42.js` | `LoopCtl.hold/release` (■ hält dauerhaft), **Meine Stücke** (`FM`, `Projects.open` als Liste, Erstellt/Geändert) |
| `v43.js` | `FSw` – Schalterzeile je Form (An/Aus · Drehen · Loop · Einzeln · Alle) |
| `v44r.js` / `v44m.js` | `Radial` als Ring (Tortenstücke, Ebenen) / Maus-Bedienung |
| `v45.js` | `Cue` (Set & Einsatz), `SetCap` (Set aufnehmen → Form), `MicForm`, `PrevAudio`, 10 weitere Stimmungen |
| `qr.js` + `v46.js` | `QR` (Encoder), `JamInvite` (QR, WhatsApp, Teilen, Code) |
| `v47.js` | `NetJam` – MQTT 3.1.1 über WebSocket, Jam ohne Anmeldung |
| `v51 Scan` (andere Sitzung) | `Scan` – gescannte Körper/Räume aus FORMRAUM SCAN (.klang.json, GLB/OBJ/STL/PLY), Klopfklang aus Werkstoff, Raum-Impulsantwort als Hall |
| `v56.js` | `StartGuard` (Startschritte einzeln abgesichert, Wächter 11 s, Notbetrieb merkbar `forceShim`), Zeitgrenzen für `addModule`/`resume` (im Build in `Engine.init`/`App.enter` gepatcht), Loopstation-Puffer erst nach dem Ton |
| `v55.js` | `LoopSt` (Loopstation: Spuren, frei/fest, Overdub, Formen-Audio aus `Engine.sum`, Ausgang an `Engine.out`, `d.ls`), Bereich `#vLoop`/`#tLoop`, `Motion.fineR` (12er-Raster in `Motion.update`), `Move.setR/faster/slower/slider`, Regler `data-fr="spd"` |
| `v54.js` | `BBX` (Beatbox-Kits synthetisch), `Zones` (mehrere Instrumente auf einem Körper, `layer.zones`), `Sing` erweitert (Riff-Loops, Eingang, MediaRecorder-Umweg, `startRec2/stopRec2/render2` – die v50-Funktionen reichen im Build weiter), `MicLog` |
| `v53.js` | `KneadPitch` – Knet-Stufen aus Δmean/ΔS gegen Startform; `pitchFromU(…, kd)`, `tp(f, base, m, kt)` |
| `v52.js` | `MicWin` – „Im eigenen Fenster öffnen“ (Blob-Seite aus `SRC_HTML` + Stückpaket `__KR_IMPORT`, Rückweg per `postMessage` „kr-back“), Import-Umschreibung der Aufnahme-Verweise |
| `v50.js` | `Sing` (Gesangsspuren linear im Takt, `d.sing`), `RecGuard` (während Aufnahmen `Play.on()` wahr) |
| `v49.js` | `MicFix` – Mikrofon-Diagnose, Ersatz über Aufnahme-App (`capture`), MediaRecorder-Umweg, Prüfseite |
| `v48.js` | NetJam Mehrfach-Vermittler · `BildK.feat2` (6 Szenen) · `NewPiece` · `Cue.sortList`/`Arrange` · `QuickPP` · `RDots` · `MicStart` · `Help.CATS/WANT` · Namens-Ausweichen |

### 4.4 Datenmodell (`Project.data`)
Formen (inkl. `fine.vol`, `mx`, `fade`, `mels`, `takes`, `ph`, `pos`), `mood`, `bpm`, `song`, `techno`, Pads, `schnitt`, `sing`, **`ls`** (Loopstation `{ L (Sechzehntel), slots: [{rec, prev, name, vol, on, bpm, ch, src}] }`, v55), **`cue`** (`{ list: [{f, t}], gap }`). Die **Reihenfolge von `Forms.list`** ist seit v48 bedeutungstragend (Anordnung in Alle = Set-Reihenfolge).

### 4.5 Mechanik von v48 (Kurzreferenz)
- **Jam (`NetJam.join`):** verbindet parallel mit allen Einträgen in `NetJam.BROKERS` (Zeitlimit 6 s, mind. einer nötig), sendet jede Nachricht über alle, filtert Doppelte über `from + q` (Folgenummer). Fällt eine Verbindung weg: weiter über die anderen, Neuverbindung mit wachsendem Abstand (4 s … 60 s); fallen alle weg → `NetJam.lost()`. Nicht erreichte Vermittler werden nach 15 s erneut versucht. Der Code-Buchstabe bleibt nur noch Kennung (`pick()` → „e“). Test-Überschreibung: `store.set("jamBroker", url)` oder `NetJam.BROKERS = [...]`.
- **Bild:** `BildK.feat2` ergänzt `f.scenes` um `meer, berge, garten, innen, nebel, feuer` (Merkmale: Wasser im unteren Band, Diagonalkanten + Himmel + Kontrast, Buntpunkte auf Grün, Wandtöne ohne Himmel, geringer Kontrast + hell, warme Lichtpunkte mit Glut-Schein) und Vorrangregeln; Stile `ozean, berg, garten, kamin, nebel, feuer`. Prüfung mit 22 synthetischen Bildern: alle richtig (`scn48.py`).
- **Neues Stück (`NewPiece`):** `SETS` (Formen-Kombinationen), `TEMPI`; `go()` → `Projects.create(name,"leer")`, `Music.set`, `Music.setTempo`, `Forms.make` im Kreis angeordnet, Ansicht Alle; letzte Wahl in `store "npLast"`.
- **Reihenfolge:** `Cue.sortList()` sortiert nach `Forms.list`-Index, dann Loop-Reihenfolge; läuft in `clean`/`toggle`/`sheetRender`. `Arrange.moveTo(f, i)` verschiebt in `Forms.list` (setzt `Scene.gridC = null`). Doppeltipp-Erkennung (380 ms) im Capture-Listener; `Radial.openFor` von Namensschildern in Alle wird 330 ms verzögert (nur ohne Pointer-ID, d. h. nicht beim langen Drücken).
- **▶/⏸ (`QuickPP`):** `Fade.set(f, on, true)` (ohne Blende), startet Transport/Loops beim Weiterlaufen. `FSw.power` ebenfalls sofort. Symbole als SVG (Schriftzeichen ⏸ ist auf Handys winzig).
- **Raum (`RDots`):** Ebene `#rdots`, `body.krdots` blendet `#labels` und `#cueL` aus; Punkt am Fuß der Form, nie unter dem Steuerfeld (`limit()`) oder dem runden Form-Knopf `.kfab`; aktualisiert je Bild und alle 250 ms.
- **Mikrofon (`MicStart`):** `getUserMedia` im Klick auf `#enter`; `MicForm.start` bekommt einen Klon des Streams (keine zweite Frage); Menüschalter `store "micStart"`.
- **Hilfe:** `Help.CATS` (Themen), `Help.WANT` („Ich will …“), neue Abschnitte `neu`, `alle`, `mikro`; `Help.open` baut das Inhaltsverzeichnis um.

---

## 5 · Build und Patch (Arbeitsumgebung)

- **Arbeitsverzeichnis:** Scratchpad der Sitzung (`…/scratchpad/`), Doku-Kopien in `/home/claude/proj/`, Downloads in `/home/claude/download/`.
- **Bauskript `buildNN.sh`:** kopiert `klangraum_v39_pub.html` → `/home/claude/klangraum.html`, führt `vNNa.py` aus (fügt v40b … vNN.js am Anker ein, CSS css42 … css48 vor `</style>`, Texte/Tests per `rep`), extrahiert `appNNb.js`, `node --check`, `mkwww.sh`, `dbg33.py` (Seitenfehler).
- **Neue Version:** `cp vPREVa.py vNNa.py`, Include-Zeilen + Versionslabel ersetzen, Prüfstand-Tests per `rep` hinter `ok("BV", …)` anhängen; `buildNN.sh` per `sed` aus dem Vorgänger.
- **Ohne Bauskript (neuer Chat):** die veröffentlichte Datei ist die Basis; neues Modul am Anker einfügen (`patch_vorlage.py`).

---

## 6 · Tests

| Werkzeug | Zweck |
|---|---|
| `Tests.run()` (`prf33.py` ruft es bei 412×892 und 700×330 auf) | 86 Prüfungen; v48 neu: **NP** (Neues Stück), **BS** (Szenen/Stile), **AR** (Reihenfolge + ▶/⏸ ohne Blende), **HL** (Hilfe vollständig) |
| `audit_layout.py` + `audit.js` | Überlappungen aller Bedienzustände (Form/Alle/Raum, Kneten/Malen, Vollbild) – Ziel TOTAL 0 |
| `t48.py` | Neues Stück, ▶/⏸ im Namen, Tipp → Kreis, Doppeltipp-Ziehen, ◌ ziehen, Raum-Punkte (Tipp/Ziehen), Mikro ohne zweite Frage, Hilfe |
| `t48j.py` | Jam mit 3 Vermittlern (einer tot), Teilnehmer mit unterschiedlicher Erreichbarkeit, Doppelfilter, Ausfall + Neuverbindung |
| `scn48.py` + `mkscn48.py` | 22 synthetische Szenenbilder → erkannte Szene/Stil |
| `t43.py`, `t44m.py`, `t45.py`, `e2e22.py` | Schalterzeile, Maus, Set/Aufnahme/Mikro/Spalten, Grundabläufe |

**Playwright-Grundgerüst:** Chromium `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`, Argumente `--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader --autoplay-policy=no-user-gesture-required` (Mikrofon: `--use-fake-device-for-media-stream --use-fake-ui-for-media-stream` + `permissions=["microphone"]`), 390×844 mit `has_touch`; `#enter` klicken, auf `App.started` warten, `Coach.close(); UI.setTips(false)`. Elemente in Blättern vor dem Tippen `scrollIntoView`.

**Bekannte Headless-Ausreißer:** T3 (Bilder/s), gelegentlich I1 (Laden), P1 (Timing), K2 (späte Noten), MB in `e2e22` (Leistenanteil bei Spezialzustand).

---

## 7 · Stolperfallen

**Oberfläche**
- Neue Befehle in `Cmd.L` eintragen und einer Gruppe in `Cmd.GROUPS` zuordnen (max. 8) – dann stehen sie im Ring, in Einstellungen und Leiste.
- Schwebende Bedienelemente brauchen `touch-action: none`; keine festen `bottom`-Werte (Steuerfeld misst sich selbst).
- **Alte CSS-Regel `.labels span { position:absolute; transform: translate(-50%) … }`** – jedes `span` in einem Namensschild muss sie überschreiben (v48: `span.lplay`).
- Querformat: Handy = `body.kland` (Reiterleiste links 60 px), Rechner = `body.kside`.
- Szene rendert nur bei Bedarf: was an Bildschirmpositionen hängt (Punkte, ◌), zusätzlich per Intervall aktualisieren.
- Neu gerenderte Knöpfe nicht per `innerHTML` je Bild ersetzen (Tipps gehen verloren) – Elemente behalten und nur verschieben.
- `#formname` hat `pointer-events: none`; eigene Knöpfe darin brauchen `pointer-events: auto`.
- Blätter: `Sheets.open(name, html)` → Element; Klicks über Delegation am Blatt.

**Audio und Zustand**
- An/Aus nur über `Fade.set/toggle` (nicht `f.mute = …`); `quick = true` = ohne Blende.
- Lautstärke = `fine.vol × stumm/einzeln × (1−pulse) × songG × fadeG` (`Forms.applyMix`).
- `Transport.toggle` hält Loops über `LoopCtl.hold`; nur ausdrückliche Aktionen geben sie frei (`LoopCtl.release`).
- Fließende Übergänge nur, wenn `Glide.live()` (Transport mit Timer).
- Gast-Formen aus dem Jam (`f.remote`) gehören nicht ins Projekt.
- Module, die später definierte Objekte (`Bild`) erweitern, in `setTimeout(…, 0)` legen.

**Umgebung**
- Hintergrund-Server sterben nach dem Zeitlimit → bei Bedarf neu starten.
- `pkill -f` trifft auch die eigene Shell, wenn das Muster im Befehl steht → `pgrep -f '^python3 broker.py 8899'`.
- **Mikrofon:** nur in sicheren Kontexten (https, localhost, file://). Android öffnet Downloads als `content://` → kein `navigator.mediaDevices`; claude.ai-Einbettung sperrt es (keine Artifact-Capability dafür). Ersatz: `<input type=file accept=audio/* capture>` – muss im selben Tipp geöffnet werden (sonst blockiert der Browser). Test einer unsicheren Adresse: Server an 0.0.0.0 binden und über die Container-IP aufrufen.

---

## 8 · Versionsverlauf

| Version | Schwerpunkt |
|---|---|
| v16–v26 | Bedienung, echte Instrumente, Loops, Melodien, Pads, Projekte/Cloud, Song-Raster, Live-Session, Übergänge, Beat-Groovebox, Techno-Bässe, Stimmen, Drum-Kits |
| v27–v29 | Lautstärke am Namen, Form-Regler, Blenden, Teilen (MP3/Video), Raum spielbar, Schnittraum |
| v30–v35 | Layout-Aufräumen, Form-Leiste, „Leinwand zuerst“ (Steuerfeld, Gesten, Radialmenü), Querformat, Kreis mit allen Befehlen, Drehrichtung |
| v36–v39 | Spielmodus, Leistungsstufen, Rückblick, Szenen A–H, Gemeinsam spielen (Anmeldung), Physik im Raum (greifen, werfen, wischen) |
| v40 | Bild wird Musik v3 (Charakter → 12 Stile, 8-taktiges Lied), Logo; (Bewegen mit Sensoren – in v42 wieder entfernt) |
| v42 | ■ hält Loops dauerhaft, Dateiverwaltung „Meine Stücke“ |
| v43 | Schalterzeile je Form, „Alle Formen“ |
| v44 | Ring-Menü, Maus-Bedienung |
| v45 | Set & Einsatz, Alle mit Spalten, Set aufnehmen → Form, Mikro → Form, 20 Stimmungen |
| v46 | Einladen per QR-Code/WhatsApp, Erstellt/Geändert in Meine Stücke |
| v47 | Jam ohne Anmeldung über freien MQTT-Vermittler |
| **v65** | `KeysUI` (Blatt „Melodie“: Tasten, Akkorde, Aufnahme), `Lieder` + `Lied` (Akkordfolge überschreibt `Transport.chordDeg/chordAtStep`, `d.lied`), `RetroEd` (Rückblick-Schnitt mit Taktraster aus `Retro.rt0`/`Retro.tot`), Kneten wirkt auf Drum-Kits (`Forms.fpOf`) und Loop-Formen (`LoopKnead`, WaveShaper), `KneadPitch.tick/hide`, Takes bis 16 Takte, `vorige/` + Git-Tags |
| **v64** | Pult-Szenen (`Pult.scn`, 8 Plätze, `sSave/sGo`, gespeichert als `d.pscn`), Drop (`Pult.dropSt` arm→still→null an der Eins, `riser`/`boom`), ein Loop-Begriff (`Cmd.L.loop` → `LoopRec.tap`), `body.kmany` in Alle |
| **v63** | `Pult` (Bereich „Pult“ = `#vLoop` mit `#pult` + `#lsbox`; `Pult.q` Einsätze auf der Eins via `Transport.onStep`; Master-Filter lp→hp hinter `Engine.out`; Echo/Break halten), 4 harte Bassbeat-Kits in `BBX`, Konzept `docs/KONZEPT_PULT.md` |
| **v62** | `SoloStart` (einzeln starten, ▶ zeigt echtes Klingen), `LoopRec` (🔴 Loop im Steuerfeld), Raum-Mix der Loops (`LoopSt.par` aus `f.mixNow`, Kuhschwanz-Filter), neue Oberfläche (CSS-Variablen `--grad`, `--glass`, `--line`) |
| **v61** | Einzelklang → Instrument/Loop, Spur → Instrument, `Ticker` (Worker-Takt), `Transport.ahead()` (Vorlauf 0,12–0,4 s), `Stab` (Klang-Puffer, Stimmenzahl), weiches Stimmen-Ablösen im Klangfaden, `storage.persist`, Service Worker der Website |
| **v60** | Loopstation: Takt-Uhr, Anleitung, Wellenbild, Klartext, Versatz (`t.shift`), Loop = Form (`t.fid`, `t.r0`; Drehen/Kneten/Tempo steuern den Loop) |
| **v59** | `MicFix.reason`: content:// immer „content“ (Chrome Android lehnt dort still ab) |
| **v58** | `[hidden]`-Regel in der App, Download mit vollem Rahmen, Erklärkarten scrollbar/überspringbar, Meldungen warten hinter den Karten |
| **v57** | Download-Datei wieder mit doctype/utf-8, früher Startwächter (zeigt Fehler und Hänger im Startbild) |
| **v56** | Start abgesichert: kein Hängen bei „Einen Moment …“ (Zeitgrenzen, Schritte einzeln, Wächter), Loopstation-Spuren nach Neuladen |
| **v55** | Loopstation (Mikrofon/Formen, frei mit Tempo aus Länge, Overdub, ×2, Datei/Aufnahme-App), Drehtempo fein (12 Schritte je Verdopplung, Regler), Bereich „Loop“ |
| **v54** | Beatbox-Kits (16 Mundklänge), mehrere Instrumente auf einem Körper, Riffs als Loop (1/2/4/8 Takte, Eingang wählbar), Aufnahme mit Umweg + Protokoll |
| **v53** | Kneten verändert die Tonhöhe deutlich (±12 Stufen, in der Tonart), Anzeige + Ton beim Kneten |
| **v52** | Mikrofon: eigenes Fenster aus claude.ai, aus der Datei zum sicheren Link (Stück wird mitgenommen) |
| **v51** | (andere Sitzung) Gescannte Körper und Räume aus FORMRAUM SCAN · bei mir zuerst Mikrofon-Fenster: eigenes Fenster mit Stück, Mikrofon frei, „Zurück in die App“ |
| **v50** | Gesangsspuren einsingen (linear, Overdub, Laufzeitausgleich), Aufnahmeschutz: kein Kreis beim langen Drücken während Aufnahmen |
| **v49** | Mikrofon: Ursache erkennen (content://, Einbettung, verweigert …), 🎤 Mikro → Aufnahme-App als Ersatz, Prüfseite mit Pegeltest |
| **v48** | Vermittler automatisch (alle parallel, Ausfallsicherheit), 6 neue Bild-Szenen + Stile, „Neues Stück“ mit Vorauswahl, Set-Reihenfolge = Anordnung in Alle (Doppeltipp + Ziehen), ▶/⏸ im Namen, Raum-Punkte statt Namensschilder, Mikrofon beim Start, Hilfe nach Themen + „Ich will …“, Namensschilder weichen sich aus |

Details je Version: `claude/KLANGRAUM_STAND.md`.

---

## 9 · Werkzeuge im Projekt (`claude/tools/`)

| Datei | Zweck |
|---|---|
| `mkwww.sh` | baut `www/index.html` (Artifact-Hülle + App) |
| `patch_vorlage.py` | Muster: Anker ersetzen, Skript extrahieren, `node --check` |
| `e2e_vorlage.py` | Playwright-Gerüst |
| `audit_layout.py` + `audit.js` | Überlappungsprüfung (`python3 audit_layout.py 412 892 tag --shots`) |
| `mqtt_testbroker.py` | lokaler MQTT-über-WebSocket-Vermittler (Port als Argument, z. B. 8899) |
| `mkscn48.py` / `scn48.py` | synthetische Szenenbilder erzeugen / Szenenerkennung prüfen |
| `render_tb.py`, `render_hard.py`, `phys_render.py`, `vox_render.js` | Klänge offline berechnen (Bässe, Phys-Instrumente, Stimmen) |
| `v48.js` … `v56.js` | Quelltext der Module v48/v49 (Referenz) |

---

## 10 · Grenzen und offene Punkte

- **Öffentliche Vermittler** (EMQX, HiveMQ, Mosquitto) konnten hier nicht live getestet werden – die Logik ist mit lokalen Vermittlern geprüft (Mehrfachverbindung, Doppelfilter, Ausfall, Neuverbindung).
- **Bilderkennung** ist regelbasiert (Farbe, Kanten, Bereiche) und an synthetischen Bildern geprüft; echte Fotos können anders ausfallen → Rückmeldungen von Christian sammeln.
- **Bewegen (Sensoren)** auf Wunsch entfernt (v42); ginge nur auf eigener https-Seite ohne fremdes iframe.
- **Dateigröße** ~13,5 MB – neue Klänge lieber zur Laufzeit berechnen oder mit geringer Bitrate.
- **Ideen-Speicher:** siehe Vorschläge in `KLANGRAUM_STAND.md` (Abschnitt v48) – u. a. Akkord-Vorschläge, Tonart-Wechsel im Set, Szenen-Morphing, Rhythmus aus Bild, gemeinsames Set im Jam.

---

## 11 · Basis-Dateien der Arbeitssitzung (nur gültig, solange die Sitzung lebt)
- `klangraum_v48` = `klangraum_v39_pub.html` + v40b, v40l, v42, v43, v44r, v44m, v45, qr, v46, v47, v48, **Ab v52 ist die Basis die veröffentlichte Fassung** (Live-Datei inkl. Scan-Modul der anderen Sitzung) + **v52**.js + css52 über `v52a.py`; **v53** = `base52.html` + v53.js + css53 über `v53a.py`; **v54** = `base53.html` (veröffentlichte v53) + v54.js + css54 über `v54a.py` (danach `mkwww.sh`); Tests `t54.py` (Beatbox, Zonen per Finger, Riff, Gesang-Umweg); ältere Kette v39 + v40b … v50 gilt nur bis v50; Tests `t49.py`, `t50.py`, `t51.py` (nachgebaute Einbettung: `outer/embed.html` auf Port 8766 bettet 127.0.0.1:8765 per Sandbox-iframe ohne Mikrofon ein).
- Test-Server 8765 (`www/`), Test-Vermittler 8899 und 8898 (`mq/broker.py`).

- **Mikrofon in Artifacts:** keine Capability (bis Vertrag 0.2.89) – im claude.ai-Rahmen unmöglich; Lösung nur außerhalb (Datei am Rechner, eigene https-Seite). GitHub-Connector hat Push-Rechte, aber alle Repos sind privat (Pages bräuchte ein öffentliches oder ein Bezahl-Konto).

- **Vor jedem Publish prüfen, ob eine andere Sitzung inzwischen veröffentlicht hat** (Publish wird sonst abgelehnt): dann die Live-Fassung als Basis nehmen und die eigenen Module darauf setzen – nie überschreiben. Christian arbeitet parallel in anderen Projekten (z. B. FORMRAUM SCAN) an KLANGRAUM.

- **v55** = `base54.html` (veröffentlichte v54) + v55.js + css55 + Prüfungen t55.js über `v55a.py` (`build55.sh`); E2E `t55.py` (Loopstation mit simuliertem Mikrofon, Regler), `t55e.py` (Einbettung).
- **v56** = `base55.html` (veröffentlichte v55) + v56.js über `v56a.py`; Starttests `dbg_hangwk.py` / `dbg_hangres.py` (nie fertiges `addModule` bzw. `resume`).
- **v57** = `klangraum_v56_pub.html` + `guard57.html` (vor dem three.js-Skript) über `v57a.py`; schreibt zusätzlich `download/klangraum_v57.html` mit vollständigem Kopf.
- **v58** = `klangraum_v57_pub.html` + v58.js + css58 über `v58a.py` (schreibt auch `download/klangraum_v58.html`). Test `dbg_coach3.py` (360×520, Karten blättern).
- **Arbeitsbasis GitHub (ab v60):** Repo `123ChriSD/klangraum` – `index.html` (Website, gebaut mit `tools/mksite.py` aus dem Artifact-Rumpf), `docs/` (STAND, GEDAECHTNIS, HILFE, KONZEPT_BEDIENUNG, RECHTSPRUEFUNG), `src/` (vNN.js, cssNN.txt, vNNa.py), `tools/` (prf33.py, audit.py, t60.py …), `CLAUDE.md`. Je Version: bauen → testen → Artifact veröffentlichen → `mksite.py` → Docs kopieren → commit + push (Pages aktualisiert sich selbst). Klon in neuer Sitzung: `add_repo` + `git clone --depth 1`.
- **Loopstation-Technik (v60):** `LoopSt.par(t)` liest die Form (run, Gain, Tempo-Faktor, Halbtöne, Tiefpass, Pan, Hall); `onStep` spielt „glatt“ (ein Puffer je Runde ab `(step−shift) mod L = 0`) oder „schlag“ (Scheiben je Schlag mit `playbackRate = Tempo/bpm × sp × 2^(HT/12)`); eigene Kette je Spur (Gain → Tiefpass → Panner → Loop-Ausgang, Hall-Send). `Motion.step` und `Forms.play` sind für Loop-Formen umgeleitet (keine Synth-Töne, Antippen = Schlag-Scheibe).
- **Eigene Website (28.10.):** Paket `scratchpad/site/` bzw. `klangraum-website.zip` = `index.html` (v59 mit vollem Kopf, Manifest, Icons, `JamInvite.URL` = eigene Adresse, wenn nicht claude.ai) + `s/` (224 Instrumenten-Aufnahmen aus dem Artifact, `s/index.json`, `s/QUELLEN.txt` CC-BY) + `manifest.webmanifest`, `icon-192/512.png`, `.nojekyll`, `README.md`. Ziel: GitHub Pages `https://123chrisd.github.io/klangraum/` (GitHub-Name `123ChriSD`; Repo `klangraum` muss Christian öffentlich anlegen, dann Push über `add_repo`, dann Settings → Pages → main / root). Getestet auf localhost (sicher): Mikrofon direkt, keine Warnkarte, 13 Instrumente lokal, Loopstation frei → 1 Takt 90,6 BPM.
- **Stolperfalle (v65):** Prüfungs-Kürzel sind global eindeutig (KP gab es schon → KB). `Tests.run` ist synchron – kein `await` in Prüfungen. `Cfg.bar` hat jetzt bis 7 Plätze. Bei jeder Veröffentlichung zuerst `tools/mkvorige.py` (vorige Fassung sichern), dann `mksite.py`, dann Git-Tag `vNN`.
- **Stolperfalle (v64):** `Pult.render` wird über Wrapper ergänzt (Szenenzeile vor `.ppgrid`, Drop in `.ptfx`) – `Pult.sig` muss jeden neuen Zustand enthalten, sonst wird nicht neu gezeichnet. ■ (`Transport.stop`) holt beim Drop ausgeblendete Formen zurück.
- **Stolperfalle (v63):** `QuickPP.toggle` plant bei laufendem Takt nur ein (Pult) – Prüfungen, die sofort umschalten wollen, setzen `QuickPP._now = true`. `LoopSt.el()` ist jetzt `#lsbox` im Pult.
- **Stolperfalle (v62):** Keine Zustände in `dataset` neu gezeichneter Knöpfe merken (KSheet zeichnet neu → Endlosschleife). `Motion.setAxis/resume/push` starten bei stehendem Takt nur die betroffene Form – Prüfungen, die Formen bei stehendem Takt drehen, müssen den Zustand selbst zurücksetzen.
- **Stolperfalle (v61):** Klangfaden-Änderungen gehen über `KLANG_WORKLET` (Text wird zu `WORKLET_SRC`); neue Nachrichten im `port.onmessage` ergänzen (z. B. `vmax`). Neue Kreis-Befehle nur mit Platz in einer Gruppe anlegen (Prüfung KR). Website-Updates kommen über den Service Worker – `mksite.py` erzeugt `sw.js` mit neuem Cache-Namen je Bau.
- **Stolperfalle (v58):** Nie auf den Artifact-Rahmen verlassen (`[hidden]`, Grund-CSS) – die Download-Datei läuft ohne ihn. Vollbild-Dialoge immer scrollbar und mit wenig Höhe/großer Schrift testen.
- **Stolperfalle (v57):** Die veröffentlichte Datei ist ohne Kopf (den setzt das Artifact), die **Download-Datei braucht `<!doctype html>` und `<meta charset="utf-8">`** – sonst Quirks-Modus und falsche Umlaute. `App`, `StartGuard` usw. sind `const` → nicht über `window.App` erreichbar, im Wächter `typeof App`.
- **Stolperfalle (v56):** Nichts beim Start ohne Zeitgrenze `await`en; jeder neue Startschritt in `step(…)`.
- **Stolperfalle (v55):** Namen `Looper` (Form-Loop-Blatt) und CSS-Klassen `.lsv`, `.lsbig`, `.lsb` … gibt es schon – neue Module eigene Präfixe (`LoopSt`, `.lq…`). Gekoppelte Drehungen rasten auf `Motion.fineR` ein, nicht mehr auf `RPB[t]`; Prüfungen dürfen keine ganzzahligen Umdrehungen mehr erwarten.
- **Stolperfalle (v54):** Wer Funktionen erweitert, die schon von späteren Modulen per `.bind` gehalten werden (z. B. `Sing.startRec` durch `MicWin`), ersetzt sie nicht, sondern lässt die alte Fassung im Build an eine neue (`…2`) weiterreichen. Kein `new THREE.*` auf oberster Ebene eines Moduls (THREE kann beim Laden noch fehlen) – erst bei Bedarf anlegen.
