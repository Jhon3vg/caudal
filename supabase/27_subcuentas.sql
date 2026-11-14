-- Caudal · subcuentas (bolsillos) dentro de una cuenta.
-- Una cuenta puede pertenecer a otra (ej. "Ahorro" y "Gasto" dentro de "Ualá"). Solo agrega la columna; no cambia datos.
alter table public.accounts add column if not exists parent_id text;
