/* =====================================================================
   ProductViewer3D · visor 3D reutilizable para el catálogo
   ---------------------------------------------------------------------
   ProductViewer3D.mount(elemento, {
     src:    "assets/models/equipo.glb",   // modelo GLB (o usar build)
     build:  function (THREE) { ... },     // alternativa: geometría en vivo
     poster: "assets/img/machines/equipo.webp",  // imagen de respaldo
     alt:    "Nombre del equipo",
     vendor: "assets/vendor/three/"        // Three.js local (r147)
   }) → { destroy() }
   Carga Three.js solo cuando se abre el visor. Sin servicios externos.
   ===================================================================== */
(function () {
  "use strict";

  var VENDOR_FILES = ["three.min.js", "OrbitControls.js", "RoomEnvironment.js", "GLTFLoader.js"];
  var vendorPromise = null;

  function loadScript(src) {
    return new Promise(function (res, rej) {
      var s = document.createElement("script"); s.src = src; s.async = false;
      s.onload = res; s.onerror = function () { rej(new Error("No se pudo cargar " + src)); };
      document.head.appendChild(s);
    });
  }
  function loadVendor(base) {
    if (window.THREE && THREE.OrbitControls && THREE.GLTFLoader && THREE.RoomEnvironment) return Promise.resolve();
    if (!vendorPromise) {
      vendorPromise = VENDOR_FILES.reduce(function (p, f) {
        return p.then(function () {
          if (f === "three.min.js" && window.THREE) return;
          return loadScript(base + f);
        });
      }, Promise.resolve());
    }
    return vendorPromise;
  }
  function webglAvailable() {
    try { var c = document.createElement("canvas"); return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl"))); }
    catch (e) { return false; }
  }

  var ICONS = {
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z" fill="currentColor"/></svg>',
    pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5h3v14H8zM13 5h3v14h-3z" fill="currentColor"/></svg>',
    reset: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3M4.5 4.5v3.8h3.8" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    minus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12h12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 6v12M6 12h12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>'
  };
  // theta: giro horizontal (0 = frente), phi: ángulo polar (0 = desde arriba)
  var VIEWS = {
    initial: { theta: 0.62, phi: 1.2, label: "Vista inicial" },
    front: { theta: 0, phi: 1.38, label: "Frontal" },
    back: { theta: Math.PI, phi: 1.38, label: "Posterior" },
    left: { theta: -Math.PI / 2, phi: 1.38, label: "Lateral izquierda" },
    right: { theta: Math.PI / 2, phi: 1.38, label: "Lateral derecha" },
    top: { theta: 0, phi: 0.02, label: "Superior" }
  };

  function showFallback(host, opts, reason, retry) {
    host.classList.add("v3d", "v3d-fallback");
    host.innerHTML = '<div class="v3d-poster">' + (opts.poster ? '<img src="' + opts.poster + '" alt="Fotografía de ' + (opts.alt || "el equipo") + '">' : "") +
      "<p>" + (reason || "Este dispositivo no permite mostrar el modelo 3D.") + " Se muestra la fotografía del equipo.</p>" +
      (retry ? '<button type="button" class="btn btn-ghost v3d-retry">Intentar de nuevo</button>' : "") + "</div>";
    var b = host.querySelector(".v3d-retry"); if (b) b.addEventListener("click", retry);
  }

  function createInstance(host, opts, hooks) {
    var alive = true, failed = false, raf = 0, renderer, scene, camera, controls, ro, io, visible = true, anim = null;
    var model = null, baseRadius = 1, fitDistance = 2;

    host.classList.remove("v3d-fallback");
    host.classList.add("v3d");
    host.innerHTML =
      '<div class="v3d-canvas" role="img" aria-label="Modelo 3D interactivo de ' + (opts.alt || "el equipo") + '. Arrastre para girar."></div>' +
      '<div class="v3d-loading" aria-live="polite"><div class="v3d-bar"><i></i></div><p>Cargando modelo 3D…</p></div>' +
      '<div class="v3d-views" role="group" aria-label="Vistas predefinidas">' +
        ["front", "back", "left", "right", "top"].map(function (k) { return '<button type="button" data-view="' + k + '">' + VIEWS[k].label.replace("Lateral i", "I").replace("Lateral d", "D") + "</button>"; }).join("") +
      "</div>" +
      '<div class="v3d-tools" role="group" aria-label="Controles del visor">' +
        '<button type="button" class="v3d-btn" data-act="auto" aria-pressed="true" aria-label="Detener rotación automática">' + ICONS.pause + "</button>" +
        '<button type="button" class="v3d-btn" data-act="reset" aria-label="Restablecer vista inicial">' + ICONS.reset + "</button>" +
        '<button type="button" class="v3d-btn" data-act="out" aria-label="Alejar">' + ICONS.minus + "</button>" +
        '<button type="button" class="v3d-btn" data-act="in" aria-label="Acercar">' + ICONS.plus + "</button>" +
      "</div>" +
      '<p class="v3d-hint">Arrastra para girar · rueda o pellizco para acercar</p>';

    var canvasHost = host.querySelector(".v3d-canvas");
    var loading = host.querySelector(".v3d-loading");
    var bar = host.querySelector(".v3d-bar i");
    var loadingText = loading.querySelector("p");
    var autoBtn = host.querySelector('[data-act="auto"]');

    // Error de carga: se informa el motivo real y se ofrece reintentar
    function fallback(reason) {
      if (!alive || failed) return;
      failed = true; alive = false;
      destroyGL();
      hooks.fail(reason);
    }

    function progress(p, text) { bar.style.width = Math.round(p * 100) + "%"; if (text) loadingText.textContent = text; }
    progress(0.08, "Preparando visor 3D…");

    loadVendor(opts.vendor || "assets/vendor/three/").then(function () {
      if (!alive) return;
      progress(0.3, "Cargando modelo 3D…");
      init();
      return loadModel();
    }).then(function (obj) {
      if (!alive || !obj) return;
      addModel(obj);
      progress(1, "Listo");
      loading.classList.add("done");
      setTimeout(function () { if (loading.parentNode) loading.hidden = true; }, 500);
    }).catch(function (err) {
      console.error(err);
      fallback("No fue posible cargar el modelo 3D.");
    });

    function init() {
      var T = window.THREE;
      if (T.ColorManagement) T.ColorManagement.legacyMode = false;
      renderer = new T.WebGLRenderer({ antialias: !opts.safe, alpha: false, powerPreference: "default", failIfMajorPerformanceCaveat: false });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, opts.safe ? 1 : 1.5));
      renderer.outputEncoding = T.sRGBEncoding;
      renderer.toneMapping = T.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      renderer.shadowMap.enabled = !opts.safe;
      renderer.shadowMap.type = T.PCFSoftShadowMap;
      canvasHost.appendChild(renderer.domElement);
      renderer.domElement.addEventListener("webglcontextlost", function (e) {
        e.preventDefault();
        if (!alive || failed) return;          // pérdida provocada al cerrar el visor
        failed = true; alive = false; destroyGL(); hooks.lost();
      });

      scene = new T.Scene();
      var bg = (getComputedStyle(host).getPropertyValue("--v3d-bg") || "").trim() || "#eeece8";
      scene.background = new T.Color(bg);

      var pmrem = new T.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(new T.RoomEnvironment(), 0.04).texture;
      pmrem.dispose();

      camera = new T.PerspectiveCamera(30, 1, 0.01, 50);

      var key = new T.DirectionalLight(0xffffff, 1.5);
      key.position.set(0.3, 3.0, 0.6);
      key.castShadow = !opts.safe;
      key.shadow.mapSize.set(1024, 1024);
      key.shadow.camera.left = -1; key.shadow.camera.right = 1; key.shadow.camera.top = 1; key.shadow.camera.bottom = -1;
      key.shadow.camera.near = 1; key.shadow.camera.far = 5;
      key.shadow.bias = -0.0005; key.shadow.normalBias = 0.02;
      scene.add(key);
      var rim = new T.DirectionalLight(0xffffff, 0.8); rim.position.set(-1.4, 1.2, -1.2); scene.add(rim);
      scene.add(new T.HemisphereLight(0xffffff, 0xbdb8b0, 0.35));

      var ground = new T.Mesh(new T.PlaneGeometry(6, 6), new T.ShadowMaterial({ opacity: 0.14 }));
      ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);

      controls = new T.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true; controls.dampingFactor = 0.08;
      controls.enablePan = false;
      controls.rotateSpeed = 0.8; controls.zoomSpeed = 0.8;
      controls.minPolarAngle = 0.02; controls.maxPolarAngle = 1.95;
      controls.autoRotate = true; controls.autoRotateSpeed = 1.4;
      controls.addEventListener("start", function () { anim = null; setAuto(false); });

      ro = new ResizeObserver(resize); ro.observe(canvasHost); resize();
      io = new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }, { threshold: 0.01 }); io.observe(host);
      loop();
    }

    function loadModel() {
      var T = window.THREE;
      if (opts.build) { progress(0.7, "Construyendo modelo…"); return Promise.resolve(opts.build(T)); }
      return new Promise(function (res, rej) {
        var loader = new T.GLTFLoader();
        if (/^data:/.test(opts.src)) {          // sin fetch: compatible con políticas de seguridad estrictas
          var bin = atob(opts.src.split(",")[1]), u = new Uint8Array(bin.length);
          for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
          return loader.parse(u.buffer, "", function (g) { res(g.scene); }, rej);
        }
        loader.load(opts.src, function (g) { res(g.scene); }, function (e) {
          if (e.total) progress(0.3 + 0.65 * (e.loaded / e.total), "Cargando modelo 3D… " + Math.round(e.loaded / e.total * 100) + "%");
        }, rej);
      });
    }

    function addModel(obj) {
      var T = window.THREE;
      model = obj;
      model.traverse(function (o) {
        if (!o.isMesh) return;
        o.castShadow = !/^logo/.test(o.name); o.receiveShadow = true;
        if (/^display|^led|^logo_corporate/.test(o.name) || (o.material && /^(display|led|logo_corporate)/.test(o.material.name))) o.material.toneMapped = false;
        if (o.material && o.material.transmission > 0) {
          var m = o.material, op = { contenedor_ahumado: 0.3, tapa_ahumada: 0.45, ventana_estanque: 0.82, estanque_agua: 0.35, tubo_leche: 0.85 }[m.name] || 0.4;
          m.transmission = 0; m.transparent = true; m.opacity = op; m.depthWrite = false; m.needsUpdate = true;
          o.castShadow = false;
        }
      });
      scene.add(model);
      var box = new T.Box3().setFromObject(model);
      var center = box.getCenter(new T.Vector3()), size = box.getSize(new T.Vector3());
      model.position.x -= center.x; model.position.z -= center.z; model.position.y -= box.min.y;
      var sphere = new T.Box3().setFromObject(model).getBoundingSphere(new T.Sphere());
      baseRadius = sphere.radius;
      controls.target.set(0, size.y * 0.47, 0);

      // sombra de contacto suave
      var c = document.createElement("canvas"); c.width = c.height = 128;
      var g = c.getContext("2d"), grd = g.createRadialGradient(64, 64, 4, 64, 64, 64);
      grd.addColorStop(0, "rgba(0,0,0,.55)"); grd.addColorStop(0.55, "rgba(0,0,0,.22)"); grd.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = grd; g.fillRect(0, 0, 128, 128);
      var blob = new T.Mesh(new T.PlaneGeometry(size.x * 1.7, size.z * 1.45), new T.MeshBasicMaterial({ map: new T.CanvasTexture(c), transparent: true, depthWrite: false }));
      blob.rotation.x = -Math.PI / 2; blob.position.y = 0.0015; blob.renderOrder = -1; scene.add(blob);

      var vfov = camera.fov * Math.PI / 180;
      fitDistance = baseRadius / Math.sin(Math.min(vfov, 2 * Math.atan(Math.tan(vfov / 2) * camera.aspect)) / 2) * 1.02;
      controls.minDistance = baseRadius * 1.18;   // la cámara nunca entra en la geometría
      controls.maxDistance = fitDistance * 2.2;
      setView("initial", true);
    }

    function resize() {
      if (!renderer) return;
      var w = canvasHost.clientWidth || 1, h = canvasHost.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h; camera.updateProjectionMatrix();
      if (model) {
        var vfov = camera.fov * Math.PI / 180;
        fitDistance = baseRadius / Math.sin(Math.min(vfov, 2 * Math.atan(Math.tan(vfov / 2) * camera.aspect)) / 2) * 1.02;
        controls.maxDistance = fitDistance * 2.2;
      }
    }

    function spherical() {
      var T = window.THREE, s = new T.Spherical();
      s.setFromVector3(camera.position.clone().sub(controls.target)); return s;
    }
    function setView(name, instant) {
      var v = VIEWS[name]; if (!v || !camera) return;
      var dist = name === "top" ? fitDistance * 0.95 : fitDistance;
      if (instant) { applySph(v.theta, v.phi, dist); return; }
      var s = spherical(), dT = ((v.theta - s.theta + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
      anim = { t0: performance.now(), dur: 900, from: [s.theta, s.phi, s.radius], to: [s.theta + dT, v.phi, dist] };
    }
    function applySph(theta, phi, r) {
      var T = window.THREE, off = new T.Vector3().setFromSpherical(new T.Spherical(r, Math.max(0.02, Math.min(1.95, phi)), theta));
      camera.position.copy(controls.target).add(off); camera.lookAt(controls.target);
    }
    function zoom(f) {
      var s = spherical(), r = Math.max(controls.minDistance, Math.min(controls.maxDistance, s.radius * f));
      anim = { t0: performance.now(), dur: 450, from: [s.theta, s.phi, s.radius], to: [s.theta, s.phi, r] };
    }
    function setAuto(on) {
      if (!controls) return;
      controls.autoRotate = on;
      autoBtn.setAttribute("aria-pressed", on);
      autoBtn.setAttribute("aria-label", on ? "Detener rotación automática" : "Iniciar rotación automática");
      autoBtn.innerHTML = on ? ICONS.pause : ICONS.play;
    }
    function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

    function loop() {
      if (!alive) return;
      raf = requestAnimationFrame(loop);
      if (!visible || document.hidden) return;
      if (anim) {
        var k = Math.min(1, (performance.now() - anim.t0) / anim.dur), e = ease(k);
        applySph(anim.from[0] + (anim.to[0] - anim.from[0]) * e, anim.from[1] + (anim.to[1] - anim.from[1]) * e, anim.from[2] + (anim.to[2] - anim.from[2]) * e);
        if (k >= 1) anim = null;
      } else controls.update();
      renderer.render(scene, camera);
    }

    host.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b || !controls) return;
      if (b.dataset.view) { setAuto(false); setView(b.dataset.view); }
      else if (b.dataset.act === "auto") setAuto(!controls.autoRotate);
      else if (b.dataset.act === "reset") { setView("initial"); setAuto(true); }
      else if (b.dataset.act === "in") zoom(0.8);
      else if (b.dataset.act === "out") zoom(1.25);
    });

    function destroyGL() {
      cancelAnimationFrame(raf);
      if (ro) ro.disconnect(); if (io) io.disconnect();
      if (controls) controls.dispose();
      if (scene) scene.traverse(function (o) {
        if (o.geometry) o.geometry.dispose();
        if (o.material) [].concat(o.material).forEach(function (m) {
          Object.keys(m).forEach(function (k) { if (m[k] && m[k].isTexture) m[k].dispose(); }); m.dispose();
        });
      });
      if (renderer) { renderer.dispose(); if (renderer.forceContextLoss) renderer.forceContextLoss(); }
      renderer = scene = controls = null;
    }

    return { destroy: function () { alive = false; destroyGL(); } };
  }

  /* Montaje con recuperación: si la GPU pierde el contexto se reintenta en modo
     liviano (sin sombras proyectadas, resolución 1x); si vuelve a fallar se
     muestra la fotografía con un botón para reintentar. */
  function mount(host, opts) {
    opts = opts || {};
    var inst = null, dead = false, losses = 0;
    function preferSafe() {
      try { if (sessionStorage.getItem("v3d-safe") === "1") return true; } catch (e) {}
      return (navigator.deviceMemory && navigator.deviceMemory <= 2) || false;
    }
    function start(safe) {
      if (dead) return;
      if (!webglAvailable()) { showFallback(host, opts, "Este navegador no tiene WebGL disponible."); return; }
      inst = createInstance(host, Object.assign({}, opts, { safe: safe }), {
        lost: function () {
          if (dead) return;
          losses++;
          try { sessionStorage.setItem("v3d-safe", "1"); } catch (e) {}
          if (losses === 1 && !safe) setTimeout(function () { start(true); }, 400);
          else showFallback(host, opts, "La tarjeta gráfica de este dispositivo interrumpió la vista 3D.", function () { losses = 0; start(true); });
        },
        fail: function (reason) { if (!dead) showFallback(host, opts, reason, function () { start(safe); }); }
      });
    }
    start(preferSafe());
    return { destroy: function () { dead = true; if (inst) inst.destroy(); } };
  }

  window.ProductViewer3D = { mount: mount, VIEWS: VIEWS };
})();
