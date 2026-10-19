// Shorts: /shorts/ID -> inicio de YouTube.
const revisarUrl = iniciar([
  {
    tipo: "shorts",
    revisar: (path) => {
      const m = path.match(/^\/shorts\/([\w-]+)/);
      return m ? { id: m[1], destino: "/" } : null;
    },
  },
]);

// YouTube avisa cuando termina de navegar, así reaccionamos más rápido.
document.addEventListener("yt-navigate-finish", revisarUrl);
