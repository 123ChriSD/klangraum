# v56 = v55 (veröffentlicht) + Start abgesichert (kein Hängen bei „Einen Moment …“)
SP='/tmp/claude-0/-home-claude/7a374241-3f9e-5855-bfca-0c6038d4b5bf/scratchpad/'
s=open(SP+'base55.html').read()
def rep(a,b,cnt=1):
    global s
    n=s.count(a); assert n==cnt,(n,a[:120]); s=s.replace(a,b)
# 1) Audio-Thread laden und Ton anwerfen: nie unbegrenzt warten
rep("for (const mk of urls) { try { await this.ctx.audioWorklet.addModule(mk()); ok = true; break; }",
    "for (const mk of urls) { try { await Promise.race([this.ctx.audioWorklet.addModule(mk()), new Promise((_, rj) => setTimeout(() => rj(new Error(\"Audio-Thread lädt nicht (Zeitüberschreitung)\")), 4000))]); ok = true; break; }")
rep('if (this.ctx.state !== "running") await this.ctx.resume();\n    this.mode = mode;',
    'if (this.ctx.state !== "running") { try { await Promise.race([this.ctx.resume(), new Promise(r => setTimeout(r, 2500))]); } catch (_) {} }\n    this.mode = mode;')
# 2) Eintauchen: jeder Schritt einzeln abgesichert, Startbild verschwindet immer
rep("""    $("enter").disabled = true; $("enter").textContent = "Einen Moment …";
    try { await Engine.init(); }""", """    if (this.entering || this.started) return; this.entering = true; const my = this.att = (this.att || 0) + 1; StartGuard.arm();
    $("enter").disabled = true; $("enter").textContent = "Einen Moment …"; StartGuard.at("Klang wird vorbereitet");
    try { if (Engine.ctx && !Engine.node) { try { Engine.ctx.close(); } catch (_) {} Engine.ctx = null; } if (!Engine.node) await Engine.init(); }""")
rep("""catch (e) { $("startErr").textContent = e.message || String(e); $("startErr").hidden = false; $("enter").disabled = false; $("enter").textContent = "Erneut versuchen"; return; }
    for (const f of Forms.list) { if (f.sample) Engine.post(""", """catch (e) { this.entering = false; StartGuard.off(); $("startErr").textContent = e.message || String(e); $("startErr").hidden = false; $("enter").disabled = false; $("enter").textContent = "Erneut versuchen"; return; }
    if (my !== this.att || this.started) return;
    const step = (n, fn) => { StartGuard.at(n); try { fn(); } catch (e) { StartGuard.err(n, e); } };
    step("Aufnahmen laden", () => { for (const f of Forms.list) { try { if (f.sample && f.sample.d) Engine.post(""")
rep("""f0: p.sample.f0, sr: p.sample.sr }); }); }
    Inst.drums(); Pads.sync(); Pads.warm(); setTimeout(() => Techno.kits(), 1500);
    for (const f of Forms.list) { f.instPrep = null; Forms.rebuild(f, true); Forms.applyMix(f); }
    Engine.setGlobal(Global.hall, Global.echo);
    Transport.start();
    this.started = true; $("start").hidden = true; UI.refresh(); Hints.show();""", """f0: p.sample.f0, sr: p.sample.sr }); }); } catch (e) { StartGuard.err("Aufnahme " + (f.name || ""), e); } } });
    step("Schlagzeug", () => { Inst.drums(); Pads.sync(); Pads.warm(); }); setTimeout(() => { try { Techno.kits(); } catch (e) { console.warn(e); } }, 1500);
    step("Formen", () => { for (const f of Forms.list) { try { f.instPrep = null; Forms.rebuild(f, true); Forms.applyMix(f); } catch (e) { StartGuard.err("Form " + (f.name || ""), e); } } });
    step("Hall", () => Engine.setGlobal(Global.hall, Global.echo));
    step("Takt", () => Transport.start());
    this.started = true; $("start").hidden = true; StartGuard.off(); step("Anzeige", () => UI.refresh()); step("Hinweise", () => Hints.show());""")
rep('if (this.ctx.audioWorklet && !this.forceShim) {', 'if (this.ctx.audioWorklet && !this.forceShim && !store.get("forceShim")) {')
# Wächter + Loopstation-Puffer erst mit Ton laden
G = open(SP+'v56.js').read()
A="// Verlässt man das Stück, verstummt auch die Schnitt-Schleife"
rep(A, G+"\n"+A)
rep('<div class="meta">Version 55 · Loopstation: Geräusche, Stimme und Form-Passagen direkt loopen · feineres Drehtempo</div>', '<div class="meta">Version 56 · Start abgesichert · Loopstation: Geräusche, Stimme und Form-Passagen direkt loopen</div>')
rep('this.head("KLANGRAUM · Version 55")','this.head("KLANGRAUM · Version 56")')
open('/home/claude/klangraum.html','w').write(s); print("ok v56", len(s))
