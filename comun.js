// Cosas compartidas entre las páginas (YouTube, Instagram, Facebook, TikTok) y el popup.

// Tipos de contenido que se pueden configurar, agrupados por red.
// unidad: "videos" (cuenta cada video distinto, el default) o "minutos" (cuenta tiempo).
const TIPOS = {
  shorts: { red: "YouTube", nombre: "Shorts", limitable: true },
  reels: { red: "Instagram", nombre: "Reels", limitable: true },
  explorar: { red: "Instagram", nombre: "Explorar", limitable: false },
  fbreels: { red: "Facebook", nombre: "Reels", limitable: true },
  tiktok: { red: "TikTok", nombre: "TikTok (todo el sitio)", limitable: true, unidad: "minutos" },
};

const unidad = (tipo) => TIPOS[tipo].unidad || "videos";

// Lo que se usa si nunca tocaste el popup.
const DEFAULTS = {
  shorts: { modo: "bloquear", limite: 20 },
  reels: { modo: "bloquear", limite: 20 },
  explorar: { modo: "permitir", limite: 20 },
  fbreels: { modo: "bloquear", limite: 20 },
  tiktok: { modo: "permitir", limite: 30 },
};

// Fecha local en formato YYYY-MM-DD (los contadores arrancan de cero a la medianoche).
const hoy = () => new Date().toLocaleDateString("sv");

// Lee la config (con los defaults completados) y lo visto hoy.
const leerEstado = async () => {
  const { config = {}, vistos } = await chrome.storage.local.get(["config", "vistos"]);
  const conf = {};
  for (const tipo in TIPOS) {
    conf[tipo] = { ...DEFAULTS[tipo], ...config[tipo] };
    // Si no tiene límite, "limite" no tiene sentido: lo tratamos como permitir.
    if (!TIPOS[tipo].limitable && conf[tipo].modo === "limite") conf[tipo].modo = "permitir";
  }
  const fecha = hoy();
  return { config: conf, vistos: vistos && vistos.fecha === fecha ? vistos : { fecha } };
};

// ¿Se puede ver este contenido? Con id null solo dice si el tipo está bloqueado ahora.
const puedeVer = (estado, tipo, id) => {
  const { modo, limite } = estado.config[tipo];
  if (modo === "permitir") return true;
  if (modo === "bloquear") return false;
  // Por tiempo: en vistos[tipo] van los segundos usados hoy, el id no importa.
  if (unidad(tipo) === "minutos") return (estado.vistos[tipo] || 0) < limite * 60;
  const vistos = estado.vistos[tipo] || [];
  return (id && vistos.includes(id)) || vistos.length < limite;
};

// Anota que hoy se vio este id (leyendo el estado fresco, por si otra pestaña lo cambió).
const registrarVisto = async (tipo, id) => {
  const { vistos } = await leerEstado();
  const lista = vistos[tipo] || [];
  if (lista.includes(id)) return;
  vistos[tipo] = [...lista, id];
  await chrome.storage.local.set({ vistos });
};

// Suma segundos de uso a un tipo por tiempo (también leyendo el estado fresco).
const sumarTiempo = async (tipo, segundos) => {
  const { vistos } = await leerEstado();
  vistos[tipo] = (vistos[tipo] || 0) + segundos;
  await chrome.storage.local.set({ vistos });
};

// Motor genérico de las páginas. Cada regla: { tipo, revisar(path) -> { id, destino } | null }.
// Devuelve revisarUrl por si la página tiene un evento de navegación propio.
const iniciar = (reglas) => {
  let estado = null;
  let ultimoPath = null;

  const buscar = (path) => {
    for (const regla of reglas) {
      const r = regla.revisar(path);
      if (r) return { tipo: regla.tipo, ...r };
    }
    return null;
  };

  const revisarUrl = () => {
    if (!estado) return;
    const path = location.pathname;
    if (path === ultimoPath) return;
    ultimoPath = path;
    const r = buscar(path);
    if (!r) return;
    if (!puedeVer(estado, r.tipo, r.id)) {
      location.replace(r.destino);
    } else if (r.id && estado.config[r.tipo].modo === "limite") {
      // Lo anotamos ya en el estado cacheado para no pasarnos si scrolleás rápido.
      const lista = (estado.vistos[r.tipo] ||= []);
      if (!lista.includes(r.id)) lista.push(r.id);
      registrarVisto(r.tipo, r.id).catch(() => {});
    }
  };

  const actualizar = async () => {
    try {
      estado = await leerEstado();
    } catch {
      return; // Se recargó la extensión y esta pestaña quedó huérfana.
    }
    for (const tipo in TIPOS) {
      document.documentElement.classList.toggle("ss-bloquear-" + tipo, !puedeVer(estado, tipo, null));
    }
    ultimoPath = null;
    revisarUrl();
  };

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

  // Cambios desde el popup u otras pestañas.
  chrome.storage.onChanged.addListener(actualizar);
  window.addEventListener("popstate", revisarUrl);

  // Ninguna avisa bien cuando cambia la URL, así que miramos cada medio segundo.
  const timer = setInterval(() => {
    if (!chrome.runtime?.id) return clearInterval(timer);
    if (estado && estado.vistos.fecha !== hoy()) actualizar();
    else revisarUrl();
  }, 500);

  return revisarUrl;
};
