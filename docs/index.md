# Índice de documentación

Mapa de lectura recomendado para humanos y agentes. No hace falta leer todo esto en cada tarea — solo lo relevante.

| Archivo | Contenido | Cuándo leerlo |
|---|---|---|
| [`product.md`](product.md) | Descripción funcional de la app | Antes de trabajar en cualquier feature de producto |
| [`architecture.md`](architecture.md) | Arquitectura Expo + Supabase | Antes de tocar la estructura de la app o la integración con Supabase |
| [`database.md`](database.md) | Modelo de datos, tablas, relaciones, RLS | Antes de tocar el esquema o escribir queries/políticas nuevas |
| [`api-contracts.md`](api-contracts.md) | Contratos entre app, Supabase y servicios externos | Antes de tocar una integración o Edge Function |
| [`decisions/`](decisions/) | ADRs — decisiones no deducibles del código | Cuando haga falta entender el "por qué" de algo ya decidido |
| [`skills/`](skills/) | Skills y prompts reutilizables (Expo, Supabase, docs, testing) | Al reutilizar un enfoque ya resuelto antes |

Reglas generales para agentes: [`../AGENTS.md`](../AGENTS.md). Instrucciones específicas de Claude: [`../CLAUDE.md`](../CLAUDE.md).
