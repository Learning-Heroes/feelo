---
name: expo
description: Feelo-specific app knowledge — the screen flow (onboarding, Discover swiper, Suggest), where each screen gets its data and what it writes. Use when building or changing a Feelo screen or feature hook. For generic Expo work (routing, data fetching, native UI, EAS) use the official expo-* skills instead.
---

# Expo — Feelo

Generic Expo knowledge: official `expo-router`, `expo-data-fetching`, `expo-native-ui`, `expo-animation` skills (ignore their Tailwind advice). Flows and screens: [UX Flows](https://app.notion.com/p/3c6bd3bd193b809284b7ddce7d4158ed) — if a screen detail isn't defined there or in the task, ask Toni (UI) or Iskren (product).

## Flows

| Flow | Feature folder | Reads | Writes |
|---|---|---|---|
| Onboarding (platforms, country/language) | `src/features/onboarding` | `platform` | `user_platform`, user profile |
| **Discover** — clip feed + 4-direction swipe | `src/features/discover` | `content` + `clip`, filtered server-side | `user_content` (`reaction`, `clip_id`, `clip_progress`) |
| **Suggest** — mood grid → intent → format → time | `src/features/suggest` | suggestion result (Edge Function) | `user_mood`, then `suggestion_item.was_chosen` / `feedback_reaction` |

Mood grid: X = valence, Y = arousal. Time slider: minutes, `null` = no limit (3h+).

## Swiper specifics

- Swipes are optimistic: update the feed immediately, write in the background, retry safely (the write must be idempotent — `user_content` is unique on `user_id, content_id`).
- Gesture state stays local to the swiper (Reanimated shared values); the swipe *result* goes through the hook.

## Testing priority

Feature hooks and logic first (swipe direction → reaction, optimistic update and rollback, Suggest step validation with Zod), then visible behaviour with RNTL. Critical flows (onboarding, swiper, suggestion) get a Maestro E2E once the app runs.
