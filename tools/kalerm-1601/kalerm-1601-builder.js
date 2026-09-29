/* =====================================================================
   Kalerm 1601 · Modelo 3D procedural
   Referencias: fotografía frontal de la ficha técnica y medidas de la ficha
   (ancho 33 · alto 40 · profundidad 45 cm). Costados negros envolventes,
   columna central negra brillante, panel táctil con display, módulo
   plateado del dispensador con perilla de anillo rojo, bandeja con rejilla.
   Los costados, la parte superior y la posterior son aproximados.
   Requiere: RoundedBoxGeometry + ModelKit.  Unidades: cm.  +Z = frente.
   ===================================================================== */
(function () {
  "use strict";
  // opts.pro = true → Kalerm Pro (KLM1601 Pro): misma unidad superior sobre un
  // mueble inferior con dos cajones y contenedor de granos de 750 g.
  window.buildKalerm1601 = function (THREE, opts) {
    opts = opts || {};
    var outer = new THREE.Group(); outer.name = opts.pro ? "Kalerm_Pro" : "Kalerm_1601";
    var root = new THREE.Group(); root.name = "unidad_superior"; outer.add(root);
    var K = ModelKit(THREE, root), add = K.add, rbox = K.rbox, panel = K.panel, placed = K.placed, merge = K.merge;

    /* ---------------- Texturas ---------------- */
    function icon(g, kind, x, y, s) {
      g.save(); g.translate(x, y); g.scale(s, s); g.strokeStyle = "#e6e6e6"; g.fillStyle = "#e6e6e6"; g.lineWidth = 3;
      if (kind === "cup" || kind === "mug" || kind === "cap") {
        var h = kind === "cup" ? 16 : 24;
        g.beginPath(); g.moveTo(-10, -h / 2); g.lineTo(10, -h / 2); g.lineTo(8, h / 2); g.lineTo(-8, h / 2); g.closePath(); g.stroke();
        g.beginPath(); g.arc(13, 0, 4, -Math.PI / 2, Math.PI / 2); g.stroke();
        if (kind === "cap") { g.beginPath(); g.moveTo(-10, -h / 2 + 6); g.lineTo(10, -h / 2 + 6); g.stroke(); }
      } else if (kind === "steam") {
        g.beginPath(); g.moveTo(-8, 12); g.lineTo(8, 12); g.lineTo(4, -6); g.lineTo(-4, -6); g.closePath(); g.stroke();
        for (var i = -1; i <= 1; i++) { g.beginPath(); g.moveTo(i * 5, -10); g.quadraticCurveTo(i * 5 + 4, -15, i * 5, -20); g.stroke(); }
      } else if (kind === "water") {
        g.beginPath(); g.moveTo(-9, -12); g.lineTo(9, -12); g.lineTo(7, 12); g.lineTo(-7, 12); g.closePath(); g.stroke();
        g.beginPath(); g.moveTo(-8, -2); g.lineTo(8, -2); g.stroke();
      } else if (kind === "drop") {
        g.beginPath(); g.moveTo(0, -13); g.quadraticCurveTo(11, 2, 0, 12); g.quadraticCurveTo(-11, 2, 0, -13); g.stroke();
      } else if (kind === "power") {
        g.beginPath(); g.arc(0, 0, 16, 0, Math.PI * 2); g.stroke();
        g.beginPath(); g.arc(0, 2, 8, -Math.PI * 0.2, Math.PI * 1.2, false); g.stroke(); g.beginPath(); g.moveTo(0, -9); g.lineTo(0, 1); g.stroke();
      } else if (kind === "list") {
        g.beginPath(); g.arc(0, 0, 16, 0, Math.PI * 2); g.stroke();
        for (var j = -1; j <= 1; j++) { g.beginPath(); g.moveTo(-7, j * 6); g.lineTo(7, j * 6); g.stroke(); }
      }
      g.restore();
    }
    function panelTexture() {   // vidrio negro del panel táctil
      var W = 512, H = 440, c = K.canvas(W, H), g = c.getContext("2d");
      var bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, "#111214"); bg.addColorStop(1, "#060607");
      g.fillStyle = bg; g.fillRect(0, 0, W, H);
      g.textAlign = "center"; g.fillStyle = "#d9d9d9"; g.font = "600 17px Arial, Helvetica, sans-serif";
      [["cup", "ESPRESSO", 60], ["mug", "COFFEE", 140], ["cap", "CAPPUCCINO", 220]].forEach(function (a) { icon(g, a[0], 44, a[2], 1.1); g.fillText(a[1], 44, a[2] + 34); });
      [["steam", "STEAM", 60], ["water", "HOT WATER", 140], ["drop", "MENU/OK", 220]].forEach(function (a) { icon(g, a[0], W - 44, a[2], 1.1); g.fillText(a[1], W - 44, a[2] + 34); });
      icon(g, "power", 44, 330, 1.1); icon(g, "list", W - 44, 330, 1.1);
      return K.canvasTexture(c, true, true);
    }
    function lcdTexture() {
      var W = 320, H = 110, c = K.canvas(W, H), g = c.getContext("2d");
      var bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, "#d9ecff"); bg.addColorStop(1, "#a9cdf2");
      g.fillStyle = bg; g.fillRect(0, 0, W, H);
      g.strokeStyle = "#1c56b8"; g.fillStyle = "#1c56b8"; g.lineWidth = 3;
      g.beginPath(); g.moveTo(W / 2 - 14, 22); g.lineTo(W / 2 + 14, 22); g.lineTo(W / 2 + 11, 52); g.lineTo(W / 2 - 11, 52); g.closePath(); g.stroke();
      g.beginPath(); g.arc(W / 2 + 18, 36, 6, -Math.PI / 2, Math.PI / 2); g.stroke();
      g.font = "600 22px Arial, Helvetica, sans-serif"; g.textAlign = "center"; g.fillText("READY", W / 2, 88);
      return K.canvasTexture(c, true, true);
    }

    /* ---------------- Materiales ---------------- */
    var BR = K.brushedMaps(31, 1600);
    var M = {
      shell: K.mat.phys({ name: "costado_negro", color: 0x151517, roughness: 0.5, metalness: 0.1, clearcoat: 0.25, clearcoatRoughness: 0.4 }),
      piano: K.mat.phys({ name: "negro_brillante", color: 0x060607, roughness: 0.1, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.04 }),
      matte: K.mat.std({ name: "plastico_negro_mate", color: 0x111112, roughness: 0.8 }),
      glass: K.mat.phys({ name: "panel_tactil", color: 0xffffff, roughness: 0.06, clearcoat: 1, clearcoatRoughness: 0.02 }),
      lcd: K.mat.std({ name: "display", color: 0x000000, emissive: 0xffffff, emissiveIntensity: 1, roughness: 0.25 }),
      alu: K.mat.std({ name: "aluminio_cepillado", color: 0xaab0b7, metalness: 1, roughness: 1, roughnessMap: K.repeatTex(BR.orm, 0.5, 0.5), normalMap: K.repeatTex(BR.normal, 0.5, 0.5), normalScale: new THREE.Vector2(0.25, 0.25) }),
      chrome: K.mat.std({ name: "cromado", color: 0xf2f2f2, metalness: 1, roughness: 0.07 }),
      steel: K.mat.std({ name: "acero_inoxidable", color: 0xc9ccd0, metalness: 1, roughness: 0.3 }),
      led: K.mat.std({ name: "led_rojo", color: 0x400000, emissive: 0xff2a1a, emissiveIntensity: 1.6, roughness: 0.4 }),
      slot: K.mat.std({ name: "ranura", color: 0x040404, roughness: 1 }),
      rubber: K.mat.std({ name: "goma", color: 0x0b0b0b, roughness: 0.95 }),
      lid: K.mat.phys({ name: "tapa_ahumada", color: 0x8d949b, roughness: 0.08, transmission: 0.85, thickness: 0.6 }),
      beans: K.mat.std({ name: "granos_cafe", color: 0x3d2416, roughness: 0.45 })
    };
    M.alu.metalnessMap = M.alu.roughnessMap;
    M.glass.map = panelTexture();
    M.lcd.emissiveMap = lcdTexture();

    /* =================================================================
       Medidas (cm): x ±16,5 · y 0→38,9 (+ tapa → 40) · z −22,5 → 22,5
       ================================================================= */
    var TOP = 38.9, W = 33, BACK = -22.5, WF = 20.5, CF = 18.6, trayTop = 7.2, wing = 7.7;

    // Cuerpo trasero y costados envolventes
    add(rbox(W - 1, TOP - 1, 26.5, 1.2), M.shell, 0, (TOP + 1) / 2, BACK + 13.25, "cuerpo");
    [-1, 1].forEach(function (s) {
      add(rbox(wing, TOP - 6.2, WF - BACK, 2.2, 3), M.shell, s * (W / 2 - wing / 2), (TOP + 6.2) / 2, (WF + BACK) / 2, s < 0 ? "costado_izq" : "costado_der");
    });
    [-1, 1].forEach(function (s) { add(rbox(wing, 7, 26.5, 1.2), M.shell, s * (W / 2 - wing / 2), 4.4, BACK + 13.25, "costado_inferior"); });
    // Estanque de agua en el costado izquierdo (se retira hacia arriba)
    var tankM = K.mat.phys({ name: "estanque_agua", color: 0x6c737b, roughness: 0.12, metalness: 0, transmission: 0.6, thickness: 0.8 });
    add(rbox(0.6, 26, 31, 1.2), tankM, -W / 2 - 0.15, 22.4, -2.5, "estanque_agua");
    add(rbox(0.4, 26.8, 31.8, 1.4), M.slot, -W / 2 + 0.05, 22.4, -2.5, "marco_estanque");
    add(rbox(0.5, 16, 1.4, 0.6), M.slot, -W / 2 - 0.3, 23, -13.5, "agarre_estanque");
    add(rbox(0.3, 0.25, 26, 0.1), K.mat.std({ name: "nivel_agua", color: 0x55606b, roughness: 0.4 }), -W / 2 - 0.35, 16, -1, "nivel_agua");
    // Columna central negra brillante
    var cw = W - 2 * wing + 0.4;
    // parte superior (panel) y nicho inferior para el vaso o la taza (fondo en z = 9)
    var nicheTop = 21.5, nicheBack = 9;
    add(rbox(cw, TOP - nicheTop, CF + 2, 0.8), M.piano, 0, (TOP + nicheTop) / 2, CF / 2 - 1, "columna_central");
    add(rbox(cw, nicheTop - 6.2, nicheBack + 2, 0.6), M.piano, 0, (nicheTop + 6.2) / 2, nicheBack / 2 - 1, "fondo_nicho_taza");
    add(rbox(cw + 0.2, 1.4, 2 * WF, 0.6), M.matte, 0, TOP - 0.6, 0, "techo_central");

    // Panel táctil y display
    var py = 30.7;
    add(rbox(17.2, 14.8, 0.4, 0.8), M.glass, 0, py, CF + 0.1, "panel_tactil");
    add(new THREE.PlaneGeometry(8.1, 2.8), M.lcd, 0, 34.8, CF + 0.32, "display");

    // Módulo plateado del dispensador con perilla de anillo rojo
    add(rbox(8.5, 10.9, 3.2, 1.4, 3), M.alu, 0, 27.15, CF + 1.3, "modulo_dispensador");
    var knob = add(new THREE.CylinderGeometry(1.75, 1.8, 1.2, 40), M.piano, 0, 29.9, CF + 3.2, "perilla"); knob.rotation.x = Math.PI / 2;
    var ring = add(new THREE.TorusGeometry(1.75, 0.2, 12, 48), M.led, 0, 29.9, CF + 3.5, "led_anillo"); ring.rotation.z = 0;
    var rim = add(new THREE.TorusGeometry(2.05, 0.14, 10, 48), M.chrome, 0, 29.9, CF + 3.0, "aro_perilla");
    add(new THREE.CylinderGeometry(0.9, 0.9, 0.3, 32), M.chrome, 0, 29.9, CF + 3.85, "centro_perilla").rotation.x = Math.PI / 2;
    // cabezal ajustable de las boquillas
    add(rbox(7.2, 2.4, 5.4, 1), M.alu, 0, 21.0, 17.6, "cabezal_boquillas");
    [-1, 1].forEach(function (s) { add(new THREE.CylinderGeometry(0.4, 0.32, 1, 18), M.chrome, s * 1.1, 19.4, 17.2, "boquilla"); });
    add(new THREE.CylinderGeometry(0.34, 0.3, 1.2, 18), M.steel, 0, 19.3, 18.9, "boquilla_leche");

    /* ---------------- Bandeja de goteo ---------------- */
    var tray = add(K.profile([[4, trayTop], [21.6, trayTop], [22.5, trayTop - 0.9], [22.5, 1.6], [21.4, 0.6], [4, 0.6]], 31.2, 0.45), M.piano, 0, 0, 0, "bandeja_goteo");
    var bars = [];
    for (var b = 0; b < 13; b++) bars.push(placed(rbox(cw - 1.2, 0.28, 0.45, 0.12), 0, trayTop + 0.6, 9.8 + b * 1.0));   // rejilla del nicho
    bars.push(placed(rbox(26, 0.25, 0.25, 0.1), 0, trayTop - 1.4, 23.05), placed(rbox(26, 0.25, 0.25, 0.1), 0, trayTop - 2.6, 23.05), placed(rbox(26, 0.25, 0.25, 0.1), 0, trayTop - 3.8, 23.05));
    add(merge(bars), M.chrome, 0, 0, 0, "rejilla_bandeja");
    add(rbox(0.5, 0.5, 0.3, 0.15), M.steel, 14, trayTop - 1.2, 23.05, "indicador_flotador");
    if (!opts.pro) [[-13, -19], [13, -19], [-13, 18], [13, 18]].forEach(function (p) { add(new THREE.CylinderGeometry(1.3, 1.5, 0.6, 20), M.rubber, p[0], 0.3, p[1], "pata"); });

    /* ---------------- Parte superior: tapa ahumada del contenedor de granos ---------------- */
    if (!opts.pro) {
      add(rbox(14.4, 0.12, 12.4, 0.05), M.slot, 0.6, TOP + 0.08, -6, "hueco_contenedor");
      K.beans(90, 0.6, -6, 12.2, 10.2, TOP + 0.2, 0.3, M.beans, 13);
      add(rbox(15.6, 1.1, 13.4, 1.2), M.lid, 0.6, TOP + 0.6, -6, "tapa_contenedor");
    } else {   // contenedor de granos alto (750 g) de la Kalerm Pro
      var hop = K.mat.phys({ name: "contenedor_ahumado", color: 0xb5bac0, roughness: 0.06, transmission: 0.9, thickness: 0.3, side: THREE.DoubleSide });
      add(rbox(15.4, 1, 13.4, 0.8), M.matte, 0.6, TOP + 0.4, -6, "base_contenedor");
      add(K.loft(14.2, 12.2, 1.4, 15, 13, 1.6, 7.2, 5), hop, 0.6, TOP + 0.8, -6, "contenedor_granos").renderOrder = 2;
      K.beans(260, 0.6, -6, 12.8, 10.8, TOP + 1.2, 3.4, M.beans, 17);
      add(rbox(15.6, 0.9, 13.6, 0.6), M.lid, 0.6, TOP + 8.4, -6, "tapa_contenedor");
    }
    add(rbox(6, 0.4, 5, 0.6), M.matte, 9.5, TOP + 0.2, 10.5, "tapa_cafe_molido");

    /* ---------------- Parte posterior (aproximada) ---------------- */
    var vents = [];
    for (var v = 0; v < 6; v++) vents.push(placed(new THREE.BoxGeometry(10, 0.4, 0.3), -5, 30 - v * 1.1, BACK - 0.05));
    add(merge(vents), M.slot, 0, 0, 0, "rejilla_posterior");
    add(rbox(3, 2.4, 0.6, 0.25), M.matte, 10, 5, BACK - 0.2, "conexion_electrica");

    K.logo(-1.2, TOP + 0.12, 11, 9);
    if (opts.pro) {
      /* Mueble inferior con dos cajones (estanque / conexión a bidón) */
      var BH = 27.25, bz = 0;   // altura total según ficha: 75 cm
      root.position.y = BH;
      add(rbox(W, BH - 0.8, 45, 1.2), M.shell, 0, (BH + 0.8) / 2, bz, "mueble_inferior", outer);
      add(rbox(W - 0.6, 0.5, 44, 0.2), M.slot, 0, BH - 0.1, bz, "union_mueble", outer);
      [[-5.8, 19.2], [9.9, 11.4]].forEach(function (d, i) {
        add(panel(d[1], BH - 3.8, 0.8, 0.8, 0.3), M.piano, d[0], BH / 2, 22.6, i ? "cajon_derecho" : "cajon_izquierdo", outer);
        add(rbox(d[1] - 4, 0.9, 1.2, 0.35), M.matte, d[0], 2.3, 22.9, "tirador", outer);
      });
      add(new THREE.BoxGeometry(0.25, BH - 3.8, 0.4), M.slot, 4.1, BH / 2, 22.7, "division_cajones", outer);
      add(new THREE.CylinderGeometry(0.7, 0.7, 1.2, 20), M.matte, -10, 4, -23, "conexion_bidon", outer).rotation.x = Math.PI / 2;
      [[-13, -19], [13, -19], [-13, 18], [13, 18]].forEach(function (p) { add(new THREE.CylinderGeometry(1.3, 1.5, 0.8, 20), M.rubber, p[0], 0.4, p[1], "pata", outer); });
    }
    outer.traverse(function (o) { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    outer.scale.setScalar(0.01);
    var wrap = new THREE.Group(); wrap.name = outer.name + "_root"; wrap.add(outer);
    return wrap;
  };
  window.buildKalermPro = function (THREE) { return window.buildKalerm1601(THREE, { pro: true }); };
})();
