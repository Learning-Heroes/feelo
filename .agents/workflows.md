# Flujos de trabajo

## Crear una tarea

1. Definir el problema y el resultado esperado en una frase.
2. Si toca producto/alcance de forma ambigua, aclarar con el equipo antes de implementar.
3. Si toca arquitectura o modelo de datos de forma no trivial, esbozar un ADR en `docs/decisions/` antes de escribir código.

## Implementar

1. Cargar solo el contexto necesario (`AGENTS.md`, `.claude/context.md`, la parte de `docs/` relevante).
2. Cambio más pequeño que resuelve la tarea. Código en inglés.
3. Reutilizar skills existentes en `.claude/skills/` en vez de reinventar el enfoque.

## Probar

1. `npm run lint` y `npm run test` (una vez definidos).
2. Para cambios de datos: probar migraciones contra Supabase local (`supabase start`, `supabase db push`), nunca directamente contra producción.
3. Para cambios de RLS: verificar con al menos dos usuarios distintos que las políticas aíslan los datos como se espera.

## Documentar

1. Actualizar `docs/architecture.md`, `docs/database.md` o `docs/api-contracts.md` si el cambio los afecta.
2. Añadir/actualizar un ADR en `docs/decisions/` si se tomó una decisión no deducible del código.
3. Actualizar `.claude/context.md` si el estado general del proyecto cambió.

## Abrir PR

1. Seguir `.github/pull_request_template.md`.
2. Confirmar que no hay secretos en el diff.
3. Confirmar que la documentación afectada está actualizada en el mismo PR.
