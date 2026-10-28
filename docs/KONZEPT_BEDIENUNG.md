# KLANGRAUM – Bedienkonzept „Leinwand zuerst“ (ab Version 32)

Erarbeitet im Team (Recherche + Umsetzung + unabhängige Prüfung), Oktober 2026. Vorgabe: flüssige und intuitive Bedienung auf Smartphones und Tablets, auch für Laien, ohne viel Erklärung.

## 1. Ausgangslage
- Auf dem Handy (Hochformat) belegten die Leisten unten zusammen etwa die Hälfte des Bildschirms: Werkzeuge, Form-Leiste, Schnellknopf-Dock und Reiter.
- In „Alle“ wurden die Formen dadurch winzig, die Namen waren größer als die Formen.
- Ansichtswechsel und Zoom waren schwierig. Im Raum hat Kneifen die Ansicht gewechselt, statt zu zoomen.

## 2. Leitlinien aus der Recherche
| Regel | Quelle | Umsetzung |
|---|---|---|
| Häufiges gehört in den Daumenbereich (unteres Drittel) | Hoober/UXmatters, Smashing „Thumb Zone“ | Steuerfeld unten, Schnellknöpfe dort |
| Tippflächen mindestens 44 pt (Apple), 48 dp (Material); WCAG 2.5.5: 44 px | Apple HIG, Material, WCAG | Knöpfe 58–66 px, Kopfzeile 40 px |
| Leisten im Ruhezustand höchstens etwa ein Viertel der Höhe | Abgeleitet aus Karten-Apps und Nomad Sculpt | Gemessen: 22 % auf 412×892, 31 % auf 360×640, 19 % auf dem Tablet |
| Bottom-Sheet mit Höhenstufen und Griff, nur eines zur gleichen Zeit | Apple HIG Sheets, Google Maps | `KSheet`: klein und halb; Querformat als Seitenleiste |
| Höchstens 2 Ebenen schrittweise Offenlegung | NN/g | Ebene 1: 5 Schnellknöpfe bzw. Radialmenü; Ebene 2: Fächer im Steuerfeld |
| Radial- oder Markierungsmenü am Objekt, höchstens 8 Einträge, Hauptrichtungen für das Häufigste | Procreate QuickMenu, Kurtenbach/Buxton | `Radial`: 8 Einträge, oben Kneten, rechts Malen, unten Loop, links Effekte |
| Treffertest: auf dem Objekt bearbeiten, im Leeren Kamera; zwei Finger steuern immer die Kamera | Nomad Sculpt, Forger, Sketchfab | Zwei Finger zoomen, verschieben, drehen (auch auf Formen, sobald man kneift oder schiebt) |
| Semantischer Zoom (Ansichten als Zoomstufen) | Procreate Dreams, Sketchfab | Über die Grenze hinaus kneifen wechselt Form ↔ Alle ↔ Raum |
| Zwei Finger kurz antippen = Rückgängig | Procreate, Nomad, Forger | übernommen |
| Querformat/Tablet: Seitenpanel, die Leinwand behält mindestens 60 % | Recherche | Seitenleiste rechts (≤ 37 % Breite), Leinwand 62–67 % |

## 3. Bildschirmaufbau (Hochformat)
1. **Oben:**
   - Kopfzeile (Projekt, Stopp, Rückgängig, Stimmung, Vollbild, Menü).
   - Darunter links der Umschalter **Form · Alle · Raum**.
   - Die Formen-Kugeln stehen nur in der Ansicht „Form“; in „Alle“ und „Raum“ sieht man die Formen ohnehin.
2. **Leinwand:** etwa 70–80 % der Höhe.
3. **Steuerfeld (unten, über den Reitern):**
   - Kopfzeile: gewählte Form, Hinweis-Chips („Einzeln · alle hören“, „Loops ⏸“), **▴ Mehr**.
   - 5 Schnellknöpfe: Kneten · Malen · Melodie · Loop · Live.
   - **Hochwischen** oder **▴ Mehr** öffnet die Fächer **Klang · Drehen · Loops · Form · Extras** (Ebene 2). **Runterwischen** schließt sie.
   - Beim Kneten und Malen zeigt das Feld nur die passenden Knöpfe, die Farben und **✓ Fertig**.
4. **Reiter:** Klang · Stück · Beat · Schnitt · Bild.

## 4. Gesten je Ansicht
| Geste | Form | Alle | Raum |
|---|---|---|---|
| Tippen auf Form | spielen | spielen und wählen | spielen und wählen |
| 1 Finger ziehen auf Form | Melodie gleiten / schnell = anschubsen; mit Kneten/Malen formen | spielen | schnell = anschubsen, langsam = verschieben (Stereo/Nähe) |
| 1 Finger daneben | wischen = nächste Form | blättern/verschieben | Raum drehen |
| 2 Finger kneifen | zoomen | zoomen | zoomen (neu, vorher Ansichtswechsel) |
| 2 Finger schieben | – (die Form bleibt mittig) | verschieben | verschieben (neu) |
| 2 Finger drehen | – | – | Raum drehen (neu) |
| weiter zusammen als es geht | → Alle | → Raum | – |
| weiter auseinander als es geht | – | → Form (die Form unter den Fingern) | → Alle |
| Doppeltipp auf Form | – | → Form | → Form |
| Doppeltipp daneben | Blick zurück | Blick zurück | Blick zurück |
| Lange drücken / Namen antippen | – | Namen antippen → Radialmenü | lange drücken → Radialmenü |
| 2 Finger kurz tippen | Rückgängig | Rückgängig | Rückgängig |

Beim Hinausziehen erscheint „Loslassen → …“, so dass der Ansichtswechsel nie aus Versehen passiert. Oben rechts erscheint **„Ganze Ansicht“**, sobald gezoomt oder verschoben wurde.

## 5. „Alle“
- Die Formen werden so groß, wie die Breite erlaubt (höchstens 14 % kleiner).
- Bei vielen Formen wird senkrecht geblättert, statt alles zu verkleinern.
- Die Namen sind kleiner (30 px hoch), ohne Pfeil.

## 6. Querformat und Tablet
- Ab 640 px Breite im Querformat steht das Steuerfeld als Seitenleiste rechts und zeigt immer alle Fächer.
- Raster, Formnamen, Kugeln und Pfeile rücken in den freien Bereich links.
- Die Kamera ist versetzt, damit die Formen mittig bleiben.

## 7. Technik (für die Weiterarbeit)
- Module: `KSheet`, `Radial`, `Pinch`, `ZoomX`, `Orient`.
- Überschrieben bzw. erweitert:
  - `Input.gestMove` (Zoom/Pan/Drehen + Grenzwert `g.acc`)
  - `Input.move` (Umwandlung von Akkord zu Geste)
  - `Input.up` (Doppeltipp, Pinch-Ende, Rückgängig mit zwei Fingern)
  - `Scene.frame` (Zoom und Verschieben im Raum über `user.rx/rz`)
  - `Scene.grid`/`fitGoal`/`panBy`/`zoomBy`/`shiftView`/`insets`
  - `Layout.sync`
- Ausgeblendet, aber im DOM (die Tests laufen weiter): `#tools`, `#fbar`, `#dock`, `#fchips`, `#fctl`, `#mbar`, `#modebar`, `#palHint`.
- Prüfstand:
  - **MB**: Anteil der Leisten (Ziel ≤ 32 % der Höhe bzw. ≤ 40 % der Breite in der Seitenleiste).
  - Gesten-E2E: `e2e24.py`.
  - Layout: `audit_layout.py`.
- Testgrenze: Headless-Chromium rendert nur mit 2–20 Bildern/s, Gestentests sind dort zeitkritisch. Auf echten Geräten sind die Schwellen großzügiger.

## 8. Unabhängige Prüfung und Nachbesserung
Ein Prüf-Agent ohne Kenntnis der Umsetzung hat 4 Geräte­größen getestet. Die Befunde und die Nachbesserung:
- **Doppeltipp in Alle:** wird jetzt schon beim Aufsetzen erkannt, unabhängig von Note, Teller oder Name.
- **Raster in Alle:** wählt die Spaltenzahl so, dass alles hineinpasst. Würden die Formen dabei kleiner als ca. 90 px, wird stattdessen senkrecht geblättert (mit Hinweis).
- **Zwei Finger auf Tellern oder Formen:** Deutliches Kneifen wird immer zum Zoom. Zwei Finger auf Tellern: Zoom und Rückgängig-Tipp.
- **Querformat:**
  - Die Seitenleiste reicht von oben bis zu den Reitern, die Kopfzeile weicht nach links aus.
  - Die Reiter sind auf 44 px verkleinert, die Zeilen brechen um, der Titel steht mittig über der Leinwand.
- **Tippflächen auf mindestens 44 px angehoben:**
  - Fächer 40 px, Kopfzeile, Fertig und Chips 44 px.
  - Farben als 5×2-Raster mit 44 px.
  - Namen 36 px.
- **Kneten und Fächer:** Die Knet-Zeile bricht um. Die Fächer haben eine Mindesthöhe, damit die Reiter nicht springen.
- **Form-Ansicht:** Die anderen Formen sind deutlich blasser, es gibt keine „zwei Köpfe“ mehr. „Ganze Ansicht“ steht dort als Chip im Steuerfeld.
- **Radialmenü:**
  - Öffnet auch durch langes Drücken auf den Namen.
  - Bei drehender Form heißt ein Eintrag „Stopp“ statt „Kopie“.
- **Doppelte Einträge:** „Station“ steht nur noch unter Loops, Kopie hat ein eigenes Symbol.

## 9. Mögliche nächste Schritte
- Nutzungszähler, damit die Schnellknöpfe nach Häufigkeit sortiert werden (NN/g-Empfehlung).
- Doppeltipp in „Raum“ fliegt in 300 ms zur Form.
- Zoomen auf den Mittelpunkt zwischen den Fingern (Dolly).

## 10. Version 33: Querformat und kleine Höhen
Anlass: Im Claude-App-Fenster (Querformat, nur etwa 330 px hoch) blieb fast keine Leinwand übrig. Kopfzeile, Ansichtsumschalter, Seitenleiste und Reiter belegten zusammen fast alles.

| Regel | Umsetzung |
|---|---|
| Die Leinwand ist im Querformat der wichtigste Platz; die Höhe ist knapp, die Breite reichlich | Reiter wandern als 60-px-Leiste an den linken Rand (`body.kland`, ab Höhe ≤ 520 px) |
| Bedienelemente zu, solange man sie nicht braucht (Karten-Apps) | Steuerfeld zu = **eine Zeile unten** (Form, 5 Schnellknöpfe, Chips, ◂ Mehr); auf = Seitenfeld rechts; Standard im Querformat: zu |
| Ein Ort zum Schließen, der immer erreichbar ist | **✕ Zu** im Seitenfeld, und **Tippen auf die freie Leinwand** klappt zu (auch im Hochformat) |
| Kopfzeile nur mit Symbolen, wenn es eng wird | Projektname und Stimmungsname ausgeblendet; Form · Alle · Raum oben rechts nur als Symbole |
| Formnamen, Formen-Leiste und Hinweise nicht über der Form | im niedrigen Querformat ausgeblendet; „Neue Form“ steht dafür im Fach Extras, die Pfeile links/rechts bleiben |

Gemessen bei 700×330: Die Leinwand hat etwa 80 % der Höhe (vorher etwa 15 %); bei 844×390 sind es 83 %.

Weitere Regeln für v33:
- **Form-Ansicht = eine Form.** Andere Formen werden dort ausgeblendet und können nicht angetippt werden, damit nichts davor steht.
- **Hochformat:**
  - Das aufgeklappte Steuerfeld ist niedriger (höchstens 34 % der Höhe).
  - Die Schnellknöpfe sind dabei 48 px hoch.
  - Chips scrollen, statt abgeschnitten zu werden.
- **Bewegung sichtbar steuern:**
  - Kopfzeile: „Anhalten“, „Weiter“, „Alle (n)“.
  - Fach Drehen: Liste aller Formen mit Zustand und Auswahl.
  - Im Raum: antippen = anhalten, wie ein Kreisel unter dem Finger.

## 11. Version 34: Kreis-Menü als zweiter vollständiger Weg, Leiste optional
- **Rückmeldung:** Christian fand das Kreis-Menü gut. Er wollte es überall haben, mit allen Befehlen darin, dazu eine ausblendbare Leiste und eine eigene Einstellung für beides.
- **Zwei vollständige Wege:**
  - **Leiste:** schnell, immer an derselben Stelle.
  - **Kreis:** am Finger, ohne Blick nach unten.
  - Beide speisen sich aus demselben Befehlsverzeichnis. Was in der Leiste steht, steht auch im Kreis.
- **Kreis in drei Ebenen** (Markierungsmenü nach Kurtenbach/Buxton, höchstens 8 Einträge je Ring):
  1. 8 frei belegbare Lieblingsbefehle.
  2. „Alles“ mit den 7 Bereichen.
  3. Die Befehle eines Bereichs.
  - Die Mitte führt immer eine Ebene zurück. Ziehen und Loslassen funktioniert auf Ebene 1.
- **Öffnen:** in jeder Ansicht durch langes Drücken auf die Form. Im Raum war das schon so, in Form und Alle ist es neu. Wer lange Töne halten will, stellt das in den Einstellungen ab.
- **Arbeitsfläche maximal:** Die Leiste lässt sich wegklappen, die Reiter gehen standardmäßig mit. Übrig bleiben nur „▴ Leiste“ und der Kreis-Knopf ◉, beide schwebend.
- **Einstellungen statt fester Vorgaben:** Leistenknöpfe (1–6, Reihenfolge), Kreisplätze, Kreisgröße, Zeit für langes Drücken, Verhalten von Leiste, Reitern und Kreis-Knopf.

## 12. Version 35: Kreis für den Live-Einsatz
- Problem: Drei Tipps (Alles → Bereich → Befehl) sind beim Live-Mitschnitt zu langsam, und wechselnde Positionen verhindern Muskelgedächtnis.
- **Bereichsleiste:** Alle Bereiche liegen als Leiste am Rand, so ist jeder Befehl mit höchstens 2 Tipps erreichbar.
- **Feste Plätze:** Jeder Befehl hat in seinem Bereich immer denselben Platz (blass, wenn gerade nicht nutzbar). Das folgt dem Prinzip von Markierungsmenüs: Richtung merken statt lesen.
- **Live-Kreis:** Während einer Aufnahme ist der Kreis auf Spielen ausgerichtet: Loop, Drehen, Tempo der Form, Einzeln, Blenden, Loops anhalten, Live stoppen. Die Aufnahmezeit steht in der Mitte.
- **Robustheit:**
  - Der Kreis öffnet sich nicht bei mehreren Fingern.
  - Kein Seiten-Zoom durch Kneifen auf Bedienelementen.

## 13. Version 36: Spielen und Bearbeiten trennen
- **Problem:** Dieselbe Berührung bedeutete je nach Dauer „Ton halten“ oder „Menü öffnen“, und ein Doppeltipp wechselte die Ansicht. Beim Musizieren ist das ein Konflikt.
- **Lösung:** zwei Modi, wie Spiel- und Bearbeitungsmodus in Musik-Apps (Ableton Session/Arrange, Procreate Dreams Perform/Edit).
  - **Spielen:** Die Form ist ein Instrument, sonst nichts.
  - **Bearbeiten:** Gesten öffnen Werkzeuge.
- **Modifikator statt Zeit:** Im Spielmodus werden Werkzeuge mit einer zweiten Hand geöffnet. ◉ wird festgehalten (wie Shift), dann die Form angetippt. Das ist ein Quasimodus nach Raskin: Er ist nur aktiv, solange der Finger liegt, und kann darum nicht versehentlich ausgelöst werden.
- Sichtbarer Schalter im Steuerfeld, ◉ lange drücken wechselt ebenfalls. Standard ist Spielen.

## 14. Version 40: Bewegen als eigene Spielfläche (in v42 wieder entfernt – Sensoren sind in eingebetteten/heruntergeladenen Seiten gesperrt)
- **Warum ein eigener Bereich:** Bewegung ist eine zweite Hand. Das Handy selbst wird zum Instrument, die Finger bleiben frei für die Form (Multitouch läuft weiter).
- **Ein Kanal pro Geste** (Essl & Rohs; Ocarina): kontinuierliche Gesten (Neigen) steuern die Tonhöhe, Ruckbewegungen lösen aus (Schlagen), Drehen setzt die Form in Bewegung. Ruhige Haltung = Stille.
- **Musikalisch sicher:** Tonhöhen auf die Stufen der Form gerastet, Hysterese gegen Flattern, 1€-Filter gegen Zittern ohne spürbare Verzögerung, optional im Takt.
- **Sichtbar:** Neige-Leiste mit Ton und Seitenpunkt; Wellen auf der Form zeigen, wo man spielt. ⊙ Null jederzeit, ↕ Umkehren für Menschen, die die Richtung andersherum denken.
- **Ersatz statt Sackgasse:** Ohne Sensoren dasselbe Mapping mit dem Finger im Neige-Feld.
- **Markenbild:** Das Logo (Klangwolke) ist das Startbild; der Logo-Verlauf kennzeichnet aktive Schalter in Bewegen und die Stilwahl im Bild.

## 15. Version 42: Anhalten heißt anhalten · Dateiverwaltung als Liste
- **Erwartung:** ■ ist ein Versprechen. Was ich angehalten habe, bleibt still, bis ich es ausdrücklich wieder starte. Automatische Neustarts (eine Form anschubsen) dürfen nur das Angeschubste klingen lassen, nicht die Loops.
- **Meine Stücke:** eine Liste statt Kacheln und Knopfreihen. Eine Hauptaktion oben (＋ Neues Stück), Finden (Suche, Sortierung), Tippen öffnet, seltene Aktionen hinter „⋯“, Gefährliches mit Rückfrage, Sichern/Laden eingeklappt. Das geöffnete Stück steht immer oben und zeigt, ob es gespeichert ist.

## 16. Version 43: Schalter statt Gesten für Zustände
- **Prinzip:** Zustände (an/aus, dreht/steht, Loop an/aus, einzeln) gehören auf sichtbare Schalter mit Wort und Farbe – nicht auf Gesten, die im Spielmodus schon Töne bedeuten. Gesten bleiben fürs Spielen und Anschubsen.
- **Ein Ort:** Die Schalterzeile sitzt in jeder Ansicht an derselben Stelle (Muskelgedächtnis) und gilt für die gewählte Form; wählen = auf die Form tippen.
- **Überblick:** „Alle Formen“ zeigt alle Zustände auf einen Blick, wie ein Mischpult mit Sammelschaltern.

## 17. Version 44: Ein Ring statt vieler Kreise · Maus als vollwertige Eingabe
- **Ring (Kuchenmenü):** Gleich große Tortenstücke um die Mitte sind schneller zu treffen und zu lesen als kleine Kreise (Fitts: Richtung statt Ziel, Callahan u. a. 1988 – Kuchenmenüs schneller als Listen). Wort + Symbol in jedem Feld, abgedunkelter Hintergrund, höchstens 8 Felder pro Ebene, die Mitte sagt „wo bin ich“ und „zurück“.
- **Maus:** Rechtsklick = Kontextmenü (Erwartung am Rechner), Rad = Zoom (Erwartung in 3D-Programmen), Formveränderungen nur mit Werkzeug oder Modifikator, Hover zeigt Ziel und Erklärung.

## 18. Version 45: Set und Einsatz direkt an der Form
- **Ort der Handlung:** Der Set-Knopf sitzt dort, wo der Blick ist – an der Form (Namensschild), nicht in einem Menü. Ein Tipp öffnet ein kleines Feld mit allen Teilen der Form (ganze Form und jeder Loop).
- **Reihenfolge als Zahl:** Die Nummer ist sofort sichtbar und mit ▲▼ veränderbar – Live-tauglich, ohne Ziehen auf kleinen Flächen.
- **Musikalisch genau:** Stoppen sofort, Einsetzen immer zur Eins, im gewählten Abstand.
- **Aufnehmen ohne Umwege:** Mikro → Form in einem Tipp; Set-Aufnahme mit Vorhören, weil man das Ergebnis vor dem Behalten hören will.

## 19. Version 48: Ordnung durch Anordnung · Zustand im Namen · Raum ohne Schilder
- **Räumliche Ordnung statt Liste:** Die Reihenfolge (Set-Einsatz, Leiste, Weiterblättern) ist die sichtbare Anordnung in „Alle“, gelesen wie ein Text (oben → unten, links → rechts). Eine zweite, unsichtbare Reihenfolge (▲▼-Nummern) entfällt – was man sieht, ist was passiert (Direktmanipulation, Shneiderman).
- **Verschieben bewusst auslösen:** Doppeltipp/Doppelklick + Ziehen, damit einfaches Ziehen weiter die Lautstärke bleibt und ein Tipp weiter den Kreis öffnet (der Kreis wartet 330 ms auf einen möglichen zweiten Tipp). Geist-Schild und leuchtendes Ziel geben während des Ziehens Rückmeldung; ↶ macht es rückgängig.
- **Zustand dort, wo der Name steht:** ▶/⏸ direkt im Namensschild – sichtbar, sofort, ohne Blende. Blenden mit Dauer bleiben eine bewusste Entscheidung im Form-Regler.
- **Raum = Mischpult, nichts verdecken:** Statt Namensschildern kleine Farbpunkte am Fuß der Form (Name nur bei der gewählten Form). Der Punkt ist zugleich Griff (ziehen = verschieben) und Schalter (tippen = ▶/⏸) – die Form selbst bleibt fürs Spielen frei.
- **Neues Stück als Startentscheidung:** Stimmung, Tempo und Besetzung werden einmal am Anfang gewählt (wie ein Template in einer DAW) – danach bleibt alles änderbar.
- **Hilfe aufgabenorientiert:** „Ich will …“ oben (Aufgaben statt Funktionen), darunter Themen in Arbeitsreihenfolge; Suche bleibt.


## Nachtrag Version 55: Loopstation als eigener Bereich
- **Warum ein eigener Bereich:** Eine Loopstation wird mit großen Feldern im Daumenbereich bedient (wie Hardware-Looper: ein Fußtaster je Spur). Deshalb kein Blatt über den Formen, sondern ein Reiter **Loop** direkt neben **Klang** – sechs Reiter unten (Klang · Loop · Stück · Beat · Schnitt · Bild), im Querformat als Seitenleiste.
- **Ein Feld = eine Taste mit Zustand:** leer (gestrichelt) → Aufnahme (rot, blinkt) → läuft (Farbe der Spur, Fortschrittsbalken der Loop-Runde) → Overdub (rot) → läuft; gestoppt = blass. Die Zeile darunter erklärt immer, was der nächste Tipp tut. Lang drücken = leeren (mit Rückgängig), damit nichts versehentlich verloren geht.
- **Tempo aus dem ersten Loop:** wie bei Hardware-Loopern – wer frei beginnt, legt Tempo und Takt mit der Länge fest; danach läuft alles (Formen, Beat, weitere Spuren) in diesem Takt.
- **Formen-Passagen:** Aufnehmen, was die Formen spielen, ist eine Aufnahme „über die Schulter“: KLANGRAUM wechselt zu den Formen, oben steht eine rote Leiste zum Beenden, der Kreis bleibt beim langen Drücken zu.
- **Drehtempo:** statt fünf Sprüngen (× 2) ein Regler und kleine Schritte (× 1,12) – das Tempo lässt sich so fein wie ein Fader einstellen und bleibt trotzdem im Takt.
