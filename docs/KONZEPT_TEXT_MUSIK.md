# KLANGRAUM – Konzept „Text wird Musik“ (umgesetzt in Version 79)

> Stand 15.11.2026 · Modul `Text79` · Auftrag Christian: Fotos von Text in Musik umwandeln; die Buchstaben des Alphabets sind Notenwerte; Noten auch nach der Länge der Wörter; der Nutzer nimmt weiter Einfluss; die Live-Fläche greift auch hier.

## 1. Ablauf

1. **Foto** aufnehmen oder Bild wählen – oder den Text eintippen/einfügen.
2. Der erkannte **Text steht in einem Feld** und lässt sich ändern (Lesefehler ausbessern, kürzen, eigene Wörter).
3. **Lesart**, **Gangart**, **Stil** und **Begleitung** wählen. Eine Zeile zeigt sofort: wie viele Töne, wie viele Teile, wie lang.
4. **Anhören** spielt den Anfang vor, ohne etwas anzulegen.
5. **Vertonen** legt ein neues Stück an: eine Form „Text“ spielt die Melodie aus dem Text, eine Band im gewählten Stil begleitet.
6. Danach ist es ein normales Stück: Töne in den **Noten** ändern, Instrumente, Tempo, Stimmung, Song-Teile, Mischen – und die **Live-Fläche** (wird nach dem Vertonen direkt angeboten).
7. Im Stück bleibt der Text gemerkt. „Text vertonen“ zeigt ihn wieder; **„Hier neu vertonen“** ersetzt nur die Text-Melodie (z. B. mit anderer Lesart), **„Als neues Stück“** legt ein weiteres an.

## 2. Die drei Lesarten

### Buchstaben (Vorgabe)
| Zeichen | Tonhöhe | Länge |
|---|---|---|
| A … N | Stufe 1 … 14 der Tonleiter (A = Grundton, H = Oktave darüber) | Selbstlaut (a e i o u y, ä ö ü): lang · Mitlaut: kurz |
| O … Z | wieder von vorn: O = Grundton … Z = Stufe 12 | wie oben |
| ä ö ü | eine Stufe höher als a o u | lang |
| ß | wie s | kurz |
| Großbuchstabe | wie klein | gleich lang, aber **betont** |
| Doppelbuchstabe (ll, ee) | kein neuer Ton | der Ton wird **länger** |
| Ziffer 0–9 | Stufe mit dieser Nummer | lang |

Die Tonleiter ist die der gewählten Stimmung – der Text klingt deshalb immer passend zur Begleitung.

### Wortlängen
Jedes Wort ist **ein** Ton. Die **Zahl der Buchstaben** bestimmt die Tonhöhe (1 Buchstabe = Grundton, 8 Buchstaben = Oktave, ab 15 wieder von vorn). Die **Silben** bestimmen die Länge (eine Silbe = ein Schlag der Gangart, höchstens vier). Wörter mit großem Anfangsbuchstaben sind betont.

### Notennamen
Nur die Buchstaben, die Töne heißen, klingen: **C D E F G A H** (B wie H, S wie E). Jeder andere Buchstabe hält den letzten Ton etwas länger. So werden Namen zu Motiven (B‑A‑C‑H).

### Für alle Lesarten: Pausen
| Zeichen | Pause |
|---|---|
| Leerzeichen | kurz (bei „Wortlängen“ keine – die Wörter folgen aufeinander) |
| Komma, Semikolon, Doppelpunkt, Klammer, Strich | mittel |
| Punkt, Ausrufe-, Fragezeichen | lang |
| Zeilenende | mittel – und bevorzugte Stelle für einen neuen Teil |

## 3. Gangart (Notenwerte)

| Gangart | kurz | lang |
|---|---|---|
| ruhig | Viertel | Halbe |
| normal | Achtel | Viertel |
| lebhaft | Sechzehntel | Achtel |

## 4. Vom Text zum Stück

- Die Töne werden auf **Teile von höchstens 16 Takten** verteilt; getrennt wird am liebsten an Zeilen- oder Satzenden. Höchstens 8 Teile – bei sehr langem Text klingt der Anfang (das Blatt sagt es).
- Jeder Teil ist eine **Loop-Spur** der Form „Text“ und ein **Song-Teil**; im Song spielen sie nacheinander.
- **Mit Band:** Beat, Bass, Akkorde und Begleitung kommen aus „Song bauen“ im gewählten Stil; die dort sonst erzeugten Melodien entfallen – die Melodie ist der Text.
- **Nur die Melodie:** eine einzige Form, zum Selberbegleiten.

## 5. Foto lesen

- Zuerst die **Texterkennung des Geräts** (falls der Browser eine hat).
- Sonst wird einmalig ein **Lesemodul** (Tesseract, Deutsch) von jsDelivr geladen. Das Foto wird auf dem Gerät ausgewertet und nicht hochgeladen.
- Schlägt beides fehl (kein Netz, gesperrte Umgebung), sagt das Blatt es – der Text lässt sich immer eintippen.
- Das Foto wird vorher auf höchstens 1800 Bildpunkte verkleinert; nach 90 s wird abgebrochen.

## 6. Geprüft und offen

- Geprüft: die Regeln (Prüfstand **TX**, **TY**), der ganze Ablauf mit eingetipptem Text, Vertonen mit und ohne Band, „Hier neu vertonen“, Noten, Live-Fläche (`tools/t79_b.txt`).
- **Nicht geprüft: das echte Lesen eines Fotos.** Die Testumgebung hat kein Netz und keine Geräte-Texterkennung; geprüft sind nur die Meldung ohne Netz und der Weg mit einem nachgestellten Lesemodul. Ob Tesseract im Artifact-Rahmen geladen werden darf, ist offen (auf der Website sollte es gehen).
- Handschrift und schräge, dunkle Fotos wird das Lesemodul schlecht erkennen.
- Die Buchstaben-Leiter ist bewusst einfach und erklärbar, nicht „schön“ gerechnet: Welche Melodie entsteht, bestimmt der Text.
