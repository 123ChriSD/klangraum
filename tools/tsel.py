import asyncio, sys
from playwright.async_api import async_playwright
SP="/tmp/claude-0/-home-claude/7a374241-3f9e-5855-bfca-0c6038d4b5bf/scratchpad"; THREE=open(SP+"/tj/build/three.min.js").read()
async def main():
  async with async_playwright() as p:
    b = await p.chromium.launch(executable_path="/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--autoplay-policy=no-user-gesture-required"])
    pg = await b.new_page(viewport={"width":412,"height":892}); errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)))
    await pg.route("**/*", lambda r: r.fulfill(status=200, content_type="application/javascript", body=THREE) if ("three" in r.request.url and r.request.url.endswith(".js")) else (r.continue_() if r.request.url.startswith("http://127.0.0.1") else r.abort()))
    await pg.goto("http://127.0.0.1:8765/index.html"); await pg.wait_for_timeout(900); await pg.click("#enter")
    for i in range(25):
      await pg.wait_for_timeout(400)
      if await pg.evaluate("App.started"): break
    await pg.wait_for_timeout(1500)
    r = await pg.evaluate("(async()=>{ const R = await Tests.run(); return Object.entries(R).filter(([k])=>['BB','ZN','RF','KP','MW','GS','MC'].includes(k)).map(([k,v])=>k+': '+v.pass+' '+v.detail); })()")
    for x in r: print(x)
    print("ERRS", errs[:3]); await b.close()
asyncio.run(main())
