/* =====================================================================
   Necta Krea Touch · Modelo 3D procedural
   Referencias: fotografía frontal de la ficha técnica y documentación
   pública de Evoca/Necta (ancho 41 · alto 75 · profundidad 57 cm; pantalla
   táctil HD de 7", marcos cromados, superficies negras brillantes,
   iluminación decorativa azul, costados gris carbón).
   Los costados y la parte posterior son aproximados.
   Requiere: RoundedBoxGeometry + ModelKit.  Unidades: cm.  +Z = frente.
   ===================================================================== */
(function () {
  "use strict";
  window.buildNectaKreaTouch = function (THREE) {
    var root = new THREE.Group(); root.name = "Necta_Krea_Touch";
    var K = ModelKit(THREE, root), add = K.add, rbox = K.rbox, panel = K.panel, placed = K.placed, merge = K.merge;

    /* ---------------- Texturas ---------------- */
    function screenTexture() {
      var W = 1280, H = 784, c = K.canvas(W, H), g = c.getContext("2d");
      var bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, "#d9e6ef"); bg.addColorStop(1, "#9fbdd2");
      g.fillStyle = bg; g.fillRect(0, 0, W, H);
      g.fillStyle = "rgba(255,255,255,.35)"; g.beginPath(); g.ellipse(W / 2, H * 0.62, W * 0.42, H * 0.2, 0, 0, Math.PI * 2); g.fill();
      for (var i = 0; i < 5; i++) { g.fillStyle = i === 2 ? "#ffffff" : "rgba(255,255,255,.7)"; g.beginPath(); g.arc(W / 2 - 200 + i * 100, 70, i === 2 ? 16 : 11, 0, Math.PI * 2); g.fill(); }
      g.strokeStyle = "rgba(40,60,80,.55)"; g.lineWidth = 6; g.lineCap = "round";
      g.beginPath(); g.moveTo(70, 360); g.lineTo(45, 392); g.lineTo(70, 424); g.stroke();
      g.beginPath(); g.moveTo(W - 70, 360); g.lineTo(W - 45, 392); g.lineTo(W - 70, 424); g.stroke();
      cup(g, 300, 470, 0.8, "#2c170b", false); cup(g, W / 2, 500, 1.35, "#d9b48b", true); glass(g, W - 300, 480, 0.95);
      g.fillStyle = "#2b3e50"; g.textAlign = "center"; g.font = "500 34px Arial, Helvetica, sans-serif";
      g.fillText("Espresso", 300, 580); g.fillText("Latte macchiato", W - 300, 580);
      g.font = "600 42px Arial, Helvetica, sans-serif"; g.fillText("Cappuccino", W / 2, 620);
      g.fillStyle = "rgba(43,62,80,.6)"; g.font = "500 26px Arial, Helvetica, sans-serif"; g.fillText("0,50   ▶", W / 2, 720);
      return K.canvasTexture(c, true, true);
    }
    function cup(g, cx, by, s, liquid, foam) {
      var w = 150 * s, h = 95 * s;
      g.fillStyle = "rgba(0,0,0,.15)"; g.beginPath(); g.ellipse(cx, by + 6, w * 0.9, 12 * s, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#f7f7f5"; g.beginPath(); g.ellipse(cx, by, w * 0.85, 14 * s, 0, 0, Math.PI * 2); g.fill();
      var bd = g.createLinearGradient(cx - w / 2, 0, cx + w / 2, 0); bd.addColorStop(0, "#dedede"); bd.addColorStop(0.35, "#ffffff"); bd.addColorStop(1, "#cfcfcf");
      g.fillStyle = bd; g.beginPath(); g.moveTo(cx - w / 2, by - h); g.lineTo(cx + w / 2, by - h); g.quadraticCurveTo(cx + w / 2 - 6, by, cx, by); g.quadraticCurveTo(cx - w / 2 + 6, by, cx - w / 2, by - h); g.fill();
      g.fillStyle = foam ? "#f1e3cf" : liquid; g.beginPath(); g.ellipse(cx, by - h, w / 2, 12 * s, 0, 0, Math.PI * 2); g.fill();
      if (foam) { g.fillStyle = "#c79b6d"; g.beginPath(); g.ellipse(cx, by - h, w / 5, 5 * s, 0, 0, Math.PI * 2); g.fill(); }
      g.strokeStyle = "#e4e4e0"; g.lineWidth = 12 * s; g.beginPath(); g.ellipse(cx + w / 2 + 14 * s, by - h * 0.55, 18 * s, 26 * s, 0, -Math.PI / 2, Math.PI / 2); g.stroke();
    }
    function glass(g, cx, by, s) {
      var w = 90 * s, h = 190 * s;
      g.fillStyle = "rgba(0,0,0,.14)"; g.beginPath(); g.ellipse(cx, by + 6, w * 0.8, 10, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#fbf7f0"; g.fillRect(cx - w / 2, by - h, w, h * 0.35);
      g.fillStyle = "#c49a6c"; g.fillRect(cx - w / 2, by - h * 0.65, w, h * 0.3);
      g.fillStyle = "#f4ece0"; g.fillRect(cx - w / 2, by - h * 0.35, w, h * 0.35);
      g.strokeStyle = "rgba(255,255,255,.9)"; g.lineWidth = 3; g.strokeRect(cx - w / 2, by - h, w, h);
    }
    function glassPanelTexture() {  // vidrio negro bajo la pantalla con logotipos
      var W = 512, H = 720, c = K.canvas(W, H), g = c.getContext("2d");
      var bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, "#0c0d0f"); bg.addColorStop(1, "#050506");
      g.fillStyle = bg; g.fillRect(0, 0, W, H);
      g.fillStyle = "#b9bdc2"; g.font = "300 44px Arial, Helvetica, sans-serif"; g.textAlign = "center";
      g.fillText("K R E A", W / 2, 70);
      // logotipo NECTA
      g.fillStyle = "#e9ecef"; g.save(); g.translate(W / 2 - 118, 490);
      g.beginPath(); g.moveTo(0, 0); g.lineTo(34, -10); g.lineTo(34, 30); g.lineTo(0, 40); g.closePath(); g.fill();
      g.fillStyle = "#0a0a0b"; for (var k = 0; k < 4; k++) g.fillRect(6, -2 + k * 10, 22, 3); g.restore();
      g.fillStyle = "#e9ecef"; g.font = "700 50px Arial, Helvetica, sans-serif"; g.textAlign = "left"; g.fillText("NECTA", W / 2 - 72, 528);
      return K.canvasTexture(c, true, true);
    }

    /* ---------------- Materiales ---------------- */
    var BR = K.brushedMaps(11, 500);
    var M = {
      carbon: K.mat.std({ name: "costado_gris_carbon", color: 0x3b3d42, metalness: 1, roughness: 1, roughnessMap: K.repeatTex(BR.orm, 1.4, 1.4), normalMap: K.repeatTex(BR.normal, 1.4, 1.4), normalScale: new THREE.Vector2(0.2, 0.2) }),
      piano: K.mat.phys({ name: "negro_brillante", color: 0x060607, roughness: 0.1, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.04 }),
      satin: K.mat.phys({ name: "negro_satinado", color: 0x121214, roughness: 0.45, metalness: 0.1, clearcoat: 0.2 }),
      matte: K.mat.std({ name: "plastico_negro_mate", color: 0x111112, roughness: 0.8, metalness: 0 }),
      chrome: K.mat.std({ name: "cromado", color: 0xf0f0f0, metalness: 1, roughness: 0.08 }),
      alu: K.mat.std({ name: "marco_aluminio", color: 0xcfd2d6, metalness: 1, roughness: 0.3 }),
      steel: K.mat.std({ name: "acero_inoxidable", color: 0xc9ccd0, metalness: 1, roughness: 0.32 }),
      glass: K.mat.phys({ name: "vidrio_logos", color: 0xffffff, roughness: 0.05, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.02 }),
      display: K.mat.std({ name: "display", color: 0x000000, emissive: 0xffffff, emissiveIntensity: 1, roughness: 0.2 }),
      led: K.mat.std({ name: "led_azul", color: 0x0a1a66, emissive: 0x2a5bff, emissiveIntensity: 1.6, roughness: 0.4 }),
      ledSoft: K.mat.std({ name: "led_azul_difuso", color: 0x0b1540, emissive: 0x1f45d6, emissiveIntensity: 0.9, roughness: 0.5 }),
      white: K.mat.phys({ name: "blanco_satinado", color: 0xe9eaec, roughness: 0.35, metalness: 0, clearcoat: 0.4 }),
      wall: K.mat.phys({ name: "pared_zona_taza", color: 0xe4e8ec, roughness: 0.2, metalness: 0, transmission: 0.6, thickness: 0.3 }),
      back: K.mat.std({ name: "fondo_zona_taza", color: 0xb9bdc2, metalness: 0.9, roughness: 0.35 }),
      slot: K.mat.std({ name: "ranura", color: 0x040404, roughness: 1 }),
      rubber: K.mat.std({ name: "goma", color: 0x0b0b0b, roughness: 0.95 }),
      hopper: K.mat.phys({ name: "contenedor_ahumado", color: 0xb5bac0, roughness: 0.06, transmission: 0.9, thickness: 0.3, side: THREE.DoubleSide }),
      beans: K.mat.std({ name: "granos_cafe", color: 0x3d2416, roughness: 0.45 }),
      grey: K.mat.phys({ name: "gris_claro_satinado", color: 0xa9adb3, roughness: 0.35, metalness: 0.2, clearcoat: 0.3 })
    };
    M.carbon.metalnessMap = M.carbon.roughnessMap;
    M.display.emissiveMap = screenTexture();
    M.glass.map = glassPanelTexture();

    /* =================================================================
       Medidas generales (cm): x ±20,5 · y 0→68 (+ contenedor → 75)
       z −28,5 (atrás) → 28,5 (frente)
       ================================================================= */
    var TOP = 68, FRONT = 28.5, BACK = -28.5, W = 41;

    // Gabinete gris carbón (costados, techo y parte trasera)
    add(rbox(W, TOP - 1, 41, 1.4), M.carbon, 0, (TOP + 1) / 2, BACK + 20.5, "gabinete");
    [-1, 1].forEach(function (s) { add(rbox(1.3, TOP - 1, 10, 0.5), M.carbon, s * (W / 2 - 0.65), (TOP + 1) / 2, 16.8, "costado_frontal"); });
    add(new THREE.BoxGeometry(W - 2.6, 38.4, 9.4), M.satin, 0, (68 + 29.6) / 2, 17, "bloque_superior");
    add(rbox(W - 0.4, 1.2, 56, 0.5), M.matte, 0, TOP - 0.3, 0, "techo");

    // Puerta frontal negra brillante (parte superior) y columnas laterales
    var cupTop = 29.6, baseTop = 6.8;
    add(panel(W, TOP - cupTop, 7, 2.6, 0.6), M.piano, 0, (TOP + cupTop) / 2, FRONT - 3.5, "puerta_frontal");
    [-1, 1].forEach(function (s) {
      add(rbox(2.8, cupTop - baseTop + 0.6, 7, 0.6), M.piano, s * (W / 2 - 1.4), (cupTop + baseTop) / 2, FRONT - 3.5, s < 0 ? "columna_izq" : "columna_der");
      // iluminación azul en los bordes verticales de la puerta
      add(new THREE.BoxGeometry(0.2, TOP - baseTop - 4, 0.9), M.ledSoft, s * (W / 2 + 0.02), (TOP + baseTop) / 2 - 1, FRONT - 1.2, "led_lateral");
      add(new THREE.BoxGeometry(0.55, TOP - baseTop - 5, 0.12), M.led, s * (W / 2 - 0.75), (TOP + baseTop) / 2 - 1.5, FRONT + 0.02, "led_frontal");
    });
    // arco luminoso sobre la zona de la taza
    add(new THREE.BoxGeometry(W - 6.4, 0.3, 0.3), M.led, 0, cupTop - 0.1, FRONT - 0.3, "led_zona_taza");

    // Marco cromado de la pantalla, vidrio con logotipos y display 7"
    var sy = 48.5;
    add(panel(21.6, 29.4, 1.0, 1.4, 0.35), M.alu, 0, sy, FRONT + 0.4, "marco_pantalla");
    add(panel(22.2, 30, 0.5, 1.6, 0.2), M.chrome, 0, sy, FRONT + 0.1, "borde_cromado");
    add(rbox(19.4, 27.2, 0.3, 0.8), M.glass, 0, sy, FRONT + 1.0, "vidrio_pantalla");
    add(new THREE.PlaneGeometry(16, 9.8), M.display, 0, sy + 5, FRONT + 1.17, "display");

    /* ---------------- Zona de la taza ---------------- */
    add(new THREE.BoxGeometry(W - 5.6, cupTop - baseTop, 0.4), M.back, 0, (cupTop + baseTop) / 2, FRONT - 15.7, "fondo_zona_taza");
    add(new THREE.BoxGeometry(W - 5.6, 0.4, 16), M.satin, 0, cupTop - 0.2, FRONT - 8, "techo_zona_taza");
    [-1, 1].forEach(function (s) {
      add(new THREE.BoxGeometry(0.3, cupTop - baseTop - 3.5, 13), M.wall, s * (W / 2 - 3.6), (cupTop + baseTop) / 2 - 0.5, FRONT - 8.5, "pared_zona_taza");
    });
    // tapa blanca del dispensador y boquillas
    add(rbox(21.6, 3.8, 8, 1.2), M.white, 0, 25.6, FRONT - 4.5, "tapa_dispensador");
    add(rbox(6.5, 1.6, 4, 0.5), M.satin, 0, 23.1, FRONT - 6.5, "cabezal_boquillas");
    [-1.1, 1.1].forEach(function (x) { add(new THREE.CylinderGeometry(0.42, 0.34, 1.2, 18), M.chrome, x, 21.8, FRONT - 6.5, "boquilla"); });
    add(new THREE.CylinderGeometry(0.3, 0.3, 1, 16), M.steel, 3.2, 22, FRONT - 6.5, "boquilla_agua");
    // rejilla sobre fondo iluminado en azul
    add(new THREE.BoxGeometry(W - 6, 0.2, 14), M.ledSoft, 0, baseTop + 0.35, FRONT - 8, "piso_iluminado");
    var bars = [];
    for (var b = 0; b < 24; b++) bars.push(placed(new THREE.BoxGeometry(0.22, 0.3, 13.4), -12.7 + b * 1.1, baseTop + 0.75, FRONT - 8));
    bars.push(placed(new THREE.BoxGeometry(W - 6, 0.35, 0.5), 0, baseTop + 0.75, FRONT - 1.4));
    add(merge(bars), M.steel, 0, 0, 0, "rejilla_taza");

    /* ---------------- Base / bandeja de goteo ---------------- */
    var base = add(panel(W, 20, baseTop - 0.8, 4, 0.6), M.piano, 0, (baseTop + 0.8) / 2, FRONT + 1 - 10, "base_bandeja");
    base.rotation.x = -Math.PI / 2;
    add(new THREE.BoxGeometry(W - 1.2, 0.25, 0.3), M.grey, 0, baseTop - 0.6, FRONT + 0.95, "filo_bandeja");
    [[-17, -24], [17, -24], [-17, 16], [17, 16]].forEach(function (p) { add(new THREE.CylinderGeometry(1.5, 1.7, 0.8, 20), M.rubber, p[0], 0.4, p[1], "pata"); });

    /* ---------------- Parte superior: tapa negra y contenedor de granos ---------------- */
    add(rbox(18.8, 5.8, 20, 2.4), M.satin, 0, TOP + 3.3, 13, "tapa_superior");
    add(rbox(19, 0.9, 20.2, 0.4), M.grey, 0, TOP + 0.7, 13, "franja_tapa");
    var hx = -9.5, hz = -5;
    add(rbox(13, 1.2, 15, 0.5), M.matte, hx, TOP + 0.9, hz, "base_contenedor");
    add(K.loft(12, 14, 1.4, 12.6, 14.6, 1.6, 5.4, 5), M.hopper, hx, TOP + 1.4, hz, "contenedor_granos").renderOrder = 2;
    add(rbox(13, 1, 15, 0.45), M.matte, hx, TOP + 7.2, hz, "tapa_contenedor");
    K.beans(160, hx, hz, 10.6, 12.6, TOP + 1.8, 2.6, M.beans, 5);

    /* ---------------- Parte posterior (aproximada) ---------------- */
    var vents = [];
    for (var v = 0; v < 8; v++) vents.push(placed(new THREE.BoxGeometry(14, 0.45, 0.3), -6, 56 - v * 1.2, BACK - 0.05));
    add(merge(vents), M.slot, 0, 0, 0, "rejilla_posterior");
    add(rbox(4, 3, 0.8, 0.3), M.matte, 12, 8, BACK - 0.3, "conexion_electrica");
    add(new THREE.CylinderGeometry(0.9, 0.9, 1.4, 20), M.steel, 6, 5, BACK - 0.6, "conexion_agua").rotation.x = Math.PI / 2;

    K.logo(0, TOP + 6.22, 13, 11);
    return K.finish("Necta_Krea_Touch_root");
  };
})();
