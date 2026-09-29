/* =====================================================================
   Kalerm E50 Pro · Modelo 3D procedural (fuente del archivo GLB)
   ---------------------------------------------------------------------
   Reconstrucción a partir de 4 fotografías reales y la ficha técnica:
   ancho 31 cm · alto total 58 cm (con contenedor de granos) ·
   profundidad total 53 cm (con bandeja). Unidades internas: centímetros;
   el nodo raíz se escala a metros (0,01) para glTF.
   Ejes: +Y arriba, +Z frente de la máquina, −X = lado izquierdo del
   usuario (lado del estanque de agua).
   Uso: buildKalermE50(THREE) → THREE.Group (requiere RoundedBoxGeometry)
   ===================================================================== */
(function () {
  "use strict";

  window.buildKalermE50 = function (THREE) {
    if (THREE.ColorManagement) THREE.ColorManagement.legacyMode = false;
    var root = new THREE.Group();
    root.name = "Kalerm_E50_Pro";
    var S = THREE.sRGBEncoding;

    /* ---------------- Texturas procedurales ---------------- */
    function canvas(w, h) { var c = document.createElement("canvas"); c.width = w; c.height = h; return c; }
    function rand(seed) { var s = seed; return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }

    // Cepillado: ORM (G = rugosidad, B = metalicidad) + normal map
    function brushedMaps() {
      var N = 512, r = rand(7);
      var h = new Float32Array(N * N);
      for (var x = 0; x < N; x++) {
        var base = (r() - 0.5) * 0.6;
        for (var y = 0; y < N; y++) h[y * N + x] = base + (r() - 0.5) * 0.25;
      }
      for (var k = 0; k < 900; k++) { // vetas largas verticales
        var cx = Math.floor(r() * N), len = 40 + r() * 300, y0 = Math.floor(r() * N), a = (r() - 0.5) * 1.4;
        for (var j = 0; j < len; j++) h[((y0 + j) % N) * N + cx] += a;
      }
      var cO = canvas(N, N), gO = cO.getContext("2d"), dO = gO.createImageData(N, N);
      var cN = canvas(N, N), gN = cN.getContext("2d"), dN = gN.createImageData(N, N);
      for (var yy = 0; yy < N; yy++) for (var xx = 0; xx < N; xx++) {
        var i = yy * N + xx, v = h[i];
        var i4 = i * 4;
        dO.data[i4] = 255; dO.data[i4 + 1] = Math.max(0, Math.min(255, 118 + v * 40)); dO.data[i4 + 2] = 150; dO.data[i4 + 3] = 255;
        var dx = h[yy * N + ((xx + 1) % N)] - h[yy * N + ((xx - 1 + N) % N)];
        var nx = -dx * 0.9, nz = 1, l = Math.sqrt(nx * nx + nz * nz);
        dN.data[i4] = (nx / l * 0.5 + 0.5) * 255; dN.data[i4 + 1] = 128; dN.data[i4 + 2] = (nz / l * 0.5 + 0.5) * 255; dN.data[i4 + 3] = 255;
      }
      gO.putImageData(dO, 0, 0); gN.putImageData(dN, 0, 0);
      return { orm: cO, normal: cN };
    }
    var BR = brushedMaps();
    function tex(c, rx, ry, color) {
      var t = new THREE.CanvasTexture(c);
      t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry);
      t.anisotropy = 8; if (color) t.encoding = S;
      t.userData.mimeType = "image/jpeg";
      return t;
    }

    // Interfaz de la pantalla táctil (según fotografía frontal)
    function screenTexture() {
      var W = 1280, H = 720, c = canvas(W, H), g = c.getContext("2d");
      var bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, "#fbfcfd"); bg.addColorStop(1, "#eef1f4");
      g.fillStyle = bg; g.fillRect(0, 0, W, H);
      g.fillStyle = "#2b2f36"; g.font = "600 40px Arial, Helvetica, sans-serif"; g.textAlign = "center";
      g.fillText("15:27", W / 2, 70);
      var drinks = [
        ["Espresso", "espresso"], ["Lungo", "lungo"], ["Americano", "americano"], ["Agua caliente", "water"], ["Capuccino", "cappuccino"],
        ["Latte macchiato", "latte"], ["Leche caliente", "milk"], ["Espuma de leche", "foam"]
      ];
      var tw = 202, th = 142, gapX = 256, x0 = 38;
      drinks.forEach(function (d, i) {
        var row = i < 5 ? 0 : 1, col = i < 5 ? i : i - 5;
        var x = x0 + col * gapX, y = row === 0 ? 132 : 404;
        var tg = g.createLinearGradient(x, y, x + tw, y + th); tg.addColorStop(0, "#e9ecef"); tg.addColorStop(1, "#d9dde2");
        g.fillStyle = tg; roundRect(g, x, y, tw, th, 10); g.fill();
        g.globalAlpha = 0.35; g.strokeStyle = "#ffffff"; g.lineWidth = 2;
        for (var s = 0; s < 3; s++) { g.beginPath(); g.moveTo(x + 20 + s * 60, y + th); g.bezierCurveTo(x + 60 + s * 60, y + 60, x + 90 + s * 60, y + 40, x + 150 + s * 50, y); g.stroke(); }
        g.globalAlpha = 1;
        drawCup(g, d[1], x + tw / 2, y + th - 22);
        g.fillStyle = "#3a4049"; g.font = "500 25px Arial, Helvetica, sans-serif";
        g.fillText(d[0], x + tw / 2, y + th + 50);
      });
      g.fillStyle = "#d8412f"; g.beginPath(); g.arc(W / 2 - 16, 668, 7, 0, Math.PI * 2); g.fill();
      var t = new THREE.CanvasTexture(c); t.encoding = S; t.anisotropy = 8; t.userData.mimeType = "image/jpeg";
      return t;
    }
    function roundRect(g, x, y, w, h, r) {
      g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
      g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
    }
    function drawCup(g, kind, cx, by) {
      var glass = kind === "americano" || kind === "latte" || kind === "water" || kind === "foam";
      var w = kind === "espresso" ? 54 : glass ? 58 : 70, h = kind === "espresso" ? 44 : glass ? 78 : 56;
      if (kind === "latte") h = 92;
      // sombra
      g.fillStyle = "rgba(0,0,0,.12)"; g.beginPath(); g.ellipse(cx, by + 4, w * 0.8, 7, 0, 0, Math.PI * 2); g.fill();
      if (!glass) { g.fillStyle = "#f5f5f3"; g.beginPath(); g.ellipse(cx, by, w * 0.85, 9, 0, 0, Math.PI * 2); g.fill(); g.strokeStyle = "#c9c9c6"; g.lineWidth = 1.5; g.stroke(); }
      var top = by - h;
      var body = g.createLinearGradient(cx - w / 2, 0, cx + w / 2, 0);
      if (glass) { body.addColorStop(0, "rgba(255,255,255,.55)"); body.addColorStop(0.5, "rgba(255,255,255,.15)"); body.addColorStop(1, "rgba(255,255,255,.6)"); }
      else { body.addColorStop(0, "#e7e7e4"); body.addColorStop(0.35, "#ffffff"); body.addColorStop(1, "#d4d4d0"); }
      // líquido
      var liquid = { espresso: "#2a170c", lungo: "#3a2112", americano: "#1d110a", water: "rgba(220,235,245,.6)", cappuccino: "#caa27b", latte: "#b88a5e", milk: "#fbfaf6", foam: "#fbfaf6" }[kind];
      g.save(); g.beginPath();
      g.moveTo(cx - w / 2, top); g.lineTo(cx + w / 2, top); g.lineTo(cx + w / 2 - 6, by - 4); g.quadraticCurveTo(cx, by + 4, cx - w / 2 + 6, by - 4); g.closePath();
      g.clip();
      g.fillStyle = liquid; g.fillRect(cx - w, top + (glass ? 10 : 4), w * 2, h);
      if (kind === "latte") { g.fillStyle = "#f6efe4"; g.fillRect(cx - w, top + 6, w * 2, 26); g.fillStyle = "#fbf8f2"; g.fillRect(cx - w, by - 26, w * 2, 26); }
      if (kind === "foam") { g.fillStyle = "#ffffff"; g.fillRect(cx - w, top + 6, w * 2, 30); }
      g.fillStyle = body; g.globalAlpha = glass ? 1 : 0.0; g.fillRect(cx - w, top, w * 2, h + 10);
      g.restore(); g.globalAlpha = 1;
      g.strokeStyle = glass ? "rgba(120,130,140,.55)" : "#bdbdb8"; g.lineWidth = 2;
      g.beginPath(); g.moveTo(cx - w / 2, top); g.lineTo(cx - w / 2 + 6, by - 4); g.quadraticCurveTo(cx, by + 4, cx + w / 2 - 6, by - 4); g.lineTo(cx + w / 2, top); g.stroke();
      g.beginPath(); g.ellipse(cx, top, w / 2, 5, 0, 0, Math.PI * 2);
      g.fillStyle = kind === "cappuccino" ? "#efe0cc" : kind === "espresso" || kind === "lungo" ? "#6b4128" : glass ? "rgba(255,255,255,.5)" : "#fff"; g.fill(); g.stroke();
      if (!glass) { g.beginPath(); g.ellipse(cx + w / 2 + 8, top + h * 0.45, 9, h * 0.22, 0, -Math.PI / 2, Math.PI / 2); g.lineWidth = 5; g.strokeStyle = "#e1e1dd"; g.stroke(); }
    }

    // Logotipo en la columna del dispensador
    function logoTexture() {
      var W = 512, H = 220, c = canvas(W, H), g = c.getContext("2d");
      var bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, "#101011"); bg.addColorStop(1, "#050506");
      g.fillStyle = bg; g.fillRect(0, 0, W, H);
      g.fillStyle = "#c8261f"; // ícono taza
      g.beginPath(); g.moveTo(236, 118); g.lineTo(276, 118); g.lineTo(271, 142); g.quadraticCurveTo(256, 152, 241, 142); g.closePath(); g.fill();
      g.beginPath(); g.moveTo(256, 112); g.bezierCurveTo(240, 96, 262, 84, 252, 64); g.bezierCurveTo(272, 80, 262, 100, 256, 112); g.fill();
      g.fillStyle = "#4a4a4d"; g.font = "600 58px Arial, Helvetica, sans-serif"; g.textAlign = "center";
      g.fillText("K A L E R M", W / 2, 196);
      var t = new THREE.CanvasTexture(c); t.encoding = S; t.anisotropy = 8; t.userData.mimeType = "image/jpeg";
      return t;
    }

    /* ---------------- Materiales PBR ---------------- */
    var mat = {
      brushed: new THREE.MeshStandardMaterial({ name: "carcasa_cepillada", color: 0x2f3033, metalness: 1, roughness: 1,
        roughnessMap: tex(BR.orm, 1.2, 1.2), metalnessMap: null, normalMap: tex(BR.normal, 1.2, 1.2), normalScale: new THREE.Vector2(0.35, 0.35) }),
      brushedPanel: new THREE.MeshStandardMaterial({ name: "panel_lateral_cepillado", color: 0x2c2d30, metalness: 1, roughness: 1,
        roughnessMap: tex(BR.orm, 1 / 24, 1 / 24), normalMap: tex(BR.normal, 1 / 24, 1 / 24), normalScale: new THREE.Vector2(0.35, 0.35) }),
      satin: new THREE.MeshPhysicalMaterial({ name: "negro_satinado", color: 0x151517, roughness: 0.42, metalness: 0.1, clearcoat: 0.25, clearcoatRoughness: 0.4 }),
      matte: new THREE.MeshStandardMaterial({ name: "plastico_negro_mate", color: 0x121213, roughness: 0.82, metalness: 0 }),
      piano: new THREE.MeshPhysicalMaterial({ name: "negro_brillante", color: 0x070708, roughness: 0.12, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.05 }),
      glass: new THREE.MeshPhysicalMaterial({ name: "vidrio_pantalla", color: 0x030304, roughness: 0.04, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.02 }),
      chrome: new THREE.MeshStandardMaterial({ name: "cromado", color: 0xf2f2f2, metalness: 1, roughness: 0.07 }),
      steel: new THREE.MeshStandardMaterial({ name: "acero_inoxidable", color: 0xd4d6d8, metalness: 1, roughness: 0.28 }),
      slot: new THREE.MeshStandardMaterial({ name: "ranura", color: 0x050505, roughness: 1, metalness: 0 }),
      rubber: new THREE.MeshStandardMaterial({ name: "goma", color: 0x0b0b0b, roughness: 0.95, metalness: 0 }),
      darkPlastic: new THREE.MeshStandardMaterial({ name: "plastico_gris_oscuro", color: 0x2a2b2e, roughness: 0.55, metalness: 0 }),
      hopper: new THREE.MeshPhysicalMaterial({ name: "contenedor_ahumado", color: 0xb9bec4, roughness: 0.06, metalness: 0, transmission: 0.92, thickness: 0.3, ior: 1.49, side: THREE.DoubleSide }),
      hopperLid: new THREE.MeshPhysicalMaterial({ name: "tapa_ahumada", color: 0x8d949b, roughness: 0.08, metalness: 0, transmission: 0.85, thickness: 0.6, ior: 1.49 }),
      tankWindow: new THREE.MeshPhysicalMaterial({ name: "ventana_estanque", color: 0x3a3d42, roughness: 0.05, metalness: 0, transmission: 0.55, thickness: 0.4, ior: 1.49 }),
      tank: new THREE.MeshPhysicalMaterial({ name: "estanque_agua", color: 0xa9b4bd, roughness: 0.15, metalness: 0, transmission: 0.7, thickness: 1 }),
      tube: new THREE.MeshPhysicalMaterial({ name: "tubo_leche", color: 0xf4f4f2, roughness: 0.3, metalness: 0, transmission: 0.45, thickness: 0.2 }),
      beans: new THREE.MeshStandardMaterial({ name: "granos_cafe", color: 0x3d2416, roughness: 0.45, metalness: 0 }),
      display: new THREE.MeshStandardMaterial({ name: "display", color: 0x000000, emissive: 0xffffff, emissiveIntensity: 1, roughness: 0.2, metalness: 0 }),
      logo: new THREE.MeshPhysicalMaterial({ name: "logo_columna", color: 0xffffff, roughness: 0.12, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.05 })
    };
    mat.brushed.metalnessMap = mat.brushed.roughnessMap;
    mat.brushedPanel.metalnessMap = mat.brushedPanel.roughnessMap;
    mat.display.emissiveMap = screenTexture();
    mat.logo.map = logoTexture();

    /* ---------------- Utilidades geométricas ---------------- */
    function add(geo, m, x, y, z, name, parent) {
      var mesh = new THREE.Mesh(geo, m); mesh.position.set(x || 0, y || 0, z || 0);
      if (name) mesh.name = name; (parent || root).add(mesh); return mesh;
    }
    function rbox(w, h, d, r, seg) { return new THREE.RoundedBoxGeometry(w, h, d, seg || 2, Math.min(r, w / 2, h / 2, d / 2) * 0.999); }
    function rrPath(shapeOrPath, w, h, r, cx, cy) {
      var p = shapeOrPath, x = (cx || 0) - w / 2, y = (cy || 0) - h / 2; r = Math.min(r, w / 2, h / 2);
      p.moveTo(x + r, y); p.lineTo(x + w - r, y); p.quadraticCurveTo(x + w, y, x + w, y + r);
      p.lineTo(x + w, y + h - r); p.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      p.lineTo(x + r, y + h); p.quadraticCurveTo(x, y + h, x, y + h - r);
      p.lineTo(x, y + r); p.quadraticCurveTo(x, y, x + r, y); return p;
    }
    // Panel extruido con bisel; holes: [[w,h,r,cx,cy], ...]
    function panel(w, h, t, r, b, holes) {
      var s = rrPath(new THREE.Shape(), w - 2 * b, h - 2 * b, Math.max(r - b, 0.05));
      (holes || []).forEach(function (o) { s.holes.push(rrPath(new THREE.Path(), o[0] + 2 * b, o[1] + 2 * b, o[2] + b, o[3], o[4])); });
      var g = new THREE.ExtrudeGeometry(s, { depth: Math.max(t - 2 * b, 0.01), bevelEnabled: true, bevelThickness: b, bevelSize: b, bevelSegments: 2, curveSegments: 6 });
      g.translate(0, 0, -(t - 2 * b) / 2); return g;
    }
    function merge(list) {
      var pos = [], nor = [], uv = [];
      list.forEach(function (g) {
        var n = g.index ? g.toNonIndexed() : g;
        pos.push.apply(pos, n.attributes.position.array); nor.push.apply(nor, n.attributes.normal.array);
        if (n.attributes.uv) uv.push.apply(uv, n.attributes.uv.array); else for (var i = 0; i < n.attributes.position.count; i++) uv.push(0, 0);
      });
      var out = new THREE.BufferGeometry();
      out.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      out.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
      out.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
      return out;
    }
    // fusión indexada (para muchas copias de una geometría pequeña)
    function mergeIndexed(list) {
      var pos = [], nor = [], uv = [], idx = [], off = 0;
      list.forEach(function (g) {
        pos.push.apply(pos, g.attributes.position.array); nor.push.apply(nor, g.attributes.normal.array); uv.push.apply(uv, g.attributes.uv.array);
        var ix = g.index.array; for (var i = 0; i < ix.length; i++) idx.push(ix[i] + off);
        off += g.attributes.position.count;
      });
      var out = new THREE.BufferGeometry();
      out.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      out.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
      out.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
      out.setIndex(idx); return out;
    }
    function placed(g, x, y, z, rx, ry, rz, sx, sy, sz) {
      var o = new THREE.Object3D(); o.position.set(x, y, z); o.rotation.set(rx || 0, ry || 0, rz || 0); o.scale.set(sx || 1, sy || 1, sz || 1); o.updateMatrix();
      return g.clone().applyMatrix4(o.matrix);
    }
    // Superficie lateral entre dos rectángulos redondeados (contenedor cónico)
    function loft(w0, d0, r0, w1, d1, r1, h, seg) {
      function ring(w, d, r) {
        var pts = [], hw = w / 2 - r, hd = d / 2 - r, c = [[hw, hd, 0], [-hw, hd, Math.PI / 2], [-hw, -hd, Math.PI], [hw, -hd, Math.PI * 1.5]];
        c.forEach(function (k) { for (var i = 0; i <= seg; i++) { var a = k[2] + (i / seg) * Math.PI / 2; pts.push([k[0] + Math.cos(a) * r, k[1] + Math.sin(a) * r]); } });
        return pts;
      }
      var A = ring(w0, d0, r0), B = ring(w1, d1, r1), pos = [], uv = [], n = A.length;
      for (var i = 0; i < n; i++) {
        var j = (i + 1) % n, u0 = i / n, u1 = (i + 1) / n;
        pos.push(A[i][0], 0, A[i][1], A[j][0], 0, A[j][1], B[j][0], h, B[j][1], A[i][0], 0, A[i][1], B[j][0], h, B[j][1], B[i][0], h, B[i][1]);
        uv.push(u0, 0, u1, 0, u1, 1, u0, 0, u1, 1, u0, 1);
      }
      var g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
      g.computeVertexNormals(); return g;
    }

    /* =================================================================
       CUERPO PRINCIPAL  (x ±15,5 · y 1→48 · z −26,5→12,5)
       ================================================================= */
    var bodyCZ = -7, bodyD = 39, bodyTop = 48, bodyBottom = 1, bodyH = bodyTop - bodyBottom, bodyCY = (bodyTop + bodyBottom) / 2;
    add(rbox(28.8, bodyH, bodyD, 0.6), mat.brushed, 0, bodyCY, bodyCZ, "cuerpo");

    // Paneles laterales (1,3 cm) con unión horizontal inferior (y ≈ 13,8)
    var seamY = 13.8, sideT = 1.35;
    function sidePanel(sign, withWindow) {
      var grp = new THREE.Group(); grp.name = sign < 0 ? "panel_lateral_izquierdo" : "panel_lateral_derecho";
      var upperH = bodyTop - seamY - 0.1, lowerH = seamY - bodyBottom - 0.1;
      var holes = withWindow ? [[21, 31.8, 1.4, -7 - bodyCZ, (14.6 + 46.4) / 2 - (seamY + 0.1 + upperH / 2)]] : null;
      // Shape en plano (z, y): se construye en XY y se rota
      var up = panel(bodyD, upperH, sideT, 0.8, 0.35, holes);
      var lo = panel(bodyD, lowerH, sideT, 0.8, 0.35);
      var m1 = add(up, mat.brushedPanel, 0, seamY + 0.1 + upperH / 2, 0, null, grp);
      var m2 = add(lo, mat.brushedPanel, 0, bodyBottom + lowerH / 2, 0, null, grp);
      grp.rotation.y = sign < 0 ? -Math.PI / 2 : Math.PI / 2;
      grp.position.set(sign * (14.4 + sideT / 2), 0, bodyCZ);
      root.add(grp);
      // canal oscuro de la unión
      add(new THREE.BoxGeometry(0.4, 0.22, bodyD - 1), mat.slot, sign * (14.9), seamY, bodyCZ);
      return grp;
    }
    sidePanel(-1, true);
    sidePanel(1, false);

    // Ventana del estanque de agua (lado izquierdo): vidrio ahumado + estanque interior
    add(rbox(0.35, 31.6, 20.8, 0.15), mat.tankWindow, -15.2, 30.5, -7, "ventana_estanque");
    add(rbox(0.9, 30, 19.6, 1.0), mat.tank, -14.55, 30.2, -7.1, "estanque_agua");
    add(new THREE.BoxGeometry(0.04, 30.5, 20.2), mat.slot, -14.43, 30.4, -7, "fondo_ventana");
    add(new THREE.BoxGeometry(0.2, 0.9, 3.4), new THREE.MeshStandardMaterial({ name: "etiqueta", color: 0xe8e8e6, roughness: 0.8 }), -15.42, 45.4, -9.5, "etiqueta_serie");

    // Conector de leche (lado derecho)
    var conn = add(new THREE.CylinderGeometry(1.7, 1.8, 0.5, 40), mat.matte, 15.95, 23, 6.2, "conector_leche"); conn.rotation.z = Math.PI / 2;
    var connIn = add(new THREE.CylinderGeometry(1.3, 1.3, 0.3, 40), mat.piano, 16.15, 23, 6.2); connIn.rotation.z = Math.PI / 2;
    [-0.55, 0.55].forEach(function (dz) { var n = add(new THREE.CylinderGeometry(0.28, 0.32, 0.6, 16), mat.darkPlastic, 16.35, 23 + dz * 0.2, 6.2 + dz); n.rotation.z = Math.PI / 2; });

    // Panel frontal superior satinado y puerta inferior
    add(panel(31, 20.6, 0.6, 0.7, 0.25), mat.satin, 0, 37.6, 12.6, "frontal_superior");
    add(panel(30.2, 17, 0.45, 0.5, 0.2), mat.satin, 0, 18.6, 12.55, "puerta_frontal");
    add(new THREE.BoxGeometry(30.4, 0.22, 0.5), mat.slot, 0, 27.2, 12.5, "union_frontal");
    add(new THREE.BoxGeometry(28, 0.5, 0.4), mat.matte, 0, 10.4, 12.55, "zocalo_frontal");

    // Patas de goma
    [[-12.5, -23.5], [12.5, -23.5], [-12.5, 9.5], [12.5, 9.5]].forEach(function (p) { add(new THREE.CylinderGeometry(1.5, 1.7, 1, 24), mat.rubber, p[0], 0.5, p[1], "pata"); });

    /* ---------------- Cubierta superior ---------------- */
    add(panel(18.5, 10, 0.2, 0.6, 0.06), mat.darkPlastic, -2.5, bodyTop + 0.05, 6.2).rotation.x = -Math.PI / 2;
    var slots = [];
    for (var i = 0; i < 6; i++) slots.push(placed(new THREE.BoxGeometry(13, 0.2, 0.42), -3.2, bodyTop + 0.1, 9.6 - i * 1.25));
    add(merge(slots), mat.slot, 0, 0, 0, "rejilla_superior");
    // tapa de la tolva de café molido (2 ranuras y muesca)
    add(panel(8.5, 7, 0.22, 0.5, 0.06), mat.satin, 8.5, bodyTop + 0.08, -2.3).rotation.x = -Math.PI / 2;
    add(merge([placed(new THREE.BoxGeometry(5.8, 0.2, 0.36), 8.2, bodyTop + 0.14, -0.6), placed(new THREE.BoxGeometry(5.8, 0.2, 0.36), 8.2, bodyTop + 0.14, -1.9)]), mat.slot, 0, 0, 0, "ranuras_tapa");
    add(rbox(1.6, 0.35, 0.7, 0.15), mat.slot, 8.5, bodyTop + 0.2, -4.7, "muesca_tapa");

    /* ---------------- Parte posterior ---------------- */
    var backZ = bodyCZ - bodyD / 2;
    add(panel(26, 42, 0.4, 0.6, 0.15), mat.brushedPanel, 1.2, 26, backZ - 0.1, "panel_posterior");
    add(new THREE.BoxGeometry(0.3, 42, 0.3), mat.slot, -12, 26, backZ - 0.05, "canal_posterior");
    function louver(cx, cy, w, n, pitch) {
      var parts = [];
      add(new THREE.BoxGeometry(w, n * pitch + 0.4, 0.3), mat.slot, cx, cy, backZ - 0.25, "rejilla_posterior");
      for (var k = 0; k < n; k++) parts.push(placed(new THREE.BoxGeometry(w - 0.2, pitch * 0.9, 0.12), cx, cy + (k - (n - 1) / 2) * pitch, backZ - 0.45, -0.7));
      add(merge(parts), mat.matte);
    }
    louver(-13.6, 40, 1.8, 6, 1.05);
    louver(-6, 38.5, 7, 6, 1.1);
    add(rbox(2.2, 3.2, 0.6, 0.2), mat.matte, -9.5, 8.5, backZ - 0.5, "interruptor_marco");
    add(rbox(1.5, 2.4, 0.5, 0.2), mat.piano, -9.5, 8.6, backZ - 0.8, "interruptor").rotation.x = 0.18;
    add(rbox(3.2, 2.6, 0.5, 0.3), mat.matte, -9.5, 4.3, backZ - 0.5, "toma_corriente");
    var cable = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-9.5, 4.3, backZ - 0.7), new THREE.Vector3(-9.5, 4.1, backZ - 3), new THREE.Vector3(-10.5, 1.2, backZ - 6), new THREE.Vector3(-12, 0.5, backZ - 10)
    ]);
    add(new THREE.TubeGeometry(cable, 30, 0.35, 10, false), mat.rubber, 0, 0, 0, "cable");

    /* =================================================================
       CABEZAL: pantalla táctil de 7" con marco cromado
       ================================================================= */
    var head = new THREE.Group(); head.name = "cabezal_pantalla";
    add(rbox(17, 11, 5, 0.8), mat.satin, 0, 40, 15, "cuello_cabezal", root);
    var fw = 25, fh = 17.5, fd = 3.4;
    add(panel(fw, fh, fd, 1.1, 0.5), mat.piano, 0, 0, 0, "marco_pantalla", head);
    // bandas cromadas superior e inferior + perfiles laterales
    add(rbox(fw + 0.1, 0.55, fd + 0.1, 0.25), mat.chrome, 0, fh / 2 - 0.2, 0, "cromado_superior", head);
    add(rbox(fw + 0.1, 0.55, fd + 0.1, 0.25), mat.chrome, 0, -fh / 2 + 0.2, 0, "cromado_inferior", head);
    add(rbox(0.32, fh - 0.9, 0.4, 0.12), mat.chrome, -fw / 2 + 0.2, 0, fd / 2 + 0.15, "cromado_izq", head);
    add(rbox(0.32, fh - 0.9, 0.4, 0.12), mat.chrome, fw / 2 - 0.2, 0, fd / 2 + 0.15, "cromado_der", head);
    add(new THREE.BoxGeometry(fw - 1.4, fh - 1.6, 0.08), mat.glass, 0, 0, fd / 2 + 0.02, "vidrio_frontal", head);
    add(new THREE.PlaneGeometry(18.3, 10.3), mat.display, 0, -0.3, fd / 2 + 0.07, "display", head);
    head.position.set(0, 41.25, 19.3);
    head.rotation.x = -0.05;
    root.add(head);

    /* ---------------- Columna del dispensador ---------------- */
    var colZ = 16.2;
    add(rbox(9, 4.2, 6.4, 0.35), mat.piano, 0, 31, colZ, "columna_superior");
    add(new THREE.PlaneGeometry(8.2, 3.5), mat.logo, 0, 31, colZ + 3.21, "logo_kalerm");
    add(rbox(0.28, 4.2, 6.2, 0.1), mat.chrome, -4.55, 31, colZ, "columna_cromo_izq");
    add(rbox(0.28, 4.2, 6.2, 0.1), mat.chrome, 4.55, 31, colZ, "columna_cromo_der");
    add(rbox(8.6, 5.6, 6.0, 0.4), mat.satin, 0, 26.1, colZ, "columna_inferior");
    add(rbox(9.2, 1.5, 6.6, 0.45), mat.matte, 0, 22.6, colZ, "cabezal_dispensador");
    add(rbox(9.4, 0.4, 6.8, 0.18), mat.chrome, 0, 22.0, colZ, "aro_cromado_dispensador");
    // boquillas de café y leche
    [[-1.3, 17.2], [1.3, 17.2]].forEach(function (p) { add(new THREE.CylinderGeometry(0.42, 0.34, 1.1, 20), mat.chrome, p[0], 21.3, p[1], "boquilla_cafe"); });
    add(new THREE.CylinderGeometry(0.36, 0.3, 1.3, 20), mat.steel, 0, 21.2, 18.6, "boquilla_leche");
    add(new THREE.CylinderGeometry(0.3, 0.3, 0.8, 16), mat.steel, 0, 21.3, 14.8, "boquilla_agua");
    // tubo de leche hacia el refrigerador (lado derecho)
    var tube = new THREE.CatmullRomCurve3([
      new THREE.Vector3(4.3, 25.5, 17.2), new THREE.Vector3(8, 26.6, 16.8), new THREE.Vector3(13.5, 27, 14.5), new THREE.Vector3(16.6, 25, 11), new THREE.Vector3(18.2, 20, 7.5)
    ]);
    add(new THREE.TubeGeometry(tube, 50, 0.32, 12, false), mat.tube, 0, 0, 0, "tubo_leche");

    /* =================================================================
       BANDEJA DE GOTEO con rejilla de acero
       ================================================================= */
    var ts = new THREE.Shape();
    ts.moveTo(4, 9.4); ts.lineTo(25.4, 9.4); ts.quadraticCurveTo(26.5, 9.4, 26.5, 8.3); ts.lineTo(26.5, 5.4);
    ts.quadraticCurveTo(26.5, 4.2, 25.3, 3.9); ts.lineTo(13, 1.4); ts.lineTo(4, 1.4); ts.lineTo(4, 9.4);
    var tg = new THREE.ExtrudeGeometry(ts, { depth: 31.2, bevelEnabled: true, bevelThickness: 0.4, bevelSize: 0.4, bevelSegments: 3, curveSegments: 10 });
    tg.translate(0, 0, -15.6);
    var tray = add(tg, mat.matte, 0, 0, 0, "bandeja_goteo");
    tray.rotation.y = -Math.PI / 2; // (z_local → x) : perfil en plano z-y
    // Rejilla
        var bars = [];
    for (var b = 0; b < 27; b++) bars.push(placed(new THREE.BoxGeometry(29, 0.28, 0.2), 0, 9.95, 13.9 + b * 0.44));
    bars.push(placed(new THREE.BoxGeometry(29.8, 0.35, 0.4), 0, 9.95, 13.6), placed(new THREE.BoxGeometry(29.8, 0.35, 0.4), 0, 9.95, 25.6));
    bars.push(placed(new THREE.BoxGeometry(0.4, 0.35, 12.4), -14.8, 9.95, 19.6), placed(new THREE.BoxGeometry(0.4, 0.35, 12.4), 14.8, 9.95, 19.6));
    add(merge(bars), mat.steel, 0, 0, 0, "rejilla_bandeja");
    var ring = add(new THREE.TorusGeometry(2.1, 0.12, 10, 48), mat.steel, 0, 10.15, 18.4, "aro_taza"); ring.rotation.x = Math.PI / 2;
    // marcas en V de la rejilla
    [-9.5, 9.5].forEach(function (x) {
      var v = []; v.push(placed(new THREE.BoxGeometry(2.4, 0.12, 0.25), x - 0.9, 10.15, 22.2, 0, 0.45), placed(new THREE.BoxGeometry(2.4, 0.12, 0.25), x + 0.9, 10.15, 22.2, 0, -0.45));
      add(merge(v), mat.chrome, 0, 0, 0, "marca_v");
    });

    /* =================================================================
       CONTENEDOR DE GRANOS (ahumado, cónico) con granos y varilla
       ================================================================= */
    var hz = -15, hx = 0;
    add(rbox(13.6, 1.3, 17.2, 0.45), mat.darkPlastic, hx, bodyTop + 0.6, hz, "base_contenedor");
    add(rbox(12.2, 0.3, 15.8, 0.6), mat.slot, hx, bodyTop + 1.3, hz);
    var walls = add(loft(12.6, 16.2, 1.3, 13.3, 16.8, 1.5, 8.4, 5), mat.hopper, hx, bodyTop + 1.2, hz, "contenedor_granos");
    walls.renderOrder = 2;
    add(rbox(13.7, 0.7, 17.2, 0.3), mat.hopperLid, hx, bodyTop + 9.95, hz, "tapa_contenedor").renderOrder = 3;
    // rejilla interior de seguridad
    var grid = [];
    for (var gx = -2; gx <= 2; gx++) grid.push(placed(new THREE.BoxGeometry(0.25, 1.8, 14), hx + gx * 2.4, bodyTop + 3.2, hz));
    for (var gz = -3; gz <= 3; gz++) grid.push(placed(new THREE.BoxGeometry(11, 1.8, 0.25), hx, bodyTop + 3.2, hz + gz * 2.2));
    add(merge(grid), mat.matte, 0, 0, 0, "rejilla_contenedor");
    // granos de café
    var rb = rand(42), beanG = new THREE.SphereGeometry(1, 7, 5), beans = [];
    for (var n = 0; n < 240; n++) {
      beans.push(placed(beanG, hx + (rb() - 0.5) * 11, bodyTop + 1.8 + rb() * 1.9 + (Math.abs(rb() - 0.5) < 0.1 ? 0.6 : 0), hz + (rb() - 0.5) * 14.6,
        rb() * 3, rb() * 3, rb() * 3, 0.58, 0.36, 0.44));
    }
    add(mergeIndexed(beans), mat.beans, 0, 0, 0, "granos");
    // varilla de acero en L invertida
    var rod = new THREE.CurvePath();
    var p0 = new THREE.Vector3(-0.4, bodyTop + 1.4, hz + 7.3), p1 = new THREE.Vector3(-0.4, bodyTop + 6.9, hz + 7.3), p2 = new THREE.Vector3(3.6, bodyTop + 6.9, hz + 7.3);
    rod.add(new THREE.LineCurve3(p0, new THREE.Vector3(-0.4, bodyTop + 6.3, hz + 7.3)));
    rod.add(new THREE.QuadraticBezierCurve3(new THREE.Vector3(-0.4, bodyTop + 6.3, hz + 7.3), p1, new THREE.Vector3(0.2, bodyTop + 6.9, hz + 7.3)));
    rod.add(new THREE.LineCurve3(new THREE.Vector3(0.2, bodyTop + 6.9, hz + 7.3), p2));
    add(new THREE.TubeGeometry(rod, 40, 0.28, 12, false), mat.steel, 0, 0, 0, "varilla");

    // Logotipo Corporate Coffee en la cubierta superior (zona trasera derecha)
    if (window.ModelKit) ModelKit(THREE, root).logo(10.7, bodyTop + 0.04, -14, 6.6);

    // Centrar en X/Z y escalar a metros
    root.traverse(function (o) { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    var wrap = new THREE.Group(); wrap.name = "Kalerm_E50_Pro_root";
    root.position.set(0, 0, 0);
    root.scale.setScalar(0.01);
    wrap.add(root);
    return wrap;
  };
})();
