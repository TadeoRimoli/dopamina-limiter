iniciar({
  red: "Facebook",
  feed: ["/", "/home.php"],
  salidas: [
    ["Mensajes", "/messages/"],
    ["Notificaciones", "/notifications/"],
  ],
  reglas: [
    // /reel/ID (ID numérico) -> inicio.
    {
      tipo: "fbreels",
      revisar: (path) => {
        const m = path.match(/^\/reel\/(\d+)/);
        return m ? { id: m[1], destino: "/" } : null;
      },
    },
    // Pestaña de Reels (/reels/ y lo que cuelgue de ahí) -> inicio.
    {
      tipo: "fbreels",
      revisar: (path) => (/^\/reels(?:\/|$)/.test(path) ? { id: null, destino: "/" } : null),
    },
  ],
});
