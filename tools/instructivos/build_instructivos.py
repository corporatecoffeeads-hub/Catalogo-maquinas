"""Convierte tools/instructivos/instructivos.md en assets/js/instructivos.js.
Uso: python3 tools/instructivos/build_instructivos.py"""
import json, pathlib, re
root = pathlib.Path(__file__).resolve().parents[2]
md = (root / "tools/instructivos/instructivos.md").read_text(encoding="utf-8")
IDS = {"Kalerm 1601": "kalerm-1601", "Kalerm Pro": "kalerm-pro", "Kalerm E50 Pro": "kalerm-e50-pro",
       "Pilot Soluble": "pilot-soluble", "Pilot Espresso": "pilot-espresso", "Necta Solista": "necta-solista",
       "Krea Espresso": "krea-espresso", "Necta Krea Touch": "necta-krea-touch"}
SECT = {"Uso y funcionamiento": "uso", "Limpieza y mantenimiento": "limpieza"}
data, cur, sec = {}, None, None
for line in md.splitlines():
    line = line.strip()
    if not line: continue
    m = re.match(r"^# \d+\. (.+)$", line)
    if m: cur = IDS[m.group(1).strip()]; data[cur] = {"uso": [], "limpieza": []}; continue
    m = re.match(r"^## (.+)$", line)
    if m: sec = SECT[m.group(1).strip()]; continue
    m = re.match(r"^\d+\. ([^:]+): (.+)$", line)
    if m: data[cur][sec].append({"titulo": m.group(1).strip(), "texto": m.group(2).strip()}); continue
    raise SystemExit("Línea no reconocida: " + line)
js = ("/* Instructivos de uso y limpieza por máquina (clave = id de MACHINES).\n"
      "   Generado desde tools/instructivos/instructivos.md con build_instructivos.py:\n"
      "   para modificar un texto, editar el .md y volver a generar. */\n"
      "var INSTRUCTIVOS = " + json.dumps(data, ensure_ascii=False, indent=2) + ";\n")
(root / "assets/js/instructivos.js").write_text(js, encoding="utf-8")
for k, v in data.items(): print(k, len(v["uso"]), len(v["limpieza"]))
