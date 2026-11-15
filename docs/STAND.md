# KLANGRAUM – Stand Version 77 (14.11.2026)

Artifact: https://claude.ai/artifact/AcerFy2AcGdzZhqXA8sjUf (mit Instrumenten-Samples unter s/). Capabilities: downloads, db, user, assets, room (Themen `n`/`nr` für Contributors). Jede neue Version wird zusätzlich als HTML-Datei zum Download bereitgestellt.
**Vorige Version immer greifbar:** https://123chrisd.github.io/klangraum/vorige/ (dort jetzt Version 76) · jede Version mit Commit in `docs/VERSIONEN.md`.

## Nächster Schritt (15.11.2026): neues Bediensystem – erst Konzept, dann Umsetzung
- Christian will die Oberfläche grundlegend neu ordnen (maximale Spielfläche, eine Ebene, Trennung Stück/Spiel, Führung ohne Erklärung).
- Entwurf mit Ist-Messung (v77: 48 % freie Bühne, 43 Knöpfe), Prüfung aus fünf Blickwinkeln, System „Drei Punkte“ und Bewertungskatalog (100 Punkte): `docs/KONZEPT_BEDIENSYSTEM.md`.
- **Noch nichts umgesetzt** – wartet auf Christians Bestätigung von Katalog und System. Messprobe: `tools/t78_mess.txt`.

## Neu in v77: Dreh-Knopf zum Ein- und Ausblenden · Gesten mit zwei und drei Fingern
- Christian (14.11. 18:01, mit Bildschirmfoto vom Telefon: die Dreh-Leiste bricht in zwei Zeilen um und liegt über den Formen): „Der Geschwindigkeitsregler stört, der muss auszublenden gehen. Verbessere die Steuerung weiter. Multitouch soll Gesten verstehen.“
- **Dreh-Knopf statt Dreh-Leiste** (`Dreh77`, weiter das Element `#dr73`):
  - Unten links sitzt nur noch ein **runder Knopf** (48 px) mit Tempo und Richtung der gewählten Form („½“, „Stopp“, „steht“).
  - **Antippen** klappt die Leiste auf (Stopp/Weiter, ¼ ½ 1 2 4, Richtung, „alle“, neu: Pfeil zum Einklappen). Sie klappt nach 8 s ohne Berührung von selbst ein.
  - **Hoch/runter ziehen** am Knopf ändert das Tempo direkt, ohne die Leiste zu öffnen (24 px je Stufe).
  - **Lange drücken** (0,65 s) blendet den Knopf ganz aus; die Meldung bietet „Zurückholen“ an.
  - Einstellung im Blatt „Gesten“: **Knopf** (Vorgabe) · **Leiste** (immer offen) · **aus**. Wird gemerkt (`store` „dr77“).
  - Die Leiste **bricht nicht mehr um**: eine Zeile, Tempo-Felder schrumpfen bis 22 px, darunter lässt sie sich seitlich schieben.
- **Eine Tempo-Reihe von rückwärts bis vorwärts** (`Dreh77.V`: −4 −2 −1 −½ −¼ · Stopp · ¼ ½ 1 2 4). Knopf-Ziehen und die Dreh-Geste laufen über dieselbe Reihe; über Stopp hinaus dreht die Form andersherum.
- **Gesten** (`Gest77`, nur **neben** den Formen – auf einer Form spielen Finger weiter Töne, ein Akkord hält nichts an):
  - **Zwei Finger tippen** = gewählte Form hält sofort an / dreht weiter.
  - **Drei Finger tippen** = alle Formen halten an / drehen weiter.
  - **Zwei Finger drehen wie einen Knopf** = Tempo der gewählten Form (rechtsherum schneller, linksherum langsamer, über Stopp hinaus rückwärts; 23° je Stufe; mit „alle“ in der Leiste für alle Formen).
  - Zoomen und Ansicht wechseln mit zwei Fingern bleibt wie bisher; sobald die Drehung erkannt ist, wird ein versehentlicher Zoom zurückgenommen.
- **Anzeige für erkannte Gesten** (`Hud77`, `#g77`): Symbol, Name der Form, was geschah, bei Tempo die Stelle auf der Reihe.
- **Blatt „Gesten und Dreh-Knopf“** (Mehr → Alles → Gesten, auch über die Hilfe): Schalter „Gesten“, Wahl für den Dreh-Knopf, alle Gesten mit kleinem Bild und einem Satz. Nach der ersten erkannten Geste bietet eine Meldung das Blatt einmal an.
- **Tests:** Prüfstand 162 (neu **DK**, **DL**, **GT**, **GQ**), 412×892 und 700×330. Layout 412×892, 700×330, 820×1180 TOTAL 0 (sieben neue Zustände). E2E mit echten Mehrfinger-Berührungen (`tools/t77_a.txt`, `tools/t77_b.txt`): Knopf tippen/ziehen/lange drücken/von selbst einklappen; Tipp mit zwei und drei Fingern in „Alle“ und „Form“; Drehen +1,2 rad → 4 je Takt, zurück −2,1 rad → ½ linksherum, Zoom unverändert; ein Finger daneben, zwei Finger auf der Form und „Gesten aus“ lösen nichts aus.
- **Verworfen:** „Zwei Finger auf einer Form zusammendrücken = festhalten“ – das ist seit langem Zoomen („zwei Finger zusammen/auseinander, egal worauf“) und bleibt es.
- **Nicht geprüft / offen:** nicht auf echten Geräten – gerade die Schwellen (Tipp unter 0,38 s bzw. 0,48 s, Drehung ab 22°) sind nur mit nachgestellten Berührungen erprobt. In der Form-Ansicht ist auf kleinen Telefonen neben der Form wenig Platz für zwei Finger (ober- und unterhalb geht es). Die Testumgebung ist so langsam, dass die Tipp-Zeit dort fünffach gestreckt werden musste (`Gest77.K`).

## Neu in v76: Start-Melodie für alle Formen – eigene Melodien einzeln wählbar
- Christian (14.11. 16:07): „Die Start-Melodie soll sich zunächst auf alle Formen auswirken; eigene Melodien sollen separat gewählt werden können.“
- **Blatt „Neues Stück“:** Statt „Wer spielt mit“ (an/aus) steht unter „So startet das Stück“ jetzt je Form eine Auswahl: **Start-Melodie** (Vorgabe für alle) · eine **Vorlage** (Auf und ab, Wellen, Fanfare, Ruf und Antwort, Ruhig) · **Zufall** · **keine – spielt frei**. Vorlagen klingen beim Wählen vor.
  - Jede Form mit Tonhöhen bekommt die Start-Melodie **immer in ihre Sammlung** – auch wenn sie eine eigene spielt. So kann man später zurückwechseln.
  - **Schlagzeug dreht jetzt mit** (gleiches Tempo), hat aber keine Melodie.
  - Eigene Melodien lassen sich auch ohne Start-Melodie vergeben („Stück mit diesen Melodien anlegen“). Im Kanon stehen nur die Formen, die die Start-Melodie spielen.
- **Im Stück – Knopf „♪“** (`MelWahl76`, `#mw76`, im Bereich Spielen oben links neben „Ausklang“; zeigt den Namen der Melodie der gewählten Form):
  - Blatt „Melodie von …“: oben die Formen zum Wechseln (mit ihrer jetzigen Melodie), darunter die Auswahl **Start-Melodie** · eigene Melodien dieser Form · **Vorlagen** · **Frei** – jede mit ihrer Tonfolge als bunte Zahlen; die Wahl klingt vor.
  - **Eigene Melodie tippen** (acht bunte Tasten, klingt mit der Form selbst): **„Nur für …“** gibt sie dieser einen Form · **„Als Start-Melodie für alle Formen“** macht sie zur neuen gemeinsamen Melodie.
  - **„Alle Formen spielen wieder die Start-Melodie“** stellt alle zurück; eigene Melodien bleiben in der Sammlung. Alles mit Rückgängig.
- **Tests:** Prüfstand 158 (neu **M6**), 412×892 und 700×330 ohne Fehler. Layout 412×892, 700×330, 820×1180 TOTAL 0 (drei neue Zustände). E2E (`tools/t76_a.txt`): Blatt mit Vorlage „Auf und ab“, Bass auf „Fanfare“ gestellt → Klavier spielt die Start-Melodie, Bass die Fanfare (Start-Melodie in der Sammlung), Trommel dreht mit; im Stück: Vorlage „Ruhig“ für Klavier, eigene Melodie nur für Klavier (Bass unverändert), neue Start-Melodie für alle, Bass auf „Frei“, alle zurück. Proben v70–v75 als Gegenprobe fehlerfrei.
- **Nicht geprüft / offen:** nicht auf echten Geräten. Die Start-Melodie ist je Form gespeichert (gleichnamiger Eintrag „Start-Melodie“), nicht einmal fürs Stück – benennt man sie in einer Form um, gilt sie dort nicht mehr als Start-Melodie. Für die aufgenommene Form („Eigener Klang“) bleibt die Wahl im eigenen Abschnitt.

## Neu in v75: Ausklang (Outro auf Knopfdruck) · Neues Stück: Töne aufnehmen und als Form mitnehmen
- Christian (14.11. 13:45): „Ich brauche im Form-Bereich noch einen Fade-out-Button, der aus dem Stück automatisch ein gutes Outro erstellt und die Formen ausgewogen beendet.“ · (13:48): „Und ich möchte auch beim Zusammenstellen des neuen Stückes bereits Töne aufnehmen können und daraus eine Form erstellen, die entweder die Hauptmelodie spielt oder eine eigene.“
- **Ausklang** (`Outro75`, Knopf `#ou75` im Bereich Spielen oben links neben dem runden Abspielknopf, in „Form“, „Alle“ und „Raum“):
  - Ein Tipp bei laufender Musik macht ein Ende von etwa zwölf Sekunden (2 bis 8 Takte je nach Tempo, beginnt auf der nächsten Eins).
  - **Reihenfolge:** Melodien (0–50 %) → Begleitung (15–65 %) → Schlagzeug (45–92 %) → Akkorde und Bass (55/60–100 %), jede Stimme mit weicher Kurve. Dabei schließt sich der Klang (Tiefpass) und ein Echo kommt dazu.
  - **Schlusston:** Auf der letzten Eins schweigt alles andere; Bass und Akkord-Stimme spielen den Grundton bzw. Grundakkord und klingen drei Sekunden aus (ohne beide: die letzte Melodie-Stimme, sonst Bassdrum und Becken).
  - Danach steht die Musik. **Das Stück bleibt unverändert** (Lautstärken, Loops, Drehungen wie vorher; „Hören“ spielt es wieder). Nochmal tippen bricht ab, alles spielt weiter; lief ein Song, läuft er im selben Abschnitt weiter. Eine laufende Aufnahme endet mit dem Ausklang. Auch in „Alles auf einen Blick“.
- **Neues Stück → „Eigener Klang“** (`RecNP`, Abschnitt vor der Start-Melodie, wahlweise):
  - **Aufnehmen** (Mikrofon, bis 12 s, Pegelanzeige) oder **Audiodatei**; Anhören, Verwerfen.
  - Beim Anlegen wird daraus eine **eigene Form** (wie bei „Aufnehmen“ auf der Startseite: in jeder Tonhöhe spielbar, knetbar); das Original liegt bei den Aufnahmen des neuen Stücks.
  - **Die neue Form spielt:** **die Start-Melodie** (wie die anderen, auch im Kanon) · **ihre eigene** – die gesungenen/gespielten Töne, die KLANGRAUM nacheinander erkennt (`RecNP.track`: Tonhöhe je 43 ms, Töne ab 85 ms, wiederholte Töne an der Lautstärke-Delle; bis 16) · **nichts vor**.
  - **„Gesungene Töne als Start-Melodie für alle nehmen“:** die Melodie singen statt tippen.
- **Tests:** Prüfstand 157 (neu **O5** Ausklang, **R5** Tonerkennung; **A7** angepasst), 412×892 und 700×330 ohne Fehler außer dem bekannten Schwanker I1. Layout 412×892, 700×330, 820×1180 TOTAL 0 (vier neue Zustände). E2E (`tools/t75_a.txt`, simuliertes Mikrofon): Aufnahme im Blatt → Stück angelegt mit vierter Form „Stimme“ (Aufnahme), sie trägt die Start-Melodie und dreht mit; Ausklang: Lautstärken über die Zeit gemessen (Klavier und Stimme zuerst auf 0, dann Trommel, Bass zuletzt), Filter und Echo fahren mit, Schlusston (4 Töne), danach Stopp und alles wie vorher, „Hören“ spielt wieder; Abbruch stellt sofort zurück; Ausklang mitten in einem Song mit Loops. Proben v70–v74 als Gegenprobe fehlerfrei.
- **Nicht geprüft / offen:** Ausklang nur gemessen, nicht gehört – ob die Reihenfolge und die zwölf Sekunden musikalisch gut sitzen, muss ein Ohr entscheiden. Die Tonerkennung ist mit reinen Tönen geprüft, nicht mit echter Stimme (das simulierte Mikrofon liefert nur kurze Pieptöne, daraus entsteht kein Tonverlauf); Akkorde, Hauchen, Vibrato und Nebengeräusche können Töne verfälschen. Rhythmus der gesungenen Melodie wird nicht übernommen, nur die Tonfolge. In der eingebetteten Claude-Ansicht ist das Mikrofon gesperrt – dort geht „Audiodatei“.

## Neu in v74: Start genauer einstellen · mehr mit mehreren Fingern · alle Formen zugleich steuern
- Christian (14.11. 12:57): „Sehr gut, verbessere die Möglichkeiten der Startkalibrierung noch weiter. Auch die Multitouch-Funktionen sollen noch cooler und besser werden. Die Steuerung der Formen weiter verbessern!“
- **Deutung „Startkalibrierung“:** Das Wort kommt in der App nicht vor. Gelesen als (a) das Einstellen des Starts im Blatt „Neues Stück“ (Start-Melodie, v73) und (b) die Mitte/Empfindlichkeit der Bewegungssensoren (v72). Beides ist ausgebaut; falls etwas Drittes gemeint war, bitte sagen.
- **Neues Stück – Start-Melodie und Start-Einstellungen** (`StartMel`, `st.mo`):
  - **Vorlagen** (Auf und ab, Wellen, Fanfare, Ruf und Antwort, Ruhig) und **🎲 Zufall** (acht Töne, beginnt auf dem Grundton, endet auf einem Ton des Grundakkords) – jede klingt sofort vor.
  - **Lage** tief · mittel · hoch (je eine Oktave); Töne außerhalb der Mitte zeigen ▾ / ▴.
  - **So startet das Stück:** **Wer spielt mit** (jede Form einzeln an/aus; Schlagzeug „ohne Töne“) · **Drehungen je Takt** ¼ · ½ · 1 · 2 · **Einsatz** zusammen oder **nacheinander (Kanon:** jede weitere Form setzt zwei Töne später ein) · **Beginn** spielt sofort oder wartet auf dich.
- **Bewegung einstellen** (Mischen → Bewegung, `Beweg.cfg`, je Gerät gemerkt): **Empfindlichkeit** sanft/normal/stark (voller Ausschlag bei 50°/35°/22°) · **↔ umkehren**, **↕ umkehren** (falls Kippen verkehrt herum wirkt – die Vorzeichen ließen sich ohne Gerät nicht prüfen) · **Mitte neu** – auch als Knopf in der Live-Fläche, solange „Kippen“ an ist.
- **Live-Fläche mit mehr Fingern:** 2. Finger = Echo (Abstand = Stärke) · **3. Finger = Zerhacker** (die Musik wird im Takt zerhackt: jede Sechzehntel halb offen, halb zu) · **4. Finger = Stille**. Neuer Halte-Knopf **Hacken**. Der Punkt zieht eine **Leuchtspur**; beim Zerhacken blitzt die Fläche. (Vorher: 3. Finger = Stille.)
- **Klangschrift – Zoom mit zwei Fingern:** im Notenfeld **zusammenziehen** zeigt doppelt so viele Takte (bis 4), **auseinanderziehen** halb so viele. Angefasste Töne springen dabei an ihren Platz zurück, es entstehen keine neuen. Dasselbe als Knöpfe **🔍 1 · 2 · 4**. Zwei Finger in dieselbe Richtung verschieben weiterhin zwei Töne.
- **Dreh-Leiste „alle“:** Schalter rechts in der Leiste – Stopp/Weiter, Tempo und Richtung gelten dann für **alle Formen zugleich** (Gleichschritt). Der ältere Knopf „Anhalten“ bzw. „Weiter“ im Steuerfeld ist ausgeblendet, solange die Leiste zu sehen ist (v73 offen). Leiste auf schmalen Bildschirmen einzeilig.
- **Tests:** Prüfstand 155 (neu **S4** Start-Einstellungen, **B5** Bewegung einstellen, **L4** Finger-Belegung, **Z4** Zoom, **D4** alle Formen; **L2** aus v72 an die neue Belegung angepasst), 412×892 und 700×330 ohne Fehler außer dem bekannten Schwanker I1. Layout 412×892, 700×330, 820×1180 TOTAL 0 (fünf neue Zustände). E2E mit Mehrfinger-Touch (`tools/t74_a.txt`): Vorlage „Wellen“ + hoher Ton, Kanon, ½ je Takt → Klavier und Bass tragen die Melodie, drehen mit 0,5 und liegen dauerhaft 2/9 Umdrehung auseinander; „alle“: Stopp und Tempo 1 für alle drei; Live: 3 Finger = Zerhacker läuft, 4 = Stille, Abheben stellt alles zurück, Knopf „Hacken“; Klangschrift: zusammenziehen 1 → 2 Takte, auseinander 2 → 1, kein Ton hinzugekommen; Bewegung: „stark“ und ↔ gespeichert. Proben v70–v73 als Gegenprobe fehlerfrei.
- **Nicht geprüft / offen:** echte Geräte (vier Finger auf dem Handy sind eng; Zerhacker nur gezählt, nicht gehört). Kanon-Versatz ist fest (zwei Töne). Die Start-Einstellungen gelten nur beim Anlegen, nicht nachträglich für ein bestehendes Stück. Vorhören der Start-Melodie weiter mit einfachem Ton.

## Neu in v73: Stück mit eigener Start-Melodie · Dreh-Leiste · Alles auf einen Blick
- Christian (14.11. 11:04): „Es soll optional möglich sein, ganz am Anfang beim Stück-Zusammenstellen eine Melodie zu spielen, die dann nur in dem neuen Stück auf alle Startformen angewendet wird, sodass diese zunächst alle das Gleiche spielen. Die Steuerung der Formen – drehen, anschieben, anhalten – soll besser und genauer funktionieren. Alle Optionen/Funktionen sollen intuitiver erreichbar und übersichtlicher sein.“
- **Start-Melodie** (`StartMel`, im Blatt **Neues Stück** als Abschnitt vor „Stück anlegen“, wahlweise):
  - Acht bunte Tasten (eine Oktave der gewählten Stimmung, Namen passen sich an), bis 16 Töne; Zurück, Anhören, Leeren. Der Knopf heißt dann „Stück mit dieser Melodie anlegen“.
  - Beim Anlegen bekommen **alle Formen mit Tonhöhen** die Melodie als Grundmelodie „Start-Melodie“ (`Mel.add`) und drehen gleich schnell (1 Umdrehung je Takt) – sie spielen zunächst dasselbe. Schlagzeug hat keine Tonhöhen und bleibt stehen. Andere Stücke bleiben unberührt; leeres Feld = wie bisher.
  - Einstiege: Startseite unten → „Stück mit Melodie“ · Meine Stücke → ＋ Neues Stück · „Alles auf einen Blick“.
- **Dreh-Leiste** (`Dreh73`, `#dr73`, schwebt im Bereich Spielen unten links über dem Steuerfeld, in „Form“ und „Alle“):
  - **Drehen / Stopp / Weiter**: Stopp hält **sofort** an (kein Auslaufen), Weiter dreht mit altem Tempo und alter Richtung.
  - **¼ · ½ · 1 · 2 · 4** Umdrehungen je Takt: ein Tipp stellt genau diesen Wert ein. Pfeil = Richtung umkehren bei gleichem Tempo.
  - Zeigt immer den Stand der gewählten Form, auch nach Anschubsen mit dem Finger. Ausgeblendet beim Kneten, Malen, Melodie festlegen und im Vollbild.
  - **Gesten genauer:** Wischen und Loslassen wirken nur noch auf die gemeinte Achse – waagerecht dreht, senkrecht kippt; erst ab 60 % Queranteil zählt beides (`Motion.push`, `Motion.release`). Vorher kippte die Form bei leicht schrägem Wischen mit, und ein senkrechter Wisch drehte sie nebenbei.
- **Alles auf einen Blick** (`Alles73`): ein Blatt mit Suche – 9 Bereiche, 9 Wege Musik zu machen und alle 69 Funktionen der Befehlsliste in ihren 9 Gruppen (Spielen, Klang, Drehen, Set, Loops, Form, Werkzeuge, Ansicht, Mehr). Ein Tipp führt hin bzw. führt die Funktion für die gewählte Form aus. Findet die Suche nichts, sucht ein Knopf in der Hilfe weiter. Einstiege: Startseite unten, Blatt „Mehr“ oben.
- **Tests:** Prüfstand 150 (neu **SM** Start-Melodie, **D7** Dreh-Leiste und Achsen, **A7** Übersicht), 412×892 und 700×330 ohne Fehler außer den bekannten Schwankern I1/T3. Layout 412×892, 700×330, 820×1180 TOTAL 0 (fünf neue Zustände). E2E (`tools/t73_a.txt`): Startseite → Stück mit Melodie → sechs Töne getippt, einer zurück, angehört, Stimmung gewechselt (Melodie bleibt, Tastennamen wechseln) → angelegt: Klavier und Bass tragen „Start-Melodie“ und klingen, Trommel nicht, das alte Stück ist unverändert; Dreh-Leiste: Stopp (Form steht wirklich), 2 je Takt, Richtung; Übersicht: 87 Kacheln, Suche. Proben v70–v72 als Gegenprobe fehlerfrei.
- **Nicht geprüft / offen:** Nichts davon auf echten Geräten; die Gesten-Änderung (60 %-Schwelle) ist nur gerechnet, nicht mit der Hand gefühlt. Die Start-Melodie klingt beim Eintippen mit einem einfachen Ton, nicht mit den späteren Instrumenten. Im Steuerfeld erscheint beim Drehen weiterhin der ältere Knopf „Anhalten“ (läuft sanft aus) – doppelt zur Dreh-Leiste. „Alles auf einen Blick“ zeigt die Befehlsliste; Effekte und Regler, die keine Befehle sind (z. B. Echo, Hall), findet nur die Hilfe-Suche.

## Neu in v72: Bewegung (Sensoren) · Live-Fläche mit mehreren Fingern · Wechsel mitten im Stück · Mitschnitt
- Christian (14.11. 09:48–09:52), vier Aufträge: „Nutze die Lage- und Beschleunigungssensoren der Mobilgeräte optional, um den Sound durch Bewegung zu verändern.“ · „Nutze Multitouch auf der Fläche.“ · „Die Stücke sollen beim Spielen automatisch aufgezeichnet werden, und beim Wechsel soll gefragt werden, ob diese gespeichert werden sollen.“ · „Das Multitouch-Ändern und der Wechsel zwischen den Veränderungsbereichen soll auch während eines Stückes möglich sein.“
- **Bewegung** (`Beweg`, aus bis man es einschaltet): **Mischen → Bewegung** (Schalter) oder in der Live-Fläche **Kippen**.
  - **Links/rechts kippen:** dumpf ↔ hell (Tiefpass bzw. neuer Hochpass in der Wucht-Kette). **Nach vorn kippen** (obere Kante weg): Echo im Takt, stufenlos. **Schütteln:** Stotter – jeder Ruck ein Aussetzer von 0,11 s.
  - **In der Live-Fläche** rollt der Punkt wie eine Kugel (kippen = Klang und Band). Liegt ein Finger auf, führt der Finger.
  - Mitte = Haltung beim Einschalten; der kleine Kreis zeigt die Neigung, antippen setzt die Mitte neu. Totzone 4°, voller Ausschlag bei 35°, geglättet. Gedrehter Bildschirm tauscht die Achsen.
  - iPhone/iPad: fragt um Erlaubnis (`requestPermission`). Kommen 1,8 s lang keine Daten, schaltet sich die Bewegung mit Erklärung wieder aus. Schaltet auch ab, wenn die Seite in den Hintergrund geht oder das Stück wechselt.
- **Live-Fläche mit mehreren Fingern:** 1. Finger = Punkt. **2. Finger = Echo**, sein Abstand zum Punkt regelt die Stärke (25–100 %), gestrichelte Linie zeigt es. **3. Finger = Stille**, abheben = Einsatz. Hebt der erste Finger ab, übernimmt der nächste den Punkt. Jeder weitere Finger bekommt einen Ring. (Ersetzt „zweiter Finger = Echo an/aus“ aus v71.)
- **Wechsel mitten im Stück:**
  - Die Live-Fläche hält die Musik nicht mehr an: Öffnen pausiert nur den Song-Ablauf (Takt läuft weiter, `Transport.t0` bleibt); „Fertig“ setzt den Song im selben Abschnitt fort, wenn vorher Musik lief (`Live70.back`, `close(keep)`).
  - **Bereichsleiste** (`Ber72`): **Tasten · Noten · Kneten · Live** steht in Einspielen, Klangschrift, Live-Fläche und im Steuerfeld beim Kneten. Ein Tipp wechselt, die Musik läuft weiter, der gewählte Klang wird mitgenommen.
- **Mitschnitt** (`Auto72`, an; Schalter unter Mischen): nimmt von selbst auf, was klingt. Stille über 1,2 s fällt weg, eigene Aufnahmen beim Anhören zählen nicht, behalten werden die letzten 5 Minuten (schwache Geräte 2). **Beim Wechsel des Stücks** (anderes öffnen, neues anlegen, auch „Song bauen“) fragt ein Blatt „Dein Spiel behalten?“ – **Speichern** legt den Mitschnitt zu den Aufnahmen des alten Stücks, **Nicht speichern** verwirft, „Nicht mehr von selbst mitschneiden“ schaltet ab. Unter 8 s wird nicht gefragt; ohne Antwort geht es nach 45 s ohne Speichern weiter. „Jetzt sichern“ legt den Mitschnitt sofort ab.
- **Tests:** Prüfstand 147 (neu **BG** Bewegung, **L2** Live-Fläche mit mehreren Fingern, **AM** Mitschnitt, **BR** Bereichswechsel), 412×892 und 700×330 ohne Fehler. Layout 412×892, 700×330, 820×1180 TOTAL 0 (drei neue Zustände). E2E im Testbrowser (`tools/t72_a.txt`): Live-Fläche mitten im laufenden Song geöffnet (Takt ununterbrochen), zwei Finger nah/weit = Echo 25 %/100 %, drei Finger = Stille, Punkt-Übergabe; Leiste Live → Noten → Tasten → Kneten → Live → Fertig, die Musik lief durchgehend und der Song danach weiter; Bewegung mit nachgestellten Lage-Ereignissen (links = 982 Hz Tiefpass, rechts + vorn = Hochpass 186 Hz und Echo, Ruck = Stotter, Punkt rollt); Stückwechsel → Frage → Speichern → Aufnahme (55 s) liegt beim alten Stück.
- **Nicht geprüft / offen:** **Echte Sensoren** – im Testbrowser kamen über die Geräte-Emulation keine Ereignisse an, geprüft ist nur mit nachgestellten Ereignissen. Vorzeichen der Achsen im Querformat, Stärke des Schüttelns (Schwelle 13 m/s²) und die iOS-Erlaubnis brauchen ein echtes Gerät. Im eingebetteten Artifact sind die Sensoren vermutlich gesperrt (dann schaltet sich die Bewegung wieder aus); Website und Datei sollten gehen. Mitschnitt: Speicherbedarf bis etwa 55 MB bei 5 Minuten; beim Schließen des Browsers wird nicht gefragt. Hip-Hop/House/Techno bleiben basslastig.

## Neu in v71: Mit allen Fingern modellieren – und man hört es
- Christian (13.11. 22:46): „Verbessere die App noch weiter! Einfache Bedienung – kinderleicht! Das Modellieren von Melodien soll Multitouch unterstützen. Das Modellieren der Töne auch.“ (Der zweite Satz ließ sich auch als „das Modellieren soll auch tönen“ lesen – beides ist umgesetzt.)
- **Befund:** In der Klangschrift galt nur ein Finger, ein gesetzter Ton ließ sich nicht mehr bewegen (nur löschen und neu setzen). Beim Kneten griff bei drei Fingern die Geste „Form herauslösen“, und Kneten war stumm – man hörte die Wirkung erst beim nächsten Antippen.
- **Klangschrift mit mehreren Fingern** (`Schrift.bind` neu, `Schrift.drags`): Jeder Finger setzt seinen eigenen Ton – drei Finger auf einmal sind ein Akkord (bis sechs). **Ton anfassen und ziehen** verschiebt ihn: hoch/runter = Tonhöhe (klingt beim Wechsel), links/rechts = Zeit. **Am rechten Ende ziehen** ändert die Länge. Antippen löscht. Mehrere Töne lassen sich gleichzeitig verschieben. Was auf derselben Zeile darunterliegt, weicht beim Loslassen. Leeres Feld zeigt „Tippe ins Feld. Jeder Finger setzt einen Ton.“ Das Notenfeld nimmt jetzt alle Wischrichtungen selbst (`touch-action: none`); die Seite rollt man neben dem Feld.
- **Kneten mit mehreren Fingern, mit Ton** (`Knet71`): Jeder Finger auf der Form knetet für sich und bekommt einen eigenen Leuchtring. Beim Aufsetzen und alle 0,3 s beim Weiterkneten **klingt die Form** an der Stelle des Fingers. Die Drei-Finger-Geste ist beim Kneten aus. Zwei Finger gleichzeitig aufsetzen und spreizen ändert weiter die Größe. Kein Knet-Ton, wenn die Form gerade hörbar ihren Loop spielt oder eine Aufnahme läuft.
- **Startseite:** Kachel „Klänge formen“ heißt jetzt **„Klang kneten“** und führt direkt ins Kneten (Form in Nahansicht, Kneten an, ein Satz Erklärung). Hinweistexte beim Kneten neu in einfachen Worten.
- **Live-Fläche:** Ein **zweiter Finger** auf der Fläche schaltet das Echo ein, solange er liegt.
- **Tests:** Prüfstand 143 (neu **MT** Klangschrift mit mehreren Fingern, **KT** Kneten klingt), 412×892 und 700×330 ohne Fehler. Layout 412×892, 700×330, 820×1180 TOTAL 0. E2E mit echtem Mehrfinger-Touch im Testbrowser (`tools/t71_a.txt`): Kachel „Klang kneten“ → drei Finger kneten gleichzeitig (drei Ringe, drei Töne, Form ändert sich, keine Drei-Finger-Geste), einer bleibt liegen, zwei gleichzeitig = Größe 1,15 → 1,75; Klangschrift: drei Töne mit einem Griff, zwei gleichzeitig verschoben; Live-Fläche: zweiter Finger = Echo.
- **Nicht geprüft / offen:** echte Geräte (Handballen, Auflage vieler Finger, Verzögerung). Knet-Ton nur gezählt, nicht gehört. Kneten erreicht nur die sichtbare Seite der Form. In der Klangschrift gibt es kein Zoomen mit zwei Fingern; im Querformat auf dem Handy ist das Notenfeld höher als der Bildschirm und wird neben dem Feld gerollt.

## Neu in v70: Klangschrift (eigenes Notensystem) · Live-Fläche · fette Klänge · Wucht
- Christian (13.11. 19:34): „Ich möchte die krasseste, coolste und innovativste Musik-App schaffen! Simple, fesselnd und faszinierend! Innovative intuitive Steuerung! Krasse fette Sounds! Neues Notensystem.“
- **Klangschrift** (`Schrift`, Vollbild `#kn70`) – das Notensystem von KLANGRAUM zum Lesen **und** Schreiben:
  - Jeder Ton ist ein bunter Balken. **Farbe und Zahl** = Ton der Tonleiter (1 = Grundton, dieselben sieben Farben wie die bunten Tasten), **Länge** = Dauer, **Höhe** = Tonhöhe. Vier Kästchen sind ein Schlag, sechzehn ein Takt. Schlagzeug hat vier Zeilen (Becken, Hi-Hat, Snare, Bassdrum).
  - **Tippen** setzt einen Ton (er klingt sofort), **nach rechts ziehen** macht ihn länger, **nochmal tippen** löscht ihn. Senkrecht wischen blättert. Tipp-Länge kurz/mittel/lang, Loop-Länge 1/2/4 Takte.
  - **Helle Zeilen** zeigen die Töne des Akkords im jeweiligen Takt, die Grundton-Zeile ist rötlich hinterlegt. Töne außerhalb der Tonleiter erscheinen gestrichelt mit ♯.
  - Übersicht über den ganzen Loop oben (tippen springt zum Takt), Abspiellinie läuft mit. Hochformat zeigt 1 Takt, Querformat/Tablet 2, große Bildschirme 4. ▲/▼ holen höhere und tiefere Töne dazu.
  - Legende 1–7 mit Notennamen: antippen spielt den Ton. „Allein hören“, „Einspielen“ (wechselt zu den Tasten), „Alles weg“.
  - Einstiege: Start → **Klangschrift** · Song → Klang antippen → **Noten lesen und ändern** (mit Kleinbild der Töne) · Einspielen → **Noten**.
- **Live-Fläche** (`Live70`, Vollbild `#lv70`) – ein Finger formt den ganzen Song:
  - Das Stück läuft als Dauerschleife. **Nach oben** kommen die Klänge der Reihe nach dazu (Akkorde → Bass → Beat → Begleitung → Melodie; ganz oben löst die Refrain-Melodie die Strophen-Melodie ab). **Nach rechts** öffnet sich ein Filter über der ganzen Musik (dumpf → hell, mit Resonanz).
  - Der Punkt bleibt liegen, wo man loslässt. Links stehen die Namen der Klänge auf ihrer Höhe und leuchten, wenn sie spielen.
  - **Stille** (halten; loslassen = Einsatz) und **Echo** (halten; punktierte Achtel im Takt). **Aufnehmen** schneidet das Spiel mit; „Stopp“ hält die Musik an und zeigt die fertige Aufnahme.
  - Bild: Strahlenkranz aus den Pegeln der Stimmen, Ringe im Takt, Punktraster, Farbe Blau → Magenta → Orange nach Klang. Pfeiltasten bewegen den Punkt (Tastatur).
  - Einstiege: Start → **Live-Fläche** · Song → farbiger Knopf oben neben „wiederholen“.
- **Fette Klänge** (`Fett`, im Gerät berechnet über den „syn“-Weg aus v66): Monster-Bass, Donner-Bass, Hymnen-Säge (neun Sägezähne), Laser-Zupfer, Sirenen-Lead, Synth-Bläser und das **Fette Kit** (Kick mit Bauch, Clap-Snare, knappe Hi-Hat, Einschlag). Zu finden unter Formen → Techno & Bass → „Fett (neu)“.
- **Drei neue Song-Stile:** Festival (128 BPM), Trap (140), Drum & Bass (172) – 15 Stile insgesamt.
- **Wucht** (`Wucht`): Klangwucht auf der Summe, vor Verdichter und Begrenzer – Bassfundament (75 Hz), weniger Mulm (260 Hz), Präsenz (3,2 kHz), Glanz (8,5 kHz), weiche Sättigung, dichtere Verdichtung. Ein Regler unter Mischen (aus · sanft · kräftig · fett · maximal; Standard „kräftig“). Gilt für alles, auch für Aufnahmen; wird je Gerät gemerkt.
- **Messung der Song-Stile** (`tools/t70_h.txt`, `tools/ana70.py`; Anteil der Energie unter 150 Hz): Festival 51 %, Trap 65 %, Drum & Bass 53 %, zum Vergleich Pop 36 %. Erster Entwurf lag bei 90–95 % – die Bassdrum erdrückte alles; Kick und Bässe wurden danach abgestimmt. In Hip-Hop, House, Techno wurden Beat und Bass zurückgenommen (91→82 %, 82→71 %, 88→82 %); die älteren Kits bleiben kick-lastig. Kein Stil übersteuert (Spitze ≤ 0,90).
- **Tests:** Prüfstand 141 (neu **F7** Klänge/Stile, **WU** Wucht, **KS** Klangschrift, **LF** Live-Fläche), 412×892 und 700×330 ohne Fehler. Layout 412×892, 700×330, 820×1180 TOTAL 0 (neun neue Zustände). E2E mit echten Berührungen (`tools/t70_a.txt`): Festival-Song → Live-Fläche über den Song-Knopf, Finger nach unten links (1 von 6 Klängen, Filter 564 Hz) und oben rechts (5 von 6, offen), Stille/Echo halten, Aufnahme und Stopp, Klangschrift über das Zeilenmenü, Ton tippen/löschen/ziehen (Länge 4), blättern, Schlagzeug, Wechsel zu Einspielen und zurück, Haus-Knopf, Wucht-Regler. Bilder in Hoch-, Querformat und Tablet angesehen.
- **Nicht geprüft / offen:** Klang nur gemessen, nicht gehört. Bei 360×640 meldet die Layout-Prüfung im Bereich „Spielen“ Klang-Chips unter dem Ansichtsschalter (57 Treffer, unverändert seit v69 – die Leiste rollt dort unter dem Schalter durch). Live-Fläche: nur ein Finger, Umschalten sofort statt auf den Takt. Klangschrift: keine Lautstärke je Ton, kein Bild-Export.

## Neu in v69: Immer zurück zum Start · beschriftete Kopfknöpfe · „Dein Weg“
- Christian (13.11. 17:38): „Verbessere und vereinfache weiter! Es muss total intuitiv sein. Und ich möchte immer wieder einfach zur Startseite zurückkehren können.“
- **Befund:** Die Startseite war nur über die Leiste unten erreichbar. In Blättern, im Einspielen, im Vollbild und bei ausgeblendeter Leiste gab es keinen Weg dorthin. Die Zurück-Taste des Handys führte zum Bereich „Spielen“ statt zum Start (die ältere Zurück-Logik `Nav` kannte „Klang“ als Grundseite).
- **Start-Knopf überall** (`Heim`): Haus-Knopf oben links in der Kopfzeile (farbig, auf der Startseite gedimmt), in jedem Blatt neben dem ✕ (`Sheets.head`), im Einspielen oben links, im Vollbild oben rechts neben dem Verlassen-Knopf. Ein Tipp schließt alles Offene (Blatt, Einspielen, Erklär-Modus, Dialoge, Vollbild, Kneten/Malen) und zeigt die Startseite. Die Musik läuft weiter.
- **Zurück-Taste** (`Nav.closeTop/depth` neu): schließt Schritt für Schritt – Einspielen, Erklär-Modus, Dialoge, Blatt, Vollbild, Kneten/Malen, Ansicht – und führt dann zur Startseite. Erst von dort verlässt sie die App. Esc am Rechner schließt wie bisher, springt aber nicht zum Start.
- **Kopfknöpfe mit Namen** (einfache Ansicht, Hochformat): Start · dein Stück · Hören · Zurück · Stimmung · Menü. Der Vollbild-Knopf steht nur noch in der Profi-Ansicht.
- **Dein Weg** auf der Startseite: vier nummerierte Schritte in der Karte „Dein Stück“ – Song bauen, Dazuspielen, Mischen, Aufnehmen. Ein Haken zeigt, was schon da ist. „Aufnehmen“ springt zum Aufnahme-Knopf im Song und lässt ihn aufleuchten. Die Karte steht jetzt gleich unter dem großen Knopf, die Kacheln darunter.
- **Tests:** Prüfstand 137 (neu **HM**: Start-Knopf in Kopf, Blatt, Einspielen, Vollbild; Zurück-Schritte; Dein Weg), 412×892 und 700×330 ohne Fehler. Layout 412×892, 700×330, 820×1180 TOTAL 0. E2E mit echten Tipps und echter Zurück-Navigation des Browsers (`tools/t69_a.txt`): Blatt → Start, Kneten → Start, Pult + Blatt → Zurück → Zurück → Start, Einspielen → Start, Vollbild → Start. Regression: alle E2E aus v65–v68.
- Nicht geprüft: die Zurück-Taste in der eingebetteten Claude-Ansicht und auf echten Handys (dort entscheidet der Browser, ob die App Verlaufseinträge anlegen darf).

## Neu in v68: Einspielen ohne Aufnahmeknopf · Spuren-Mix im Song · einfacher Bereich „Spielen“
- Christian (13.11. 16:49): „Die App soll noch viel einfacher und besser bedienbar werden! Völlig neue Ansätze entwickeln! Loops sollen besser funktionieren! Tonspuren-Mix. ALLES SOLL EINFACHER BEDIENBAR WERDEN!“
- **Befund zu den Loops:**
  - Einen Loop einzuspielen hieß bisher: Aufnahme-Knopf, Länge wählen, einzählen lassen, im richtigen Moment spielen, stoppen. Für Laien sind das fünf Fehlerquellen.
  - Ein neuer Klang mit Loop kam nie im Song vor: Er stand in keinem Teil des Ablaufs und blieb beim Abspielen stumm.
  - Ungenau gespielte Töne blieben ungenau.
- **Einspielen** (`Einsp`, eigene Vollbild-Ansicht) – der neue Ansatz: **Es gibt keinen Aufnahmeknopf.**
  - Der Takt läuft (ein Stück mit Ablauf spielt als Song mit). Jeder Ton auf den bunten Tasten bzw. jedem Trommel-Feld klingt sofort, erscheint als farbiger Punkt im Band und wird ab der nächsten Runde vom Loop gespielt. Runde für Runde kann man dazuspielen.
  - **Gerade rücken:** grob (halber Schlag, Standard), fein (Sechzehntel), frei. So klingt es auch bei ungenauem Spiel im Takt.
  - **Letzte Runde** nimmt die Töne der letzten Runde zurück, **Alles weg** leert den Loop. Länge 1, 2 oder 4 Takte. **Klick** zum Mitzählen (kommt nicht in Aufnahmen). ▶/■ oben.
  - Klang-Leiste oben: alle spielbaren Klänge des Stücks, dazu ＋ Klavier, Bass, Schlagzeug, Gitarre, Flöte, E-Piano, Streicher, Elektro-Beat. Schlagzeug bekommt große Felder (Bassdrum, Snare, Hi-Hat, bei Kits auch Becken) mit einem Satz Erklärung.
  - Technik: Stelle im Loop aus `Engine.now()` minus Ausgabeverzögerung, wie `Loops.onStep` sie rechnet (`Song.loopStep`, `Loops.shift`). Der Ton wird erst eingefügt, wenn seine Stelle vorbei ist, damit der Loop ihn nicht sofort doppelt spielt. Leere Loops und unbenutzte neue Klänge werden beim Schließen entfernt.
  - Einstiege: Start → **Selbst einspielen** (erste Kachel) · Song → **Klang dazu** · Song → Instrument antippen → **Dazuspielen** · Bereich Spielen → **Loop** (in der einfachen Ansicht) · Mehr.
- **Neue Klänge kommen von selbst in den Song** (`SongUI.watch/adopt`): Bekommt ein Klang seinen ersten Loop (Einspielen, Tasten, Loopstation), spielt er in allen Teilen mit; je Teil schaltet man ihn im Song an oder aus.
- **Spuren-Mix im Song:** Jede Zeile unter „Wer spielt wann?“ hat ihren Lautstärke-Regler direkt neben dem Namen (derselbe Regler wie unter Mischen).
- **Mischen** zeigt jetzt auch **Gesangs- und Audiospuren** mit Regler und Stumm.
- **Einfach oder Profi** (`Einf68`, Mehr → **Profi-Ansicht**, Standard aus):
  - Einfach: im Bereich Spielen stehen nur ＋ Neu, der Name, „▴ Mehr“ und vier große Knöpfe (Tasten, Kneten, Malen, Loop). Die Schalterzeile, der Spielen/Bearbeiten-Schalter, Live, Rückblick, Szenen und der Set-Knopf erscheinen erst mit „▴ Mehr“.
  - Profi: alle Schalter und alle Bereiche in der Leiste wie früher.
- **Behoben nebenbei:** Bei aufgeklapptem Steuerfeld lagen die Pfeile „nächste Form“ auf dem Feld (bestand schon länger; die Layout-Prüfung deckt diesen Zustand jetzt ab).
- **Tests:**
  - Prüfstand 136 (neu **EI** Einspielen: Ton liegt gerade gerückt im Loop, Trommel-Felder, Letzte Runde, Aufräumen, Aufnahme in den Song; **EP** Einfach/Profi, Regler je Song-Zeile): 412×892 und 700×330 ohne Fehler.
  - Layout 412×892, 700×330, 820×1180: TOTAL 0, jetzt auch Einspielen (Tasten, Trommel, Klangwahl), Song mit Reglern, Spielen einfach / aufgeklappt / Profi.
  - E2E mit echten Tipps (`tools/t68_a.txt`): Start → Selbst einspielen → Klavier, 5 Töne → Loop spielt von selbst (Pegel gemessen) → Letzte Runde → Trommel, 8 Schläge → Fertig; im Pop-Song „Klang dazu“ → E-Piano einspielen → 7. Zeile in allen 8 Teilen; Regler in der Song-Zeile ziehen; Loop-Knopf im einfachen Steuerfeld; „▴ Mehr“.
  - Regression: alle E2E aus v67 (Song, Mischen, Aufnahme, Rückgängig, Neuladen), Rock (v66), Tasten und Rückblick (v65), Pult (v63/v64).
  - Nicht geprüft: ob das Gerade-Rücken auf echten Handys mit ihrer Ton- und Berührungsverzögerung die Töne dorthin setzt, wo man sie hört (im Testbrowser nicht messbar). Diesmal ohne zweiten unabhängigen Tester.

## Neu in v67: Studio für Laien – Start · Song in 1 Minute · Song-Ansicht · Mischen · Erklär-Modus
- Christian (13.11. 14:51): „Du bist ab sofort ein Team aus Software- und Webentwicklern, innovativsten Designern, Ergonomen und Psychologen sowie führenden Musikern. Sieh dir das Programm an. Es muss leichter zu bedienen sein. Alle Funktionen müssen selbsterklärend und intuitiv sein, auch für Nichtmusiker und Laien muss die Zusammenstellung von Songs und das Mischen von Tonspuren easy sein und Spaß machen. Prüfe die App und entwickle diese zu einem vollständigen Tool! Neuartig, innovativ, perfekt zu bedienen für Laien!“ – dazu: „grafisch super hochwertig“, „optimiert für Smartphones und Tablets“.
- **Befund** (Rundgang als Laie, Bildschirmfotos aller Bereiche; ausführlich in `docs/KONZEPT_EINFACH.md`):
  - Rund 30 Bedienelemente auf dem ersten Bildschirm, mehrere ohne Beschriftung, zwei Beschriftungen liefen ineinander.
  - Kein geführter Weg zum Lied: Song bauen lag an drei Orten (Pult-Szenen, Stück → Song, Schnittraum), Mischen an vier.
  - Das Startbild erklärte Fingergesten statt zu sagen, was man hier machen kann.
- **Fünf Bereiche unten** (`Nav67`): **Start · Spielen · Song · Mischen · Mehr**. „Spielen“ ist der bisherige Bereich „Klang“. Pult, Beat, Schnitt, Bild und Stück liegen unter **Mehr**; der Schalter „Alle Bereiche in der Leiste zeigen“ holt sie zurück (`body.ktabsall`).
- **Start** (`Home67`, `#vStart`): „Was möchtest du heute machen?“ – großer Knopf **Song in 1 Minute**, sechs Kacheln (Melodie spielen, Klänge formen, Aufnehmen, Foto wird Musik, Live auflegen, Zusammen spielen), Karte „Dein Stück“ (▶, Song, Mischen, Meine Stücke), „Was ist das?“ und Hilfe. Die App öffnet nach „Eintauchen“ hier.
- **Song in 1 Minute** (`SongGen`): zwölf Stile – Pop, Lo-Fi, House, Hip-Hop, Rock, Ballade, Funk, Sommer, Filmmusik, Ambient, Techno, Jazz.
  - Ein Tipp legt ein neues Stück an: Stimmung und Tempo des Stils, bis zu sechs Klänge (Beat, Bass, Akkorde, Begleitung, Melodie, Refrain-Melodie) mit je einem Loop von vier Takten, Lautstärken, Plätze auf der Bühne.
  - Muster je Rolle aus Vorlagen (Schlagzeug, Bass, Akkord-Rhythmen, Arpeggien), Akkorde aus der Stimmung. Die Melodie entsteht als Motiv – Wiederholung auf dem neuen Akkord – Gegenmotiv – Schluss, betonte Töne sind Akkordtöne, Durchgangstöne pentatonisch.
  - Ablauf: Intro 4 · Strophe 8 · Refrain 8 · Strophe 8 · Refrain 8 · Break 4 · Refrain 8 · Outro 4 Takte (52 Takte, je nach Tempo 1:41 bis 2:53 min). Dieselben Teile stehen auch als Szenen im Pult.
  - Der Song spielt sofort. Das vorige Stück bleibt unter Meine Stücke.
  - **Neu würfeln** (alle oder ein Instrument): neue Rhythmen und Melodien im selben Stil, der Rest bleibt.
  - **Stimmung wechseln** (Knopf oben): der erzeugte Song zieht mit denselben Mustern in die neue Tonart und Akkordfolge um.
- **Song** (`SongUI`, `#vSong`) – neue Bedienung für den vorhandenen Song-Baukasten (`Song.sections`):
  - **Ablauf** als farbige Blöcke (Intro blau, Strophe türkis, Refrain pink, Break gelb, Outro grau). Antippen: umbenennen, − / ＋ Länge, ◀ ▶ verschieben, Doppeln, Löschen, „Ab hier hören“; ＋ hängt an.
  - **Wer spielt wann?**: je Instrument eine Zeile, je Teil ein Punkt (an/aus). Die Abspielstelle wandert durch Blöcke und Punkte.
  - Instrument antippen: neu würfeln, anderes Instrument (Töne bleiben), nur diesen hören, im Bereich Spielen öffnen, entfernen.
  - **🔁**: an = der Song beginnt am Ende nahtlos von vorn, aus = er hält an. Vorher liefen nach dem letzten Teil alle Spuren gleichzeitig weiter (behoben, gilt auch für Stück → Song).
  - **Song aufnehmen und teilen**: einmal von vorn bis hinten als Audio-Datei; die Aufnahme heißt wie das Stück.
- **Mischen** (`MixUI`, `#vMix`):
  - **Auto-Mix** in vier Fassungen (Ausgewogen, Druckvoll, Sanft, Weit): Lautstärke, Platz und Hall nach der Rolle.
  - Je Klang ein Regler mit Pegelstreifen, Stumm und „nur diesen hören“; „Alles“ = Gesamtlautstärke. Waagerecht ziehen regelt, senkrecht wischen blättert.
  - **Bühne**: Punkte ziehen – links/rechts = Panorama (`mx.pan`), vorn/hinten = nah und trocken bis weit weg mit Hall (`mx.hall`). Punkte pulsieren mit dem Pegel.
- **Erklär-Modus „Was ist das?“** (`Erkl`): danach erklärt jeder Tipp das Berührte in einem Satz und löst nichts aus (82 eigene Erklärungen, sonst die Beschriftung). Die Leiste weicht aus, wenn sie das Erklärte verdeckt.
- **Gestaltung:** Verlaufs-Knöpfe, Glas-Karten, feste Farben je Song-Teil und je Rolle, eigene Linien-Symbole, wandernde Abspielstelle, leuchtende Pegel. Eigene Fassungen für Tablets (ab 600/700/900 px: Raster mit Namen links, Regler einzeilig, Lautstärke und Bühne nebeneinander) und für das niedrige Querformat. Animationen aus bei „Bewegung reduzieren“.
- **Feinschliff:** Startbild sagt in zwei Sätzen, was man hier machen kann. „▶“ bei „Dein Stück“ und im Mischen zeigt nur „läuft“, wenn wirklich etwas klingt. Beschriftungen der Werkzeugzeile und der Schalterzeile laufen nicht mehr ineinander. Die Erklärkarten zum Formen-Spielen erscheinen erst beim ersten Besuch von „Spielen“.
- **Behoben nebenbei:** `Visual.run` stürzte ab, wenn ein Anzeige-Ereignis den Takt anhielt (danach liefen keine geplanten Ereignisse mehr, z. B. der Aufnahmestart).
- **Unabhängige Prüfung** (Test-Agent als Laie, echte Tipps und Fingergesten, fünf Bildschirmgrößen) – 15 Befunde, behoben:
  - Kritisch: Lief der Takt, aber nicht der Song (nach Rückgängig, Stückwechsel, Neuladen oder ▶ oben), spielten alle Loops gleichzeitig. Jetzt läuft der Song nach Rückgängig an derselben Stelle weiter, ein Stückwechsel hält an, ein Stück mit Ablauf beginnt nach dem Start still, und ▶ oben spielt den Song.
  - Der erzeugte Song startete mit geratenen Lautstärken (Auto-Mix lief, bevor die Rollen bekannt waren).
  - Stumm und „nur diesen“ gingen bei jedem Start verloren; die Song-Zeilen zeigen beides jetzt an.
  - Die Song-Ansicht sprang bei jedem Teilwechsel nach oben; Mischen zeigte nach Rückgängig alte Werte; Blättern über Reglern füllte den Rückgängig-Stapel.
  - Länge ändern, Verschieben, Doppeln und Löschen hielten den Song an (jetzt läuft er mit der neuen Fassung weiter); während der Aufnahme sind Änderungen gesperrt.
  - Stimmungswechsel behält das Tempo und ist rückgängig zu machen.
  - Erklär-Modus: 26 weitere Erklärungen (Startkacheln, Teil-Aktionen, Mehr-Blatt), Leiste beginnt unten, Ring verschwindet beim Blättern, Enter löst nichts aus.
  - Viele Teile: Punkte bleiben mindestens 30 px breit, das Raster rollt dann seitlich.
  - Ein noch unberührter erzeugter Song wird beim nächsten Stil ersetzt statt als weiteres Stück gesammelt. „Beat“ lässt sich nicht auf ein Tasteninstrument umstellen.
- **Tests:**
  - Prüfstand 134 (neu **SG** 12 Stile mit 1936 Tönen und Schlägen, alle in der Tonart, wiederholbar; **SF** Pop-Song anlegen, würfeln, Stimmung wechseln, Auto-Mix, speichern; **SN** Bereiche; **SE** Erklär-Modus; **SW** Song-Ende): 412×892 und 700×330 ohne Fehler (I1/P1 schwanken gelegentlich).
  - Layout: 412×892, 700×330 und 820×1180 TOTAL 0, jetzt auch mit den Zuständen Start, Song, Song mit offenem Teil, Mischen, Erklär-Modus. Bei 360×640 meldet nur der alte Zustand „Pads“ 7 Überlappungen (Formname/Pad-Leiste, von v67 nicht berührt).
  - E2E mit echten Tipps (`tools/t67_*.txt`): Start → Stil → Song spielt; Teil bearbeiten; Punkt an/aus; Wiederholen und Anhalten am Ende in Echtzeit; Aufnahme bis zum Blatt „Teilen“; Zeilenmenü (würfeln, Instrument wechseln); Regler ziehen, senkrecht blättern, Stumm, Solo, Bühne ziehen, Rückgängig; Stückwechsel und Neuladen.
  - Regression: Rock-Sets (v66), Tasten und Rückblick (v65), Pult-Szenen und Drop (v64), Pult (v63).
  - Hörproben aller 12 Stile (Strophe + Refrain, zusammen 4:52 min): Spitzen 0,85–0,94, keine Übersteuerung. Bassanteil bei Hip-Hop, Techno, House 73–85 % (genretypisch, aber nur gemessen, nicht gehört).
  - Website und `vorige/` (Version 66) lokal gestartet: keine Fehler, keine fehlenden Dateien.
- **Offen:** Bereich „Spielen“ ist weiterhin dicht belegt; Gesang und eigene Loops in den Song zu bringen ist noch kein geführter Schritt; Beschriftungen der Bühnenpunkte können sich überlappen.
## Neu in v66: Rock – Stoner, Grunge, Post-Grunge
- Christian (01.11. 10:17): „Ich möchte auch so spielen können wie Clutch, Pearl Jam, Bush – stelle entsprechende FormSets zusammen.“
- **Gitarren aus dem Gerät** (`RockSnd`): gezupfte Saite (Karplus-Strong mit Bruchteil-Verzögerung, Anschlagsposition, Helligkeit), Powerchord (Grundton, Quinte, Oktave, leicht gestaffelt), Verzerrer (tanh mit Vorspannung, beim Fuzz zusätzlich Oktav-Gleichrichtung) und Gitarrenbox (Hochpass, Glocke, Senke, zwei Tiefpässe).
  - Neue Klangsatz-Art `syn` (`Inst.makeRec`/`decode`-Wrapper): wird beim ersten Gebrauch berechnet (alle 4 Halbtöne ein Ton), ohne Netz und ohne Datei, läuft auch in der heruntergeladenen Datei.
  - Formen (Kategorie **Rock**): Crunch-, Fuzz-, Drop-D-, Clean- (mit Chorus) und Lead-Gitarre (gehalten, Schleife), Rock-Bass.
  - Im Pult heißen sie „🎸 Gitarre“.
- **Rock-Schlagzeug** (BBX-synthetisch):
  - Rock-Kit: Kick mit Klick, Snare mit Raum, Crash.
  - Grunge-Kit: große, hallige Snare.
  - Stoner-Kit: fette trockene Kick, Ride.
- **Stimmungen:** Stoner (E dorisch, 100 bpm), Grunge (E äolisch, Em–C–G–D, 116 bpm), Post-Grunge (D äolisch, Dm–B♭–F–C, 92 bpm).
- **Band-Sets** (`RockSets`): Riffs sind eigene Kompositionen im Stil, keine Songs der Bands. Sie kommen als Loops, die Formen drehen nicht, dazu Lautstärken und **Pult-Szenen mit Namen**:
  - **Stoner-Groove** (à la Clutch): Fuzz-Riff im Shuffle mit Blue Note, Riff-Bass, Stoner-Kit, Blues-Solo · Szenen Riff / Solo / Break.
  - **Grunge** (à la Pearl Jam): Clean-Arpeggio-Strophe, Crunch-Refrain, laufender Bass, Grunge-Kit mit Fill, Melodie-Solo · Szenen Strophe / Refrain / Laut.
  - **Post-Grunge** (à la Bush): Drop-D-Riff, Clean-Strophe, Powerchord-Refrain, Bass, Rock-Kit, Refrain-Melodie · Szenen Riff / Strophe / Refrain.
- **Einstiege:** ＋ Neu → Rock → Band-Sets (als neues Stück oder dazu) · Neues Stück → Stoner / Grunge / Post-Grunge · Hilfe „Rock spielen“.
- **Tests:**
  - Prüfstand 129 (neu RG, RK, RS, RL; I4 nimmt `syn`-Klänge aus), Layout 0/0.
  - E2E: Set Stoner → Pult mit 3 Szenen, Riff läuft (Spitzen 0,4–0,85), Solo-Szene auf der Eins; Rock-Kategorie mit 3 Set-Karten.
  - Hörproben gerendert (31/27/33 s, ohne Übersteuerung).
  - Hinweis: Die Bandnamen stehen nur in der Doku, in der App heißen die Sets nach dem Stil.

## v65: Melodien und Lieder auf Tasten · Rückblick schneiden · Kneten färbt jeden Klang
- Christian (31.10. 07:20):
  - „Merke dir immer die letzte Version, sodass wir ggf. zurückspringen können.“
  - Gezieltes Spielen wirklicher Melodien und Lieder für Menschen ohne Notenkenntnis.
  - Handling verbessern.
  - Rückblick geht verloren, wenn man neben das Fenster klickt; Tonspuren aus Aufzeichnungen schneiden und im Editor übereinanderlegen.
  - Modellierung wirkt nicht immer auf den Klang.
  - Das Flyout „Tonlage höher/tiefer“ geht manchmal nicht wieder weg.
- **Zurückspringen:**
  - `tools/mkvorige.py` legt vor jeder Veröffentlichung die bisherige Website-Fassung unter `vorige/` ab. Sie hat keinen Service Worker, nutzt `<base href="../">` und zeigt oben den Hinweis „Vorige Version NN · zur aktuellen“. Sie nutzt denselben Speicher.
  - Jede Version steht mit Commit in `docs/VERSIONEN.md` (wiederherstellen mit `git show <commit>:index.html`), das Artifact hat zusätzlich seine eigene Versionsliste.
- **🎹 Tasten** (Werkzeugzeile vorn, Kreis → Werkzeuge, Pult-Kachel „Melodie spielen“), Konzept in `docs/KONZEPT_MELODIE.md`:
  - zwei Reihen farbiger Tasten, nur Töne der Tonart; die obere Reihe ist eine Oktave höher, mit gleicher Farbe genau darüber. Im Querformat eine Reihe mit 15 Tasten.
  - Wischen spielt einen Lauf, weiter unten auf der Taste ist lauter.
  - Instrument-Leiste: alle Formen mit Instrument plus „＋ Klavier/E-Piano/Gitarre/…“. ◀ tiefer / höher ▶ verschiebt um eine Oktave.
  - Beschriftung wählbar: 1 2 3, Do Re Mi oder C D E (deutsch, H statt B).
  - **Akkord-Knöpfe** (I IV V VI II III mit Namen): halten = Akkord klingt, die Formen folgen.
  - **Melodie aufnehmen** (1/2/4/8 Takte oder frei, mit Einzählen) erzeugt einen Ton-Loop der Form.
- **Lieder** (gemeinfrei): Alle meine Entchen (10 Takte), Hänschen klein, Bruder Jakob, Ode an die Freude, Morgen kommt der Weihnachtsmann, Jingle Bells, Kanon in D.
  - ▶ Vorspielen (die Tasten leuchten mit).
  - **Nachspielen**: Lernzeile mit farbigen Punkten, die nächste Taste pulsiert, kein Zeitdruck; „Geschafft!“ bietet „Als Loop“ an.
  - **Als Loop**: das Lied wird ein Loop der Form, auf Wunsch kommt die Begleitung (E-Piano, Akkorde) als eigene Form dazu.
  - **Lied-Akkorde**: Alle Formen folgen der Akkordfolge des Lieds (Schalter „Akkorde: Lied/Stimmung“, gespeichert als `d.lied`).
  - In Moll-Stimmungen gibt es den Knopf „Auf Dur stellen“.
  - Ton-Loops dürfen jetzt bis **16 Takte** lang sein.
- **Rückblick schneiden:**
  - Der Rückblick-Knopf öffnet jetzt einen **Schnitt-Editor**: Welle mit Taktlinien, zwei Griffe (oder über die Welle wischen), antippen = ab dort anhören.
  - **rastet auf Takte ein**: Die Zeit kommt von der Uhr des Audiosystems (`t0` des Aufnahme-Worklets plus gezählte Samples). Gemessen liegen die Schläge 12 ms nach der Taktlinie.
  - „⤢ Ausschnitt groß“, „− / + Takt“.
  - Was mit dem Ausschnitt passieren kann:
    - **✂ In den Schnittraum**: als Clip auf einer neuen Spur, dort verschieben, kürzen, teilen, übereinanderlegen, mischen.
    - **🔁 Als Loop ins Pult**: 1/2/4/8 Takte, phasengenau zum laufenden Takt.
    - **🎹 Als Klang-Form**.
    - **💾 Als eigene Aufnahme** und **Teilen**.
    - **🗑 Verwerfen**.
  - Der Rückblick liegt sofort unter Stück → Aufnahmen. Ein Tipp neben das Blatt schließt es nicht mehr. Wird es geschlossen, erscheint „Wieder öffnen“.
- **Kneten → Klang, Befund:** Gemessen wurden Spektren vor und nach dem Kneten mit „spitz“, „glatt“ und „Beule“:
  - Synths: stark hörbar.
  - echte Instrumente, Techno-Samples, Aufnahmen und Gesangschnipsel: deutlich hörbar (Höhen +10 bis +18 dB).
  - **Drum-Kits** (alle, auch die harten): **keine Wirkung** (±1 dB).
  - **Loop-Formen**: nur „rund“ wirkte, und auch das schwach.
- **Kneten → Klang, behoben:**
  - Drum-Kits bekommen Helligkeit, Metall, Rauheit und leichte Verzerrung relativ zur Startform, mit Pegelausgleich (gemessen: Höhen +7 bis +9 dB, Schwerpunkt +1,1 bis +1,5 kHz).
  - Loop-Formen werden spitz heller (Höhen bis +11 dB), rund dumpfer (Tiefpass bis 350 Hz) und rau angezerrt (WaveShaper). Die Startform ist jetzt neutral; vorher lag immer ein Tiefpass bei 9 kHz.
- **Tonstufen-Anzeige („♪ 2 Stufen höher“), Befund:** Sie wurde im Knet-Modus alle 0,5 s neu eingeblendet und nach dem Verlassen nie ausgeblendet.
- **Tonstufen-Anzeige, behoben:** Sie verschwindet jetzt 2,2 s nach der letzten Änderung, beim Bereichswechsel und bei offenen Blättern.
- **Nebenbei behoben:**
  - „Töne bearbeiten“ öffnete nicht den gewählten Loop (`Stueck.editLoop` reichte `tid` nicht weiter).
  - Ein `UI.hideSheets`-Wrapper verlor sein Argument.
- **Tests:**
  - Prüfstand 125 (neu KD, LK, KB, LI, AL, LO, RE, TB): 412 → 0 Fehler, 700 → nur der schwankende T3. Layout 0/0.
  - E2E Tasten: Tonleiter, Akkord F halten (alle Formen folgen), Nachspielen (5 richtige Tasten → nächste pulsiert), Melodie aufnehmen (Loop 1), Ode an die Freude als Loop + Begleitung, Querformat mit 15 Tasten.
  - E2E Rückblick: Taktraster, Griff ziehen (3 → 2 Takte), Tipp daneben (Blatt bleibt), Schnittraum-Clip, Loop im Pult (5 → 4 Takte).
  - `vorige/` geprüft: Version 64 startet, Instrumente laden, keine 404.

## v64: Szenen und Drop im Pult · ein Loop · Ansicht „Alle“ entzerrt
- Christian (30.10. 08:05): „Alle“ – die vier vorgeschlagenen nächsten Schritte aus v63 umsetzen.
- **Szenen** (Zeile über den Pult-Feldern, 8 Plätze): ＋ tippen = merken, was gerade läuft (Zahl unten = Anzahl Klänge). Gemerkte Szene tippen = genau diese Klänge, eingereiht auf der nächsten Eins (Feld blinkt, aktive Szene leuchtet). Halten = neu merken, Meldung mit „Löschen“. Wird im Stück gespeichert (`d.pscn`).
- **Drop** (fünfter Live-Griff): tippen → zur nächsten Eins wird es einen Takt still, ein Rauschen steigt an (Bandpass 300 Hz → 7 kHz), dann kommt alles mit Sub-Drop + Hardstyle-Kick auf der Eins zurück. Nochmal tippen = abbrechen; ■ setzt alles zurück.
- **Ein Loop-Begriff:** Werkzeugzeile, Kreis-Menü und Pult heißen nur noch „Loop“ (nimmt auf, was gerade klingt → Spur im Pult + Loop-Form). Die gespielten Töne als bearbeitbaren Loop: Steuerfeld → Loops → „Töne loopen“. Im Steuerfeld steht wieder 🎤 Mikro statt dem zweiten Loop-Knopf.
- **„Alle“ mit vielen Formen** (mehr als 6, oder Querformat unter 520 px Höhe mit mehr als 3): kompaktere Namensschilder (gekürzt, ohne Zusatzzeile), Einsatz-Knöpfe nur bei wartenden Formen.
- Prüfstand 117 (neu **SZ**, **DR**, **LB**; PU/LR angepasst), Layout 0/0. E2E mit 9 Formen: Szene 1 (Klavier, Hardstyle-Beat, Hardstyle-Lead) und Szene 2 (Trommel, 808) gemerkt, Szene 1 tippen → nach der Eins genau Szene 1; Drop → still → alle 3 zurück; Alle im Querformat 900×420 → kompakt.

## v63: PULT – live spielen für Laien · harte Bassbeats
- Christian (30.10. 07:50, Bildschirmfoto Querformat mit 9 Formen): „Auf dem Handy lässt sich die App echt noch schlecht bedienen, wenn viele Formen enthalten sind. Außerdem ist die Loop-Steuerung, das Einsetzen und Stoppen von Sounds noch nicht wirklich intuitiv. Überlegt im Team aus Webdesignern, Programmierern, Künstlern, Musikern und dem Apple-Designteam … Ziel: jeder Laie kann gute elektronische Tracks mischen und aufnehmen. Auch Live-Performance soll einfachst möglich sein! Wir brauchen noch Formen für richtig harte und tiefe Bassbeats!“
- Team-Konzept: `docs/KONZEPT_PULT.md` (GitHub). Kernentscheidungen: Einsatz auf der Eins, eine Form = ein großes Feld, drei Live-Griffe (Filter, Break, Echo), Mitschnitt.
- **Bereich „Pult“** (ersetzt „Loop“, die Loopstation liegt darunter): Raster großer Felder (eins je Form, Typ 🥁 Beat · 〰 Bass · ⚡ Synth · 🎹 Ton · 🎤 Klang · 🔁 Loop), leuchten in Formfarbe, Pegel und Schlag-Puls. **Tippen** = ein/aus **auf der nächsten Eins** (Feld blinkt „setzt ein …“/„stoppt …“, nochmal = abbrechen); steht alles, startet sofort nur dieses Feld. **Halten** = nur diese Form hören. Oben Tempo −/+ und großer ▶/■. Felder „＋ Neuer Klang“ und „🔴 Loop aufnehmen“.
- **Live-Effekte:** Filter-Schieber (links dumpf bis ~80 Hz Tiefpass, rechts dünn bis ~7 kHz Hochpass, mit Resonanz; Doppeltipp = aus; hinter `Engine.out`, also auch im Mitschnitt und für Loops/Gesang), **Echo** halten (Echo-Wurf), **Break** halten (nur Beats, loslassen → alles kommt auf der Eins zurück), **● Mitschnitt** (ganzer Track). Schalter „⏱ Einsatz auf der Eins / ⚡ sofort“. Auch ▶/⏸ an den Formen im Klang-Bereich setzt jetzt auf der Eins ein.
- **Harte Bassbeats** (＋ Neu → Techno & Bass → „Harte Bassbeats“, synthetisch wie die Beatbox): **Hardstyle-Beat** (verzerrte Kick mit Schweif, Riesen-Clap, Metall-Hat, Sub-Drop), **808-Trap-Beat** (1,4 s 808, Trap-Snare, schnelle Hats, 808-Rutscher), **Bass-Drop-Beat** (Kick + Sub, Clap, Hat, Reese-Schlag), **Drum'n'Bass-Beat**. Neues Stück → „Harter Bassbeat“.
- Prüfstand 116 (neu **HB**, **PQ**, **PU**; ES/AR/BB angepasst), Layout 0/0. E2E mit 9 Formen: Feld tippen → „setzt ein …“ → nach der Eins „läuft“; halten → nur Klavier; Filter −70 → 412 Hz; Break → nur Beats, danach alles zurück.

## v62: Formen einzeln starten · Loops direkt aufnehmen · Loops im Raum mischen · neue Oberfläche
- Christian (29.10. 20:21): „Die App soll noch viel übersichtlicher werden. Die Oberfläche soll cooler werden. Die Aufnahme von Loops soll einfacher und direkter werden. Die Formen sollen sich auch einzeln wieder andrehen lassen, ohne dass alle angehen! Loops sollen im Raum gemischt werden können.“
- **Einzeln starten – Befund:** Oben ■ hält den Takt an, die Formen behalten ihren Schwung. Ein ▶ an einer Form startete den Takt – und damit alle, die vorher liefen. Außerdem zeigten die Formen bei stehendem Takt ⏸ („läuft“), obwohl nichts klang.
- **Neu (`SoloStart`):** ▶/⏸ an Namen, Raum-Punkten und in der Form-Ansicht zeigt jetzt, ob die Form wirklich klingt (Takt läuft, nicht ausgeblendet, dreht oder ihre Loops laufen). Steht der Takt, startet ▶ an einer Form **nur diese** – die anderen werden angehalten (Schwung bleibt, Ton-Loops ausgesetzt, Loopstation-Spuren ohne Form aus) und lassen sich einzeln mit ihrem ▶ dazuholen; oben ▶ startet alle. Gilt auch für „Dreht/Steht“, Anschubsen und Tempo-Knöpfe. Gemessen: ■ → ▶▶▶, ▶ an Klavier → nur Klavier läuft.
- **🔴 Loop direkt** im Steuerfeld jeder Form (ersetzt „Mikro“): nimmt in die nächste freie Spur der Loopstation auf – Quelle in der Klang-Ansicht standardmäßig 🎛 Formen (was du spielst), lang drücken = 🎤 Mikrofon; nochmal tippen = fertig (läuft der Takt: zur nächsten Eins / zur nächstgelegenen Eins). Der Ton-Loop-Knopf heißt jetzt **„Ton-Loop“** (gespielte Töne, veränderbar) – klar getrennt vom Audio-Loop. Behoben dabei: der Knopf wurde alle 0,3 s neu gezeichnet und war während der Aufnahme schwer zu treffen.
- **Loops im Raum mischen:** Die Lage der Loop-Form bestimmt Lautstärke (Nähe), Panorama (links/rechts), Hall (Höhe) und Höhen/Tiefen – wie bei jeder Form (`f.mixNow` → Gain/Pan/Hall-Send/Kuhschwanz-Filter der Spur). Alle Spuren bekommen eine Form (auch ältere). Loop-Formen haben im Raum einen violetten Ring 🔁 am Punkt; Loopstation → „◍ Im Raum mischen“.
- **Neue Oberfläche:** Leuchtverlauf aus dem Logo (Blau → Violett → Pink) für aktive Knöpfe, Hauptknöpfe, Bereichs-Leiste (leuchtender Hintergrund + Strich), Ansichtswahl Form/Alle/Raum; Steuerfeld, Blätter, Meldungen und Leisten als Glas (Unschärfe, feine Kanten, Leuchtlinie oben); Loopstation-Kacheln im selben Stil; Ansichten mit sanftem Farbverlauf.
- Prüfstand 113 (neu **ES**, **RM**, **LR**; **AR** an die neue ▶-Bedeutung angepasst; Rundungsfehler bei der Overdub-Stelle behoben), Layout 0/0. E2E: einzeln starten, 🔴 Loop aus der Klang-Ansicht → Spur 1 + Form „Loop 1“, Ring im Raum.

## v61: Einzelklang → Instrument oder Loop · stabilerer Klang · schneller Start · wo die Stücke liegen
- Christian (28.10. 18:49/18:50): „Ich möchte auch einzelne Geräusche, Gesang oder Töne aufnehmen, loopen und als Form verwenden können! Die Tonwiedergabe ruckelt manchmal – prüfen und beheben.“ – „Das Starten der Seite dauert ziemlich lange. Wo werden die erzeugten Stücke gespeichert?“
- **🎤 Einzelklang aufnehmen** (Loopstation, großer Knopf unter der Quelle): bis 8 s, nochmal tippen = fertig; Stille davor/danach wird abgeschnitten, Pegel angeglichen. Danach Auswahl **▶ Anhören · 🎹 Instrument-Form** (über `MicFix.toForm`: Tonhöhe erkannt, spielbar in der Tonart, drehen = Melodie, kneten = Klang) · **🔁 Loop** (Klang auf der Eins, Länge = Loop-Länge bzw. 1 Takt, wird wie jede Spur auch Form „Loop n“) · **Beides**. Je Spur **🎹**: der deutlichste Klang des Loops wird Instrument-Form „Klang n“.
- **Ruckeln – Befund:** (1) Der Takt plante nur 120 ms voraus; hakte der Hauptfaden (3D-Bild, Kneten, Ansichtswechsel), kamen Töne zu spät (gemessen bei 4-fach gedrosselter CPU: Lücken bis 144 ms). (2) Bei vielen gleichzeitigen Stimmen wurde die älteste hart abgeschnitten → Knackser. (3) Die heruntergeladene Datei läuft auf Android ohne Audio-Faden (Notbetrieb) – dort ruckelt es am ehesten.
- **Behoben:** Zeitgeber des Takts in einem eigenen Worker (Lücken jetzt höchstens 74 ms statt 144 ms bei 4× gedrosselter CPU); Vorlauf wächst bei Hängern automatisch bis 0,4 s und sinkt langsam auf 0,12 s (Handy 0,16 s); Stimmen werden über einen Block weich ausgeblendet statt abgeschnitten, Höchstzahl am Handy 28; **Menü → 🔊 Klang: automatisch / stabil (mehr Puffer) / schnell** (Puffer des Audiosystems, wirkt nach Neuladen; automatisch = am Handy „balanced“); Notbetrieb am Handy mit doppelt so großem Block.
- **Schneller Start (Website):** Service Worker (`sw.js`, von `tools/mksite.py` erzeugt) hält App, Symbole und geladene Instrumente auf dem Gerät – ab dem zweiten Start ohne Download, auch offline; neue Version wird im Hintergrund geladen, dann „Neue KLANGRAUM-Version geladen – Neu starten“. Erster Start bleibt ein Download von ~8,8 MB (komprimiert; 12 MB davon sind eingebettete Instrumente).
- **Stücke-Speicher:** im Browser-Speicher (IndexedDB) auf diesem Gerät, getrennt je Adresse (GitHub-Seite, Claude-Ansicht, heruntergeladene Datei); nichts geht ins Internet. KLANGRAUM bittet den Browser jetzt um dauerhaften Speicher (`navigator.storage.persist`). Umziehen/Sichern: Meine Stücke → Sichern und Laden. Hilfe ergänzt.
- Prüfstand 110 (neu **EK**, **TV**), Layout 0/0. E2E: Einzelklang (Fake-Mikro) → Blatt → Beides → Instrument-Form „Klang 1“ + Spur 1 läuft als Loop-Form; Spur → 🎹 → „Klang 1“.

## v60: Loopstation selbsterklärend · Loops verschieben · jeder Loop wird eine Form
- Christian (28.10. 08:56): „Die Loopsteuerung und Übersicht ist noch nicht selbst erklärend. Welcher Loop wird wann wo aufgezeichnet, wann läuft er, wann wird gestoppt, Loops sollten auch einfachst zeitlich verschoben werden können. Wenn ein neuer Loop eingespielt wird, soll dieser auch als Form erscheinen und zunächst bei Drehung unverändert spielen. Dem Nutzer soll es aber auch möglich sein, die Form zu modellieren und so Einfluss auf Klang, Geschwindigkeit, Höhe usw. zu nehmen.“ Außerdem: Weiterarbeit über GitHub, Projektgedächtnis dort ablegen.
- **Takt-Uhr** oben: Takte des Loops als Kästchen (aktueller leuchtet), 4 Schlag-Punkte, „▶ Musik starten / ■ stoppen“. **Vier Schritte** als Anleitung (Aufnehmen · Schließen · Läuft · Dazu), der aktuelle Schritt leuchtet.
- **Spuren als Zeilen**: links großes Feld mit Klartext („Gleich: Aufnahme – beginnt in 2 Schlägen · zur Eins“, „● Nimmt auf – Takt 1 von 2 · hört von selbst auf“, „▶ Läuft – 2× so schnell · +5 Halbtöne“, „⏸ Form steht“, „■ Gestoppt – tippen = läuft im Takt weiter“), rechts Wellenbild mit Taktstrichen und Abspielkopf (bzw. roter Fortschritt beim Aufnehmen), „als Nächstes“ markiert die nächste freie Spur. Knöpfe ▶ Start/■ Stopp · ◀ ▶ · ↶ · Lautstärke · ✕.
- **Verschieben**: Wellenbild seitlich ziehen (rastet auf Sechzehntel) oder ◀ ▶; Anzeige „2/16 später“, „1 Schlag früher“. Technik: `t.shift` (Sechzehntel); Spur beginnt bei `(step − shift) mod L = 0`; Overdub-Ziel rechnet den Versatz ein. **Behoben dabei:** Aufnahmen, die nicht auf der Loop-Eins begannen (feste Länge ab Takt 2 …), lagen bisher verschoben – jetzt Versatz = Starttakt.
- **Loop = Form**: jede neue Aufnahme legt die Form „Loop n“ an (dreht mit 1 U/Takt). Dreht sie, läuft der Loop unverändert; Anhalten = Loop pausiert (Feld/Start setzt beide fort). Kneten → Tonhöhe (KneadPitch-Stufen in der Tonart → Halbtöne), Spitzheit → Helligkeit (Tiefpass), schneller/langsamer drehen → ×2/×½ (Zweierpotenz, bleibt im Takt), Lautstärke/Einzeln/Blenden/Raum-Panorama/Hall wie jede Form. Mit Änderungen spielt der Loop in Schlag-Scheiben (je Schlag neu angesetzt, Rhythmus bleibt). Antippen der Form spielt den Schlag an der getippten Höhe. Spur leeren entfernt die Form; Form löschen lässt die Spur weiterlaufen („＋ als Form“ legt sie neu an). Steuerfeld der Loop-Form erklärt die Bedienung.
- Prüfstand 108 (neu **LX1–LX5**; LS5 an neue Ansicht angepasst), Layout 0/0. E2E: frei aufnehmen → Form „Loop 1“ läuft; Ziehen = 2/16 später, ◀ = 1/16; 6× schneller + Kneten → ×2, +5 Halbtöne (Scheiben); Form angehalten → „⏸ Form steht“, Feld tippen → läuft wieder.
- **GitHub** ist ab jetzt die Arbeitsbasis: Repository `123ChriSD/klangraum` (öffentlich, GitHub Pages `https://123chrisd.github.io/klangraum/`) mit Website, `docs/` (Projektgedächtnis), `src/` (Module, Bauskripte), `tools/` (Prüfstand, Website-Bau), `CLAUDE.md` (Arbeitsregeln). Das Artifact wird weiter mitgepflegt.

## Eigene Website vorbereitet (28.10.)
- Christian (07:12): „Bereite die Seite vor.“ → Paket für GitHub Pages: `index.html` (v59, vollständiger Kopf, als App installierbar: Manifest, Symbol, Vollbild), Ordner `s/` mit den Instrumenten-Aufnahmen (CC-BY, Quellen beigelegt), README. Auf der eigenen https-Adresse fragt der Browser direkt nach dem Mikrofon – kein eigenes Fenster, kein Umweg. Einladungs-/„sicherer Link“ zeigt dort auf die eigene Adresse.
- 28.10. 08:28: Repository `123ChriSD/klangraum` (öffentlich) angelegt; alles hochgeladen (232 Dateien, Zweig `main`). Offen: Pages einschalten (Settings → Pages → Branch main, / (root)) → `https://123chrisd.github.io/klangraum/`. Künftige Versionen: `index.html` im Repo mitaktualisieren (Kopf + `JamInvite.URL`-Anpassung wie im Paket).

## Neu in v59: Mikrofon in der Handy-Datei richtig erkannt
- Christian (28.10. 07:09, Bildschirmfoto Prüfseite in content://downloads): App startet jetzt (Protokoll: alle Startschritte ok), Mikrofon: `getUserMedia: NotAllowedError Permission denied`.
- **Befund:** Das aktuelle Chrome auf Android stellt in `content://` die Mikrofon-Schnittstelle bereit, lehnt aber ohne Rückfrage ab. KLANGRAUM hielt das für „vom Nutzer verweigert“ und riet, die Erlaubnis über das Schloss-Symbol zurückzuholen – das gibt es dort nicht.
- **Neu:** `content://` (und `file://` auf Android) gilt immer als „Datei ohne sichere Adresse“ → 🎤 Mikro, Loopstation und Gesang führen direkt zu „KLANGRAUM über den sicheren Link öffnen“ (Stück wird mitgenommen) bzw. zur Aufnahme-App.
- **Klar ist:** In der heruntergeladenen Datei auf Android gibt es kein direktes Mikrofon – nur über den Link (dort „Im eigenen Fenster“) oder eine eigene https-Adresse.

## v58: Download startet wieder · Erklärkarten nie mehr festgeklemmt
- Christian (28.10. 06:39, Bildschirmfoto content://downloads): „Die lokal gedownloadete App hängt, startet weiterhin nicht! Auch das Artefakt hängt in den ersten Erklärdialogen fest!“
- **Ursache Download (bewiesen am Bildschirmfoto):** Im Startbild waren „Loop gleich ■ Fertig“ und „Isoliert … Fertig“ zu sehen – Elemente mit `hidden`. Die App verließ sich darauf, dass der Artifact-Rahmen `[hidden]{display:none!important}` mitbringt; die Download-Dateien ab v55 hatten diesen Rahmen nicht (v57 nur doctype/utf-8). Dadurch blieben alle versteckten Elemente sichtbar – auch das Startbild nach „Eintauchen“ (die App lief dahinter, man sah nur „Einen Moment …“).
- **Ursache Artifact (nachgestellt):** Die Erklärkarten waren mittig fest eingepasst, ohne Scrollen. Bei großer Schrift / wenig Höhe (Claude-App) lag „Weiter“ unterhalb des Bildschirms (Test 360×520: Knopf bei y = 526) → nicht erreichbar. Außerdem lagen Meldungen über den Karten (z-index 70 > 66).
- **Neu:** Regel `[hidden]` in der App selbst; Download-Datei mit vollständigem Rahmen. Erklärkarten scrollbar, Knopfzeile klebt unten, Bild kleiner bei wenig Höhe, über allen Meldungen (z 76), „Erklärungen überspringen“, Tipp neben die Karte / Esc schließt, Enter blättert. Meldungen warten, solange die Karten offen sind, und erscheinen danach.
- Getestet: v57 im Artifact-Rahmen bei 360×520 bleibt hängen (Knopf nicht tippbar), v58 blättert alle Karten, „Überspringen“ schließt; Download-Datei: Startbild verschwindet, Banner bleiben versteckt. Prüfstand 103 (T3 Bildrate im Container schwankend), Layout 0/0.

## v57: Download-Datei repariert · Startwächter vor allem anderen
- Christian (27.10. 23:45): „Startet weiterhin nicht in Chrome nach Download.“
- **Befund:** Die Download-Dateien von v55 und v56 waren ohne Dateikopf ausgeliefert (kein `<!doctype html>`, kein `<meta charset="utf-8">` – v53/v54 hatten ihn). Im Browser lief die Datei dann im Quirks-Modus mit geratener Zeichenkodierung (Umlaute als „â€¦“). Im Test startete sie trotzdem (Chromium am Rechner, Android-Kennung, unsichere Adresse, 6-fach gedrosselte CPU, Notbetrieb) – die genaue Ursache auf Christians Handy ist damit noch nicht bewiesen.
- **Neu:** Download-Datei wieder als vollständiges Dokument (doctype, utf-8, viewport). **Früher Startwächter** (eigenes kleines Skript vor allen anderen): sammelt Fehler schon beim Laden – auch Syntaxfehler, bei denen das Hauptskript gar nicht läuft – und zeigt 9 s nach „Eintauchen“ (bzw. sofort, wenn die App nicht geladen ist) einen Kasten im Startbild: „Hängt bei …“, Fehlertext, Browser, Adresse; Knöpfe „Neu laden“, „Ohne Audio-Thread neu laden“, „Text kopieren“. Getestet: hängender Start, absichtlich kaputtes Skript („Unexpected token … Zeile 16031“), normaler Start ohne Kasten.
- **Regel:** Die Download-Datei immer mit Kopf ausliefern (`v57a.py` schreibt sie selbst).

## v56: Start abgesichert – kein Hängen mehr bei „Einen Moment …“
- Christian (27.10. 23:35): „Die App startet nicht. Nach Eintauchen kommt nur ‚Einen Moment‘ auf dem Button.“
- **Ursache (nachgestellt):** `App.enter` wartete ohne Zeitgrenze auf das Laden des Audio-Threads (`audioWorklet.addModule`) und auf `ctx.resume()`. Bleibt eines davon hängen (in eingebetteten Ansichten/WebViews möglich), blieb der Knopf für immer auf „Einen Moment …“. Außerdem brach jeder Fehler in einem späteren Startschritt (Aufnahmen an den Klangmotor, Schlagzeug, Formen neu berechnen, Takt) den Start still ab. Test mit absichtlich nie fertigem `addModule`: v55 bleibt hängen, v56 startet (Notbetrieb).
- **Neu:** Audio-Thread je Weg höchstens 4 s, dann der nächste Weg bzw. Notbetrieb; `resume()` höchstens 2,5 s (der Ton wird bei der nächsten Berührung angeworfen). Jeder Startschritt läuft für sich (`StartGuard`): ein Fehler wird ins Protokoll geschrieben und nach dem Start gemeldet („Details“ → Prüfseite mit Protokoll), der Start geht weiter. Wächter: hängt der Start dennoch 11 s, erscheinen „Erneut versuchen“ und „Ohne Audio-Thread starten“ (merkt sich den Notbetrieb; später „Normal starten“). Doppelte Starts werden verhindert.
- **Behoben (Loopstation):** Gespeicherte Spuren galten nach dem Neuladen als „fehlt“, weil sie vor dem Ton geladen wurden → werden jetzt nach dem Start geladen und spielen.
- Prüfstand 103, Layout 0, Loopstation-E2E wie v55.

## v55: Loopstation · feineres Drehtempo · eigener Bereich „Loop“
- Christian (27.10. 19:19): „Ich möchte eine richtige Loopstation aus der App machen! Dazu müssen Geräusche unbedingt direkt aufgenommen und abgespielt werden können. Auch gespielte Passagen von Formen sollen geloopt werden können. Browser dürfen das Mikrofon nicht blockieren. Die Steuerung der Drehgeschwindigkeit soll noch sensitiver werden. Die App noch übersichtlicher und intuitiver.“
- **Loopstation (`LoopSt`, Bereich „Loop“ unten, zweiter Reiter):** 4 Spuren (bis 6 mit „＋ Spur“), jede ein großes Feld. Quelle **🎤 Mikrofon** (Geräusche, Stimme, Beatbox, Gitarre …) oder **🎛 Formen** (Audio der Summe `Engine.sum` – Formen, Beat, Hall; die Loopstation selbst hängt an `Engine.out` und wird nicht mit aufgenommen). Zustände: leer → ● Aufnahme → ▶ läuft → ✚ Overdub → ▶ läuft; ■/▶ je Spur (startet im Takt an der richtigen Stelle), ↶ letzten Overdub zurücknehmen, Lautstärke, ✕ bzw. **lang drücken = leeren** (Rückgängig), während der Aufnahme lang drücken = abbrechen. „▶ Alle spielen / ■ Alle stoppen“, „Alles leeren“, „×2 länger“ (verdoppelt alle Spuren), „Datei als Spur …“.
  - **Erster Loop „Frei“** (Musik steht): antippen = sofort aufnehmen, nochmal antippen = Loop schließen; **die Länge bestimmt das Tempo** (`fitBars`: 1/2/4/8/16 Takte, möglichst 70–150 BPM); der Takt beginnt genau beim zweiten Tippen, der Loop schließt nahtlos an. Gemessen: 3,42 s → 2 Takte, 140,3 BPM, Pufferlänge = Loop-Länge auf 1 ms.
  - **Musik läuft schon**: Aufnahme ab der nächsten Eins, Ende an der Eins, die dem zweiten Tippen am nächsten ist (Hinweis mit „■ Musik stoppen“ für freies Tempo). **Feste Länge** 1/2/4/8 Takte: ein Takt Einzählen (Klicks), dann genau so lange. Weitere Spuren übernehmen die Loop-Länge und beginnen zur nächsten Eins.
  - **Overdub** sofort ab dem Tippen, auch über mehrere Runden; wird beim Beenden an der richtigen Loop-Stelle in den Puffer gemischt (Laufzeitausgleich wie bei Gesang: Ein- + Ausgabeverzögerung), weiche Ränder, sanfte Begrenzung. Vorige Fassung bleibt als „↶“.
  - **Formen als Quelle**: KLANGRAUM wechselt zu den Formen, rote Leiste oben (antippen = fertig), auch im Steuerfeld einer Form unter **Loops → 🔁 Passage → Loopstation** und über den Chip **🔁 n** im Steuerfeld. Danach Angebot „Formen anhalten“, damit die Passage nicht doppelt klingt. Während Aufnahmen gilt der Aufnahmeschutz (kein Kreis beim langen Drücken).
  - Abspielen: je Loop-Runde ein `AudioBufferSource` zur Loop-Eins, `playbackRate = Tempo / Aufnahmetempo` (Tempo ändern = wie ein Band schneller/langsamer). Gespeichert als Aufnahmen (Art „loopstation“) + `d.ls = { L, slots[{rec, prev, vol, on, bpm, ch, src}] }`; beim Übertragen aus dem eigenen Fenster werden die Verweise umgeschrieben. Form-Loops (Töne) stehen unten in der Loopstation (aussetzen/einsetzen, „Verwalten“).
- **Mikrofon nicht blockiert – was geht und was nicht:** In der claude.ai-Ansicht sperrt die Einbettung das Mikrofon; Artifacts haben dafür weiterhin keine Freigabe (Laufzeit 0.2.85 … 0.2.91: assets, db, downloads, room, user … – kein Mikrofon). Die Loopstation zeigt dann eine Karte **„🎤 Mikrofon freischalten“** → **Im eigenen Fenster öffnen** (Stück mit allen Loops wird mitgenommen und zurückgebracht) bzw. in der Handy-Datei → **sicherer Link**; oder **Aufnahme-App / Datei** → die Aufnahme wird zum Loop (Anfang automatisch gefunden, Länge passend). Am Rechner (Doppelklick auf die Datei) und im eigenen Fenster geht das Mikrofon direkt. Dauerhaft ohne Umweg nur mit eigener https-Adresse (GitHub Pages mit öffentlichem Repository oder Cloudflare Pages).
- **Drehtempo feiner:** Gekoppelte Drehungen rasten jetzt auf **12 Schritte je Verdopplung** ein (vorher nur 5 Stufen: 0,25/0,5/1/2/4 U/Takt), phasengenau im Takt; der Rhythmus (Halbe … Zweiunddreißigstel) folgt der nächstliegenden Stufe. **− / +** ändern um × 1,12 (vorher × 2), neuer **Regler** im Steuerfeld → Drehen (0,125 … 4 U/Takt, logarithmisch, Anzeige „0,84 U/Takt“), kurze Rückmeldung bei jedem Schritt. Anschubsen und Loslassen werden dadurch automatisch feiner abgestuft.
- **Übersichtlicher:** sechs Bereiche unten (Klang · **Loop** · Stück · Beat · Schnitt · Bild); „Loop“ leuchtet, solange die Loopstation spielt; Loopstation im Kreis-Menü (Mehr) und in der Hilfe („Ich will …“ ganz oben, neues Thema „Loopstation“).
- Prüfstand 103 (neu **LS1–LS5**, **FT**; **BW**, **AX**, **MV** an das feine Raster angepasst), Layout 0/0 (412×892, 700×330). E2E mit simuliertem Mikrofon: frei (Tempo aus Länge), Overdub, feste Länge, Formen-Passage (Stereo), Stopp, Leeren per langem Druck, Speichern/Neuladen, Regler; nachgebaute Einbettung → Karte + Auswahl „Im eigenen Fenster öffnen“.

## v54: Beatbox-Kits · Mehrere Instrumente auf einem Körper · Riffs als Loop einspielen · Aufnahme robuster
- Christian (26.10. 21:36): „Entwickle noch mehr Beatbox-Klänge. … verschiedene Instrumente auf einen Körper legen und live spielen. … echte Gitarren-Riffs in der App einspielen. Gesangsaufnahme klappt noch nicht.“
- **Beatbox (`BBX`):** 16 Mundklänge synthetisch berechnet (Lippen-Plosiv, Kehle, Summen, Zunge, Atem; Biquad-Filter, Rauschen, Hüllkurven) in 4 Kits als Formen unter „Stimmen“: **Beatbox** (B · Pf · ts · tsss), **Beatbox hart** (Kehlbass · eingezogenes K · tk · Lippenroller), **Beatbox Bass** (gesummter Bass · K-Klick · Zungenklick · Klickrolle), **Mund-Percussion** (Wangen-Pop · Psh · tch · Zungen-Klock). Werden mit den Drum-Kits an den Klangmotor geschickt (`drum:kit_bbx…_kick/snare/hat/top`). Gemessen: Kicks ≈ 400 Hz Schwerpunkt, Snares ≈ 2 kHz, Hats ≈ 3 kHz; Beatbox-Form im Mitschnitt hörbar (Spitze 84 %).
- **Mehrere Instrumente auf einem Körper (`Zones`):** Der Körper wird von unten nach oben in 2–4 Zonen geteilt, jede Zone ein Instrument mit vollem Tonumfang (auch Schlagzeug-/Beatbox-Kits). Zugang: ＋ Neu → „🎛 Mehrere Instrumente“, Kreis → Klang → „Mehrere Instrumente“. Vorlagen Band, Beatbox-Band, Akustik, Elektro, Orchester, Jazz oder frei. „Auf diese Form legen“ behält Gestalt, Farbe, Platz und Loops. Tipp-Höhe wird für Zonen-Formen nach sichtbarer Höhe gemessen (nicht mitdrehend); Legende unter dem Namen, gespielte Zone leuchtet. Technik: Verschmelzen-Schichten (`f.layer.parts`) mit `zones`; `Forms.sources` liefert nur die Zone, `Forms.play` rechnet u auf die Zone um; gespeichert mit `layer.zones`.
- **Audiospuren (`Sing` erweitert):** Blatt „🎙 Audiospuren · Gesang & Riffs“ mit Wahl **🎙 Gesang** (linear) oder **🎸 Riff als Loop** (1/2/4/8 Takte): Einzählen, Aufnahme stoppt nach genau N Takten selbst, Ränder weich, läuft dann im Takt endlos (Start ab seinem Takt, alle N Takte neu). Riffs ohne Sprachfilter; **Eingang wählbar** (z. B. USB-Audio-Interface), Tempo der Aufnahme gemerkt (⚠ bei anderem Tempo). Gemessen: 1-Takt-Riff = 2,22 s bei 108 BPM, stoppt selbst, läuft im Loop.
- **Gesangsaufnahme robuster:** Direktweg (AudioWorklet) mit Wächter – kommt in 1,3 s nichts an oder ist die Verbindung unmöglich, nimmt der Browser selbst auf (MediaRecorder) und die Spur wird trotzdem angelegt (getestet mit absichtlich defektem Direktweg); Ton nach der Mikrofon-Freigabe wieder anwerfen (iOS); falsches/abgestecktes Eingangsgerät → Standard. **Aufnahme-Protokoll** (Menü → 🎤 Prüfen bzw. im Audiospuren-Blatt) zeigt jeden Schritt (Adresse, Freigabe, Gerät, Abtastrate, Echo, Latenz, Weg, Dauer, Pegel) – „Protokoll kopieren“ zum Schicken.
- Prüfstand 97 (neu **BB**, **ZN**, **RF**), Layout 0/0.

## v53: Kneten verändert die Tonhöhe deutlich
- Christian (24.10. 21:07): „Kneten ändert die Tonhöhe nur bedingt. Der Einfluss soll größer sein!“
- **Befund:** Die Tonhöhe hing bisher nur an der Größe (`soundOf.oct`: zwei Schwellen 0,78/1,28 → je eine Oktave, nur per Zwei-Finger-Geste); Beulen, Dellen und Spitzen änderten nur die Klangfarbe (`tilt`, `P`, `noise`).
- **Neu (`KneadPitch`):** Stufen = (−Δ mittlere Auslenkung × 115 + Δ Spitzheit × 6,5) × Stärke, gemessen gegen die Startform der Form (`K.analyze(K.seedShape(seed))`), gerastert mit Hysterese (±0,62), Grenze ±12 Tonleiterstufen. **Hineindrücken = höher, Herausziehen = tiefer, Spitzen = höher, Rundmachen = tiefer.** Eingerechnet in `K.pitchFromU(…, kd)` (alle Hilfe-Stufen, bleibt in der Tonleiter bzw. auf Akkordtönen) und per `KneadPitch.tp` in Drehen-Bass, Farbflecken (Drehen und Antippen), Spielring und Akkorde (`kt: 1`); Loops behalten ihre aufgenommenen Töne. Rückmeldung: Anzeige „♪ 3 Stufen höher ↑“ unter dem Namen, Text im Steuerfeld, kurzer Ton bei jeder Stufe (nicht während Aufnahmen). Stärke: Menü → 🎵 Kneten → Tonhöhe (stark · normal · aus), auch im Kreis (`knpitch`).
- **Gemessen mit echten Fingerstrichen (Klavier):** Hineindrücken Strich für Strich 3 → 5 → 8 → 11 → 12 Stufen; Ton in der Mitte 60 → 81 (+21 Halbtöne); Herausziehen bis −12 Stufen → 40 (−20 Halbtöne); Drehen spielt mit. Prüfstand 94 (neu **KP**), Layout 0/0.

## v52: Mikrofon aus der App – „Im eigenen Fenster öffnen“ · Datei im Browser → sicherer Link
- Christian (24.10. 17:38): „Das Mikrofon kann immer noch nicht aus der App verwendet werden! Bitte beheben unbedingt!“
- **Ursache (bestätigt):** In claude.ai läuft KLANGRAUM eingebettet; die Einbettung erlaubt das Mikrofon nicht (Permissions-Policy), und für Artifacts gibt es keine Freigabe dafür (geprüft bis Vertrag 0.2.89). Weder Browser noch Chrome-Erweiterung waren für einen Live-Test in claude.ai erreichbar → Lage im Test nachgebaut (äußere Seite bettet KLANGRAUM von fremder Adresse ohne `allow="microphone"` und mit Sandbox ein).
- **Lösung (`MicWin`):** Ist das Mikrofon durch die Einbettung gesperrt, öffnen 🎤 Mikro, „● Einsingen“, die Startmeldung und die Prüfseite eine Auswahl **„Im eigenen Fenster öffnen“**: KLANGRAUM wird aus dem eigenen Quelltext (`SRC_HTML`) samt aktuellem Stück (Formen, Loops, Aufnahmen, Gesangsspuren – wie „Als Datei sichern“) als Blob-Seite in einem neuen Fenster geöffnet: gleiche sichere Herkunft, aber nicht eingebettet → der Browser fragt nach dem Mikrofon. Das Paket wird beim Öffnen der Auswahl vorbereitet, damit das Fenster im selben Tipp aufgeht. Im Fenster: Hinweis im Startbild, Stück wird übernommen, Leiste **„⤴ Zurück in die App“** schickt das Stück per Nachricht an die App (als „… · mit Mikro“, Original bleibt), sonst als Datei sichern. Blockiert der Browser das Fenster (Pop-up-Blocker, evtl. Claude-Handy-App): Hinweis, den Link in Chrome/Safari zu öffnen, „Link kopieren“. Ersatz Aufnahme-App bleibt.
- **Behoben:** Beim Laden von Sicherungen bekamen Aufnahmen neue Kennungen, Gesangsspuren und Schnittraum-Clips zeigten danach ins Leere → Verweise werden jetzt umgeschrieben.
- **Getestet (nachgebaute Einbettung):** Sperre erkannt (policy), Startmeldung, 🎤 Mikro → Auswahl → neues Fenster (blob:, sicher, nicht eingebettet) → Stück mit 3 Formen, Loop und Gesangsspur (Audio 1 s) übernommen → Mikrofon bereit, Aufnahme → neue Form → „Zurück in die App“ → „Testlied · mit Mikro“ mit 4 Formen und Gesang in der App. Prüfstand (neu **MW**), Layout 0/0, Regression t49/t50.
- **Zusammengeführt:** Eine andere Sitzung hatte am 24.10. (11:30) „Version 51 · Gescannte Körper und Räume aus FORMRAUM SCAN“ veröffentlicht (Modul `Scan`). v52 baut direkt auf dieser veröffentlichten Fassung auf (Bauskript `v52a.py` nimmt die gespeicherte Live-Datei als Basis) – nichts davon ging verloren. Menü-Kopf zeigte dort noch „Version 50“ → jetzt 52.
- Christian (24.10. 18:54): „Ich nutze die HTML immer über den Browser.“ → **Hauptursache:** die heruntergeladene Datei im Handy-Browser hat keine sichere Adresse (Android `content://`); dort gibt es kein Mikrofon, und ein eigenes Fenster erbt das. **Neu:** In der Datei führt 🎤 Mikro / „● Einsingen“ / Startmeldung / Prüfseite zu **„KLANGRAUM über den sicheren Link öffnen“**: das Stück wird als Datei gesichert, der KLANGRAUM-Link (https) öffnet sich; dort „Datei öffnen“, dann 🎤 Mikro → „Im eigenen Fenster öffnen“ → Erlauben. Empfehlung: KLANGRAUM künftig über den Link (Lesezeichen/Startbildschirm) öffnen. Getestet: unsichere Adresse → Blatt mit 3 Schritten → Download „klangraum-mein-stück.json“ + Link geöffnet; Startmeldung erscheint (nach den Begrüßungshinweisen).
- **Grenze:** Ob die Claude-App auf dem Handy neue Fenster zulässt, ließ sich nicht prüfen; sonst den Artifact-Link im Handy-Browser öffnen.

## v50: Gesangsspuren · Aufnahmeschutz (kein Menü beim Einspielen)
- Christian (23.10. 17:10/17:20): „Mikro geht immer noch nicht direkt in der App. Lass zu, dass Gesangspuren eingesungen werden, die nicht als Form verwendet werden, sondern linear laufen.“ – „Wenn ich einen Loop einspiele und länger auf eine Form drücke, erscheint das Menü … entwickle eine Lösung.“
- **Mikrofon in der Claude-App:** erneut geprüft – keine Laufzeit-Version für Artifacts (0.2.85 … 0.2.89) kennt eine Mikrofon-Freigabe; die Einbettung sperrt es, die Seite kann das nicht ändern. Direktes Mikrofon gibt es nur außerhalb: am Rechner per Doppelklick auf die Datei, auf dem Handy über eine eigene https-Adresse (z. B. GitHub Pages – öffentliches Repository nötig; Christians Repos sind privat). In der App bleibt der Weg über die Aufnahme-App (v49).
- **Gesangsspuren (`Sing`):** 🎙 im Menü (neben „Gemeinsam spielen“), im Kreis (Bereich Set) und – sobald Spuren da sind – als Chip im Steuerfeld. „● Einsingen“: Band zurück, 1 Takt Einzählen mit Klicks, Aufnahme ab Takt 2 (oder „ab der nächsten Eins“), rote Anzeige mit Takt und Pegel unter der Kopfleiste, antippen = fertig. Laufzeitausgleich (Ausgabe- + Eingabeverzögerung). Spur = Aufnahme (Recs, Art „gesang“) + `{at (Schritt), off (ms), vol, mute}` in `d.sing`; läuft **linear** ab ihrem Takt, sobald ▶ startet (Planung in `Transport.onStep` mit Sample-Zeit), über die Summe (mit etwas Hall) – also auch im Live-Mitschnitt/Export; ■ stoppt sie. Overdub: beim Einsingen laufen die vorigen Spuren mit. Je Spur: ▶ allein, 🔊/🔇, Lautstärke, Takt ◀ ▶, ±20 ms, ✕ (↶). Option 🎧 Kopfhörer (sonst Echounterdrückung an, damit die Musik nicht doppelt aufgenommen wird). Ohne Mikrofon: „● Einsingen“ öffnet die Aufnahme-App bzw. „Audiodatei als Gesangsspur“ → Spur ab Takt 1 zum Anlegen.
- **Aufnahmeschutz (`RecGuard`):** Während ein Loop einzählt/aufnimmt, Live, Gesang, Mikro-Form oder Set-Aufnahme läuft, gilt automatisch „Spielen“ (`Play.on()` wahr): langes Drücken auf eine Form = langer Ton, kein Kreis, kein Doppeltipp-Zoom, im Raum kein Verschieben; zusätzlich blockiert `Radial.open` jede Form-Berührung mit Finger-ID. Kreis weiter über ◉ und Namen. Einmaliger Hinweis, wenn man im Modus „Bearbeiten“ war.
- Behoben: Namensschilder wichen in v48/v49 im Querformat unter das Steuerfeld aus → begrenzt.
- **Getestet:** Einsingen (Einzählen → Takt 3 → Spur ab Takt 2, Wiedergabe startet mit ▶ im Takt, ■ stoppt), Bearbeiten/Speichern/Laden/Löschen/↶, Aufnahmeschutz per Touch (Bearbeiten ohne Aufnahme: Kreis; während Loop-Aufnahme: kein Kreis), ohne Mikrofon über die Aufnahme-App; Prüfstand 88 (neu **GS**), Layout 0/0.

## v49: Mikrofon – Ursache erkennen, Aufnahme-App als Ersatz, Prüfseite
- Christian (23.10. 12:00): „Mikrofon funktioniert noch nicht im Browser – prüfe und behebe das unbedingt.“
- **Ursache:** Der Code war in Ordnung (Tests mit simuliertem Mikrofon grün). Auf dem Handy wird die heruntergeladene Datei aber ohne sichere Adresse geöffnet (Android: `content://…`) – dort ist `navigator.mediaDevices` gar nicht vorhanden, der Browser fragt nie. v48 hat dann beim Start still nichts getan und bei 🎤 Mikro nur „nicht verfügbar“ gemeldet. In claude.ai ist das Mikrofon durch die Einbettung gesperrt (für Artifacts gibt es keine Mikrofon-Freigabe).
- **Neu (`MicFix`):** Diagnose ohne Nachfrage (Adresse, Schnittstelle, Einbettung, Erlaubnis) und Zuordnung der Fehler (content://, unsicher, Einbettung, verweigert, belegt, kein Gerät, Einstellung, Abtastrate). **🎤 Mikro** öffnet ohne sichere Adresse im selben Tipp die **Aufnahme-App** des Handys (`<input type=file accept=audio/* capture>`), die Aufnahme wird sofort eine Form (Tonhöhe erkannt). Beim Start einmalige, klare Meldung mit „Warum?“. Scheitert die direkte Verbindung (z. B. Firefox mit anderer Abtastrate) → Aufnahme über MediaRecorder. Rückfall auf Standardwerte bei `OverconstrainedError`; nach der Freigabe wird der Ton wieder angeworfen (iOS). Menü → 🎤 Mikrofon … **Prüfen**: Prüfseite mit Ampel, Pegeltest (3 s) und den passenden Wegen. Live-Session und Aufnahme-Blatt nennen denselben Grund.
- **Dauerhafte Lösung fürs Handy:** KLANGRAUM unter eigener https-Adresse (GitHub Pages oder Cloudflare Pages; Netlify Drop warnt bei Einzeldateien > 10 MB, KLANGRAUM hat 13,5 MB). Am Rechner geht die Datei per Doppelklick im Browser direkt (file:// gilt als sicher).
- **Getestet:** unsichere Adresse (Grund erkannt, Hinweis beim Start, 🎤 Mikro → Aufnahme-App → Form mit 220 Hz), sichere Adresse (direkt; erzwungener Abtastraten-Fehler → Umweg → Form), verweigert (Anleitung), Pegeltest; Prüfstand 87 (neu **MC**) in beiden Formaten grün, Layout 0 Überlappungen.

## v48: Vermittler automatisch · bessere Bilderkennung · Neues Stück mit Vorauswahl · Reihenfolge = Anordnung · ▶/⏸ im Namen · Raum-Punkte · Mikrofon beim Start · Hilfe neu geordnet
- Christian (23.10. 08:41): „Ja automatisch“ (Vermittler-Wechsel), Bilderkennung weiter verbessern, beim neuen Stück Vorauswahl (Stimmung, Geschwindigkeit, Formen-Kombination), Reihenfolge über die Anordnung in Alle (Doppelklick auf den Namen und schieben, Lesereihenfolge), Pausieren/Weiter über den Knopf gut, aber zu lange – im Namen ⏸/▶ zum Antippen, im Raum Namensschilder ersetzen (nicht verdecken; verschieben über den Punkt), Mikrofon beim Start erfragen und aktivieren, professionelles Projektgedächtnis, übersichtliche Hilfe, Vorschläge.
- **Jam – Vermittler automatisch:** `NetJam.join` verbindet gleichzeitig mit allen erreichbaren Vermittlern (EMQX, HiveMQ, Mosquitto; je 6 s Zeit), sendet über alle und filtert Doppeltes (Absender + Folgenummer). Wer nur einen erreicht, trifft die anderen trotzdem. Fällt ein Vermittler aus, läuft es über die anderen weiter; er wird mit wachsendem Abstand neu verbunden; erst wenn alle weg sind, verbindet der Jam ganz neu. Anzeige „verbunden über n Vermittler“. Getestet mit 3 Vermittlern (einer tot): A erreicht alle, B nur einen, C zwei → alle sehen sich, ein Ton kommt bei jedem genau einmal an; Ausfall eines Vermittlers mitten im Spiel → Töne laufen weiter, nach Neustart des Vermittlers wieder 2 Verbindungen.
- **Bilderkennung:** 6 neue Szenen – **Meer/Wasser** (blaues unteres Band + Himmel), **Berge** (schräge Kanten + Himmel + Kontrast), **Garten/Blumen** (bunte Punkte auf Grün), **Innenraum** (warme, gedämpfte Wandtöne, kein Himmel), **Nebel/Dunst** (kaum Kontrast, hell, entsättigt – Abgrenzung zu Schnee über gleißende Helligkeit), **Feuer/Kerzenlicht** (dunkel, warme Lichtpunkte mit Glut-Schein; Abgrenzung zu Nachtstadt und Porträt). Vorrangregeln gegen Verwechslungen. 6 neue Stile: Ozean · Wellen, Gipfel · Weite, Garten · Verspielt, Kaminabend · Jazz, Nebel · Schwebend, Feuer · Glut. Prüfung mit 22 synthetischen Bildern (alte 10 + 12 neue): **22/22 richtig** (vorher wurden Berge als Landschaft, Innenraum und Feuer als Nachtstadt, Nebel als Schnee erkannt).
- **Neues Stück mit Vorauswahl** (`NewPiece`): Meine Stücke → ＋ Neues Stück öffnet ein Blatt: Name (automatisch „Stück TT.MM. hh:mm“), 20 Stimmungen als Farbchips, Tempo (wie Stimmung · 70 · 90 · 108 · 124 · 140 + Regler 50–180), Formen-Kombination (Band, Akustik, Jazz, Chill, Orchester, Welt, Elektro, Techno, Stimmen, Leer) als bearbeitbare Liste (✕, ＋ Form hinzufügen, max. 8), „Aus einem Foto …“. Letzte Wahl wird vorgeschlagen. Ergebnis: Formen im Kreis, Ansicht Alle.
- **Reihenfolge = Anordnung in Alle:** Set-Einsatz folgt `Forms.list` (oben → unten, links → rechts), Loops einer Form in Aufnahme-Reihenfolge. ▲▼ entfernt, Hinweistext im Set-Feld und -Blatt. Verschieben: **Doppeltipp/Doppelklick auf den Namen** und ziehen (Geist-Schild folgt dem Finger, Zielform leuchtet) oder **◌ ziehen**; einfacher Tipp öffnet weiter den Kreis (330 ms verzögert, damit ein zweiter Tipp ihn abbrechen kann); rückgängig mit ↶.
- **▶/⏸ im Namen:** runder Knopf vorn in jedem Namensschild (Alle) und neben dem Namen (Form-Ansicht): sofort pausieren/weiterlaufen ohne Blende (Loops der Form inklusive); Schalter „An/Aus“ in der Schalterzeile jetzt ebenfalls sofort. Symbole als SVG.
- **Raum ohne Namensschilder:** kleiner Farbpunkt am Fuß jeder Form (⏸/▶ darin), Name nur bei der gewählten Form (links oder rechts, je nach Platz); Punkt tippen = pausieren/weiter, Punkt ziehen = Form verschieben. Nie unter dem Steuerfeld oder dem runden Form-Knopf. Auch im Vollbild-Raum. Set-Knöpfe im Raum ausgeblendet.
- **Mikrofon beim Start:** „Eintauchen“ fragt nach dem Mikrofon und hält es bereit (🎤 hinter der Versionszeile); Mikro → Form nutzt diese Freigabe ohne zweite Frage. Menüschalter „🎤 Mikrofon beim Start: an/aus“.
- **Hilfe:** in der App oben „Ich will …“ (15 direkte Antworten) und Themen (Loslegen, Spielen, Ansichten, Klang formen, Aufnehmen, Stück & Dateien, Gemeinsam, Am Rechner, Probleme); neue Abschnitte Neues Stück, Alle/Anordnung, Mikrofon; Raum und Set neu geschrieben. `KLANGRAUM_HILFE.md` gleich aufgebaut (Tabelle „Ich will …“ mit Sprungmarken, Inhaltsverzeichnis).
- **Aufgeräumt:** Namensschilder in Alle weichen einander aus und bleiben rechts von der Reiterleiste; ◌ weicht dem runden Form-Knopf aus. Layout-Prüfung jetzt 0 Überlappungen in Hoch- **und** Querformat (v47: 3 im Querformat).
- **Projektgedächtnis** neu und professionell gegliedert (Steckbrief, Arbeitsregeln, Wiedereinstieg, Definition of Done, Architektur mit Modulindex, Build, Tests, Stolperfallen, Versionstabelle, Grenzen).
- **Tests:** Prüfstand 86 (neu NP, BS, AR, HL), beide Formate grün (T3 headless); `t48.py` (Neues Stück, ▶/⏸, Kreis, Doppeltipp-Ziehen, ◌-Ziehen, Raum-Punkte, Mikro, Hilfe), `t48j.py` (Vermittler), `scn48.py` (Szenen), Regression `t43`, `t44m`, `t45`, `e2e22`, Layout-Audit.
- **Unabhängige QA (Agent) – 7 Fehler gefunden und behoben:** (1) Jam: nach vollständigem Abbruch lief der alte Raum mit Zeitgebern/Verbindungen weiter und konnte einen gesunden Raum neu starten → alter Raum wird jetzt sauber geschlossen, `lost()` nur für den aktuellen Raum; (2) Doppeltipp ohne Ziehen verschob die Form → erst ab 12 px Bewegung und nur nahe an einer Zielform; (3) ▶/⏸ in der Form-Ansicht reagierte nicht (`pointer-events`, Knopf wurde vom Namen überschrieben) → vor den Namen gesetzt; (4) ◌ ziehen ging per Finger nicht (`touch-action`) → behoben; (5) verzögerter Kreis öffnete nach Ansichtswechsel/Blatt → prüft die Lage; (6) ◌ verdeckte in dichten Ansichten das ▶/⏸ des Nachbarn → Namensschilder rechnen den ◌ mit ein; (7) Umordnen während eines laufenden Einsatzes → Warteschlange wird neu geordnet. Außerdem: Beitritt wartet nicht mehr 6 s auf einen stummen Vermittler (ab dem ersten 1,5 s, spätere kommen still dazu), Mikrofon wird im Hintergrund freigegeben und danach wieder bereitgehalten, Ablehnungs-Hinweis nur einmal, Gast-Formen ohne ▶/⏸, Kerzenschein gilt nicht als Haut, eigene Formenliste im Assistenten wird gemerkt.
- **Vorschläge für später** (Bedienung): langes Drücken auf ⏸ = „nur diese“ (alle anderen pausieren); mehrere Sets (A/B) als Arrangement; sichtbarer Takt-Countdown beim Einsetzen; Formen in Alle nach Rolle gruppieren (Rhythmus · Bass · Harmonie · Melodie); Set-Steuerung im Jam für alle. (Klangfindung): Vorhören in „＋ Neu“ mit kurzer Phrase in der aktuellen Tonart; „Mehr wie dieser“ – ähnliche Klänge vorschlagen; Klangsuche mit Worten (warm, hell, hallig); 4 Varianten einer Form nebeneinander vorhören (A/B/C/D); Favoriten; Akkordfolgen-Vorschläge zur Stimmung; Bild → Klangfarbe einer einzelnen Form; Mikro-Aufnahme automatisch in Schlagzeug-Pads zerlegen; „falsch erkannt?“ in Bild wird Musik → Szene wählen, App merkt sich die Korrektur.

## v47: Gemeinsam spielen ohne Anmeldung – auch zwischen zwei HTML-Dateien
- Christian (22.10. 14:09): „Ich wollte aber, dass beide Spieler in der gleichen HTML spielen können, ohne bei Claude angemeldet zu sein.“
- **Weg:** öffentlicher MQTT-Vermittler über verschlüsselte Websockets (wss), frei und ohne Konto. Eigener schlanker MQTT-3.1.1-Client in der App (`NetJam`: CONNECT/CONNACK, SUBSCRIBE, PUBLISH QoS 0, PING, DISCONNECT) mit derselben Raum-Schnittstelle wie die Plattform-Räume (`presence`, `onPeers`, `on`, `emit`, `leave`) – die ganze Jam-Logik (geteilte Formen, Loops, Tempo/Stimmung vom Gastgeber, live Töne, Takt nach Uhrzeit) bleibt unverändert. `Jam.capability` nutzt jetzt immer den Vermittler.
- Vermittler: e = broker.emqx.io:8084, h = broker.hivemq.com:8884, m = test.mosquitto.org:8081; der erste erreichbare wird beim Öffnen gewählt und steht als **erster Buchstabe im Raum-Code** (z. B. „e37a4c“), damit beide denselben nutzen. Themen `klangraum/jam1/<code>/p` (Lebenszeichen alle 4 s, weg nach 14 s) und `/e/<thema>` (Töne). Bei Verbindungsabbruch automatisch neu verbinden.
- Einladungstext ohne Anmeldehinweis; neuer Knopf **App-Datei schicken** (System-Teilen mit der HTML-Datei, sonst speichern und in WhatsApp als Dokument anhängen).
- **Getestet** mit einem lokalen Test-Vermittler (claude/tools/mqtt_testbroker.py) und zwei Browserfenstern: Raum öffnen, Beitritt mit der ganzen WhatsApp-Nachricht, beide sehen sich und die Formen des anderen, ein live gespielter Ton kommt an, Verlassen räumt auf. Die öffentlichen Vermittler waren aus der Arbeitsumgebung nicht erreichbar (Netz gesperrt) – erster echter Test auf den Handys.
- Grenzen: braucht Internet auf beiden Geräten; wer den Code kennt, kann mithören (öffentlicher Vermittler); Verzögerung typ. 50–200 ms.
- Prüfstand **NJ**.

## v46: Gemeinsam spielen per QR-Code und WhatsApp · Datum in „Meine Stücke“
- Christian (22.10. 11:19/11:20): Option „Gemeinsam“ über QR-Code bauen; Einladungscode auch per WhatsApp, wenn man nicht in der Nähe ist. Im Dateimanager Erstell- und Änderungsdatum zeigen.
- **QR-Code-Erzeuger** eingebaut (qr.js, `QR.encode/svg`, Byte-Modus, Fehlerkorrektur L–H, Version 1–40, nach Project Nayuki); geprüft mit OpenCV-Decoder (Versionen 1, 4, 7, 11 inkl. Umlaute/Emoji) und mit einem Bildschirmfoto der App.
- **Einladen** (`JamInvite`): neuer Raum bekommt einen gut lesbaren 5-Zeichen-Code (ohne 0/o/1/l/i); im Raum Abschnitt „Einladen“ mit QR-Code (Link `…/artifact/AcerFy2AcGdzZhqXA8sjUf?jam=CODE`), großem Code, **WhatsApp** (wa.me mit fertigem Text), **Teilen …** (System-Teilen, wo vorhanden), **Einladung kopieren**.
- **Beitreten**: Feld nimmt Code, Link oder die ganze Nachricht (`JamInvite.parse`); „Einladung einfügen“ (Zwischenablage, sonst Hinweis aufs lange Tippen); „QR-Code scannen“ mit Kamera, wo der Browser einen Code-Leser hat (BarcodeDetector, z. B. Chrome Android). Kommt der Code über die Adresse (`?jam=`, `#jam=`, Referrer) an: Hinweis im Startbild und automatischer Beitritt nach „Eintauchen“. Ob claude.ai den Zusatz `?jam=` an die eingebettete App weitergibt, ist ungeprüft – sonst bleibt Code/Einfügen.
- Menü: Knopf **👥 Gemeinsam spielen** oben. Hilfe-Abschnitt „Gemeinsam spielen: einladen per QR-Code oder WhatsApp“. Prüfstand **JQ**.
- **Meine Stücke**: je Stück „Erstellt …“ und „Geändert …“ mit Datum und Uhrzeit (heute/gestern sonst TT.MM.JJJJ).

## v45: Set & Einsatz · Alle mit vielen Spalten · Set aufnehmen → Form · Mikro → Form · Hineinhören · 10 neue Stimmungen
- Christian (22.10. 09:23): Set aus Formen zusammenstellen und stoppen; Reihenfolge des Wiedereinsatzes der Formen und ihrer Loops einfachst festlegen und nachträglich ändern; Formen und Loops einzeln anhalten/starten; dazu ein kleiner Knopf an der Form, auch während der Aufnahme. Alle mit mehreren Spalten für sehr viele Formen. Loops aus verschiedenen Formen aufnehmen und als neue Form speichern, im Speicherdialog vorher hineinhören, Datum und Zeit automatisch. Tonaufnahme direkt während der Session → Form ohne Dialoge. Frage (nur Prüfung): zwei Telefone per Bluetooth/Hotspot, QR-Code. Weitere Grundstimmungen.
- **Set & Einsatz** (`Cue`): Einträge = ganze Form (`t=null`) oder einzelner Loop (`t`=Take-Id); Reihenfolge der Liste = Einsatzreihenfolge; Abstand 1/2/4 Takte. Kleiner Knopf **◌/Nr.** an jeder Form (Alle/Raum: neben dem Namensschild, bleibt beim Gleiten der Kamera dasselbe Element; Form-Ansicht: neben dem Namen) → Feld „Set und Einsatz“: je Zeile ▶ steht/■ läuft (sofort), ＋ Set / Nr. n, ▲▼; unten ■ Set stoppen, ▶ Einsetzen (Nr. 1 zur nächsten Eins, dann je Abstand), Abstand, ☰ Reihenfolge, ⏺ Set aufnehmen. Set-Chips im Steuerfeld (Set n · ■ · ▶ mit Fortschritt). Blatt „Set – Einsatz-Reihenfolge“ mit ▲▼✕. Einsatz über `Transport.onStep` (sample-genau zur Eins, `Fade.set(…, quick)`/`t.on`). Kreis-Bereich „Set“ (Ins Set, Einsetzen, Stoppen, Reihenfolge, Set aufnehmen, Mikro → Form). Im Stück gespeichert (`d.cue`). Prüfstand **CU**; Laufzeittest: Einsätze in Reihenfolge je Takt (Schritt 65/81/97).
- **Alle mit vielen Spalten**: automatische Spalten bis 6 (Hochformat) bzw. 10 (quer/Rechner), Mindestgröße kleiner; Chip „▦ Spalten“ (auto, 2, 3, 4, 5, 6, 8). Dichte Ansicht (`body.kdense`): kleinere Namensschilder und Knöpfe. 18 Formen → 4 Spalten auf 390 px.
- **Set aufnehmen → neue Form** (`SetCap`): nimmt nur die Formen des Sets auf (übrige kurz still), Länge = längster Loop (≤ 20 s), sample-genau ab der nächsten Eins (Rec-Knoten mit `t0`). Speicherdialog „Set-Aufnahmen“: ▶ hineinhören, Datum + Uhrzeit (mit Sekunden), Takte, Dauer; frühere Set-Aufnahmen darunter; „＋ Als neue Form“ = Sample-Form (f0 261,63 Hz, Wiedergabe in Originaltempo geprüft) mit Loop über die ganze Länge. Bleibt unter Aufnahmen (kind „set“).
- **Mikro → Form** (`MicForm`): 🎤 in der Schalterzeile (und Kreis): tippen = Aufnahme (rote Pille mit Pegel), nochmal tippen = sofort neue spielbare Form (Grundton erkannt), ohne Dialog und ohne Ansichtswechsel; max. 20 s; Aufnahme bleibt unter Aufnahmen.
- **Hineinhören in Stücke** (`PrevAudio`): beim Speichern (höchstens alle 45 s) und beim Wechsel des Stücks die letzten 12 s aus dem Rückblick als Hörprobe (24 kHz mono, eigener Eintrag `pv_<id>` in recs, kind „vorschau“, aus Aufnahmelisten gefiltert); in „Meine Stücke“ ▶ je Stück.
- **10 neue Grundstimmungen** (20 insgesamt): Sehnsüchtig, Feierlich, Orientalisch (phrygisch-dominant), Bluesig, Unheimlich, Verspielt, Meditativ, Funky, Jazzig (melodisch Moll), Aufbruch (lydisch). Prüfstand **MO** (alle Akkordtöne in der Tonart).

## v44: Rundmenü als Ring · Bedienung mit Maus und Tastatur
- Christian (21.10. 23:36): „Die App soll genauso gut am Rechner mit der Maus bedient werden können – überprüfe das. Die Rundmenüs müssen noch viel einfacher und schneller zu erfassen sein!“
- **Rundmenü neu** (v44r.js, `Radial.paint/dirAt/GEO/place/wedges`): ein geschlossener Ring aus Tortenstücken (SVG, `.rdw`), jedes Feld mit Symbol und Wort (2 Zeilen, ≤ 14 Zeichen), Ziffer 1–8 am Rand; Hintergrund abgedunkelt; keine Bereichsleiste mehr außerhalb des Kreises. Ebene 1 = Lieblingsbefehle (Einstellungen) + „Alle Befehle“, Ebene 2 = Bereiche, Ebene 3 = Befehle (feste Plätze, blass wenn nicht nutzbar). Mitte zeigt den Ort und führt zurück (Ebene 1: schließen). Maus: Feld leuchtet unter dem Zeiger, Klick wählt, Esc schließt, ←/Rücktaste zurück, Ziffern wählen. Finger: tippen oder vom Druckpunkt hinziehen (jetzt auf jeder Ebene). Ring passt sich der Bildschirmgröße an (mind. 110 px Radius). Tests RT/KR auf den Ring umgestellt.
- **Maus-Prüfung** durch einen Test-Agenten (echte Mausereignisse, 1366×800 und 1920×1080, alle Ansichten, beide Modi). Umgesetzt (v44m.js):
  - Rechtsklick auf eine Form (oder ins Leere) öffnet das Rundmenü – früher knetete die rechte Maustaste (und Umschalt+Ziehen auch im Spielmodus) die Form heimlich. Umschalt+Ziehen knetet nur noch im Bearbeiten-Modus.
  - Mausrad = Zoom überall (auch im Raum); Größe der Form nur mit Alt+Rad oder beim Kneten (früher veränderte das Rad über der Form ihre Größe); Umschalt+Rad = Ansicht Form → Alle → Raum.
  - Esc klappt das große Steuerfeld zu; Kneten-Taste N statt Tab (Tab bleibt für Tastatur-Navigation).
  - Tooltips aus den Beschriftungen, Mauszeiger (Hand über Formen, Greifhand im Leeren, Fadenkreuz beim Kneten/Malen), Hover-Aufhellung, kein Browser-Kontextmenü auf Bedienelementen.
  - Breites Steuerfeld am Rechner (bis 1320 px, Formname sichtbar, Schalter mit vollem Wort).
  - Hilfe-Abschnitt „Am Rechner mit der Maus“, Tastaturliste ergänzt.
- Offen aus dem Bericht: Z-Rollen (Zwei-Finger-Drehung) und „Festhalten hält an“ haben noch keine Maus-Entsprechung (Ersatz: Schalter Steht/Dreht); Verschieben im Raum mit der mittleren Maustaste.

## v43: Jede Form direkt schalten
- Christian (21.10. 23:18): „Überarbeite die Steuerung! Loops lassen sich nicht ausschalten. Im Raum können Formen nicht angedreht und gestoppt werden. Richtig intuitiv ist die Bedienung noch nicht! Formen sollen sich auch einzeln einschalten lassen!“
- Befund: Ein/Aus, Drehen und Loops je Form gab es nur versteckt (Form-Leiste „Mehr“, Funktionskreis, Bewegungsliste); im Raum ist Tippen = Ton (Spielmodus) und Wischen = Physik, also kein sichtbarer Weg zum Drehen/Anhalten. Drehende Formen klingen außerdem wie Loops und wurden von „Loops anhalten“ nicht erfasst.
- **Schalterzeile im Steuerfeld** (`FSw`, in jeder Ansicht, auch im Spielmodus, nicht beim Kneten/Malen/Melodie): 🔊 An / 🔇 Aus (`Fade.toggle`, mit eingestellter Blende) · ▶ Steht / ⟳ Dreht (`Bew.go/stop`, bzw. `Move.act(f,"spin")`, startet den Takt) · ⟲ Loop an / aus (alle Takes `t.on`, gibt angehaltene Loops frei) · ◎ Einzeln · ☰ Alle. Zustand als Wort und Farbe (Aus rot, Einzeln gelb, an türkis). Wählen einer Form: auf die Form tippen (auch im Raum, geprüft) oder die Leiste oben.
- **„Alle Formen“** (Sheet „Formen“, auch Funktionskreis → Klang): Sammelschalter Alle an/aus, Alle drehen/anhalten, Alle Loops an/aus, Einzeln aufheben, Alles still; darunter jede Form mit Zustand („an · dreht · 2 Loops an“) und denselben vier Schaltern; Name tippen = Form wählen.
- Steuerfeld zieht den Zustand alle 0,7 s nach (Änderungen über Gesten/Kreis). Prüfstand **FX**; echter Touch-Test im Raum: Dreht/Steht, Loop aus/an, Aus/An, Einzeln, Alle anhalten, Form aus in der Übersicht.

## v42: Anhalten, das hält · „Meine Stücke“ · Bereich Bewegen entfernt
- Christian (21.10. 22:26): „Loops lassen sich nicht mehr anhalten! Das Bewegen funktioniert nicht – Bereich wieder löschen! Die Dateiverwaltung deutlich verbessern – übersichtlicher und einfacher gestalten!“
- **Bewegen entfernt** (v40/v41 `Sense`, Knopf neben Form · Alle · Raum, Kreis-Eintrag, Hilfe, Tests SN1–SN4). v42 baut auf v39 auf + Bild v3 (v40b.js) + Logo (v40l.js) + v42.js; Ansichtsknöpfe wieder 54 px.
- **Loops anhalten – Ursache:** „Alle Loops anhalten“ selbst funktioniert (Audio gemessen: Pegel 0,21 → 0,004). Aber ■ oben stoppte nur den Takt; jedes Anschubsen/Wischen einer Form (`Motion.release/push`), Szenen, Physik usw. startet den Takt automatisch neu (`Transport.start`) – und damit sofort alle Loops. Mit Physik ohne Reibung rollten und klangen Formen außerdem endlos weiter.
- **Lösung (`LoopCtl.hold/release`, Hülle um `Transport.toggle/stop/start`):** ■ (und Leertaste) hält alles an und setzt die Loops auf „angehalten“; ein automatischer Neustart (Anschubsen) lässt sie still (einmaliger Hinweis). Frei werden sie nur ausdrücklich: ▶, „Loops weiter“ (startet bei stehendem Takt auch den Takt), neue Loop-Aufnahme (`Loops.arm`), Stück abspielen (`Song.play`), Bild „Als neues Stück“. ■ stoppt auch rollende Formen (Physik). Bei ausgeblendeter Leiste neben „▴ Leiste“ ein Knopf „⏸ Loops“. Prüfstand **LH**.
- **Dateiverwaltung „Meine Stücke“** (neues `Projects.open`): oben großer Knopf „＋ Neues Stück“ (klappt auf: mit 3 Startformen · leer · aus einem Foto), Suche (ab 6 Stücken) und Sortierung Zuletzt/A–Z (gemerkt), darunter eine **Liste** (Vorschaubild, Name, Datum, Formen, Stimmung, ☁) – das geöffnete Stück zuerst, gelb umrandet, mit Speicherstand. Tippen öffnet; „⋯“ zeigt Umbenennen (direkt in der Zeile), Kopie, Als Datei, Löschen (Rückfrage „Ja, löschen / Abbrechen“). Cloud-Stücke, die nicht auf dem Gerät sind, gestrichelt („nur in der Cloud – tippen lädt es“). „Sichern und Laden“ aufklappbar unten (alle als Datei, Datei öffnen). „Jetzt speichern“ entfällt (speichert automatisch). Getestet: anlegen, löschen mit Rückfrage, umbenennen, Suche.

## v41 (in v42 wieder entfernt): Bewegen – warum keine Sensordaten kommen
- Christian (21.10. 21:33): „Die Sensoren im Bereich Bewegen arbeiten nicht, obwohl ich die HTML heruntergeladen habe.“
- Ursache (kein Rechenfehler – der Signalweg ist mit echten DeviceOrientation-/DeviceMotion-Ereignissen geprüft: 7 Töne beim Neigen, 1 Schlag): Handy-Browser geben die Sensoren nur **sicheren Seiten (https)** und in **eingebetteten Seiten** nur mit Erlaubnis der Einbettung (Permissions-Policy). Eine heruntergeladene Datei öffnet Android über `content://` (nicht sicher) → keine Ereignisse. claude.ai bettet das Artifact ein → Sensoren gesperrt.
- Neu: `Sense.diag()`/`reason()` erkennen den Grund (unsicher, eingebettet, abgelehnt, Rechner, kein Browser-Support) und zeigen nach 1,8 s eine **Hilfekarte** mit Klartext, Lösung und Knöpfen: „↗ In eigenem Tab öffnen“ (eingebettet + https: dieselbe Seite als eigener Tab, dort gelten die Sensoren), „Sensoren erlauben“ (iPhone), „Mit dem Finger weiter“, Prüfzeile. Karte verschwindet, sobald Daten kommen. Zusätzlich Android-Ereignis `deviceorientationabsolute` als Ersatz.
- `Sense.HOME` vorbereitet für eine feste https-Adresse (z. B. GitHub Pages) – dann zusätzlicher Knopf „KLANGRAUM online“.
- Prüfstand **SN4**. Getestet: eingebettet mit gesperrter Policy → Grund „eingebettet“, Prüfzeile „Beschleunigung gesperrt“.

## v40: Bilder mit Charakter · Bewegen (Handy-Sensoren) · Logo
- Christian (21.10. 18:38): Bild-Melodien klingen immer ähnlich – Bilder charakteristisch analysieren, wirklich passende Stücke erzeugen (recherchieren, professionalisieren). Neuer Bereich neben Raum/Alle/Einzeln: Formen über Bewegungs- und Beschleunigungssensoren flüssig spielen. Im Team arbeiten. (18:51) Hochgeladenes Logo (blau-violette Klangwolke mit „KLANGRAUM“, animiertes GIF) ins Design einarbeiten.
- Team: zwei Recherche-Agenten (Bild→Musik-Algorithmen, Handy-Bewegungsinstrumente), ein unabhängiger QA-Agent prüfte den Code.
### Bild wird Musik v3 (`BildK`, Hüllen um `K.analyzeImage`/`K.arrangeFromImage`, `BildX.read`, `Bild.roles/render/meters/drawRoll`)
- **Merkmale** zusätzlich: Valenz/Erregung nach Valdez & Mehrabian (Helligkeit, Sättigung, Wärme, Kanten), Buntheit nach Hasler & Süsstrunk (M), Himmel-, Grün-, Sand-Anteil, Haut (YCbCr, Mitte gegen Rand), Abendhimmel, Nacht mit Lichtern, Kantenrichtung (Anteil waagerecht+senkrecht `Hv`, senkrecht `Vf`), high/low key.
- **Szenen** (weiche Werte, beste > 0,42): Nachtstadt, Porträt, Strand, Wald dunkel, Landschaft/Weite, Stadt Tag, Abstrakt bunt (M und Farbvielfalt), Hell-Minimal, Abendlicht; sonst nach Stimmung (Russell-Quadranten).
- **12 Stile** (`BildK.STYLES`): Ambient·Weite, Lo-Fi, Deep House, Ballade, Bossa, Filmmusik, Funk, Electro, Minimal Music, Pop, Melancholie, Episch – je Tempobereich, Groove, Swing, Akkordfolgen-Pool, Rhythmusvorlagen, Sprungfreude, Notenlänge, Form, Septimakkorde, Instrument-Pools (Melodie/Bass/Fläche/Rhythmus).
- Neue Modi lydisch, mixolydisch, harmonisch Moll; neue Stimmungen Träumerisch, Nachtstadt, Sommerlich, Dramatisch; neue Grooves ambient, lofi, house, bossa, taiko, funk, minimal.
- **Komposition, 8 Takte:** Tempo = Stilbereich × Energie; Akkorde 2×4 aus dem Stil, Takt 8 Grundakkord (Takt 7 nicht Tonika). Melodie: Motiv (2 Takte, Rhythmus aus Vorlagen, dichter bei vielen Kanten) → Tonwahl als gewichtete Kette (Sekunde 0,5, Terz 0,25, Quarte/Quinte 0,15, größer 0,1), zur Bildkontur gezogen (exp(−0,75·Abstand)), Akkordtöne betont ×3, Gegenbewegung nach Sprüngen; Formen AA′BA, AA′BA′, AA′AB, ABA′B′, ABAC, AA′A″B; wiederkehrende Motive wandern mit der Bildkontur mit (Sequenz), Frage endet auf der 5. Stufe, Schluss auf dem Grundton lang. Swing, leichte Humanisierung, Lage G4–G5. Bass nach Stil-Groove, Schlagzeug mit Geisternoten und Fill in Takt 8, Fläche mit Septime bei Jazz/Ambient.
- **Instrumente** aus dem Stil-Pool, Kandinsky-Tendenz: warm → Blech/Saiten/Klavier, kühl → Glocken/Flöte/E-Piano.
- **Zufall nur aus dem Bild** (FNV-1a-Hash eines 16×16-Rasters → mulberry32): gleiches Bild = gleiches Stück; **🎲 Andere Variante** würfelt neu; **Stil-Knöpfe** wählen einen anderen Stil.
- Erklärung neu: ⓪ Charakter → Stil, ① Gefühl und Energie, ② Melodie (Form, Motivverarbeitung), ③ Akkorde (8 Takte), ④ Instrumente und Raum. Foto zeigt 8 Takte, Notenrolle 8 Takte, Loops 8 Takte, Vorhören einmal 8 Takte.
- Prüfstand **BK1** (8 Takte, Schluss Grundton), **BK2** (gleich/Variante/verschieden), **BK3** (12 Stile × 3 Varianten, alles in der Tonart, ≥ 10 Melodie-Instrumente). **P2** ehrlich angepasst: Kontur-Übereinstimmung Ziel ≥ 55 % (vorher 80 %; die Melodie ist jetzt ein Lied mit Motiven statt einer reinen Linienkopie; gemessen 63 %).
- Test mit 10 künstlichen Szenen: Nachtstadt→Lo-Fi, Porträt→Ballade, Strand→Bossa, Wald→Filmmusik, Landschaft→Ambient, Stadt→Funk, bunt→Electro, Schnee→Ambient/Minimal, Sonnenuntergang→Ballade, grau→Melancholie.
### Bewegen (`Sense`, `OneEuro`)
- 4. Knopf **Bewegen** neben Form · Alle · Raum (auch Funktionskreis → Ansicht). Ansicht „nah“, Form-Leiste ausgeblendet, Knopfzeile unten, Neige-Leiste rechts (Ton + Seitenpunkt), Neige-Feld links (Finger statt Sensor).
- **Neigen** (Lage aus `deviceorientation` beta/gamma, ersatzweise Schwerkraft aus `devicemotion`; Querformat tauscht Achsen): ±34° = ganze Form (Empfindlichkeit ruhig/mittel/fein), 1€-Filter (1,0 Hz, β 0,02), 15 Stufen mit Hysterese 0,85; jede überquerte Stufe erklingt (höchstens 4 pro Ereignis), Anschlag aus Neigetempo. Oberkante zu dir = höher; **↕ Umkehren**. **⊙ Null** = Nullstellung.
- **Halteton**: gebundener Ton gleitet (`Forms.glideTo`). **Schlagen**: |lineare Beschleunigung| > 12 m/s² (÷ Empf.), Auslösen beim Abfallen der Spitze (höchstens 40 ms), Wiederbereitschaft unter 6 m/s² und 120 ms; Stärke ((Spitze−12)/23)^0,6. **Drehen**: rotationRate.alpha > 25°/s dreht die Form (Transport startet). **Im Takt**: auf das nächste Sechzehntel, höchstens 100 ms später.
- iOS: `requestPermission` synchron im Tipp. Nach 1,8 s ohne Daten Hinweis (eingebettete Ansicht sperrt Sensoren oft per Permissions-Policy) → Neige-Feld oder Datei im Browser öffnen. Leichte Blick-Parallaxe (relativ, wird beim Verlassen zurückgenommen).
- Prüfstand **SN1** (36° Neigen = 7 aufsteigende Töne, Zittern ±0,6° an einer Tongrenze = 0 Töne), **SN2** (ein Ruck = 1 Schlag, Nachschwingen 0, nächster Ruck 1), **SN3** (Knopf und Kreis-Eintrag).
### Unabhängige Prüfung (QA-Agent) und Nachbesserung
- Kritisch behoben: Die Körper-Klasse hieß wie das Bewegen-Feld (`.ksense` mit `pointer-events:none`) – die ganze App nahm im Bereich Bewegen keine Berührungen an (in der ersten v40-Veröffentlichung kurz live). Jetzt `body.kmove`; ✕ steht vorn in der Knopfzeile. Echter Touch-Test: Form spielt, Alle/✕/Reiter reagieren.
- iOS: Schwerkraft-Ersatz nullt nicht mehr falsch (Quellwechsel Lage↔Schwerkraft nullt neu), Hinweis „kein Sensor“ erst nach der Erlaubnis-Antwort, Knopf „Sensoren erlauben“, Bildschirmdrehung nullt neu (auch 180°).
- Halteton hängt nicht mehr beim Ausschalten von Neigen; Ansicht-Zurücksetzen löscht den Neige-Blickversatz; Neige-Töne immer auf der Tonleiter (Hilfe 55 fest); „Im Takt“-Töne werden live verzögert gespielt und darum in Loops mit aufgenommen.
- Bild: Fläche in fester Lage unter der Melodie, Takt 4 nie Tonika (Halbschluss), Swing ohne Überlappungen. Fuzz-Test des QA-Agenten: 4.320 Stücke, 0 Fehler, 0 Töne außerhalb der Tonart.
- Logo-Animation stoppt, wenn das Logo nicht sichtbar ist; Leuchten per CSS.

### Logo
- Als Vektor nachgebaut (`Logo`): Wortmarke als Linienpfade (A ohne Querstrich wie im Original), Wolke als Kapsel mit überlagerten Wellen, Verlauf blau → indigo → violett → magenta, Lichtflecken, Leuchten pulsiert; wogt langsam (aus bei „Bewegung reduzieren“, Pause wenn unsichtbar).
- Startbild: Logo statt Schrift, Hintergrund mit violett/blauem Schimmer, „Eintauchen“ im Logo-Verlauf. Menü: Logo oben. Browser-Symbol und Home-Bildschirm-Symbol aus der Wolke mit „K“. Aktive Knöpfe im Bereich Bewegen und Stilwahl im Logo-Verlauf.
- Leiste oben: Ansichtsknöpfe 47 px breit, damit vier Platz haben (Prüfung Überlappung 0).

## v39: Physik wie Billard
- Christian (21.10. 16:41): Die Formen sollen nach dem Anschieben immer weiter rollen und erneut kollidieren; Anschieben soll einfacher gehen.
- **Schläger-Wischen** (`Phys.paddle`): Mit Physik an im Raum schiebt EIN Finger, der irgendwo über den Boden wischt, jede getroffene Form an.
  - Fingerradius 0,8; Schub = 1,6 × Fingertempo, mindestens 3, höchstens 16.
  - Raum drehen geht dann mit zwei Fingern.
- **Reibung einstellbar** (`Cfg.physFric`): ohne (Standard, 0,015/s und Mindesttempo 0,6, rollt also immer weiter), wenig, normal. Tempo höchstens 18. Wand und Stöße fast elastisch (0,97).
- „Alle anhalten“ stoppt auch die Physik-Bewegung. Greifen und Werfen (v38) bleibt.
- **Meldungen (Toasts) fangen keine Berührungen mehr ab**, nur ihre Knöpfe. Vorher lag z. B. die Physik-Meldung über dem Boden und schluckte das Wischen.
- Prüfstand **PW**. Echter Touch-Test: Ein Wisch über den Boden setzt mehrere Formen in Bewegung, nach 4 s rollen und stoßen sie noch.

## v38: Physik zum Anfassen
- Christian (21.10. 16:09): „Physik funktioniert noch nicht! Die Formen lassen sich schlecht anschieben.“
  - Ursache: Schwung gab es bisher nur über das schnelle Wischen (Anschubsen, ab 0,25 px/ms innerhalb von 0,48 s). Langsames Ziehen tat im Spielmodus nichts (`rhold`).
- Neu (`Input.downRaum/move/up`-Hüllen, Zeiger-Art `pgrab`; gilt mit Physik an in beiden Modi):
  - Form antippen = Ton.
  - Festhalten und ziehen: Die Form folgt dem Finger auf dem Boden (`Scene.planePoint`) und schiebt andere mit Fingertempo weg (`Phys.grabs`).
  - In Bewegung loslassen = werfen: Tempo aus den letzten 110 ms, höchstens 16 Einheiten/s.
  - Reibung 0,38/s (rollt länger).
- Prüfstand **PG** (greifen und werfen). Getestet mit echten Touch-Gesten: Die Form folgt dem Finger und rollt nach dem Loslassen weiter.

## v37: Formen löschen wieder erreichbar, Physik sichtbar
- Christian (21.10. 15:28): „Formen entfernen geht nicht mehr.“
  - Ursache: Die Bereichsleiste im Kreis (v35) war auf dem Handy breiter als der Bildschirm und ließ sich nicht seitlich schieben, weil der Kreis Gesten sperrt (`touch-action: none`).
  - Deshalb lagen „Form“ (mit „Löschen“), „Werkzeuge“, „Ansicht“ und „Mehr“ außerhalb des Bildschirms. Im Querformat war die Spalte zu hoch.
  - Fix:
    - Die Leiste bricht im Hochformat um; im Querformat steht sie in 2 Spalten (212 px).
    - Der Kreis rückt so, dass er die Leiste nicht überdeckt.
    - „Löschen“ fragt zusätzlich mit einem Knopf in der Meldung nach.
  - Prüfstand **RT**: Jeder Bereichsknopf liegt im Bild und ist antippbar.
- Christian (15:31): „Physik ist nicht zu finden.“ Im Raum steht jetzt der Schalter „Physik“ im Steuerfeld; dazu Physik, Szenen und Gemeinsam unter Extras.
- Testweise geprüft mit echten Touch-Tipps: Kreis → Form → Löschen (zweimal) in Form und Raum, Formblatt → Entfernen.

## 10 weitere Vorschläge (21.10. nachmittags)
1. Harmonie-Assistent mit Akkordleiste und „Nächster Akkord“-Vorschau; Formen können einem Akkordwechsel folgen oder fest bleiben.
2. Klang-Fingerabdruck: Form aus Mikrofon/Summen ableiten (Tonhöhe → Melodie-Loop, Klangfarbe → Knetform).
3. Arrangement-Assistent: aus Loops und Szenen automatisch Intro, Strophe, Refrain, Break, Outro bauen (Szenen-Kette mit Taktlängen).
4. Effekt-Bus pro Raumzone: Ecken des Raums sind Effekt-Räume (Hall, Echo, Filter); eine Form dorthin schieben = Effekt.
5. Bewegungs-Automation: Gesten als Kurven aufnehmen und loopen (Lautstärke, Drehung, Filter, Position).
6. MIDI und Controller: Web MIDI für Keyboard, Pads, Regler; MIDI-Clock-Sync mit anderen Geräten/DAWs.
7. Stems-Export und DAW-Paket: WAV je Form/Spur, MIDI, Tempo und Szenenmarken; Import zurück.
8. Lern- und Spielmodus für Laien: geführte Aufgaben („Baue einen Beat in 3 Schritten“), Rhythmus-Spiele, Fortschritt.
9. Klangbibliothek teilen: Formen, Kits und Szenen als Vorlagen mit anderen tauschen (Artifact-Datenbank), Bewertung, Suche.
10. Barrierefreiheit und alternative Eingabe: komplette Bedienung über Tastatur/Schalter, Sprachbefehle („Bass leiser“, „Szene B“), große Kontraste, Vibration als Taktgeber.

## v36: Spielen ohne Unterbrechung, Leistung, Rückblick, Szenen, Jam, Physik
- Anlass (Christian, 21.10. 10:29):
  - Beim Spielen öffnen lange Töne das Menü und Doppeltipp wählt die Form – das unterbricht den Flow.
  - Er fragt nach Mindestanforderungen und einem Weg für ältere Geräte.
  - Umsetzen soll ich die Vorschläge 1, 2, 6 und 7.
- **Spielen | Bearbeiten** (`Play`, `Cfg.play`, Standard Spielen; Schalter im Steuerfeld, Befehl `playmode`):
  - Im Spielmodus spielt jede Berührung einer Form. Langes Drücken und Doppeltipp (Alle, Raum) tun nichts, im Raum verschiebt Ziehen nichts (`rhold`), Antippen hält nichts an.
  - Werkzeuge über den Kreis-Knopf ◉ (im Spielmodus immer sichtbar):
    - antippen = Kreis der gewählten Form,
    - **◉ festhalten + Form antippen** = Kreis dieser Form (`Play.mod`),
    - ◉ lange drücken = Modus wechseln.
  - Namen antippen öffnet weiterhin den Kreis.
- **Leistung** (`Perf36`, `Cfg.perf`: Automatisch/Hoch/Mittel/Leicht):
  - Leicht: Pixelverhältnis ≤ 0,85, 30 Bilder/s (Zeit wird gesammelt), ohne Lichtpunkte, ohne Kantenglättung (ab dem nächsten Start), Rückblick 30 s.
  - Die Automatik stuft nach etwa 10 s unter 26 Bildern/s herunter und sagt Bescheid.
- **Rückblick** (Vorschlag 1, `Retro`):
  - Ein zweiter `klang-rec`-Knoten am Ausgang hält ständig die letzten 60 s (einstellbar Aus/30/60/120).
  - „Rückblick“ (Leiste, Kreis → Spielen, Live-Kreis) speichert sie als Mitschnitt, Stille vorn und hinten wird abgeschnitten.
- **Szenen A–H** (Vorschlag 2, `Szenen`; Zeile im Steuerfeld):
  - Gesichert werden je Form An/Aus, Lautstärke, Drehung (y/x/z), Angehalten, Einzeln und Loops-Aussetzen.
  - „＋ Speichern“ und dann einen Knopf antippen, oder einen Knopf lange drücken, speichert.
  - Antippen ruft die Szene ab, mit Übergang ↝ sofort/1/2/4 Takte ab der nächsten Eins (Glide, Fade, Lautstärke-Rampe).
  - Szenen werden im Projekt gespeichert (`Project.data().scenes`).
- **Gemeinsam spielen** (Vorschlag 6, `Jam`; `room`-Capability, benannter Raum `jam-<code>`):
  - Presence (unter 4 KiB): Name, Gastgeber, Tempo, Stimmung, bis zu 4 Formen (Seed, Instrument, Lautstärke, An/Aus, Drehung, Position, erster Loop mit bis zu 24 Ereignissen).
  - Die anderen erscheinen als Gast-Formen (`f.remote`, nicht gespeichert).
  - Live-Töne laufen über die Themen `n`/`nr`.
  - Takt nach Weltzeit (Start zur nächsten Takt-Eins der Uhr); Tempo und Stimmung kommen vom Gastgeber.
  - Geht nur im veröffentlichten Artifact mit Anmeldung (Organisation oder eingeladene Gäste). Senden von Live-Tönen ab Contributor; Zuschauer teilen nur ihren Zustand.
- **Physik im Raum** (Vorschlag 7, `Phys`):
  - Anschubsen gibt den Formen zusätzlich Schwung über den Boden (Bildschirmrichtung → Kamera).
  - Reibung, kreisförmige Wand (R 7,2), elastische Stöße (e 0,88) mit Ton beim Aufprall (Stärke nach Aufprallgeschwindigkeit).
  - Die Mischung (Stereo/Nähe) folgt der Bewegung.
  - Gehaltene Formen sind fest.
- **Befehle/Kreis:**
  - Neuer Bereich „Spielen“ (`playmode`, `retro`, `scenes`, `phys`, `jam`, `rec`, `loop`, `allstop`).
  - Standard-Leiste: Kneten, Malen, Loop, Live, Rückblick, Szenen. Der Live-Kreis enthält Rückblick und Szenen.
- Prüfstand neu: **SP**, **SZN**, **PH**, **RB**, **JM** (insgesamt 71 Tests).

## Systemanforderungen (Stand v36, Einschätzung)
- **Browser:** aktuelles Chrome/Edge (Android, Windows, macOS) oder Safari ab iOS/iPadOS 16. Nötig sind WebGL 1, Web Audio mit AudioWorklet (sonst Notbetrieb mit etwas mehr Verzögerung) und IndexedDB.
- **Flüssig (Stufe „Hoch“):** Mittelklasse ab etwa 2020, zum Beispiel iPhone 11/SE 2, Pixel 5, Galaxy A52, Snapdragon 7-Serie; mindestens 4 GB RAM, besser 6 GB. Auf dem Rechner jede integrierte Grafik ab Intel UHD 620.
- **Untergrenze (Stufe „Leicht“):** etwa 2017/18, zum Beispiel iPhone 8, Galaxy A50, Snapdragon 6xx; 3 GB RAM. Mit 30 Bildern/s, weniger Bildpunkten, ohne Lichtpunkte und Kantenglättung.
- **Speicher:**
  - Die Datei hat rund 13 MB.
  - Instrumente werden bei Bedarf entpackt (etwa 50–150 MB Arbeitsspeicher).
  - Der Rückblick braucht rund 23 MB bei 60 s (48 kHz Stereo); „Leicht“ hält 30 s.
- **Ton:** Eine Ausgabelatenz unter etwa 40 ms fühlt sich direkt an. Android liegt je nach Gerät bei 20–80 ms, iOS bei etwa 10–20 ms. Kabelkopfhörer sind besser als Bluetooth, das 150–250 ms Verzögerung bringt.
- **Gemeinsam spielen:** veröffentlichtes Artifact, angemeldet (Mitglied der Organisation oder eingeladener Gast) und stabiles WLAN. Live getippte Töne kommen mit etwa 0,1–0,4 s Verzögerung an. Formen, Drehungen und Loops laufen dagegen auf jedem Gerät selbst im gemeinsamen Takt.

## v35: Drehrichtung, Kreis für Live-Mitschnitt, „＋“ immer da
- Anlass (Christian, 21.10. 08:44):
  - Die Drehrichtung ist teilweise vertauscht.
  - Im Kreis müssen bei einem Live-Mitschnitt alle Optionen schnell zu finden sein.
  - In einem neuen Stück fehlt nach der ersten Form das Plus.
  - Er möchte 10 grundlegende Vorschläge zur Weiterentwicklung (stehen in der Antwort vom 21.10. und unten).
- **Drehrichtung** (`Dir35`):
  - Ursache: Die Korrektur war vertauscht. Waagerechtes Drehen wurde nach dem Kamerawinkel umgekehrt, obwohl die Hochachse von jedem Blickwinkel gleich aussieht. Senkrechtes Drehen um die Welt-X-Achse wurde nie korrigiert. Außerdem kehrt sich die Hochachse um, wenn die Form kopfüber steht (Euler XYZ: Achse = Rx·Y).
  - Jetzt: waagerecht × Vorzeichen von cos(rx), senkrecht × Vorzeichen von cos(Kamera-az). Gilt für Anschubsen (`Input.pushForm`) und Drehen mit dem Finger (`turnStart/turnMove/turnEnd`).
  - Prüfstand **DR**: aufrecht/kopfüber × von vorn/von hinten.
- **Kreis**:
  - Bereichsleiste (Hochformat unten, Querformat links): ★ Favoriten · ● Live · Klang · Drehen · Loops · Form · Werkzeuge · Ansicht · Mehr. Damit ist jeder Befehl mit höchstens 2 Tipps erreichbar.
  - Jeder Bereich zeigt immer alle seine Plätze; was gerade nicht geht, ist blass. So liegt jeder Befehl immer an derselben Stelle.
  - Die Mitte schließt.
  - **Live-Kreis**: Während „Live“ aufnimmt, öffnet der Kreis gleich 8 Live-Befehle (Loop, Drehen, Schneller, Einzeln, Live stoppen, Ein/Aus, Loops anhalten, Langsamer). Die Mitte zeigt die Aufnahmezeit. Einstellbar unter „Bedienung anpassen“ (`Cfg.live`, `liveAuto`).
  - Der Kreis öffnet sich nie während einer Geste mit mehreren Fingern. Vorher konnte Kneifen im Raum ihn öffnen und beim Loslassen einen Eintrag wählen (z. B. Effekte), worauf ein Blatt aufging.
- **Seiten-Zoom verhindert**:
  - Ursache: Das Steuerfeld hatte `touch-action: manipulation`; Namen, Kopfzeile und Kreis hatten `auto`. Kneifen dort vergrößerte die ganze Seite (im Test bis 5×).
  - Jetzt: Steuerfeld `pan-y`, die übrigen Bedienelemente `none`.
- **＋ Neu** steht immer vorn im Steuerfeld, in jeder Ansicht und Ausrichtung.
- **Testumgebung**: Nach einem Neustart verarbeitet der Headless-Browser Berührungen mit bis zu 1 s Verzögerung. Doppeltipp- und Kneif-Tests (e2e24, e2e21) sind dadurch instabil; v33 und v34 fallen dort genauso durch. Die Logik ist über die Prüfstand-Tests DR, KR und KL abgedeckt.

## 10 Vorschläge zur Weiterentwicklung (21.10.)
1. Aufnahme-Timeline mit Rückspulen (Retrospective Capture: die letzten 60 s immer mitschneiden).
2. Szenen/Snapshots: kompletter Zustand aller Formen (Drehung, Lautstärke, Effekte) auf 4–8 Szenen-Pads, mit Übergang.
3. Tonart- und Akkordführung als sichtbare Spur (Harmonie-Leiste über der Leinwand, Akkordwechsel antippen).
4. Automationen: Gesten (Drehen, Lautstärke, Filter) als Kurven aufnehmen und loopen.
5. MIDI-/Controller-Anbindung (Web MIDI: Pads, Keyboard, Drehregler steuern Formen; MIDI-Clock-Sync).
6. Gemeinsam spielen (Jam): mehrere Geräte im selben Raum über die geteilte Datenbank des Artifacts, jede Person eine Form.
7. Physik im Raum: Formen stoßen sich ab, kollidieren, prallen ab und lösen dabei Töne aus (Klang-Billard).
8. Eigene Klänge sampeln und als Form kneten (Mikrofon → Granular-Engine, Knet-Geometrie steuert Körnung).
9. Performance-Modus: aufgeräumte Bühnenansicht mit großen Szenen-/Loop-Knöpfen, Tempo-Tap, Panik-Taste, ohne versehentliche Bearbeitung.
10. Export als Stems und als Projektpaket für DAWs (WAV je Form/Spur + MIDI + Tempo), Import zurück.

## v34: Kreis-Menü überall, Leiste ausblendbar, Bedienung einstellbar
- Anlass (Christian, 21.10. 02:20, Screenshot vom Handy): „Viel besser! Das runde Kontextmenü ist gut! Das bitte in allen Ansichten einsetzen, alle Befehle sollten zusätzlich direkt dort erreichbar sein. Das Ausblenden des Menüs am unteren Rand zulassen, sodass ein wesentlich größerer Arbeitsbereich entsteht. Der Nutzer kann die Leiste und den Kreis in den Einstellungen konfigurieren.“
- **Befehlsverzeichnis** `Cmd`: 51 Befehle mit Symbol, Beschriftung (abhängig vom Zustand), Ausführung, „an“-Zustand, Sichtbarkeit, `keep` (Kreis bleibt offen) und `warn` (Bestätigung). 7 Bereiche (`Cmd.GROUPS`): Klang, Drehen, Loops, Form, Werkzeuge, Ansicht, Mehr. Leiste, Kreis und Einstellungen nutzen dasselbe Verzeichnis.
- **Kreis in allen Ansichten**:
  - Lange auf eine Form drücken öffnet den Kreis jetzt auch in Form und Alle (`Input.down`-Hülle, Zeit einstellbar, Standard 0,6 s; im Raum wie bisher).
  - Weitere Wege: Namen antippen (Alle), Formname im Steuerfeld lange drücken, Kreis-Knopf ◉.
  - „Alles“ → Ring der 7 Bereiche → Ring der Befehle des Bereichs. Die Mitte führt zurück bzw. schließt.
  - Schalter wie Schneller, Langsamer, Richtung, Ein/Aus, Einzeln, Aussetzen und Löschen-Bestätigung lassen den Ring offen.
  - Fehler behoben: Der Klick nach dem Loslassen schloss den eben geöffneten Kreis (`swallowClick` bei jedem Loslassen).
- **Leiste ausblenden** (`KSheet.det = "hid"`):
  - Auslöser: ⌄ in der Leiste, nach unten wischen oder Extras → „Leiste weg“.
  - Leiste und Reiter verschwinden (`body.khid`, `body.kfreetabs`; die Reiterleiste links im Querformat ebenfalls).
  - „▴ Leiste“ unten holt sie zurück; Kreis-Knopf ◉ unten rechts (`Fab`).
  - Kneten, Malen und Melodie zeigen ihr Feld trotzdem.
- **Bedienung anpassen** (`Cfg`, gespeichert als `cfg34`; zu erreichen über Menü, Extras oder Kreis → Mehr):
  - Leiste: ausblendbar, immer da oder ausgeblendet; Reiter mit ausblenden; Kreis-Knopf: wenn die Leiste weg ist, immer oder nie.
  - Knöpfe der Leiste: 1–6 aus allen Befehlen, mit Reihenfolge.
  - 8 Kreisplätze per Auswahlliste; Größe klein, mittel oder groß; langes Drücken aus, kurz, mittel oder lang.
  - „Standard wiederherstellen“.
- Prüfstand neu: **KR** (alle Befehle über „Alles“ erreichbar, 8 Plätze) und **KL** (Leiste samt Reitern ausblenden und zurückholen).

## v33: Mehr Leinwand, nur die gewählte Form, Bewegung im Griff, echte Spitzen, Bild als Ganzes
- Anlass (Christian, 21.10. nachts): Querformat „richtig schlecht“, die Menüs verkleinern die Arbeitsfläche extrem (Screenshot im Claude-App-Viewer, ca. 330 px hoch). Außerdem: Bilderkennung geht nur von einer Linie aus; Form-Ansicht springt in den Raum, andere Formen verdecken; angehaltene Formen nicht wieder anschubsbar; im Raum angeschubste Formen nicht anhaltbar; Loops nicht löschbar; ganze Form färben / Farbe löschen per Knopf; Beat-Bereich und sein Einfluss auf den Raum unklar; spitze Formen kneten klappt nicht.
- **Querformat** (`Lay33`, `Orient`: `body.kside` ab 640 px Breite, `body.kland` zusätzlich bei Höhe ≤ 520 px):
  - Reiter als 60-px-Leiste links (`--rail`), Kopfzeile kompakt (nur Symbole), Form · Alle · Raum oben rechts nur als Symbole, Formen-Leiste/Formname/Hinweise ausgeblendet.
  - Steuerfeld zu = **eine Zeile unten** (Form, 5 Schnellknöpfe, Chips, ◂ Mehr); auf = Seitenfeld rechts (`body.kpanel`, Breite `--kpw` = min(340 px, 42 vw)). Zustand je Ausrichtung gemerkt (`ksDet` / `ksDetL`, Standard: zu). Malen/Kneten öffnen das Seitenfeld automatisch (`.kmode`).
  - Gemessen 700×330: Leinwand ca. 80 % der Höhe (vorher ca. 15 %).
  - Kamera-Versatz (`Scene.shiftView`) rechnet Seitenfeld und Reiterleiste ein; Raster „Alle“ in `kland` mit Mindestgröße 28 statt 46 px/Einheit (alles passt ohne Blättern).
- **Hochformat**: aufgeklapptes Steuerfeld niedriger (34 vh bzw. 100 vh − 440 px), Schnellknöpfe dabei 48 px; Chips scrollen statt abgeschnitten („🎧 Alle hören“); „Mehr“ unter 430 px nur als ▴. **Tippen auf die freie Leinwand klappt zu** (alle Ausrichtungen).
- **Form-Ansicht** zeigt nur die gewählte Form: `Iso.hides` blendet in `nah` alle anderen Formen samt Teller aus und nimmt sie aus dem Treffertest.
- **Bewegung** (`Bew`):
  - Kopfzeile des Steuerfelds: „⏸ Anhalten“ (gewählte Form dreht), „▶ Weiter“ (gewählte Form angehalten), „▶ Alle (n)“ (weitere angehaltene Formen).
  - Fach **Drehen**: Liste „Alle Formen“ mit Zustand (dreht / angehalten / läuft aus / wartet auf ▶ / steht), ▶/⏸ je Form, Zeile antippen = Auswahl, „Auswahl weiter/anhalten“, „Alle weiter/anhalten“.
  - **Raum**: drehende Form antippen = anhalten (`Input.downRaum`-Hülle, `Motion.pause` → resumierbar). Schnell wischen schubst wieder an. Radialmenü zeigt bei angehaltener Form „Weiter“.
- **Loops löschen**: Fach Loops → „Letzten löschen“, „Alle löschen (n)“ (zweimal tippen, 2,6 s). Rückgängig möglich.
- **Malen**: im Steuerfeld zwei große Knöpfe „Ganze Form färben“ (`Tools.fill`) und „Farbe ganz löschen“ (`pw.fill(0)`); der kleine „Ganz“-Knopf der Palette ist dort ausgeblendet.
- **Kneten Spitz** (`Spike`): beim Herausziehen wird der Punkt unter dem Finger festgehalten (vorher wanderte der Treffpunkt mit dem Finger → Grat statt Spitze), auf den nächsten Gitterpunkt gesetzt und mit Kegel-Profil (Winkel 0,15 rad, Exponent 2,1) angehoben; `maxStep` Spitz 0,32. Auto: deutlich nach außen ziehen hält den Punkt ebenfalls fest; schnell = Kegel. Mittel/Auto: seitlich gleiten zieht weiter einen Grat.
- **Beat**: Karte „So hängt der Beat mit deinen Formen und dem Raum zusammen“ (ein Takt, eine Harmonie, ein Raum über „Hall · Raum“, ein Stopp, Drum-Kit als Form) mit „Raum ansehen“ / „Drum-Kit als Form“, ausblendbar (`bwhyClosed`). Regler „Hall“ heißt „Hall · Raum“. Im Raum zeigt das Steuerfeld bei laufendem Beat den Chip „♪ Beat“.
- **Bild wird Musik v2** (`BildX`, Hüllen um `K.analyzeImage`/`K.arrangeFromImage`):
  - Struktur: 16 Spalten (Auffälligkeit = Helligkeitsabstand + Sättigung + Kanten, Schwerpunkt-Höhe je Spalte), Linienqualität je Spalte (`lineQ` = Kante auf der Linie / Rest der Spalte; Linie zählt nur bei `lineStr ≥ 0.45` und `lineQ > 5.5`), Symmetrie, Bildobjekte (zusammenhängende auffällige Bereiche auf 24er-Raster).
  - Stimmung: Valenz, Energie, Spannung → Stimmung per Vorbild (froh, melan, episch, entsp, treib, geheim); Tempo aus Energie; Tonumfang 11 statt 9 Stufen bei Spannung.
  - Farben: Akkord je Takt aus dem Farbton des Bildviertels (rot/orange I, gelb V, grün IV, blau VI, violett II), wenn das Bild bunt genug ist; doppelte Folgeakkorde → Stimmungsfolge.
  - Anordnung: 3 Bänder – oben = Lage der Fläche, unten = Gewicht von Bass/Kick (tiefer bei schwerem Boden), Details oben = schnellere Hi-Hats; Rollen-Farben nach Band (Melodie Mitte, Bass unten, Fläche oben).
  - Melodie: Linie wo klar, sonst Spaltenschwerpunkt; Notendichte je Takt aus Kanten; Symmetrie → Rhythmus der ersten Hälfte kehrt wieder.
  - Anzeige: Foto mit Takt-Akkorden, Bändern, Kontur (orange Linie / türkis auffällige Stellen), Bildobjekten; Block „So liest KLANGRAUM dein Bild“ (① Struktur, ② Stimmung mit 3 Reglern, ③ Farben mit Akkordkarten, ④ Anordnung); neue Regler Farbvielfalt und Symmetrie.
- **Unabhängige Prüfung** (Prüf-Agent, 9 Punkte, 4 Bildschirmgrößen) und Nachbesserung:
  - Hinweis-Chips: Sie verschwanden hinter anderen Knöpfen oder liefen links aus dem Bild. Jetzt stehen sie im Hochformat und im Seitenfeld in einer eigenen Zeile. Im Querformat bei zugeklapptem Feld schweben sie über der Zeile unten; Kamera und Pads berücksichtigen das über `Lay33.top`.
  - Hochformat unter 720 px Höhe: Beim Aufklappen verschwinden die Schnellknöpfe (32 vh). In der Form-Ansicht rückt die Kamera zurück, damit die ganze Form in den freien Bereich passt.
  - 700×330 „Alle“: bis zu 8 Spalten, Mindestgröße 28 px/Einheit, alle Formen in einer Reihe.
  - „＋ Neu“ als eigener Knopf vorn in der Zeile unten (Querformat).
  - Pfeil „nächste Form“, Pads und Formnamen weichen dem Seitenfeld aus. Tablet: Das Seitenfeld beginnt unter Kopfzeile und Formen-Leiste.
  - Bild:
    - Das Gewicht des Bodens zählt jetzt auch die Dunkelheit.
    - Symmetrie wird strenger gemessen (auch die auffälligen Stellen; Schwelle 0,8).
    - Energie ist gedämpft.
    - Akkorde aus Farben erst ab Farbvielfalt 0,3, mit ehrlicherem Text.
  - Tippen zum Zuklappen: jetzt bis 500 ms.
  - Hilfe-Pfad: „Techno & Bass → Derbe Beats“.
  - Offen (nicht in v33):
    - Im Raum liegen Formen eng beieinander, ein Tipp trifft dann manchmal die Nachbarform.
    - Das Vorschaubild einer Form in der Leiste oben aktualisiert sich nach dem Kneten nicht.
    - Breite Formen ragen in der Form-Ansicht unter die Pfeile.
- Prüfstand neu: **SZ** (Spitze, 0,2 rad daneben ≈ 0), **NA** (Form-Ansicht nur gewählte Form), **BV** (einzeln/Auswahl/alle weiter); **MB** misst im Querformat die Zeile unten bzw. das Seitenfeld; **P2** heißt jetzt „Bildkontur“.

## v32: Bedienkonzept „Leinwand zuerst“ (Details: claude/KLANGRAUM_KONZEPT_BEDIENUNG.md)
- Anlass: Laut Christian war v31 auf dem Handy viel zu unübersichtlich, die Formen in „Alle“ winzig, die Steuerung schwierig und der Zoom im Raum unbrauchbar. Er wünschte sich ein Team-Konzept mit Recherche.
- Vorgehen: Recherche-Agent (Daumenzone, 44/48-px-Ziele, Bottom-Sheets, Radialmenüs, semantischer Zoom, Gesten in Nomad/Forger/Sketchfab), daraus Konzept, Umsetzung, unabhängiger Prüf-Agent.
- **Steuerfeld** (`KSheet`) unten über den Reitern, ersetzt Werkzeugleiste, Form-Leiste und Dock:
  - Kopfzeile mit Form, Hinweis-Chips (Einzeln · alle hören, Loops ⏸) und ▴ Mehr.
  - 5 Schnellknöpfe: Kneten · Malen · Melodie · Loop · Live.
  - Hochwischen: Fächer Klang · Drehen · Loops · Form · Extras (Pads, Station, Mischpult, Loops von vorn, Formen zurück, Vollbild, Hilfe).
  - Malen: Farben im Feld, ✓ Fertig oben.
  - Belegt nur 19–31 % der Höhe (vorher bis 50 %).
- **Gesten**:
  - Zwei Finger überall: zoomen und verschieben; im Raum auch drehen. Neu: Zoom, Verschieben und Drehen im Raum (`user.rx/rz`).
  - Über die Grenze hinaus kneifen: Form → Alle → Raum bzw. zurück, mit Anzeige „Loslassen → …“ (`Pinch`, `g.acc`).
  - Kneifen oder gemeinsames Schieben auf Formen wird zur Geste (in der Form-Ansicht nur Kneifen auf derselben Form, sonst bleibt es ein Akkord).
  - Doppeltipp auf eine Form in Alle öffnet die Form-Ansicht; zwei Finger kurz tippen = Rückgängig.
  - „Ganze Ansicht“ oben rechts (`ZoomX`).
- **Radialmenü** (`Radial`):
  - 8 Einträge: Kneten, Einzeln, Malen, Lautstärke, Loop, Kopie, Effekte, Alles.
  - Öffnen: lange drücken im Raum, Namen antippen in Alle, lange auf die Kugel oben drücken.
  - Bedienung: tippen oder in die Richtung ziehen und loslassen (Richtung gemessen vom Finger).
- **„Alle“**: Raster nach Breite (Abstand 3,3), Formen bis zu 14 % kleiner als die Breite erlaubt, sonst senkrecht blättern. Die Formen-Kugeln sind in Alle/Raum ausgeblendet, die Namen kompakt.
- **Querformat/Tablet** (`Orient`, `body.kside`): Steuerfeld als Seitenleiste rechts (≤ 37 % Breite), Kamera mit seitlichem Versatz; Raster, Namen, Kugeln und Pfeile weichen aus.
- Prüfstand **MB** (Anteil der Leisten). E2E `e2e23.py`/`e2e24.py` (Multitouch per CDP); `e2e22/19/4/21` angepasst.
- Danach hat ein unabhängiger Prüf-Agent nachgetestet; die Nachbesserungen stehen im Konzept, Abschnitt 8: Doppeltipp, Raster nach Platz, Zoom auf Formen und Tellern, Querformat, 44-px-Tippflächen, blassere Nachbarformen, Radial mit „Stopp“.

## v31: Einfache Oberfläche
- Anlass: Christian fand die Bedienung verwirrend. Seine Punkte:
  - Funktionen waren schwer zu finden.
  - Die Knöpfe Einzeln/Raum/Neu lagen auf einem schwarzen Block.
  - Info-Fenster verdeckten die Formen.
  - Der Ansichtswechsel war schwierig.
  - Kneten erlaubte keine spitzen Formen.
  - Einige Formen klangen plötzlich nicht mehr.
- **Form-Leiste** (`FBar`, `#fbar`):
  - Ein Feld über den Werkzeugen mit allen Optionen der gewählten Form, in vier Fächern:
    - **Klang**: An/Aus, Lautstärke-Regler direkt in der Leiste, Einzeln, Effekte, Instrument.
    - **Drehen**: Drehen/Stopp (mit Stufe), langsam, schnell, Richtung, Wippen, Genau.
    - **Loops**: Loop aufnehmen, **Aussetzen/Einsetzen** der Loops dieser Form, Töne, Station.
    - **Form**: Formblatt, Blenden, Kreis, Kopie, Startform, Löschen (zweimal tippen).
  - Beim Kneten, Malen, Melodie und Bewegung zeigt die Leiste nur die passenden Knöpfe, eine kurze Erklärung (statt schwebender Hinweise) und **✓ Fertig** in der Kopfzeile.
  - ▾ klappt die Leiste zu einer schmalen Zeile ein. Sie bleibt im Vollbild erhalten (blasst dort mit ab).
  - Ersetzt die Formknöpfe neben den Tellern (`#fchips`), die Knopfspalte rechts (`#fctl`), die Bewegungsleiste (`#mbar`), die Knet-/Modus-Leiste (`#modebar`), die Farbzeile (`#palHint`) sowie Lautstärke-Pille und „Klang & Effekt“ im Formnamen. Alle bleiben per CSS ausgeblendet im DOM, die Tests laufen weiter.
- **Ansicht oben links** (`VSeg`, `#vseg`):
  - Ein Umschalter **Form · Alle · Raum**, durchsichtig ohne schwarzen Block; die Kugeln laufen weich darunter aus (Maske).
  - Die alten Ansichtsknöpfe in der Leiste sind weg, „Neu“ steht als erste Kugel.
  - Der Name „Einzeln“ gilt jetzt nur noch für „nur diese Form hören“; die Vollbild-Leiste heißt ebenfalls Form · Alle · Raum.
- **Ansicht „Form“**: Die Form steht mittig in der freien Fläche zwischen den Leisten (`Scene.shiftView`, `camera.setViewOffset`).
- **Störende Hinweise**:
  - Die Anzeige beim Malen und Drehen (`.hud`) steht jetzt klein über den Leisten statt mitten auf der Form.
  - Knet- und Malhinweise stehen in der Form-Leiste.
- **Kneten**:
  - `H_MAX` von 1,15 auf 2,0, `H_MIN` auf −0,6.
  - Modi **Spitz** (Breite 0,05, Schritt 0,2), Mittel, Rund und Auto (schnell = spitz) über `Knead`.
  - Echte Stacheln sind jetzt möglich.
  - Speicherformat `packH`: bis ±1,27 unverändert, höhere Spitzen als `"2:"`-Format (·60); `unpackH` liest beides.
- **Stumme Formen**:
  - Ursache war „Einzeln“ (Solo): Ist es bei einer Form an, sind alle anderen still. Es wird auch automatisch gesetzt, wenn man auf einer stillen Form einen Loop aufnimmt. Auf Christians Screenshot hatten 5 Formen „E“, die übrigen waren still.
  - Jetzt sichtbar und mit einem Tipp lösbar:
    - Im Dock steht „Einzeln: N · Alle hören“.
    - Unter stillen Formen steht „still“.
    - Die Form-Leiste zeigt einen Hinweis mit „Alle hören“.
    - Antippen einer stillen Form bietet „Alle hören“ bzw. „Einschalten“ an (`SoloInfo`, `Input.quietHint`).
- **Loops je Form aussetzen**: `f.lpOff` wird in `Loops.onStep` übersprungen; die Loops laufen im Takt weiter. Der Zustand ist nur vorübergehend (wird nicht gespeichert). Global gibt es weiterhin im Dock Anhalten / Von vorn.
- **Prüfstand**: neue Tests **KN** (Spitze bis 2,0, Speichern) und **UI** (Form-Leiste, Ansicht). E2E `e2e22.py`.

## v30: Aufgeräumt – nichts liegt mehr übereinander
- Anlass: Christians Screenshot vom Handy (412 px breit, Ansicht „Alle“, Malen an). „Alle zurück“ lag auf den Farben, die Farbleiste war breiter als der Bildschirm und die Loop-Pille verdeckte Namen und Formknöpfe.
- **Layout + Dock** (`Layout`, `Dock`):
  - `Layout.measure()` ermittelt alle 220 ms die Oberkante der breiten Leisten unten: Werkzeuge, Farben, Farbzeile, Knet-Leiste, Bewegung, Pads.
  - Das **Dock** steht immer darüber, in einer Zeile. Es zeigt nur, was gerade passt: „Alle zeigen“ (nach dem Zoomen), „Formen zurück“ (in „Alle“, nicht beim Malen oder Kneten) und die Gruppe „Loops · Anhalten · Von vorn“.
  - Die alten schwebenden Knöpfe `#bResetAll`, `#bZoomX` und `#loopx` sind ausgeblendet.
  - Das Dock lässt die rechte Knopfspalte der Form und die Pfeile frei.
  - `--stackh` schiebt Meldungen (Toast) und Hinweise über das Dock.
  - `Scene.insets` rechnet das Dock ein, im Vollbild auch die Leiste oben. „Alle“ passt sich neu ein, sobald sich die Leisten ändern; der Abstand ist 8 % größer, damit hohe Formen und Namen nicht unter die Leisten geraten.
- **Namen unter den Formen**:
  - `Scene.labelSpread` schiebt überlappende Namen nach unten auseinander.
  - Namen unter Leisten oder Dock werden unsichtbar und damit nicht mehr versehentlich antippbar, etwa beim Heranzoomen.
- **Farbleiste**: 8 Farben, Radierer und „Ganz“ passen auch auf 360 px (Größe `clamp`); die Farbzeile wird bei Bedarf gekürzt.
- **Breite der Bereiche**: `.view` und `.vsec` haben jetzt `minmax(0,1fr)`. Vorher war der Beat-Bereich breiter als der Bildschirm (die ⋯-Spalte und „Tap“ waren abgeschnitten).
- **Kleinere Korrekturen**:
  - Knet-Leiste schmaler, damit sie nicht in die Knopfspalte ragt.
  - Pfeile zur nächsten Form etwas höher (45 %).
  - Der Loop-Knopf heißt „+ Loop“, sobald es Loops gibt.
- **Kontext-Hilfe**: ein „?“ direkt in der Kopfzeile von Stück, Beat, Schnitt und Bild öffnet das passende Hilfekapitel (`CtxHelp`).
- **Raum-Hilfe** ist kürzer (tippen · wischen · ziehen · halten · 2× tippen) und erscheint nur die ersten drei Male.
- **Hilfe**: neue Kapitel „Kneten und Malen“ und „Bild wird Musik“; Schnellstart und „Loops anhalten“ sind angepasst.
- **Prüfwerkzeuge**:
  - Prüfstand-Test **LY**: Farbleiste in der Breite, Dock über den Leisten.
  - Werkzeug `claude/tools/audit_layout.py` + `audit.js`: prüft 19 Zustände (Nah, Alle, Raum, Vollbild × Kneten, Malen, Bewegung, Zoom, Regler, Pads) auf überlappende Knöpfe. Ergebnis v30: **0 Überlappungen auf 412 px**, auf 360 px nur die Raum-Hilfe (blendet aus).

## v29
- **Schnittraum** (neuer Reiter „Schnitt“, Modul `Schnitt`): Mehrspur-Editor, sehr einfach gehalten.
  - **● Aufnehmen**: zählt bis zur nächsten Eins ein (Klicks auf jedem Schlag), dann springt die App zu den Formen. Man spielt die Formen; Loops und Beat laufen mit und landen im Take. Ein roter Balken oben zeigt Einzählen und Zeit, dazu **■ Fertig** und **✕** (verwerfen).
  - Der Take liegt danach taktgenau als Clip an der weißen Linie, auf einer neuen Spur oder mit dem ● im Spurkopf auf genau dieser Spur. Beim nächsten Take spielen die vorhandenen Spuren mit (Overdub). Dieses Abspielen läuft direkt auf die Lautsprecher und nicht in den Take.
  - Genauigkeit: Das Worklet meldet seinen Startzeitpunkt (`{t:"t0"}`), und der Take wird ab `tStart` abgeschnitten. Stille am Ende wird gekürzt.
  - **Abspielen und Navigation**: ▶/■, ⏮, Lineal antippen oder ziehen setzt die Position, Schleife (lückenlos vorgeplant), Raster (Schläge), Einzählen an/aus, Klick beim Aufnehmen (nur hörbar), Zoom mit den Lupen in der Linealecke.
  - **Clips**: ziehen verschiebt sie, auch auf eine andere Spur, und rastet auf dem Raster ein. Antippen wählt einen Clip aus; dann kürzen die Ränder ihn.
  - **Werkzeuge für den ausgewählten Clip**: Anhören, Teilen an der Linie, Doppeln, Rückwärts, Klang (öffnet den Wellen-Editor), Löschen, Lautstärke 0–200 %, Ein- und Ausblenden 0–4 s.
  - **Spuren**: Name (antippen zum Umbenennen), M, S, ●, ✕ und ein Lautstärke-Regler.
  - **Ausgabe**: „Mischen & teilen“ rendert per `OfflineAudioContext` eine Aufnahme „Schnitt-Mix n“ (Spitzen über 0,98 werden abgesenkt) und öffnet `Sheets.share`. „Aufnahme einfügen“ holt Live-Sessions, Songs und Dateien als Clip.
  - **Speichern**: Daten in `Project.data().schnitt` (`tracks`, `clips {tr, rec, pos, off, len, dur, gain, fi, fo, rev}`, `ph`, `pps`, `snap`, `cin`, `click`, `loop`). Undo funktioniert, Takes sind Recs mit `kind: "take"` und erscheinen nicht in Stück → Aufnahmen.
  - Stück enthält eine Karte „Schnittraum“; die Reiter-Leiste hat jetzt 5 Spalten.
- **Alle Loops anhalten oder von vorn** (`LoopCtl`):
  - **Anhalten**: `Loops.onStep` überspringt alles, während der Takt weiterläuft; **Weiter** setzt taktgenau fort.
  - **Von vorn**: setzt `t.base = Song.loopStep(nächste Eins)` für alle Takes, ein Versatz von Hand bleibt.
  - Wo die Knöpfe sind:
    - unter Klang rechts als senkrechte Pille, sobald es Loops gibt;
    - im Vollbild oben links;
    - in der Loopstation unter „Aufnehmen“.
- **Raum: anschubsen**:
  - Ein schneller Wisch über eine Form schubst sie an (`Input.pushForm`), langsames Ziehen verschiebt sie weiterhin.
  - Die Entscheidung fällt früh über die Geschwindigkeit (`rflick`) oder beim Loslassen: kurz gezogen und schwungvoll losgelassen, springt die Form an ihren Platz zurück und dreht sich.
  - Im Form-Regler gibt es „■ Drehung stoppen“.
- **Vollbild zum Bearbeiten** (`FullBar`):
  - Oben stehen Nah · Alle · Raum und ✂ (öffnet den Schnittraum), unten die Werkzeuge (Kneten, Malen, Regler, Loop, Live).
  - Alles wird nach 4 s ohne Berührung blass (`body.fidle`) und ist beim nächsten Tippen wieder da.
  - Die Knet-Modusleiste bleibt im Vollbild sichtbar.
- Prüfstand: neue Tests **LC** (Loops anhalten / von vorn) und **SC** (Abspielplan, Teilen auch rückwärts, Doppeln, Blenden, Raster). `Tests.run` hebt das Anhalten für die Messung kurz auf.
- Hilfe: neue Themen „Schnittraum“ und „Alle Loops anhalten oder von vorn“; das Thema Raum erklärt jetzt auch Anschubsen und Vollbild. Version 29.

## v28
- **Raum: spielen und bearbeiten**
  - Antippen spielt die Form; ziehen verschiebt sie (links/rechts = Stereo, nah = lauter); lange drücken öffnet den Form-Regler; doppelt tippen holt sie zum Bearbeiten nach vorn.
  - Der Form-Regler hat im Raum zusätzlich „Höhe (Hall)“ und „Links · rechts“.
  - Namen unter den Formen gibt es jetzt auch im Raum (ziehen = Lautstärke).
  - Werkzeugleiste im Raum: Zurück · Kneten · Malen · Loop · Live · Regler. Kneten und Malen gehen direkt im Raum, ohne Ansichtswechsel.
  - Die Raum-Hilfe erscheint als kleine Pillen unter der Leiste und blendet nach 9 s aus.
  - Code: `Input.downRaum(p, h)` mit `kind "rnote"`; `Scene.hit` läuft jetzt auch im Raum.
- **Teilen und Export** (`Share`, `Mp3`, `VideoExp`, `Sheets.share`)
  - „Teilen …“ öffnet das Teilen-Menü des Handys (WhatsApp, Mail, Signal …) über `navigator.share` mit Dateien; geht das nicht, wird über die Download-Funktion gespeichert, mit Hinweis zum Anhängen.
  - **MP3**: lamejs 1.2.1, lädt bei Bedarf von jsDelivr/cdnjs; ohne Netz wird WAV erzeugt.
  - **Video**: 720×720, Kreis-Spektrum, Formfarben, Titel, Welle mit Fortschritt. MediaRecorder läuft in Echtzeit, MP4 bevorzugt (H.264, wo vorhanden), sonst WebM; optional beim Erstellen mithören.
  - **Live-Video**: 🎥 im LIVE-Balken filmt das 3D-Bild der Formen mit Ton; `Rec.vStart/vStop`, gespeichert als `r.video` (Blob in IndexedDB).
  - **WAV** und **Paket** wie bisher.
  - Zugänge: Fertig-Blatt nach der Live-Session („Teilen …“ ganz oben), Karten unter Stück → Aufnahmen („Teilen“) und Wellen-Editor.
  - AVI erzeugen Browser nicht; MP4 ist das Format für WhatsApp und Mail.
- Hilfeseite: neue Themen „Raum“ und „Teilen“; Version 28.

## v27
- **Lautstärke je Form**:
  - Den Namen unter dem Teller (Ansicht „Alle“) waagerecht ziehen: rechts lauter, links leiser, rastet bei 100 % ein; mit Anzeige und Vibration.
  - In der Einzelansicht gibt es dafür die 🔊-Pille neben „Klang & Effekt“ (ziehen oder tippen).
  - Umgesetzt in `Feel.volDrag`; der Balken unter dem Namen zeigt die Lautstärke.
- **Form-Regler** (`FPop`): ein kleines Feld über den Werkzeugen.
  - Öffnen: Namen oder Pille antippen, oder lange auf die Kugel in der oberen Leiste drücken.
  - Inhalt: Lautstärke-Regler, Schnellwerte 0–150 %, Ein- und Ausblenden je Form (sofort, ½, 1, 2, 4, 8 Takte), Aus-/Einblenden-Knopf, Einzeln.
  - Unter ⋯: Klang & Effekt, Drehung, Formblatt, „Blenden für alle“, Löschen.
  - Schließt bei Tipp außerhalb oder mit Esc.
- **Ein-/Ausblenden je Form** (`Fade`):
  - `f.fade = {in, out}` in Takten (Standard 1/1), wird im Projekt gespeichert.
  - Die Rampe läuft über `f.fadeG` in `applyMix`; erst am Ende wird die Form wirklich stumm.
  - Gilt im Form-Regler, im Mischpult (M), im Song-Raster (M), auf Pads „Form an/aus“ und im Formblatt.
- **Ruhige Leisten** (`Calm`, Menü-Schalter, Standard an):
  - Neben dem Teller nur ● Loop · E · Drehen · ⋯; die Bewegungsleiste zeigt Langsam · Drehen · Schnell · Mehr.
  - Aufgeklappt klappen beide nach 7 s wieder zu; nach 3,5 s ohne Berührung werden die Leisten blass.
- **Feinfühliger**:
  - Empfindlichkeit der Gesten im Menü (Standard 115 %): beeinflusst die Schwelle fürs Anschubsen, wie stark Anschubsen und Loslassen wirken, und wie schnell Ziehen die Lautstärke ändert.
  - Vibration beim Anschubsen, Ziehen und Tippen, im Menü abschaltbar.
- **Hilfeseite** (`Help`):
  - Eigene Seite mit Suche, Inhaltsverzeichnis und 11 Themen (Schnellstart bis Problemlösung); öffnet über Menü → „Hilfe öffnen“ oder Taste ? / F1.
  - Das Menü enthält jetzt nur noch Einstellungen und die Quellenangaben.
  - Dieselben Texte liegen als `claude/KLANGRAUM_HILFE.md` im Projekt.
- **Projektgedächtnis** `claude/KLANGRAUM_GEDAECHTNIS.md` sowie Werkzeuge unter `claude/tools/` für die Weiterarbeit in einem neuen Chat.

## v26
- **Kategorie „Techno & Bass“ mit 28 Formen** in vier Gruppen (Seed-Feld `grp`, Überschriften im Auswahlblatt):
  - **Derbe Beats**: 7 Drum-Kits als Formen.
    - Hardtechno, Rumble, Industrial, Gabber, Schranz, 909, Minimal.
    - Seed-Feld `kit`; Zonen über `K.kitZone`: Kick < 0,34, Snare < 0,6, Hats < 0,84, darüber Becken.
    - Die Klänge rechnet `Techno.kits()` nach dem Start aus `Techno.Drum`; sie liegen als `drum:<kit>_<zone>` im Audio-Thread.
    - Loop-Editor zeigt die Zeile „Becken“; Track-Bau und Bewegung nutzen ebenfalls das Kit.
  - **Harte Bässe**: 7 Formen, offline mit `tb/render_hard.py` erzeugt, MP3 mit 40 kbit/s.
    - Hard Reese, Acid übersteuert, Wobble, Growl, Neuro, Rumble-Bass, Hardbass-Donk.
  - **Techno-Bässe**: wie in v25 (6 Formen).
  - **Krasse Sounds**: Hardstyle-Lead (Supersaw), Laser, Sirene, Metall-Klang, Screech, Glitch, dazu Hoover und Dub-Stab.
- **Beat-Bereich**:
  - Neue Stile Industrial (138), Schranz (152), Gabber (175).
  - Neue Kick-Klänge Gabber, Industrial, Schranz; Snare „Zerhackt“; Perc „Metall“; Bass „Hart verzerrt“.
- Der Prüfstand meldet 66 Instrumente mit eingebauten Aufnahmen (689 Töne); die Versionsanzeige steht auf 26.

## v25
- **„+ Neu“ hat drei Kategorien** (Reiter oben im Blatt, merkt sich die letzte Wahl über `seedCat`; Seeds mit `cat`): Instrumente · Techno & Bass · Stimmen.
- **Techno & Bass**: 8 Formen mit eingebauten Tönen.
  - Die Töne werden offline mit `tb/render_tb.py` erzeugt: SVF-Filter, bandbegrenzte Sägezähne, MP3 mit 48 kbit/s, alle 3 Halbtöne ein Ton. Stimmung geprüft, meist innerhalb weniger Cent.
  - Acid 303 (`tb_acid`), Reese-Bass (Schleife), Sub-Bass (Schleife), 808-Bass, Rolling Bass, FM-Growl, Hoover (Schleife), Dub-Stab (mit eingebautem Echo).
- **Stimmen**: 5 Formen, Formant-Gesang offline mit `tb/vox_render.js` erzeugt, alle als Schleife.
  - Stimme Aah, Stimme Ooh, Männerstimme Oh, Gesangschor (4 Stimmen), Roboterstimme.
- **Gesangschnipsel als Formen** (`Sheets.vxForm`): 16 Phrasen, Rufe, Chor- und Roboter-Schnipsel als eigene Kacheln.
  - Sie werden in der Tonart gesungen und über `AudioIn.process` zu Sample-Formen, deren Grundton erkannt wird.
- `Perf.REG` für alle neuen Formen eingetragen; der Prüfstand meldet 53 Instrumente mit eingebauten Aufnahmen (542 Töne).
- Die Versionsanzeige steht auf dem Startbildschirm und im Menü.

## v24
- **Reiter „Beat“** (4. Reiter, Modul `Techno`): eine Techno-Groovebox, die mit `Transport` im selben Takt läuft (`Techno.onStep`).
  - Signalweg: Spuren → Pump-Gruppe (Sidechain auf der Kick) → DJ-Filter (Tiefpass/Hochpass) → `Engine.sum`. Dadurch landet der Beat auch im Mitschnitt.
  - Hall geht über `Engine.verb`; das Dub-Echo hat eine eigene Verzögerung im Takt.
- **11 Spuren**:
  - Kick (909/Rumble/Hart/808/Tief), Clap, Snare, Hi-Hat, Open Hat (mit Choke), Ride/Crash/Glocke, Perc (Tom/Conga/Rim/Cowbell/Zap). Diese Drums werden beim Start einmal berechnet, nach analogen Schaltungen nachgebildet (`Techno.Drum`).
  - Bass (Acid 303 mit Akzent und Slide, Rolling, Sub, Reese, Pluck), Stab (Dub/Chord/Rave/Orgel), Fläche (Dunkel/Luftig/Drone) spielen live über Oszillatoren und Filter.
  - Gesang.
  - Bass und Akkorde folgen der Harmonie (`Transport.chordAtStep`).
- **9 Stile** mit je 4 Szenen (A Intro, B Groove, C Höhepunkt, D Break), erzeugt von `Techno.gen(stil, seed)`: Berlin, Minimal, Acid, Dub Techno, Hard Techno, Detroit, Melodic, Tech House, Rave.
  - Szenen wechseln zur nächsten Eins; „Auto“ alle 4/8/16 Takte; lange drücken: kopieren, leeren, sofort wechseln, Build-up-Länge einstellen.
- **Auftritt**: Build-up (Snare-Wirbel, Rauschen, das ansteigt, Filter steigt mit → Drop mit Impact), Drop, Break, Fill, Stotter (gedrückt halten), Würfeln.
  - DJ-Filter als XY-Fläche, federt beim Loslassen zurück oder bleibt auf Wunsch stehen.
  - 10 Regler (`st.mac`): Bass-Filter, Resonanz, Hüllkurve, Verzerrung, Kick-Druck, Pumpen, Swing, Hall, Echo, Lautstärke.
- **Raster**: 16 Schritte; tippen schaltet aus/an/betont, über mehrere wischen malt; Name antippen = stumm, lange drücken = einzeln.
  - ⋯ öffnet die Spur: Klang, Lautstärke, Hall, Echo, Würfeln, Leeren, beim Bass eine Notenrolle mit Akzent, Slide und Oktave.
- **Gesangschnipsel** (Modul `Voc`, Formant-Stimme): 21 Stück in den Gruppen Vokal, Phrase, Ruf, Chor und Roboter.
  - Gesungen in der Tonart und im laufenden Akkord, Frauen- oder Männerstimme.
  - Werden vorab berechnet (`voxWarm`) und lassen sich auf die Spur, auf ein Pad, als Form oder in die Aufnahmen legen.
  - Es sind synthetische Stimmen, keine Studioaufnahmen.
- **Song**: Zeile „Beat“ im Raster, jeder Teil hat eine Szene A–D, „aus“ oder „läuft weiter“ (`s.beat`).
  - Der Song startet und stoppt den Beat selbst; „Im Song verwenden“ verteilt Szenen auf alle Teile.
- **Bedienung**:
  - Haptik (`Hap`) beim Tippen.
  - Lange auf ↶ drücken = Wiederholen.
  - Tasten im Beat-Bereich: Leertaste, 1–4, B, D, F, K.
  - Der Beat-Reiter pulsiert, solange der Beat läuft.
- **Speichern und Prüfen**:
  - Projekt speichert `techno` (Szenen, Klänge, Regler, Stil); Rückgängig hält den Beat nicht an.
  - Prüfstand V24.

## v23
- **Übergänge (Drehung + Tempo)**:
  - Modul `Glide` mit Einstellungen: fließend/sofort getrennt für Drehung und Tempo; Länge ½ Schlag … 4 Takte; Einsatz sofort/nächster Schlag/nächster Takt; Verlauf gleichmäßig/weich/langsam anfangen/schnell anfangen. Gespeichert in store.
  - `Motion.glideTo`, `softPause`/`softResume`/`unpause`, `tw()` (Ziel einer Achse), `finishGlides`.
  - Schneller/Langsamer/Anhalten/Weiter/Richtung/Wippen gleiten; die Form läuft dabei hörbar durch die Rhythmen; beim Anhalten läuft sie aus.
  - `TempoRamp`: Tempo gleitet je Sechzehntel, das Raster bleibt lückenlos (`Music.setRaw`).
- **Feinsteuerung**:
  - Blatt „Drehung genau“ (Knopf „Genau“ in der Bewegungsleiste und neben dem Teller): je Achse Stufe steht/½/¼/⅛/1/16/1/32, Richtung, Wippen in 4 Stärken, Anhalten, „Auf alle Formen übertragen“.
  - Dort auch der Übergangsblock und `TempoUI`: −5/−1/Zahl/+1/+5, Regler, „Im Takt tippen“, Stimmungstempo, ×2/÷2.
  - Menü: Tempo-Feld = `TempoUI` plus Knopf „Übergänge“.
  - Bewegungsleiste: „Schwingen“ heißt jetzt „Wippen“ (Platz).
- **Song-Übergänge**:
  - `Song.tr` gilt als Vorgabe für den ganzen Song (hart oder fließend, Länge, Lage davor/mitte/danach, Verlauf); jeder Teil kann `s.tr` als eigene Einstellung haben.
  - `s.lv[fid]`: Pegel je Spur und Teil, 0–150 %; einstellbar per langem Druck aufs Kästchen oder im Teil-Menü.
  - `s.bpm`: Tempo je Teil; gleitet bei fließendem Übergang mit.
  - `Song.intro`/`outro`: Ein- und Ausblenden am Anfang und am Ende.
  - `Song.gainAt` speist `f.songG` → `applyMix`; aktualisiert alle 50 ms und auf jeder Eins.
  - Raster zeigt ⟋-Abzeichen, Blendmasken und %-Werte; „Übergänge hart/fließend“ steht über dem Raster.
- **Aufnahmen bearbeiten**:
  - Modul `FX`, zerstörungsfrei; `Recs.render` merkt sich die letzte Berechnung.
  - Kette: Ausschnitt → Tonhöhe/Tempo → Richtung → Stottern → Wiederholen → Blenden → Klangfarbe → Lo-Fi → Echo → Hall → Lautstärke.
    - Tonhöhe/Tempo: wie Tonband oder getrennt (WSOLA).
    - Richtung: vorwärts/rückwärts/hin und zurück.
    - Stottern 1/32…1/4, Wiederholen 1–16×.
    - Klangfarbe dunkel/hell, Lo-Fi, Echo im Takt, Hall (Schroeder), dB, Angleichen.
  - Voreinstellungen: Radio, Unterwasser, Kathedrale, Dub-Echo, Zeitlupe, Mickymaus, Riese, Geisterhaft, Kassette.
  - „Länge an Takt anpassen“ dehnt die Aufnahme auf ganze Schläge.
  - Ergebnis-Welle „So klingt es“ mit Laufmarke.
  - **Scratchen** mit dem Finger: Puffer vorwärts und rückwärts, Geschwindigkeit wie die Fingerbewegung.
  - Weiter verwenden: „Auf ein Pad legen“ und „Als WAV“.
- **Schnipsel aus Songs**:
  - „✂ Bereich als Schnipsel“ legt eine eigene Aufnahme an (`kind` „schnipsel“, eigenes Audio mit 2 s Rand), mit Bezug `src`/`srcName`/`srcOff`.
  - „In Stücke teilen“: 2/4/8/16 gleiche Teile, je Takt, je Schlag oder an den Einsätzen.
  - Liste im Song-Editor mit ▶/Bearbeiten/Markieren/🗑, farbige Leisten über der Welle; im Schnipsel „zum ganzen Song“.
  - Beim Kopieren oder Importieren von Projekten wird `src` umgeschrieben.
- **Prüfstand**:
  - Neuer Test V23 (Song-Blenden, Tempo-Gleiten, hart, Ausblenden, Speichern, Drehung gleitet/läuft aus/dreht an, FX vorwärts/rückwärts/hin und zurück, Tonhöhe ×2,00, Zeitlupe, Hall/Echo).
  - Die Tests MV und TA laufen mit `Glide.rot` = aus; AS erwartet 10–11 Knöpfe.

## v22
- „+ Neu“ fest links.
- 9 physikalisch modellierte Instrumente.
- Live-Session mit optionalem Mikrofon.

## v21
- Projekte einfacher, mit Cloud-Sicherung.
- Foto-Erklärung.
- Melodie-Sammlung je Form und Projekt.
- Pads ohne Verzögerung.
- Song-Mixer-Raster.

## v20
- Turntable-Knöpfe fest links.
- Zwei-Finger-Ansichtswechsel.
- Formen herauslösen.
- Trackball-Anschubsen.
- HQ-Samples.
- Menschliches Spiel.

## v19
- Melodie tippen/streichen.
- Bis 24 Formen.
- Löschen.
- Alle zurücksetzen.
- Pads.
- Projekt sichert alles.

## v18
- Echte Spielweise je Instrument.
- 307 eingebaute Töne.
- Nur die angeschobene Form dreht sich.
- Isolieren.
- Mehrspur-Loops.

## v17 und früher
- Eingebettete Aufnahmen.
- Echtes Schlagzeug.
- Bewegungsleiste.
- Drei Achsen.
- Loop-Pedal und Loopstation.
- Fertiger Track.
- Töpfern.
- Leere Körper.
- Kamera und Ordner.
- 3D-Plattenspieler.
- Vollbild.
