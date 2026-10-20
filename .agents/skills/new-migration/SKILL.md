---
name: new-migration
description: Create or change Feelo's database schema end to end — new Supabase migration, RLS policy per verb, seed data, regenerated TypeScript types and API contract (api:sync), tested with several users. Use whenever a task adds or alters a table, column, enum, index, policy or Postgres function.
---

# New migration — Feelo

A schema change is only done when all six steps are in the same PR. Rules behind them: [`supabase/AGENTS.md`](../../../supabase/AGENTS.md). Entity names and columns: [Modelo de dominio](https://app.notion.com/p/3c6bd3bd193b8041b148e0a527af3612) — if the task needs a column the model doesn't define, stop and ask Rafa.

## 1. Create the file

```bash
npx supabase start                       # if not running
npx supabase migration new <verb_object>  # e.g. add_user_mood, add_index_content_duration
```

One responsibility per migration. Never edit a migration that has already been applied; write a new one.

## 2. Write the SQL

Table names are snake_case singular as in the domain model (`user_mood`, `content_platform`).

```sql
-- Enums for closed sets
create type public.mood_intent as enum ('repair', 'congruent', 'explore');

create table public.user_mood (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  valence real not null check (valence between -1 and 1),
  arousal real not null check (arousal between -1 and 1),
  intent public.mood_intent not null,
  content_type public.content_type not null,
  time_availability integer check (time_availability > 0), -- null = no limit
  created_at timestamptz not null default now()
);

create index user_mood_user_id_created_at_idx on public.user_mood (user_id, created_at desc);

-- RLS: always on, one policy per verb, never "for all"
alter table public.user_mood enable row level security;

create policy "user_mood_select_own" on public.user_mood
  for select to authenticated using ((select auth.uid()) = user_id);

create policy "user_mood_insert_own" on public.user_mood
  for insert to authenticated with check ((select auth.uid()) = user_id);

-- No update/delete policy = denied. Write one only if the task requires it.
```

- **User tables**: scope every policy to `(select auth.uid()) = user_id`.
- **Catalog tables** (`content`, `genre`, `content_genre`, `platform`, `content_platform`, `clip`): `select` policy `to anon, authenticated using (true)`; no write policies (ingestion uses `service_role`).
- Constraints in the DB (`not null`, `check`, FKs, `unique`), not only in the app.
- Destructive change (drop/rename/type change on data in use) → write the recovery plan in the PR and flag it to Rafa.

## 3. Seed

Update `supabase/seed.sql` so the new data can be reproduced: at least rows for **user A** and **user B** (seed users per role) and catalog rows the feature needs. QA must be able to reproduce the case on staging from the seed alone.

## 4. Apply and test RLS

```bash
npx supabase db reset   # re-applies every migration + seed on the LOCAL db
```

Test isolation with several users (pgTAP in `supabase/tests/` via `npx supabase test db`, or a Jest/Deno integration test with two signed-in clients):

- user A reads/writes their own rows ✅
- user A cannot read or write user B's rows (empty result / RLS error) ✅
- anonymous gets nothing from user tables ✅

A 200 is not proof: assert on the rows returned.

## 5. Regenerate types

```bash
npx supabase gen types typescript --local > src/lib/database.types.ts
```

Never edit that file by hand (a hook blocks it). Fix type errors the regen surfaces in the app.

## 6. Regenerate the contract

```bash
npm run api:sync
```

Commit the regenerated `api/` and `postman/` in the same PR — CI fails on drift.

## Checklist

- [ ] One responsibility, descriptive name, never editing an applied migration
- [ ] RLS enabled + explicit policy per needed verb
- [ ] Seed updated (user A, user B, needed catalog rows)
- [ ] `db reset` clean, RLS tested with A / B / anonymous
- [ ] Types and contract regenerated and committed
- [ ] Change to the domain model reported to Rafa so Notion → Modelo de dominio gets updated
