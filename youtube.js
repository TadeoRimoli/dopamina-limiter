// Shorts: /shorts/ID -> /watch?v=ID (video normal, sin scroll infinito).
const revisarUrl = iniciar([
  {
    tipo: "shorts",
    revisar: (path) => {
      const m = path.match(/^\/shorts\/([\w-]+)/);
      return m ? { id: m[1], destino: "/watch?v=" + m[1] } : null;
    },
  },
]);

// YouTube avisa cuando termina de navegar, así reaccionamos más rápido.
document.addEventListener("yt-navigate-finish", revisarUrl);
