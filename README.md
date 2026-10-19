# Dopamina Limiter

Extensión para Brave (y Chrome) para no quedarte enganchado en YouTube, Instagram, Facebook, X y TikTok. Para cada cosa elegís si la permitís, si te ponés un límite diario o si la bloqueás del todo: Shorts y Reels (por cantidad de videos), el feed de inicio (por pantallas scrolleadas) y el tiempo de uso de cada red (por minutos de uso real).

Hacé clic en el botón de la extensión en la barra para configurarla. Viene preconfigurada, y los cambios se aplican al toque en todas las pestañas.

## Qué hace

Cada red tiene, según lo que tenga sentido:

- **Shorts / Reels** (por videos): bloqueado, oculta los estantes y botones, y si abrís uno te manda al inicio. Con límite, cada video distinto cuenta una vez por día (si volvés a uno que ya viste hoy, lo podés seguir viendo).
- **Feed** (por pantallas): cuenta cuánto bajás en el feed de inicio (una pantalla = el alto de la ventana; subir no descuenta). Al llegar al límite (o si está bloqueado), el feed se tapa con un cartel y no se puede scrollear, pero el resto del sitio (mensajes, perfiles, posts sueltos, búsqueda) sigue andando.
- **Tiempo de uso** (por minutos): al llegar al límite (o si está bloqueado), tapa todo el sitio con un cartel y pausa y silencia los videos.

Todo vuelve a cero a la medianoche.

### YouTube

- **Shorts**: por defecto bloqueado (límite 20 videos si lo cambiás).
- **Feed (inicio)**: la página de inicio. Por defecto 30 pantallas por día.
- **Tiempo de uso**: por defecto 60 min por día.

### Instagram

- **Reels**: por defecto bloqueado (límite 20). Bloqueado, también te saca de la pestaña de Reels.
- **Explorar**: permitir o bloquear (por defecto permitido). Bloqueado, oculta el botón y te manda al inicio.
- **Feed**: el inicio. Por defecto 30 pantallas por día.
- **Tiempo de uso**: por defecto 45 min por día.

### Facebook

- **Reels**: por defecto bloqueado (límite 20). Bloqueado, oculta el acceso a Reels y el estante de Reels del inicio.
- **Feed**: el inicio (`/` y `/home.php`). Por defecto 30 pantallas por día.
- **Tiempo de uso**: por defecto 45 min por día.

### X (Twitter)

- **Feed**: `/home`. Por defecto 30 pantallas por día.
- **Tiempo de uso**: por defecto 45 min por día.

### TikTok

- **Tiempo de uso**: como todo el sitio es video corto (y el feed no cambia la URL por video), acá solo hay límite de tiempo, por defecto 30 min por día. Bloqueado, tapa todo el sitio.

### Cómo se mide el tiempo de uso real

Cada 5 segundos se suma tiempo solo si se cumple todo esto:

- la pestaña está a la vista y la ventana tiene el foco;
- y tocaste algo (mouse, teclado, rueda, pantalla táctil o scroll) en el último minuto, **o** hay un video reproduciéndose.

Así, una pestaña olvidada en segundo plano o abierta sin tocarla no te come minutos, pero mirar un video largo sin tocar nada sí cuenta.

## Instalación

1. Bajá el proyecto (botón **Code → Download ZIP** y descomprimilo) o clonalo con `git clone`.
2. Abrí `brave://extensions` (o `chrome://extensions` en Chrome).
3. Activá el **Modo de desarrollador** (arriba a la derecha).
4. Tocá **Cargar descomprimida** (*Load unpacked*) y elegí la carpeta del proyecto.

## Cómo actualizar

1. Si lo clonaste, hacé `git pull` en la carpeta (si lo bajaste en ZIP, bajalo de nuevo y reemplazá la carpeta).
2. En `brave://extensions`, tocá el botón de recargar de la extensión.
3. Recargá las pestañas de YouTube, Instagram, Facebook, X y TikTok que tengas abiertas.

## Limitaciones conocidas

- Instagram, Facebook, X y TikTok cambian su HTML seguido, así que ocultar botones o reels puede dejar de funcionar de un día para el otro. Las redirecciones y los límites de feed y de tiempo no dependen de eso.
- Los selectores de Facebook no están probados a fondo: puede que algo no se oculte, o que se oculte de más.
- El tiempo de uso no cuenta si mirás un video en una ventana mientras usás otra (la del video no tiene el foco). Al revés, si tenés dos pestañas de la misma red a la vista y con foco a la vez, puede contar doble.
- Las pantallas de feed son aproximadas: se ignoran los saltos enormes de scroll de una sola vez (suelen ser el sitio restaurando la posición).
- Si te pasás del límite de feed con la sesión cerrada, el cartel también tapa la pantalla de inicio de sesión de Facebook o Instagram (está en la misma dirección que el feed).
- Los reels que se reproducen dentro del feed de Instagram no cuentan para el límite de Reels (solo los que abrís), pero sí para el feed y el tiempo.
- La redirección y los carteles aparecen apenas arranca la página, así que puede que veas algo por un instante antes de que cambie.

## Licencia

MIT. Mirá [LICENSE](LICENSE).
