# KLANGRAUM – Konzept „Studio für Laien“ (Version 67)

Erarbeitet am 13.11.2026 aus fünf Blickwinkeln: Entwicklung, Gestaltung, Ergonomie, Psychologie, Musik.
Auftrag (Christian): „Es muss leichter zu bedienen sein. Alle Funktionen müssen selbsterklärend und intuitiv sein. Auch für Nichtmusiker und Laien muss die Zusammenstellung von Songs und das Mischen von Tonspuren easy sein und Spaß machen. Neuartig, innovativ, perfekt zu bedienen für Laien – grafisch super hochwertig, optimiert für Smartphones und Tablets.“

## 1. Befund: Rundgang durch Version 66 als Laie (412 × 892)

| Stelle | Was ein Laie erlebt |
|---|---|
| Startbild | Ein langer Absatz mit Bediendetails („mit zwei und drei Fingern regelst du …“), aber kein Versprechen, was am Ende herauskommt. |
| Erster Bildschirm | Rund 30 Bedienelemente auf einmal: 6 Kopfknöpfe ohne Beschriftung, 3 Ansichten, Formen-Leiste, 6 Schalter, 7 Werkzeuge, 6 Bereiche. Zwei Beschriftungen laufen ineinander („Rückblick“/„Szenen“), eine ist abgeschnitten („kein L…“). |
| „▶ Spielen“ | Sieht aus wie ein Abspielknopf, ist aber ein Modus-Schalter. |
| Song bauen | Drei Orte mit ähnlicher Aufgabe und anderen Worten: Pult-Szenen, Stück → Song (Teile-Raster), Schnittraum. Der eigentliche Song-Baukasten liegt hinter dem Reiter „Stück“ und beginnt mit „Noch kein Song. Tippe ＋ Teil …“. |
| Mischen | Vier Orte: Regler unter „Stück“, Mischpult-Blatt hinter der letzten Kugel der Formen-Leiste, Lage im Raum, Lautstärke am Namensschild. |
| Beat | Beginnt mit einer Textwand; „Beat starten“ ist abgeschnitten. |
| Leeres Blatt | Nach dem Start steht man vor drei Formen ohne Aufgabe. Wer nicht weiß, was ein Loop ist, kommt nie zu einem Lied. |

Kern des Problems: Die App **kann** alles, aber sie führt nicht. Es fehlt ein Weg von „ich habe eine Idee“ zu „ich habe ein Lied, das ich verschicken kann“.

## 2. Leitlinien

| Blickwinkel | Regel | Umsetzung |
|---|---|---|
| Psychologie | **Erfolg in der ersten Minute** (Selbstwirksamkeit). Erst ein Ergebnis, dann die Werkzeuge. | „Song in 1 Minute“: ein Tipp auf einen Stil, und ein vollständiger Song spielt. |
| Psychologie | **Erkennen statt Erinnern**, höchstens eine Hauptaktion je Bildschirm (Hick: weniger Wahl = schnellere Entscheidung). | Startseite mit einem großen Knopf und sechs benannten Wegen statt 30 Symbolen. |
| Psychologie | **Fehler dürfen nichts kosten.** | Alles im Song und im Mix ist rückgängig zu machen (↶); „Was ist das?“ löst nichts aus. |
| Musik | **Nichts klingt falsch.** Alle erzeugten Töne liegen in der Tonart, Melodien ruhen auf Akkordtönen. | `SongGen`: Akkorde aus der Stimmung, Melodie mit Motiv – Wiederholung – Gegenmotiv – Schluss. |
| Musik | **Ein Song ist Abwechslung von Dichte**, nicht mehr Technik: Intro dünn, Refrain voll, Break leer. | Ablauf als Blöcke; je Teil wird nur geschaltet, wer mitspielt. |
| Musik | **Mischen ist: wie laut, wo, wie nah.** Mehr braucht ein Laie nicht. | Regler (laut), Bühne links/rechts (wo), vorn/hinten (nah, Hall). |
| Ergonomie | Tippflächen ≥ 44 px, Hauptaktionen im Daumenbereich, waagerechte Regler lassen senkrechtes Blättern zu. | Punkte 42–50 px hoch, ▶ 62 px, Regler mit `touch-action: pan-y`. |
| Ergonomie | **Ein Wort für eine Sache.** | Unten: Start · Spielen · Song · Mischen · Mehr. „Klang“ heißt jetzt „Spielen“. |
| Gestaltung | Farbe trägt Bedeutung: jeder Song-Teil und jede Rolle hat eine feste Farbe. | Intro blau, Strophe türkis, Refrain pink, Break gelb, Outro grau; Beat koralle, Bass violett, Akkorde blau, Begleitung türkis, Melodien gelb/rosa. |
| Gestaltung | Tiefe durch Glas, Verlauf und Licht; Bewegung nur als Rückmeldung (Pegel, Abspielstelle). | Verlaufs-Knöpfe, leuchtende Pegelstreifen, wandernde Abspielstelle; `prefers-reduced-motion` schaltet Animationen ab. |
| Entwicklung | Nichts doppelt bauen: die neue Oberfläche bedient die vorhandenen Module. | Song-Ansicht = neue Bedienung für `Song` (Teile, an/aus je Spur); Mischen = `fine.vol` + `mx.pan/hall`; Szenen im Pult werden mit angelegt. |

## 3. Der Weg

1. **Start** – „Was möchtest du heute machen?“ Ein großer Knopf *Song in 1 Minute*, sechs Kacheln (Melodie spielen, Klänge formen, Aufnehmen, Foto wird Musik, Live auflegen, Zusammen spielen), darunter „Dein Stück“ mit ▶, Song, Mischen, Meine Stücke.
2. **Song in 1 Minute** – zwölf Stil-Karten. Antippen erzeugt ein neues Stück: sechs Klänge (Beat, Bass, Akkorde, Begleitung, Melodie, Refrain-Melodie; Balladen und Ambient ohne Beat), je ein Loop von vier Takten, dazu der Ablauf Intro – Strophe – Refrain – Strophe – Refrain – Break – Refrain – Outro. Der Song spielt sofort.
3. **Song** – oben der Ablauf als farbige Blöcke, darunter „Wer spielt wann?“: je Instrument eine Zeile, je Teil ein Punkt. Leuchtet der Punkt, spielt das Instrument dort. Die Abspielstelle wandert durch Blöcke und Punkte.
4. **Mischen** – *Auto-Mix* (Ausgewogen, Druckvoll, Sanft, Weit), ein Regler je Klang mit Pegel, Stumm und „nur diesen“, die **Bühne** zum Aufstellen der Band.
5. **Aufnehmen und teilen** – ein Knopf unter dem Song: einmal von vorn bis hinten, als Audio-Datei, danach Teilen.

Wer mehr will, findet unter **Mehr** alles Bisherige (Pult, Beat-Maschine, Schnittraum, Foto wird Musik, Loops und Aufnahmen) und kann die alten Bereiche wieder dauerhaft in die Leiste holen.

## 4. Neu und eigen

- **Erklär-Modus „Was ist das?“**: Nach dem Einschalten erklärt jeder Tipp das Berührte in einem Satz, ohne es auszulösen (82 eigene Erklärungen, sonst die Beschriftung des Knopfs). Die Leiste weicht aus, wenn sie das Erklärte verdeckt. So ersetzt Neugier das Handbuch.
- **Bühne**: Mischen als Aufstellen. Links/rechts ist das Panorama, vorn ist nah und trocken, hinten weit weg mit Hall. Die Punkte pulsieren mit dem Pegel.
- **Würfeln mit Grenzen**: „Neu würfeln“ erfindet Rhythmen und Melodien neu, lässt aber Band, Lautstärken und Ablauf stehen – je Instrument oder für alle. Gleiche Zahl ergibt dasselbe Stück (prüfbar), eine neue Zahl ein anderes.
- **Song-Ende mit Anstand**: Mit 🔁 beginnt der Song nahtlos von vorn, ohne 🔁 hält er an. Vorher spielten nach dem letzten Teil alle Spuren auf einmal weiter.

## 5. Technik

- Module (in `src/v67.js`): `I67` (Symbole), `SongGen` (Stile, Muster, `build` rein rechnend, `fill` legt an, `reroll`), `SongUI` (Ansicht `#vSong`), `MixUI` (`#vMix`), `Home67` (`#vStart`), `Erkl`, `Nav67` (Leiste, Blatt „Mehr“).
- Daten im Stück: `d.sg67 = { style, seed, roles: { formId: rolle } }`, `d.sgNoLoop`. Ablauf in `d.song` (wie bisher), Mix in `fine.vol` und `mx`.
- `Song.onStep` ist umhüllt (Wiederholen bzw. Anhalten am Ende), `Visual.run` verträgt jetzt, dass ein Ereignis den Takt anhält, `Recs.add` benennt die Song-Aufnahme nach dem Stück.
- CSS-Klassen mit eigenen Vorsätzen (`hm…`, `sx…`, `mx…`, `mr…`, Zustände `q7…`), weil `sgh`, `sgr`, `sgc`, `cur`, `on`, `live` usw. schon vergeben sind.
- Prüfungen: SG (12 Stile, jeder Ton in der Tonart, wiederholbar), SF (Pop-Song anlegen, würfeln, Auto-Mix, speichern), SN (Bereiche), SE (Erklär-Modus), SW (Song-Ende).

## 6. Offen

- Der Klang der erzeugten Songs ist gemessen (keine Übersteuerung, Pegel, Bassanteil), aber nicht gehört. Rückmeldung je Stil ist nötig.
- Der Bereich „Spielen“ selbst ist noch dicht belegt (Schalterzeile, sieben Werkzeuge). Nächster Schritt wäre eine reduzierte Leiste für Einsteiger.
- Gesang zum Song und eigene Loops in den Ablauf zu bringen, geht über „Spielen“ und „Mehr“, ist aber noch kein geführter Schritt.

## 7. Version 68: Einspielen ohne Aufnahmeknopf

- **Problem:** Aufnehmen ist für Laien eine Prüfung (Knopf, Länge, Einzählen, Einsatz treffen, stoppen). Wer sie nicht besteht, hat keinen Loop – und hält die App für kaputt.
- **Ansatz:** Die Aufnahme abschaffen. Der Loop läuft immer, und was man spielt, bleibt (Dauerschleife wie bei einem Loop-Pedal im Overdub, aber ohne Pedal). Fehler kosten nichts: „Letzte Runde“ nimmt sie zurück.
- **Gerade rücken als Standard:** „grob“ verzeiht bis zu einem Viertelschlag. Das Ergebnis klingt nach Musik, bevor man Timing gelernt hat (Selbstwirksamkeit).
- **Sehen, was bleibt:** Jeder Ton erscheint sofort als farbiger Punkt im Band; die Abspiellinie zeigt, wo die Runde steht; vier Schlag-Punkte zählen mit.
- **Ein Ort für die Lautstärke, an dem man hinsieht:** der Regler steht in der Song-Zeile, nicht nur im Bereich Mischen.
- **Weniger auf einmal:** Der Bereich Spielen zeigt vier Knöpfe statt siebzehn; „▴ Mehr“ und die Profi-Ansicht holen alles zurück (schrittweise Offenlegung).
- **Offen:** Mikrofon-Loops haben noch die alte Bedienung (Loopstation). Die Verzögerung echter Geräte beim Gerade-Rücken ist ungemessen.
