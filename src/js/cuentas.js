/* Cuentas: una sola lista, en el orden que la persona elige (sin grupos), con el reparto del disponible.
   Tocar la cuenta abre sus movimientos y el cuadre; el botón Editar abre su nombre, tipo y orden. */
const cuentasOrden = () => S.accounts.filter(a => !a.hidden && !esDeuda(a)).sort((x, y) => (x.order || 0) - (y.order || 0));
const cuentaTipo = a => isCard(a) ? 'Tarjeta de crédito' : a.apart ? 'Apartada' : '';
function vCuentas(){
  const b = balances(), vis = cuentasOrden(); /* las deudas van en su propia tarjeta */
  const worth = S.accounts.filter(a => !a.hidden).reduce((x, a) => x + (b[a.id] || 0), 0);
  const pos = vis.filter(a => (b[a.id] || 0) > 0).sort((x, y) => b[y.id] - b[x.id]), posTotal = pos.reduce((x, a) => x + b[a.id], 0) || 1;
  const col = a => serieColor(pos.indexOf(a));
  let out = '<div class="hello"><h1>Cuentas</h1><p>' + vis.length + (vis.length === 1 ? ' cuenta activa' : ' cuentas activas') + '</p></div>';
  const aparts = vis.filter(a => a.apart), apartSum = aparts.reduce((x, a) => x + (b[a.id] || 0), 0), disp = dispTotal(b), debes = debesTotal(b);
  out += '<section class="card glow"><span class="label">Disponible</span><div class="big num">' + (disp < 0 ? '<small>−</small>' : '') + '<small>$</small>' + nf.format(Math.abs(disp)) + '</div>' +
    '<p class="note" style="padding:0;margin:-4px 0 10px">' + (aparts.length ? 'Apartado ' + money(apartSum) + ' (' + esc(aparts.map(a => accShort(a.id)).join(', ')) + ') · ' : '') + (debes ? 'Ya descuenta ' + money(debes) + ' que debes · ' : '') + 'Patrimonio total ' + money(worth) + (S.accounts.some(a => isCard(a)) ? '. Ya descuenta lo que debes en tarjetas.' : '.') + '</p>' +
    '<div class="dist" aria-hidden="true">' + pos.map(a => '<i style="width:' + (b[a.id] / posTotal * 100).toFixed(1) + '%;background:' + col(a) + '"></i>').join('') + '</div>' +
    '<div class="distlg">' + pos.map(a => '<div><i style="background:' + col(a) + '"></i><span>' + esc(a.name) + '</span><b class="num">' + Math.round(b[a.id] / posTotal * 100) + '% · ' + money(b[a.id]) + '</b></div>').join('') + '</div></section>';
  out += '<section class="card"><div class="card-h"><h2>Tus cuentas</h2><button class="pill" data-newacc>+ Nueva</button></div><div>' +
    (vis.length ? vis.map(a => { const t = cuentaTipo(a);
      return '<div class="accrow"><button class="acc" data-accsheet="' + esc(a.id) + '"><span class="nm">' + esc(a.name) + '<small>' + (t ? t + ' · ' : '') + cuadreTxt(a.id) + '</small></span><span class="am num ' + ((b[a.id] || 0) < 0 ? 'neg' : '') + '">' + money(b[a.id] || 0) + '</span></button>' +
        '<button class="pill" data-accedit="' + esc(a.id) + '" aria-label="Editar ' + esc(a.name) + '">Editar</button></div>'; }).join('')
      : '<p class="insight">Aún no tienes cuentas. Agrega dónde guardas tu plata: efectivo, Nequi, tu banco…</p>') + '</div></section>';
  out += cardSummary() + deudasCard();
  if (aiOn()) out += '<button class="btn block ghost" data-foto>Cuadrar con captura</button>';
  out += '<p class="note">Toca una cuenta para ver sus movimientos o cuadrarla con el saldo real del banco. Con Editar le cambias el nombre, el tipo o el orden.</p>';
  return out;
}
