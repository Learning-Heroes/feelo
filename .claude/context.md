# Contexto de arranque

Resumen que Claude debe cargar antes de empezar a trabajar en una sesión nueva sobre **feelo**.

1. **Stack:** Expo (app) + Supabase (datos/auth/backend). Ver [`CLAUDE.md`](../CLAUDE.md) y [`AGENTS.md`](../AGENTS.md).
2. **Reglas compartidas:** [`.agents/rules.md`](../.agents/rules.md) — código en inglés, docs funcionales en español, RLS obligatoria, sin secretos en el repo.
3. **Mapa de documentación funcional:** [`docs/index.md`](../docs/index.md).
4. **Skills disponibles:** [`.claude/skills/`](./skills/) — usar antes de improvisar un enfoque para Expo o Supabase.
5. **Sin subagentes:** este proyecto resuelve todo con skills de Claude Code, no con subagentes.

Si el resumen de este archivo entra en conflicto con `AGENTS.md` o `.agents/rules.md`, esos archivos mandan — este es solo un atajo de lectura.
