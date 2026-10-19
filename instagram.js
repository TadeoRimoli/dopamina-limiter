iniciar([
  // /reel/ID o /reels/ID (también /usuario/reel/ID) -> inicio.
  {
    tipo: "reels",
    revisar: (path) => {
      const m = path.match(/^\/(?:[\w.]+\/)?reels?\/([\w-]+)/);
      return m && m[1] !== "audio" ? { id: m[1], destino: "/" } : null;
    },
  },
  // Pestaña de Reels -> inicio.
  {
    tipo: "reels",
    revisar: (path) => (/^\/reels\/?$/.test(path) ? { id: null, destino: "/" } : null),
  },
  // Explorar -> inicio.
  {
    tipo: "explorar",
    revisar: (path) => (path.startsWith("/explore") ? { id: null, destino: "/" } : null),
  },
]);
