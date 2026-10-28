import asyncio, json, sys
from playwright.async_api import async_playwright
SP="/tmp/claude-0/-home-claude/7a374241-3f9e-5855-bfca-0c6038d4b5bf/scratchpad"
THREE=open(SP+"/tj/build/three.min.js").read(); AUD=open(SP+"/audit.js").read()
W,H = (int(sys.argv[1]), int(sys.argv[2])) if len(sys.argv)>2 else (412,892)
TAG = sys.argv[3] if len(sys.argv)>3 else "a"
SHOTS = "--shots" in sys.argv
async def main():
  async with async_playwright() as p:
    b = await p.chromium.launch(executable_path="/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--autoplay-policy=no-user-gesture-required"])
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
    await E("Coach.close(); UI.setTips(false); 0")
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
