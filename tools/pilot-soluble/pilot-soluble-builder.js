/* =====================================================================
   Pilot Soluble · Modelo 3D procedural (diseño Corporate Coffee)
   Referencias: fotografía de la ficha técnica (diseño: pantalla con logo
   Corporate Coffee, display azul, rótulos, placa «iPilot», cuerpo negro)
   y fotografías del fabricante iPilot (proporciones, cerradura y
   ventilación lateral). Medidas de la ficha: 33 × 65 × 60 cm.
   Requiere: RoundedBoxGeometry + ModelKit.  Unidades: cm.  +Z = frente.
   ===================================================================== */
(function () {
  "use strict";
  window.buildPilotSoluble = function (THREE) {
    var root = new THREE.Group(); root.name = "Pilot_Soluble";
    var K = ModelKit(THREE, root), add = K.add, rbox = K.rbox, panel = K.panel, placed = K.placed, merge = K.merge;

    /* ---------------- Texturas ---------------- */
    function displayTexture() {
      var W = 320, H = 96, c = K.canvas(W, H), g = c.getContext("2d");
      var bg = g.createLinearGradient(0, 0, W, 0); bg.addColorStop(0, "#1d2a8a"); bg.addColorStop(1, "#2f3fc4");
      g.fillStyle = bg; g.fillRect(0, 0, W, H);
      g.fillStyle = "#e9edff"; g.font = "700 46px Arial, Helvetica, sans-serif"; g.textAlign = "center"; 
      return K.canvasTexture(c, true, true);
    }
    var LABELS = ["ESPRESSO", "BLACK", "COFFEE", "MILK", "CAPPUCCINO", "CHOCOLATE", "HOT WATER", "LATTE MACCHIATO"];
    function labelAtlas() {   // 2 columnas × 4 filas (rótulos tipo «píldora»)
      var CW = 512, CH = 160, c = K.canvas(CW * 2, CH * 4), g = c.getContext("2d");
      g.fillStyle = "#0a0a0b"; g.fillRect(0, 0, c.width, c.height);
      LABELS.forEach(function (l, i) {
        var col = i % 2, row = Math.floor(i / 2), x = col * CW, y = row * CH;
        g.strokeStyle = "#8d9096"; g.lineWidth = 6; K.roundRect(g, x + 14, y + 22, CW - 28, CH - 44, (CH - 44) / 2); g.stroke();
        g.fillStyle = "#f1f1f1"; g.font = (l.length > 12 ? "600 46px" : "600 58px") + " Arial, Helvetica, sans-serif"; g.textAlign = "center"; g.fillText(l, x + CW / 2, y + CH / 2 + 22);
      });
      return K.canvasTexture(c, true, true);
    }
    function plateTexture() {   // placa cromada «Pilot ESPRESSO»
      var W = 512, H = 160, c = K.canvas(W, H), g = c.getContext("2d");
      var bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, "#f2f3f5"); bg.addColorStop(0.5, "#b9bdc3"); bg.addColorStop(1, "#e6e8eb");
      g.fillStyle = bg; g.fillRect(0, 0, W, H);
      g.fillStyle = "#2a2c30"; g.textAlign = "center";
      g.font = "italic 800 64px Arial, Helvetica, sans-serif"; g.fillText("iPilot", W / 2 + 22, 100);
      for (var k = 0; k < 4; k++) { g.beginPath(); g.moveTo(W / 2 - 112 + k * 6, 66 + k * 6); g.lineTo(W / 2 - 58, 84); g.lineTo(W / 2 - 112 + k * 6, 102 - k * 2); g.lineWidth = 3; g.strokeStyle = "#2a2c30"; g.stroke(); }
      
      return K.canvasTexture(c, true, true);
    }

    /* ---------------- Materiales ---------------- */
    var BR = K.brushedMaps(41, 1500);
    var M = {
      side: K.mat.phys({ name: "costado_negro", color: 0x141416, roughness: 0.42, metalness: 0.1, clearcoat: 0.3, clearcoatRoughness: 0.3 }),
      piano: K.mat.phys({ name: "negro_brillante", color: 0x060607, roughness: 0.1, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.04 }),
      glass: K.mat.phys({ name: "vidrio_frontal", color: 0x0b0c0e, roughness: 0.04, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.02 }),
      matte: K.mat.std({ name: "plastico_negro_mate", color: 0x111112, roughness: 0.8 }),
      screen: K.mat.std({ name: "display_pantalla", color: 0x050608, emissive: 0x0d0f12, roughness: 0.15 }),
      disp: K.mat.std({ name: "display", color: 0x000000, emissive: 0xffffff, emissiveIntensity: 1, roughness: 0.25 }),
      labels: K.mat.phys({ name: "rotulos", color: 0xffffff, roughness: 0.12, clearcoat: 1 }),
      plate: K.mat.std({ name: "placa_pilot", color: 0xffffff, metalness: 0.6, roughness: 0.25 }),
      inox: K.mat.std({ name: "acero_cepillado", color: 0xb9bdc2, metalness: 1, roughness: 1, roughnessMap: K.repeatTex(BR.orm, 0.6, 0.6), normalMap: K.repeatTex(BR.normal, 0.6, 0.6), normalScale: new THREE.Vector2(0.3, 0.3) }),
      chrome: K.mat.std({ name: "cromado", color: 0xf2f2f2, metalness: 1, roughness: 0.07 }),
      steel: K.mat.std({ name: "acero_inoxidable", color: 0xc9ccd0, metalness: 1, roughness: 0.3 }),
      btn: K.mat.std({ name: "boton_plateado", color: 0xe4e6e9, metalness: 0.8, roughness: 0.25 }),
      led: K.mat.std({ name: "led_azul", color: 0x0a1a66, emissive: 0x2f5bff, emissiveIntensity: 1.8, roughness: 0.4 }),
      slot: K.mat.std({ name: "ranura", color: 0x040404, roughness: 1 }),
      rubber: K.mat.std({ name: "goma", color: 0x0b0b0b, roughness: 0.95 }),
      hopper: K.mat.phys({ name: "contenedor_ahumado", color: 0xc4c8cc, roughness: 0.06, transmission: 0.9, thickness: 0.3, side: THREE.DoubleSide }),
      beans: K.mat.std({ name: "granos_cafe", color: 0x3d2416, roughness: 0.45 })
    };
    M.inox.metalnessMap = M.inox.roughnessMap;
    M.disp.emissiveMap = displayTexture();
    M.labels.map = labelAtlas();
    M.plate.map = plateTexture();

    /* =================================================================
       Medidas (cm): x ±16,5 · y 0→72,8 (+ contenedor → 80) · z −30 → 30
       ================================================================= */
    var W = 33, TOP = 65, BACK = -30, FRONT = 22, nicheBack = 9, nTop = 21.3, nBot = 6.4, nw = 29;

    // Gabinete de costados claros (detrás del nicho) y rellenos laterales / superior
    add(rbox(W, TOP - 0.8, nicheBack - BACK, 1.2), M.side, 0, (TOP + 0.8) / 2, (nicheBack + BACK) / 2, "gabinete");
    [-1, 1].forEach(function (s) { add(rbox((W - nw) / 2 + 0.6, TOP - 0.8, FRONT - nicheBack + 0.5, 0.8), M.side, s * (W / 2 - (W - nw) / 4 - 0.15), (TOP + 0.8) / 2, (FRONT + nicheBack) / 2 - 0.25, "costado_frontal"); });
    add(new THREE.BoxGeometry(nw, TOP - nTop - 0.5, FRONT - nicheBack), M.side, 0, (TOP + nTop) / 2, (FRONT + nicheBack) / 2, "bloque_superior");
    // Marco frontal negro brillante
    add(panel(W, TOP - nTop + 0.6, 1.2, 1.6, 0.4), M.piano, 0, (TOP + nTop) / 2 - 0.3, FRONT + 0.5, "frente_superior");
    [-1, 1].forEach(function (s) { add(rbox((W - nw) / 2, nTop - nBot, 1.2, 0.4), M.piano, s * (W / 2 - (W - nw) / 4), (nTop + nBot) / 2, FRONT + 0.5, "marco_nicho"); });

    // Cabezal: panel de vidrio negro con pantalla 10,1", display y botones
    var hy = (TOP + 26.9) / 2, hh = TOP - 26.9;
    add(panel(30, hh, 3, 2.6, 0.8), M.piano, 0, hy, FRONT + 2.4, "cabezal");
    add(panel(29, hh - 1, 0.3, 2.2, 0.1), M.glass, 0, hy, FRONT + 3.95, "vidrio_cabezal");
    add(new THREE.PlaneGeometry(25.6, 13.2), M.screen, 0, 53.1, FRONT + 4.12, "pantalla");
    var lg = K.logo(0, 53.1, FRONT + 4.14, 10.5); lg.rotation.x = 0;   // pantalla con el logo Corporate Coffee
    add(rbox(8.4, 2.6, 0.3, 0.3), M.matte, 0, 41.7, FRONT + 4.1, "marco_display");
    add(new THREE.PlaneGeometry(7.8, 2.0), M.disp, 0, 41.7, FRONT + 4.27, "display");
    // franja de luz azul en el borde derecho del cabezal
    // cerradura y rejilla de ventilación en el costado izquierdo (según fotos del fabricante)
    add(new THREE.CylinderGeometry(0.9, 0.9, 0.5, 24), M.chrome, -W / 2 - 0.1, 52, 14, "cerradura").rotation.z = Math.PI / 2;
    var sv = [];
    for (var k = 0; k < 9; k++) sv.push(placed(new THREE.BoxGeometry(0.3, 0.45, 12), -W / 2 - 0.05, 22 - k * 1.1, -14));
    add(merge(sv), M.slot, 0, 0, 0, "ventilacion_lateral");
    // botones: rótulos (2 columnas) y pulsadores plateados
    var rows = [37.4, 34.8, 32.2, 29.6];
    rows.forEach(function (y, r) {
      [-1, 1].forEach(function (s, col) {
        var pg = new THREE.PlaneGeometry(7.3, 2.3), uv = pg.attributes.uv;
        for (var i = 0; i < uv.count; i++) uv.setXY(i, (col + uv.getX(i)) / 2, 1 - (r + 1 - uv.getY(i)) / 4);
        add(pg, M.labels, s * 8.0, y, FRONT + 4.12, "rotulo_" + (r * 2 + col + 1));
      });
    });
    var btns = [];
    rows.forEach(function (y) { [-1.6, 1.6].forEach(function (x) { btns.push(placed(new THREE.CylinderGeometry(0.62, 0.66, 0.5, 24), x, y, FRONT + 4.25, Math.PI / 2)); }); });
    add(merge(btns), M.btn, 0, 0, 0, "pulsadores");

    /* ---------------- Dispensador y nicho de la taza ---------------- */
    add(rbox(15.2, 3.4, 4.6, 0.8), M.piano, 0, nTop + 1.9, FRONT - 0.6, "cabezal_dispensador");
    add(rbox(14.4, 3.3, 0.4, 0.3), M.chrome, 0, nTop + 2.1, FRONT + 2.05, "marco_placa");
    add(new THREE.PlaneGeometry(13.6, 2.9), M.plate, 0, nTop + 2.1, FRONT + 2.27, "placa_ipilot");
    [-1, 1].forEach(function (s) { add(new THREE.BoxGeometry(0.3, nTop - nBot, 7), M.piano, s * 14.35, (nTop + nBot) / 2, FRONT - 3.5, "pared_nicho"); });
    [-1.2, 1.2].forEach(function (x) { add(new THREE.CylinderGeometry(0.42, 0.34, 1.2, 18), M.chrome, x, nTop - 0.3, FRONT - 1.2, "boquilla"); });
    add(new THREE.CylinderGeometry(0.32, 0.3, 1.1, 16), M.steel, 3, nTop - 0.2, FRONT - 1.6, "boquilla_agua");
    // fondo de acero en tres planos (centro y laterales en ángulo)
    var nh = nTop - nBot;
    add(rbox(9.6, nh, 0.4, 0.1), M.inox, 0, (nTop + nBot) / 2, nicheBack + 0.4, "fondo_centro");
    [-1, 1].forEach(function (s) {
      var p = add(rbox(10.4, nh, 0.4, 0.1), M.inox, s * 9.3, (nTop + nBot) / 2, nicheBack + 3.6, "fondo_lateral");
      p.rotation.y = -s * 0.62;
    });
    add(new THREE.BoxGeometry(nw, 0.4, FRONT - nicheBack), M.piano, 0, nTop + 0.2, (FRONT + nicheBack) / 2, "techo_nicho");

    /* ---------------- Bandeja de goteo (sobresale y con esquinas redondeadas) ---------------- */
    var tray = add(panel(34, 22, 5.6, 4.5, 0.6), M.piano, 0, 3.3, 19, "bandeja_goteo"); tray.rotation.x = -Math.PI / 2;
    var rim = add(panel(34.4, 22.4, 0.6, 4.7, 0.25, [[32.4, 20.4, 3.8, 0, 0]]), M.chrome, 0, 6.25, 19, "aro_cromado"); rim.rotation.x = -Math.PI / 2;
    var bars = [];
    for (var b = 0; b < 26; b++) bars.push(placed(new THREE.BoxGeometry(31, 0.26, 0.22), 0, 6.75, 9.6 + b * 0.72));
    [-10, -3.4, 3.4, 10].forEach(function (x) { bars.push(placed(new THREE.BoxGeometry(0.26, 0.3, 18.6), x, 6.8, 18.6)); });
    add(merge(bars), M.steel, 0, 0, 0, "rejilla_bandeja");
    [[-13, -26], [13, -26], [-13, 6], [13, 6]].forEach(function (p) { add(new THREE.CylinderGeometry(1.4, 1.6, 0.8, 20), M.rubber, p[0], 0.4, p[1], "pata"); });

    /* ---------------- Contenedor de granos y logotipo superior ---------------- */
    K.logo(0, TOP + 0.05, 2, 15);   // sin contenedor de granos: logotipo centrado arriba

    /* ---------------- Parte posterior (aproximada) ---------------- */
    var vents = [];
    for (var v = 0; v < 8; v++) vents.push(placed(new THREE.BoxGeometry(14, 0.45, 0.3), 0, 54 - v * 1.2, BACK - 0.05));
    add(merge(vents), M.slot, 0, 0, 0, "rejilla_posterior");
    add(rbox(4, 3, 0.8, 0.3), M.matte, 10, 8, BACK - 0.3, "conexion_electrica");
    add(new THREE.CylinderGeometry(0.9, 0.9, 1.4, 20), M.steel, 4, 5, BACK - 0.6, "conexion_agua").rotation.x = Math.PI / 2;

    return K.finish("Pilot_Soluble_root");
  };
})();
