# Supabase (data / backend)

**Level**: blocking for RLS and migrations.

- Schema changes always go through a versioned Supabase migration (`supabase/migrations/`), never applied by hand in the dashboard.
- RLS is on by default for every table holding user data (full rule in [principles.md](principles.md)).
- API contract changes (Supabase functions, external endpoints) are reflected in `docs/api-contracts.md`.
- For day-to-day work (schema design, migrations, RLS policies, seed data, queries, Edge Functions) use the [`supabase`](../skills/supabase/SKILL.md) skill instead of duplicating it here.
