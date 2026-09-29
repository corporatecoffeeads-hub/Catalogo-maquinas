/* =====================================================================
   Corporate Coffee · Catálogo de máquinas
   Fuente única de datos. Toda la información proviene de las fichas
   técnicas en PDF entregadas. Para agregar un modelo, copie un objeto,
   cambie su "id" y complete los campos. Use NE cuando la ficha no
   informe un dato ("No especificado" ≠ "No disponible").
   ===================================================================== */

var NE = "No especificado";

var MACHINES = [
  /* ------------------------------------------------------------ 1 */
  {
    id: "kalerm-1601",
    name: "Kalerm 1601",
    brand: "Kalerm",
    subtitle: "Máquina de café automática para oficinas y espacios corporativos",
    summary: "Máquina automática compacta de 40 cm de alto, con molinillo de precisión, sistema One Touch y succión de leche líquida.",
    image: "assets/img/machines/kalerm-1601.webp",
    ficha: "assets/img/fichas/kalerm-1601-ficha.webp",
    tags: { coffee: "grano", milk: "liquida", touch: true, solubles: false, waterNetwork: false, bidon: false },
    displayScale: 0.8,   // escala visual en el catálogo (Kalerm E50 Pro = 1)
    keyFacts: [
      ["Café", "En grano, tolva de 250 g"],
      ["Rendimiento", "Hasta 80 tazas por día"],
      ["Solubles", "Sin solubles"]
    ],
    specs: {
      dims: { w: 33, h: 40, d: 45 },
      dimsExtra: [],
      weight: "17 kg",
      power: "1450 W",
      amperage: "6,6 A",
      display: NE,
      interface: "Panel touch, sistema One Touch y navegación intuitiva",
      productionHour: "20 a 30 tazas por hora",
      productionDay: "Hasta 80 tazas por día",
      coffeeType: "Café en grano (la ficha indica molinillo de precisión)",
      coffeeCapacity: "250 g",
      coffeeContainers: "1 contenedor de café",
      grinder: "Molinillo de precisión",
      solubleAvail: "No (sin solubles)",
      solubleCount: "Sin solubles",
      solubleTypes: NE,
      solubleCapacity: NE,
      waterTank: "1,8 L",
      waste: "15 porciones (contenedor de desechos)",
      wasteTray: "1 L (bandeja de aguas residuales)",
      waterSupply: "Depósito de agua de 1,8 L",
      milkSystem: "Succión de leche líquida",
      milkLiquid: "Compatible",
      milkPowder: "No",
      cleaning: "Autolimpieza",
      selections: NE,
      other: ["Sistema de calentamiento dual"]
    },
    drinks: ["Espresso", "Americano", "Agua caliente", "Cappuccino", "Latte", "Leche líquida / crema"],
    features: ["Sistema One Touch", "Panel touch", "Navegación intuitiva", "Succión de leche líquida", "Autolimpieza", "Sistema de calentamiento dual", "Molinillo de precisión"],
    notes: [
      "La ficha informa las dimensiones como «Ancho × Alto × Largo». El valor «Largo» (45 cm) se presenta como profundidad."
    ],
    media: {
      model3d: "assets/models/kalerm-1601.glb",
      model3dBuild: "buildKalerm1601",
      model3dNote: "Modelo 3D reconstruido a partir de la fotografía de la ficha técnica y de sus medidas (33 × 40 × 45 cm). Los costados, la parte superior y la parte posterior son aproximados.",
      spin360: [],
      photos: []
    }
  },

  /* ------------------------------------------------------------ 2 */
  {
    id: "kalerm-pro",
    name: "Kalerm Pro",
    brand: "Kalerm",
    subtitle: "Máquina de café automática para oficinas y espacios corporativos",
    summary: "Máquina automática de 75 cm de alto con recipiente de granos de 750 g, succión de leche líquida y conexión a bidón.",
    image: "assets/img/machines/kalerm-pro.webp",
    ficha: "assets/img/fichas/kalerm-pro-ficha.webp",
    tags: { coffee: "grano", milk: "liquida", touch: true, solubles: false, waterNetwork: false, bidon: true },
    displayScale: 0.9,   // escala visual en el catálogo (Kalerm E50 Pro = 1)
    keyFacts: [
      ["Café", "En grano, tolva de 750 g"],
      ["Rendimiento", "Hasta 80 tazas por día"],
      ["Solubles", "Sin solubles"]
    ],
    specs: {
      dims: { w: 33, h: 75, d: 45 },
      dimsExtra: [],
      weight: "17 kg",
      power: "1450 W",
      amperage: "6,6 A",
      display: NE,
      interface: "Panel touch, sistema One Touch y navegación intuitiva",
      productionHour: NE,
      productionDay: "Hasta 80 tazas por día",
      coffeeType: "Café en grano",
      coffeeCapacity: "750 g (recipiente de granos de café)",
      coffeeContainers: "1 recipiente de granos",
      grinder: "Molinillo de precisión",
      solubleAvail: "No (sin solubles)",
      solubleCount: "Sin solubles",
      solubleTypes: NE,
      solubleCapacity: NE,
      waterTank: "1,8 L",
      waste: "75 porciones (contenedor de desechos)",
      wasteTray: "2 L (bandeja de aguas residuales)",
      waterSupply: "Depósito de agua de 1,8 L y conexión a bidón",
      milkSystem: "Succión de leche líquida",
      milkLiquid: "Compatible",
      milkPowder: "No",
      cleaning: "Autolimpieza",
      selections: NE,
      other: ["Sistema de calentamiento dual", "Conexión a bidón"]
    },
    drinks: ["Espresso", "Americano", "Agua caliente", "Cappuccino", "Latte", "Leche líquida / crema"],
    features: ["Sistema One Touch", "Panel touch", "Navegación intuitiva", "Succión de leche líquida", "Autolimpieza", "Sistema de calentamiento dual", "Molinillo de precisión", "Conexión a bidón"],
    notes: [
      "La ficha informa las dimensiones como «Ancho × Alto × Largo». El valor «Largo» (45 cm) se presenta como profundidad.",
      "El peso informado (17 kg) es igual al de la Kalerm 1601, aunque la altura informada es 75 cm frente a 40 cm. Se recomienda verificar con el proveedor.",
      "El rendimiento se informa por día (30 a 40 tazas); la Kalerm 1601 lo informa por hora. Se conservan las unidades originales."
    ],
    media: {
      model3d: "assets/models/kalerm-pro.glb",
      model3dBuild: "buildKalermPro",
      model3dNote: "Modelo 3D reconstruido a partir de la fotografía de la ficha técnica. Los costados y la parte posterior son aproximados.",
      spin360: [],
      photos: []
    }
  },

  /* ------------------------------------------------------------ 3 */
  {
    id: "kalerm-e50-pro",
    name: "Kalerm E50 Pro",
    brand: "Kalerm",
    subtitle: "Máquina automática de café para oficinas y espacios corporativos",
    summary: "Máquina automática de café en grano con pantalla touch de 7\", sistema de leche con espuma cremosa y rendimiento de hasta 80 tazas por día.",
    image: "assets/img/machines/kalerm-e50-pro.webp",
    ficha: "assets/img/fichas/kalerm-e50-pro-ficha.webp",
    tags: { coffee: "grano", milk: "liquida", touch: true, solubles: false, waterNetwork: false, bidon: false },
    displayScale: 1.0,   // escala visual en el catálogo (Kalerm E50 Pro = 1)
    keyFacts: [
      ["Café", "En grano, tolva de 750 g"],
      ["Rendimiento", "Hasta 80 tazas por día"],
      ["Solubles", "Sin solubles"]
    ],
    specs: {
      dims: { w: 31, h: 58, d: 53 },
      dimsExtra: [
        ["Espacio superior mínimo para abrir la tapa y cargar café", "63 cm"],
        ["Espacio adicional lado derecho para contenedor de leche", "10 cm"],
        ["Espacio adicional lado izquierdo para extraer y reponer el estanque de agua", "8 cm"],
        ["Refrigerador", "27 cm de ancho × 30 cm de profundidad × 37 cm de alto"]
      ],
      weight: NE,
      power: "1550 W",
      amperage: NE,
      display: "Pantalla touch de 7\"",
      interface: "Panel de operación simple",
      productionHour: NE,
      productionDay: "Hasta 80 tazas por día",
      coffeeType: "Café en grano",
      coffeeCapacity: "750 g",
      coffeeContainers: "1 contenedor de granos",
      grinder: "Molino de precisión",
      solubleAvail: "No (sin solubles)",
      solubleCount: "Sin solubles",
      solubleTypes: NE,
      solubleCapacity: NE,
      waterTank: "3,5 L aprox.",
      waste: "25 borras",
      wasteTray: "2 L (bandeja de aguas residuales)",
      waterSupply: "Depósito de agua de 3,5 L aprox.",
      milkSystem: "Sistema de leche con espuma de leche cremosa. Refrigerador de leche indicado en la ficha para leche refrigerada.",
      milkLiquid: "Compatible",
      milkPowder: "No",
      cleaning: "Sistema de autolimpieza",
      selections: NE,
      other: ["Considerar el ancho del refrigerador si el cliente desea la leche refrigerada (nota de la ficha)"]
    },
    drinks: ["Ristretto", "Espreso", "Espreso doble", "Long Coffee", "Americano", "Café cortado", "Café con leche", "Capuccino", "Latte", "Leche caliente", "Crema de leche", "Agua caliente"],
    features: ["Pantalla touch de 7\"", "Panel de operación simple", "Sistema de leche", "Espuma de leche cremosa", "Sistema de autolimpieza", "Molino de precisión"],
    notes: [
      "La ficha no informa peso ni amperaje."
    ],
    media: {
      model3d: "assets/models/kalerm-e50-pro.glb",
      model3dBuild: "buildKalermE50",   // si el constructor está cargado (versión de un archivo) se usa en lugar del GLB
      model3dNote: "Modelo 3D reconstruido a partir de fotografías reales y de las medidas de la ficha técnica (31 × 58 × 53 cm). Los detalles no visibles en las fotografías son aproximados.",
      spin360: [],
      photos: []
    }
  },

  /* ------------------------------------------------------------ 4 */
  {
    id: "pilot-soluble",
    name: "Pilot Soluble",
    brand: "Pilot",
    subtitle: "Máquina de café soluble automática para oficinas y espacios corporativos de alta demanda",
    summary: "Máquina de café soluble para alta demanda con 4 canisters solubles, pantalla LCD de 10,1\" y rendimiento de hasta 300 tazas por día.",
    image: "assets/img/machines/pilot-soluble.webp",
    ficha: "assets/img/fichas/pilot-soluble-ficha.webp",
    tags: { coffee: "soluble", milk: "soluble", touch: false, solubles: true, waterNetwork: true, bidon: true },
    displayScale: 1.2,   // escala visual en el catálogo (Kalerm E50 Pro = 1)
    keyFacts: [
      ["Café", "Soluble, tolva de 1 kg"],
      ["Rendimiento", "Hasta 300 tazas por día"],
      ["Solubles", "3 solubles (leche, chocolate y vainilla)"]
    ],
    specs: {
      dims: { w: 33, h: 65, d: 60 },
      dimsExtra: [],
      weight: "37 kg",
      power: "1800 W",
      amperage: "8,2 A",
      display: "Pantalla LCD de 10,1\" (muestra videos corporativos o imágenes)",
      interface: "7 botones de selección",
      productionHour: NE,
      productionDay: "Hasta 300 tazas por día",
      coffeeType: "Café soluble",
      coffeeCapacity: "1 kg",
      coffeeContainers: "1 canister de café soluble (4 canisters en total)",
      grinder: "No",
      solubleAvail: "Sí",
      solubleCount: "4 canisters",
      solubleTypes: "Café, leche, chocolate y té/vainilla (todos solubles)",
      solubleCapacity: NE,
      waterTank: NE,
      waste: NE,
      wasteTray: NE,
      waterSupply: "Conexión directa a red de agua; uso con bidón de agua purificada",
      milkSystem: "Leche en polvo (soluble)",
      milkLiquid: "No compatible",
      milkPowder: "Sí",
      cleaning: "Sí",
      selections: "7 botones de selección",
      other: ["Fácil mantenimiento", "Funcionamiento sencillo", "Alta capacidad para espacios corporativos"]
    },
    drinks: ["Espresso", "Café largo", "Americano", "Mokaccino suave", "Mokaccino intenso", "Latte", "Chocolate suave", "Chocolate intenso"],
    features: ["7 botones de selección", "Pantalla LCD de 10,1\"", "Prepara bebidas a base de café y polvos solubles", "Alta capacidad para espacios corporativos", "Funcionamiento sencillo", "Fácil mantenimiento", "Muestra videos corporativos o imágenes"],
    notes: [
      "La ficha indica «7 botones de selección», pero en la fotografía del panel se observan 8 selecciones rotuladas.",
      "Los rótulos visibles en el panel de la fotografía (por ejemplo, «Black», «Milk», «Hot Water», «Latte Macchiato») no coinciden totalmente con el listado de bebidas de la ficha.",
      "La ficha informa las dimensiones como «Ancho × Alto × Largo». El valor «Largo» (60 cm) se presenta como profundidad."
    ],
    media: { model3d: null, spin360: [] }
  },

  /* ------------------------------------------------------------ 5 */
  {
    id: "pilot-espresso",
    name: "Pilot Espresso",
    brand: "Pilot",
    subtitle: "Máquina de café automática para oficinas y espacios corporativos de alta demanda",
    summary: "Máquina de café en grano para alta demanda, con pantalla LCD de 10,1\" para videos o imágenes corporativas y rendimiento de hasta 300 tazas por día.",
    image: "assets/img/machines/pilot-espresso.webp",
    ficha: "assets/img/fichas/pilot-espresso-ficha.webp",
    tags: { coffee: "grano", milk: "soluble", touch: false, solubles: true, waterNetwork: true, bidon: true },
    displayScale: 1.3,   // escala visual en el catálogo (Kalerm E50 Pro = 1)
    keyFacts: [
      ["Café", "En grano, tolva de 1,2 kg"],
      ["Rendimiento", "Hasta 300 tazas por día"],
      ["Solubles", "2 solubles (leche y chocolate)"]
    ],
    specs: {
      dims: { w: 33, h: 80, d: 60 },
      dimsExtra: [],
      weight: "37 kg",
      power: "2100 W",
      amperage: "9,5 A",
      display: "Pantalla LCD de 10,1\" (muestra videos corporativos o imágenes)",
      interface: "7 botones de selección",
      productionHour: NE,
      productionDay: "Hasta 300 tazas por día",
      coffeeType: "Café en grano",
      coffeeCapacity: "1,2 kg (contenedor de granos)",
      coffeeContainers: "1 contenedor de granos",
      grinder: "Sí",
      solubleAvail: "Sí",
      solubleCount: "2 contenedores",
      solubleTypes: "Leche y chocolate",
      solubleCapacity: "0,8 kg cada uno",
      waterTank: NE,
      waste: NE,
      wasteTray: NE,
      waterSupply: "Conexión directa a red de agua; uso con bidón de agua purificada",
      milkSystem: "Leche en polvo (soluble)",
      milkLiquid: "No compatible",
      milkPowder: "Sí",
      cleaning: "Sí",
      selections: "7 botones de selección",
      other: ["Fácil mantenimiento", "Funcionamiento sencillo", "Alta capacidad para espacios corporativos"]
    },
    drinks: ["Espresso", "Café largo", "Cappuccino", "Cortado", "Latte", "Chocolate", "Chocolate con leche"],
    features: ["7 botones de selección", "Pantalla LCD de 10,1\"", "Prepara bebidas a base de café, leche y chocolate", "Alta capacidad para espacios corporativos", "Funcionamiento sencillo", "Fácil mantenimiento", "Muestra videos corporativos o imágenes"],
    notes: [
      "La ficha indica «7 botones de selección», pero en la fotografía del panel se observan 8 selecciones rotuladas, incluida «Hot Water», que no figura en el listado de bebidas.",
      "La ficha informa las dimensiones como «Ancho × Alto × Largo». El valor «Largo» (60 cm) se presenta como profundidad."
    ],
    media: { model3d: null, spin360: [] }
  },

  /* ------------------------------------------------------------ 6 */
  {
    id: "necta-solista",
    name: "Necta Solista",
    brand: "Necta",
    subtitle: "Máquina automática de café y bebidas calientes para oficinas y espacios corporativos",
    summary: "Café en grano y bebidas calientes con 4 canisters de solubles, incluido cappuccino vainilla, y 10 selecciones directas.",
    image: "assets/img/machines/necta-solista.webp",
    ficha: "assets/img/fichas/necta-solista-ficha.webp",
    tags: { coffee: "grano", milk: "soluble", touch: false, solubles: true, waterNetwork: false, bidon: false },
    displayScale: 1.4,   // escala visual en el catálogo (Kalerm E50 Pro = 1)
    keyFacts: [
      ["Café", "En grano, tolva de 1,2 kg"],
      ["Rendimiento", "Hasta 300 tazas por día"],
      ["Solubles", "3 solubles (leche, chocolate y vainilla)"]
    ],
    specs: {
      dims: { w: 41, h: 75, d: 56.4 },
      dimsExtra: [],
      weight: "42 kg",
      power: "1500 W",
      amperage: NE,
      display: "Display gráfico de 128 × 64 píxeles",
      interface: "10 botones de selección directa, iluminación LED en la interfaz",
      productionHour: NE,
      productionDay: "Hasta 300 tazas por día",
      coffeeType: "Café en grano",
      coffeeCapacity: "1,2 kg",
      coffeeContainers: "1 canister de café en grano (5 canisters en total)",
      grinder: "Sí",
      solubleAvail: "Sí",
      solubleCount: "4 canisters",
      solubleTypes: "Chocolate, leche, cappuccino vainilla y té",
      solubleCapacity: NE,
      waterTank: NE,
      waste: NE,
      wasteTray: NE,
      waterSupply: NE,
      milkSystem: "Leche en polvo (soluble)",
      milkLiquid: "No compatible",
      milkPowder: "Sí",
      cleaning: "Sí",
      selections: "Hasta 10 selecciones de bebidas",
      other: ["Dosificadores programables", "Diseño moderno y compacto"]
    },
    drinks: ["Espresso", "Café largo", "Americano", "Leche caliente", "Café cortado", "Cappuccino", "Latte", "Mocaccino", "Té", "Té con leche"],
    features: ["10 botones de selección directa", "Display gráfico", "Iluminación LED en la interfaz", "Diseño moderno y compacto", "Dosificadores programables"],
    notes: [
      "La ficha informa las dimensiones como «Ancho × Alto × Largo». El valor «Largo» (56,4 cm) se presenta como profundidad."
    ],
    media: {
      model3d: "assets/models/necta-solista.glb",
      model3dBuild: "buildNectaSolista",
      model3dNote: "Modelo 3D reconstruido a partir de la fotografía de la ficha técnica (41 × 75 × 56,4 cm). Los costados, la parte superior y la parte posterior son aproximados.",
      spin360: [],
      photos: []
    }
  },

  /* ------------------------------------------------------------ 7 */
  {
    id: "krea-espresso",
    name: "Krea Espresso",
    brand: "Necta",
    subtitle: "Máquina automática de café y bebidas calientes para oficinas y espacios corporativos",
    summary: "Máquina de sobremesa para café en grano y bebidas calientes, con 3 canisters de solubles (leche, chocolate y té) y 10 selecciones directas.",
    image: "assets/img/machines/krea-espresso.webp",
    ficha: "assets/img/fichas/krea-espresso-ficha.webp",
    tags: { coffee: "grano", milk: "soluble", touch: false, solubles: true, waterNetwork: false, bidon: false },
    displayScale: 1.4,   // escala visual en el catálogo (Kalerm E50 Pro = 1)
    keyFacts: [
      ["Café", "En grano, tolva de 1,2 kg"],
      ["Rendimiento", "Hasta 300 tazas por día"],
      ["Solubles", "3 solubles (leche, chocolate y vainilla)"]
    ],
    specs: {
      dims: { w: 41, h: 75, d: 56.4 },
      dimsExtra: [],
      weight: "41 kg",
      power: "1950 W",
      amperage: NE,
      display: "Display gráfico de 128 × 64 píxeles",
      interface: "10 botones de selección directa, iluminación LED en la interfaz",
      productionHour: NE,
      productionDay: "Hasta 300 tazas por día",
      coffeeType: "Café en grano",
      coffeeCapacity: "1,2 kg",
      coffeeContainers: "1 canister de café en grano (4 canisters en total)",
      grinder: "Sí",
      solubleAvail: "Sí",
      solubleCount: "3 canisters",
      solubleTypes: "Leche, chocolate y té",
      solubleCapacity: NE,
      waterTank: NE,
      waste: NE,
      wasteTray: NE,
      waterSupply: NE,
      milkSystem: "Leche en polvo (soluble)",
      milkLiquid: "No compatible",
      milkPowder: "Sí",
      cleaning: "Sí",
      selections: "Hasta 10 selecciones de bebidas",
      other: ["Iluminación LED en área de recogida", "Máquina de sobremesa", "Dosificadores programables", "Diseño moderno y compacto"]
    },
    drinks: ["Espresso", "Café largo", "Americano", "Leche caliente", "Café cortado", "Cappuccino", "Latte", "Mocaccino", "Té", "Té con leche"],
    features: ["10 botones de selección directa", "Display gráfico", "Iluminación LED en la interfaz", "Iluminación LED en área de recogida", "Diseño moderno y compacto", "Máquina de sobremesa", "Dosificadores programables"],
    notes: [
      "La ficha titula el equipo «Krea Espresso»; en la fotografía se observan los logotipos KREA y NECTA. Se clasifica bajo la marca Necta.",
      "La ficha informa las dimensiones como «Ancho × Alto × Largo». El valor «Largo» (56,4 cm) se presenta como profundidad."
    ],
    media: {
      model3d: "assets/models/krea-espresso.glb",
      model3dBuild: "buildKreaEspresso",
      model3dNote: "Modelo 3D reconstruido a partir de la fotografía de la ficha técnica (41 × 75 × 56,4 cm). Los costados, la parte superior y la parte posterior son aproximados.",
      spin360: [],
      photos: []
    }
  },

  /* ------------------------------------------------------------ 8 */
  {
    id: "necta-krea-touch",
    name: "Necta Krea Touch",
    brand: "Necta",
    subtitle: "Máquina automática de café y bebidas calientes para oficinas y espacios corporativos",
    summary: "Café en grano y bebidas calientes con pantalla touch HD de 7\", 3 contenedores de solubles y rendimiento de hasta 300 tazas por día.",
    image: "assets/img/machines/necta-krea-touch.webp",
    ficha: "assets/img/fichas/necta-krea-touch-ficha.webp",
    tags: { coffee: "grano", milk: "soluble", touch: true, solubles: true, waterNetwork: false, bidon: false },
    displayScale: 1.4,   // escala visual en el catálogo (Kalerm E50 Pro = 1)
    keyFacts: [
      ["Café", "En grano, tolva de 1,2 kg"],
      ["Rendimiento", "Hasta 300 tazas por día"],
      ["Solubles", "3 solubles (leche, chocolate y vainilla)"]
    ],
    specs: {
      dims: { w: 41, h: 75, d: 57 },
      dimsExtra: [["Profundidad con puerta abierta", "85,5 cm"]],
      weight: "39 kg",
      power: "1900 W",
      amperage: NE,
      display: "Pantalla touch HD de 7\"",
      interface: "Hasta 10 selecciones por pantalla",
      productionHour: "Hasta 100 tazas por hora",
      productionDay: "Hasta 300 tazas por día",
      coffeeType: "Café en grano",
      coffeeCapacity: "1,2 kg",
      coffeeContainers: "1 contenedor de café en grano (4 contenedores en total)",
      grinder: "Sí",
      solubleAvail: "Sí",
      solubleCount: "3 contenedores",
      solubleTypes: "Descafeinado, chocolate y leche",
      solubleCapacity: NE,
      waterTank: NE,
      waste: NE,
      wasteTray: NE,
      waterSupply: NE,
      milkSystem: "Leche en polvo (soluble)",
      milkLiquid: "No compatible",
      milkPowder: "Sí",
      cleaning: "Sí",
      selections: "Hasta 10 selecciones por pantalla",
      other: ["Caldera compacta de 500 cc", "Superficies negro brillante", "Diseño moderno y elegante"]
    },
    drinks: ["Espresso", "Café largo", "Americano", "Café cortado", "Cappuccino", "Latte", "Latte macchiato", "Chocolate", "Leche caliente", "Agua caliente"],
    features: ["Pantalla touch HD de 7\"", "Diseño moderno y elegante", "Superficies negro brillante", "Caldera compacta de 500 cc"],
    notes: [
      "La ficha informa las dimensiones como «Ancho × Alto × Largo». El valor «Largo» (57 cm) se presenta como profundidad."
    ],
    media: {
      model3d: "assets/models/necta-krea-touch.glb",
      model3dBuild: "buildNectaKreaTouch",
      model3dNote: "Modelo 3D reconstruido a partir de la fotografía de la ficha técnica y de la documentación pública del fabricante (41 × 75 × 57 cm). Los costados y la parte posterior son aproximados.",
      spin360: [],
      photos: []
    }
  }
];
