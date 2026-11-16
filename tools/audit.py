import asyncio, json, sys
from playwright.async_api import async_playwright
SP="/tmp/claude-0/-home-claude/7a374241-3f9e-5855-bfca-0c6038d4b5bf/scratchpad"
THREE=open(SP+"/tj/build/three.min.js").read(); AUD=open(SP+"/audit.js").read()
W,H = (int(sys.argv[1]), int(sys.argv[2])) if len(sys.argv)>2 else (412,892)
TAG = sys.argv[3] if len(sys.argv)>3 else "a"
SHOTS = "--shots" in sys.argv
async def main():
  async with async_playwright() as p:
    b = await p.chromium.launch(executable_path="/opt/pw-browsers/chromium", args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--autoplay-policy=no-user-gesture-required"])
    ctx = await b.new_context(viewport={"width":W,"height":H}, has_touch=True, device_scale_factor=1)
    page = await ctx.new_page(); errs=[]
    page.on("pageerror", lambda e: errs.append(str(e)))
    async def route(r):
      u=r.request.url
      if "three" in u and u.endswith(".js"): await r.fulfill(status=200, content_type="application/javascript", body=THREE)
      elif u.startswith("http://127.0.0.1"): await r.continue_()
      else: await r.abort()
    await page.route("**/*", route)
    await page.goto("http://127.0.0.1:8765/index.html"); await page.wait_for_timeout(800)
    await page.click("#enter")
    for i in range(25):
      await page.wait_for_timeout(400)
      if await page.evaluate("App.started"): break
    E=page.evaluate
    await E(AUD)
    await page.wait_for_timeout(500); await E("Coach.close(); UI.setTips(false); try { UI.setTab('klang'); } catch (_) {} 0")
    await E("""(() => { for (const id of ['saxofon','synthbass','klavier','acid_303'].filter(x => K.seedById(x))) Forms.make({ seedId: id }); for (const f of Forms.list) Forms.rebuild(f, true);
      const ev = [{ s: 0, d: 2, m: 0, v: 0.8, u: 0.4 }, { s: 8, d: 2, m: 2, v: 0.8, u: 0.6 }]; Loops.newTake(Forms.list[0], 1, ev.slice()); Loops.newTake(Forms.list[1], 1, ev.slice()); Forms.setActive(Forms.list[0]); UI.setView('nah'); UI.refresh(); return Forms.list.length; })()""")
    await page.wait_for_timeout(1500)
    states = [
      ("nah", "UI.setView('nah')"),
      ("nah_knead", "Tools.toggleKnead(true)"),
      ("nah_brush", "Tools.toggleKnead(false); Tools.toggleBrush(true)"),
      ("nah_motion", "Tools.toggleBrush(false); Tools.toggleMotion(true)"),
      ("nah_mbaropen", "Tools.toggleMotion(false); UI.mbOpen = true; UI.mbHtml=''; UI.mbar && UI.mbar()"),
      ("alle", "UI.mbOpen=false; UI.setView('alle')"),
      ("alle_zoom", "Scene.user.zoom = 1.4; UI.zoomBtn(); UI.refresh()"),
      ("alle_brush", "Tools.toggleBrush(true)"),
      ("alle_knead", "Tools.toggleBrush(false); Tools.toggleKnead(true)"),
      ("raum", "Tools.toggleKnead(false); Scene.user.zoom = 1; UI.setView('raum')"),
      ("raum_brush", "Tools.toggleBrush(true)"),
      ("raum_knead", "Tools.toggleBrush(false); Tools.toggleKnead(true)"),
      ("raum_fpop", "Tools.toggleKnead(false); FPop.open(Forms.list[0])"),
      ("full_nah", "FPop.close(); Full.toggle(true); UI.setView('nah')"),
      ("full_nah_brush", "Tools.toggleBrush(true)"),
      ("full_alle_brush", "UI.setView('alle')"),
      ("full_raum_knead", "Tools.toggleBrush(false); UI.setView('raum'); Tools.toggleKnead(true)"),
      ("full_off_nah", "Tools.toggleKnead(false); Full.toggle(false); UI.setView('nah')"),
      ("pads", "Pads.toggle ? Pads.toggle(true) : 0"),
      ("v67_start", "Pads.toggle && Pads.on ? Pads.toggle(false) : 0; UI.setTab('start')"),
      ("v67_song_leer", "UI.setTab('song')"),
      ("v67_song", "Project.load({ forms: [], mood: Music.mood.id, help: Music.help }, true); SongGen.fill(SongGen.byId('pop'), 99); UI.setTab('song'); SongUI.render(true)"),
      ("v67_song_edit", "SongUI.sel = 1; SongUI.render(true)"),
      ("v67_mix", "SongUI.sel = -1; UI.setTab('mix'); MixUI.auto('aus')"),
      ("v67_erkl", "UI.setTab('klang'); Erkl.start(); Erkl.show(Erkl.find(document.getElementById('bMood')))"),
      ("v67_klang", "Erkl.stop(); UI.setView('nah')"),
      ("v68_einsp", "Einsp.start = () => {}; Einsp.open(Forms.list.find(f => f.kind !== 'drum'))"),
      ("v68_einsp_drum", "Einsp.setForm(Forms.list.find(f => f.kind === 'drum'))"),
      ("v68_einsp_wahl", "Einsp.close(); Einsp.open(null, { pick: true })"),
      ("v68_song", "Einsp.close(); UI.setTab('song'); SongUI.render(true)"),
      ("v70_schrift", "Schrift.start = () => {}; Schrift.open(Forms.list.find(f => f.kind !== 'drum' && SongGen.roleOf(f) === 'mel'))"),
      ("v70_schrift_akk", "Schrift.setForm(Forms.list.find(f => SongGen.roleOf(f) === 'akk'), true); Schrift.render()"),
      ("v70_schrift_drum", "Schrift.setForm(Forms.list.find(f => f.kind === 'drum'), true); Schrift.render()"),
      ("v70_schrift_wahl", "Schrift.close(); const fo = Einsp.forms; Einsp.forms = () => []; Schrift.open(null, { pick: true }); Einsp.forms = fo"),
      ("v70_live", "Schrift.close(); Live70.open()"),
      ("v70_mix", "Live70.close(); UI.setTab('mix'); MixUI.render(true); document.querySelector('.wu70').scrollIntoView({ block: 'center' })"),
      ("v70_start", "UI.setTab('start'); Home67.render(true)"),
      ("v70_stile", "SongGen.open()"),
      ("v72_knet", "UI.hideSheets(); Ber72.go('knet')"),
      ("v72_tasten", "Ber72.go('tasten')"),
      ("v72_frage", "Einsp.close(); Auto72.on = true; Auto72.frames = Auto72.sr() * 60; Auto72.ask('Probe')"),
      ("v73_alles", "UI.hideSheets(); Alles73.open()"),
      ("v73_neu", "UI.hideSheets(); NewPiece.open(); NewPiece.st.mel = [0, 2, 4, 7]; StartMel.paint(); document.getElementById('sm73S').scrollIntoView({ block: 'center' })"),
      ("v73_klang", "UI.hideSheets(); UI.setTab('klang'); UI.setView('nah'); Dreh77.set('auf', true); Dreh73.paint()"),
      ("v73_klang_dreht", "Dreh73.act('r:1'); Dreh73.paint()"),
      ("v73_alle", "UI.setView('alle'); Dreh73.act('pp'); Dreh73.paint()"),
      ("v74_alle", "Dreh73.all = true; Dreh73.paint()"),
      ("v74_neu", "Dreh73.all = false; NewPiece.open(); NewPiece.st.mel = [0, 2, 4, 7, 9]; NewPiece.render(); document.getElementById('sm74Opt').scrollIntoView({ block: 'center' })"),
      ("v74_live", "UI.hideSheets(); Live70.open()"),
      ("v74_noten", "Live70.close(); Schrift.start = () => {}; Schrift.open(Forms.list.find(f => SongGen.roleOf(f) === 'mel')); Schrift.perWant = 4; Schrift.render()"),
      ("v74_mix", "Schrift.perWant = 0; Schrift.close(); UI.setTab('mix'); MixUI.render(true); document.querySelector('.b74o').scrollIntoView({ block: 'center' })"),
      ("v75_neu", "UI.hideSheets(); NewPiece.open(); NewPiece.st.mel = [0, 2, 4]; NewPiece.st.rec = { x: new Float32Array(48000), sr: 48000, name: 'Stimme', notes: [60, 64, 67], d: [0, 2, 4], mode: 'eigen' }; NewPiece.render(); document.getElementById('rn75S').scrollIntoView({ block: 'start' })"),
      ("v75_klang", "UI.hideSheets(); UI.setTab('klang'); UI.setView('nah'); Outro75.paint(); Dreh73.paint()"),
      ("v75_ausklang", "Transport.start(); Outro75.start(); Outro75.u = 0.5; Outro75.paint()"),
      ("v75_ende", "Outro75.done(true); UI.setView('alle'); Outro75.paint()"),
      ("v76_neu", "UI.hideSheets(); NewPiece.open(); NewPiece.st.mel = [0, 2, 4]; NewPiece.st.mo = { oct: 0, r: 1, kanon: false, go: true, off: {}, own: { 1: 'wellen' } }; NewPiece.render(); document.getElementById('sm74Opt').scrollIntoView({ block: 'center' })"),
      ("v76_knopf", "UI.hideSheets(); UI.setTab('klang'); UI.setView('nah'); Forms.setActive(Forms.list.find(f => f.kind !== 'drum')); Outro75.paint(); MelWahl76.paint()"),
      ("v76_wahl", "MelWahl76.open(Forms.list.find(f => f.kind !== 'drum')); MelWahl76.d = [0, 2, 4, 7]; MelWahl76.render()"),
      ("v80_tonspur", "UI.hideSheets(); Sing.tracks = [{ id: 'g1', rec: 'x', name: 'Gesang 1', at: 0, off: 0, vol: 1, mute: false, len: 4, raw: 'y', tune: { art: 'sanft', leiter: 'stueck', sig: 'weg' } }, { id: 'g2', rec: 'z', name: 'Gesang 2', at: 16, off: 20, vol: 1, mute: false, len: 9 }]; Sing.sheet()"),
      ("v80_tonspur_unten", "document.querySelector('#singS .sgr:last-child').scrollIntoView({ block: 'end' })"),
      ("v80_zu", "UI.hideSheets(); Sing.tracks = []"),
      ("v79_t_aufn", "UI.hideSheets(); P78.on = true; UI.setTab('klang'); UI.setView('nah'); P78.open('aufn')"),
      ("v79_text", "P78.close(); Text79.open(); Text79.st.text = 'Der Mond ist aufgegangen, die goldnen Sternlein prangen am Himmel hell und klar.'; Text79.sync()"),
      ("v79_text_unten", "document.querySelector('#t79S .wtip').scrollIntoView({ block: 'end' })"),
      ("v79_bib", "Bib79.list = [{ id: 'b1', pid: '__bib', name: 'Glas', dur: 1.2, created: Date.now(), sr: 48000, ch: [new Int16Array(4)] }, { id: 'b2', pid: '__bib', name: 'Ein ziemlich langer Name', dur: 2, created: Date.now(), sr: 48000, ch: [new Int16Array(4)] }]; Sheets.open('Klänge', Sheets.head('Klang-Bibliothek') + '<div id=\\'b79S\\'>' + Bib79.body() + '</div>').classList.add('s78')"),
      ("v79_neu_klaenge", "UI.hideSheets(); NewPiece.open(); NewPiece.st.recs = [{ x: new Float32Array(24000), sr: 48000, name: 'Stimme 1', notes: [], d: [0, 2, 4], mode: 'eigen' }, { x: new Float32Array(24000), sr: 48000, name: 'Glas', notes: [], d: [], mode: 'frei', bib: 'b1' }]; NewPiece.render(); document.getElementById('rn75S').scrollIntoView({ block: 'start' })"),
      ("v79_zu", "UI.hideSheets(); Bib79.list = []"),
      ("v78_form", "UI.hideSheets(); Auf78.set(false); P78.on = true; P78.close(); UI.setTab('klang'); UI.setView('nah'); P78.paint(true)"),
      ("v78_alle", "UI.setView('alle'); P78.paint(true)"),
      ("v78_t_stueck", "P78.open('stueck')"), ("v78_t_musik", "P78.open('musik')"), ("v78_t_form", "P78.open('form')"),
      ("v78_song", "P78.close(); UI.setTab('song'); P78.paint(true)"), ("v78_mix", "UI.setTab('mix'); P78.paint(true)"), ("v78_start", "UI.setTab('start'); P78.paint(true)"),
      ("v78_stuecke", "UI.setTab('klang'); Stuecke78.open()"),
      ("v78_auflegen", "UI.hideSheets(); Auf78.set(true); Hud77.hide(); P78.paint(true)"),
      ("v78_kneten", "Auf78.set(false); Hud77.hide(); UI.setView('nah'); Tools.toggleKnead(true); P78.paint(true)"),
      ("v78_klassisch", "Tools.toggleKnead(false); P78.on = false; P78.paint(true); Layout.last = ''; Layout.sync(); KSheet.sync(true)"),
      ("v78_zurueck", "P78.on = true; P78.paint(true); Layout.last = ''; Layout.sync()"),
      ("v77_knopf", "UI.hideSheets(); UI.setTab('klang'); UI.setView('alle'); Dreh77.set('mini', true); Dreh73.paint()"),
      ("v77_knopf_offen", "Dreh77.open = true; Dreh77.used = performance.now() + 60000; Dreh73.all = false; Dreh73.act('r:0.5'); Dreh77.fresh()"),
      ("v77_hud", "Dreh77.open = false; Dreh77.fresh(); Hud77.show(I67.stop, 'Alle Formen', '3 angehalten', 5, 60000)"),
      ("v77_nah_leiste", "Hud77.hide(); UI.setView('nah'); Dreh77.set('auf', true); Dreh73.all = true; Dreh73.paint()"),
      ("v77_weg", "Dreh73.all = false; Dreh77.set('weg', true)"),
      ("v77_gesten", "Dreh77.set('mini', true); Gest77.open()"),
      ("v77_gesten_unten", "document.querySelector('#g77S .g77l:last-child').scrollIntoView({ block: 'end' })"),
      ("v70_song", "UI.hideSheets(); UI.setTab('song'); SongUI.render(true)"),
      ("v68_klang_profi", "UI.setTab('klang'); Einf68.set(true); UI.setView('nah')"),
      ("v68_klang_profi_mehr", "KSheet.set('half')"),
      ("v68_klang_mehr", "Einf68.set(false); KSheet.set('half')"),
      ("v68_klang_einfach", "KSheet.set('peek')"),
    ]
    total = 0
    for name, js in states:
      try: await E("Coach.close(); " + js + "; 0")
      except Exception as ex: print("STATE ERR", name, ex); continue
      await page.wait_for_timeout(900)
      r = await E(f"__audit('{name}')")
      total += len(r)
      print(f"--- {name}: {len(r)}"); [print("   ", x) for x in r[:14]]
      if SHOTS: await page.screenshot(path=f"{SP}/shots/au_{TAG}_{name}.png")
    print("TOTAL", total, "ERRS", errs[:4]); await b.close()
asyncio.run(main())
