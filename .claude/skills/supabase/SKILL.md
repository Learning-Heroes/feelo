---
name: supabase
description: Convenciones para trabajar en la capa de datos/backend de Feelo en Supabase — diseño de schema, migraciones, RLS, seed data, queries y Edge Functions. Usar al crear o modificar tablas, políticas, funciones o queries.
---

# Supabase — Feelo

## Diseño de schema

- Toda tabla nueva vive en una migración versionada (`supabase/migrations/`), nunca creada a mano en el dashboard.
- Documentar la tabla (propósito, columnas, relaciones) en `docs/database.md` en el mismo cambio.
- Preferir claves foráneas explícitas y `NOT NULL` por defecto salvo que el campo sea genuinamente opcional.

## Migraciones

- Crear con `supabase migration new <nombre-descriptivo>`.
- Una migración = un cambio lógico. No mezclar cambios de schema no relacionados.
- Probar contra Supabase local (`supabase start`, `supabase db push`) antes de aplicar a staging/producción.

## Row Level Security (RLS)

- RLS activado por defecto en toda tabla con datos de usuario. Sin excepciones sin ADR que lo justifique.
- Escribir una política explícita por operación (`select`, `insert`, `update`, `delete`) en vez de una política genérica "todo permitido".
- Verificar cada política con al menos dos usuarios distintos (uno debe ver lo suyo, no debe ver lo del otro).

## Seed data

- `supabase/seed.sql` para datos de desarrollo reproducibles. No usar datos reales de usuarios como seed.

## Queries

- Preferir queries tipadas con los tipos generados (`supabase gen types typescript`) sobre `any`.
- Empujar filtros/joins a Postgres (RLS + queries) en vez de traer todo y filtrar en el cliente.

## Edge Functions (si aplica)

- Una función = una responsabilidad clara, documentada en `docs/api-contracts.md` (input, output, auth requerida, errores).
- Nunca exponer la `service_role key` fuera del entorno de servidor de la función.
