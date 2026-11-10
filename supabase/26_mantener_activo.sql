-- Caudal · mantener activo el proyecto gratuito de Supabase (versión de Jhon).
-- Supabase pausa los proyectos gratuitos que pasan 7 días sin actividad de usuarios en la base.
-- Jhon pasa temporadas sin internet, así que GitHub Actions (.github/workflows/mantener-supabase.yml)
-- llama a esta función todos los días por la API, con la llave pública.
-- Solo devuelve la hora del servidor: no lee ni escribe ningún dato, por eso puede llamarla anon.
create or replace function public.mantener_activo()
returns timestamptz
language sql
stable
security invoker
set search_path = ''
as $$ select now() $$;

revoke all on function public.mantener_activo() from public;
grant execute on function public.mantener_activo() to anon, authenticated, service_role;
