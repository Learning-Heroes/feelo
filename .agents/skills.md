# Índice de skills

Skills de Claude Code disponibles en este repo (`.claude/skills/`). Nada de subagentes: todo el trabajo especializado se apoya en skills.

| Skill | Cuándo usarla |
|---|---|
| [`expo`](../.claude/skills/expo/SKILL.md) | Pantallas, navegación, componentes, estado o llamadas a Supabase desde la app. |
| [`supabase`](../.claude/skills/supabase/SKILL.md) | Schema, migraciones, RLS, seed data, queries, Edge Functions. |
| [`docs-and-testing`](../.claude/skills/docs-and-testing/SKILL.md) | Al cerrar cualquier tarea: qué documentar y qué mínimo de tests se espera. |

Los tres son placeholders escritos a mano a partir del temario de Feelo. Cuando el proyecto tenga código real, evaluar sustituirlos (o complementarlos) por plugins oficiales/de comunidad ya empaquetados:

## Plugins recomendados a instalar (opcional, evaluar con el equipo)

- **Supabase** — plugin oficial que empaqueta el MCP de Supabase + skills de Supabase:
  ```
  claude plugin marketplace add anthropics/claude-plugins-official
  claude plugin install supabase@claude-plugins-official
  /reload-plugins
  ```
  Fuente: [Supabase Docs — Plugin para agentes de IA](https://supabase.com/docs/guides/ai-tools/plugins), [supabase-community/supabase-plugin](https://github.com/supabase-community/supabase-plugin).
  El MCP conecta a un proyecto real de Supabase (URL + token); por seguridad, apuntar solo a desarrollo/staging con `read_only=true` salvo necesidad explícita, nunca a producción por defecto.

- **Expo** — Expo publica sus propias skills oficiales para agentes de IA:
  - [`expo/skills`](https://github.com/expo/skills) (repo oficial de Expo).
  - Documentación oficial: [Expo Skills for AI agents](https://docs.expo.dev/skills/) y [Claude Code + Expo](https://docs.expo.dev/agents/claude/).
  - Alternativas de comunidad más extensas si hace falta más cobertura (navegación, testing, performance): [`awesome-react-native-skills`](https://github.com/maikotrindade/awesome-react-native-skills), [`software-mansion-labs/skills`](https://github.com/software-mansion-labs/skills).

Antes de instalar cualquiera de estos, confirmar con el equipo (añaden dependencias externas y, en el caso de Supabase MCP, credenciales reales).
