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
    await pg.tap("#tLoop"); await pg.wait_for_timeout(900)
    if not await E("Transport.running"): await pg.locator('[data-pt=go]').tap(); await pg.wait_for_timeout(500)
    ids = await E("Pult.list().map(f=>f.id)")
    for k in [0,3,6]: await E("(()=>{const f=Forms.byId('%s'); Fade.set(f,true,true); f.still=false; Motion.setTier(f,3);})()" % ids[k])
    await pg.wait_for_timeout(400); await pg.locator('[data-psc="0"]').tap(); await pg.wait_for_timeout(300)
    for k in [0,3,6]: await E("Fade.set(Forms.byId('%s'),false,true)" % ids[k])
    for k in [1,4]: await E("(()=>{const f=Forms.byId('%s'); Fade.set(f,true,true); f.still=false; Motion.setTier(f,3);})()" % ids[k])
    await pg.wait_for_timeout(400); await pg.locator('[data-psc="1"]').tap(); await pg.wait_for_timeout(300)
    await pg.locator('[data-psc="0"]').tap(); await pg.wait_for_timeout(200); await pg.screenshot(path="t64_scn.png")
    print("Szene 1 wartet:", await E("[...Pult.q.entries()].length"))
    bar = await E("Transport.spb*16"); await pg.wait_for_timeout(int(bar*1000)+400)
    print("läuft:", await E("Pult.list().filter(f=>Pult.playing(f)).map(f=>f.name).join(', ')"), "Szene aktiv:", await E("Pult.same(Pult.scn[0])"))
    await pg.locator('[data-pt=drop]').tap(); await pg.wait_for_timeout(200); print("Drop:", await E("Pult.dropSt"))
    await pg.wait_for_timeout(int(bar*1000)+300); print("Drop still:", await E("Pult.dropSt"), await E("Pult.list().filter(f=>Pult.playing(f)).length")); await pg.screenshot(path="t64_drop.png")
    await pg.wait_for_timeout(int(bar*1000)+300); print("nach Drop:", await E("Pult.dropSt"), await E("Pult.list().filter(f=>Pult.playing(f)).length"))
    await pg.tap("#tKlang"); await pg.wait_for_timeout(500); await E("UI.setView('alle')"); await pg.set_viewport_size({"width":900,"height":420}); await pg.wait_for_timeout(1500); await pg.screenshot(path="t64_alle.png")
    print("kmany:", await E("document.body.classList.contains('kmany')"), "Werkzeug Loop:", await E("Cmd.L.loop.n()"))
    print("ERRS", errs); await b.close()
asyncio.run(main())
