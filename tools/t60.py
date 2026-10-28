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
    await pg.tap("#tLoop"); await pg.wait_for_timeout(700); await E("Transport.stop()"); await pg.wait_for_timeout(300)
    await pg.screenshot(path="t60_0.png")
    await pg.locator('.lxbig[data-i="0"]').tap(); await pg.wait_for_timeout(2600); await pg.screenshot(path="t60_rec.png"); await pg.locator('.lxbig[data-i="0"]').tap(); await pg.wait_for_timeout(2000)
    print("nach Loop:", await E("JSON.stringify({L:LoopSt.L,bpm:Music.tempo(),st:LoopSt.state(0),fid:LoopSt.slots[0]&&LoopSt.slots[0].fid,form:(Forms.list.find(f=>f.id===(LoopSt.slots[0]||{}).fid)||{}).name, srcs:LoopSt.srcs.length})"))
    await pg.wait_for_timeout(800); await pg.screenshot(path="t60_play.png")
    # Verschieben per Ziehen
    bb = await pg.locator('.lxwave[data-i="0"]').bounding_box()
    await pg.mouse.move(bb["x"]+bb["width"]*0.3, bb["y"]+20); await pg.mouse.down(); await pg.mouse.move(bb["x"]+bb["width"]*0.3+bb["width"]/8, bb["y"]+20, steps=6); await pg.mouse.up(); await pg.wait_for_timeout(400)
    print("Versatz nach Ziehen:", await E("LoopSt.slots[0].shift"), await E("LoopSt.shiftTxt(LoopSt.slots[0])"))
    await pg.locator('[data-ls=sl][data-i="0"]').tap(); await pg.wait_for_timeout(300); print("nach ◀:", await E("LoopSt.slots[0].shift"))
    # Form: schneller drehen, kneten simulieren
    await E("(()=>{const t=LoopSt.slots[0], f=LoopSt.form(t); Move.faster(f); Move.faster(f); Move.faster(f); Move.faster(f); Move.faster(f); Move.faster(f); f._kd=3; })()"); await pg.wait_for_timeout(1500)
    print("Form verändert:", await E("JSON.stringify((()=>{const P=LoopSt.par(LoopSt.slots[0]); return {sp:P.sp, semi:P.semi, mode:LoopSt.modeOf(P), label:LoopSt.label(0)}})())"), "Quellen", await E("LoopSt.srcs.length"))
    await E("(()=>{const f=LoopSt.form(LoopSt.slots[0]); Motion.pause(f);})()"); await pg.wait_for_timeout(600)
    print("Form angehalten:", await E("LoopSt.state(0)"), await E("LoopSt.label(0).join(' / ')"))
    await pg.locator('.lxbig[data-i="0"]').tap(); await pg.wait_for_timeout(600)
    print("Feld getippt:", await E("LoopSt.state(0)"))
    await pg.screenshot(path="t60_mod.png")
    await pg.locator('[data-ls=goform][data-i="0"]').tap(); await pg.wait_for_timeout(1200)
    print("Klang:", await E("UI.tab"), await E("Forms.active.name"), await E("FBar.caption()"))
    await pg.screenshot(path="t60_form.png")
    print("ERRS", errs); await b.close()
asyncio.run(main())
