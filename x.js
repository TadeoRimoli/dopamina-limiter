// X (Twitter): solo límite de feed y de tiempo, no hay shorts que redirigir.
iniciar({
  red: "X",
  feed: ["/home"],
  salidas: [
    ["Mensajes", "/i/chat"],
    ["Notificaciones", "/notifications"],
    ["Buscar", "/explore"],
  ],
});
