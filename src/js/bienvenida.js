/* ---------- Bienvenida y primeros pasos: para alguien que abre Caudal por primera vez ----------
   Bienvenida (3 pasos cortos, todos se pueden saltar): nombre, dónde tiene la plata con su saldo de hoy
   y qué día del mes recibe la plata (inicio del periodo). Arma las cuentas reales con las categorías base.
   También se ofrece como primer paso a quien salió del ejemplo pero aún no registra nada: reemplaza sus cuentas vacías.
   Primeros pasos: una tarjeta en Inicio con las 5 cosas que más ayudan al empezar; cada una lleva a donde
   se hace, se marca sola al cumplirse y se puede ocultar. Desaparece cuando todo está listo. */
const BV_CUENTAS = ['Efectivo', 'Nequi', 'Daviplata', 'Bancolombia', 'Nu', 'Davivienda'];
let BV = null;

function bienvenidaAbrir(){
  BV = { paso:1, nombre:S.settings.name || '', cuentas:['Efectivo'], saldos:{}, otra:'', dia:'' };
  bienvenidaDraw();
}
function bienvenidaDraw(){
  const P = BV.paso;
  let h = '<div class="sheet-h"><b id="sheet-title">' + (P === 1 ? 'Bienvenido a Caudal' : P === 2 ? '¿Dónde tienes tu plata?' : '¿Cuándo te llega la plata?') + '</b><button class="x" data-close aria-label="Cerrar">✕</button></div>' +
    '<div class="form bvw"><span class="tile-s">Paso ' + P + ' de 3</span><div class="bvbar"><i style="width:' + Math.round(P / 3 * 100) + '%"></i></div>';
  if (P === 1) h += '<p class="insight" style="margin:0">Caudal te muestra en qué se va tu plata y cuánto te queda para gastar. Toma un minuto dejarlo listo.</p>' +
    '<div class="field"><label class="label" for="bv-nombre">¿Cómo te llamas?</label><input class="inp" id="bv-nombre" value="' + esc(BV.nombre) + '" placeholder="Tu nombre" autocomplete="given-name"></div>';
  if (P === 2) {
    const todas = [...new Set(BV_CUENTAS.concat(BV.cuentas))];
    h += '<p class="insight" style="margin:0">Elige tus cuentas y escribe cuánto tienes hoy en cada una. Si no sabes el valor exacto, pon uno aproximado: luego lo ajustas.</p>' +
      '<div class="chips">' + todas.map(n => '<button type="button" class="chip" data-bvcta="' + esc(n) + '" aria-pressed="' + BV.cuentas.includes(n) + '">' + esc(n) + '</button>').join('') + '</div>' +
      '<div class="two"><input class="inp" id="bv-otra" value="' + esc(BV.otra) + '" placeholder="Otra (Ej. Davibank)" autocomplete="off"><button type="button" class="btn ghost" data-bvotra>Agregar</button></div>' +
      (BV.cuentas.length ? '<div>' + BV.cuentas.map((n, i) => '<div class="set"' + (i ? '' : ' style="border-top:0"') + '><div class="t"><b>' + esc(n) + '</b><span>Saldo de hoy</span></div><input inputmode="numeric" class="num" data-bvsaldo="' + esc(n) + '" value="' + esc(BV.saldos[n] || '') + '" placeholder="$ 0" aria-label="Saldo de ' + esc(n) + '"></div>').join('') + '</div>' : '') +
      '<p class="note" style="padding:0;margin:0">Las tarjetas de crédito las agregas después en Cuentas › Editar cuentas.</p>';
  }
  if (P === 3) {
    const dias = [['1', 'El 1'], ['15', 'El 15'], ['28', 'A fin de mes']];
    h += '<p class="insight" style="margin:0">Tu mes en Caudal empieza ese día, así ves cuánto te queda hasta que te vuelva a llegar plata.</p>' +
      '<div class="chips">' + dias.map(([v, t]) => '<button type="button" class="chip" data-bvdia="' + v + '" aria-pressed="' + (BV.dia === v) + '">' + t + '</button>').join('') +
      '<button type="button" class="chip" data-bvdia="1" aria-pressed="false">No tengo un día fijo</button></div>' +
      '<div class="field"><label class="label" for="bv-dia">U otro día</label><input class="inp num" id="bv-dia" inputmode="numeric" maxlength="2" value="' + esc(BV.dia) + '" placeholder="Del 1 al 28"></div>';
  }
  h += '<div class="err" id="bv-err"></div><div class="two">' + (P > 1 ? '<button type="button" class="btn ghost" data-bvatras>Atrás</button>' : '<span></span>') +
    '<button type="button" class="btn accent" data-bvsig>' + (P < 3 ? 'Siguiente' : 'Listo, empezar') + '</button></div></div>';
  if ($('#sheet').hidden) openSheet(h); else $('#sheet').innerHTML = '<div class="grab"></div>' + h;
}
const bvLeer = () => {
  const n = $('#bv-nombre'), o = $('#bv-otra'), d = $('#bv-dia');
  if (n) BV.nombre = n.value.trim(); if (o) BV.otra = o.value.trim(); if (d) BV.dia = d.value.trim();
  document.querySelectorAll('[data-bvsaldo]').forEach(i => { BV.saldos[i.dataset.bvsaldo] = i.value; });
};
/* arma Caudal con lo que eligió: categorías base, sus cuentas con el saldo de hoy y el día de inicio del mes */
function bienvenidaTerminar(){
  const dia = Math.min(28, Math.max(1, parseInt(BV.dia, 10) || 1)), hoy = iso(new Date()), now = Date.now();
  const nombres = BV.cuentas.length ? BV.cuentas : ['Efectivo'];
  const accounts = nombres.map((n, i) => ({ id:uid(), name:n, group:n === 'Efectivo' ? 'Efectivo' : 'Bancos y billeteras', order:i + 1, hidden:false }));
  const transactions = accounts.map(a => ({ a, v:leerPesos(BV.saldos[a.name] || '') })).filter(x => x.v)
    .map((x, i) => ({ id:uid(), type:'ajuste', amount:x.v, date:hoy, ts:now + i, accountId:x.a.id, note:'Saldo inicial' }));
  /* desde el ejemplo arranca con las categorías base; si ya había empezado (sin movimientos), conserva sus categorías y ajustes */
  const base = S.demo ? JSON.parse(JSON.stringify(SEED)) : S;
  S = completarEstado({ ...base, demo:false, accounts, transactions, budgets:S.demo ? {} : (S.budgets || {}), settings:{ ...base.settings, startDay:dia, ...(BV.nombre ? { name:BV.nombre } : {}) } });
  try { localStorage.setItem('caudal.bienvenida', 'ok'); } catch (_) {}
  S.lastAccount = accounts[0].id;
  sortTx(S); save(); BV = null; closeSheet(); ui.offset = 0; go('inicio');
  toast('¡Listo! Ahora registra tu primer gasto', 3000);
}
document.addEventListener('click', e => {
  const el = e.target.closest('button'); if (!el) return; const d = el.dataset;
  if (el.id === 'bienvenida') { e.stopPropagation(); return bienvenidaAbrir(); }
  if (!BV || !el.closest('.bvw')) return;
  e.stopPropagation(); bvLeer();
  if (d.bvcta) { const i = BV.cuentas.indexOf(d.bvcta); if (i >= 0) BV.cuentas.splice(i, 1); else BV.cuentas.push(d.bvcta); return bienvenidaDraw(); }
  if (d.bvotra !== undefined) { if (BV.otra && !BV.cuentas.some(c => c.toLowerCase() === BV.otra.toLowerCase())) BV.cuentas.push(BV.otra); BV.otra = ''; return bienvenidaDraw(); }
  if (d.bvdia) { BV.dia = d.bvdia; return bienvenidaDraw(); }
  if (d.bvatras !== undefined) { BV.paso--; return bienvenidaDraw(); }
  if (d.bvsig !== undefined) {
    if (BV.paso === 2 && !BV.cuentas.length) { $('#bv-err').textContent = 'Elige al menos una cuenta.'; return; }
    if (BV.paso === 3 && BV.dia && !(parseInt(BV.dia, 10) >= 1 && parseInt(BV.dia, 10) <= 28)) { $('#bv-err').textContent = 'El día va del 1 al 28.'; return; }
    if (BV.paso < 3) { BV.paso++; return bienvenidaDraw(); }
    return bienvenidaTerminar();
  }
}, true);
document.addEventListener('input', e => { if (e.target.dataset && e.target.dataset.bvsaldo !== undefined) pesosCampo(e.target); });

/* ----- primeros pasos en Inicio ----- */
const pasosOcultos = () => { try { return localStorage.getItem('caudal.pasos') === 'no'; } catch (_) { return false; } };
function pasosLista(){
  const instalada = matchMedia('(display-mode: standalone)').matches;
  let hecha = S.transactions.length > 0; try { hecha = hecha || localStorage.getItem('caudal.bienvenida') === 'ok'; } catch (_) {}
  return [
    { k:'config', t:'Configura tus cuentas y tu mes', s:'Dinos dónde tienes tu plata y qué día te llega. Toma un minuto.', ok:hecha },
    { k:'gasto', t:'Registra tu primer gasto', s:'Toca Registrar o escribe en "Anota un gasto", por ejemplo: almuerzo 15 mil.', ok:S.transactions.some(t => t.type === 'gasto') },
    { k:'plan', t:'Ponle un límite a lo que gastas', s:'En Plan dices cuánto quieres gastar en cada cosa y Caudal te avisa si te pasas.', ok:(S.plans || []).length > 0 || Object.keys(S.budgets || {}).length > 0 },
    { k:'instalar', t:'Instala Caudal en tu celular', s:'Queda con su ícono, como cualquier app, y abre aunque no tengas internet.', ok:instalada },
    { k:'avisos', t:'Activa los avisos', s:'Te recuerda registrar el día, los recibos por pagar y más.', ok:typeof Notification !== 'undefined' && Notification.permission === 'granted' }
  ];
}
function pasosCard(){
  if (S.demo || pasosOcultos()) return '';
  const l = pasosLista(), hechos = l.filter(x => x.ok).length; if (hechos === l.length) return '';
  return '<section class="card pasos"><div class="card-h"><h2>Primeros pasos</h2><span class="aside">' + hechos + ' de ' + l.length + '</span></div>' +
    '<div class="bvbar"><i style="width:' + Math.round(hechos / l.length * 100) + '%"></i></div><div>' +
    l.map(x => '<button class="paso" data-paso="' + x.k + '"' + (x.ok ? ' disabled' : '') + '><span class="pchk' + (x.ok ? '' : ' no') + '">' + (x.ok ? '✓' : '') + '</span><span class="t"><b>' + x.t + '</b>' + (x.ok ? '' : '<span>' + x.s + '</span>') + '</span>' + (x.ok ? '' : CHEV) + '</button>').join('') +
    '</div><button class="lnk" data-pasosno style="align-self:flex-end">Ocultar esta guía</button></section>';
}
document.addEventListener('click', e => {
  const el = e.target.closest('[data-paso],[data-pasosno]'); if (!el) return; e.stopPropagation();
  if (el.dataset.pasosno !== undefined) { try { localStorage.setItem('caudal.pasos', 'no'); } catch (_) {} render(); return toast('Guía oculta'); }
  const k = el.dataset.paso;
  if (k === 'config') return bienvenidaAbrir();
  if (k === 'gasto') return txForm(null, 'gasto');
  if (k === 'plan') return go('plan');
  if (k === 'instalar') return instalarApp();
  if (k === 'avisos') return go('ajustes', 'avisos');
}, true);
