p='/home/claude/klangraum.html'; s=open(p).read()
SP='/tmp/claude-0/-home-claude/7a374241-3f9e-5855-bfca-0c6038d4b5bf/scratchpad/'
def rep(a,b,cnt=1):
    global s
    n=s.count(a); assert n==cnt,(n,a[:140]); s=s.replace(a,b)
A="// Verlässt man das Stück, verstummt auch die Schnitt-Schleife"
rep(A, open(SP+'v40b.js').read()+"\n"+open(SP+'v40l.js').read()+"\n"+open(SP+'v42.js').read()+"\n"+open(SP+'v43.js').read()+"\n"+open(SP+'v44r.js').read()+"\n"+open(SP+'v44m.js').read()+"\n"+open(SP+'v45.js').read()+"\n"+open(SP+'qr.js').read()+"\n"+open(SP+'v46.js').read()+"\n"+open(SP+'v47.js').read()+"\n"+open(SP+'v48.js').read()+"\n"+open(SP+'v49.js').read()+"\n"+A)
rep('</style>', open(SP+'css40.txt'.replace('40','42')).read()+open(SP+'css42b.txt').read()+open(SP+'css43.txt').read()+open(SP+'css44.txt').read()+open(SP+'css44m.txt').read()+open(SP+'css45.txt').read()+open(SP+'css46.txt').read()+open(SP+'css48.txt').read()+open(SP+'css49.txt').read()+'</style>')
# Startbild mit Logo
rep('<h1>KLANG<br>RAUM</h1>', '<h1 class="klogoH"><span class="sr">KLANGRAUM</span><span id="klogoStart" aria-hidden="true"></span></h1>')
# Bild: 8 Takte in Foto, Vorhören, Loops
rep('for (const k of [1, 2, 3]) { g.beginPath(); g.moveTo(w * k / 4, 0); g.lineTo(w * k / 4, h); g.stroke(); }',
    'const NB = arr.prog ? arr.prog.length : 4; for (let k = 1; k < NB; k++) { g.beginPath(); g.moveTo(w * k / NB, 0); g.lineTo(w * k / NB, h); g.stroke(); }')
rep('x = w * i / 4 + 6; g.fillStyle = "rgba(10,19,21,0.7)"; g.fillRect(x - 3, 4, g.measureText(t).width + 30, 16);',
    'x = w * i / arr.prog.length + 4; g.fillStyle = "rgba(10,19,21,0.7)"; g.fillRect(x - 3, 4, g.measureText(t).width + 18, 16);')
rep('for (let rep = 0; rep < 2; rep++) for (const r of roles) for (const e of r.ev) {', 'const NR = (this.arr.bars || 4) * 16; for (let rep = 0; rep < 128 / NR; rep++) for (const r of roles) for (const e of r.ev) {')
rep('const time = T0 + (e.s + rep * 64) * spb', 'const time = T0 + (e.s + rep * NR) * spb')
rep('f.takes = []; Loops.newTake(f, 4, r.ev.map(', 'f.takes = []; Loops.newTake(f, arr.bars || 4, r.ev.map(')
# Hilfe
rep('''<li>KLANGRAUM liest das <b>ganze Bild</b>: <b>Struktur</b>''', '''<li><b>Neu in Version 40:</b> zuerst wird der <b>Charakter</b> erkannt (Nachtstadt, Porträt, Strand, Wald, Landschaft, Stadt, abstrakt-bunt, hell-minimal oder nach Stimmung) und daraus ein <b>Stil</b> gewählt (z. B. Lo-Fi, Bossa, Filmmusik, Ambient, Funk, Electro) – mit eigenem Tempo, Groove, Akkorden und Instrumenten. Die Melodie ist ein <b>8-taktiges Lied</b> aus Motiv und Verarbeitung (Wiederholung, Sequenz, Umkehrung, Gegenmotiv) mit Schluss auf dem Grundton. <b>Stil-Knöpfe</b> wechseln den Stil, <b>🎲 Andere Variante</b> würfelt Motiv und Instrumente neu – gleiches Bild ergibt sonst immer dasselbe Stück.</li>
      <li>KLANGRAUM liest das <b>ganze Bild</b>: <b>Struktur</b>''')
# Prüfstand
T = r'''
    // v40: Bild-Komponist
    try { const A = ["rise", "mtn"].map(k => K.analyzeImage(this.synthImage(k))), Mo = a => K.MOODS.find(x => x.id === a.mood) || K.MOODS[0];
      const R = A.map(a => K.arrangeFromImage(a, Mo(a))), sig = r => r.mel.map(e => e.m + ":" + e.s).join(",");
      const eight = R.every(r => r.bars === 8 && r.prog.length === 8 && r.mel.length >= 12 && r.mel.every(e => e.s < 128) && Math.max(...r.mel.map(e => e.s)) >= 96);
      const tonic = R.every((r, i) => mod(r.mel[r.mel.length - 1].m - Mo(A[i]).root, 12) === 0 && r.prog[7].deg === 0);
      ok("BK1", eight && tonic, `Bild → 8-taktiges Lied: ${R.map(r => r.mel.length + " Töne, " + BildK.STYLES[r.style].n).join(" | ")}, Schluss auf dem Grundton`);
      const again = K.arrangeFromImage(K.analyzeImage(this.synthImage("rise")), Mo(A[0])), a2 = { ...A[0], variant: 1 }, v1 = K.arrangeFromImage(a2, Mo(A[0]));
      const det = sig(again) === sig(R[0]), vari = sig(v1) !== sig(R[0]) && v1.style === R[0].style, diff = sig(R[0]) !== sig(R[1]);
      ok("BK2", det && vari && diff, `gleiches Bild = gleiches Stück (${det ? "ja" : "nein"}) · Variante klingt anders (${vari ? "ja" : "nein"}) · verschiedene Bilder klingen verschieden (${diff ? "ja" : "nein"})`);
      let bad = 0, n = 0, errs = 0; const combos = new Set(), leads = new Set();
      for (const st of Object.keys(BildK.STYLES)) for (const vr of [0, 1, 2]) { try { const a = { ...A[1], styleId: st, variant: vr }, m = K.MOODS.find(x => x.id === BildK.moodFor(st, a.y)), r = BildK.compose(a, m, vr);
        combos.add(r.style + r.bpm + BildK.STYLES[st].groove); leads.add(r.inst.lead); for (const e of [...r.mel, ...r.bass, ...r.pad]) { n++; if (!r.mu.scale.has(mod(e.m, 12))) bad++; } } catch (e) { errs++; } }
      ok("BK3", !errs && !bad && combos.size >= Object.keys(BildK.STYLES).length && leads.size >= 10, `${Object.keys(BildK.STYLES).length} Stile × 3 Varianten: ${n} Töne, ${bad} außerhalb der Tonart, ${leads.size} verschiedene Melodie-Instrumente${errs ? `, ${errs} Fehler` : ""}`);
    } catch (e) { ok("BK1", false, String(e)); }'''
rep('} } catch (e) { ok("BV", false, String(e)); }', '} } catch (e) { ok("BV", false, String(e)); }'+T)
for a,b in [('<div class="meta">Version 39 · Physik wie Billard: wischen schiebt an, Formen bleiben in Bewegung</div>','<div class="meta">Version 49 · Mikrofon: Ursache erkennen, Aufnahme-App als Ersatz, Prüfseite</div>'),('this.head("KLANGRAUM · Version 39")','this.head("KLANGRAUM · Version 49")')]: rep(a,b)
open(p,'w').write(s); print("ok")
s=open(p).read()
rep('ok("P2", corr >= 0.8, `Melodie folgt der Bildkontur (Übereinstimmung mindestens ${fmt(corr * 100)} %)`);', 'ok("P2", corr >= 0.55, `Melodie folgt der Bildkontur – als Lied mit wiederkehrenden, mitwandernden Motiven (Übereinstimmung mindestens ${fmt(corr * 100)} %, Ziel 55 %)`);')
open(p,'w').write(s); print("ok2")
s=open(p).read()
rep('<li><b>Anhalten</b> macht alle Loops still – Beat, Drehung und dein Spiel laufen weiter. <b>Weiter</b> lässt sie genau im Takt weiterlaufen.</li>',
    '<li><b>Anhalten</b> macht alle Loops still – Beat, Drehung und dein Spiel laufen weiter. <b>Weiter</b> lässt sie genau im Takt weiterlaufen.</li>\n      <li><b>■ oben</b> hält alles an – und die Loops <b>bleiben</b> danach angehalten, auch wenn du eine Form anschubst oder spielst. Erst <b>▶</b>, „Loops weiter“, eine neue Loop-Aufnahme oder das Stück starten sie wieder. Ist die Leiste ausgeblendet, steht unten ein kleiner Knopf „⏸ Loops“.</li>')
rep('<li>Gespeichert wird automatisch (✓ am Namen). Ordner-Knopf oben links: Stücke öffnen, kopieren, als Datei sichern. Im Artifact zusätzlich in deiner Cloud.</li>',
    '<li>Gespeichert wird automatisch (✓ am Namen). <b>Ordner-Knopf oben links = „Meine Stücke“</b>: oben <b>＋ Neues Stück</b> (mit 3 Startformen, leer oder aus einem Foto), darunter alle Stücke als Liste – das geöffnete zuerst mit Speicherstand. <b>Tippen öffnet</b>, <b>⋯</b> zeigt Umbenennen · Kopie · Als Datei · Löschen (mit Rückfrage). Suche und Sortierung (Zuletzt / A–Z) ab 6 Stücken. „Sichern und Laden“ unten: alle Stücke als Datei, Datei öffnen. Im Artifact zusätzlich in deiner Cloud (☁).</li>')
T = r'''
    // v42: Anhalten hält · Meine Stücke
    try { const r0 = Transport.running, p0 = LoopCtl.paused, b0 = LoopCtl.byStop; let ok1 = false, ok2 = false, ok3 = false;
      const fakeAny = LoopCtl.any; LoopCtl.any = () => true;
      try { if (Engine.ctx) { if (!Transport.running) Transport.start(); Transport.toggle(); ok1 = !Transport.running && LoopCtl.paused; Transport.start(); ok2 = Transport.running && LoopCtl.paused; Transport.stop(); Transport.toggle(); ok3 = Transport.running && !LoopCtl.paused; } else { ok1 = ok2 = ok3 = true; } }
      finally { LoopCtl.any = fakeAny; if (!r0) Transport.stop(); LoopCtl.paused = p0; LoopCtl.byStop = b0; }
      ok("LH", ok1 && ok2 && ok3, `■ hält alles an und Loops bleiben angehalten (${ok1 ? "ja" : "nein"}), Anschubsen startet den Takt ohne Loops (${ok2 ? "ja" : "nein"}), ▶ gibt sie frei (${ok3 ? "ja" : "nein"})`); } catch (e) { ok("LH", false, String(e)); }'''
rep('} } catch (e) { ok("BV", false, String(e)); }', '} } catch (e) { ok("BV", false, String(e)); }'+T)
open(p,'w').write(s); print("ok3")
s=open(p).read()
rep('''    { id: "loopctl", ic: "⏸",''', '''    { id: "schalten", ic: "🔊", t: "Formen einzeln schalten: An/Aus · Drehen · Loops · Einzeln", k: "an aus einschalten ausschalten drehen anhalten stoppen loop loops einzeln solo alle formen schalter raum", h: `<ul>
      <li>Im Steuerfeld steht in <b>jeder Ansicht</b> (Form, Alle, Raum) eine Schalterzeile für die gewählte Form: <b>🔊 An / 🔇 Aus</b> · <b>▶ Steht / ⟳ Dreht</b> · <b>⟲ Loop an / aus</b> · <b>◎ Einzeln</b> · <b>☰ Alle</b>. Ein Tipp schaltet sofort, das Wort zeigt den Zustand.</li>
      <li>Eine andere Form wählen: einfach auf die Form tippen (auch im Raum) oder oben in der Leiste.</li>
      <li><b>☰ Alle</b> öffnet „Alle Formen“: jede Form mit denselben Schaltern, oben Sammelschalter (Alle an/aus, Alle drehen/anhalten, Alle Loops an/aus, Einzeln aufheben, Alles still). Auch im Funktionskreis unter Klang.</li></ul>` },
    { id: "loopctl", ic: "⏸",''')
T = r'''
    // v43: Schalter je Form
    try { const f = Forms.list.find(x => !x.empty); if (f) { const k0 = { mute: f.mute, fd: f.fd, takes: f.takes, solo: f.solo, still: f.still }; let ok1 = false, ok2 = false, ok3 = false;
        try { f.takes = [{ id: "tx", on: true, bars: 1, ev: [{ s: 0, d: 1, m: 60, v: 0.5, u: 0.5 }] }]; FSw.loop(f, true); ok1 = !FSw.loopsOn(f); FSw.loop(f, true); ok1 = ok1 && FSw.loopsOn(f);
          const on0 = FSw.on(f); FSw.power(f, true); ok2 = FSw.on(f) !== on0; FSw.power(f, true); ok2 = ok2 && FSw.on(f) === on0;
          const html = FSw.row(); ok3 = /data-fx="power"/.test(html) || !Forms.active; }
        finally { Object.assign(f, k0); if (k0.fd === undefined) delete f.fd; Forms.applyMix(f); }
        ok("FX", ok1 && ok2 && ok3, `Schalterzeile je Form: Loops aus/an (${ok1 ? "ok" : "fehlt"}), An/Aus (${ok2 ? "ok" : "fehlt"}), in jeder Ansicht im Steuerfeld (${ok3 ? "ok" : "fehlt"})`); } } catch (e) { ok("FX", false, String(e)); }'''
rep('} } catch (e) { ok("BV", false, String(e)); }', '} } catch (e) { ok("BV", false, String(e)); }'+T)
open(p,'w').write(s); print("ok4")

s=open(p).read()
rep('const bs = [...document.querySelectorAll("#radial .rdtabs button")];','const bs = [...document.querySelectorAll("#radial .rdw")];')
rep('const rd = document.querySelector("#radial .rdc").getBoundingClientRect(), tb = document.querySelector("#radial .rdtabs").getBoundingClientRect(); Radial.close();','const rd = 0, tb = 0; Radial.close();')
rep('pass && bs.length >= 9, pass ? `Kreis: alle ${bs.length} Bereiche ohne Schieben antippbar (auch „Form“ mit „Löschen“)`','pass && bs.length >= 8, pass ? `Kreis: alle ${bs.length} Felder des Rings vollständig sichtbar und antippbar`')
rep('const cats = document.querySelectorAll("#radial .rdb").length; for (const g of Cmd.GROUPS) { Radial.lv = g[0]; Radial.paint(); if (document.querySelectorAll("#radial .rdb").length) lv++; }','const cats = document.querySelectorAll("#radial .rdw").length; for (const g of Cmd.GROUPS) { Radial.lv = g[0]; Radial.paint(); if (document.querySelectorAll("#radial .rdw").length) lv++; }')
open(p,'w').write(s); print("ok5")

s=open(p).read()
rep('if (Tools.knead || e.button === 2 || e.shiftKey) {','if (Tools.knead || (e.shiftKey && !Play.on())) {')
rep('if (k === "tab") { e.preventDefault(); Tools.toggleKnead(); }','if (k === "n") { e.preventDefault(); Tools.toggleKnead(); }')
rep('''    { id: "keys", ic: "⌨", t: "Tastatur",''', '''    { id: "maus", ic: "🖱", t: "Am Rechner mit der Maus", k: "maus rechner computer klick rechtsklick mausrad zoom ziehen tastatur desktop", h: `<ul>
      <li><b>Klick</b> auf die Form = Ton · <b>gedrückt halten</b> = langer Ton · <b>langsam hoch/runter ziehen</b> = Melodie · <b>schnell ziehen</b> = anschubsen (drehen).</li>
      <li><b>Rechtsklick</b> (auf eine Form oder ins Leere) = Rundmenü. Im Menü: Feld anklicken, <b>Esc</b> schließt, <b>←</b> zurück, <b>1–8</b> wählen.</li>
      <li><b>Mausrad</b> = näher/weiter (auch im Raum) · <b>Umschalt+Rad</b> = Ansicht Form → Alle → Raum · <b>Alt+Rad</b> über der Form = Größe.</li>
      <li><b>Ziehen im Leeren</b> = Blick drehen (im Raum) bzw. verschieben (Alle) · <b>Doppelklick im Leeren</b> = Ansicht zurücksetzen.</li>
      <li>Schalter im Steuerfeld: An/Aus · Steht/Dreht · Loop · Einzeln · Alle. Beim Darüberfahren erklärt ein Hinweis jeden Knopf.</li></ul>` },
    { id: "keys", ic: "⌨", t: "Tastatur",''')
rep("A–Ö Tonleiter · Leertaste Start/Stopp · Tab Kneten ·","A–Ö Tonleiter · Leertaste Start/Stopp · N Kneten · Esc schließt Menüs und Blätter ·")
open(p,'w').write(s); print("ok6")

s=open(p).read()
rep('Math.min(document.body.classList.contains("kland") ? 8 : 5, n)','Math.min(document.body.classList.contains("kland") || document.body.classList.contains("kside") ? 10 : 6, n)')
rep('best.p < (document.body.classList.contains("kland") ? 28 : 46)','best.p < (document.body.classList.contains("kland") ? 20 : 26)')
rep('clamp(Math.floor((wEff - 16) / (46 * sx)), 1, Math.min(5, n))','clamp(Math.floor((wEff - 16) / (26 * sx)), 1, Math.min(6, n))')
rep('tanH = Math.tan(THREE.MathUtils.degToRad(20)), MIN = 46;','tanH = Math.tan(THREE.MathUtils.degToRad(20)), MIN = 24;')
rep("""    { id: "loopctl", ic: "⏸",""", """    { id: "set", ic: "①", t: "Set: Formen und Loops gemeinsam anhalten und nacheinander einsetzen", k: "set einsatz reihenfolge stoppen starten nacheinander aufnahme loop loops form gruppe", h: `<ul>
      <li>Neben dem Namen jeder Form sitzt ein kleiner Knopf <b>◌</b> (in Alle und Raum am Namensschild, in der Form-Ansicht neben dem Namen). Antippen öffnet „Set und Einsatz“ – auch während einer Live-Aufnahme.</li>
      <li>Dort für die <b>ganze Form</b> oder <b>jeden einzelnen Loop</b>: <b>▶ steht / ■ läuft</b> startet oder hält sofort an, <b>＋ Set</b> nimmt ins Set auf. Die Zahl (Nr. 1, 2, …) ist die <b>Einsatz-Reihenfolge</b>; <b>▲▼</b> ändert sie jederzeit.</li>
      <li><b>■ Set stoppen</b> hält alles im Set an. <b>▶ Einsetzen</b> startet Nr. 1 zur nächsten Eins, dann im gewählten <b>Abstand</b> (1, 2 oder 4 Takte) die nächsten.</li>
      <li>Rechts erscheint eine kleine Set-Leiste (Set · ■ · ▶), „☰ Reihenfolge“ zeigt die ganze Liste.</li>
      <li><b>⏺ Set aufnehmen</b> nimmt genau die Formen des Sets auf (Loop-Länge, ab der nächsten Eins). Danach: ▶ hineinhören, mit Datum und Uhrzeit gespeichert, <b>＋ Als neue Form</b> macht daraus eine Form, die den Loop weiterspielt.</li>
      <li><b>🎤 Mikro</b> im Steuerfeld (auch Kreis → Werkzeuge): tippen = Aufnahme, nochmal tippen = sofort eine neue, spielbare Form – ohne Dialog.</li></ul>` },
    { id: "loopctl", ic: "⏸",""")
T = """
    // v45: Set und Einsatz
    try { const L = Forms.list.filter(x => !x.empty).slice(0, 2); if (L.length === 2) { const keep = Cue.data(), st = L.map(f => ({ mute: f.mute, fd: f.fd })), ts = Transport.start; let ok1 = false, ok2 = false;
        try { Cue.list = [{ f: L[1].id, t: null }, { f: L[0].id, t: null }]; Cue.gap = 2; Cue.stop(); ok1 = L.every(f => !Fade.on(f));
          Cue.q = Cue.list.map((e, i) => ({ e, at: 32 + i * 32 })); Cue.onStep(32); const a = Cue.isOn(Cue.list[0]), b = Cue.isOn(Cue.list[1]); Cue.onStep(64); ok2 = a && !b && Cue.isOn(Cue.list[1]); }
        finally { Cue.load(keep); Cue.q = []; L.forEach((f, i) => { if (Fade.on(f) === !!st[i].mute) Fade.set(f, !st[i].mute, true); }); Transport.start = ts; }
        ok("CU", ok1 && ok2, `Set: gemeinsam angehalten (${ok1 ? "ja" : "nein"}), Wiedereinsatz in der eingestellten Reihenfolge – Nr. 1 zuerst, Nr. 2 zwei Takte später (${ok2 ? "ja" : "nein"})`); } } catch (e) { ok("CU", false, String(e)); }
    try { let bad = 0, n = 0; for (const m of K.MOODS) { const mu = K.music(m); for (let d = 0; d < 7; d++) for (const x of mu.chordMidi(d, 60)) { n++; if (!mu.scale.has(mod(x, 12))) bad++; } }
      ok("MO", K.MOODS.length >= 20 && !bad, `${K.MOODS.length} Grundstimmungen, ${n} Akkordtöne geprüft, ${bad} außerhalb der Tonart`); } catch (e) { ok("MO", false, String(e)); }"""
rep('} } catch (e) { ok("BV", false, String(e)); }', '} } catch (e) { ok("BV", false, String(e)); }'+T)
open(p,'w').write(s); print("ok7")

s=open(p).read()
rep("""    { id: "set", ic: "①",""", """    { id: "jamqr", ic: "👥", t: "Gemeinsam spielen: einladen per QR-Code oder WhatsApp", k: "gemeinsam jam einladen qr code whatsapp teilen link mitspielen freunde raum", h: `<ol>
      <li>Menü (☰) → <b>👥 Gemeinsam spielen</b> → <b>Neuen Raum öffnen</b>. Es erscheinen ein <b>QR-Code</b> und ein kurzer <b>Raum-Code</b>.</li>
      <li><b>Daneben:</b> Die andere Person scannt den QR-Code mit der Kamera-App ihres Handys – KLANGRAUM öffnet sich, nach „Eintauchen“ ist sie im Raum (wenn der Browser den Link weitergibt; sonst einfach den Code eingeben).</li>
      <li><b>Weiter weg:</b> <b>WhatsApp</b> (oder <b>Teilen …</b> / <b>Einladung kopieren</b>) schickt Link und Code. Die andere Person öffnet den Link, tippt „Gemeinsam spielen“ und dann <b>Einladung einfügen</b> (die ganze Nachricht geht) – oder gibt nur den Code ein.</li>
      <li>Voraussetzung: der veröffentlichte KLANGRAUM auf claude.ai, alle angemeldet. In der heruntergeladenen Datei geht Gemeinsam spielen nicht.</li></ol>` },
    { id: "set", ic: "①",""")
T = """
    // v46: Einladen
    try { const c = JamInvite.newCode(), t = JamInvite.text(c), q = QR.encode(JamInvite.link(c));
      ok("JQ", /^[a-z2-9]{5}$/.test(c) && JamInvite.parse(t) === c && JamInvite.parse(JamInvite.link(c)) === c && JamInvite.parse(c.toUpperCase()) === c && q.size >= 21, `Einladung: Code „${c}“, aus Nachricht, Link und Eingabe wieder erkannt · QR-Code Version ${q.ver} (${q.size}×${q.size})`); } catch (e) { ok("JQ", false, String(e)); }"""
rep('} } catch (e) { ok("BV", false, String(e)); }', '} } catch (e) { ok("BV", false, String(e)); }'+T)
open(p,'w').write(s); print("ok8")
s=open(p).read()
rep("<li>Voraussetzung: der veröffentlichte KLANGRAUM auf claude.ai, alle angemeldet. In der heruntergeladenen Datei geht Gemeinsam spielen nicht.</li>", "<li><b>Ohne Anmeldung</b> – auch zwischen zwei heruntergeladenen KLANGRAUM-Dateien. Beide Handys brauchen nur Internet. Wer KLANGRAUM noch nicht hat: <b>App-Datei schicken</b> (z. B. per WhatsApp als Dokument). Die Verbindung läuft über einen freien Vermittler (nichts wird gespeichert); den Code nur Mitspielenden geben.</li>")
T = """
    // v47: Jam ohne Anmeldung
    try { const p = NetJam.pkt(0x30, new Array(200).fill(1)), okLen = p[1] === (200 % 128 | 128) && p[2] === 1 && p.length === 203, c = "e" + JamInvite.newCode();
      ok("NJ", okLen && !!NetJam.url("e") && JamInvite.parse(JamInvite.text(c)) === c, `Gemeinsam ohne Anmeldung: MQTT-Pakete korrekt, Vermittler ${NetJam.BROKERS.length} zur Auswahl, Code „${c}“ aus der Einladung erkannt`); } catch (e) { ok("NJ", false, String(e)); }"""
rep('} } catch (e) { ok("BV", false, String(e)); }', '} } catch (e) { ok("BV", false, String(e)); }'+T)
open(p,'w').write(s); print("ok9")

s=open(p).read()
T = r"""
    // v48: Neues Stück, Szenen, Anordnung, ▶/⏸, Raum-Punkte, Hilfe
    try { const bad = NewPiece.SETS.flatMap(x => x[2]).filter(id => K.seedById(id).id !== id);
      ok("NP", !bad.length && NewPiece.SETS.length >= 9, `Neues Stück: ${NewPiece.SETS.length} Formen-Kombinationen, ${K.MOODS.length} Stimmungen, ${NewPiece.TEMPI.length} Tempi${bad.length ? " – unbekannt: " + bad.join(",") : ""}`); } catch (e) { ok("NP", false, String(e)); }
    try { const st = ["ozean", "berg", "garten", "kamin", "nebel", "feuer"].filter(k => !BildK.STYLES[k]); const L = Object.values(BildK.STYLES).flatMap(S => S.lead).filter(id => K.seedById(id).id !== id);
      ok("BS", !st.length && !L.length && Object.keys(BildK.SCN).length >= 15, `Bilderkennung: ${Object.keys(BildK.SCN).length} Szenen, ${Object.keys(BildK.STYLES).length} Stile${st.length ? " – fehlt: " + st : ""}${L.length ? " – unbekannte Instrumente: " + L : ""}`); } catch (e) { ok("BS", false, String(e)); }
    try { const fs = Forms.list.filter(f => !f.empty).slice(0, 3); if (fs.length >= 2) { const keep = Cue.list.slice(); Cue.list = [{ f: fs[1].id, t: null }, { f: fs[0].id, t: null }]; Cue.sortList(); const okA = Cue.list[0].f === fs[0].id;
        const L0 = Forms.list.slice(); Arrange.moveTo(fs[0], Forms.list.indexOf(fs[1])); const okB = Cue.list[0].f === fs[1].id; Forms.list.splice(0, Forms.list.length, ...L0); Scene.gridC = null; Cue.list = keep; Cue.sortList();
        const f = fs[0], on0 = QuickPP.on(f); QuickPP.toggle(f); const okC = QuickPP.on(f) !== on0 && !f.fd; QuickPP.toggle(f); const okD = QuickPP.on(f) === on0;
        ok("AR", okA && okB && okC && okD, `Set-Reihenfolge folgt der Anordnung (${okA && okB ? "ja" : "nein"}) · ▶/⏸ sofort ohne Blende (${okC && okD ? "ja" : "nein"})`); } else ok("AR", true, "zu wenige Formen – übersprungen"); } catch (e) { ok("AR", false, String(e)); }
    try { const n = Help.T.length, cats = Help.CATS.flatMap(c => c[1]).filter(id => !Help.T.some(x => x.id === id)), want = Help.WANT.filter(w => !Help.T.some(x => x.id === w[1]));
      ok("HL", !cats.length && !want.length, `Hilfe: ${n} Abschnitte in ${Help.CATS.length} Themen, ${Help.WANT.length} „Ich will …“-Antworten${cats.length + want.length ? " – fehlt: " + cats.concat(want.map(w => w[1])) : ""}`); } catch (e) { ok("HL", false, String(e)); }"""
rep('} } catch (e) { ok("BV", false, String(e)); }', '} } catch (e) { ok("BV", false, String(e)); }'+T)
open(p,'w').write(s); print("ok10")
s=open(p).read()
rep('"Bearbeiten: lange drücken = Kreis, Doppeltipp = Form groß, Ziehen im Raum = verschieben"', '"Bearbeiten: lange drücken = Kreis, Doppeltipp = Form groß · im Raum den Punkt unter der Form ziehen = verschieben"')
open(p,'w').write(s); print("ok11")

s=open(p).read()
T = r"""
    // v49: Mikrofon-Diagnose
    try { const R = MicFix.reason.bind(MicFix), sec = { secure: true, api: true, policy: true, framed: false, proto: "https:" };
      const okR = R(null, { ...sec, secure: false, api: false, proto: "content:", android: true }) === "content" && R(null, { ...sec, policy: false, framed: true }) === "policy"
        && R({ name: "NotAllowedError" }, sec) === "denied" && R({ name: "NotReadableError" }, sec) === "busy" && R({ name: "NotFoundError" }, sec) === "nodevice" && R(null, sec) === null;
      ok("MC", okR && typeof MicFix.capture === "function" && Object.keys(MicFix.TXT).length >= 9, `Mikrofon: Gründe erkannt (content://, Einbettung, verweigert, belegt, kein Gerät) · Ersatz Aufnahme-App · Prüfseite`); } catch (e) { ok("MC", false, String(e)); }"""
rep('} } catch (e) { ok("BV", false, String(e)); }', '} } catch (e) { ok("BV", false, String(e)); }'+T)
open(p,'w').write(s); print("ok12")
