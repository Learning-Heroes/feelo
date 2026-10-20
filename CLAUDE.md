@AGENTS.md

## Claude Code specifics

- Folder rules load on their own: `app/CLAUDE.md`, `src/CLAUDE.md` and `supabase/CLAUDE.md` import the matching `AGENTS.md` when you work there.
- Permissions live in `.claude/settings.json`: lint, types, tests and local Supabase are allowed; reading `.env`, editing `api/` / `postman/` and any command against a remote Supabase or EAS production are denied. A denied call means stop and ask, not find a workaround.
- Hooks in `.claude/hooks/`: `protect-generated.sh` blocks edits to generated files; `check-after-edit.sh` runs ESLint + `tsc` after every edit of a TS/JS file. When the hook reports errors, fix them before moving on.
- MCP servers in `.mcp.json`: `notion` (tasks and docs — read the task and linked pages from there, not from memory) and `supabase-local` (local stack only, needs `npx supabase start`).
- No subagents yet: specialised work goes through the skills in `.claude/skills/`.
- `git push` and anything touching the remote need explicit confirmation from the user.
