import asyncio, json
from playwright.async_api import async_playwright
SP="/tmp/claude-0/-home-claude/7a374241-3f9e-5855-bfca-0c6038d4b5bf/scratchpad"; THREE=open(SP+"/tj/build/three.min.js").read()
ARGS=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--autoplay-policy=no-user-gesture-required","--use-fake-device-for-media-stream","--use-fake-ui-for-media-stream"]
async def main():
  async with async_playwright() as p:
    b = await p.chromium.launch(executable_path="/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args=ARGS)
    ctx = await b.new_context(viewport={"width":390,"height":844}, has_touch=True, permissions=["microphone"]); pg = await ctx.new_page(); errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)))
    await pg.route("**/*", lambda r: r.fulfill(status=200, content_type="application/javascript", body=THREE) if ("three" in r.request.url and r.request.url.endswith(".js")) else (r.continue_() if r.request.url.startswith("http://127.0.0.1") else r.abort()))
    await pg.goto("http://127.0.0.1:8765/index.html"); await pg.wait_for_timeout(900); await pg.click("#enter")
    for i in range(25):
      await pg.wait_for_timeout(400)
      if await pg.evaluate("App.started"): break
    await pg.wait_for_timeout(1800); E = pg.evaluate; await E("try{Coach.close(); UI.setTips(false);}catch(e){} 0")
    await pg.tap("#tLoop"); await pg.wait_for_timeout(700)
    n0 = await E("Forms.list.length")
    await pg.locator('[data-ls=one]').tap(); await pg.wait_for_timeout(1800); await pg.screenshot(path="t61_rec.png")
    await pg.locator('[data-ls=one]').tap(); await pg.wait_for_timeout(1500)
    print("Blatt:", await E("Sheets.cur"), await E("(document.querySelector('.lxone .kch')||{}).textContent"))
    await pg.screenshot(path="t61_sheet.png")
    await pg.locator('[data-o1=both]').tap(); await pg.wait_for_timeout(2500)
    print("Formen", n0, "→", await E("Forms.list.length"), await E("JSON.stringify(Forms.list.slice(-2).map(f=>[f.name,f.kind]))"), "Spuren", await E("LoopSt.count()"), "L", await E("LoopSt.L"), "Zustand", await E("LoopSt.state(0)"))
    await pg.tap("#tLoop"); await pg.wait_for_timeout(600)
    await pg.locator('[data-ls=inst][data-i="0"]').tap(); await pg.wait_for_timeout(800)
    print("Spur→Instrument:", await E("Forms.list.length"), await E("Forms.list[Forms.list.length-1].name"))
    await pg.screenshot(path="t61_loop.png")
    print("Zeile:", await E("(()=>{const c=document.querySelector('.lxctl'); const r=c.getBoundingClientRect(); return [Math.round(r.width), c.scrollWidth, [...c.children].map(x=>Math.round(x.getBoundingClientRect().right))]})()"))
    print("Puffer", await E("Stab.hint()"), "Ticker", await E("Ticker.ok"), "Vorlauf", await E("Transport._ah"))
    print("ERRS", errs); await b.close()
asyncio.run(main())
