# Proposal

Task: [[App] — Implementar el swiper en 4 direcciones en Descubre con overlays, mazo mock infinito y feedback](https://app.notion.com/p/874bd3bd193b835abfed81d09d4211e9) · Implements: Rafa · Validation owner: Toni (frontend)

## Why

Discover is the app's start screen and the core mechanic that builds the taste profile, but today it shows one static `ClipCard` with no gestures. The MVP prototype (`feelo-app.html`, functions `renderDeck`, `attachSwipe`, `registerSwipe`) defines a 4-direction swiper with overlays, an infinite stacked deck, a toast and a rated counter. This change makes Discover behave like the prototype, fully local with mock data, so it can be validated before any backend work.

## What Changes

- Discover becomes a swipe deck: 3 stacked cards built from the existing `ClipCard` (not rewritten), and only the top card is interactive.
- The top card follows the finger and rotates. While dragging, it shows the overlay of the dominant direction. On release it either flies out (past the 90 px threshold) or springs back.
- Infinite mock deck: `discoverMock.ts` exports a fixed-order list of at least 5 clips with the current `ClipCardData` shape. The deck wraps around at the end.
- New Discover header, as in the prototype: the `feel●` wordmark on the left (decided by Rafa at spec review, although the task doesn't define it) and a `{n} valorados` counter pill on the right. The counter counts right, left and up swipes, but not down.
- Feedback: a toast with the message for each direction.
- Legend under the deck (`👈 No me gustó` · `👇 No la he visto` · `👆 Me encantó` · `👉 Me gustó`). Each item is also a button that runs that direction's swipe. The top card exposes the 4 swipes as `accessibilityActions`.
- Reduce Motion: exits fade without moving, returns are instant and the toast fades in.
- One swipe at a time: further swipes are ignored while a card is exiting.
- New theme tokens for overlay colours, the toast and counter, durations, thresholds and deck scales. `GlassSurface` gains `toast` and overlay variants (tokens only, same three runtime levels).
- **Route cleanup (decided by Rafa at spec time):** `app/(app)/(tabs)/index.tsx` returns only `<DiscoverScreen />` (criterion 19). The temporary `<LogoutButton />` moves to the Perfil route, because it would otherwise sit exactly where the counter goes. This is the button's planned home (see its `ponytail` comment). The task says "no changes to Perfil", so this is a deliberate one-line exception, flagged for Toni at review.

Out of scope (from the task): Supabase, TMDB, network, persistence and seeders; the effect on the taste profile, the suggestible pool, history and Profile stats; real video, posters and progress-bar animation; haptics and sound; undo; changes to the tab bar or Sugerir; i18n; Maestro E2E; animating the wordmark.

## Capabilities

### New Capabilities
- `discover-swiper`: the Discover screen's swipe deck. Covers the drag, overlays, threshold, exit and return, the stacked infinite deck, the header (wordmark and counter), the toast, the legend buttons, accessibility actions, Reduce Motion, single-swipe locking and the no-network, no-haptics and no-literals constraints.

### Modified Capabilities
- `main-navigation`: "Discover is the initial tab" no longer says the Discover screen is unchanged, and the Discover route renders only the Discover screen. "Placeholder tab screens" now allows the temporary logout button on Perfil.

## Impact

- **Code:** new components and a hook in `src/features/discover/`. `discoverMock.ts` changes from one clip to a list (**BREAKING** for its importers: `ClipCard.test.tsx` and `DiscoverScreen.test.tsx`, updated in this change). `ClipCard.tsx` stays unchanged. Changes in `src/theme/tokens.ts`, in `GlassSurface`'s variant type, and in `app/(app)/(tabs)/index.tsx` and `perfil.tsx`.
- **Tests and tooling:** `jest/reanimatedMock.tsx` gets a stable, re-rendering `useSharedValue` plus the extra Reanimated APIs the deck uses (design D6). Existing tab bar tests must stay green.
- **Dependencies:** none new. Reanimated 4, Gesture Handler and worklets are already installed (Decision 002).
- **No backend:** no Supabase, network, seeders, `api:sync` or type generation.
