# Testing

**Level**: blocking.

- Never merge with lint or tests red.
- For data changes: test migrations against local Supabase (`supabase start`, `supabase db push`), never directly against production.
- For RLS changes: verify with at least two different users that policies isolate data as expected (e.g. user A's swipes/watchlist must never leak to user B).
- Minimum testing expected per change type: see the [`docs-and-testing`](../skills/docs-and-testing/SKILL.md) skill.
