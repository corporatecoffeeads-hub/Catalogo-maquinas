"""Genera dist/corporate-coffee.html: una versión de un solo archivo con CSS, JS
e imágenes incrustadas (data URI). Útil para compartir o publicar en servicios
que solo aceptan un archivo. Uso: python3 tools/build_single.py"""
import base64, pathlib, re
root = pathlib.Path(__file__).resolve().parent.parent
html = (root / "index.html").read_text(encoding="utf-8")
css = (root / "assets/css/styles.css").read_text(encoding="utf-8")
data = (root / "assets/js/data.js").read_text(encoding="utf-8")
app = (root / "assets/js/app.js").read_text(encoding="utf-8")

def inline(m):
    p = root / m.group(1)
    mime = {".webp": "image/webp", ".png": "image/png", ".glb": "model/gltf-binary"}.get(p.suffix, "image/jpeg")
    return '"data:%s;base64,%s"' % (mime, base64.b64encode(p.read_bytes()).decode())
data = re.sub(r'"(assets/img/[^"]+)"', inline, data)
viewer = (root / "assets/js/viewer3d.js").read_text(encoding="utf-8")
vendor = "".join("<script>\n" + (root / "assets/vendor/three" / f).read_text(encoding="utf-8") + "\n</script>\n"
                 for f in ["three.min.js", "OrbitControls.js", "RoomEnvironment.js", "GLTFLoader.js"])
# El modelo de la E50 Pro se construye en el navegador (sin fetch ni blobs): compatible con CSP estrictas
vendor += "".join("<script>\n" + (root / "tools/kalerm-e50" / f).read_text(encoding="utf-8") + "\n</script>\n"
                  for f in ["RoundedBoxGeometry.js", "kalerm-e50-builder.js"])

html = re.sub(r'"(assets/img/[^"]+)"', inline, html)
html = html.replace('<link rel="stylesheet" href="assets/css/styles.css">', "<style>\n" + css + "\n</style>")
html = html.replace('<script src="assets/js/data.js"></script>', "<script>\n" + data + "\n</script>")
html = html.replace('<script src="assets/js/viewer3d.js"></script>', vendor + "<script>\n" + viewer + "\n</script>")
html = html.replace('<script src="assets/js/app.js"></script>', "<script>\n" + app + "\n</script>")
out = root / "dist" / "corporate-coffee.html"
out.parent.mkdir(exist_ok=True)
out.write_text(html, encoding="utf-8")
print(out, round(out.stat().st_size / 1024), "KB")
