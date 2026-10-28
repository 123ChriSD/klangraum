import asyncio, json
from playwright.async_api import async_playwright
SP="/tmp/claude-0/-home-claude/7a374241-3f9e-5855-bfca-0c6038d4b5bf/scratchpad"; THREE=open(SP+"/tj/build/three.min.js").read()
ARGS=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--autoplay-policy=no-user-gesture-required","--use-fake-device-for-media-stream","--use-fake-ui-for-media-stream"]
async def main():
  async with async_playwright() as p:
    b = await p.chromium.launch(executable_path="/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args=ARGS)
    ctx = await b.new_context(viewport={"width":390,"height":844}, has_touch=True, permissions=["microphone"]); pg = await ctx.new_page(); errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)))
    await pg.route("**/*", lambda r: r.fulfill(status=200, content_type="application/javascript", body=THREE) if ("three" in r.request.url and r.request.url.endswith(".js")) else (r.continue_() if r.request.url.startswith("http://127.0.0.1") else r.abort()))
    pg.on("console", lambda m: print("CONSOLE", m.type, m.text[:200]) if m.type in ("error","warning") else None)
    pg.on("framenavigated", lambda f: print("NAV", f.url[:120]))
    pg.on("crash", lambda: print("CRASH"))
    await pg.goto("http://127.0.0.1:8765/index.html"); await pg.wait_for_timeout(900)
    await pg.evaluate("void (AudioWorklet.prototype.addModule = function(){ return new Promise(()=>{}); })")
    await pg.click("#enter")
    for i in range(45):
      await pg.wait_for_timeout(400)
      if await pg.evaluate("App.started"): break
    print("started", await pg.evaluate("App.started"), await pg.evaluate("document.getElementById('enter').textContent"), errs)
    await b.close()
asyncio.run(main())
