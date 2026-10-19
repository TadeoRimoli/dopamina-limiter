// Anotamos el último /watch/?v=ID, por si Facebook nos devuelve al Reel y quedamos en un loop.
const vistoEnWatch = new URLSearchParams(location.search).get("v");
if (location.pathname.startsWith("/watch") && vistoEnWatch) sessionStorage.setItem("ss-fb-watch", vistoEnWatch);

iniciar([
  // /reel/ID (ID numérico) -> /watch/?v=ID (video normal, sin scroll infinito).
  // Si ya lo mandamos a /watch y Facebook lo devolvió, vamos al inicio.
  {
    tipo: "fbreels",
    revisar: (path) => {
      const m = path.match(/^\/reel\/(\d+)/);
      if (!m) return null;
      const rebote = sessionStorage.getItem("ss-fb-watch") === m[1];
      return { id: m[1], destino: rebote ? "/" : "/watch/?v=" + m[1] };
    },
  },
  // Pestaña de Reels (/reels/ y lo que cuelgue de ahí) -> inicio.
  {
    tipo: "fbreels",
    revisar: (path) => (/^\/reels(?:\/|$)/.test(path) ? { id: null, destino: "/" } : null),
  },
]);
