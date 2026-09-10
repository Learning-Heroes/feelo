---
name: supabase
description: Conventions for working on Feelo's Supabase data/backend layer — schema design, migrations, RLS, seed data, queries and Edge Functions. Use when creating or modifying tables, policies, functions or queries.
---

# Supabase — Feelo

## Schema design

- Every new table lives in a versioned migration (`supabase/migrations/`), never created by hand in the dashboard.
- Document the table (purpose, columns, relationships) in `docs/database.md` in the same change.
- Prefer explicit foreign keys and `NOT NULL` by default unless the field is genuinely optional.
- Expected core entities once the app has real data (see [`docs/database.md`](../../../docs/database.md) for the full sketch): `platforms`, `user_platforms` (a user's streaming subscriptions), `moods`, `titles` (movies/shows), `title_platforms` (where a title is available), `title_moods` (mood tags per title), `swipes` (a user's left/right/super swipe on a title under a given mood).

## Migrations

- Create with `supabase migration new <descriptive-name>`.
- One migration = one logical change. Don't mix unrelated schema changes.
- Test against local Supabase (`supabase start`, `supabase db push`) before applying to staging/production.

## Row Level Security (RLS)

- RLS on by default for every table holding user data (`user_platforms`, `swipes`, and anything derived like a watchlist). No exceptions without an ADR justifying it.
- `titles`, `platforms`, `moods` and `title_platforms`/`title_moods` are catalog data: public read, write restricted to admin/seed processes.
- Write an explicit policy per operation (`select`, `insert`, `update`, `delete`) instead of one generic "allow everything" policy.
- Verify every policy with at least two different users (one must see their own swipes/watchlist, must not see the other's).

## Seed data

- `supabase/seed.sql` for reproducible dev data — a handful of platforms, moods and sample titles with mood tags is enough to build the swipe deck UI before a real catalog exists. Never use real user data as seed.

## Queries

- Prefer typed queries with generated types (`supabase gen types typescript`) over `any`.
- Push filters/joins to Postgres (RLS + queries) instead of fetching everything and filtering client-side — e.g. the swipe deck query should filter by mood + owned platforms + "not already swiped" in the query, not in the app.

## Edge Functions (if applicable)

- One function = one clear responsibility, documented in `docs/api-contracts.md` (input, output, required auth, errors).
- A likely first candidate: a `get-swipe-deck` function that assembles the next batch of cards (mood + platforms + excluding already-swiped titles) if that logic outgrows a plain query.
- Never expose the `service_role key` outside the function's server environment.
