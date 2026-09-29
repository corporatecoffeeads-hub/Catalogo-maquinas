/* =====================================================================
   OfficePreview · «Revisa cómo se vería la máquina en tu oficina»
   ---------------------------------------------------------------------
   Montaje fotográfico local: el cliente toma o sube una foto del lugar,
   ubica la máquina (imagen recortada de la ficha), ajusta tamaño, luz y
   sombra, y descarga o comparte el resultado. La foto nunca sale del
   dispositivo: todo se procesa en el navegador.
   Uso: OfficePreview.open(maquina)   (objeto de MACHINES)
   ===================================================================== */
(function () {
  "use strict";

  var dlg = null, st = null, stream = null;
  var MAX_SIDE = 1800;          // resolución máxima de trabajo y exportación
  var START = { size: 42, cx: 0.5, bottom: 0.86 };   // posición inicial (y guía de cámara)

  var I = {
    close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round"/></svg>',
    camera: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2.2l1.4-2h5.8l1.4 2h2.2A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><circle cx="12" cy="13" r="3.4" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>',
    upload: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15V4M7.5 8.5 12 4l4.5 4.5M5 15v4h14v-4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };

  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function $(sel) { return dlg.querySelector(sel); }
  function dimsText(m) {
    var d = m.specs.dims, f = function (n) { return String(n).replace(".", ","); };
    return f(d.w) + " × " + f(d.h) + " × " + f(d.d) + " cm (ancho × alto × profundidad)";
  }

  /* ---------------- Diálogo ---------------- */
  function build() {
    dlg = document.createElement("dialog");
    dlg.className = "op";
    dlg.setAttribute("aria-labelledby", "opTitle");
    dlg.innerHTML =
      '<div class="op-bar"><h2 id="opTitle">Revisa cómo se vería la máquina en tu oficina</h2>' +
        '<button type="button" class="icon-btn" data-op="close" aria-label="Cerrar">' + I.close + "</button></div>" +
      '<div class="op-body">' +
        /* Paso 1 */
        '<section class="op-step" data-step="start">' +
          '<div class="op-ref"><img alt="" id="opRefImg"><div><strong id="opRefName"></strong><span id="opRefDims"></span></div></div>' +
          '<ol class="op-tips"><li>Fotografía el lugar donde iría la máquina: un mesón, una mesa o un mueble.</li>' +
          "<li>Toma la foto de frente, a la altura de la vista y con buena luz.</li>" +
          "<li>Luego ubica la máquina, ajusta su tamaño y guarda el montaje.</li></ol>" +
          '<div class="op-actions">' +
            '<button type="button" class="btn btn-primary" data-op="camera">' + I.camera + "Tomar foto</button>" +
            '<label class="btn btn-ghost op-upload">' + I.upload + 'Subir foto<input type="file" accept="image/*" id="opFile"></label>' +
          "</div>" +
          '<input type="file" accept="image/*" capture="environment" id="opCapture" hidden>' +
          '<p class="op-msg" id="opMsg" role="status"></p>' +
          '<p class="op-privacy">La foto se procesa solo en este dispositivo; no se envía ni se guarda en ningún servidor.</p>' +
        "</section>" +
        /* Paso 2: cámara con máquina de referencia */
        '<section class="op-step" data-step="camera" hidden>' +
          '<div class="op-cam" id="opCam"><video id="opVideo" playsinline muted autoplay></video><img class="op-ghost" id="opGhost" alt="">' +
          '<p class="op-cam-tip">Encuadra el lugar de modo que la máquina de referencia quede donde iría.</p></div>' +
          '<div class="op-actions"><button type="button" class="btn btn-primary op-shoot" data-op="shoot">' + I.camera + "Capturar</button>" +
          '<button type="button" class="btn btn-ghost" data-op="back">Volver</button></div>' +
        "</section>" +
        /* Paso 3: montaje */
        '<section class="op-step" data-step="edit" hidden>' +
          '<div class="op-stage"><canvas id="opCanvas" aria-label="Montaje de la máquina en tu foto. Arrastra para mover la máquina."></canvas></div>' +
          '<p class="op-hint">Arrastra la máquina para ubicarla. Pellizca, usa la rueda del mouse o el control de tamaño para ajustarla. <span id="opHintDims"></span></p>' +
          '<div class="op-controls">' +
            '<label class="op-range">Tamaño<input type="range" id="opSize" min="8" max="95" step="0.5"></label>' +
            '<label class="op-range">Luz<input type="range" id="opLight" min="55" max="145" step="1" value="100"></label>' +
            '<label class="switch"><input type="checkbox" id="opShadow" checked> Sombra</label>' +
            '<button type="button" class="btn btn-ghost op-small" data-op="flip">Voltear</button>' +
            '<button type="button" class="btn btn-ghost op-small" data-op="reset">Restablecer</button>' +
          "</div>" +
          '<div class="op-actions">' +
            '<button type="button" class="btn btn-primary" data-op="download">Descargar imagen</button>' +
            '<button type="button" class="btn btn-ghost" data-op="share" hidden>Compartir</button>' +
            '<button type="button" class="btn btn-ghost" data-op="change">Cambiar foto</button>' +
          "</div>" +
        "</section>" +
      "</div>";
    document.body.appendChild(dlg);

    dlg.addEventListener("click", function (e) {
      if (e.target === dlg) return close();
      var b = e.target.closest("[data-op]"); if (!b) return;
      var op = b.dataset.op;
      if (op === "close") close();
      else if (op === "camera") startCamera();
      else if (op === "shoot") shoot();
      else if (op === "back") { stopCamera(); step("start"); }
      else if (op === "flip") { st.flip = !st.flip; draw(); }
      else if (op === "reset") { place(); $("#opLight").value = 100; st.light = 1; adjustCutout(); draw(); }
      else if (op === "download") download();
      else if (op === "share") share();
      else if (op === "change") { step("start"); }
    });
    dlg.addEventListener("close", cleanup);
    $("#opFile").addEventListener("change", onFile);
    $("#opCapture").addEventListener("change", onFile);
    $("#opSize").addEventListener("input", function (e) { st.size = +e.target.value; draw(); });
    $("#opLight").addEventListener("input", function (e) { st.light = e.target.value / 100; adjustCutout(); draw(); });
    $("#opShadow").addEventListener("change", function (e) { st.shadow = e.target.checked; draw(); });
    bindCanvas();
  }

  function step(name) {
    dlg.querySelectorAll(".op-step").forEach(function (s) { s.hidden = s.dataset.step !== name; });
    if (name === "start") { $("#opFile").value = ""; $("#opCapture").value = ""; }
  }
  function msg(t) { $("#opMsg").textContent = t || ""; }

  function open(m) {
    if (!dlg) build();
    st = { m: m, photo: null, cut: null, adj: null, size: START.size, cx: START.cx, bottom: START.bottom, flip: false, light: 1, shadow: true };
    $("#opRefImg").src = m.image; $("#opGhost").src = m.image;
    $("#opRefName").textContent = m.name;
    $("#opRefDims").textContent = dimsText(m);
    $("#opHintDims").textContent = "Referencia: la " + m.name + " mide " + String(m.specs.dims.h).replace(".", ",") + " cm de alto y " + String(m.specs.dims.w).replace(".", ",") + " cm de ancho.";
    $("#opShadow").checked = true; $("#opLight").value = 100;
    $("#opGhost").style.height = START.size + "%";
    $("#opGhost").style.bottom = (100 - START.bottom * 100) + "%";
    msg(""); step("start");
    var img = new Image();
    img.onload = function () { st.cut = img; adjustCutout(); };
    img.src = m.image;
    $('[data-op="share"]').hidden = !(navigator.canShare && window.File);
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", "");
  }
  function close() { if (dlg.open) dlg.close(); else cleanup(); }
  function cleanup() { stopCamera(); }

  /* ---------------- Fuente de la foto ---------------- */
  function startCamera() {
    msg("");
    var md = navigator.mediaDevices;
    if (!md || !md.getUserMedia || !window.isSecureContext) { $("#opCapture").click(); return; }
    md.getUserMedia({ video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false })
      .then(function (s) {
        stream = s;
        var v = $("#opVideo"); v.srcObject = s;
        v.onloadedmetadata = function () {
          $("#opCam").style.aspectRatio = v.videoWidth + " / " + v.videoHeight;
          v.play();
        };
        step("camera");
      })
      .catch(function () {
        msg("No fue posible abrir la cámara desde aquí. Usa «Subir foto»: en el celular también permite tomar una foto.");
      });
  }
  function stopCamera() {
    if (stream) { stream.getTracks().forEach(function (t) { t.stop(); }); stream = null; }
    if (dlg) { var v = $("#opVideo"); if (v) v.srcObject = null; }
  }
  function shoot() {
    var v = $("#opVideo"); if (!v.videoWidth) return;
    var k = Math.min(1, MAX_SIDE / Math.max(v.videoWidth, v.videoHeight));
    var c = document.createElement("canvas"); c.width = Math.round(v.videoWidth * k); c.height = Math.round(v.videoHeight * k);
    c.getContext("2d").drawImage(v, 0, 0, c.width, c.height);
    stopCamera();
    setPhoto(c);
  }
  function onFile(e) {
    var f = e.target.files && e.target.files[0]; if (!f) return;
    if (!/^image\//.test(f.type) && !/\.(jpe?g|png|webp|heic|heif)$/i.test(f.name)) { msg("El archivo seleccionado no es una imagen."); return; }
    var url = URL.createObjectURL(f), img = new Image();
    img.onload = function () {
      var k = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
      var c = document.createElement("canvas"); c.width = Math.round(img.naturalWidth * k); c.height = Math.round(img.naturalHeight * k);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);   // respeta la orientación EXIF en navegadores actuales
      URL.revokeObjectURL(url);
      setPhoto(c);
    };
    img.onerror = function () { URL.revokeObjectURL(url); msg("No se pudo abrir la imagen. Prueba con una foto en formato JPG o PNG."); };
    img.src = url;
  }
  function setPhoto(c) {
    st.photo = c;
    var cv = $("#opCanvas"); cv.width = c.width; cv.height = c.height;
    place(); step("edit"); draw();
  }
  function place() {
    st.size = START.size; st.cx = START.cx; st.bottom = START.bottom; st.flip = false;
    // en fotos verticales la máquina parte algo más pequeña respecto del alto
    if (st.photo && st.photo.height > st.photo.width) st.size = START.size * 0.75;
    $("#opSize").value = st.size;
  }

  /* ---------------- Ajuste de luz de la máquina ---------------- */
  function adjustCutout() {
    if (!st || !st.cut) return;
    var img = st.cut, c = st.adj || document.createElement("canvas");
    c.width = img.naturalWidth; c.height = img.naturalHeight;
    var g = c.getContext("2d"); g.clearRect(0, 0, c.width, c.height); g.drawImage(img, 0, 0);
    if (st.light !== 1) {
      var d = g.getImageData(0, 0, c.width, c.height), p = d.data, L = st.light;
      for (var i = 0; i < p.length; i += 4) {
        if (!p[i + 3]) continue;
        p[i] = Math.min(255, p[i] * L); p[i + 1] = Math.min(255, p[i + 1] * L); p[i + 2] = Math.min(255, p[i + 2] * L);
      }
      g.putImageData(d, 0, 0);
    }
    st.adj = c;
    if (st.photo) draw();
  }

  /* ---------------- Dibujo ---------------- */
  function geom() {
    var W = st.photo.width, H = st.photo.height, cut = st.adj || st.cut;
    var h = H * st.size / 100, w = h * cut.width / cut.height;
    return { W: W, H: H, w: w, h: h, x: st.cx * W - w / 2, y: st.bottom * H - h, base: st.bottom * H };
  }
  function draw(target) {
    if (!st || !st.photo || !(st.adj || st.cut)) return;
    var cv = target || $("#opCanvas"), g = cv.getContext("2d"), q = geom();
    g.clearRect(0, 0, q.W, q.H);
    g.drawImage(st.photo, 0, 0, q.W, q.H);
    var padFix = q.h * 0.012;   // margen transparente inferior de la imagen recortada
    if (st.shadow) {
      var cx = q.x + q.w / 2, by = q.base - padFix;
      shadowEllipse(g, cx, by, q.w * 0.64, q.w * 0.085, 0.42);
      shadowEllipse(g, cx, by, q.w * 0.5, q.w * 0.028, 0.5);
    }
    g.save();
    if (st.flip) { g.translate(q.x + q.w, 0); g.scale(-1, 1); g.drawImage(st.adj || st.cut, 0, q.y + padFix, q.w, q.h); }
    else g.drawImage(st.adj || st.cut, q.x, q.y + padFix, q.w, q.h);
    g.restore();
    if (target) caption(g, q);
  }
  function shadowEllipse(g, cx, cy, rx, ry, a) {
    g.save(); g.translate(cx, cy); g.scale(1, ry / rx);
    var gr = g.createRadialGradient(0, 0, 0, 0, 0, rx);
    gr.addColorStop(0, "rgba(0,0,0," + a + ")"); gr.addColorStop(0.55, "rgba(0,0,0," + a * 0.45 + ")"); gr.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = gr; g.beginPath(); g.arc(0, 0, rx, 0, Math.PI * 2); g.fill(); g.restore();
  }
  function caption(g, q) {
    var t = "Corporate Coffee · " + st.m.name, fs = Math.max(14, Math.round(q.W * 0.018));
    g.font = "600 " + fs + "px Figtree, Arial, sans-serif";
    var tw = g.measureText(t).width, pad = fs * 0.6, x = q.W - tw - pad * 3, y = q.H - fs - pad * 3;
    g.fillStyle = "rgba(255,255,255,.82)"; roundRect(g, x, y, tw + pad * 2, fs + pad * 1.6, fs * 0.4); g.fill();
    g.fillStyle = "#1d1c1a"; g.textBaseline = "middle"; g.fillText(t, x + pad, y + (fs + pad * 1.6) / 2);
  }
  function roundRect(g, x, y, w, h, r) {
    g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
  }

  /* ---------------- Interacción: mover y escalar ---------------- */
  function bindCanvas() {
    var cv = $("#opCanvas"), pts = {}, last = null, pinch = null;
    function toPhoto(e) { var r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * cv.width / r.width, y: (e.clientY - r.top) * cv.height / r.height }; }
    cv.addEventListener("pointerdown", function (e) {
      if (!st || !st.photo) return;
      cv.setPointerCapture(e.pointerId); pts[e.pointerId] = toPhoto(e);
      var ids = Object.keys(pts);
      if (ids.length === 1) {
        var p = pts[ids[0]], q = geom();
        // si se toca fuera de la máquina, ésta salta a ese punto
        if (p.x < q.x || p.x > q.x + q.w || p.y < q.y || p.y > q.base) { st.cx = p.x / q.W; st.bottom = Math.min(1, (p.y + q.h / 2) / q.H); draw(); }
        last = p; pinch = null;
      } else if (ids.length === 2) {
        var a = pts[ids[0]], b = pts[ids[1]];
        pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), size: st.size }; last = null;
      }
    });
    cv.addEventListener("pointermove", function (e) {
      if (!(e.pointerId in pts)) return;
      pts[e.pointerId] = toPhoto(e);
      var ids = Object.keys(pts), q = geom();
      if (pinch && ids.length === 2) {
        var a = pts[ids[0]], b = pts[ids[1]], d = Math.hypot(a.x - b.x, a.y - b.y);
        setSize(pinch.size * d / pinch.d);
      } else if (last && ids.length === 1) {
        var p = pts[ids[0]];
        st.cx += (p.x - last.x) / q.W; st.bottom += (p.y - last.y) / q.H;
        st.cx = Math.max(0, Math.min(1, st.cx)); st.bottom = Math.max(0.1, Math.min(1.05, st.bottom));
        last = p; draw();
      }
    });
    function up(e) { delete pts[e.pointerId]; if (Object.keys(pts).length < 2) pinch = null; if (!Object.keys(pts).length) last = null; }
    cv.addEventListener("pointerup", up); cv.addEventListener("pointercancel", up);
    cv.addEventListener("wheel", function (e) { if (!st || !st.photo) return; e.preventDefault(); setSize(st.size * (e.deltaY < 0 ? 1.05 : 0.95)); }, { passive: false });
  }
  function setSize(v) { st.size = Math.max(8, Math.min(95, v)); $("#opSize").value = st.size; draw(); }

  /* ---------------- Exportar ---------------- */
  function render(cb) {
    var c = document.createElement("canvas"); c.width = st.photo.width; c.height = st.photo.height;
    draw(c); c.toBlob(cb, "image/jpeg", 0.9);
  }
  function fileName() { return "corporate-coffee-" + st.m.id + "-en-tu-oficina.jpg"; }
  function download() {
    render(function (blob) {
      var url = URL.createObjectURL(blob), a = document.createElement("a");
      a.href = url; a.download = fileName(); document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
    });
  }
  function share() {
    render(function (blob) {
      var f = new File([blob], fileName(), { type: "image/jpeg" });
      if (navigator.canShare && navigator.canShare({ files: [f] })) navigator.share({ files: [f], title: st.m.name + " en tu oficina" }).catch(function () {});
      else download();
    });
  }

  window.OfficePreview = { open: open };
})();
