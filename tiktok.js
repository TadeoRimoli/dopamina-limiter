// En TikTok todo es video corto y el feed no cambia la URL por video,
// así que no hay reglas de URL: el límite es por tiempo y el bloqueo es una pantalla entera.
iniciar([]);

const html = document.documentElement;
const bloqueado = () => html.classList.contains("ss-bloquear-tiktok");

// Motivo del bloqueo, para que el CSS muestre el cartel que corresponde.
const pintarMotivo = async () => {
  try {
    const { config } = await leerEstado();
    html.dataset.ssTiktok = config.tiktok.modo === "bloquear" ? "bloqueado" : "limite";
  } catch {}
};
pintarMotivo();
chrome.storage.onChanged.addListener(pintarMotivo);

// Cada 5 segundos con la pestaña a la vista y en modo límite, sumamos 5 segundos.
const reloj = setInterval(async () => {
  if (!chrome.runtime?.id) return clearInterval(reloj);
  if (document.visibilityState !== "visible") return;
  try {
    const estado = await leerEstado();
    if (estado.config.tiktok.modo !== "limite" || !puedeVer(estado, "tiktok", null)) return;
    await sumarTiempo("tiktok", 5);
  } catch {}
}, 5000);

// Los videos ocultos siguen sonando, así que mientras está bloqueado los pausamos y silenciamos.
// Al desbloquear les devolvemos el sonido a los que silenciamos nosotros.
const silenciados = new Set();
const callarVideos = setInterval(() => {
  if (!chrome.runtime?.id) return clearInterval(callarVideos);
  if (!bloqueado()) {
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
}, 500);
