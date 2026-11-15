# KLANGRAUM – Konzept neues Bediensystem („Drei Punkte“) · Entwurf zur Bestätigung

> Stand 15.11.2026 · Grundlage: Version 77 · **noch nichts umgesetzt.** Umsetzung erst, wenn Christian Konzept und Bewertungskatalog bestätigt hat.

## 1. Auftrag (Christian, 15.11.)

Oberfläche einfach und übersichtlich · alle Funktionen schnell erreichbar, auch beim Spielen · keine mehreren Klickebenen · am Smartphone perfekt · Trennung in allgemeine Funktionen (Speichern, Laden, Neu …) und Spiel-Funktionen · neuartiges Bediensystem · Führung ohne zusätzliche Erklärungen · maximale Fläche zum Musizieren · Bewertungskatalog, bestätigen lassen, Arbeit dagegen prüfen.

## 2. Ist-Zustand Version 77 (gemessen, Telefon 393 × 780, Bereich „Spielen“)

| Messgröße | Form-Ansicht | Alle-Ansicht |
|---|---|---|
| Freie Spielfläche | **48 %** | **47 %** |
| Gleichzeitig sichtbare Knöpfe | **43** | 42 |
| Knöpfe kleiner als 44 px | 5 | 8 |
| Größte Flächenfresser | Bedienblatt unten 25 %, Reiter 8 %, Formenleiste 5 %, Kopfleiste 4 %, Ansicht 4 % | Bedienblatt 31 %, Reiter 8 % |

Fünf Schichten Bedienung liegen übereinander: Kopfleiste (7 Knöpfe) · Ansicht + Formenleiste · Zeile Start/Ausklang/Melodie · Bedienblatt (2 Reihen, 13 Knöpfe) · 5 Reiter. Dazu schwebend: Dreh-Knopf, Tasten-Knopf, Pfeile links/rechts.
Dopplungen: „Neu“ 2×, Start/Stopp 3×, Name der Form 3×. Rund 50 Befehle in 9 Gruppen, dazu etwa 15 Blätter.

## 3. Prüfung der jetzigen Variante aus fünf Blickwinkeln

**Gestaltung**
- Kein Blickzentrum: Die Form ist der Inhalt, bekommt aber weniger als die Hälfte des Bildes.
- Jede Version hat ein eigenes Element dazugestellt; es gibt kein gemeinsames Raster und keine feste Regel, was wo wohnt.
- Gleiches sieht verschieden aus (drei Start-Knöpfe in drei Formen).

**Programmierung**
- 77 Module als Hüllen übereinander; jedes schwebende Element rechnet seine Lage selbst → Kollisionen (zuletzt Dreh-Leiste).
- Es gibt bereits ein Befehlsverzeichnis (`Cmd.GROUPS`, „Alles auf einen Blick“). Das wird die **eine Quelle** für die neue Oberfläche – jede Funktion genau einmal eingetragen.
- Risiko begrenzen: neue Hülle als eigenes Modul über der alten; alte Oberfläche bleibt per Schalter erreichbar („Klassisch“), bis die neue bestätigt ist.

**Psychologie**
- 43 Wahlmöglichkeiten auf einmal: Entscheidungszeit steigt mit jeder weiteren (Hick). Ziel: höchstens 7 ständig sichtbare.
- Zustände sind schwer zu erkennen (bin ich in Tasten, Kneten, Malen?). Der Zustand muss am selben Ort stehen, an dem man ihn ändert.
- Führung über Erklärtexte und Meldungen funktioniert nicht bei Kindern; besser: **ein** leuchtender nächster Schritt, Unpassendes gar nicht zeigen.
- Wiedererkennen statt Erinnern: Symbol **und** Wort, immer am selben Platz.

**Ergonomie**
- Kopfleiste und Formenleiste liegen außerhalb der Daumenzone; einhändig auf einem großen Telefon nicht erreichbar.
- Ziele unter 44 px, Abstände teils unter 8 px.
- Unterer Rand: Android-Wischleiste braucht 16–24 px Abstand.
- Links- und Rechtshänder: Wichtiges muss von beiden Daumen aus gehen.

**Musik**
- Beim Spielen liegen die Hände auf der Bühne. Blind erreichbar sein müssen: Start/Stopp, Loop aufnehmen, Stumm/Einzeln, Tempo, nächste Form.
- Nichts darf die Musik anhalten oder die Form verdecken, die gerade klingt.
- Der Takt soll sichtbar sein, ohne Platz zu kosten.
- Arbeitsfluss: spielen → aufnehmen → schichten → ordnen → mischen → sichern. Die Oberfläche soll diesem Weg folgen.

## 4. Das neue Bediensystem: „Drei Punkte“

**Grundsatz:** Der ganze Bildschirm ist Bühne. Bedienung sitzt nur in **drei runden Punkten am unteren Rand** – dort, wo die Daumen sind. Jeder Punkt öffnet **eine Tafel**, auf der alles zu seinem Thema gleichzeitig sichtbar ist. Es gibt keine Menüs in Menüs.

```
┌───────────────────────────────┐
│ ● ● ○ ○   (Formen, klein)     │  ← Formen-Punkte, blenden beim Spielen aus
│                               │
│                               │
│          B Ü H N E            │  ← alles frei zum Spielen
│        (Formen, 3D)           │
│                               │
│                               │
│  (Stück)    (▶ Takt)   (Form) │  ← drei Punkte, je 56 px
└───────────────────────────────┘
```

### 4.1 Die drei Punkte = die Trennung der Funktionen

| Punkt | Wofür | Inhalt der Tafel (alles auf einmal sichtbar) |
|---|---|---|
| **Stück** (links, Haus) | Allgemeines, Verwalten | Neu · Öffnen · Gespeichert-Anzeige/Sichern · Aufnahmen · Teilen/Einladen · Rückgängig · Einstellungen · Hilfe |
| **Musik** (Mitte, Start/Stopp mit Takt-Ring) | Das ganze Stück | Tippen = Start/Stopp. Tafel: Aufnahme · Song bauen · Szenen · Mischen · Live-Fläche · Ausklang · Tempo · Stimmung · Ansicht (Form/Alle/Raum) |
| **Form** (rechts, Kugel in der Farbe der gewählten Form) | Die gewählte Form | Spielart (Tasten · Noten · Kneten · Malen) · Klang · Melodie · Lautstärke · Stumm · Einzeln · Drehen (Stopp, Tempo, Richtung) · Loop (aufnehmen, Rückblick, löschen) · Neue Form · Kopie · Löschen |

Jede Funktion steht an **genau einem** Ort. Die fünf Reiter, die Kopfleiste, das Bedienblatt und die schwebenden Knöpfe entfallen.

### 4.2 Eine Ebene – so wird jede Funktion erreicht

- **Punkt antippen → Tafel → Knopf.** Höchstens zwei Tipps bis zu jeder Funktion.
- **Punkt drücken, zum Knopf ziehen, loslassen** = dasselbe in einer einzigen Bewegung (für Geübte, ohne hinzusehen).
- **Werte stellt man auf der Tafel selbst** (Lautstärke, Tempo, Stimmung: Schieber bzw. Knopf halten und ziehen). Kein Unterdialog.
- Braucht eine Funktion von Natur aus eine Fläche (Klang aussuchen, Stück öffnen, Mischen, Song), öffnet der Knopf direkt dieses **Blatt** – das ist das Ziel, keine weitere Menüebene.
- Tafeln sind durchscheinend, höchstens 45 % hoch, die Musik läuft weiter, die Bühne darüber bleibt spielbar. Tipp daneben schließt.

### 4.3 Beim Spielen: ohne Tafel

| Häufige Handlung | Wie |
|---|---|
| Start/Stopp | Punkt Mitte tippen |
| Loop aufnehmen | Punkt Mitte lange drücken |
| Tempo der Form | Punkt Form hoch/runter ziehen (wie Dreh-Knopf v77) oder zwei Finger drehen |
| Form anhalten / alle anhalten | zwei / drei Finger neben die Formen tippen (v77) |
| Nächste Form | Punkt Form seitlich wischen oder Form antippen |
| Stumm / Einzeln | Punkt Form: nach unten-außen / oben-außen ziehen (zwei feste Richtungen) |
| Rückgängig | Punkt Stück kurz nach oben ziehen |
| Ansicht | zwei Finger zusammen/auseinander (wie bisher) |

**Ruhe beim Spielen:** Solange Finger auf der Bühne spielen, werden die drei Punkte blass und die Formen-Punkte oben verschwinden. Hört man auf, sind sie wieder da.

### 4.4 Führung ohne Erklärung

- **Ein nächster Schritt leuchtet.** Je nach Zustand pulsiert genau ein Punkt, und auf seiner Tafel ist genau ein Knopf hervorgehoben:
  leer → „Neu“ · Stück ohne Ton → Form antippen · es klingt → „Loop aufnehmen“ · ein Loop → „Neue Form“ · mehrere Formen → „Song bauen“/„Mischen“ · fertig → „Aufnahme“ · Aufnahme da → „Sichern/Teilen“.
- **Was noch keinen Sinn hat, ist nicht da** (nicht grau, sondern weg): Mischen erst ab zwei Formen, Loop-Werkzeuge erst mit Loop, Ausklang erst wenn es läuft.
- **Symbol + ein Wort**, höchstens zwei Wörter. Keine Meldungen nötig, um den Hauptweg zu gehen.
- **Zustand am Punkt:** Der Form-Punkt zeigt Farbe, Spielart-Symbol und Tempo; der Mitte-Punkt Takt und Aufnahme; der Stück-Punkt „gesichert“/„ungesichert“.
- Erster Ton spätestens nach zwei Tipps ab Start.

### 4.5 Smartphone, Tablet, Rechner

- Punkte 56 px, 20 px über dem unteren Rand (plus sichere Zone), alle Tafel-Knöpfe mindestens 48 px mit 8 px Abstand.
- Tafeln wachsen aus ihrem Punkt; Links/Rechts tauschbar für Linkshänder.
- Querformat: Punkte wandern an den rechten/linken Rand in Daumenhöhe.
- Tablet/Rechner: Tafel bleibt auf Wunsch offen angedockt; Tastatur und Maus gleichwertig (Punkte = Tasten 1, Leertaste, 3).

### 4.6 Umsetzung in zwei Schritten

1. **Version 78 – Hülle:** die drei Punkte, die drei Tafeln aus dem Befehlsverzeichnis, Blätter direkt als Ziel, Ruhe beim Spielen, alte Leisten ausgeblendet (Schalter „Klassisch“ bleibt). Messung gegen den Katalog.
2. **Version 79 – Führung und Feinschliff:** nächster Schritt, Ausblenden von Unpassendem, Zieh-Gesten an den Punkten, Linkshänder, Querformat, Rechner.

## 5. Bewertungskatalog (100 Punkte) – zur Bestätigung

Bestanden: **mindestens 85 Punkte** und in A und B kein Kriterium mit 0. „Auto“ = wird von mir im Testbrowser gemessen; „Gerät“ = Christian prüft am Telefon.

| Nr. | Kriterium | Messung | Punkte |
|---|---|---|---|
| **A** | **Fläche zum Musizieren** | | **20** |
| A1 | Freie Bühne beim Spielen ≥ 85 % (393 × 780; heute 48 %) | Auto | 10 |
| A2 | Mit offener Tafel ≥ 50 % frei, gewählte Form bleibt spielbar | Auto | 5 |
| A3 | Kein Bedienelement liegt über der gewählten Form; Querformat ≥ 80 % frei | Auto | 5 |
| **B** | **Erreichbarkeit** | | **25** |
| B1 | Jede Funktion aus dem Spiel heraus in höchstens 2 Tipps | Auto (Verzeichnis) | 10 |
| B2 | Die 8 häufigsten (Start/Stopp, Loop aufnehmen, Stumm, Einzeln, Tempo, Lautstärke, nächste Form, Rückgängig) in 1 Tipp oder 1 Geste | Auto + Gerät | 8 |
| B3 | Keine Menüs in Menüs: jede Tafel hat genau eine Ebene | Auto | 4 |
| B4 | Tafeln und Blätter halten die Musik nie an | Auto | 3 |
| **C** | **Ordnung** | | **15** |
| C1 | Trennung Stück / Musik / Form; jede Funktion an genau einem Ort | Auto | 6 |
| C2 | Nichts doppelt auf dem Bildschirm | Auto | 4 |
| C3 | Höchstens 7 ständig sichtbare Bedienelemente beim Spielen (heute 43) | Auto | 5 |
| **D** | **Smartphone-Ergonomie** | | **15** |
| D1 | Alle Ziele ≥ 48 px, Abstand ≥ 8 px | Auto | 5 |
| D2 | Alles Ständige in der Daumenzone (untere 40 %), einhändig links wie rechts | Auto + Gerät | 5 |
| D3 | Keine Überlappung bei 360 × 640, 393 × 780, 412 × 892, 700 × 330, 820 × 1180 | Auto | 5 |
| **E** | **Führung ohne Erklärung** | | **15** |
| E1 | In jedem Zustand genau ein hervorgehobener nächster Schritt | Auto | 5 |
| E2 | Erster Ton nach höchstens 2 Tipps; Hauptweg ohne Meldungen; Beschriftung Symbol + höchstens 2 Wörter | Auto + Gerät | 5 |
| E3 | Unpassendes ist ausgeblendet; leere Zustände zeigen genau eine Handlung | Auto | 5 |
| **F** | **Sicherheit des Umbaus** | | **10** |
| F1 | Keine Funktion geht verloren: Prüfstand ohne Rückschritt, jede bisherige Funktion bleibt erreichbar | Auto | 5 |
| F2 | Zurück jederzeit: Schalter „Klassisch“ und `vorige/` | Auto | 2 |
| F3 | Mit Maus und Tastatur gleichwertig bedienbar | Auto | 3 |

## 6. Offene Entscheidungen für Christian

1. Katalog so bestätigen – oder Gewichte/Kriterien ändern?
2. Bediensystem „Drei Punkte“ so umsetzen?
3. Umsetzung in zwei Schritten (v78 Hülle, v79 Führung) oder alles in einer Version?
