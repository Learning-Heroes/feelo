# Base de datos

> `TODO`: completar cuando exista un esquema real. Mantener este archivo sincronizado con las migraciones — si cambia el esquema, cambia este documento en el mismo PR.

## Tablas

`TODO`: por tabla — nombre, propósito, columnas relevantes, relaciones.

## Row Level Security (RLS)

`TODO`: por tabla — quién puede leer/escribir y bajo qué condición. Toda tabla nueva debe tener RLS activado por defecto (ver [`../.agents/rules.md`](../.agents/rules.md)).

## Migraciones

- Ubicación: `supabase/migrations/`.
- Convención de nombres: `TODO` (por defecto, el timestamp que genera `supabase migration new <nombre>`).
- Nunca aplicar cambios de esquema a mano en el dashboard de Supabase fuera de desarrollo local.

## Seed data

`TODO`: cómo y dónde se define la data de desarrollo (`supabase/seed.sql` u otro mecanismo).
