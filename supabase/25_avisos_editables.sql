-- Caudal · avisos personalizables (versión de Jhon).
-- settings.avisos guarda la configuración de los avisos (hora, anticipación y días de cada tipo, y los
-- recordatorios propios), para que sea la misma en el celular y en el computador.
-- Solo agrega una columna a una tabla existente: conserva sus grants y no cambia ningún dato.
alter table public.settings add column if not exists avisos jsonb;
