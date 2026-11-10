# Caudal: guía para trabajar en este repo

- La app publicada es `index.html` (GitHub Pages, rama main). **No se edita a mano**: se genera con `python3 src/build.py`.
- Fuentes en `src/`: `head.html`, `app.template.html` (solo el marcado), `styles.css` (toda la hoja de estilos), `seed.generic.json` (datos de ejemplo genéricos, sin datos personales) y `js/` con la lógica en módulos: `paleta.js` (colores y tipos de movimiento), `nucleo.js` (utilidades, estado y guardado), `nube.js` (Supabase: sesión, sincronización, IA, atajos), `mmbak.js` (respaldo de Money Manager), `eventos.js` (eventos generales y arranque) y uno por sección (`inicio.js`, `analisis.js`, `registro.js`, `recibos.js`, `plan.js`...). Cada módulo abre con un comentario que dice qué contiene.
- `build.py` une los módulos en el orden de su lista `ORDEN` y falla si hay un archivo en `js/` que no está en la lista. Un módulo nuevo se agrega ahí, antes de `eventos.js`.
- Higiene: no repitas código que ya existe como utilidad (`leerPesos`, `pesosCampo`, `completarEstado`, `money`, `esc`, `TIPOS`...). Todo vive en un solo script, así que no hacen falta comprobaciones `typeof x === 'function'`.

## Sistema visual

- Concepto: banca oscura de bolsillo. Fondo gris carbón (no negro puro), superficies que se aclaran por nivel (`--surface`, `--surface-2`, `--surface-3`) y un solo color de marca, el morado oscuro `--brand` (#7C3AED, texto blanco encima), para la acción principal; lo que entra va en morado claro `--in`.
- Tipos de movimiento: gasto `--out` rosa con flecha arriba y signo −, ingreso `--in` morado claro con flecha abajo y +, transferencia `--move` celeste con flechas de intercambio, ajuste `--adjust` ámbar. El significado nunca depende solo del color.
- Cifras: los gastos se muestran en blanco con −; el color se reserva para ingresos, alertas y lo que se pasa del límite.
- Los colores existen en dos lugares a propósito: `styles.css` (variables) y `paleta.js` (`PAL`, `SERIE`, `TIPOS`), porque los atributos SVG no leen variables CSS. Si cambias uno, cambia el otro. No escribas colores sueltos en el JavaScript: usa `PAL`, `serieColor(i)` o `var(--...)` dentro de `style`.
- Estilos nuevos van en la sección que corresponde de `styles.css`, sin capas que sobrescriban otras.
- Logo: `src/marca/logo.svg` es la fuente (olas blancas y un punto sobre el degradado morado `--hero`). Los PNG de la raíz (`icon-192`, `icon-512`, `icon-maskable`, `apple-touch-icon`) se generan con `python3 src/marca/iconos.py`; no se editan a mano. La marca de la app (`.mark` en la plantilla) usa el mismo trazo.
- El repo es público: nunca subir datos personales, llaves secretas ni respaldos. La publishable key de Supabase sí puede ir en el código.
- Backend en Supabase (proyecto `Jhon3vg`, ref nsjhlribblnlasdqywgt): esquema en `supabase/01_esquema.sql`, funciones en `supabase/functions/{ia,atajo,avisos,respaldo,semanal}`. Los cambios de base de datos se entregan como SQL nuevo (`supabase/02_...sql`) para correr en el SQL Editor; las funciones se actualizan pegando el código en el editor de Supabase.
- Tras cambiar `src/`, subir el número de `CACHE` en `sw.js`. `build.py` también escribe `version.json`: la app abierta compara su versión con ese archivo y se recarga sola cuando hay una nueva. Publicar siempre `index.html` y `version.json` juntos.
- Idioma de la app y de los textos: español de Colombia. Sin raya larga en los textos.
- IA: esta instalación usa Gemini (plan gratuito) con `GEMINI_API_KEY` en los secretos de Supabase: registrar con `gemini-3.5-flash-lite` y asistente, chat y resumen semanal con `gemini-3.8-flash` (se cambian con `GEMINI_MODEL` y `GEMINI_MODEL_ASK`). Si algún día se agrega `ANTHROPIC_API_KEY`, las funciones pasan a Claude solas. El contexto grande va en `cache` (instrucción de sistema) y la conversación en `messages`.

## Versión Android (instalación de Jhon)

- Esta copia es para Android y vive aparte del Caudal original (yefersonv5/caudal): los cambios de una no pasan a la otra.
- `android.js`: botón atrás (cierra la ventana abierta, vuelve a Inicio y en Inicio pide un segundo toque para salir), botón de instalar (beforeinstallprompt) y accesos rápidos del ícono (`?accion=gasto`, `?accion=ia`).
- `manifest.webmanifest`: accesos rápidos (mantener presionado el ícono) y `share_target`: Compartir → Caudal manda el texto como `?n=` a la bandeja.
- Registro automático con MacroDroid (notificaciones y SMS del banco → función `atajo`); el respaldo semanal también con MacroDroid. No hay Atajos de iPhone, Siri ni Apple Pay.
- Color: morado oscuro en vez del lima (botones `--brand` con texto blanco, tarjeta destacada en degradado morado con texto claro, ingresos en morado claro y transferencias en celeste). Los íconos se generaron con el logo morado.
- Sin internet: `copias.js` guarda una copia diaria en el celular (IndexedDB, últimas 14) y otra antes de que la nube reemplace los datos; se restauran o descargan en Ajustes › Datos. Pide almacenamiento persistente y muestra un aviso en Inicio sin conexión. El service worker abre con la copia guardada si la red tarda más de 3 segundos.
- Deudas por persona (`deudas.js`, migración `24_deudas_personas.sql`): "Le debo a alguien" queda en la cuenta apartada "Deudas en pausa" y no resta del disponible hasta pagarla; "Tengo plata de alguien" es una transferencia desde Por pagar a tu cuenta (está en la cuenta, no en el disponible); "Le presté a alguien" va a Por cobrar. `transactions.persona` guarda con quién es.
- Cuentas editables (`cuentas-editar.js`): crear y editar en la misma hoja (nombre, grupo, apartada, tarjeta de crédito con cuenta de pago, corte y pago), ocultar, eliminar solo si nada la usa, orden con flechas y renombrar un grupo completo. Se llega desde Ajustes › Cuentas, el botón Editar de cada cuenta y "Editar cuentas" en la vista Cuentas.
