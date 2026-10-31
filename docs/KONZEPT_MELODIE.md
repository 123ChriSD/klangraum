# KLANGRAUM – Melodien und Lieder gezielt spielen (ohne Noten)

Stand: Version 65 (31.10.2026). Christian: „Im Moment werden die Stücke spielerisch erzeugt, ohne dass sie reproduzierbar oder planbar sind. Das ist gut und gewollt. Welche Wege siehst du, um das gezielte Spielen wirklicher Melodien und Lieder zu ermöglichen? Menschen ohne Notenverständnis sollen einfach Melodien und Lieder auf unterschiedlichen Instrumenten einspielen und in Loops laufen lassen können.“

## Grundsätze
- **Keine falschen Töne:** Alles, was gespielt wird, liegt in der Tonart der Stimmung (wie bisher beim Drehen).
- **Farbe = Tonstufe:** Jede Stufe hat ihre Farbe (1 rot, 2 orange, 3 gelb, 4 grün, 5 türkis, 6 blau, 7 violett). Dieselbe Farbe heißt derselbe Ton, auch eine Oktave höher. Diese Farben gelten in Tasten, Lernzeile und später im Raster.
- **Ziffern statt Noten:** 1 2 3 … (wahlweise Do Re Mi oder C D E). Lieder lassen sich so aufschreiben und weitergeben („1 2 3 4 5 5 · 6 6 6 6 5“).
- **Alles bleibt veränderbar:** Eine gespielte Melodie wird ein Ton-Loop der Form. Kneten und Instrumentwechsel verändern den Klang, der Loop-Editor die Töne.
- **Spielerisch und gezielt nebeneinander:** Drehen, Kneten und Raum bleiben, wie sie sind. Die Tasten sind ein zusätzlicher Weg.

## Die Wege (✔ = in v65 umgesetzt)
1. ✔ **Tasten in der Tonart** – zwei Reihen mit 8 farbigen Tasten, die obere eine Oktave höher (in Querformat eine Reihe mit 15). Wischen spielt Läufe, weiter unten auf der Taste ist lauter. Das Instrument wird oben gewählt: jede Form, auch eine geknetete.
2. ✔ **Akkord-Knöpfe** (I IV V VI II III, mit Namen wie C, F, G, Am). Gedrückt halten lässt den Akkord klingen, und alle drehenden Formen folgen ihm.
3. ✔ **Melodie aufnehmen** – Länge wählen, Einzählen, spielen. Die Melodie wird ein Loop der Form.
4. ✔ **Lieder-Bibliothek** (gemeinfrei: Alle meine Entchen, Hänschen klein, Bruder Jakob, Ode an die Freude, Morgen kommt der Weihnachtsmann, Jingle Bells, Kanon in D):
   - ▶ **Vorspielen**: die Tasten leuchten mit.
   - **Nachspielen**: zeigt Ton für Ton die nächste Taste, ohne Zeitdruck.
   - **Als Loop**: legt das Lied fertig auf die Form, auf Wunsch mit Begleit-Akkorden als eigene Form.
5. ✔ **Lied-Akkorde** – solange ein Lied gewählt ist, folgen alle Formen seiner Akkordfolge statt der der Stimmung. Damit passen Beat, Bass, Flächen und das Lied zusammen. Gespeichert im Stück als `d.lied`.
6. ☐ **Mitspielen im Takt** – Töne fallen auf die Tasten zu (wie bei Rhythmus-Spielen), mit „gut/zu früh/zu spät“. Langsam-Modus mit 50 % Tempo.
7. ☐ **Farb-Raster** (wie ein Song-Maker) – Spalten sind Schläge, Zeilen die farbigen Tonstufen. Tippen setzt einen Ton. Das ist die planbare Ansicht des Loop-Editors, groß und farbig, direkt im Tasten-Blatt.
8. ☐ **Vorsingen oder Summen → Melodie** – Mikrofon, Tonhöhe erkennen, auf Tonart und Schläge einrasten, als Loop auf ein beliebiges Instrument legen.
9. ☐ **Eigene Lieder** – gespielte oder gesummte Melodien als Lied speichern, mit Ziffern-Schreibweise teilen und importieren („1 1 5 5 6 6 5-“).
10. ☐ **Song-Bausteine** – Akkordfolgen-Vorlagen (Pop 1-5-6-4, Moll-Ballade, Techno-Ostinato) und Teile (Strophe/Refrain) mit den Pult-Szenen verbunden. So entsteht ein ganzer Song in fester Reihenfolge.

## Technik (v65)
- `Lieder.L`: `{ id, n, d, bpm, prog[Takt], m: [[Stufe, Länge in 16teln], …] }`. `Lieder.notes(s)` liefert die Tasten (verschoben um +7, wenn Stufen unter 0 liegen).
- `KeysUI`: das Blatt „Melodie“ (bleibt offen, `sticky`). Tasten spielen über `Forms.play(f, u, vel, { midi })`, damit nehmen `Loops.capture`, Kneten und Instrument automatisch teil.
- `Lied`: Überschreibt `Transport.chordDeg`/`chordAtStep` mit der Akkordfolge des Lieds. Ton-Loops dürfen jetzt bis 16 Takte lang sein (für ganze Lieder).
