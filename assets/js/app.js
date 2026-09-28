/* =========================================================
   Corporate Coffee · Catálogo · Lógica de la aplicación
   Sin dependencias. Enrutamiento por hash (#/, #/maquina/id,
   #/comparar/a/b) para funcionar en GitHub Pages o abriendo
   index.html directamente.
   ========================================================= */
(function () {
  "use strict";

  var app = document.getElementById("app");
  var byId = {};
  MACHINES.forEach(function (m) { byId[m.id] = m; });

  /* ---------------- Utilidades ---------------- */
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function isNE(v) { return v == null || v === "" || String(v).indexOf(NE) === 0; }
  function val(v) {
    if (Array.isArray(v)) v = v.length ? v.join("; ") : NE;
    if (v == null || v === "") v = NE;
    return isNE(v) ? '<span class="ne">' + esc(v) + "</span>" : esc(v);
  }
  function rawVal(v) { if (Array.isArray(v)) v = v.length ? v.join("; ") : NE; return v == null || v === "" ? NE : String(v); }
  function cm(n) { return n == null ? NE : String(n).replace(".", ",") + " cm"; }
  function strip(s) { return String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); }
  function num(s) { var m = String(s || "").match(/[\d]+(?:[.,]\d+)?/); return m && !isNE(s) ? parseFloat(m[0].replace(",", ".")) : null; }

  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sin almacenamiento */ } }
  };

  /* ---------------- Íconos ---------------- */
  var P = 'fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"';
  function svg(inner, vb) { return '<svg viewBox="' + (vb || "0 0 24 24") + '" aria-hidden="true">' + inner + "</svg>"; }
  var ICON = {
    back: svg('<path d="M15 5l-7 7 7 7" ' + P + "/>"),
    close: svg('<path d="M6 6l12 12M18 6 6 18" ' + P + "/>"),
    swap: svg('<path d="M7 4v16M7 20l-3-3M7 20l3-3M17 20V4M17 4l-3 3M17 4l3 3" ' + P + "/>"),
    search: svg('<circle cx="11" cy="11" r="6.5" ' + P + '/><path d="m16 16 4 4" ' + P + "/>"),
    plus: svg('<path d="M12 5v14M5 12h14" ' + P + "/>"),
    check: svg('<path d="m5 12.5 4.5 4.5L19 7.5" ' + P + "/>"),
    filter: svg('<path d="M4 6h16M7 12h10M10 18h4" ' + P + "/>"),
    note: svg('<circle cx="12" cy="12" r="8.5" ' + P + '/><path d="M12 8v5M12 16.2v.3" ' + P + "/>"),
    cube: svg('<path d="M12 3 4 7.5v9L12 21l8-4.5v-9L12 3Z" ' + P + '/><path d="M4 7.5 12 12l8-4.5M12 12v9" ' + P + "/>"),
    doc: svg('<path d="M7 3h7l4 4v14H7z" ' + P + '/><path d="M14 3v4h4M10 12h5M10 16h5" ' + P + "/>"),
    /* bebidas */
    espresso: svg('<path d="M6 10h10v3.5A4.5 4.5 0 0 1 11.5 18h-1A4.5 4.5 0 0 1 6 13.5V10Z" ' + P + '/><path d="M16 11.5h1.5a2 2 0 0 1 0 4H16M4.5 20.5h13" ' + P + "/>"),
    long: svg('<path d="M7 5h10l-1.2 14.5a1.6 1.6 0 0 1-1.6 1.5H9.8a1.6 1.6 0 0 1-1.6-1.5L7 5Z" ' + P + '/><path d="M7.4 9.5h9.2" ' + P + "/>"),
    foam: svg('<path d="M5.5 10h12v4a6 6 0 0 1-6 6 6 6 0 0 1-6-6v-4Z" ' + P + '/><path d="M17.5 11.5H19a2 2 0 0 1 0 4h-1.8M8 10c0-2 1.6-3 3.5-3s3.5 1 3.5 3" ' + P + "/>"),
    milk: svg('<path d="M9 3h6v3l2 3v11a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V9l2-3V3Z" ' + P + '/><path d="M7 12h10" ' + P + "/>"),
    choco: svg('<rect x="6" y="3.5" width="12" height="17" rx="1.5" ' + P + '/><path d="M6 9.2h12M6 14.8h12M12 3.5v17" ' + P + "/>"),
    tea: svg('<path d="M5 9h12v4.5A5.5 5.5 0 0 1 11.5 19h-1A5.5 5.5 0 0 1 5 13.5V9Z" ' + P + '/><path d="M17 10.5h1.5a2 2 0 0 1 0 4H17M11 9V5l2.5-1.5M13.5 3.5v3" ' + P + "/>"),
    water: svg('<path d="M12 3.5s6 6.4 6 10.6a6 6 0 0 1-12 0C6 9.9 12 3.5 12 3.5Z" ' + P + "/>"),
    /* características */
    touch: svg('<path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V11l4.3.9a2 2 0 0 1 1.6 2.2l-.6 4.9H10l-3.5-4.2a1.5 1.5 0 0 1 2.3-1.9L9 13" ' + P + "/>"),
    screen: svg('<rect x="3.5" y="4.5" width="17" height="11.5" rx="1.5" ' + P + '/><path d="M9 20h6M12 16v4" ' + P + "/>"),
    clean: svg('<path d="M10 3.5s5 5.3 5 8.8a5 5 0 0 1-10 0C5 8.8 10 3.5 10 3.5Z" ' + P + '/><path d="M18 4v4M16 6h4M18.5 13v3M17 14.5h3" ' + P + "/>"),
    heat: svg('<path d="M10 14.5V5a2 2 0 0 1 4 0v9.5a3.5 3.5 0 1 1-4 0Z" ' + P + '/><path d="M12 9v7" ' + P + "/>"),
    grinder: svg('<path d="M8 3h8l-1 5H9L8 3ZM6.5 8h11v4h-11zM7.5 12h9v8.5h-9z" ' + P + '/><circle cx="12" cy="16.3" r="1.6" ' + P + "/>"),
    jug: svg('<path d="M9 3h6v3.5l2.5 3V20a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1V9.5L9 6.5V3Z" ' + P + '/><path d="M12 12.5s2 2.1 2 3.4a2 2 0 0 1-4 0c0-1.3 2-3.4 2-3.4Z" ' + P + "/>"),
    bulb: svg('<path d="M9 17h6M10 20.5h4M12 3.5a5.5 5.5 0 0 0-3 10.1V17h6v-3.4a5.5 5.5 0 0 0-3-10.1Z" ' + P + "/>"),
    play: svg('<rect x="3.5" y="5" width="17" height="14" rx="1.5" ' + P + '/><path d="m10.5 9.5 4 2.5-4 2.5z" ' + P + "/>"),
    people: svg('<circle cx="12" cy="8" r="2.8" ' + P + '/><circle cx="5.5" cy="10" r="2" ' + P + '/><circle cx="18.5" cy="10" r="2" ' + P + '/><path d="M7 19a5 5 0 0 1 10 0M2.5 18a3.3 3.3 0 0 1 4-3M21.5 18a3.3 3.3 0 0 0-4-3" ' + P + "/>"),
    buttons: svg('<rect x="4" y="4" width="6" height="4" rx="1" ' + P + '/><rect x="14" y="4" width="6" height="4" rx="1" ' + P + '/><rect x="4" y="10" width="6" height="4" rx="1" ' + P + '/><rect x="14" y="10" width="6" height="4" rx="1" ' + P + '/><rect x="4" y="16" width="6" height="4" rx="1" ' + P + '/><rect x="14" y="16" width="6" height="4" rx="1" ' + P + "/>"),
    nav: svg('<circle cx="12" cy="12" r="8.5" ' + P + '/><path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" ' + P + "/>"),
    design: svg('<rect x="4" y="4" width="10" height="10" rx="1.5" ' + P + '/><rect x="10" y="10" width="10" height="10" rx="1.5" ' + P + "/>"),
    beaker: svg('<path d="M6 3.5h12M7.5 3.5V19a1.5 1.5 0 0 0 1.5 1.5h6a1.5 1.5 0 0 0 1.5-1.5V3.5M7.5 9h4M7.5 13h3M7.5 17h4" ' + P + "/>"),
    sparkle: svg('<path d="M12 3.5 13.8 10 20.5 12l-6.7 2L12 20.5 10.2 14 3.5 12l6.7-2L12 3.5Z" ' + P + "/>"),
    easy: svg('<circle cx="12" cy="12" r="8.5" ' + P + '/><path d="m8 12.3 2.7 2.7L16 9.5" ' + P + "/>")
  };

  function drinkIcon(name) {
    var n = strip(name);
    if (/agua/.test(n)) return ICON.water;
    if (/(^|\s)te(\s|$)/.test(n)) return ICON.tea;
    if (/chocolate|mocacc|mokacc/.test(n)) return ICON.choco;
    if (/cappucc|capucc|latte|macchiato|con leche|cortado/.test(n)) return ICON.foam;
    if (/leche|crema/.test(n)) return ICON.milk;
    if (/espres|ristretto/.test(n)) return ICON.espresso;
    return ICON.long;
  }
  function featureIcon(t) {
    var n = strip(t);
    if (/video|imagen/.test(n)) return ICON.play;
    if (/pantalla|display|lcd/.test(n)) return ICON.screen;
    if (/touch|tactil/.test(n)) return ICON.touch;
    if (/boton|seleccion/.test(n)) return ICON.buttons;
    if (/leche|espuma/.test(n)) return ICON.milk;
    if (/limpieza|mantenimiento/.test(n)) return ICON.clean;
    if (/calentamiento|caldera/.test(n)) return ICON.heat;
    if (/molin|molino/.test(n)) return ICON.grinder;
    if (/bidon|agua/.test(n)) return ICON.jug;
    if (/led|iluminacion/.test(n)) return ICON.bulb;
    if (/capacidad/.test(n)) return ICON.people;
    if (/navegacion/.test(n)) return ICON.nav;
    if (/dosificador/.test(n)) return ICON.beaker;
    if (/sencillo/.test(n)) return ICON.easy;
    if (/prepara/.test(n)) return ICON.foam;
    if (/diseno|superficie|compact|sobremesa/.test(n)) return ICON.design;
    return ICON.sparkle;
  }

  /* ---------------- Estado ---------------- */
  var compare = (store.get("cc-compare", []) || []).filter(function (id) { return byId[id]; }).slice(0, 2);
  var filters = { brand: [], coffee: [], milk: [], feat: [] };
  var query = "";
  var onlyDiff = false;
  var dimsMode = "side";
  var lastRoute = null;
  var lastCatalogCard = null;

  function saveCompare() { store.set("cc-compare", compare); updateNav(); renderTray(); }
  function inCompare(id) { return compare.indexOf(id) !== -1; }
  function toggleCompare(id) {
    if (inCompare(id)) {
      compare = compare.filter(function (x) { return x !== id; });
      toast(byId[id].name + " se quitó del comparador.");
    } else if (compare.length >= 2) {
      toast("El comparador admite dos máquinas. Quita una para agregar " + byId[id].name + ".");
      return false;
    } else {
      compare.push(id);
      toast(compare.length === 2 ? "Listo: ya puedes comparar las dos máquinas." : byId[id].name + " se agregó. Elige una segunda máquina.");
    }
    saveCompare();
    return true;
  }

  var toastTimer;
  function toast(msg) {
    var t = document.getElementById("toast");
    t.textContent = msg; t.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.classList.remove("show"); }, 2800);
  }

  /* ---------------- Filtros ---------------- */
  var FILTER_DEFS = [
    { key: "brand", label: "Marca", options: uniq(MACHINES.map(function (m) { return m.brand; })).map(function (b) { return [b, b]; }) },
    { key: "coffee", label: "Café", options: [["grano", "En grano"], ["soluble", "Soluble"]] },
    { key: "milk", label: "Leche", options: [["liquida", "Líquida"], ["soluble", "En polvo o soluble"]] },
    { key: "feat", label: "Características", options: [["touch", "Pantalla o panel táctil"], ["solubles", "Contenedores de solubles"], ["waterNetwork", "Conexión a red de agua"], ["bidon", "Conexión a bidón"]] }
  ];
  function uniq(a) { return a.filter(function (x, i) { return a.indexOf(x) === i; }); }
  function matches(m) {
    if (query) {
      var hay = strip([m.name, m.brand, m.id, m.subtitle].join(" "));
      var ok = strip(query).split(/\s+/).every(function (w) { return hay.indexOf(w) !== -1; });
      if (!ok) return false;
    }
    if (filters.brand.length && filters.brand.indexOf(m.brand) === -1) return false;
    if (filters.coffee.length && filters.coffee.indexOf(m.tags.coffee) === -1) return false;
    if (filters.milk.length && filters.milk.indexOf(m.tags.milk) === -1) return false;
    for (var i = 0; i < filters.feat.length; i++) if (!m.tags[filters.feat[i]]) return false;
    return true;
  }
  function activeFilterCount() { return filters.brand.length + filters.coffee.length + filters.milk.length + filters.feat.length; }

  /* ---------------- Router ---------------- */
  function parseRoute() {
    var parts = location.hash.replace(/^#\/?/, "").split("/").filter(Boolean).map(decodeURIComponent);
    if (parts[0] === "maquina" && byId[parts[1]]) return { name: "detail", id: parts[1] };
    if (parts[0] === "comparar") return { name: "compare", ids: parts.slice(1, 3).filter(function (id) { return byId[id]; }) };
    return { name: "catalog" };
  }
  function go(hash) { if (location.hash === hash) render(); else location.hash = hash; }

  function render() {
    var r = parseRoute();
    var sameView = lastRoute && lastRoute.name === r.name && (r.name !== "detail" || lastRoute.id === r.id);
    destroyViewer();
    if (r.name === "detail") renderDetail(byId[r.id]);
    else if (r.name === "compare") {
      if (r.ids.length) { compare = uniq(r.ids); store.set("cc-compare", compare); }
      renderCompare();
    } else renderCatalog();
    if (!sameView) {
      if (r.name === "catalog" && lastCatalogCard) {
        var el = document.getElementById("card-" + lastCatalogCard);
        if (el) el.scrollIntoView({ block: "center" }); else window.scrollTo(0, 0);
      } else window.scrollTo(0, 0);
      if (lastRoute) app.focus({ preventScroll: true });
    }
    lastRoute = r;
    updateNav(); renderTray();
  }
  function updateNav() {
    var r = parseRoute();
    document.querySelectorAll("[data-nav]").forEach(function (a) {
      var on = (a.dataset.nav === "catalog" && r.name !== "compare") || (a.dataset.nav === "compare" && r.name === "compare");
      if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
    var c = document.getElementById("navCount");
    c.textContent = compare.length; c.hidden = compare.length === 0;
    document.querySelector('[data-nav="compare"]').href = "#/comparar" + (compare.length ? "/" + compare.join("/") : "");
  }

  /* ---------------- Catálogo ---------------- */
  function renderCatalog() {
    var heights = MACHINES.map(function (m) { return m.specs.dims.h; });
    var lineup = MACHINES.map(function (m, i) {
      return '<a class="lineup-item" href="#/maquina/' + m.id + '" style="--h:' + m.specs.dims.h + ";--i:" + i + '">' +
        '<span class="lineup-img"><img src="' + m.image + '" alt="" loading="' + (i < 4 ? "eager" : "lazy") + '" decoding="async"></span>' +
        '<span class="lineup-label"><strong>' + esc(m.name) + "</strong><span>" + cm(m.specs.dims.h) + " de alto</span></span></a>";
    }).join("");
    app.innerHTML =
      '<div class="view">' +
      '<section class="hero"><div class="wrap">' +
        '<div class="hero-grid"><div>' +
          "<h1>Nuestras máquinas de café</h1></div><div>" +
          '<p class="hero-intro">Equipos automáticos para oficinas, salas de reuniones y espacios corporativos. Revisa las especificaciones de cada modelo, las bebidas que prepara y compáralos lado a lado.</p>' +
        "</div></div>" +
        '<div class="lineup" aria-label="Las ocho máquinas del catálogo">' +
          '<div class="lineup-scroll"><div class="lineup-track">' + lineup + "</div></div>" +
          '<p class="lineup-caption">Alturas en proporción a las medidas informadas en cada ficha (entre ' + Math.min.apply(null, heights) + " y " + Math.max.apply(null, heights) + " cm). Selecciona una máquina para ver su ficha.</p>" +
        "</div>" +
      "</div></section>" +

      '<div class="toolbar"><div class="wrap toolbar-inner">' +
        '<label class="search"><span class="visually-hidden">Buscar por nombre o modelo</span>' + ICON.search +
          '<input id="q" type="search" placeholder="Buscar por nombre o modelo" autocomplete="off" value="' + esc(query) + '"></label>' +
        '<button class="btn btn-ghost filter-toggle" id="filterToggle" type="button" aria-expanded="false" aria-controls="filters">' + ICON.filter + 'Filtros <span id="filterCount"></span></button>' +
        '<div class="filters" id="filters">' +
          FILTER_DEFS.map(function (g) {
            return '<fieldset class="filter-group"><legend>' + g.label + "</legend>" +
              g.options.map(function (o) {
                return '<button type="button" class="chip" data-fk="' + g.key + '" data-fv="' + esc(o[0]) + '" aria-pressed="' + (filters[g.key].indexOf(o[0]) !== -1) + '">' + esc(o[1]) + "</button>";
              }).join("") + "</fieldset>";
          }).join("") +
        "</div>" +
      "</div></div>" +

      '<section class="wrap" aria-label="Catálogo de máquinas">' +
        '<div class="results-meta"><p id="resultCount" aria-live="polite"></p><button class="link-btn" id="clearFilters" type="button" hidden>Quitar filtros</button></div>' +
        '<div class="grid" id="grid"></div>' +
      "</section></div>";

    fitLineup();
    drawGrid();

    var q = document.getElementById("q");
    q.addEventListener("input", function () { query = q.value.trim(); drawGrid(); });
    document.getElementById("filters").addEventListener("click", function (e) {
      var b = e.target.closest(".chip"); if (!b) return;
      var list = filters[b.dataset.fk], v = b.dataset.fv, i = list.indexOf(v);
      if (i === -1) list.push(v); else list.splice(i, 1);
      b.setAttribute("aria-pressed", i === -1);
      drawGrid();
    });
    var ft = document.getElementById("filterToggle");
    ft.addEventListener("click", function () {
      var f = document.getElementById("filters"); var open = !f.classList.contains("open");
      f.classList.toggle("open", open); ft.setAttribute("aria-expanded", open);
    });
    document.getElementById("clearFilters").addEventListener("click", clearAll);
  }
  /* Ajusta la escala (px por cm) para que la fila de máquinas quepa en pantalla
     cuando es posible; en pantallas angostas se desplaza horizontalmente. */
  function fitLineup() {
    var track = document.querySelector(".lineup-track"); if (!track) return;
    var items = track.querySelectorAll(".lineup-item");
    function apply() {
      var avail = track.parentElement.clientWidth, sum = 0, pad = 0, ready = true;
      items.forEach(function (it) {
        var im = it.querySelector("img");
        if (!im.naturalWidth) { ready = false; return; }
        sum += (im.naturalWidth / im.naturalHeight) * parseFloat(it.style.getPropertyValue("--h"));
        var cs = getComputedStyle(it.querySelector(".lineup-img"));
        pad += parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
      });
      if (!ready || !sum) return;
      var px = Math.max(2.1, Math.min(3.6, (avail - pad - 24) / sum));
      track.style.setProperty("--cm", px + "px");
    }
    items.forEach(function (it) { var im = it.querySelector("img"); if (!im.complete) im.addEventListener("load", apply); });
    apply();
    if (fitLineup._r) window.removeEventListener("resize", fitLineup._r);
    fitLineup._r = apply; window.addEventListener("resize", apply);
  }
  function clearAll() {
    filters = { brand: [], coffee: [], milk: [], feat: [] }; query = "";
    var q = document.getElementById("q"); if (q) q.value = "";
    document.querySelectorAll(".chip").forEach(function (c) { c.setAttribute("aria-pressed", "false"); });
    drawGrid();
  }
  function drawGrid() {
    var list = MACHINES.filter(matches);
    var grid = document.getElementById("grid"); if (!grid) return;
    var n = activeFilterCount();
    document.getElementById("resultCount").textContent = list.length === MACHINES.length ? MACHINES.length + " máquinas" : list.length + " de " + MACHINES.length + " máquinas";
    document.getElementById("clearFilters").hidden = !(n || query);
    var fc = document.getElementById("filterCount"); if (fc) fc.textContent = n ? "(" + n + ")" : "";
    if (!list.length) {
      grid.innerHTML = '<div class="empty"><h2>Sin resultados</h2><p>Ninguna máquina coincide con la búsqueda y los filtros elegidos. Prueba con otro nombre o quita algún filtro.</p></div>';
      return;
    }
    grid.innerHTML = list.map(cardHTML).join("");
    grid.querySelectorAll("[data-compare]").forEach(function (b) {
      b.addEventListener("click", function () {
        toggleCompare(b.dataset.compare);
        grid.querySelectorAll("[data-compare]").forEach(syncCompareBtn);
      });
    });
    grid.querySelectorAll("a[href^='#/maquina/']").forEach(function (a) {
      a.addEventListener("click", function () { lastCatalogCard = a.getAttribute("href").split("/").pop(); });
    });
  }
  function syncCompareBtn(b) {
    var on = inCompare(b.dataset.compare);
    b.setAttribute("aria-pressed", on);
    b.innerHTML = (on ? ICON.check + "En el comparador" : ICON.plus + "Agregar al comparador");
  }
  function cardHTML(m) {
    var on = inCompare(m.id);
    return '<article class="card" id="card-' + m.id + '">' +
      '<a class="stage" href="#/maquina/' + m.id + '" aria-label="Ver ficha técnica de ' + esc(m.name) + '">' +
        '<span class="stage-brand">' + esc(m.brand) + "</span>" +
        '<img src="' + m.image + '" alt="Fotografía de la ' + esc(m.name) + '" loading="lazy" decoding="async">' +
      "</a>" +
      '<div class="card-body">' +
        '<h2><a href="#/maquina/' + m.id + '">' + esc(m.name) + "</a></h2>" +
        '<p class="card-summary">' + esc(m.summary) + "</p>" +
        '<dl class="facts">' + m.keyFacts.map(function (f) { return "<div><dt>" + esc(f[0]) + "</dt><dd>" + esc(f[1]) + "</dd></div>"; }).join("") + "</dl>" +
        '<div class="card-actions">' +
          '<a class="btn btn-primary" href="#/maquina/' + m.id + '">Ver ficha técnica</a>' +
          '<button class="btn btn-ghost" type="button" data-compare="' + m.id + '" aria-pressed="' + on + '">' + (on ? ICON.check + "En el comparador" : ICON.plus + "Agregar al comparador") + "</button>" +
        "</div>" +
      "</div></article>";
  }

  /* ---------------- Ficha individual ---------------- */
  function specGroups(m) {
    var s = m.specs;
    return [
      ["Dimensiones y peso", [["Ancho", cm(s.dims.w)], ["Alto", cm(s.dims.h)], ["Profundidad", cm(s.dims.d)]].concat(s.dimsExtra).concat([["Peso", s.weight]])],
      ["Energía", [["Potencia", s.power], ["Amperaje", s.amperage]]],
      ["Pantalla e interfaz", [["Tipo de pantalla", s.display], ["Interfaz", s.interface], ["Selecciones de bebidas", s.selections]]],
      ["Capacidad de producción", [["Por hora", s.productionHour], ["Por día", s.productionDay]]],
      ["Café", [["Tipo de café", s.coffeeType], ["Capacidad del contenedor de café", s.coffeeCapacity], ["Contenedores de café", s.coffeeContainers], ["Molino", s.grinder]]],
      ["Productos solubles", [["Contenedores de solubles", s.solubleAvail], ["Cantidad", s.solubleCount], ["Productos", s.solubleTypes], ["Capacidad por contenedor", s.solubleCapacity]]],
      ["Agua y residuos", [["Depósito de agua", s.waterTank], ["Alimentación de agua", s.waterSupply], ["Capacidad de residuos", s.waste], ["Bandeja de aguas residuales", s.wasteTray]]],
      ["Sistema de leche", [["Sistema de leche", s.milkSystem], ["Leche líquida", s.milkLiquid], ["Leche en polvo o soluble", s.milkPowder]]],
      ["Otras características", [["Sistema de limpieza", s.cleaning], ["Otras", s.other]]]
    ];
  }

  function renderDetail(m) {
    var on = inCompare(m.id);
    var others = MACHINES.filter(function (x) { return x.id !== m.id; });
    app.innerHTML =
      '<div class="view"><div class="wrap">' +
      '<a class="back" href="#/">' + ICON.back + "Volver al catálogo</a>" +
      '<section class="detail-hero">' +
        heroMediaHTML(m) +
        '<div class="detail-info">' +
          '<p class="detail-brand">' + esc(m.brand) + "</p>" +
          "<h1>" + esc(m.name) + "</h1>" +
          '<p class="detail-subtitle">' + esc(m.subtitle) + "</p>" +
          '<p class="detail-summary">' + esc(m.summary) + "</p>" +
          '<ul class="highlights">' + m.features.slice(0, 6).map(function (f) { return "<li>" + featureIcon(f) + "<span>" + esc(f) + "</span></li>"; }).join("") + "</ul>" +
          '<div class="detail-actions">' +
            '<button class="btn btn-ghost" type="button" id="detailCompare" data-compare="' + m.id + '" aria-pressed="' + on + '">' + (on ? ICON.check + "En el comparador" : ICON.plus + "Agregar al comparador") + "</button>" +
            '<div class="compare-with"><label for="cmpWith">Comparar con</label>' +
              '<select class="select" id="cmpWith"><option value="">Elegir máquina…</option>' +
                others.map(function (o) { return '<option value="' + o.id + '">' + esc(o.name) + "</option>"; }).join("") +
              "</select></div>" +
          "</div>" +
        "</div>" +
      "</section>" +

      '<section class="section" aria-labelledby="h-specs"><div class="section-head"><h2 id="h-specs">Especificaciones técnicas</h2>' +
        '<p class="section-note">«No especificado» indica que la ficha técnica no informa el dato; no significa que la función no exista.</p></div>' +
        '<div class="spec-groups">' + specGroups(m).map(function (g) {
          return '<div class="spec-group"><h3>' + g[0] + '</h3><dl class="spec-list">' +
            g[1].map(function (r) { return "<div><dt>" + esc(r[0]) + "</dt><dd>" + val(r[1]) + "</dd></div>"; }).join("") + "</dl></div>";
        }).join("") + "</div></section>" +

      '<section class="section" aria-labelledby="h-drinks"><div class="section-head"><h2 id="h-drinks">Bebidas disponibles</h2>' +
        '<p class="section-note">' + m.drinks.length + " bebidas, con los nombres indicados en la ficha.</p></div>" +
        '<ul class="drinks">' + m.drinks.map(function (d) { return '<li class="drink">' + drinkIcon(d) + "<span>" + esc(d) + "</span></li>"; }).join("") + "</ul></section>" +

      '<section class="section" aria-labelledby="h-feat"><div class="section-head"><h2 id="h-feat">Características destacadas</h2></div>' +
        '<ul class="features">' + m.features.map(function (f) { return "<li>" + featureIcon(f) + "<span>" + esc(f) + "</span></li>"; }).join("") + "</ul></section>" +

      '<section class="section" aria-labelledby="h-media"><div class="section-head"><h2 id="h-media">Fotografía y visualización</h2></div>' +
        '<div class="media-grid">' +
          '<div class="media-card"><div class="stage"><img src="' + m.image + '" alt="Fotografía de la ' + esc(m.name) + '" loading="lazy"></div>' +
            '<div class="media-card-body"><div><h3>Fotografía del equipo</h3><p>Extraída de la ficha técnica.</p></div>' +
            '<button class="btn btn-ghost" type="button" data-zoom="photo">Ampliar</button></div></div>' +
          '<div class="media-card">' + viewerHTML(m) +
            '<div class="media-card-body"><div><h3>Vista 360° o modelo 3D</h3><p>' + (m.media.model3d ? "Modelo 3D interactivo disponible." : m.media.spin360.length ? "Arrastra para girar el equipo." : "Pendiente de material fotográfico o modelo 3D.") + "</p></div>" +
              (m.media.model3d ? '<button class="btn btn-ghost" type="button" id="open3d">Abrir vista 3D</button>' : "") + "</div></div>" +
          '<div class="media-card"><div class="stage"><img class="ficha-thumb" src="' + m.ficha + '" alt="Ficha técnica original de la ' + esc(m.name) + '" loading="lazy"></div>' +
            '<div class="media-card-body"><div><h3>Ficha técnica original</h3><p>Documento fuente de esta información.</p></div>' +
            '<button class="btn btn-ghost" type="button" data-zoom="ficha">Ver ficha</button></div></div>' +
        "</div></section>" +

      (m.notes.length ?
        '<section class="section" aria-labelledby="h-notes"><div class="section-head"><h2 id="h-notes">Observaciones para revisión</h2>' +
          '<p class="section-note">Diferencias o datos por confirmar detectados en la ficha. Se muestran tal como aparecen, sin corregirlos.</p></div>' +
          '<ul class="notes">' + m.notes.map(function (n) { return "<li>" + ICON.note + "<span>" + esc(n) + "</span></li>"; }).join("") + "</ul></section>" : "") +
      "</div></div>";

    var btn = document.getElementById("detailCompare");
    btn.addEventListener("click", function () { toggleCompare(m.id); syncCompareBtn(btn); });
    document.getElementById("cmpWith").addEventListener("change", function (e) {
      if (!e.target.value) return;
      go("#/comparar/" + m.id + "/" + e.target.value);
    });
    initHeroMedia(m);
    app.querySelectorAll("[data-zoom]").forEach(function (b) {
      b.addEventListener("click", function () {
        if (b.dataset.zoom === "ficha") openLightbox(m.ficha, "Ficha técnica · " + m.name);
        else openLightbox(m.image, m.name);
      });
    });
    initViewer(m);
  }

  /* ---------- Medios del encabezado: vista 3D / fotografías ---------- */
  var currentViewer = null;
  function destroyViewer() { if (currentViewer) { currentViewer.destroy(); currentViewer = null; } }
  function heroPhotos(m) {
    return [{ src: m.image, alt: "Fotografía de la " + m.name + " (ficha técnica)", cutout: true }].concat(m.media.photos || []);
  }
  function heroMediaHTML(m) {
    var has3d = !!m.media.model3d, photos = heroPhotos(m);
    var tabs = has3d ? '<div class="media-tabs" role="tablist" aria-label="Tipo de visualización">' +
      '<button type="button" role="tab" id="tab-3d" data-hero="3d" aria-controls="heroStage">Vista 3D</button>' +
      '<button type="button" role="tab" id="tab-photos" data-hero="photos" aria-controls="heroStage">Fotografías</button></div>' : "";
    var thumbs = photos.length > 1 ? '<div class="thumbs" id="heroThumbs" role="group" aria-label="Fotografías">' + photos.map(function (p, i) {
      return '<button type="button" class="thumb' + (p.cutout ? " cutout" : "") + '" data-photo="' + i + '" aria-label="' + esc(p.alt) + '"><img src="' + p.src + '" alt="" loading="lazy"></button>';
    }).join("") + "</div>" : "";
    return '<div class="hero-media">' + tabs + '<div class="stage" id="heroStage"></div>' + thumbs +
      (has3d ? '<p class="media-caption" id="heroCaption"></p>' : "") + "</div>";
  }
  var heroPhotoIdx = 0;
  function setHeroMode(m, mode) {
    var stage = document.getElementById("heroStage"); if (!stage) return;
    destroyViewer();
    var photos = heroPhotos(m), thumbs = document.getElementById("heroThumbs"), cap = document.getElementById("heroCaption");
    app.querySelectorAll("[data-hero]").forEach(function (b) { b.setAttribute("aria-selected", b.dataset.hero === mode); b.tabIndex = b.dataset.hero === mode ? 0 : -1; });
    stage.classList.toggle("stage-3d", mode === "3d");
    stage.classList.remove("stage-photo");
    if (thumbs) thumbs.hidden = mode === "3d";
    if (mode === "3d") {
      stage.innerHTML = '<div class="v3d-host"></div>';
      currentViewer = ProductViewer3D.mount(stage.firstChild, { src: m.media.model3d, build: m.media.model3dBuild ? window[m.media.model3dBuild] : null, poster: m.image, alt: m.name, vendor: "assets/vendor/three/" });
      if (cap) cap.textContent = m.media.model3dNote || "";
      return;
    }
    var p = photos[heroPhotoIdx] || photos[0];
    stage.classList.toggle("stage-photo", !p.cutout);
    stage.innerHTML = '<img id="heroImg" src="' + p.src + '" alt="' + esc(p.alt) + '">';
    stage.firstChild.addEventListener("click", function () { openLightbox(p.src, p.alt); });
    if (thumbs) thumbs.querySelectorAll("[data-photo]").forEach(function (t) { t.setAttribute("aria-pressed", +t.dataset.photo === heroPhotoIdx); });
    if (cap) cap.textContent = p.cutout ? "Fotografía extraída de la ficha técnica." : "Fotografía real del equipo instalado.";
  }
  function initHeroMedia(m) {
    heroPhotoIdx = 0;
    app.querySelectorAll("[data-hero]").forEach(function (b) { b.addEventListener("click", function () { setHeroMode(m, b.dataset.hero); }); });
    var tl = app.querySelector(".media-tabs");
    if (tl) tl.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      var next = app.querySelector('[data-hero]:not([aria-selected="true"])'); if (next) { next.click(); next.focus(); }
    });
    var th = document.getElementById("heroThumbs");
    if (th) th.addEventListener("click", function (e) {
      var b = e.target.closest("[data-photo]"); if (!b) return;
      heroPhotoIdx = +b.dataset.photo; setHeroMode(m, "photos");
    });
    setHeroMode(m, m.media.model3d && window.ProductViewer3D ? "3d" : "photos");
  }

  /* Visor 360° / 3D: solo se activa con material real (model3d o spin360). */
  function viewerHTML(m) {
    if (m.media.model3d) return '<div class="viewer-off viewer-on"><div>' + ICON.cube + "<strong>Modelo 3D disponible</strong>Gíralo, acércalo y revisa cada lado del equipo en la parte superior de esta ficha.</div></div>";
    if (m.media.spin360 && m.media.spin360.length > 1) return '<div class="spin" id="spin" role="img" aria-label="Vista 360° de la ' + esc(m.name) + '"><img src="' + m.media.spin360[0] + '" alt=""></div>';
    return '<div class="viewer-off">' + '<div>' + ICON.cube + "<strong>Visor desactivado</strong>Se habilitará cuando se incorpore un modelo 3D o una secuencia fotográfica de 360° del equipo.</div></div>";
  }
  function initViewer(m) {
    var o3 = document.getElementById("open3d");
    if (o3) o3.addEventListener("click", function () { setHeroMode(m, "3d"); window.scrollTo({ top: 0, behavior: "smooth" }); });
    if (m.media.spin360 && m.media.spin360.length > 1) {
      var el = document.getElementById("spin"), img = el.querySelector("img"), frames = m.media.spin360;
      frames.forEach(function (f) { var i = new Image(); i.src = f; });
      var idx = 0, startX = null, startIdx = 0;
      el.addEventListener("pointerdown", function (e) { startX = e.clientX; startIdx = idx; el.setPointerCapture(e.pointerId); el.style.cursor = "grabbing"; });
      el.addEventListener("pointermove", function (e) {
        if (startX == null) return;
        var step = Math.round((e.clientX - startX) / 8);
        idx = ((startIdx - step) % frames.length + frames.length) % frames.length; img.src = frames[idx];
      });
      el.addEventListener("pointerup", function () { startX = null; el.style.cursor = ""; });
    }
  }

  /* ---------------- Comparador ---------------- */
  function canonDrink(name) {
    var n = strip(name).trim()
      .replace(/\bespreso\b/g, "espresso")
      .replace(/\bcapuccino\b/g, "cappuccino")
      .replace(/\bmokaccino\b/g, "mocaccino");
    if (n === "cortado") n = "cafe cortado";
    return n;
  }

  function compareSections(A, B) {
    var a = A.specs, b = B.specs;
    function row(label, f) { return [label, f(a), f(b)]; }
    function extra(s) { return s.dimsExtra.length ? s.dimsExtra.map(function (x) { return x[0] + ": " + x[1]; }) : NE; }
    return [
      { id: "dims", title: "Dimensiones", rows: [
        row("Ancho", function (s) { return cm(s.dims.w); }),
        row("Alto", function (s) { return cm(s.dims.h); }),
        row("Profundidad", function (s) { return cm(s.dims.d); }),
        row("Peso", function (s) { return s.weight; }),
        row("Medidas y espacios adicionales", extra)
      ] },
      { id: "coffee", title: "Sistema de café", rows: [
        row("Café en grano o soluble", function (s) { return s.coffeeType; }),
        row("Capacidad del contenedor de café", function (s) { return s.coffeeCapacity; }),
        row("Cantidad de contenedores de café", function (s) { return s.coffeeContainers; }),
        row("Molino de café", function (s) { return s.grinder; })
      ] },
      { id: "soluble", title: "Productos solubles", rows: [
        row("Contenedores para solubles", function (s) { return s.solubleAvail; }),
        row("Cantidad de contenedores", function (s) { return s.solubleCount; }),
        row("Productos compatibles indicados", function (s) { return s.solubleTypes; }),
        row("Capacidad de cada contenedor", function (s) { return s.solubleCapacity; })
      ] },
      { id: "milk", title: "Sistema de leche", rows: [
        row("Leche líquida", function (s) { return s.milkLiquid; }),
        row("Leche en polvo o soluble", function (s) { return s.milkPowder; }),
        row("Sistema de preparación", function (s) { return s.milkSystem; })
      ] },
      { id: "cap", title: "Capacidad", rows: [
        row("Producción diaria recomendada", function (s) { return s.productionDay; }),
        row("Producción por hora", function (s) { return s.productionHour; }),
        row("Depósito de agua", function (s) { return s.waterTank; }),
        row("Capacidad de residuos", function (s) { return s.waste; }),
        row("Bandeja de aguas residuales", function (s) { return s.wasteTray; })
      ] },
      { id: "gen", title: "Características generales", rows: [
        row("Pantalla", function (s) { return s.display; }),
        row("Interfaz", function (s) { return s.interface; }),
        row("Potencia", function (s) { return s.power; }),
        row("Amperaje", function (s) { return s.amperage; }),
        row("Sistema de limpieza", function (s) { return s.cleaning; }),
        row("Alimentación de agua", function (s) { return s.waterSupply; }),
        row("Otras características", function (s) { return s.other; })
      ] }
    ];
  }

  function headHTML(slot, m, other) {
    var opts = '<option value="">' + (m ? "Quitar selección" : "Elegir máquina…") + "</option>" +
      MACHINES.map(function (x) {
        var dis = other && x.id === other.id;
        return '<option value="' + x.id + '"' + (m && x.id === m.id ? " selected" : "") + (dis ? " disabled" : "") + ">" + esc(x.name) + (dis ? " (ya seleccionada)" : "") + "</option>";
      }).join("");
    var tag = '<span class="cmp-tag ' + slot + '" aria-hidden="true">' + slot.toUpperCase() + "</span>";
    var sel = '<label class="visually-hidden" for="sel-' + slot + '">Máquina ' + slot.toUpperCase() + '</label><select class="select" id="sel-' + slot + '" data-slot="' + slot + '">' + opts + "</select>";
    if (!m) return '<div class="cmp-head"><div class="cmp-head-bar">' + tag + sel + '</div><div class="cmp-empty"><p>Elige una máquina en el selector superior.</p></div></div>';
    return '<div class="cmp-head"><div class="cmp-head-bar">' + tag + sel + "</div>" +
      '<a class="stage" href="#/maquina/' + m.id + '"><img src="' + m.image + '" alt="Fotografía de la ' + esc(m.name) + '"></a>' +
      "<h2>" + esc(m.name) + "</h2>" +
      '<p class="card-summary">' + esc(m.summary) + "</p>" +
      '<div class="cmp-head-links"><a href="#/maquina/' + m.id + '">Ver ficha técnica</a><button class="link-btn" type="button" data-remove="' + slot + '">Quitar de la comparación</button></div>' +
      "</div>";
  }

  function renderCompare() {
    var A = byId[compare[0]] || null, B = byId[compare[1]] || null;
    var both = A && B;
    var html = '<div class="view"><div class="wrap">' +
      '<a class="back" href="#/">' + ICON.back + "Volver al catálogo</a>" +
      '<section class="compare-top"><h1>Comparador</h1>' +
        "<p>Selecciona dos máquinas para ver sus características técnicas lado a lado. Puedes cambiar cualquiera de ellas desde su selector.</p>" +
      "</section>" +
      '<div class="cmp-heads">' + headHTML("a", A, B) +
        '<button class="icon-btn swap" type="button" id="swapBtn" aria-label="Intercambiar máquinas A y B"' + (both ? "" : " disabled") + ">" + ICON.swap + "</button>" +
        headHTML("b", B, A) + "</div>";

    if (!both) {
      html += '<p class="cmp-hint">' + (A || B ? "Elige una segunda máquina para ver la comparación." : "Elige dos máquinas para comenzar la comparación.") + "</p></div></div>";
      app.innerHTML = html; bindCompare(); return;
    }

    var secs = compareSections(A, B);
    html += '<div class="cmp-controls">' +
        '<label class="switch"><input type="checkbox" id="onlyDiff"' + (onlyDiff ? " checked" : "") + "> Mostrar solo las diferencias</label>" +
        '<div class="legend"><span><i style="background:var(--gold-soft);box-shadow:inset 3px 0 0 var(--gold)"></i>Fila con valores distintos</span><span class="ne">No especificado: dato no informado en la ficha</span></div>' +
      "</div>" +
      '<div id="cmpBody" class="' + (onlyDiff ? "only-diff" : "") + '">';

    secs.forEach(function (sec) {
      var allSame = true;
      var rows = sec.rows.map(function (r) {
        var same = strip(rawVal(r[1])) === strip(rawVal(r[2]));
        if (!same) allSame = false;
        return '<tr class="' + (same ? "same" : "differs") + '"><th scope="row">' + esc(r[0]) + "</th><td>" + val(r[1]) + "</td><td>" + val(r[2]) + "</td></tr>";
      }).join("");
      html += '<section class="cmp-section' + (allSame ? " all-same" : "") + '" aria-labelledby="c-' + sec.id + '"><h2 id="c-' + sec.id + '">' + sec.title + "</h2>" +
        '<table class="cmp-table"><thead class="visually-hidden"><tr><th>Característica</th><th>' + esc(A.name) + "</th><th>" + esc(B.name) + "</th></tr></thead><tbody>" + rows + "</tbody></table>" +
        (sec.id === "dims" ? dimsVizHTML(A, B) : "") + "</section>";
    });

    html += drinksHTML(A, B) + "</div>" + '<div style="height:4rem"></div></div></div>';
    app.innerHTML = html;
    bindCompare();

    document.getElementById("onlyDiff").addEventListener("change", function (e) {
      onlyDiff = e.target.checked; document.getElementById("cmpBody").classList.toggle("only-diff", onlyDiff);
    });
    app.querySelectorAll("[data-dims]").forEach(function (b) {
      b.addEventListener("click", function () {
        dimsMode = b.dataset.dims;
        app.querySelectorAll("[data-dims]").forEach(function (x) { x.setAttribute("aria-pressed", x.dataset.dims === dimsMode); });
        document.getElementById("dimsSvg").innerHTML = dimsSVG(A, B, dimsMode);
      });
    });
  }

  function bindCompare() {
    app.querySelectorAll("select[data-slot]").forEach(function (s) {
      s.addEventListener("change", function () {
        var i = s.dataset.slot === "a" ? 0 : 1;
        var next = [compare[0] || "", compare[1] || ""];
        next[i] = s.value;
        setCompareAndRoute(next);
      });
    });
    app.querySelectorAll("[data-remove]").forEach(function (b) {
      b.addEventListener("click", function () {
        var i = b.dataset.remove === "a" ? 0 : 1;
        var next = [compare[0] || "", compare[1] || ""]; next[i] = "";
        setCompareAndRoute(next);
      });
    });
    var sw = document.getElementById("swapBtn");
    if (sw) sw.addEventListener("click", function () { if (compare.length === 2) setCompareAndRoute([compare[1], compare[0]]); });
  }
  function setCompareAndRoute(next) {
    // Mantiene la posición de cada ranura: si A queda vacía y B no, B pasa a ser A.
    compare = next.filter(Boolean).slice(0, 2);
    store.set("cc-compare", compare);
    var h = "#/comparar" + (compare.length ? "/" + compare.join("/") : "");
    if (location.hash !== h) history.replaceState(null, "", h);
    renderCompare(); updateNav(); renderTray();
  }

  /* Representación proporcional de dimensiones (1 unidad SVG = 1 cm). */
  function dimsVizHTML(A, B) {
    var wa = num(A.specs.weight), wb = num(B.specs.weight), wmax = Math.max(wa || 0, wb || 0) || 1;
    function wrow(m, w, color) {
      return '<div class="weight-row"><span>' + esc(m.name) + '</span><div class="bar">' + (w ? '<i style="width:' + (w / wmax * 100) + "%;background:" + color + '"></i>' : "") + "</div>" +
        (w ? "<span>" + esc(m.specs.weight) + "</span>" : '<span class="ne">' + NE + "</span>") + "</div>";
    }
    return '<div class="dims-viz"><div class="dims-viz-head"><div class="legend">' +
        '<span><i style="background:var(--a)"></i>A · ' + esc(A.name) + "</span>" +
        '<span><i style="background:var(--b)"></i>B · ' + esc(B.name) + "</span></div>" +
        '<div class="seg" role="group" aria-label="Modo de visualización"><button type="button" data-dims="side" aria-pressed="' + (dimsMode === "side") + '">Lado a lado</button><button type="button" data-dims="overlay" aria-pressed="' + (dimsMode === "overlay") + '">Superpuestas</button></div></div>' +
      '<div class="dims-svg-wrap" id="dimsSvg">' + dimsSVG(A, B, dimsMode) + "</div>" +
      '<p class="dims-caption">Escala común para ambas vistas. Cuadrícula cada 10 cm. Rectángulos construidos con las medidas de las fichas; no representan la forma exacta del equipo.</p>' +
      '<div class="weights" aria-label="Peso">' + wrow(A, wa, "var(--a)") + wrow(B, wb, "var(--b)") + "</div></div>";
  }
  function dimsSVG(A, B, mode) {
    var a = A.specs.dims, b = B.specs.dims, side = mode === "side";
    var gap = 10, axis = 12, blockGap = 24, top = 12, bottom = 12, padR = 6;
    var frontW = side ? a.w + gap + b.w : Math.max(a.w, b.w);
    var topW = frontW;
    var maxV = Math.max(a.h, b.h, a.d, b.d);
    var W = axis + frontW + blockGap + topW + padR, H = top + maxV + bottom;
    var floor = top + maxV;
    var out = [];
    out.push('<svg class="dims-svg" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Comparación proporcional de dimensiones: ' +
      esc(A.name) + " " + cm(a.w) + " × " + cm(a.h) + " × " + cm(a.d) + "; " + esc(B.name) + " " + cm(b.w) + " × " + cm(b.h) + " × " + cm(b.d) + '">');
    out.push("<style>.g{stroke:var(--line);stroke-width:.25}.gt{fill:var(--muted);font-size:2.6px}.t{font-size:3px;fill:var(--ink)}.tt{font-size:3.2px;font-weight:600;fill:var(--ink)}" +
      ".ra{fill:color-mix(in srgb,var(--a) 12%,transparent);stroke:var(--a);stroke-width:.5}.rb{fill:color-mix(in srgb,var(--b) 18%,transparent);stroke:var(--b);stroke-width:.5}" +
      ".ov .rb{stroke-dasharray:1.4 .9}.la{fill:var(--a)}.lb{fill:var(--gold-ink)}</style>");
    for (var y = 0; y <= maxV; y += 10) {
      var yy = floor - y;
      out.push('<line class="g" x1="' + axis + '" x2="' + (W - padR) + '" y1="' + yy + '" y2="' + yy + '"/>');
      out.push('<text class="gt" x="' + (axis - 1.5) + '" y="' + (yy + 0.9) + '" text-anchor="end">' + y + "</text>");
    }
    out.push('<line x1="' + axis + '" x2="' + (W - padR) + '" y1="' + floor + '" y2="' + floor + '" stroke="var(--ink)" stroke-width=".4"/>');

    function block(x0, title, dimA, dimB, vA, vB) {
      out.push('<text class="tt" x="' + x0 + '" y="' + (top - 5) + '">' + title + "</text>");
      var g = '<g class="' + (side ? "" : "ov") + '">';
      var xa = x0, xb = side ? x0 + dimA + gap : x0;
      g += '<rect class="ra" x="' + xa + '" y="' + (floor - vA) + '" width="' + dimA + '" height="' + vA + '"/>';
      g += '<rect class="rb" x="' + xb + '" y="' + (floor - vB) + '" width="' + dimB + '" height="' + vB + '"/>';
      if (side) {
        g += '<text class="t la" x="' + (xa + dimA / 2) + '" y="' + (floor - vA - 1.5) + '" text-anchor="middle">' + fmt(dimA) + " × " + fmt(vA) + "</text>";
        g += '<text class="t lb" x="' + (xb + dimB / 2) + '" y="' + (floor - vB - 1.5) + '" text-anchor="middle">' + fmt(dimB) + " × " + fmt(vB) + "</text>";
        g += '<text class="t la" x="' + (xa + dimA / 2) + '" y="' + (floor + 5) + '" text-anchor="middle">A</text>';
        g += '<text class="t lb" x="' + (xb + dimB / 2) + '" y="' + (floor + 5) + '" text-anchor="middle">B</text>';
      } else {
        g += '<text class="t la" x="' + (x0 + 1) + '" y="' + (floor + 5) + '">A ' + fmt(dimA) + " × " + fmt(vA) + "</text>";
        g += '<text class="t lb" x="' + (x0 + 1) + '" y="' + (floor + 9.5) + '">B ' + fmt(dimB) + " × " + fmt(vB) + "</text>";
      }
      out.push(g + "</g>");
    }
    function fmt(n) { return String(n).replace(".", ","); }
    block(axis + 2, "Vista frontal: ancho × alto (cm)", a.w, b.w, a.h, b.h);
    block(axis + 2 + frontW + blockGap, "Vista superior: ancho × profundidad (cm)", a.w, b.w, a.d, b.d);
    out.push("</svg>");
    return out.join("");
  }

  function drinksHTML(A, B) {
    var mapA = {}, mapB = {};
    A.drinks.forEach(function (d) { mapA[canonDrink(d)] = d; });
    B.drinks.forEach(function (d) { mapB[canonDrink(d)] = d; });
    var both = [], onlyA = [], onlyB = [];
    Object.keys(mapA).forEach(function (k) { if (mapB[k]) both.push([mapA[k], mapB[k]]); else onlyA.push(mapA[k]); });
    Object.keys(mapB).forEach(function (k) { if (!mapA[k]) onlyB.push(mapB[k]); });
    function li(d, alt) { return "<li>" + drinkIcon(d) + "<span>" + esc(d) + (alt && alt !== d ? ' <small>(en B: «' + esc(alt) + "»)</small>" : "") + "</span></li>"; }
    function col(title, tag, items) {
      return '<div class="drink-col"><h3>' + tag + title + " <small>(" + items.length + ")</small></h3>" +
        (items.length ? "<ul>" + items.join("") + "</ul>" : '<p class="none">Ninguna</p>') + "</div>";
    }
    var tA = '<span class="cmp-tag a" style="width:22px;height:22px;font-size:.72rem">A</span>';
    var tB = '<span class="cmp-tag b" style="width:22px;height:22px;font-size:.72rem">B</span>';
    return '<section class="cmp-section" aria-labelledby="c-drinks"><h2 id="c-drinks">Bebidas</h2>' +
      '<p class="section-note" style="margin-bottom:1.25rem">Según los listados de cada ficha. Se unificaron solo variantes ortográficas del mismo nombre (por ejemplo, «Espreso» y «Espresso»); nombres distintos se muestran por separado.</p>' +
      '<div class="drink-cmp">' +
        col("En ambas fichas", "", both.map(function (p) { return li(p[0], p[1]); })) +
        col("Solo en " + esc(A.name), tA, onlyA.map(function (d) { return li(d); })) +
        col("Solo en " + esc(B.name), tB, onlyB.map(function (d) { return li(d); })) +
      "</div></section>";
  }

  /* ---------------- Bandeja del comparador ---------------- */
  function renderTray() {
    var tray = document.getElementById("tray");
    var r = parseRoute();
    if (!compare.length || r.name === "compare") { tray.hidden = true; tray.innerHTML = ""; return; }
    var slots = [0, 1].map(function (i) {
      var m = byId[compare[i]];
      if (!m) return '<div class="tray-slot empty-slot">Elige otra máquina</div>';
      return '<div class="tray-slot"><img src="' + m.image + '" alt=""><span>' + esc(m.name) + '</span><button type="button" data-tray-remove="' + m.id + '" aria-label="Quitar ' + esc(m.name) + ' del comparador">' + ICON.close + "</button></div>";
    }).join("");
    tray.hidden = false;
    tray.innerHTML = '<span class="tray-label">Comparar</span><div class="tray-slots">' + slots + "</div>" +
      '<a class="btn btn-primary" href="#/comparar/' + compare.join("/") + '">' + (compare.length === 2 ? "Comparar" : "Abrir comparador") + "</a>";
    tray.querySelectorAll("[data-tray-remove]").forEach(function (b) {
      b.addEventListener("click", function () {
        toggleCompare(b.dataset.trayRemove);
        app.querySelectorAll("[data-compare]").forEach(syncCompareBtn);
      });
    });
  }

  /* ---------------- Lightbox ---------------- */
  var lb = document.getElementById("lightbox");
  function openLightbox(src, title) {
    document.getElementById("lightboxImg").src = src;
    document.getElementById("lightboxImg").alt = title;
    document.getElementById("lightboxTitle").textContent = title;
    if (lb.showModal) lb.showModal(); else lb.setAttribute("open", "");
  }
  lb.addEventListener("click", function (e) { if (e.target === lb || e.target.closest("[data-close-lightbox]")) lb.close(); });

  window.addEventListener("hashchange", render);
  render();
})();
