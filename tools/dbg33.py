import asyncio
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b = await p.chromium.launch(executable_path="/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args=["--use-gl=angle","--use-angle=swiftshader"])
    pg = await b.new_page(); errs=[]
    pg.on("pageerror", lambda e: errs.append(str(e)))
    await pg.route("**/*", lambda r: r.continue_() if r.request.url.startswith("http://127.0.0.1") else r.abort())
    await pg.goto("http://127.0.0.1:8765/index.html"); await pg.wait_for_timeout(1500); print(errs); await b.close()
asyncio.run(main())
