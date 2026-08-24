@../AGENTS.md
@rules/principles.md
@rules/expo.md
@rules/supabase.md
@rules/testing.md
@rules/documentation.md
@rules/workflow.md

## Claude Code specifics

- No subagents: specialized work goes through Skills (`.claude/skills/`, a symlink to `.agents/skills/`).
- Allowed commands: read/edit app code and `supabase/` (migrations, seeds, functions); `npm run lint`, `npm run test`, `npm run start` and Expo/Supabase CLI equivalents; local git (status, diff, add, commit, branch) — **no `push` and no touching the remote without explicit confirmation**. Exact permissions live in `.claude/settings.json`.
- Never run migrations against a production Supabase project without explicit confirmation.
- Official skills to reach for when they apply: `code-review` / `simplify` before a PR, `security-review` for changes touching RLS/auth, `solid` as a code-quality reference (see the Skills section in [`AGENTS.md`](../AGENTS.md)).
