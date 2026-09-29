"""Genera un GLB a partir de un constructor procedural.
Uso: python3 tools/export_glb.py necta-krea-touch/necta-krea-touch-builder.js buildNectaKreaTouch necta-krea-touch.glb
Requiere: pip install playwright && playwright install chromium"""
import asyncio, base64, pathlib, sys
from playwright.async_api import async_playwright
here = pathlib.Path(__file__).resolve().parent
builder, fn, name = sys.argv[1], sys.argv[2], sys.argv[3]
out = here.parent / "assets" / "models" / name
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page()
        await pg.goto((here / "export.html").as_uri() + f"?b={builder}&fn={fn}")
        data = await pg.evaluate("""() => exportGLB().then(buf => { let s = ''; const u = new Uint8Array(buf);
            for (let i = 0; i < u.length; i += 32768) s += String.fromCharCode.apply(null, u.subarray(i, i + 32768)); return btoa(s); })""")
        out.write_bytes(base64.b64decode(data)); print(out, round(out.stat().st_size / 1024), "KB"); await b.close()
asyncio.run(main())
