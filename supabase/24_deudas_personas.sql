-- Caudal · deudas por persona y deudas en pausa (versión de Jhon).
-- accounts.debt suma 'pausa': lo que debes pero no tienes en tus cuentas. Es una cuenta apartada: no resta
--   de tu disponible hasta que la pagas desde una de tus cuentas.
-- transactions.persona: a quién le debes, a quién le prestaste o de quién es la plata que guardas.
-- Solo amplía la regla y agrega una columna; no cambia ningún dato existente. Columna nueva en una tabla existente: conserva sus grants.
alter table public.accounts drop constraint if exists accounts_debt_check;
alter table public.accounts add constraint accounts_debt_check check (debt in ('pagar','cobrar','pausa'));
alter table public.transactions add column if not exists persona text;
