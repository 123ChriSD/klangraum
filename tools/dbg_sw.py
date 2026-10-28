import asyncio
from playwright.async_api import async_playwright
SP="/tmp/claude-0/-home-claude/7a374241-3f9e-5855-bfca-0c6038d4b5bf/scratchpad"; THREE=open(SP+"/tj/build/three.min.js").read()
async def main():
  async with async_playwright() as p:
    b = await p.chromium.launch(executable_path="/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"])
    ctx = await b.new_context(viewport={"width":390,"height":844}); pg = await ctx.new_page()
    await ctx.route("**/*", lambda r: r.fulfill(status=200, content_type="application/javascript", body=THREE) if ("three" in r.request.url and r.request.url.endswith(".js")) else (r.continue_() if r.request.url.startswith("http://127.0.0.1") else r.abort()))
    await pg.goto("http://127.0.0.1:8765/site2/"); await pg.wait_for_timeout(6000)
    print("SW aktiv:", await pg.evaluate("navigator.serviceWorker.controller ? 'ja' : (navigator.serviceWorker.getRegistration().then(r=>r&&r.active?'aktiv, noch nicht steuernd':'nein'))"))
    print("Cache:", await pg.evaluate("caches.keys().then(async ks=>{const c=await caches.open(ks[0]); return [ks, (await c.keys()).map(r=>r.url.split('/').slice(-1)[0])]})"))
    await pg.reload(); await pg.wait_for_timeout(3000)
    print("nach Neuladen gesteuert:", await pg.evaluate("!!navigator.serviceWorker.controller"), "Ladezeit DCL ms", await pg.evaluate("Math.round(performance.getEntriesByType('navigation')[0].domContentLoadedEventEnd)"), "über SW:", await pg.evaluate("performance.getEntriesByType('navigation')[0].workerStart>0"))
    await b.close()
asyncio.run(main())
