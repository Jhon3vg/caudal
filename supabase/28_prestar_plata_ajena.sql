-- Caudal · prestar plata de otra persona (versión de Jhon).
-- transactions.de: en un préstamo, de quién era la plata que prestaste (vacío = era tuya).
-- Solo agrega una columna; no cambia ningún dato existente. Columna nueva en una tabla existente: conserva sus grants.
alter table public.transactions add column if not exists de text;
