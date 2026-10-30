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
    for sd in ["kit_hardstyle","kit_trap808","rumblebass","supersaw","kit_bassdrop","reese"]:
      await E("(()=>{ const f=Forms.make({seedId:'%s'}); Forms.rebuild(f,true); })()" % sd)
    await pg.wait_for_timeout(2500)
    await pg.tap("#tLoop"); await pg.wait_for_timeout(900); await pg.screenshot(path="t63_pult.png")
    print("Felder", await E("document.querySelectorAll('#pult .pp[data-pp]').length"), "Zustände", await E("Pult.list().map(f=>Pult.state(f)).join(',')"))
    if not await E("Transport.running"): await pg.locator('[data-pt=go]').tap(); await pg.wait_for_timeout(600)
    ids = await E("Pult.list().map(f=>f.id)")
    on0 = await E("Pult.list().map(f=>Pult.playing(f)).join(',')"); print("an:", on0)
    await pg.locator('.pp[data-pp="%s"]' % ids[-1]).tap(); await pg.wait_for_timeout(150)
    print("nach Tipp:", await E("Pult.state(Forms.byId('%s'))" % ids[-1]))
    await pg.screenshot(path="t63_q.png")
    bar = await E("Transport.spb*16"); await pg.wait_for_timeout(int(bar*1000)+400)
    print("nach der Eins:", await E("Pult.state(Forms.byId('%s'))" % ids[-1]))
    # halten = solo
    bb = await pg.locator('.pp[data-pp="%s"]' % ids[0]).bounding_box(); await pg.mouse.move(bb["x"]+30, bb["y"]+30); await pg.mouse.down(); await pg.wait_for_timeout(700)
    print("halten → solo:", await E("Forms.list.filter(f=>f.solo).map(f=>f.name).join()"))
    await pg.mouse.up(); await pg.wait_for_timeout(300); print("losgelassen:", await E("Forms.list.filter(f=>f.solo).length"))
    # Filter + Break
    await E("(()=>{const r=document.querySelector('[data-pt=filt]'); r.value=-70; r.dispatchEvent(new Event('input',{bubbles:true}));})()"); await pg.wait_for_timeout(200)
    print("Filter:", await E("Math.round(Pult.F.lp.frequency.value)"), await E("document.querySelector('.ptfilt b').textContent"))
    bb = await pg.locator('[data-pth=brk]').bounding_box(); await pg.mouse.move(bb["x"]+20, bb["y"]+20); await pg.mouse.down(); await pg.wait_for_timeout(500)
    print("Break: hörbar", await E("Pult.list().filter(f=>QuickPP.on(f)).map(f=>f.kind).join()")); await pg.screenshot(path="t63_brk.png")
    await pg.mouse.up(); await pg.wait_for_timeout(int(bar*1000)+500); print("nach Break:", await E("Pult.list().filter(f=>QuickPP.on(f)).length"))
    # Pegel der neuen Kits im Mitschnitt
    await E("Transport.stop()"); await pg.wait_for_timeout(800); await E("Rec.start(true)"); await pg.wait_for_timeout(300)
    await E("(async()=>{ for (const id of [window.__kid||'kit_hardstyle']) { const f=Forms.list.find(x=>x.seedId===id); for (const u of [0.1,0.95]) { const h=Forms.play(f,u,1,{dur:0.3}); await new Promise(r=>setTimeout(r,500)); Forms.release(h);} } })()"); await pg.wait_for_timeout(2600)
    print("Kits klingen: Spitze %", await E("(()=>{ let m=0; for (const c of Rec.chunks) for (const ch of c) for (let i=0;i<ch.length;i+=4) m=Math.max(m,Math.abs(ch[i])); return Math.round(m*100); })()")); await E("Rec.stop()")
    await pg.set_viewport_size({"width":900,"height":420}); await pg.wait_for_timeout(900); await pg.screenshot(path="t63_land.png")
    print("ERRS", errs); await b.close()
asyncio.run(main())
