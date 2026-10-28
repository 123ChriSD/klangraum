# KLANGRAUM – Arbeitsregeln für Claude

Dieses Repository ist die Arbeitsbasis für KLANGRAUM (Browser-Musik-App mit 3D-Klangformen, Smartphone zuerst).
Live: https://123chrisd.github.io/klangraum/ (GitHub Pages, Zweig `main`, Ordner `/`). Zusätzlich gepflegt: Claude-Artifact https://claude.ai/artifact/AcerFy2AcGdzZhqXA8sjUf

## Zuerst lesen
- `docs/GEDAECHTNIS.md` – Architektur, Module, Stolperfallen, Versionsverlauf (verbindlich)
- `docs/STAND.md` – was in welcher Version neu ist (oben = neueste)
- `docs/HILFE.md`, `docs/KONZEPT_BEDIENUNG.md`

## Regeln (von Christian)
- Antworten auf Deutsch. „Sei nie wieder lazy“ – volle Gründlichkeit und Tiefe.
- Chirurgisch patchen: neues Modul `src/vNN.js` (+ `src/cssNN.txt`, Prüfungen) wird per `src/vNNa.py` in die vorige Fassung eingesetzt (Anker `// Verlässt man das Stück, verstummt auch die Schnitt-Schleife`, CSS vor dem letzten `</style>`, Prüfungen nach `} } catch (e) { ok("BV", false, String(e)); }`). Versionsnummer an zwei Stellen: `<div class="meta">Version NN · …</div>` und `this.head("KLANGRAUM · Version NN")`.
- `node --check` auf das größte `<script>`; Prüfstand (`tools/prf33.py`, Ziel: keine Fehler außer schwankendem T3/I1), Layout (`tools/audit.py 412 892` und `700 330`, Ziel TOTAL 0), passende E2E-Tests (`tools/t60.py` …, Chromium mit simuliertem Mikrofon).
- Nie auf den Artifact-Rahmen verlassen: die App muss als eigene Datei laufen (`[hidden]`-Regel ist in der App).
- Nichts beim Start ohne Zeitgrenze `await`en; Vollbild-Dialoge scrollbar.
- Funktionen, die spätere Module per `.bind` halten, nicht ersetzen, sondern weiterreichen lassen. Kein `new THREE.*` auf oberster Ebene.

## Veröffentlichen (je Version)
1. App-Rumpf bauen (`src/vNNa.py` → `/home/claude/klangraum.html`, ohne Kopf).
2. Artifact: vorher prüfen, ob eine andere Sitzung veröffentlicht hat (dann deren Fassung als Basis), dann mit `url` und **ohne** `capabilities` veröffentlichen.
3. Website: `python3 tools/mksite.py /home/claude/klangraum.html index.html` (setzt Kopf, Manifest, eigene Adresse für Einladungen).
4. `docs/` aktualisieren (STAND, GEDAECHTNIS, HILFE), `src/` ergänzen, commit + push auf `main` → Pages aktualisiert sich nach ~1 Minute.
5. Download-Datei für Christian: mit vollständigem Kopf (doctype, utf-8).

## Hinweise
- Die Werkzeuge in `tools/` erwarten die Arbeitsdateien im Scratchpad der Sitzung (Pfade oben in den Skripten anpassen).
- `s/` enthält Instrumenten-Aufnahmen (tonejs-instruments, CC-BY 3.0, Quellen in `s/QUELLEN.txt`).
