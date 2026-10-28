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
    await pg.tap("#tLoop"); await pg.wait_for_timeout(700); await pg.screenshot(path="t55_loop0.png")
    st = lambda: E("JSON.stringify({L:LoopSt.L, bpm:Music.tempo(), run:Transport.running, n:LoopSt.count(), states:LoopSt.slots.map((t,i)=>LoopSt.state(i)), srcs:LoopSt.srcs.length, R:LoopSt.R&&[LoopSt.R.kind,LoopSt.R.mode]})")
    print("Tipp bei laufender Musik:", await E("document.querySelector('.lqtip').innerText.slice(0,90)"))
    await pg.locator('[data-ls=stopm]').tap(); await pg.wait_for_timeout(400)
    # 1) Frei: tippen – 3 s – tippen → Tempo aus der Länge
    await pg.locator('.lqbig[data-i="0"]').tap(); await pg.wait_for_timeout(600); print("nach 1. Tipp", await st()); await pg.screenshot(path="t55_rec.png")
    await pg.wait_for_timeout(2400); await pg.locator('.lqbig[data-i="0"]').tap(); await pg.wait_for_timeout(1600); print("nach 2. Tipp", await st())
    print("Spur 1 Pegel/Länge:", await E("(()=>{const t=LoopSt.slots[0], b=t&&LoopSt.bufs.get(t.rec); if(!b) return null; const d=b.getChannelData(0); let m=0; for(let i=0;i<d.length;i+=7) m=Math.max(m,Math.abs(d[i])); return [Math.round(m*100), +b.duration.toFixed(3), +(LoopSt.L*Transport.spb).toFixed(3)] })()"))
    await pg.screenshot(path="t55_play.png")
    # 2) Overdub
    await pg.locator('.lqbig[data-i="0"]').tap(); await pg.wait_for_timeout(500); print("Overdub", await st()); await pg.wait_for_timeout(2000)
    r0 = await E("LoopSt.slots[0].rec"); await pg.locator('.lqbig[data-i="0"]').tap(); await pg.wait_for_timeout(2200)
    print("nach Overdub: neue Aufnahme", await E("LoopSt.slots[0].rec") != r0, "prev", await E("LoopSt.slots[0].prev") == r0, await st())
    # 3) Feste Länge (Loop besteht): Spur 2
    bar = await E("Transport.spb*16"); await pg.locator('.lqbig[data-i="1"]').tap(); await pg.wait_for_timeout(300); print("Spur 2 Start", await st())
    await pg.wait_for_timeout(int((2*bar+1.4)*1000)); print("Spur 2", await st())
    # 4) Formen als Quelle
    await pg.locator('[data-ls=src][data-v=form]').tap(); await pg.wait_for_timeout(300)
    await pg.locator('.lqbig[data-i="2"]').tap(); await pg.wait_for_timeout(500); print("Formen-Aufnahme: Bereich", await E("UI.tab"), "Leiste", await E("!!document.getElementById('lsPill')"))
    await pg.screenshot(path="t55_formrec.png")
    await E("(async()=>{ for (let k=0;k<12;k++) { const h = Forms.play(Forms.active, 0.2+0.05*k, 0.9, {dur:0.2}); await new Promise(r=>setTimeout(r,180)); Forms.release(h); } })()")
    await pg.wait_for_timeout(int((2*bar+1.6)*1000)); print("Formen-Spur", await st(), await E("(()=>{const t=LoopSt.slots[2]; return t&&[t.src,t.ch]})()"))
    await pg.tap("#tLoop"); await pg.wait_for_timeout(500); await pg.screenshot(path="t55_loop3.png")
    # 5) Stopp einer Spur, Leeren per langem Druck
    await pg.locator('[data-ls=play][data-i="0"]').tap(); await pg.wait_for_timeout(300); print("Spur 1 gestoppt:", await E("LoopSt.state(0)"))
    bb = await pg.locator('.lqbig[data-i="1"]').bounding_box(); await pg.mouse.move(bb["x"]+40, bb["y"]+40); await pg.mouse.down(); await pg.wait_for_timeout(900); await pg.mouse.up(); await pg.wait_for_timeout(400)
    print("Spur 2 nach langem Druck:", await E("LoopSt.state(1)"))
    # 6) Speichern, neu laden
    await E("Save.now()"); await pg.wait_for_timeout(800); n0 = await E("LoopSt.count()")
    await pg.reload(); await pg.wait_for_timeout(900); await pg.click("#enter")
    for i in range(25):
      await pg.wait_for_timeout(400)
      if await pg.evaluate("App.started"): break
    await pg.wait_for_timeout(1500); print("nach Neuladen Spuren", n0, "→", await E("LoopSt.count()"), "L", await E("LoopSt.L"))
    await E("try{Coach.close(); UI.setTips(false);}catch(e){} 0")
    # 7) Drehtempo-Regler
    await E("UI.setTab('klang'); FBar.cat='dreh'; KSheet.det='half'; KSheet.sync(true); 0"); await pg.wait_for_timeout(500)
    print("Regler da:", await E("!!document.querySelector('#ksheet [data-fr=spd]')"))
    for v in [20, 55, 56, 57, 80]:
      await E(f"(()=>{{const r=document.querySelector('#ksheet [data-fr=spd]'); r.value={v}; r.dispatchEvent(new Event('input',{{bubbles:true}}));}})()"); await pg.wait_for_timeout(250)
      print("  Regler", v, "→", await E("Move.rTxt(Move.rpb(Forms.active))"), await E("(document.querySelector('#ksheet .fbspd b')||{}).textContent"))
    await pg.screenshot(path="t55_spd.png")
    print("Protokoll:\n  " + (await E("MicLog.text()")).replace("\n", "\n  "))
    print("ERRS", errs); await b.close()
asyncio.run(main())
