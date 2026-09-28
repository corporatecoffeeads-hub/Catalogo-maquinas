"""Genera assets/models/kalerm-e50-pro.glb a partir de kalerm-e50-builder.js.
Requiere: pip install playwright && playwright install chromium
Uso: python3 tools/kalerm-e50/export_glb.py"""
import asyncio, base64, pathlib
from playwright.async_api import async_playwright
here = pathlib.Path(__file__).resolve().parent
out = here.parent.parent / "assets" / "models" / "kalerm-e50-pro.glb"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page()
        await pg.goto((here / "export.html").as_uri() + "?automated")
        data = await pg.evaluate("""() => exportGLB().then(buf => {
            let s = ''; const u = new Uint8Array(buf);
            for (let i = 0; i < u.length; i += 32768) s += String.fromCharCode.apply(null, u.subarray(i, i + 32768));
            return btoa(s); })""")
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_bytes(base64.b64decode(data))
        print(out, round(out.stat().st_size / 1024), "KB")
        await b.close()
asyncio.run(main())
