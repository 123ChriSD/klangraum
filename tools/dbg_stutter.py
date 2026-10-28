import sys
import asyncio, json
from playwright.async_api import async_playwright
SP="/tmp/claude-0/-home-claude/7a374241-3f9e-5855-bfca-0c6038d4b5bf/scratchpad"; THREE=open(SP+"/tj/build/three.min.js").read()
ARGS=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--autoplay-policy=no-user-gesture-required","--use-fake-device-for-media-stream","--use-fake-ui-for-media-stream"]
async def main(rate):
  async with async_playwright() as p:
    b = await p.chromium.launch(executable_path="/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args=ARGS)
    ctx = await b.new_context(viewport={"width":390,"height":844}, has_touch=True, permissions=["microphone"]); pg = await ctx.new_page(); errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)))
    await pg.route("**/*", lambda r: r.fulfill(status=200, content_type="application/javascript", body=THREE) if ("three" in r.request.url and r.request.url.endswith(".js")) else (r.continue_() if r.request.url.startswith("http://127.0.0.1") else r.abort()))
    cdp = await ctx.new_cdp_session(pg); await cdp.send('Emulation.setCPUThrottlingRate', {'rate': rate})
    await pg.goto("http://127.0.0.1:8765/"+sys.argv[1]); await pg.wait_for_timeout(900); await pg.click("#enter")
    for i in range(25):
      await pg.wait_for_timeout(400)
      if await pg.evaluate("App.started"): break
    await pg.wait_for_timeout(1800); E = pg.evaluate; await E("try{Coach.close(); UI.setTips(false);}catch(e){} 0")
    await E("""(()=>{ window.__gaps=[]; let last=performance.now(); const tk=Transport.tick.bind(Transport); Transport.tick=function(){ const n=performance.now(); __gaps.push(n-last); last=n; return tk(); };
      for (const f of Forms.list) { f.still=false; Motion.setTier(f, 4); } if (!Transport.running) Transport.start(); try { Techno.on && Techno.on(); } catch(_){} })()""")
    await pg.wait_for_timeout(1500); l0 = await E("Engine.stat.late||0")
    # Belastung wie beim Spielen: Kneten-Neuberechnung und Ansichtswechsel
    for k in range(6):
      await E("(()=>{ const f=Forms.active; for(let i=0;i<f.h.length;i+=5) f.h[i]+=0.01; Forms.touch(f); })()"); await pg.wait_for_timeout(700)
      await E("UI.setView(['alle','raum','nah'][%d%%3])" % k); await pg.wait_for_timeout(1300)
    r = await E("(()=>{ const g=__gaps.slice(20).sort((a,b)=>a-b); return {late: (Engine.stat.late||0), max: Math.round(g[g.length-1]), p99: Math.round(g[Math.floor(g.length*0.99)]), n:g.length, over100: g.filter(x=>x>100).length, voices: Engine.stat.maxV, mode: Engine.mode, fps: Math.round(Tests.fps||0) }; })()")
    print("CPU x", rate, r, "late seit Messbeginn", r["late"]-l0)
    await b.close()
import sys
asyncio.run(main(int(sys.argv[2]) if len(sys.argv)>2 else 4))
