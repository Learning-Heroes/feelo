# Architecture

> This document describes how, not what (that's `product.md`). Details below are the current best guess for a v1 that has no real code yet — treat anything not marked as decided as a hypothesis to revisit once implementation starts.

## Overview

```
Expo (React Native, client)
        │
        ▼
Supabase
  ├─ Postgres (data: platforms, moods, titles, swipes, watchlist)
  ├─ Auth (user authentication)
  ├─ Row Level Security (row-level authorization)
  └─ Edge Functions (server logic, e.g. assembling the swipe deck)
```

## App (Expo)

- `TODO`: navigation (Expo Router vs React Navigation).
- `TODO`: state management (Context, Zustand, TanStack Query, etc.).
- `TODO`: folder structure.
- Expected screen flow: onboarding (platform picker + taste seed) → mood check-in → swipe deck → match screen → watchlist. See [`product.md`](product.md).

## Backend (Supabase)

- Catalog data (`platforms`, `moods`, `titles`, `title_platforms`, `title_moods`) is public-read, seed/admin-write — see [`database.md`](database.md).
- User data (`user_platforms`, `swipes`, derived watchlist) is RLS-protected per user.
- `TODO`: whether deck assembly (mood + platforms + exclude-already-swiped) stays a plain client-side query or moves into an Edge Function once the filtering logic grows (e.g. to add taste-profile weighting).
- `TODO`: auth strategy (email/password, OAuth, magic link).

## External integrations

None in v1 — the title catalog is seeded manually rather than pulled from a live streaming-platform API (see `docs/product.md` → Out of scope). Revisit once a real catalog source (e.g. a licensed metadata API) is needed.

## Related decisions

See [`decisions/`](decisions/) for the why behind architecture decisions already made.
