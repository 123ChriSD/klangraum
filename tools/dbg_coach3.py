import asyncio, sys
from playwright.async_api import async_playwright
SP="/tmp/claude-0/-home-claude/7a374241-3f9e-5855-bfca-0c6038d4b5bf/scratchpad"; THREE=open(SP+"/tj/build/three.min.js").read()
ARGS=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--autoplay-policy=no-user-gesture-required"]
UA="Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36"
async def route(r):
    u=r.request.url
    if "three" in u and u.endswith(".js"): await r.fulfill(status=200, content_type="application/javascript", body=THREE)
    elif u.startswith("http://192.0.2.2") or u.startswith("blob:") or u.startswith("data:"): await r.continue_()
    else: await r.abort()
async def main(page):
  async with async_playwright() as p:
    b = await p.chromium.launch(executable_path="/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args=ARGS)
    ctx = await b.new_context(viewport={"width":360,"height":520}, has_touch=True, user_agent=UA, is_mobile=True); await ctx.route("**/*", route)
    pg = await ctx.new_page(); errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)[:300]))
    pg.on("console", lambda m: print("CONSOLE", m.text[:200]) if m.type=="error" and "Failed to load" not in m.text else None)
    await pg.goto("http://192.0.2.2:8765/"+page); await pg.wait_for_timeout(2500)
    print("secure", await pg.evaluate("isSecureContext"), "worklet", await pg.evaluate("!!(window.AudioContext && AudioContext.prototype && 'audioWorklet' in AudioContext.prototype)"))
    await pg.tap("#enter")
    for i in range(40):
      await pg.wait_for_timeout(500)
      if await pg.evaluate("App.started"): break
    await pg.wait_for_timeout(1500)
    print("start hidden", await pg.evaluate("getComputedStyle(document.getElementById('start')).display"), "coach", await pg.evaluate("Coach.open"))
    await pg.screenshot(path="coach0.png")
    for k in range(3):
      bt = pg.locator('#coach [data-cx=next]')
      print("next visible", await bt.count())
      if await bt.count():
        bb = await bt.bounding_box(); print("  box", bb and [round(bb["y"]), round(bb["height"])])
        await bt.tap(); await pg.wait_for_timeout(500)
      print("coach i", await pg.evaluate("Coach.i"))
    await pg.screenshot(path="coach1.png")
    await pg.locator('#coach .cskip').tap(); await pg.wait_for_timeout(500); print("skip -> open", await pg.evaluate("Coach.open"), "start display", await pg.evaluate("getComputedStyle(document.getElementById('start')).display"), "loopbanner", await pg.evaluate("getComputedStyle(document.getElementById('loopBanner')).display"))
    print(page, "started", await pg.evaluate("App.started"), await pg.evaluate("document.getElementById('enter').textContent"), await pg.evaluate("(document.getElementById('startErr')||{}).textContent"), errs[:5])
    await b.close()
asyncio.run(main(sys.argv[1]))
