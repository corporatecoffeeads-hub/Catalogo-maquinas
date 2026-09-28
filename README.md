# Corporate Coffee · Catálogo de máquinas

Sitio estático e informativo (sin precios, compras ni formularios) con catálogo, fichas individuales y comparador de las 8 máquinas entregadas en PDF.

## Estructura

```
index.html                    Página única (enrutamiento por hash: #/, #/maquina/<id>, #/comparar/<a>/<b>)
assets/css/styles.css         Estilos (paleta blanco, negro, gris y café dorado; modo oscuro automático)
assets/js/data.js             ÚNICA fuente de datos de las máquinas
assets/js/app.js              Catálogo, buscador, filtros, fichas, comparador y visor 360°/3D
assets/img/machines/*.webp    Fotografías extraídas de los PDF, con fondo eliminado
assets/img/fichas/*.webp      Ficha original completa de cada máquina (botón «Ver ficha»)
assets/models/                Carpeta reservada para modelos 3D (.glb) o secuencias 360°
tools/build_single.py         Genera dist/corporate-coffee.html (todo en un solo archivo)
```

No hay dependencias ni proceso de compilación. Las únicas peticiones externas son las fuentes de Google Fonts (con tipografías de respaldo si no cargan).

## Ejecutar localmente

Abra `index.html` directamente en el navegador, o sirva la carpeta:

```bash
python3 -m http.server 8000
# luego abra http://localhost:8000
```

## Publicar en GitHub Pages

1. Cree un repositorio y suba el contenido de esta carpeta (con `index.html` en la raíz).
2. En GitHub: Settings → Pages → Build and deployment → Source: «Deploy from a branch», rama `main`, carpeta `/ (root)`.
3. En uno o dos minutos el sitio estará en `https://<usuario>.github.io/<repositorio>/`.

Los enlaces a fichas y comparaciones se pueden compartir directamente, por ejemplo `.../#/comparar/kalerm-pro/pilot-espresso`.

Funciona igual en Netlify, Vercel, Cloudflare Pages o cualquier hosting estático (arrastrar la carpeta basta).

## Agregar o modificar una máquina

Edite `assets/js/data.js`. Copie un objeto existente, cambie `id` (se usa en la URL) y complete los campos. Reglas de datos aplicadas:

- `NE` («No especificado») cuando la ficha no informa el dato. No equivale a «No disponible».
- Rendimientos por hora y por día se guardan por separado (`productionHour`, `productionDay`) sin conversiones.
- `tags` alimenta los filtros del catálogo; `milk: null` significa que la ficha no indica el tipo de leche.
- `notes` recoge inconsistencias de la ficha para revisión; se muestran en la ficha individual.

## Vista 3D (Kalerm E50 Pro)

La ficha de la Kalerm E50 Pro abre con un visor 3D interactivo y permite alternar con las fotografías reales del equipo.

```
assets/models/kalerm-e50-pro.glb      Modelo 3D (≈1,9 MB; geometría propia, materiales PBR y texturas incrustadas)
assets/js/viewer3d.js                 Componente reutilizable ProductViewer3D
assets/vendor/three/                  Three.js r147 local (licencia MIT), se carga solo al abrir el visor
assets/img/photos/                    Fotografías reales de la E50 Pro
tools/kalerm-e50/                     Fuente del modelo: constructor procedural, vista previa y exportador GLB
```

El visor incluye rotación libre (horizontal 360° e inclinación), zoom con rueda, gestos y botones, rotación automática con botón para detenerla, restablecer vista y vistas frontal, posterior, lateral izquierda, lateral derecha y superior. La cámara tiene una distancia mínima calculada sobre el volumen del modelo, por lo que no atraviesa la geometría. Si el navegador no tiene WebGL, se muestra la fotografía del equipo.

**Importante:** el modelo se carga con `fetch`, así que el visor 3D requiere abrir el sitio desde un servidor (`python3 -m http.server`, GitHub Pages, etc.). Abriendo `index.html` con doble clic se mostrará la fotografía de respaldo. La versión de un solo archivo (`dist/corporate-coffee.html`) sí funciona sin servidor: en ella el modelo se construye directamente en el navegador con `kalerm-e50-builder.js` (sin descargas), lo que la hace compatible con servicios que bloquean conexiones mediante políticas de seguridad (CSP).

Si la tarjeta gráfica interrumpe la vista 3D, el visor reintenta automáticamente en modo liviano (sin sombras proyectadas y a resolución 1x). Si vuelve a fallar, muestra la fotografía con un botón «Intentar de nuevo».

### Modificar o regenerar el modelo

El GLB se genera desde `tools/kalerm-e50/kalerm-e50-builder.js` (medidas en centímetros, comentadas por componente):

```bash
# vista previa en vivo del constructor
python3 -m http.server 8000   →  http://localhost:8000/tools/kalerm-e50/preview.html
# regenerar assets/models/kalerm-e50-pro.glb
pip install playwright && playwright install chromium
python3 tools/kalerm-e50/export_glb.py
```

El GLB también se puede abrir en Blender (Archivo → Importar → glTF 2.0) para refinarlo y volver a exportarlo con el mismo nombre.

### Agregar un modelo 3D a otra máquina

En `assets/js/data.js`, dentro de `media`:

```js
media: {
  model3d: "assets/models/otra-maquina.glb",
  model3dNote: "Texto breve sobre el origen del modelo.",
  photos: [{ src: "assets/img/photos/otra-1.webp", alt: "Descripción" }],
  spin360: []
}
```

La ficha mostrará automáticamente las pestañas «Vista 3D» y «Fotografías». Se recomiendan modelos GLB con el eje Y hacia arriba, el frente mirando a +Z y escala en metros. Para una secuencia fotográfica real de 360° use `spin360` (24–36 fotos alrededor del equipo).

## Fotografías

Extraídas del PDF original de cada ficha (imagen de 1024 × 1536 px), recortadas y con el fondo eliminado automáticamente. En la Pilot Espresso el panel lateral blanco se recuperó con una máscara adicional por color. La resolución de origen es limitada (≈ 600–750 px de alto por máquina); si dispone de fotografías de producto en alta resolución, reemplace los archivos en `assets/img/machines/` manteniendo el mismo nombre.
