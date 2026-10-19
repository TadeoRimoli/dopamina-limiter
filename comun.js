// Cosas compartidas entre las páginas (YouTube, Instagram, Facebook, X, TikTok) y el popup.

// Tipos que se pueden configurar, agrupados por red (el orden es el del popup).
// unidad: "videos" (cada video distinto cuenta una vez, el default),
//         "pantallas" (cuánto scrolleaste en el feed) o "minutos" (tiempo de uso real).
const TIPOS = {
  shorts: { red: "YouTube", nombre: "Shorts", limitable: true },
  ytFeed: { red: "YouTube", nombre: "Feed (inicio)", limitable: true, unidad: "pantallas" },
  ytTiempo: { red: "YouTube", nombre: "Tiempo de uso", limitable: true, unidad: "minutos" },
  reels: { red: "Instagram", nombre: "Reels", limitable: true },
  explorar: { red: "Instagram", nombre: "Explorar", limitable: false },
  igFeed: { red: "Instagram", nombre: "Feed", limitable: true, unidad: "pantallas" },
  igTiempo: { red: "Instagram", nombre: "Tiempo de uso", limitable: true, unidad: "minutos" },
  fbreels: { red: "Facebook", nombre: "Reels", limitable: true },
  fbFeed: { red: "Facebook", nombre: "Feed", limitable: true, unidad: "pantallas" },
  fbTiempo: { red: "Facebook", nombre: "Tiempo de uso", limitable: true, unidad: "minutos" },
  xFeed: { red: "X", nombre: "Feed", limitable: true, unidad: "pantallas" },
  xTiempo: { red: "X", nombre: "Tiempo de uso", limitable: true, unidad: "minutos" },
  ttTiempo: { red: "TikTok", nombre: "Tiempo de uso", limitable: true, unidad: "minutos" },
};

const unidad = (tipo) => TIPOS[tipo].unidad || "videos";

// Lo que se usa si nunca tocaste el popup.
const DEFAULTS = {
  shorts: { modo: "bloquear", limite: 20 },
  ytFeed: { modo: "limite", limite: 30 },
  ytTiempo: { modo: "limite", limite: 60 },
  reels: { modo: "bloquear", limite: 20 },
  explorar: { modo: "permitir", limite: 20 },
  igFeed: { modo: "limite", limite: 30 },
  igTiempo: { modo: "limite", limite: 45 },
  fbreels: { modo: "bloquear", limite: 20 },
  fbFeed: { modo: "limite", limite: 30 },
  fbTiempo: { modo: "limite", limite: 45 },
  xFeed: { modo: "limite", limite: 30 },
  xTiempo: { modo: "limite", limite: 45 },
  ttTiempo: { modo: "limite", limite: 30 },
};

// Claves viejas que cambiaron de nombre, para no perder lo que ya habías configurado.
const RENOMBRADOS = { ttTiempo: "tiktok" };

// Fecha local en formato YYYY-MM-DD (los contadores arrancan de cero a la medianoche).
const hoy = () => new Date().toLocaleDateString("sv");

// Lo usado hoy se guarda en una clave por tipo ("uso.shorts" = { fecha, valor }), así dos pestañas
// de redes distintas que guardan a la vez no se pisan.
const claveUso = (tipo) => "uso." + tipo;

// Lee la config (con los defaults completados) y lo usado hoy.
// En vistos[tipo] va una lista de ids (videos) o un número (pantallas o segundos).
const leerEstado = async () => {
  const datos = await chrome.storage.local.get(["config", ...Object.keys(TIPOS).map(claveUso)]);
  const config = datos.config || {};
  const fecha = hoy();
  const conf = {};
  const vistos = { fecha };
  for (const tipo in TIPOS) {
    conf[tipo] = { ...DEFAULTS[tipo], ...(config[tipo] ?? config[RENOMBRADOS[tipo]]) };
    // Si no tiene límite, "limite" no tiene sentido: lo tratamos como permitir.
    if (!TIPOS[tipo].limitable && conf[tipo].modo === "limite") conf[tipo].modo = "permitir";
    const uso = datos[claveUso(tipo)];
    if (uso && uso.fecha === fecha) vistos[tipo] = uso.valor;
  }
  return { config: conf, vistos };
};

// ¿Se puede ver? Con id null solo dice si el tipo está bloqueado ahora.
// El id solo importa en los tipos por video (uno que ya viste hoy lo podés volver a ver).
const puedeVer = (estado, tipo, id) => {
  const { modo, limite } = estado.config[tipo];
  if (modo === "permitir") return true;
  if (modo === "bloquear") return false;
  if (unidad(tipo) === "videos") {
    const vistos = estado.vistos[tipo] || [];
    return (id && vistos.includes(id)) || vistos.length < limite;
  }
  const usado = estado.vistos[tipo] || 0;
  return usado < (unidad(tipo) === "minutos" ? limite * 60 : limite);
};

// Lee lo usado hoy de un tipo, lo cambia y lo guarda (leyendo fresco, por si otra pestaña lo cambió).
// Las escrituras de esta pestaña van en fila para que dos al mismo tiempo no se pisen.
// cambiar(valor) devuelve el valor nuevo, o undefined para no guardar nada.
let colaEscrituras = Promise.resolve();
const cambiarUso = (tipo, cambiar) =>
  (colaEscrituras = colaEscrituras
    .catch(() => {})
    .then(async () => {
      const clave = claveUso(tipo);
      const { [clave]: uso } = await chrome.storage.local.get(clave);
      const fecha = hoy();
      const valor = cambiar(uso && uso.fecha === fecha ? uso.valor : undefined);
      if (valor !== undefined) await chrome.storage.local.set({ [clave]: { fecha, valor } });
    }));

// Anota que hoy se vio este id.
const registrarVisto = (tipo, id) => cambiarUso(tipo, (lista = []) => (lista.includes(id) ? undefined : [...lista, id]));

// Suma pantallas o segundos a un tipo.
const sumar = (tipo, cantidad) => cambiarUso(tipo, (valor = 0) => valor + cantidad);

// Cartel que tapa la página. Va en un shadow DOM para que el CSS del sitio no lo toque,
// y armado con createElement (YouTube no deja usar innerHTML por Trusted Types).
const crearCapa = (salidas) => {
  const host = document.createElement("dopamina-limiter");
  const sombra = host.attachShadow({ mode: "open" });
  const estilo = document.createElement("style");
  estilo.textContent = `
    :host { all: initial; position: fixed; inset: 0; z-index: 2147483647; display: flex;
      align-items: center; justify-content: center; padding: 24px; box-sizing: border-box;
      background: #121212; color: #f2f2f2; text-align: center;
      font: 16px/1.4 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }
    h1 { margin: 0 0 8px; font-size: 22px; font-weight: 600; }
    p { margin: 0; color: #b0b0b0; }
    nav { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin-top: 16px; }
    nav:empty { display: none; }
    a { color: #f2f2f2; text-decoration: none; padding: 6px 12px; border: 1px solid #444; border-radius: 999px; }
    a:hover { background: #2a2a2a; }`;
  const titulo = document.createElement("h1");
  const detalle = document.createElement("p");
  const nav = document.createElement("nav");
  const caja = document.createElement("div");
  caja.append(titulo, detalle, nav);
  sombra.append(estilo, caja);

  return {
    mostrar(textoTitulo, textoDetalle, conSalidas) {
      titulo.textContent = textoTitulo;
      detalle.textContent = textoDetalle;
      nav.replaceChildren(
        ...(conSalidas ? salidas : []).map(([texto, href]) => {
          const a = document.createElement("a");
          a.textContent = texto;
          a.href = href;
          return a;
        })
      );
      this.asegurar();
    },
    // Si el sitio nos sacó del DOM, volvemos a entrar.
    asegurar() {
      if (!host.isConnected) document.documentElement.append(host);
    },
    ocultar() {
      host.remove();
    },
    visible: () => host.isConnected,
  };
};

// Motor genérico de las páginas. Cada sitio declara:
// - red: nombre de la red como en TIPOS (de ahí salen sus tipos de feed y de tiempo).
// - reglas: [{ tipo, revisar(path) -> { id, destino } | null }] para shorts/reels/etc.
// - feed: paths del feed principal, donde se cuentan las pantallas.
// - salidas: [[texto, href]] links que se ofrecen cuando el feed está tapado.
// Devuelve revisarUrl por si la página tiene un evento de navegación propio.
const iniciar = ({ red, reglas = [], feed = [], salidas = [] }) => {
  const html = document.documentElement;
  const propios = Object.keys(TIPOS).filter((t) => TIPOS[t].red === red);
  const tipoFeed = propios.find((t) => unidad(t) === "pantallas");
  const tipoTiempo = propios.find((t) => unidad(t) === "minutos");
  const capa = crearCapa(salidas);

  let estado = null;
  let ultimoPath = null;
  let tapado = null; // qué cartel se está mostrando, para no tocar el DOM al pedo
  const CLAVE_SESION = "dopamina-limiter-pendiente";
  let posiciones = new WeakMap(); // último scrollTop de cada cosa que scrollea
  let ultimaActividad = 0;
  const pendiente = {}; // pantallas/segundos sumados en esta pestaña que todavía no se guardaron
  const silenciados = new Set();

  const enFeed = () => feed.includes(location.pathname.replace(/(.)\/$/, "$1"));
  const bloqueado = (tipo) => tipo && !puedeVer(estado, tipo, null);
  // En modo límite y todavía sin llegar: hay que ir contando.
  const contando = (tipo) => tipo && estado && estado.config[tipo].modo === "limite" && puedeVer(estado, tipo, null);

  const buscar = (path) => {
    for (const regla of reglas) {
      const r = regla.revisar(path);
      if (r) return { tipo: regla.tipo, ...r };
    }
    return null;
  };

  // Mientras hay un cartel, los videos de abajo se pausan y se silencian (si no, siguen sonando).
  // Al sacarlo, les devolvemos el sonido solo a los que silenciamos nosotros.
  const callarVideos = (callar) => {
    if (!callar) {
      for (const video of silenciados) video.muted = false;
      silenciados.clear();
      return;
    }
    for (const video of document.querySelectorAll("video")) {
      if (!video.muted) {
        video.muted = true;
        silenciados.add(video);
      }
      if (!video.paused) video.pause();
    }
  };

  // Aplica el estado a la página: clases para el CSS y el cartel si corresponde.
  const pintar = () => {
    if (!estado) return;
    for (const tipo of propios) html.classList.toggle("ss-bloquear-" + tipo, bloqueado(tipo));
    const donde = bloqueado(tipoTiempo) ? "sitio" : enFeed() && bloqueado(tipoFeed) ? "feed" : null;
    const motivo = donde && estado.config[donde === "sitio" ? tipoTiempo : tipoFeed].modo;
    const clave = donde && donde + ":" + motivo;
    if (clave !== tapado) {
      tapado = clave;
      html.classList.toggle("ss-tapar-sitio", donde === "sitio");
      html.classList.toggle("ss-tapar-feed", donde === "feed");
      if (donde === "sitio" && motivo === "bloquear") {
        capa.mostrar(`${red} está bloqueado`, "Lo podés cambiar desde el botón de la extensión.", false);
      } else if (donde === "sitio") {
        capa.mostrar(`Llegaste a tu límite de tiempo en ${red} por hoy`, "Mañana arrancás de cero.", false);
      } else if (donde === "feed") {
        const titulo =
          motivo === "bloquear" ? `El feed de ${red} está bloqueado` : `Llegaste a tu límite de feed en ${red} por hoy`;
        capa.mostrar(titulo, "El resto del sitio sigue andando.", true);
      } else {
        capa.ocultar();
      }
    }
    if (donde) capa.asegurar();
    callarVideos(!!donde);
  };

  const chequear = (forzar) => {
    if (!estado) return;
    const path = location.pathname;
    const cambio = path !== ultimoPath;
    if (!cambio && !forzar) return;
    ultimoPath = path;
    if (cambio) {
      // Página nueva: el scroll arranca de cero (y el de la ventana desde donde está ahora,
      // así no se pierde el primer movimiento).
      posiciones = new WeakMap();
      posiciones.set(window, window.scrollY);
    }
    const r = buscar(path);
    if (r && !puedeVer(estado, r.tipo, r.id)) {
      location.replace(r.destino);
    } else if (r && r.id && estado.config[r.tipo].modo === "limite") {
      // Lo anotamos ya en el estado cacheado para no pasarnos si scrolleás rápido.
      const lista = (estado.vistos[r.tipo] ||= []);
      if (!lista.includes(r.id)) {
        lista.push(r.id);
        registrarVisto(r.tipo, r.id).catch(() => {});
      }
    }
    pintar();
  };
  const revisarUrl = () => chequear(false);

  // Relee el storage. Se llama en cada cambio (y cada pestaña guarda seguido), así que es barato:
  // una lectura, sin escribir nada, y sin perder lo pendiente de esta pestaña.
  const actualizar = async () => {
    let nuevo;
    try {
      nuevo = await leerEstado();
    } catch {
      return; // Se recargó la extensión y esta pestaña quedó huérfana.
    }
    for (const tipo in pendiente) {
      if (pendiente[tipo]) nuevo.vistos[tipo] = (nuevo.vistos[tipo] || 0) + pendiente[tipo];
    }
    estado = nuevo;
    chequear(true);
  };

  const sumarLocal = (tipo, cantidad) => {
    estado.vistos[tipo] = (estado.vistos[tipo] || 0) + cantidad;
    pendiente[tipo] = (pendiente[tipo] || 0) + cantidad;
    // Si con esto llegaste al límite, tapamos y guardamos ya (que lo vean las otras pestañas).
    if (!contando(tipo)) {
      pintar();
      guardarPendiente(tipo);
    }
  };

  const guardarPendiente = async (tipo) => {
    const n = tipo && pendiente[tipo];
    if (!n) return;
    pendiente[tipo] = 0;
    try {
      await sumar(tipo, n);
    } catch {
      pendiente[tipo] += n;
    }
  };

  // Lo que dejó pendiente la página anterior de esta pestaña (ver pagehide más abajo).
  const recuperarSesion = () => {
    try {
      const guardado = JSON.parse(sessionStorage.getItem(CLAVE_SESION) || "null");
      sessionStorage.removeItem(CLAVE_SESION);
      if (!guardado || guardado.fecha !== hoy()) return;
      for (const tipo of [tipoFeed, tipoTiempo]) {
        if (tipo && guardado.pendiente[tipo] > 0) pendiente[tipo] = (pendiente[tipo] || 0) + guardado.pendiente[tipo];
      }
      if (estado) actualizar();
    } catch {}
  };
  recuperarSesion();
  actualizar();

  // Interceptamos los clics a contenido bloqueado (todas estas páginas navegan sin recargar).
  document.addEventListener(
    "click",
    (e) => {
      if (!estado || e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
      const link = e.target.closest?.("a[href]");
      if (!link) return;
      let url;
      try {
        url = new URL(link.getAttribute("href"), location.href);
      } catch {
        return;
      }
      if (url.host !== location.host) return; // Link a otro sitio: no es cosa nuestra.
      const r = buscar(url.pathname);
      if (!r || puedeVer(estado, r.tipo, r.id)) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      location.assign(r.destino);
    },
    true
  );

  // Actividad del usuario (para el tiempo de uso real).
  const marcarActividad = () => (ultimaActividad = Date.now());
  for (const evento of ["pointerdown", "pointermove", "keydown", "wheel", "touchstart"]) {
    document.addEventListener(evento, marcarActividad, { capture: true, passive: true });
  }

  // Pantallas de feed: sumamos lo que bajás (nunca lo que subís) dividido el alto de la ventana.
  // En captura, así cuentan también los contenedores internos que scrollean.
  document.addEventListener(
    "scroll",
    (e) => {
      marcarActividad();
      const clave = e.target === document ? window : e.target;
      const y = clave === window ? window.scrollY : clave.scrollTop;
      if (typeof y !== "number") return;
      const antes = posiciones.get(clave);
      posiciones.set(clave, y);
      if (antes === undefined || !enFeed() || !contando(tipoFeed)) return;
      const pantalla = window.innerHeight || 800;
      const delta = y - antes;
      // Un salto enorme de una sola vez suele ser el sitio restaurando el scroll, no vos.
      if (delta <= 0 || delta > pantalla * 3) return;
      sumarLocal(tipoFeed, delta / pantalla);
    },
    { capture: true, passive: true }
  );

  // Cambios desde el popup u otras pestañas.
  chrome.storage.onChanged.addListener(actualizar);
  window.addEventListener("popstate", revisarUrl);

  // Si escondés la pestaña, guardamos lo pendiente.
  const guardarTodo = () => {
    guardarPendiente(tipoFeed);
    guardarPendiente(tipoTiempo);
  };
  document.addEventListener("visibilitychange", () => document.visibilityState === "hidden" && guardarTodo());

  // Al irse de la página no da el tiempo de guardar en chrome.storage (se corta a la mitad),
  // así que lo pendiente queda en el sessionStorage de la pestaña y la página que sigue lo levanta.
  window.addEventListener("pagehide", () => {
    try {
      sessionStorage.setItem(CLAVE_SESION, JSON.stringify({ fecha: hoy(), pendiente }));
      for (const tipo in pendiente) pendiente[tipo] = 0;
    } catch {
      guardarTodo();
    }
  });
  // Si la página vuelve del caché de atrás/adelante, recuperamos lo que dejamos.
  window.addEventListener("pageshow", (e) => e.persisted && recuperarSesion());

  // Ninguna avisa bien cuando cambia la URL, así que miramos cada medio segundo.
  const timer = setInterval(() => {
    if (!chrome.runtime?.id) return clearInterval(timer);
    if (estado && estado.vistos.fecha !== hoy()) {
      for (const tipo in pendiente) pendiente[tipo] = 0; // lo de ayer ya no importa
      actualizar();
    } else {
      revisarUrl();
      pintar();
    }
  }, 500);

  // Tiempo de uso real: cada 5 s, si la pestaña está a la vista, con foco, y tocaste algo
  // en el último minuto o hay un video andando. El feed se guarda cada 5 s y el tiempo cada 15 s.
  const hayVideo = () =>
    [...document.querySelectorAll("video")].some((v) => !v.paused && !v.ended && v.readyState > 2);
  let vueltas = 0;
  const reloj = setInterval(() => {
    if (!chrome.runtime?.id) return clearInterval(reloj);
    vueltas++;
    if (
      contando(tipoTiempo) &&
      document.visibilityState === "visible" &&
      document.hasFocus() &&
      (Date.now() - ultimaActividad < 60000 || hayVideo())
    ) {
      sumarLocal(tipoTiempo, 5);
    }
    guardarPendiente(tipoFeed);
    if (vueltas % 3 === 0) guardarPendiente(tipoTiempo);
  }, 5000);

  return revisarUrl;
};
