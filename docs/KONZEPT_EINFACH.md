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

## 8. Version 69: Ein Zuhause, das immer erreichbar ist

- **Problem:** Wer sich verläuft, braucht einen Punkt, an dem er neu anfangen kann. Die Startseite war dieser Punkt, aber aus Blättern, dem Einspielen und dem Vollbild nicht erreichbar; die Zurück-Taste führte woandershin.
- **Regel:** Der Haus-Knopf steht immer an derselben Stelle (oben links) und in jeder Ebene, die die Kopfzeile verdeckt. Er schließt alles und ändert nichts an der Musik (kein Verlust, also keine Rückfrage).
- **Zurück-Taste = eine Ebene zu:** wie in jeder Handy-App. Die letzte Ebene ist die Startseite.
- **Namen statt Rätsel:** Kopfknöpfe tragen in der einfachen Ansicht ihr Wort. „Dein Weg“ zeigt die vier Schritte zum fertigen Lied als Zahlenreihe, statt sie in sieben gleichwertigen Kacheln zu verstecken.

## 9. Version 70: Lesen, Formen, Wucht

- **Auftrag:** krasseste, coolste, innovativste Musik-App – simpel, fesselnd, faszinierend; innovative Steuerung, fette Sounds, neues Notensystem.
- **Notensystem ohne Vorwissen (Klangschrift):** Klassische Noten verlangen Schlüssel, Vorzeichen und Notenwerte. Die Klangschrift braucht drei Regeln: Farbe/Zahl = welcher Ton, Länge = wie lang, Höhe = wie hoch. Die Farben sind dieselben wie auf den bunten Tasten – was man gespielt hat, erkennt man wieder. Weil die Zeilen die Tonleiter sind, klingt kein gesetzter Ton falsch; helle Zeilen zeigen, was zum Akkord passt (Hilfe statt Regelwerk).
- **Schreiben wie Malen:** tippen, ziehen, tippen. Keine Werkzeugwahl, kein Modus. Jeder gesetzte Ton klingt sofort (Rückmeldung in unter 100 ms).
- **Steuerung mit einer Geste (Live-Fläche):** Zwei Dinge, die jeder hört, liegen auf zwei Richtungen: wie viel Band (hoch/runter) und wie hell (links/rechts). Der Finger macht aus einem fertigen Song ein Instrument – Aufbau, Break und Einsatz entstehen ohne Wissen über Arrangement. „Stille“ und „Echo“ sind Haltetasten, weil Loslassen der musikalische Moment ist.
- **Faszination:** Das Bild der Live-Fläche antwortet auf jede Stimme (Strahlenkranz) und auf den Takt (Ringe). Es zeigt nichts, was man lesen muss.
- **Fett heißt ausgewogen laut:** Die Messung zeigte, dass „mehr Bass“ den Klang kleiner macht, weil der Begrenzer alles andere wegdrückt. Wucht arbeitet deshalb mit Fundament, Präsenz, Sättigung und Verdichtung statt nur mit Tiefbass.
- **Offen:** Mehrfinger-Gesten auf der Live-Fläche; Wechsel auf den Takt genau; Lautstärke je Ton in der Klangschrift; Klangschrift als Bild zum Teilen.

## 10. Version 71: Hände statt Werkzeuge

- **Auftrag:** kinderleicht; Melodien und Klänge mit mehreren Fingern modellieren.
- **Kinder nehmen die ganze Hand.** Eine Oberfläche, die nur einen Finger versteht, wirkt kaputt, sobald ein zweiter aufliegt. Deshalb gilt in Klangschrift und Kneten: Jeder Finger tut dasselbe wie der erste.
- **Anfassen statt Auswählen:** Ein Ton in der Klangschrift ist ein Ding, das man schiebt. Es gibt keinen Auswahl- oder Verschiebe-Modus; die Stelle des Griffs entscheidet (Mitte = schieben, rechtes Ende = Länge).
- **Jede Handlung klingt:** Kneten ohne Ton ist Bildhauerei, mit Ton ist es ein Instrument. Der Ton kommt sofort beim Aufsetzen und wiederholt sich beim Weiterkneten – Ursache und Wirkung liegen unter 0,3 s auseinander.
- **Ein Wort, eine Kachel:** „Klang kneten“ sagt, was man tut, und führt ohne Umweg dorthin.
- **Offen:** Zoomen der Klangschrift mit zwei Fingern; Kneten auf der Rückseite der Form; eine geführte Demo beim ersten Öffnen.

## 11. Version 72: Der Körper spielt mit, nichts geht verloren, nichts hält an

- **Bewegung als Ausdruck, nicht als Menü:** Kippen und Schütteln sind Gesten, die jeder ohne Erklärung ausprobiert. Drei Zuordnungen, die man hört und versteht: Seite = Klangfarbe, vor = Echo, Ruck = Stotter. Zuschaltbar, weil ein Gerät in der Hand sonst ungewollt den Klang verstellt; die Mitte ist die Haltung beim Einschalten, damit man sitzen, stehen oder liegen kann.
- **Mehr Finger = mehr Ausdruck, dieselbe Regel:** Auf der Live-Fläche hat jeder weitere Finger genau eine Aufgabe (Echo, Stille). Wer nur einen Finger nutzt, verliert nichts.
- **Musik hält nie an, nur weil man etwas anderes tun will:** Ein Wechsel des Bereichs ist kein Abbruch. Die Leiste Tasten · Noten · Kneten · Live zeigt die vier Arten des Veränderns als gleichwertige Wege durch dasselbe laufende Stück.
- **Nichts geht verloren:** Laien drücken nicht „Aufnahme“, bevor etwas Gutes passiert. Der Mitschnitt läuft deshalb immer, und KLANGRAUM fragt erst im Nachhinein – am natürlichen Ende, dem Wechsel des Stücks.
- **Offen:** Bewegung auf einzelne Klänge statt auf alles; weitere Gesten (Drehen um die Hochachse); Mitschnitt auch beim Schließen sichern.

## 12. Version 73: Eine Idee zuerst, genaue Hände, ein Ort für alles

- **Die eigene Idee steht am Anfang:** Wer eine Melodie im Kopf hat, will sie nicht Form für Form eintragen. Das Blatt „Neues Stück“ fragt deshalb wahlweise danach – und alle Formen beginnen damit. Aus „drei Instrumente spielen irgendwas“ wird „meine Melodie, dreimal“. Von dort aus verändert man.
- **Genau heißt: ein Tipp, ein Wert.** Wischen ist ausdrucksstark, aber ungenau. Die Dreh-Leiste setzt daneben feste Werte (¼ bis 4 Umdrehungen je Takt) und einen Stopp, der wirklich sofort hält. Gesten bleiben, wirken aber nur noch in die gemeinte Richtung.
- **Ein Ort für alles:** Funktionen sind nach Bereichen verteilt, damit jede Ansicht ruhig bleibt. Dafür braucht es einen Ort, an dem man alles findet, ohne zu wissen, wo es wohnt: geordnet nach Aufgaben und mit Suche.
- **Offen:** Start-Melodie mit Rhythmus (jetzt nur Tonfolge) und mit dem späteren Instrument vorhören; der ältere „Anhalten“-Knopf im Steuerfeld gehört mit der Dreh-Leiste zusammengeführt; Effekte in der Übersicht.

## 13. Version 74: Der Anfang als Entscheidung, die Hand als Mischpult

- **Der Start ist die wichtigste Minute.** Wer mit einer Vorlage oder per Zufall eine Melodie hört, hat sofort Material – ohne „ich kann keine Melodie erfinden“. Wenige Fragen in Alltagssprache (wer, wie schnell, zusammen oder nacheinander, sofort oder gleich) ersetzen Einstellungen, die man sonst später suchen müsste.
- **Kanon als Aha-Erlebnis:** Dieselbe Melodie, versetzt – das versteht jedes Kind vom Singen. Ein Schalter genügt.
- **Jeder Finger eine Stufe mehr:** 1 formt, 2 Echo, 3 zerhackt, 4 schweigt. Die Reihenfolge steigert sich wie ein Aufbau; nichts muss man sich merken, was man nicht ausprobieren kann.
- **Zoomen, wie man es kennt:** Zwei Finger zusammen/auseinander – die Geste gibt es überall, also auch hier.
- **Gleichschritt mit einem Tipp:** „alle“ macht aus drei Formen ein Ensemble, das man gemeinsam anhält und startet.
- **Empfindlichkeit gehört dem Menschen:** Wie stark man ein Gerät kippt, ist Gewohnheit. Drei Stufen und „umkehren“ statt Zahlen.
