# Database

> Keep this file in sync with the migrations — if the schema changes, this document changes in the same PR. The tables below are the current best guess for the MVP described in [`product.md`](product.md); none of it is implemented yet, so treat it as a starting sketch, not a locked schema.

## Tables (sketch)

| Table | Purpose | Key columns |
|---|---|---|
| `platforms` | Catalog of streaming platforms Feelo knows about | `id`, `name`, `slug`, `icon_url` |
| `user_platforms` | A user's streaming subscriptions | `user_id`, `platform_id` |
| `moods` | Fixed taxonomy of moods (want a laugh, need a cry, ...) | `id`, `key`, `label`, `emoji` |
| `titles` | Movies/shows in the catalog | `id`, `name`, `type` (`movie`/`show`), `poster_url`, `release_year`, `synopsis` |
| `title_platforms` | Where a title is available, and the deep link to open it | `title_id`, `platform_id`, `deep_link_url` |
| `title_moods` | Mood tags per title (a title can match more than one mood) | `title_id`, `mood_id`, `weight` |
| `swipes` | A user's left/right/up swipe on a title, under a given mood | `id`, `user_id`, `title_id`, `mood_id`, `direction`, `created_at` |

Watchlist is derived from `swipes` (`direction IN ('right', 'up')`) rather than a separate table, unless a later need (e.g. marking items "watched") justifies promoting it to its own table — record that decision as an ADR if/when it happens.

## Row Level Security (RLS)

- `platforms`, `moods`, `titles`, `title_platforms`, `title_moods`: public read, write restricted to seed/admin processes (catalog data, not user data).
- `user_platforms`, `swipes`: RLS on, scoped to `auth.uid()` — a user can only read/write their own rows. Full rule in [`../.agents/guidelines/principles.md`](../.agents/guidelines/principles.md).

## Migrations

- Location: `supabase/migrations/`.
- Naming convention: `TODO` (defaults to the timestamp `supabase migration new <name>` generates).
- Never apply schema changes by hand in the Supabase dashboard outside local development.

## Seed data

- `supabase/seed.sql`: a handful of platforms, the fixed mood list, and a small sample of titles with mood tags — enough to build and demo the swipe deck before a real catalog source exists.
