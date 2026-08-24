---
name: expo
description: Feelo-specific Expo/React Native conventions — the app's screen flow, swipe-deck state, and how it talks to Supabase. For general Expo/React Native work (routing, data fetching, project structure, UI), use the official expo-* skills (expo-router, expo-data-fetching, expo-project-structure, expo-native-ui, etc.) instead — this skill only covers what's specific to Feelo.
---

# Expo / React Native — Feelo

For generic Expo work, prefer the official skills already installed (`expo-router` for navigation, `expo-data-fetching` for networking, `expo-project-structure` for folder layout, `expo-native-ui` / `expo-tailwind-setup` for UI). This skill only covers what those don't know about: Feelo's own screens and data flow.

## Screen flow

Core screens (see [`docs/product.md`](../../../docs/product.md)): onboarding (platform picker + taste-seed swipes) → mood check-in → swipe deck → match screen (on a right/super swipe) → watchlist.

## Swipe deck state

The swipe deck is the most stateful screen: current mood, current platform filter, remaining card queue, and the in-flight swipe gesture. Keep gesture state local to the deck component; keep swipe *results* (what gets written to Supabase) in a data layer, not component state.

## Calling Supabase from the app

- Always use the Supabase client (`@supabase/supabase-js`) with the `EXPO_PUBLIC_*` keys from `.env`, never the `service_role key` on the client.
- Rely on RLS for authorization; don't hand-filter in the client what a policy should already filter (e.g. never fetch another user's swipes/watchlist and filter client-side).
- Type responses (generate types from the Supabase schema once it exists: `supabase gen types typescript`).

## Testing priority

Prioritize tests for business logic and hooks specific to Feelo (deck-filtering by mood and platform, swipe-direction handling, "already swiped" exclusion) over UI snapshots.
