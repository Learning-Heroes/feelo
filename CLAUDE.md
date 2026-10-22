@AGENTS.md

## Claude Code specifics

- `app/CLAUDE.md`, `src/CLAUDE.md` and `supabase/CLAUDE.md` import the folder's `AGENTS.md` when you work there.
- Guardrails: permissions in `.claude/settings.json`, hooks in `.claude/hooks/`. A denied call or a hook error means stop and fix or ask — never work around it.
- MCP (`.mcp.json`): read tasks and docs through `notion`; `supabase` is the hosted Supabase MCP in `read_only` mode, scoped to `$SUPABASE_PROJECT_REF` (staging) — use it to inspect schema, data and logs; schema changes still go through migrations + `db push`. `supabase-local` is the local stack's MCP and only answers after `npx supabase start`.
- No subagents yet: specialised work goes through the skills in `.claude/skills/`.
- `git push` and anything touching the remote need explicit confirmation.
