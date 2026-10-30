# KLANGRAUM – Team-Konzept „Pult“ (Version 63, 30.10.2026)

**Auftrag (Christian, 30.10.):** Auf dem Handy mit vielen Formen schlecht bedienbar; Loop-Steuerung, Einsetzen und Stoppen nicht intuitiv. Ziel: Jeder Laie soll gute elektronische Tracks mischen, aufnehmen und live spielen können. Dazu harte, tiefe Bassbeats.

**Befund am Bildschirmfoto (Querformat, 9 Formen, Ansicht „Alle“):** Namen, ▶/⏸, Kreis-Knöpfe und Formen überlagern sich; die Ziele sind klein, man trifft daneben. Starten/Stoppen wirkt sofort und damit oft neben dem Takt. Es gibt drei Arten von „Loop“ (Ton-Loop, Loopstation, Audiospur) – für Laien nicht unterscheidbar.

## Die Sicht der Rollen
| Rolle | Kernaussage | Entscheidung |
|---|---|---|
| **Musiker / DJ** | Live wird nicht „gedrückt“, sondern **eingesetzt**: alles startet und stoppt auf der Eins des nächsten Takts. Dann klingt nie etwas schief – das ist das Geheimnis von Ableton Live und Launchpad. | Einsatz auf der Eins ist Standard (umschaltbar auf „sofort“). Wartende Felder blinken. |
| **Musiker / Produzent** | Die drei Live-Griffe, die jeder Track braucht: **Filter** (Spannung aufbauen), **Break** (alles raus außer Beat – dann der Drop), **Echo-Wurf**. Und ein Knopf, der den ganzen Track mitschneidet. | Filter-Schieber, Break und Echo zum Halten, ● Mitschnitt. |
| **Apple-Design (HIG)** | Eine Aufgabe, ein Ort. Große Ziele (≥ 44 pt), klare Zustände (aus · läuft · wartet), keine Überlagerung. Gesten nur mit sichtbarem Gegenstück. | Eigener Bereich **Pult** (statt „Loop“): Raster großer Felder, eine Form = ein Feld, Text sagt den Zustand. |
| **Webdesign** | Raster statt 3D für die Bedienung: skaliert von 3 bis 30 Formen, Hoch- wie Querformat, kein Verdecken. 3D bleibt zum Formen, Drehen und Mischen im Raum. | `auto-fill`-Raster (104–124 px), zwei Zeilen Name, Typ-Zeichen 🥁 〰 ⚡ 🎹 🎤 🔁. |
| **Künstler** | Der Raum soll leben: Felder leuchten in der Farbe ihrer Form und pulsieren mit dem Schlag; das Pult ist das Instrument, nicht ein Formular. | Leuchtrand in Formfarbe, Pegel steigt im Feld, Schlag-Puls, Verlauf aus dem Logo. |
| **Programmierung** | Keine neue Klanglogik – das Pult steuert die vorhandenen Bausteine (Fade, Motion, Loopstation, Solo). Einsätze werden im Taktgeber auf Schritt 0 jedes Takts ausgeführt. | `Pult.q` (geplante Einsätze), `Transport.onStep` → `Pult.onBar()`, Master-Filter hinter `Engine.out` (auch im Mitschnitt). |

## Bedienung (für Laien in einem Satz)
**Feld tippen = an/aus auf der nächsten Eins · Feld halten = nur das hören · Schieber = Filter · Break halten = nur Beats.**

## Neue Klänge: harte Bassbeats
Hardstyle-Beat (verzerrte Kick mit Schweif, Riesen-Clap, Metall-Hat, Sub-Drop) · 808-Trap-Beat (1,4 s lange 808, Trap-Snare, schnelle Hats, 808-Rutscher) · Bass-Drop-Beat (Kick + Sub, Clap, Hat, Reese-Schlag) · Drum'n'Bass-Beat. Startvorlage „Harter Bassbeat“ (Hardstyle-Beat, Rumble-Bass, Hardstyle-Lead, 808-Trap-Beat).

## Nächste Schritte (vorgeschlagen)
_Alle vier in v64 umgesetzt._
1. Szenen im Pult (eine Zeile = ein Teil des Songs, mit einem Tipp umschalten).
2. Ansicht „Alle“ im Querformat entzerren (Namen nur bei der gewählten Form, wie im Raum).
3. Ton-Loop und Loopstation-Spur zusammenführen (ein „Loop“-Begriff).
4. Drop-Knopf: 1 Takt Stille + Sub-Drop, dann alles auf der Eins.
