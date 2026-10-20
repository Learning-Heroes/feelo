---
name: expo
description: Feelo-specific app knowledge — the screen flow (onboarding, Discover swiper, Suggest), where each screen gets its data and what it writes. Use when building or changing a Feelo screen or feature hook. For generic Expo work (routing, data fetching, native UI, EAS) use the official expo-* skills instead.
---

# Expo — Feelo

Generic Expo knowledge: official `expo-router`, `expo-data-fetching`, `expo-native-ui`, `expo-animation` skills. Conventions: [`app/AGENTS.md`](../../../app/AGENTS.md). Flows and screens: [UX Flows](https://app.notion.com/p/3c6bd3bd193b809284b7ddce7d4158ed) — if a screen detail isn't defined there or in the task, ask Toni (UI) or Iskren (product).

Ignore any `expo-*` advice about Tailwind/NativeWind: Feelo uses Unistyles.

## Flows

| Flow | Feature folder | Reads | Writes |
|---|---|---|---|
| Onboarding (platforms, country/language) | `src/features/onboarding` | `platform` | `user_platform`, user profile |
| **Discover** — clip feed + 4-direction swipe | `src/features/discover` | `content` + `clip`, filtered server-side | `user_content` (`reaction`, `clip_id`, `clip_progress`) |
| **Suggest** — mood grid → intent → format → time | `src/features/suggest` | suggestion result (Edge Function) | `user_mood`, then `suggestion_item.was_chosen` / `feedback_reaction` |

Swipe mapping: ↑ `loved` · → `liked` · ← `disliked` · ↓ `not_seen`. Mood grid: X = valence, Y = arousal, both in [-1, 1]. Intent: `repair` / `congruent` / `explore`. Time slider: minutes, `null` = no limit (3h+).

## Data rules for screens

- Each flow exposes hooks from its feature (`useDiscoverFeed`, `useSwipe`, `useSuggestion`…) built on TanStack Query; screens only call those.
- Scoring, filtering and taste updates (`user_genre_affinity`) happen server-side. The app never computes a score or filters the catalog it received.
- Swipes are optimistic: update the feed immediately, write in the background, retry safely (the write must be idempotent — `user_content` is unique on `user_id, content_id`).
- Gesture state stays local to the swiper (Reanimated shared values); the swipe *result* goes through the hook.
- Clips are YouTube embeds keyed by `clip.youtube_key`. Never download or host video.

## Testing priority

Feature hooks and logic first (swipe direction → reaction, optimistic update and rollback, Suggest step validation with Zod), then visible behaviour with RNTL. Critical flows (onboarding, swiper, suggestion) get a Maestro E2E once the app runs.
