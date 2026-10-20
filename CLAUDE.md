@AGENTS.md

## Claude Code specifics

- `app/CLAUDE.md`, `src/CLAUDE.md` and `supabase/CLAUDE.md` import the folder's `AGENTS.md` when you work there.
- Guardrails: permissions in `.claude/settings.json`, hooks in `.claude/hooks/`. A denied call or a hook error means stop and fix or ask — never work around it.
- MCP (`.mcp.json`): read tasks and docs through `notion`; `supabase-local` needs `npx supabase start`.
- No subagents yet: specialised work goes through the skills in `.claude/skills/`.
- `git push` and anything touching the remote need explicit confirmation.
