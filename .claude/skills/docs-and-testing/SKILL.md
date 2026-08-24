---
name: docs-and-testing
description: Cómo documentar cambios y qué mínimo de tests se espera en Feelo. Usar al cerrar cualquier tarea que toque arquitectura, modelo de datos, contratos de API o lógica de negocio no trivial.
---

# Documentación y testing — Feelo

## Cuándo documentar

- Cambios de arquitectura → `docs/architecture.md`.
- Cambios de esquema de datos o RLS → `docs/database.md`.
- Cambios de contratos (Edge Functions, integraciones externas) → `docs/api-contracts.md`.
- Decisiones no deducibles del código (por qué X y no Y) → nuevo ADR en `docs/decisions/NNNN-titulo-corto.md`, siguiendo el formato de `docs/decisions/0001-record-architecture-decisions.md`.

La documentación se actualiza en el mismo PR que el código que la motiva, no después.

## Cuándo testear

- Lógica de negocio no trivial (cálculos, transformaciones, validaciones): test unitario.
- Políticas RLS críticas: verificación con al menos dos usuarios distintos.
- UI: priorizar tests de comportamiento (interacción, estados de carga/error) sobre snapshots.

## Qué no hacer

- No documentar lo que ya es obvio leyendo el código (eso es ruido que se desactualiza).
- No escribir tests que solo confirman que un mock devuelve lo que el mock devuelve.
