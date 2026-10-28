import asyncio
from playwright.async_api import async_playwright
SP="/tmp/claude-0/-home-claude/7a374241-3f9e-5855-bfca-0c6038d4b5bf/scratchpad"; THREE=open(SP+"/tj/build/three.min.js").read()
ARGS=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--autoplay-policy=no-user-gesture-required","--use-fake-device-for-media-stream","--use-fake-ui-for-media-stream"]
async def route(r):
    u=r.request.url
    if "three" in u and u.endswith(".js"): await r.fulfill(status=200, content_type="application/javascript", body=THREE)
    elif u.startswith("http://127.0.0.1") or u.startswith("http://localhost") or u.startswith("blob:"): await r.continue_()
    else: await r.abort()
async def main():
  async with async_playwright() as p:
    b = await p.chromium.launch(executable_path="/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args=ARGS)
    ctx = await b.new_context(viewport={"width":390,"height":844}, has_touch=True, permissions=["microphone"]); await ctx.route("**/*", route)
    errs=[]; pg = await ctx.new_page(); pg.on("pageerror", lambda e: errs.append("outer:"+str(e)))
    await pg.goto("http://localhost:8766/embed.html"); await pg.wait_for_timeout(1500)
    F = pg.frame_locator("#f"); fr = pg.frames[1]
    await F.locator("#enter").click()
    for i in range(30):
      await pg.wait_for_timeout(400)
      if await fr.evaluate("typeof App!=='undefined' && App.started"): break
    await pg.wait_for_timeout(1500); E = fr.evaluate; await E("try{Coach.close(); UI.setTips(false);}catch(e){} 0")
    print("eingebettet:", await E("({env: MicFix.env(), reason: MicFix.reason(null), embedded: MicWin.embedded()})"))
    print("Start-Hinweis:", (await E("[...document.querySelectorAll('.toast,#toast')].map(t=>t.textContent).join('|')"))[:160])
    await E("UI.setTab('loop')"); await pg.wait_for_timeout(600)
    print("Warnkarte:", await E("!!document.querySelector('.lqwarn')"))
    await F.locator('.lqbig[data-i="0"]').tap(); await pg.wait_for_timeout(1500)
    print("nach Tipp:", await E("Sheets.cur"), await E("(document.querySelector('[data-mw=win]')||{}).textContent"))
    await pg.screenshot(path="t55_embed.png")
    print("ERRS", errs); await b.close()
asyncio.run(main())
