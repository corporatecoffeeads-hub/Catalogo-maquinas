/* =====================================================================
   Krea Espresso (Necta) · Modelo 3D procedural
   Referencias: fotografía frontal de la ficha técnica (41 × 75 × 56,4 cm):
   columnas frontales de acero cepillado, panel central negro con marco
   cromado, display gráfico azul 128 × 64, 10 botones de selección directa,
   barra de luz azul con perfil cromado, costados negros.
   Los costados, la parte superior y la parte posterior son aproximados.
   Requiere: RoundedBoxGeometry + ModelKit.  Unidades: cm.  +Z = frente.
   ===================================================================== */
(function () {
  "use strict";
  window.buildKreaEspresso = function (THREE) {
    var root = new THREE.Group(); root.name = "Krea_Espresso";
    var K = ModelKit(THREE, root), add = K.add, rbox = K.rbox, panel = K.panel, placed = K.placed, merge = K.merge;

    /* ---------------- Texturas ---------------- */
    function lcdTexture() {
      var W = 512, H = 208, c = K.canvas(W, H), g = c.getContext("2d");
      var bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, "#2f6bff"); bg.addColorStop(1, "#1d4fe0");
      g.fillStyle = bg; g.fillRect(0, 0, W, H);
      g.fillStyle = "rgba(255,255,255,.08)"; for (var y = 0; y < H; y += 4) g.fillRect(0, y, W, 1);   // retícula de píxeles
      g.fillStyle = "#e8f0ff"; g.font = "bold 40px 'Courier New', monospace"; g.textAlign = "center";
      g.fillText("SELEZIONARE LA", W / 2, 88); g.fillText("BEVANDA", W / 2, 140);
      return K.canvasTexture(c, true, true);
    }
    var LABELS = [
      ["espresso"], ["cappuccino"],
      ["caffè lungo", "long coffee"], ["latte", "milk"],
      ["caffè", "macchiato"], ["latte", "macchiato"],
      ["orzo"], ["cioccolata", "chocolate"],
      ["cappuccino", "d'orzo"], ["acqua calda", "hot water"]
    ];
    function labelAtlas() {   // 2 columnas × 5 filas
      var CW = 512, CH = 240, c = K.canvas(CW * 2, CH * 5), g = c.getContext("2d");
      g.fillStyle = "#0b0b0c"; g.fillRect(0, 0, c.width, c.height);
      g.textAlign = "center"; g.fillStyle = "#f2f2f2";
      LABELS.forEach(function (l, i) {
        var col = i % 2, row = Math.floor(i / 2), cx = col * CW + CW / 2, cy = row * CH + CH / 2;
        g.strokeStyle = "rgba(255,255,255,.12)"; g.lineWidth = 4; K.roundRect(g, col * CW + 10, row * CH + 10, CW - 20, CH - 20, 18); g.stroke();
        if (l.length === 1) { g.font = "500 64px Arial, Helvetica, sans-serif"; g.fillText(l[0], cx, cy + 22); }
        else { g.font = "500 56px Arial, Helvetica, sans-serif"; g.fillText(l[0], cx, cy - 8); g.font = "400 40px Arial, Helvetica, sans-serif"; g.fillStyle = "#b8b8b8"; g.fillText(l[1], cx, cy + 50); g.fillStyle = "#f2f2f2"; }
        // pictograma de taza pequeño a la derecha
        g.strokeStyle = "#cfcfcf"; g.lineWidth = 5; var px = col * CW + CW - 70, py = row * CH + CH - 70;
        g.strokeRect(px, py, 30, 26); g.beginPath(); g.arc(px + 36, py + 12, 7, -Math.PI / 2, Math.PI / 2); g.stroke();
      });
      return K.canvasTexture(c, true, true);
    }
    function brandTexture() {   // KREA + NECTA sobre la columna derecha (transparente)
      var W = 512, H = 360, c = K.canvas(W, H), g = c.getContext("2d");
      g.fillStyle = "#1b1c1f"; g.font = "300 118px Arial, Helvetica, sans-serif"; g.textAlign = "center";
      g.fillText("KREA", W / 2, 130);
      g.save(); g.translate(W / 2 - 150, 212);
      g.beginPath(); g.moveTo(0, 0); g.lineTo(46, -14); g.lineTo(46, 40); g.lineTo(0, 54); g.closePath(); g.fill();
      g.fillStyle = "#cfd2d6"; for (var k = 0; k < 4; k++) g.fillRect(8, -4 + k * 13, 30, 4); g.restore();
      g.fillStyle = "#1b1c1f"; g.font = "700 76px Arial, Helvetica, sans-serif"; g.textAlign = "left"; g.fillText("NECTA", W / 2 - 88, 262);
      var t = K.canvasTexture(c, true, false); return t;
    }

    /* ---------------- Materiales ---------------- */
    var BR = K.brushedMaps(23, 1400);
    var M = {
      inox: K.mat.std({ name: "acero_cepillado", color: 0xa9aeb4, metalness: 1, roughness: 1, roughnessMap: K.repeatTex(BR.orm, 0.6, 1.2), normalMap: K.repeatTex(BR.normal, 0.6, 1.2), normalScale: new THREE.Vector2(0.3, 0.3) }),
      side: K.mat.phys({ name: "costado_negro", color: 0x141416, roughness: 0.5, metalness: 0.1, clearcoat: 0.2 }),
      piano: K.mat.phys({ name: "negro_brillante", color: 0x060607, roughness: 0.1, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.04 }),
      matte: K.mat.std({ name: "plastico_negro_mate", color: 0x111112, roughness: 0.8, metalness: 0 }),
      chrome: K.mat.std({ name: "cromado", color: 0xf2f2f2, metalness: 1, roughness: 0.07 }),
      steel: K.mat.std({ name: "acero_inoxidable", color: 0xc9ccd0, metalness: 1, roughness: 0.3 }),
      lcd: K.mat.std({ name: "display", color: 0x000000, emissive: 0xffffff, emissiveIntensity: 1, roughness: 0.25 }),
      labels: K.mat.phys({ name: "botones_rotulos", color: 0xffffff, roughness: 0.15, metalness: 0, clearcoat: 1 }),
      brand: K.mat.std({ name: "logotipos", color: 0xffffff, roughness: 0.5, transparent: true, depthWrite: false }),
      led: K.mat.std({ name: "led_azul", color: 0x0a1a66, emissive: 0x2f63ff, emissiveIntensity: 1.8, roughness: 0.4 }),
      slot: K.mat.std({ name: "ranura", color: 0x040404, roughness: 1 }),
      rubber: K.mat.std({ name: "goma", color: 0x0b0b0b, roughness: 0.95 }),
      hopper: K.mat.phys({ name: "contenedor_ahumado", color: 0xb5bac0, roughness: 0.06, transmission: 0.9, thickness: 0.3, side: THREE.DoubleSide }),
      beans: K.mat.std({ name: "granos_cafe", color: 0x3d2416, roughness: 0.45 })
    };
    M.inox.metalnessMap = M.inox.roughnessMap;
    M.lcd.emissiveMap = lcdTexture();
    M.labels.map = labelAtlas();
    M.brand.map = brandTexture();

    /* =================================================================
       Medidas (cm): x ±20,5 · y 0→66,4 (+ contenedor → 74,5)
       z −28,2 → 28,2
       ================================================================= */
    var TOP = 66.4, FRONT = 28.2, BACK = -28.2, W = 41, PW = 9.7, CW = W - 2 * PW;   // columnas y panel central
    var cupTop = 22.5, cupBot = 4.5;

    // Gabinete negro
    add(rbox(W, TOP - 0.8, 41.6, 1.4), M.side, 0, (TOP + 0.8) / 2, BACK + 20.8, "gabinete");
    [-1, 1].forEach(function (s) { add(rbox(PW, TOP - 0.8, 10.4, 1), M.side, s * (W / 2 - PW / 2), (TOP + 0.8) / 2, 18.2, "costado_frontal"); });
    add(new THREE.BoxGeometry(CW, TOP - 22.5, 10), M.matte, 0, (TOP + 22.5) / 2, 18.2, "bloque_superior");
    // Columnas frontales de acero cepillado (redondeadas hacia los costados)
    [-1, 1].forEach(function (s) {
      add(rbox(PW, TOP - 0.8, 5.2, 1.8, 3), M.inox, s * (W / 2 - PW / 2), (TOP + 0.8) / 2, FRONT - 2.6, s < 0 ? "columna_izq" : "columna_der");
    });
    // Logotipos en la columna derecha
    add(new THREE.PlaneGeometry(7.4, 5.2), M.brand, W / 2 - PW / 2, TOP - 5.6, FRONT + 0.02, "logo_krea_necta");

    // Panel central negro (sobre la zona de la taza) con esquinas superiores redondeadas
    add(panel(CW + 0.6, TOP - cupTop + 0.8, 5.4, 2.8, 0.5), M.piano, 0, (TOP + cupTop) / 2 + 0.4, FRONT - 2.5, "panel_central");
    // Marco cromado del panel de selección
    var fy = 46.1, fh = 38, fw = 20.2;
    add(panel(fw, fh, 0.7, 2.6, 0.25, [[fw - 1.3, fh - 1.3, 2.0, 0, 0]]), M.chrome, 0, fy, FRONT + 0.35, "marco_cromado");
    add(rbox(fw - 1.2, fh - 1.2, 0.3, 1.9), M.piano, 0, fy, FRONT + 0.25, "vidrio_panel");
    // Display gráfico azul
    add(rbox(10.6, 5, 0.3, 0.4), M.matte, 0, 61.2, FRONT + 0.45, "marco_display");
    add(new THREE.PlaneGeometry(9.4, 3.8), M.lcd, 0, 61.2, FRONT + 0.62, "display");
    // Barra de luz azul con perfil cromado (forma de cápsula)
    var tx = 0, t0 = 29.2, t1 = 56.2, tr = 0.95, path = new THREE.CurvePath();
    path.add(new THREE.LineCurve3(new THREE.Vector3(tx - tr, t1, 0), new THREE.Vector3(tx - tr, t0, 0)));
    path.add(new THREE.CubicBezierCurve3(new THREE.Vector3(tx - tr, t0, 0), new THREE.Vector3(tx - tr, t0 - 1.3, 0), new THREE.Vector3(tx + tr, t0 - 1.3, 0), new THREE.Vector3(tx + tr, t0, 0)));
    path.add(new THREE.LineCurve3(new THREE.Vector3(tx + tr, t0, 0), new THREE.Vector3(tx + tr, t1, 0)));
    path.add(new THREE.CubicBezierCurve3(new THREE.Vector3(tx + tr, t1, 0), new THREE.Vector3(tx + tr, t1 + 1.3, 0), new THREE.Vector3(tx - tr, t1 + 1.3, 0), new THREE.Vector3(tx - tr, t1, 0)));
    add(new THREE.TubeGeometry(path, 120, 0.2, 10, true), M.chrome, 0, 0, FRONT + 0.55, "perfil_cromado");
    add(rbox(1.2, t1 - t0 + 1.2, 0.2, 0.55), M.led, tx, (t0 + t1) / 2, FRONT + 0.42, "led_barra");
    add(new THREE.BoxGeometry(0.3, 27 - cupTop, 0.2), M.led, tx, (27 + cupTop) / 2, FRONT + 0.2, "led_linea");

    // 10 botones de selección directa (2 columnas × 5 filas) con rótulos
    var rows = [53.6, 50.3, 47.0, 43.7, 40.4], bx = 5.4, bw = 5.6, bh = 2.6;
    var btnGeos = [];
    rows.forEach(function (y, r) {
      [-1, 1].forEach(function (s, col) {
        btnGeos.push(placed(rbox(bw, bh, 0.5, 0.3), s * bx, y, FRONT + 0.55));
        var pg = new THREE.PlaneGeometry(bw - 0.3, bh - 0.3), uv = pg.attributes.uv;
        for (var i = 0; i < uv.count; i++) uv.setXY(i, (col + uv.getX(i)) / 2, 1 - (r + 1 - uv.getY(i)) / 5);
        add(pg, M.labels, s * bx, y, FRONT + 0.81, "boton_" + (r * 2 + col + 1));
      });
    });
    add(merge(btnGeos), M.piano, 0, 0, 0, "botones");

    /* ---------------- Zona de la taza ---------------- */
    var cw = CW - 0.6;
    add(new THREE.BoxGeometry(cw, cupTop - cupBot, 0.4), M.matte, 0, (cupTop + cupBot) / 2, 13.5, "fondo_zona_taza");
    add(new THREE.BoxGeometry(cw, 0.4, FRONT - 13.5), M.matte, 0, cupTop, (FRONT + 13.5) / 2, "techo_zona_taza");
    [-1, 1].forEach(function (s) { add(new THREE.BoxGeometry(0.4, cupTop - cupBot, FRONT - 13.5), M.matte, s * cw / 2, (cupTop + cupBot) / 2, (FRONT + 13.5) / 2, "pared_zona_taza"); });
    add(rbox(7, 2.2, 5, 0.6), M.matte, 0, cupTop - 1.4, 20.5, "cabezal_boquillas");
    [-1.1, 1.1].forEach(function (x) { add(new THREE.CylinderGeometry(0.4, 0.32, 1.2, 18), M.chrome, x, cupTop - 3, 21, "boquilla"); });
    add(new THREE.CylinderGeometry(0.3, 0.3, 1, 16), M.steel, 2.8, cupTop - 3, 19.8, "boquilla_agua");
    // rejilla y borde cromado
    var bars = [];
    for (var b = 0; b < 16; b++) bars.push(placed(new THREE.BoxGeometry(0.2, 0.3, 12), -7.5 + b * 1.0, cupBot + 0.2, 21.5));
    add(merge(bars), M.steel, 0, 0, 0, "rejilla_taza");
    add(rbox(cw, 0.7, 13, 0.25), M.slot, 0, cupBot - 0.3, 21.5, "bandeja_goteo");
    add(rbox(cw + 0.4, 0.8, 1.2, 0.35), M.chrome, 0, cupBot - 0.1, FRONT - 0.4, "borde_cromado_bandeja");
    // base inferior negra
    add(panel(CW + 0.6, 10, cupBot - 0.6, 1.2, 0.35), M.piano, 0, (cupBot + 0.2) / 2, FRONT - 5, "base").rotation.x = -Math.PI / 2;
    [[-16, -24], [16, -24], [-16, 22], [16, 22]].forEach(function (p) { add(new THREE.CylinderGeometry(1.5, 1.7, 0.8, 20), M.rubber, p[0], 0.4, p[1], "pata"); });

    /* ---------------- Parte superior ---------------- */
    add(rbox(20, 5.6, 20, 2.6), M.side, 4.5, TOP + 2.9, 10, "tapa_superior");
    var hx = -10, hz = -6;
    add(rbox(12.6, 1.2, 15, 0.5), M.matte, hx, TOP + 0.6, hz, "base_contenedor");
    add(K.loft(11.6, 14, 1.4, 12.2, 14.6, 1.6, 5.6, 5), M.hopper, hx, TOP + 1.1, hz, "contenedor_granos").renderOrder = 2;
    add(rbox(12.6, 1.1, 15.2, 0.45), M.matte, hx, TOP + 7.2, hz, "tapa_contenedor");
    K.beans(160, hx, hz, 10.2, 12.6, TOP + 1.5, 2.8, M.beans, 9);

    /* ---------------- Costado y parte posterior (aproximados) ---------------- */
    add(rbox(0.4, 2.2, 1.2, 0.2), M.chrome, W / 2 + 0.1, 12, 18, "cerradura");
    var vents = [];
    for (var v = 0; v < 8; v++) vents.push(placed(new THREE.BoxGeometry(14, 0.45, 0.3), -6, 55 - v * 1.2, BACK - 0.05));
    add(merge(vents), M.slot, 0, 0, 0, "rejilla_posterior");
    add(rbox(4, 3, 0.8, 0.3), M.matte, 12, 8, BACK - 0.3, "conexion_electrica");
    add(new THREE.CylinderGeometry(0.9, 0.9, 1.4, 20), M.steel, 6, 5, BACK - 0.6, "conexion_agua").rotation.x = Math.PI / 2;

    K.logo(4.5, TOP + 5.72, 10, 11.5);
    return K.finish("Krea_Espresso_root");
  };
})();
