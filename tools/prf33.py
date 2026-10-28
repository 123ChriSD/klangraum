import asyncio, sys
from playwright.async_api import async_playwright
sys.path.insert(0, ".")
from e2e23 import boot
async def main():
  async with async_playwright() as p:
    for (w,h) in [(412,892),(700,330)]:
      b, page, cdp, errs = await boot(p, w, h); E=page.evaluate
      await page.wait_for_timeout(1500)
      res = await E("(() => { const R = Tests.run(); const all = Object.entries(R); return [all.length, all.filter(([k,v]) => !v.pass).map(([k, v]) => [k, v.detail.slice(0,220)]), ['PW','PG','PH'].map(k => R[k] ? k + ': ' + R[k].pass + ' ' + R[k].detail.slice(0,160) : k + ' fehlt')]; })()")
      print(w,h,res[0], "FAIL:", res[1]); [print("  ", x) for x in res[2]]
      print(errs[:3]); await b.close()
asyncio.run(main())
