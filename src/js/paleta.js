/* ---------- paleta para lo que se dibuja desde JavaScript ----------
   Las gráficas SVG y las leyendas no pueden leer las variables de styles.css
   en sus atributos, así que los colores viven aquí con los mismos valores.
   Si cambias un color, cámbialo en los dos lugares. */
const PAL = {
  lima:'#7DFF66',      // ingresos y lo que va bien (verde claro; la marca es el verde con brillo)
  rosa:'#FF4D5E',      // gastos y lo que se pasa del límite (rojo coral)
  lavanda:'#4FC3FF',   // transferencias y ahorro (celeste)
  ambar:'#FFB443',     // avisos y ajustes
  agua:'#27C21F',      // verde medio (series)
  coral:'#C2FFB0',     // verde pálido (series)
  gris:'#8C998F',
  tinta:'#ECF3EE',     // texto
  superficie:'#0C110E', // fondo de tarjeta (borde de puntos en las gráficas)
  velo: a => 'rgba(255,255,255,' + a + ')' // líneas de rejilla y referencias tenues
};
/* orden fijo para series, cuentas y categorías: tonos de verde primero (como los paneles de referencia), gris al final */
const SERIE = [PAL.lima, PAL.agua, PAL.coral, PAL.lavanda, PAL.ambar, PAL.rosa, PAL.gris];
const serieColor = i => SERIE[i % SERIE.length];

/* tipos de movimiento: nombre, títulos del registro y flecha (como Retirar, Recargar e Intercambiar) */
const TIPOS = {
  gasto:{ nombre:'Gasto', corto:'Gasto', nuevo:'Nuevo gasto', editar:'Editar gasto', signo:'−', icono:'<path d="M12 19V5M6 11l6-6 6 6"/>' },
  ingreso:{ nombre:'Ingreso', corto:'Ingreso', nuevo:'Nuevo ingreso', editar:'Editar ingreso', signo:'+', icono:'<path d="M12 5v14M6 13l6 6 6-6"/>' },
  transferencia:{ nombre:'Transferencia', corto:'Transferir', nuevo:'Nueva transferencia', editar:'Editar transferencia', signo:'', icono:'<path d="M4 8h14l-4-4M20 16H6l4 4"/>' },
  ajuste:{ nombre:'Ajuste', corto:'Ajuste', nuevo:'Nuevo ajuste', editar:'Editar ajuste', signo:'±', icono:'<path d="M5 12h14M12 5v14"/>' }
};
const tipoIcono = (k, s) => '<svg width="' + (s || 18) + '" height="' + (s || 18) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + TIPOS[k].icono + '</svg>';
