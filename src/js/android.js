/* ---------- Android: botón atrás, instalar la app y accesos rápidos ----------
   Atrás (botón o gesto del sistema): cierra la ventana abierta; si no hay ninguna, vuelve a Inicio;
   en Inicio avisa y un segundo toque sale de la app. Chrome ignora las entradas de historial creadas
   sin un toque del usuario, por eso el "colchón" de Inicio se arma en el siguiente toque y no solo al volver.
   Instalar: Chrome ofrece instalar la app (beforeinstallprompt); Inicio muestra el botón mientras no esté instalada.
   Accesos rápidos: los atajos del ícono (manifest) abren con ?accion=gasto o ?accion=ia. */
const ANDROID = /Android/i.test(navigator.userAgent);
let SHEET_POP = null, INSTALL = null;

/* colchón de Inicio: una entrada en el historial que el botón atrás consume sin salir de la app */
function armarBase(){
  if (!ANDROID || isDesk() || NAVH.base || NAVH.depth) return;
  try { history.pushState({ cau:'base' }, ''); NAVH.base = true; } catch (_) {}
}
document.addEventListener('pointerdown', armarBase, true);

/* atrás sin nada apilado: devuelve true si lo atendió (entonces no sale de la app) */
function atrasRaiz(){
  if (!NAVH.base) return false;
  NAVH.base = false;
  const sh = $('#sheet');
  if (sh && !sh.hidden) { closeSheet(); return true; }
  if (ui.view !== 'inicio') { go('inicio'); return true; }
  toast('Toca atrás otra vez para salir'); /* el colchón no se rearma hasta el próximo toque: el segundo atrás sale */
  return true;
}

/* cada ventana (hoja de abajo) ocupa una entrada: atrás la cierra. Si se cierra y enseguida se abre otra,
   reutiliza la misma entrada en vez de quitarla y ponerla (history.go es asíncrono y se cruzarían). */
function sheetPushed(){
  if (!ANDROID || isDesk()) return;
  if (SHEET_POP) { clearTimeout(SHEET_POP); SHEET_POP = null; return; }
  if (!NAVH.sheet) { navPush('sheet'); NAVH.sheet = true; }
}
function sheetClosed(){
  if (!NAVH.sheet || SHEET_POP) return;
  SHEET_POP = setTimeout(() => { SHEET_POP = null; if (NAVH.sheet) { NAVH.sheet = false; navTo(NAVH.depth - 1); } }, 300);
}
/* atrás que consumió la entrada de una ventana: true si era de una ventana */
function atrasVentana(){
  if (!NAVH.sheet) return false;
  NAVH.sheet = false; if (SHEET_POP) { clearTimeout(SHEET_POP); SHEET_POP = null; }
  const sh = $('#sheet'); if (sh && !sh.hidden) closeSheet();
  return true;
}

/* ----- instalar la app ----- */
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); INSTALL = e; render(); });
window.addEventListener('appinstalled', () => { INSTALL = null; render(); toast('Caudal quedó instalada'); });
function installBanner(){
  if (!INSTALL) return '';
  return '<div class="banner"><span><b>Instala Caudal.</b> Queda como app en tu celular, con su ícono y sin la barra del navegador.</span><button class="btn sm" id="instalar">Instalar</button></div>';
}
async function instalarApp(){
  if (!INSTALL) return toast('En Chrome: menú ⋮ → Instalar app (o Agregar a pantalla principal)', 4000);
  const ev = INSTALL; INSTALL = null; ev.prompt();
  try { const r = await ev.userChoice; if (r.outcome !== 'accepted') INSTALL = ev; } catch (_) {}
  render();
}
document.addEventListener('click', e => { if (e.target.closest('#instalar')) instalarApp(); });

/* ----- accesos rápidos del ícono (mantener presionado) ----- */
function lanzarAccion(){
  let a; try { a = new URLSearchParams(location.search).get('accion'); } catch (_) { return; }
  if (!a) return;
  try { history.replaceState(null, '', location.pathname); } catch (_) {}
  if (a === 'gasto') txForm(null, 'gasto');
  else if (a === 'ia') smartOpen('texto');
}
setTimeout(lanzarAccion, 500);
