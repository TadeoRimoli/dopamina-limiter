// X (Twitter): solo límite de feed y de tiempo, no hay shorts que redirigir.
iniciar({
  red: "X",
  feed: ["/home"],
  salidas: [
    ["Mensajes", "/messages"],
    ["Notificaciones", "/notifications"],
    ["Buscar", "/explore"],
  ],
});
