import asyncio, sys
from playwright.async_api import async_playwright
SP="/tmp/claude-0/-home-claude/7a374241-3f9e-5855-bfca-0c6038d4b5bf/scratchpad"; THREE=open(SP+"/tj/build/three.min.js").read()
ARGS=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--autoplay-policy=no-user-gesture-required"]
async def main():
  async with async_playwright() as p:
    b = await p.chromium.launch(executable_path="/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args=ARGS)
    ctx = await b.new_context(viewport={"width":390,"height":844}); pg = await ctx.new_page()
    await pg.route("**/*", lambda r: r.fulfill(status=200, content_type="application/javascript", body=THREE) if ("three" in r.request.url and r.request.url.endswith(".js")) else (r.continue_() if r.request.url.startswith("http://127.0.0.1") else r.abort()))
    cdp = await ctx.new_cdp_session(pg); await cdp.send('Emulation.setCPUThrottlingRate', {'rate': int(sys.argv[2])})
    await pg.goto("http://127.0.0.1:8765/"+sys.argv[1], wait_until="commit")
    for i in range(200):
      await pg.wait_for_timeout(100)
      try:
        if await pg.evaluate("typeof App!=='undefined' && App.booted"): break
      except Exception: pass
    print(sys.argv[1], "x", sys.argv[2], await pg.evaluate("JSON.stringify({dcl: Math.round(performance.getEntriesByType('navigation')[0].domContentLoadedEventEnd), booted: Math.round(performance.now())})"))
    await pg.evaluate("void (window.__t0=performance.now())"); await pg.click("#enter")
    for i in range(100):
      await pg.wait_for_timeout(50)
      if await pg.evaluate("App.started"): break
    print("  Eintauchen→gestartet ms", await pg.evaluate("Math.round(performance.now()-__t0)"))
    await b.close()
asyncio.run(main())
