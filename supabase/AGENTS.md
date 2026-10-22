# supabase/ — backend

Only what's specific to the backend; the root `AGENTS.md` still applies. Owner: Rafa.

```
supabase/
  config.toml   # CLI + Auth/Storage config (versioned; not applied by db push)
  migrations/   # versioned SQL — the only way to change the schema
  functions/    # Edge Functions (Deno, Hono + @hono/zod-openapi)
  tests/        # pgTAP (npx supabase test db --local | --linked)
  seed.sql      # reproducible data, incl. one seed user per role
```

## Environments

Two dev modes over the same migrations and seed; production is a separate project that only CI touches.

| Mode | Where | Apply changes | Flag |
|---|---|---|---|
| Cloud (default) | shared **staging** project | `npx supabase db push --include-seed` | `--linked` |
| Local | Docker via `npx supabase start` (Studio `localhost:54323`) | `npx supabase db reset --local` | `--local` |

- The checkout is linked to staging once by a human (`README.md` → Supabase). Agents never `link`.
- Local is private and disposable: reset it as often as you like. Prefer it to try a migration before pushing.
- Staging is shared: push only migrations you are ready for others to run against, and never edit one already pushed — add a new one.
- Never `db reset --linked`: it wipes everyone's data. Write seed idempotently (`on conflict do nothing`) so `db push --include-seed` can rerun it.

## Schema and RLS

- The schema never changes from the dashboard. Every change is a new migration, one responsibility each; never edit one already applied. Reversible, or with a recovery plan in the PR.
- **RLS on every table from day 1**, one explicit policy per verb, never `for all`.
- Catalog tables (`content`, `genre`, `content_genre`, `platform`, `content_platform`, `clip`): public read, written only by seed/ingestion. User tables: scoped to `auth.uid()`.
- Native enums for closed sets (`reaction`, `intent`, `content_type`…), `jsonb` for raw TMDB `metadata`. Constraints in the DB, not only in the app.
- Procedure and SQL template: `new-migration` skill.

## Where logic goes

- Data logic → Postgres functions (RPC). Secrets, third parties (TMDB, RevenueCat webhooks) and the scoring pipeline → Edge Functions.
- Filters and joins in SQL; never return extra rows for the client to filter.
- Idempotent for anything a phone may retry (upsert on natural keys, idempotency keys on webhooks).

## Edge Functions

- One function, one responsibility: `functions/<kebab-name>/`.
- Validate with Zod before touching anything; that schema produces the OpenAPI.
- Supabase client built with the **caller's JWT** so RLS applies; `service_role` only when the task needs it, justified in the PR.
- Handlers return typed results instead of throwing; errors carry a stable `code`, never internals or secrets.
- Procedure and template: `edge-function` skill.

## Tests

- RLS tested with **user A, user B and anonymous**: assert isolation on the rows returned, not a 200.
- Functions: `deno test`, covering every expected error `code`.
