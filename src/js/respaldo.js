/* Respaldo descargable y recordatorio mensual. */
/* el respaldo semanal del atajo viene por tablas (como la base); se convierte al formato de la app */
function normBackup(s){ return s && s.app === 'Caudal' && Array.isArray(s.settings) ? fromRows({ inbox:[], ...s }) : s; }
function lastBackup(){ let l = 0; try { l = +localStorage.getItem('caudal.lastBackup') || 0; } catch (_) {} const a = S.settings && S.settings.backupAt ? Date.parse(S.settings.backupAt) : 0; return Math.max(l, a || 0); }
function backupAge(){ const l = lastBackup(); if (!l) return 'Archivo con todos tus datos. Aún no has guardado ninguno en este teléfono.'; const d = Math.floor((Date.now() - l) / 864e5); return 'Último: ' + (d === 0 ? 'hoy' : d === 1 ? 'ayer' : 'hace ' + d + ' días') + '. Se guarda en los archivos del celular.'; }
function autoBackupRow(){
  const a = S.settings && S.settings.backupAt ? Date.parse(S.settings.backupAt) : 0, d = a ? Math.floor((Date.now() - a) / 864e5) : null;
  const url = (typeof CTOKEN !== 'undefined' && CTOKEN && typeof CLOUD !== 'undefined') ? CLOUD.url + '/functions/v1/respaldo?k=' + CTOKEN : '';
  return '<div class="set"><div class="t"><b>Respaldo automático</b><span>' + (a ? 'Último: ' + (d === 0 ? 'hoy' : d === 1 ? 'ayer' : 'hace ' + d + ' días') + '. Lo hace MacroDroid en tu celular.' : 'Aún no está activo. Se configura una vez con MacroDroid.') + '</span></div>' +
    (url ? '<button class="btn sm ghost" data-copy="' + esc(url) + '">Copiar dirección</button>' : '') + '</div>' +
    '<details class="howto"><summary>Cómo activarlo (2 minutos)</summary><div>' +
    '1. Instala <b>MacroDroid</b> (gratis, en Play Store).<br>' +
    '2. <b>Agregar macro</b> → nombre <b>Respaldo Caudal</b>.<br>' +
    '3. Disparador: <b>Fecha/Hora</b> → <b>Día de la semana/hora</b>: elige el día y la hora.<br>' +
    '4. Acción: <b>Solicitud HTTP</b>, método <b>GET</b>, y pega la dirección (botón Copiar dirección). Activa la opción de <b>guardar la respuesta en un archivo</b> y ponle <b>caudal-respaldo.json</b> en tu carpeta de Descargas o Drive.<br>' +
    '5. Guarda la macro.<br>' +
    'Cada vez que corra, aquí verás la fecha del último respaldo.</div></details>';
}
async function downloadBackup(){
  const name = 'caudal-respaldo-' + iso(new Date()) + '.json', data = JSON.stringify(S);
  const mark = msg => { try { localStorage.setItem('caudal.lastBackup', String(Date.now())); } catch (_) {} render(); toast(msg); };
  /* en el celular se comparte (Guardar en Archivos); en el computador, o si compartir falla, se descarga */
  const file = new File([data], name, { type:'application/json' });
  if (matchMedia('(pointer: coarse)').matches && navigator.canShare && navigator.canShare({ files:[file] })) {
    try { await navigator.share({ files:[file], title:'Respaldo de Caudal' }); return mark('Respaldo guardado'); }
    catch (e) { if (e && e.name === 'AbortError') return; }
  }
  try {
    const url = URL.createObjectURL(new Blob([data], { type:'application/json' })), a = document.createElement('a');
    a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1e4); mark('Respaldo descargado');
  } catch (_) { toast('No se pudo guardar el respaldo'); }
}
document.addEventListener('click', e => { if (e.target.closest('[data-backup]')) { e.stopPropagation(); downloadBackup(); } }, true);

function smartPill(){
  return '<div class="ask"><button class="ask-main" data-smart="texto">' + SPARK + '<span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">Anota un gasto…</span></button><button class="ask-ic" data-smart="voz" aria-label="Registrar por voz">' + MIC + '</button></div>';
}
