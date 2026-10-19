const revisarUrl = iniciar({
  red: "YouTube",
  feed: ["/"],
  salidas: [
    ["Suscripciones", "/feed/subscriptions"],
    ["Historial", "/feed/history"],
    ["Tu contenido", "/feed/you"],
  ],
  reglas: [
    // Shorts: /shorts/ID -> inicio de YouTube.
    {
      tipo: "shorts",
      revisar: (path) => {
        const m = path.match(/^\/shorts\/([\w-]+)/);
        return m ? { id: m[1], destino: "/" } : null;
      },
    },
  ],
});

// YouTube avisa cuando termina de navegar, así reaccionamos más rápido.
document.addEventListener("yt-navigate-finish", revisarUrl);
