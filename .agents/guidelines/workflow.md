# Workflow

## Create a task

1. Define the problem and the expected outcome in one sentence.
2. If it touches product scope ambiguously, clarify with the team before implementing.
3. If it touches architecture or the data model non-trivially, sketch an ADR in `docs/decisions/` before writing code.

## Implement

1. Load only the context you need (`AGENTS.md`, the relevant part of `docs/`).
2. Smallest change that resolves the task. Code in English.
3. Reuse existing skills in `.agents/skills/` (see the Skills section in [`AGENTS.md`](../../AGENTS.md)) instead of reinventing the approach.

## Test

1. `npm run lint` and `npm run test` (once defined).
2. For data changes: test migrations against local Supabase (`supabase start`, `supabase db push`), never directly against production.
3. For RLS changes: verify with at least two different users that policies isolate data as expected.

## Document

1. Update `docs/architecture.md`, `docs/database.md` or `docs/api-contracts.md` if the change affects them.
2. Add/update an ADR in `docs/decisions/` if a decision can't be deduced from the code.

## Open a PR

1. Follow `.github/pull_request_template.md`.
2. Confirm there are no secrets in the diff.
3. Confirm affected documentation is updated in the same PR.
4. Before opening the PR, consider running the official `code-review` and/or `simplify` skills; if the change touches RLS, auth or sensitive data, also run `security-review` (see the Skills section in [`AGENTS.md`](../../AGENTS.md)).
