# AGENTS.md

Reglas compartidas para cualquier agente de IA (Claude, Copilot, Cursor, Codex, etc.) que trabaje en este repositorio. Este archivo es la entrada raíz; el detalle vive en [`.agents/`](./.agents/).

## Idioma

- **Código:** inglés siempre — nombres de variables, funciones, clases, tipos, commits técnicos y comentarios cuando aplique.
- **Documentación funcional:** español (README, `docs/product.md`, `docs/architecture.md`, etc.) — es el idioma del curso y del equipo.
- **Instrucciones para agentes** (este archivo, `CLAUDE.md`, `.agents/`): español, para que el equipo las mantenga con facilidad.

## Stack

Expo (React Native) para la app + Supabase para base de datos, autenticación y backend/data layer. No introducir otro backend, ORM o servicio de auth sin registrar la decisión en `docs/decisions/`.

## Estructura del repo

- `README.md` — puerta de entrada funcional.
- `CLAUDE.md` — instrucciones operativas para Claude Code.
- `AGENTS.md` (este archivo) — reglas compartidas para cualquier agente.
- `.claude/` — configuración, comandos y skills específicas de Claude Code.
- `.agents/` — reglas, workflows y convenciones detalladas (fuente de verdad de este archivo).
- `.github/` — plantillas de PR/issue y reglas operativas del repositorio.
- `docs/` — documentación funcional y técnica del proyecto (empezar por `docs/index.md`).

## Fuentes de contexto (orden de lectura recomendado)

1. Este archivo (`AGENTS.md`) y `.agents/rules.md`.
2. `docs/index.md` → `docs/product.md` → `docs/architecture.md`.
3. `docs/database.md` y `docs/api-contracts.md` si la tarea toca datos o integraciones.
4. `docs/decisions/` solo si hace falta entender el porqué de una decisión concreta.

## Validaciones antes de dar por cerrada una tarea

- El código sigue las convenciones de `.agents/rules.md`.
- Lint y tests pasan (`npm run lint`, `npm run test`).
- No se han expuesto secretos (`.env`, claves de Supabase) en el commit.
- Si la tarea afecta al modelo de datos o a una API pública, se actualiza `docs/database.md` o `docs/api-contracts.md`.
- Si se toma una decisión no deducible del código, se añade un ADR en `docs/decisions/`.

## Detalle

Ver `.agents/rules.md` (convenciones), `.agents/workflows.md` (flujos de trabajo) y `.agents/skills.md` (índice de skills disponibles).
