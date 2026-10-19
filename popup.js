// Arma el popup una sola vez a partir de TIPOS y guarda cada cambio al toque.
const redes = document.getElementById("redes");
const filas = {}; // tipo -> { limite, contador }

// Texto al lado del número y cómo se muestra lo usado hoy, según la unidad.
const UNIDADES = {
  videos: { etiqueta: "por día", usado: (v) => (v || []).length, sufijo: "" },
  pantallas: { etiqueta: "pantallas por día", usado: (v) => Math.floor(v || 0), sufijo: " pantallas" },
  minutos: { etiqueta: "min por día", usado: (v) => Math.floor((v || 0) / 60), sufijo: " min" },
};

// Guarda un cambio leyendo la config fresca, para no pisar lo de otros tipos.
const guardar = async (tipo, cambios) => {
  const { config = {} } = await chrome.storage.local.get("config");
  config[tipo] = { ...DEFAULTS[tipo], ...config[tipo], ...cambios };
  await chrome.storage.local.set({ config });
};

const crear = (tag, props = {}, hijos = []) => {
  const el = Object.assign(document.createElement(tag), props);
  el.append(...hijos);
  return el;
};

// Solo actualiza los "Hoy: X / N", así no te interrumpe si estás escribiendo.
const actualizarContadores = async () => {
  const estado = await leerEstado();
  for (const tipo in filas) {
    const u = UNIDADES[unidad(tipo)];
    const { contador } = filas[tipo];
    contador.textContent = `Hoy: ${u.usado(estado.vistos[tipo])} / ${estado.config[tipo].limite}${u.sufijo}`;
    // El contador solo se ve en modo límite, así que puedeVer dice si ya llegaste.
    contador.classList.toggle("lleno", !puedeVer(estado, tipo, null));
  }
};

const armar = async () => {
  const { config } = await leerEstado();
  const secciones = {};

  for (const [tipo, info] of Object.entries(TIPOS)) {
    if (!secciones[info.red]) {
      secciones[info.red] = crear("section", {}, [crear("h2", { textContent: info.red })]);
      redes.append(secciones[info.red]);
    }

    const opciones = [["permitir", "Permitir"]];
    if (info.limitable) opciones.push(["limite", "Límite diario"]);
    opciones.push(["bloquear", "Bloquear"]);

    const select = crear(
      "select",
      { title: info.nombre },
      opciones.map(([valor, texto]) => crear("option", { value: valor, textContent: texto }))
    );
    select.value = config[tipo].modo;

    const fila = crear("div", { className: "fila" }, [
      crear("div", { className: "linea" }, [crear("span", { className: "nombre", textContent: info.nombre }), select]),
    ]);

    if (info.limitable) {
      const input = crear("input", { type: "number", min: 1, max: 999, value: config[tipo].limite });
      const contador = crear("span", { className: "contador" });
      const limite = crear("div", { className: "linea limite" }, [
        crear("label", {}, [input, UNIDADES[unidad(tipo)].etiqueta]),
        contador,
      ]);
      fila.append(limite);
      filas[tipo] = { limite, contador };

      input.addEventListener("change", () => {
        let n = Math.round(Number(input.value));
        if (!(n >= 1)) n = 1;
        if (n > 999) n = 999;
        input.value = n;
        guardar(tipo, { limite: n });
      });
    }

    const mostrarLimite = () => {
      if (filas[tipo]) filas[tipo].limite.hidden = select.value !== "limite";
    };
    mostrarLimite();

    select.addEventListener("change", () => {
      mostrarLimite();
      guardar(tipo, { modo: select.value });
    });

    secciones[info.red].append(fila);
  }

  await actualizarContadores();
};

armar();
chrome.storage.onChanged.addListener(actualizarContadores);
