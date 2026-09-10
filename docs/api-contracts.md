# API contracts

> Fill in as real integrations exist. The shapes below are a starting hypothesis based on `product.md` / `database.md`, not an implemented contract yet.

## App ↔ Supabase

- Likely reads exposed via the Supabase client: `platforms`, `moods` (for onboarding/mood check-in pickers); a filtered `titles` query (or RPC) for the swipe deck — by mood, owned platforms, and excluding titles the user already swiped on.
- Likely writes: `user_platforms` (subscriptions, set during onboarding or settings), `swipes` (one row per swipe).
- `TODO`: confirm whether the swipe-deck query stays a plain Supabase query or becomes an RPC/Edge Function once filtering logic grows.

## Edge Functions

`TODO` per function once one exists — endpoint, input, output, required auth, possible errors. First likely candidate: a `get-swipe-deck` function (see [`architecture.md`](architecture.md)).

## External services

None in v1 — no live streaming-platform catalog API is integrated (see `product.md` → Out of scope). `TODO` if/when one is added.
