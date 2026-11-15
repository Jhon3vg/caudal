/* Huella o rostro: abre Caudal sin escribir la clave de 4 dígitos.
   Usa el desbloqueo del propio celular (WebAuthn, autenticador del dispositivo con verificación del usuario).
   Es de cada dispositivo (localStorage caudal.bio = id de la credencial), no se sincroniza, y necesita
   una clave activa: la clave es el respaldo si la huella falla o el celular no la reconoce.
   Caudal nunca ve la huella ni la cara: solo recibe del celular un "sí, es la persona". */
const BIO = { ok:null, pidiendo:false, auto:false };
const bioId = () => lsGet('bio');
const bioOn = () => !!(bioId() && S.settings.pin && BIO.ok !== false);
const bioRnd = n => crypto.getRandomValues(new Uint8Array(n));
const b64url = u8 => b64(u8).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const deB64url = s => deB64(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4));

/* ¿este celular tiene huella, rostro o bloqueo de pantalla para esto? (se averigua una vez) */
(async () => {
  try { BIO.ok = !!(window.PublicKeyCredential && await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()); }
  catch (_) { BIO.ok = false; }
  if (ui.view === 'ajustes') { SETIDX = null; render(); }
  if (PIN.modo === 'abrir') { pinPintar(); bioAuto(); }
})();

async function bioActivar(){
  if (!BIO.ok) return toast('Este celular no permite usar huella o rostro aquí');
  try {
    const mail = session ? session.user.email : 'Caudal';
    const c = await navigator.credentials.create({ publicKey:{
      challenge:bioRnd(32), rp:{ name:'Caudal', id:location.hostname },
      user:{ id:bioRnd(16), name:mail, displayName:(S.settings.name || mail) },
      pubKeyCredParams:[{ type:'public-key', alg:-7 }, { type:'public-key', alg:-257 }],
      authenticatorSelection:{ authenticatorAttachment:'platform', userVerification:'required', residentKey:'preferred' },
      timeout:60000, attestation:'none' } });
    lsSet('bio', b64url(new Uint8Array(c.rawId)));
    SETIDX = null; render(); toast('Listo: Caudal abre con tu huella o tu rostro');
  } catch (e) {
    toast(e && e.name === 'NotAllowedError' ? 'No se activó. Puedes intentarlo cuando quieras.' : 'No se pudo activar en este celular', 3200);
  }
}
function bioQuitar(){ lsSet('bio', ''); SETIDX = null; render(); toast('Caudal vuelve a pedir solo la clave'); }

/* pide la huella o el rostro; si el celular dice que sí, se abre la app */
async function bioPedir(){
  if (!bioOn() || BIO.pidiendo || PIN.modo !== 'abrir' || document.hidden) return;
  BIO.pidiendo = true;
  try {
    await navigator.credentials.get({ publicKey:{ challenge:bioRnd(32), rpId:location.hostname, timeout:60000,
      userVerification:'required', allowCredentials:[{ type:'public-key', id:deB64url(bioId()) }] } });
    pinVibrar(10); pinAbrirApp();
  } catch (e) {
    /* cancelada o sin reconocer: queda la clave. Si la credencial ya no existe en el celular, se quita */
    if (e && e.name === 'InvalidStateError') lsSet('bio', '');
    if (PIN.modo === 'abrir') { PIN.msg = e && e.name === 'NotAllowedError' ? '' : 'No se pudo usar la huella. Escribe tu clave.'; pinPintar(); }
  } finally { BIO.pidiendo = false; }
}
/* al aparecer la pantalla de la clave se pide sola, una vez por cada vez que se bloquea */
function bioAuto(){ if (!BIO.auto && bioOn() && PIN.modo === 'abrir' && !document.hidden) { BIO.auto = true; setTimeout(bioPedir, 250); } }

const BIO_ICO = '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 8.5a6.5 6.5 0 0 1 11.6 1.3"/><path d="M4.6 12.4a8 8 0 0 1 .5-5.6M18.6 13.2c0 2.3-.4 4.4-1.2 6.3"/><path d="M8.8 18.8a14 14 0 0 0 .9-5.2 2.3 2.3 0 0 1 4.6 0c0 1.2-.1 2.4-.3 3.5M12 13.6c0 3.1-.6 5.6-1.8 7.6"/><path d="M7.2 12.6c0 2.2-.4 4-1.2 5.4M15.2 19.6c.2-.6.4-1.3.5-2"/></svg>';
function bioTecla(off){ return '<button class="bio" data-pk="bio" aria-label="Abrir con huella o rostro"' + (off ? ' disabled' : '') + '>' + BIO_ICO + '</button>'; }

/* fila en Ajustes › Seguridad */
function bioFila(){
  if (!BIO.ok) return '';
  const pin = !!S.settings.pin, on = bioOn();
  return '<div class="set"><div class="t"><b>Huella o rostro</b><span>' +
    (on ? 'Activo en este celular. Si falla, escribes la clave.' : pin ? 'Abre Caudal con el desbloqueo de tu celular, sin escribir la clave.' : 'Abre Caudal con tu huella o tu rostro. Primero creas una clave de 4 dígitos como respaldo.') +
    '</span></div><button class="btn sm' + (on ? ' ghost' : '') + '" data-pinacc="' + (on ? 'bioquitar' : 'bio') + '">' + (on ? 'Quitar' : 'Activar') + '</button></div>';
}

document.addEventListener('click', e => {
  const b = e.target.closest('[data-pinacc="bio"],[data-pinacc="bioquitar"]'); if (!b) return;
  e.stopImmediatePropagation();
  if (b.dataset.pinacc === 'bioquitar') return bioQuitar();
  if (!S.settings.pin) return pinMostrar('nueva', 'bio'); /* al guardar la clave sigue la huella */
  bioActivar();
}, true);
/* al volver a la app con la pantalla de la clave a la vista */
document.addEventListener('visibilitychange', () => { if (!document.hidden && PIN.modo === 'abrir') { BIO.auto = false; bioAuto(); } });
