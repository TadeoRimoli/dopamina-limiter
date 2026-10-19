# Sin Shorts ni Reels

Extensión para Brave (y Chrome) que te saca los Shorts de YouTube y los Reels de Instagram de encima. Para cada cosa elegís si la permitís, si te ponés un límite diario o si la bloqueás del todo.

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

### Límite diario

Los Shorts y Reels se ven normal hasta llegar al límite. Cada video cuenta una sola vez por día (si volvés a uno que ya viste hoy, lo podés seguir viendo). Cuando llegás al límite, se comporta como si estuviera bloqueado. El contador vuelve a cero a la medianoche.

## Instalación

1. Bajá el proyecto (botón **Code → Download ZIP** y descomprimilo) o clonalo con `git clone`.
2. Abrí `brave://extensions` (o `chrome://extensions` en Chrome).
3. Activá el **Modo de desarrollador** (arriba a la derecha).
4. Tocá **Cargar descomprimida** (*Load unpacked*) y elegí la carpeta del proyecto.

## Cómo actualizar

1. Si lo clonaste, hacé `git pull` en la carpeta (si lo bajaste en ZIP, bajalo de nuevo y reemplazá la carpeta).
2. En `brave://extensions`, tocá el botón de recargar de la extensión.
3. Recargá las pestañas de YouTube e Instagram que tengas abiertas.

## Limitaciones conocidas

- Instagram cambia su HTML seguido, así que ocultar botones o reels puede dejar de funcionar de un día para el otro (las redirecciones deberían seguir andando).
- Los reels que se reproducen dentro del feed del inicio de Instagram no se cuentan para el límite (solo cuentan los que abrís).
- La redirección pasa apenas arranca la página, así que puede que veas un Short o Reel por un instante antes de que cambie.

## Licencia

MIT. Mirá [LICENSE](LICENSE).
