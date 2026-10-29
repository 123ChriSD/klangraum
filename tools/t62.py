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
    await E("UI.setView('alle')"); await pg.wait_for_timeout(1000)
    await E("(()=>{ for (const f of Forms.list) { f.still=false; Motion.setTier(f,3); } })()"); await pg.wait_for_timeout(800)
    print("vorher spielen:", await E("Forms.list.map(f=>SoloStart.playing(f)).join()"))
    await pg.tap("#bPlay"); await pg.wait_for_timeout(600)
    print("nach ■: Takt", await E("Transport.running"), "Symbole", await E("Forms.list.map(f=>QuickPP.icon(f)).join('')"))
    lp = pg.locator('.labels .lplay').first; await lp.dispatch_event('pointerdown'); await pg.wait_for_timeout(900)
    print("nach ▶ an erster Form:", await E("Forms.list.map(f=>f.name+':'+SoloStart.playing(f)).join(', ')"))
    await pg.screenshot(path="t62_solo.png")
    await E("UI.setView('nah')"); await pg.wait_for_timeout(800)
    await pg.locator('#ksheet [data-fx=lsrec]').tap(); await pg.wait_for_timeout(500)
    print("🔴 Loop:", await E("JSON.stringify({R:LoopSt.R&&[LoopSt.R.mode,LoopSt.R.src], lab:LoopSt.R&&LoopSt.label(LoopSt.R.i)})"))
    await pg.screenshot(path="t62_rec.png")
    await E("(async()=>{ for (let k=0;k<10;k++){ const h=Forms.play(Forms.active,0.2+0.06*k,0.9,{dur:0.2}); await new Promise(r=>setTimeout(r,200)); Forms.release(h);} })()")
    bar = await E("Transport.spb*16"); await pg.wait_for_timeout(int(bar*1000*1.3))
    await pg.locator('#ksheet [data-fx=lsrec]').tap(); await pg.wait_for_timeout(int(bar*1000*1.5)+800)
    print("nach Fertig:", await E("JSON.stringify({n:LoopSt.count(), st:LoopSt.state(0), form:(LoopSt.form(LoopSt.slots[0])||{}).name, L:LoopSt.L})"))
    await E("UI.setView('raum')"); await pg.wait_for_timeout(1500); await pg.screenshot(path="t62_raum.png")
    print("Raum Loop-Ring:", await E("document.querySelectorAll('#rdots .rdot.isloop').length"))
    print("ERRS", errs); await b.close()
asyncio.run(main())
