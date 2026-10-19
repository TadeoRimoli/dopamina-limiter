# Sin Shorts ni Reels

Extensión para Brave (y Chrome) que te saca de encima los Shorts de YouTube, los Reels de Instagram y Facebook, y TikTok. Para cada cosa elegís si la permitís, si te ponés un límite diario o si la bloqueás del todo.

Hacé clic en el botón de la extensión en la barra para configurarla. Los cambios se aplican al toque, en todas las pestañas.

## Qué hace

### YouTube

- **Shorts**: permitir, límite diario o bloquear (por defecto: bloquear, límite 20).
  - Bloqueado: oculta los estantes de Shorts, el botón del menú y la pestaña de los canales, y si abrís un Short te lo muestra como video normal (`/shorts/ID` → `/watch?v=ID`).

### Instagram

- **Reels**: permitir, límite diario o bloquear (por defecto: bloquear, límite 20).
  - Bloqueado: oculta el botón de Reels y los reels del inicio, abre cada reel como post normal (`/reel/ID` → `/p/ID/`) y la pestaña de Reels te manda al inicio.
- **Explorar**: permitir o bloquear (por defecto: permitir).
  - Bloqueado: oculta el botón y te manda al inicio si entrás.

### Facebook

- **Reels**: permitir, límite diario o bloquear (por defecto: bloquear, límite 20).
  - Bloqueado: oculta el acceso a Reels del menú y el estante de Reels del inicio, abre cada reel como video normal (`/reel/ID` → `/watch/?v=ID`) y la pestaña de Reels te manda al inicio.

### TikTok

- **TikTok (todo el sitio)**: permitir, límite diario en minutos o bloquear (por defecto: permitir, límite 30 min).
  - Como todo el sitio es video corto, el límite es de tiempo y no de videos.
  - Bloqueado (o sin minutos por hoy): tapa toda la página con un cartel y pausa y silencia los videos.

### Límite diario

Los Shorts y Reels se ven normal hasta llegar al límite. Cada video cuenta una sola vez por día (si volvés a uno que ya viste hoy, lo podés seguir viendo). Cuando llegás al límite, se comporta como si estuviera bloqueado. En TikTok se cuentan los minutos con la pestaña abierta y a la vista. Todo vuelve a cero a la medianoche.

## Instalación

1. Bajá el proyecto (botón **Code → Download ZIP** y descomprimilo) o clonalo con `git clone`.
2. Abrí `brave://extensions` (o `chrome://extensions` en Chrome).
3. Activá el **Modo de desarrollador** (arriba a la derecha).
4. Tocá **Cargar descomprimida** (*Load unpacked*) y elegí la carpeta del proyecto.

## Cómo actualizar

1. Si lo clonaste, hacé `git pull` en la carpeta (si lo bajaste en ZIP, bajalo de nuevo y reemplazá la carpeta).
2. En `brave://extensions`, tocá el botón de recargar de la extensión.
3. Recargá las pestañas de YouTube, Instagram, Facebook y TikTok que tengas abiertas.

## Limitaciones conocidas

- Instagram, Facebook y TikTok cambian su HTML seguido, así que ocultar botones o reels puede dejar de funcionar de un día para el otro (las redirecciones deberían seguir andando).
- Los selectores de Facebook y TikTok no están probados a fondo: puede que algo no se oculte, o (en Facebook) que se oculte de más.
- En TikTok se cuenta el tiempo con la pestaña a la vista, estés mirando o no. Si tenés dos pestañas de TikTok visibles a la vez (en ventanas distintas), cuenta doble.
- Los reels que se reproducen dentro del feed del inicio de Instagram no se cuentan para el límite (solo cuentan los que abrís).
- La redirección pasa apenas arranca la página, así que puede que veas un Short o Reel por un instante antes de que cambie.

## Licencia

MIT. Mirá [LICENSE](LICENSE).
