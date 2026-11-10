/* ---------- Editar cuentas: dónde guardas la plata ----------
   Crear y editar una cuenta en la misma hoja: nombre, grupo, si cuenta en el disponible y si es tarjeta de
   crédito (de qué cuenta se paga, día de corte y día de pago). Ocultar, volver a mostrar y eliminar (solo si
   no tiene movimientos ni la usa nada; si no, se oculta). En Ajustes › Cuentas: la lista con su orden,
   renombrar un grupo completo y las ocultas. Las cuentas de deudas se manejan en Cuentas › Deudas. */
let AE = null;
const usoCuenta = id => S.transactions.filter(t => t.accountId === id || t.toAccountId === id || t.fund === id).length;
/* lo que impide borrar: movimientos, recibos, pagos fijos, el plan o una tarjeta que se paga desde ella */
function cuentaEnUso(id){
  const n = usoCuenta(id); if (n) return plural(n, 'movimiento', 'movimientos');
  if ((S.bills || []).some(b => b.accountId === id)) return 'un recibo';
  if ((S.recurring || []).some(r => r.accountId === id)) return 'un pago fijo';
  if ((S.plans || []).some(p => p.from === id || p.surplus === id || (p.items || []).some(i => i.acc === id))) return 'tu plan';
  if (S.accounts.some(a => a.card && a.card.pocket === id)) return 'una tarjeta que se paga desde ella';
  return '';
}
const gruposCuentas = () => [...new Set(S.accounts.filter(a => !esDeuda(a)).map(a => a.group || 'Otros'))];

function accEditSheet(id){
  const a = id ? accById(id) : null;
  AE = a ? { id, name:a.name, group:a.group || 'Otros', apart:!!a.apart, tarjeta:isCard(a), pocket:a.card && a.card.pocket || null, cut:a.card && a.card.cut || '', due:a.card && a.card.due || '' }
         : { id:null, name:'', group:gruposCuentas()[0] || 'Cuenta bancaria', apart:false, tarjeta:false, pocket:null, cut:'', due:'', bal:'' };
  accEditDraw();
}
function accEditDraw(){
  const nuevo = !AE.id, a = nuevo ? null : accById(AE.id), grupos = gruposCuentas();
  const opts = S.accounts.filter(x => !x.hidden && !esDeuda(x) && !isCard(x) && x.id !== AE.id);
  const dia = (k, t) => '<div class="field"><label class="label" for="ae-' + k + '">' + t + '</label><input class="inp num" id="ae-' + k + '" inputmode="numeric" maxlength="2" value="' + esc(String(AE[k] || '')) + '" placeholder="1 a 31"></div>';
  let h = '<div class="sheet-h"><b id="sheet-title">' + (nuevo ? 'Nueva cuenta' : 'Editar cuenta') + '</b><button class="x" data-close aria-label="Cerrar">✕</button></div><div class="form aedit">' +
    '<div class="field"><label class="label" for="ae-name">Nombre</label><input class="inp" id="ae-name" value="' + esc(AE.name) + '" placeholder="Ej. Nequi, Bancolombia, Efectivo" autocomplete="off"></div>' +
    '<div class="field"><span class="label">Grupo</span><div class="chips">' + grupos.map(g => '<button type="button" class="chip" data-aegrp="' + esc(g) + '" aria-pressed="' + (AE.group === g) + '">' + esc(g) + '</button>').join('') + '</div>' +
      '<input class="inp" id="ae-group" value="' + esc(grupos.includes(AE.group) ? '' : AE.group) + '" placeholder="O escribe un grupo nuevo (Ej. Billeteras)" autocomplete="off" style="margin-top:8px"></div>' +
    '<div class="field"><span class="label">Tipo</span><div class="chips"><button type="button" class="chip" data-aetipo="0" aria-pressed="' + !AE.tarjeta + '">Cuenta o efectivo</button><button type="button" class="chip" data-aetipo="1" aria-pressed="' + AE.tarjeta + '">Tarjeta de crédito</button></div></div>';
  if (AE.tarjeta) h += '<div class="field"><span class="label">¿Desde qué cuenta la pagas?</span>' + (opts.length ? '<div class="cgrid">' + opts.map(x => '<button type="button" class="ctile sm" data-aepk="' + esc(x.id) + '" aria-pressed="' + (AE.pocket === x.id) + '"><span class="nm">' + esc(accShort(x.id)) + '</span></button>').join('') + '</div>' : '<p class="note" style="padding:0">Primero crea la cuenta desde la que pagas la tarjeta.</p>') + '</div>' +
    '<div class="two">' + dia('cut', 'Día de corte') + dia('due', 'Día de pago') + '</div>' +
    '<p class="note" style="padding:0;margin:0">Lo que compres con la tarjeta queda como deuda en ella, y la app te recuerda pasar la plata a la cuenta desde la que la pagas.</p>';
  else h += '<button type="button" class="pill" style="align-self:flex-start" data-aeapart aria-pressed="' + !AE.apart + '">' + (AE.apart ? '○ Apartada: no cuenta en tu disponible' : '● Cuenta en tu disponible') + '</button>' +
    '<p class="note" style="padding:0;margin:0">Apártala si es plata que no quieres tocar, como un ahorro o un CDT.</p>';
  if (nuevo) h += '<div class="field"><label class="label" for="ae-bal">' + (AE.tarjeta ? 'Lo que debes hoy en la tarjeta' : 'Saldo actual') + '</label><input class="inp num" id="ae-bal" inputmode="numeric" value="' + esc(AE.bal || '') + '" placeholder="0"></div>';
  h += '<div class="err" id="ae-err"></div><button class="btn accent block" type="button" data-aego>' + (nuevo ? 'Crear cuenta' : 'Guardar cambios') + '</button>';
  if (!nuevo) { const uso = cuentaEnUso(AE.id);
    h += '<div class="two"><button class="btn ghost" type="button" data-aehide>' + (a.hidden ? 'Volver a mostrar' : 'Ocultar') + '</button>' +
      '<button class="btn ghost' + (AE.del ? ' danger' : '') + '" type="button" data-aedel' + (uso ? ' disabled' : '') + '>' + (AE.del ? '¿Seguro? Eliminar' : 'Eliminar') + '</button></div>' +
      '<p class="note" style="padding:0;margin:0">' + (uso ? 'No se puede eliminar porque la usa ' + uso + '. Ocúltala: deja de salir en tus listas y su historial se conserva.' : 'Ocultarla la quita de tus listas sin borrar nada.') + '</p>'; }
  h += '</div>';
  if ($('#sheet').hidden) openSheet(h); else $('#sheet').innerHTML = '<div class="grab"></div>' + h;
}
/* lo escrito sobrevive a redibujar la hoja al tocar una opción */
const aeLeer = () => { const v = id => { const el = $('#ae-' + id); return el ? el.value.trim() : null; };
  const n = v('name'), g = v('group'), c = v('cut'), d = v('due'), b = v('bal');
  if (n !== null) AE.name = n; if (g) AE.group = g; if (c !== null) AE.cut = c; if (d !== null) AE.due = d; if (b !== null) AE.bal = b; };
function accEditGuardar(){
  const err = m => { $('#ae-err').textContent = m; };
  if (!AE.name) return err('Escribe el nombre de la cuenta.');
  if (S.accounts.some(x => x.id !== AE.id && !x.hidden && x.name.trim().toLowerCase() === AE.name.toLowerCase())) return err('Ya tienes una cuenta con ese nombre.');
  const dia = s => { const n = parseInt(s, 10); return n >= 1 && n <= 31 ? n : null; };
  if (AE.tarjeta) { if (!accById(AE.pocket)) return err('Elige desde qué cuenta pagas la tarjeta.');
    if (AE.cut && !dia(AE.cut)) return err('El día de corte va de 1 a 31.'); if (AE.due && !dia(AE.due)) return err('El día de pago va de 1 a 31.'); }
  let a = AE.id ? accById(AE.id) : null;
  if (!a) { a = { id:uid(), name:'', group:'', order:S.accounts.length + 1, hidden:false }; S.accounts.push(a); }
  a.name = AE.name; a.group = AE.group || 'Otros';
  if (AE.tarjeta) { a.card = { ...(a.card || {}), pocket:AE.pocket, cut:dia(AE.cut), due:dia(AE.due) }; delete a.apart; }
  else { delete a.card; if (AE.apart) a.apart = true; else delete a.apart; }
  if (!AE.id) { const v = leerPesos(AE.bal || ''); /* en una tarjeta, lo que debes queda como saldo negativo */
    if (v) S.transactions.push({ id:uid(), type:'ajuste', amount:AE.tarjeta ? -v : v, date:iso(new Date()), ts:Date.now(), accountId:a.id, note:'Saldo inicial' }); }
  const nuevo = !AE.id; sortTx(S); save(); AE = null; closeSheet(); render(); toast(nuevo ? 'Cuenta creada' : 'Cuenta actualizada');
}
document.addEventListener('click', e => {
  const el = e.target.closest('button'); if (!el) return; const d = el.dataset;
  if (d.accedit !== undefined) { e.stopPropagation(); return accEditSheet(d.accedit || null); }
  if (d.accmove) { e.stopPropagation(); return moverCuenta(d.accmove, +d.dir); }
  if (d.grpren !== undefined) { e.stopPropagation(); return grupoSheet(d.grpren); }
  if (!AE || !el.closest('.aedit')) return;
  e.stopPropagation(); aeLeer();
  if (d.aegrp) { AE.group = d.aegrp; return accEditDraw(); }
  if (d.aetipo) { AE.tarjeta = d.aetipo === '1'; return accEditDraw(); }
  if (d.aepk) { AE.pocket = d.aepk; return accEditDraw(); }
  if (d.aeapart !== undefined) { AE.apart = !AE.apart; return accEditDraw(); }
  if (d.aego !== undefined) return accEditGuardar();
  if (d.aehide !== undefined) { const a = accById(AE.id); a.hidden = !a.hidden; save(); AE = null; closeSheet(); render(); return toast(a.hidden ? 'Cuenta oculta' : 'Cuenta visible de nuevo'); }
  if (d.aedel !== undefined) { if (cuentaEnUso(AE.id)) return;
    if (!AE.del) { AE.del = true; return accEditDraw(); }
    S.accounts = S.accounts.filter(x => x.id !== AE.id); if (S.lastAccount === AE.id) delete S.lastAccount;
    save(); AE = null; closeSheet(); render(); return toast('Cuenta eliminada'); }
}, true);
document.addEventListener('input', e => { if (e.target.id === 'ae-bal') pesosCampo(e.target); if (e.target.id === 'ae-group' && AE && e.target.value.trim()) { AE.group = e.target.value.trim(); document.querySelectorAll('[data-aegrp]').forEach(b => b.setAttribute('aria-pressed', 'false')); } });

/* ----- orden: subir o bajar una cuenta dentro de su grupo ----- */
function moverCuenta(id, dir){
  const a = accById(id); if (!a) return;
  const lista = S.accounts.filter(x => !esDeuda(x) && (x.group || 'Otros') === (a.group || 'Otros')).sort((x, y) => (x.order || 0) - (y.order || 0));
  const i = lista.indexOf(a), j = i + dir; if (j < 0 || j >= lista.length) return;
  [lista[i], lista[j]] = [lista[j], lista[i]];
  const base = Math.min(...lista.map(x => x.order || 0)); lista.forEach((x, k) => { x.order = base + k; });
  save(); render();
}
/* ----- renombrar un grupo completo (todas sus cuentas) ----- */
function grupoSheet(g){
  openSheet('<div class="sheet-h"><b id="sheet-title">Renombrar grupo</b><button class="x" data-close aria-label="Cerrar">✕</button></div><div class="form">' +
    '<div class="field"><label class="label" for="gr-name">Nombre del grupo</label><input class="inp" id="gr-name" value="' + esc(g) + '" autocomplete="off"></div>' +
    '<p class="note" style="padding:0;margin:0">Cambia el nombre en todas las cuentas de este grupo.</p><button class="btn accent block" type="button" data-grgo="' + esc(g) + '">Guardar</button></div>');
}
document.addEventListener('click', e => {
  const el = e.target.closest('[data-grgo]'); if (!el) return; e.stopPropagation();
  const viejo = el.dataset.grgo, nuevo = ($('#gr-name').value || '').trim(); if (!nuevo) return;
  S.accounts.forEach(a => { if (!esDeuda(a) && (a.group || 'Otros') === viejo) a.group = nuevo; });
  save(); closeSheet(); render(); toast('Grupo renombrado');
}, true);

/* ----- Ajustes › Cuentas ----- */
function cuentasAdminCard(){
  const b = balances(), propias = S.accounts.filter(a => !esDeuda(a)).sort((x, y) => (x.order || 0) - (y.order || 0));
  const vis = propias.filter(a => !a.hidden), ocultas = propias.filter(a => a.hidden);
  const fila = (a, k, n) => '<div class="set deuda"' + (k ? '' : ' style="border-top:0"') + '><button class="t" data-accedit="' + esc(a.id) + '"><b>' + esc(a.name) + '</b><span>' + (isCard(a) ? 'Tarjeta · se paga desde ' + esc(accShort(a.card.pocket)) : a.apart ? 'Apartada' : 'En tu disponible') + ' · ' + money(b[a.id] || 0) + '</span></button>' +
    (n > 1 ? '<button class="pill" data-accmove="' + esc(a.id) + '" data-dir="-1" aria-label="Subir"' + (k ? '' : ' disabled') + '>↑</button><button class="pill" data-accmove="' + esc(a.id) + '" data-dir="1" aria-label="Bajar"' + (k < n - 1 ? '' : ' disabled') + '>↓</button>' : '') + '</div>';
  let h = '<section class="card"><div class="card-h"><h2>Tus cuentas</h2><button class="pill" data-accedit>Nueva cuenta</button></div>' +
    '<p class="insight">Toca una cuenta para cambiarle el nombre, el grupo o el tipo. Con las flechas cambias el orden.</p>';
  for (const g of [...new Set(vis.map(a => a.group || 'Otros'))]) { const l = vis.filter(a => (a.group || 'Otros') === g);
    h += '<div class="pgroup">' + esc(g) + '<button class="lnk" data-grpren="' + esc(g) + '">Renombrar</button></div><div>' + l.map((a, k) => fila(a, k, l.length)).join('') + '</div>'; }
  if (ocultas.length) h += '<div class="pgroup">Ocultas<span class="num">' + ocultas.length + '</span></div><div>' + ocultas.map((a, k) => fila(a, k, 1)).join('') + '</div>';
  return h + '<p class="note" style="padding:0">Las deudas (Por pagar, Por cobrar y En pausa) se manejan en Cuentas › Deudas.</p></section>';
}
