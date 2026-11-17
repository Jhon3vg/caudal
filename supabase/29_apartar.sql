-- Caudal · apartar plata para pagarle a alguien (versión de Jhon).
-- transactions.lig: enlaza los dos movimientos de un apartado (el pago de la deuda y la plata suya que queda en tu cuenta)
-- para mostrarlos como una sola línea y borrarlos juntos. Solo agrega una columna; no cambia ningún dato existente.
alter table public.transactions add column if not exists lig text;
