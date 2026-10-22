# supabase/ — backend

Only what's specific to the backend; the root `AGENTS.md` still applies. Owner: Rafa.

```
supabase/
  config.toml   # CLI + Auth/Storage config (versioned; not applied by db push)
  migrations/   # versioned SQL — the only way to change the schema
  functions/    # Edge Functions (Deno, Hono + @hono/zod-openapi)
  tests/        # pgTAP (npx supabase test db --linked)
  seed.sql      # reproducible data, incl. one seed user per role
```

## Environments

Cloud only — there is no local Supabase and no Docker. Development and QA share the **staging** project; production is a separate project that only CI touches.

- The checkout is linked to staging once by a human (`README.md` → Supabase). Every CLI command acts on that link.
- Staging is shared: push only migrations you are ready for others to run against, and never edit one already pushed — add a new one.
- No `db reset` against staging: it wipes everyone's data. To redo seed data, write it idempotently (`on conflict do nothing`) and `db push --include-seed`.

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
