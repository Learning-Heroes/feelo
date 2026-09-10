# AGENTS.md

Shared rules for any AI agent (Claude, Copilot, Cursor, Codex, etc.) working in this repository.

## Source of truth

All rules, skills and guidelines live in `.agents/`. This file and `.claude/CLAUDE.md` are projections — don't duplicate content here, edit `.agents/` first.

| Need | File |
|---|---|
| Language, architecture, security (blocking) | [`.agents/guidelines/principles.md`](.agents/guidelines/principles.md) |
| Expo / React Native | [`.agents/guidelines/expo.md`](.agents/guidelines/expo.md) |
| Supabase (schema, RLS, migrations) | [`.agents/guidelines/supabase.md`](.agents/guidelines/supabase.md) |
| Testing | [`.agents/guidelines/testing.md`](.agents/guidelines/testing.md) |
| Documentation / ADRs | [`.agents/guidelines/documentation.md`](.agents/guidelines/documentation.md) |
| Workflow (task → PR) | [`.agents/guidelines/workflow.md`](.agents/guidelines/workflow.md) |
| Product concept | [`docs/product.md`](docs/product.md) |

## Skills

Project skills live in `.agents/skills/` (available in Claude Code via the `.claude/skills/` symlink):

| Skill | When to use it |
|---|---|
| [`expo`](.agents/skills/expo/SKILL.md) | Feelo-specific screens, swipe-deck state, and calls to Supabase from the app. |
| [`supabase`](.agents/skills/supabase/SKILL.md) | Schema, migrations, RLS, seed data, queries, Edge Functions. |
| [`docs-and-testing`](.agents/skills/docs-and-testing/SKILL.md) | When closing any task: what to document and the minimum tests expected. |

Plus official plugins from the `claude-plugins-official` marketplace (already configured — `claude plugin install <name>@claude-plugins-official`):

- **`expo`** ([expo/skills](https://github.com/expo/skills)) — **installed**. OSS framework skills: routing (`expo-router`), data fetching, project structure, native UI, Tailwind setup, EAS build/deploy/update workflows. Our own `expo` skill above is scoped down to only what this plugin doesn't cover (Feelo's screens/data flow) — use the official `expo-*` skills for anything generic.
- **`supabase`** ([supabase-community/supabase-plugin](https://github.com/supabase-community/supabase-plugin)) — not installed yet. The `supabase` and `supabase-postgres-best-practices` skills work standalone (schema/RLS/migration guidance); it also bundles a Supabase MCP server that connects live to a real project once a token is configured — point that only at dev/staging with `read_only=true` unless there's an explicit need, never at production by default. Install once there's a real Supabase project.

Official Claude Code skills worth reusing as-is (not part of this repo): `code-review` / `simplify` before opening a PR, `security-review` for anything touching RLS/auth/sensitive data, `solid` as a clean-design reference. See [`.agents/guidelines/workflow.md`](.agents/guidelines/workflow.md) for where these fit.

## Projection contract

`.claude/rules/*.md` and `.claude/CLAUDE.md` are projections of `.agents/` for Claude Code — don't duplicate guideline content there, edit `.agents/guidelines/` first and let the `@`-import stubs pick it up. `.claude/skills` is a symlink to `.agents/skills/`, never edited directly.

## Stack

Expo (React Native) for the app + Supabase for database, authentication and backend/data layer. Do not introduce another backend, ORM or auth service without recording the decision in `docs/decisions/`.

## Repo structure

- `README.md` — functional entry point (in Spanish — see [`.agents/guidelines/principles.md`](.agents/guidelines/principles.md) for the language policy).
- `AGENTS.md` (this file) — shared rules for any agent, navigation map into `.agents/`.
- `.claude/` — Claude Code-specific configuration, commands and the skills symlink.
- `.agents/` — source of truth: guidelines and skills.
- `.github/` — PR/issue templates and repo-level operational rules.
- `docs/` — functional and technical documentation (start at `docs/index.md`).

## Recommended reading order

1. This file and [`.agents/guidelines/principles.md`](.agents/guidelines/principles.md).
2. `docs/index.md` → `docs/product.md` → `docs/architecture.md`.
3. `docs/database.md` and `docs/api-contracts.md` if the task touches data or integrations.
4. `docs/decisions/` only when you need to understand the "why" of a specific decision.

## Checks before closing a task

- Code follows `.agents/guidelines/`.
- Lint and tests pass (`npm run lint`, `npm run test`).
- No secrets exposed (`.env`, Supabase keys) in the commit.
- If the task affects the data model or a public API, `docs/database.md` or `docs/api-contracts.md` is updated.
- If a decision was made that can't be deduced from the code, an ADR was added in `docs/decisions/`.
