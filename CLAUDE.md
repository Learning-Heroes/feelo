# CLAUDE.md

Instrucciones principales para Claude Code en el repositorio **feelo**. Complementa a [AGENTS.md](./AGENTS.md) (reglas compartidas con cualquier agente) — en caso de conflicto, `AGENTS.md` manda en lo que es común a todos los agentes, y este archivo manda en lo específico de Claude Code.

## Stack

- **App:** Expo (React Native).
- **Backend/datos:** Supabase (Postgres, Auth, Storage, Edge Functions).
- Sin subagentes: este proyecto trabaja con **Skills** de Claude Code (`.claude/skills/`), no con subagentes.

## Cómo razonar antes de tocar código

1. Lee `AGENTS.md` y `.agents/rules.md` si es la primera vez en la sesión.
2. Localiza el contexto funcional relevante en `docs/` (empezando por `docs/index.md`) antes de asumir cómo funciona algo.
3. Si la tarea es ambigua en producto (no en implementación), pregunta antes de inventar alcance.
4. Si la tarea toca el modelo de datos, revisa `docs/database.md` antes de escribir una migración.
5. Prefiere una skill existente en `.claude/skills/` a reinventar el enfoque cada vez.

## Comandos permitidos

- Lectura y edición de código de la app y `supabase/` (migraciones, seeds, funciones).
- `npm run lint`, `npm run test`, `npm run start` y equivalentes de Expo/Supabase CLI.
- Comandos de git locales (status, diff, add, commit, branch). **No hacer `push` ni tocar el remoto sin confirmación explícita.**
- No ejecutar migraciones contra un proyecto de Supabase de producción sin confirmación explícita.

## Criterios de calidad

- Sigue las convenciones de `.agents/rules.md` (idioma del código en inglés, estructura, seguridad).
- No añadas dependencias, abstracciones o servicios nuevos sin necesidad concreta de la tarea.
- No hardcodees claves ni URLs de Supabase: usa variables de entorno (`.env`, nunca committeado).
- Cambios en esquema de datos o contratos de API se documentan en `docs/database.md` / `docs/api-contracts.md`.
- Decisiones no deducibles del código van a `docs/decisions/` como ADR.

## Flujo de trabajo

Ver `.agents/workflows.md` para el flujo completo (crear tarea → implementar → probar → documentar → PR). Plantilla de PR en `.github/pull_request_template.md`.

## Skills disponibles

Índice completo en `.claude/skills/` y `.agents/skills.md`. De partida:

- `expo` — estructura de app, navegación, componentes, estado, testing en Expo/React Native.
- `supabase` — schema, migraciones, RLS, seed data, queries, Edge Functions.
- `docs-and-testing` — cómo documentar cambios y qué mínimo de tests se espera.

## Contexto de arranque

`.claude/context.md` resume qué cargar antes de empezar a trabajar en una sesión nueva.
