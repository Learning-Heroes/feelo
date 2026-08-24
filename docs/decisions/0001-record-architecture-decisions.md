# 0001 · Registrar decisiones de arquitectura como ADRs

- **Estado**: aceptada
- **Contexto**: necesitamos un sitio para las decisiones que no se pueden deducir leyendo el código (por qué X en vez de Y), para que un agente o una persona nueva no las repita ni las contradiga sin saberlo.
- **Decisión**: cada decisión de arquitectura, modelo de datos o elección de librería no trivial se documenta como un ADR en `docs/decisions/`, con formato `NNNN-titulo-corto.md`.
- **Consecuencias**: más disciplina al tomar decisiones; a cambio, el "por qué" del proyecto queda escrito y versionado junto al código, no en la memoria del equipo.
