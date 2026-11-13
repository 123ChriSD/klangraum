import asyncio, json
from playwright.async_api import async_playwright
SP="/tmp/claude-0/-home-claude/7a374241-3f9e-5855-bfca-0c6038d4b5bf/scratchpad"; THREE=open(SP+"/tj/build/three.min.js").read()
ARGS=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--autoplay-policy=no-user-gesture-required","--use-fake-device-for-media-stream","--use-fake-ui-for-media-stream"]
async def main():
  async with async_playwright() as p:
    b = await p.chromium.launch(executable_path="/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args=ARGS)
    ctx = await b.new_context(viewport={"width":int(__import__("os").environ.get("VW","412")),"height":int(__import__("os").environ.get("VH","892"))}, has_touch=True, is_mobile=True, device_scale_factor=2, permissions=["microphone"]); pg = await ctx.new_page(); errs=[]; pg.on("pageerror", lambda e: errs.append(str(e) + " @ " + str(getattr(e, "stack", ""))[:600]))
    await pg.route("**/*", lambda r: r.fulfill(status=200, content_type="application/javascript", body=THREE) if ("three" in r.request.url and r.request.url.endswith(".js")) else (r.continue_() if r.request.url.startswith("http://127.0.0.1") else r.abort()))
    await pg.goto("http://127.0.0.1:8765/index.html"); await pg.wait_for_timeout(900); await pg.click("#enter")
    for i in range(25):
      await pg.wait_for_timeout(400)
      if await pg.evaluate("App.started"): break
    await pg.wait_for_timeout(1800); E = pg.evaluate; await E("try{Coach.close(); UI.setTips(false);}catch(e){} 0"); await pg.wait_for_timeout(300); (await E("UI.setTab('klang'); try { document.body.classList.remove('keinf'); } catch (_) {} 0")) if not __import__("os").environ.get("HOME67") else None
    import sys
    exec(open(sys.argv[1]).read(), globals(), locals()) if False else None
    code=open(sys.argv[1]).read()
    ns={'pg':pg,'E':E,'errs':errs,'asyncio':asyncio}
    exec("async def _probe(pg,E,errs):\n"+"\n".join("  "+l for l in code.splitlines()), ns)
    await ns['_probe'](pg,E,errs)
    print("ERRS", errs); await b.close()
asyncio.run(main())
