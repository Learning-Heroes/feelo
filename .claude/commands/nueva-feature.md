---
description: Implementa una feature nueva siguiendo el flujo del repo (entender → implementar → probar → documentar → PR)
---

Vas a implementar la siguiente feature: $ARGUMENTS

Sigue el flujo de trabajo descrito en `CLAUDE.md`:

1. Lee `AGENTS.md`, `.claude/context.md` y la parte de `docs/` relevante para esta feature (no todo `docs/`, solo lo necesario).
2. Si la feature implica una decisión de arquitectura o de modelo de datos no trivial, propone o actualiza un ADR en `docs/decisions/` antes de escribir código.
3. Implementa el cambio más pequeño que resuelve la feature. Código en inglés.
4. Si hay tests/lint definidos, ejecútalos.
5. Actualiza `docs/` si la feature cambia arquitectura, contratos de API o el modelo de datos.
6. Prepara el resumen para el PR siguiendo `.github/pull_request_template.md`.
