# supabase/ — backend

Postgres + RLS + Edge Functions. Root rules in [`../AGENTS.md`](../AGENTS.md) still apply. Owner: Rafa.

## Layout

```
supabase/
  migrations/   # versioned SQL — the only way to change the schema
  functions/    # Edge Functions (Deno, Hono + @hono/zod-openapi)
  seed.sql      # reproducible test data, incl. seed users per role
  config.toml
```

## Hard rules

1. **Local only.** Agents work against `npx supabase start`. Never `db push`, `link`, `functions deploy`, `secrets set` or anything with `--linked` / `--project-ref` / `--db-url`: migrations and functions are promoted by CI.
2. **The schema never changes from the dashboard.** Every change is a new file in `migrations/`. Never edit a migration that has already been applied — write a new one.
3. **RLS enabled on every table from day 1**, no temporary exceptions. One explicit policy per verb (`select`, `insert`, `update`, `delete`); never a generic `for all`.
4. Catalog tables (`content`, `genre`, `content_genre`, `platform`, `content_platform`, `clip`) are public read, write only through seed/ingestion with `service_role`. User tables are scoped to `auth.uid()`.
5. `service_role` and `TMDB_API_KEY` live only in function secrets. The client only ever has the `anon` key.

## Migrations

- One responsibility per migration, descriptive name (`npx supabase migration new add_user_mood`).
- Reversible, or with a written recovery plan in the PR.
- Postgres native enums for closed sets (`reaction`, `intent`, `content_type`…), `jsonb` for raw TMDB `metadata`.
- After every change: `npx supabase db reset` → regenerate types → `npm run api:sync`, all in the same PR.
- Load the `new-migration` skill for the full checklist and SQL template.

## Data logic

- Data logic lives in Postgres functions (RPC); Edge Functions are for what needs secrets, third parties (TMDB, RevenueCat webhooks) or the scoring pipeline.
- Push filters and joins into SQL; never return extra rows for the client to filter.
- Idempotency in everything a phone may retry on a flaky network (upserts on natural keys, idempotency keys on webhooks).

## Edge Functions

- One function = one responsibility, in `functions/<kebab-name>/index.ts`.
- Validate input with **Zod before touching anything**; that same schema produces the OpenAPI via `@hono/zod-openapi`.
- Stable error `code` + message; never leak internals or log a secret.
- Load the `edge-function` skill for the template.

## Tests

- RLS is tested with **several users** (user A, user B, anonymous): prove isolation, not just a 200.
- `seed.sql` keeps one seed user per role so QA can reproduce on staging.
- Function tests with `deno test`; DB tests with `npx supabase test db` (pgTAP) when present.
