# Design

See `proposal.md` for the why and `specs/` for the behaviour. This document covers only the how.

## Context

- `DiscoverScreen` renders one static `ClipCard` from `discoverMock` (a single object). `ClipCard` lays out its own content: it has a fixed width (`maxWidth` 420) and its height comes from its content. It isn't a full-bleed card like the prototype's.
- The tab layout already pads each scene by the floating bar's height (`sceneStyle.paddingBottom = useGlassTabBarHeight().total`), so anything at the bottom of `DiscoverScreen` already stays clear of the bar.
- The tab bar sets the pattern: one `Gesture.Pan()` with `runOnJS(true)` callbacks. React state drives animation targets through `useAnimatedStyle` + `withTiming`, and tests spy on `withTiming` to assert durations and targets.
- `jest/reanimatedMock.tsx` resolves animations to their target at once. `useSharedValue` returns a fresh `{ value }` on every render, and nothing re-renders when a shared value changes.

## Goals / Non-Goals

**Goals:** keep the drag smooth on the UI thread; have one swipe code path for the gesture, the buttons and accessibility actions; keep the tests deterministic with fake timers.

**Non-Goals:** a reusable generic swiper component; changing the visual layout of `ClipCard`; matching the prototype's full-bleed card look (that belongs to the future video/poster task).

## Decisions

### D1. Component split (all in `src/features/discover/`)
- `DiscoverScreen`: a `DiscoverHeader` (`Wordmark` on the left, counter pill on the right), then `SwipeDeck` (flex: 1), then `SwipeLegend`, with `SwipeToast` absolutely positioned on top. It owns `useDiscoverDeck()`.
- `useDiscoverDeck`: a `useReducer` holding `{ pos, rated, toast: { message, id } | null, exiting }`. It exposes `cards` (3 entries `{ key: pos + k, clip: deck[(pos + k) % n], slot: k }`), `requestSwipe(direction)`, `rated` and `toast`. It owns the 280 ms advance timer and the 1,400 ms toast timer, and clears both on unmount.
- `SwipeDeck` renders the 3 cards bottom-up, keyed by absolute position `pos + k`. When the deck advances, the card that was in slot 1 keeps its component instance and animates to slot 0 (400 ms `motion.spring`) instead of remounting. The exited card unmounts.
- `SwipeableClipCard` wraps the unchanged `ClipCard`. It holds the Pan gesture, the card transform, `accessibilityActions` and, only when `slot === 0`, the 4 `SwipeOverlay`s. Lower slots get `pointerEvents="none"` and a disabled gesture.
- `SwipeLegend`: 4 `Pressable`s with `minHeight`/`minWidth` set to `layout.touchTarget`.
- `SwipeToast`: `GlassSurface variant="toast"`. Its slide-in (`translateY` from `−toast.offscreen` to 0, 500 ms spring) or fade-in (Reduce Motion, 200 ms) is keyed on `toast.id`.
- `Wordmark` (in `src/components/`, because it's brand UI and other screens will reuse it): a `Text` reading `feel` next to an `Svg` orb (a `Circle` filled with a `RadialGradient`, `cx 35% cy 30%`, stops from `theme.wordmark.orbStops`). The glow uses `shadowColor`/`shadowRadius` on iOS. Android has no coloured shadow, so it gets the gradient only; accepted. The orb's size and offsets come from `wordmark.fontSize × wordmark.orb{Size,Gap,Drop}`. The wrapper is `accessible` with `accessibilityLabel="Feelo"` and role `header`, and its children are hidden from accessibility.
- `swipeMath.ts`: pure functions marked `'worklet'` so they run on both threads: `dominantAxis(dx, dy)`, `overlayOpacity(direction, dx, dy)`, `resolveRelease(dx, dy) → Direction | null` and `exitTarget(direction, dx, dy) → { x, y, rotate }`. All thresholds come from `theme.swipe`. These functions carry most of the edge cases (ties, diagonals, exactly 90) and get direct unit tests on top of the component tests.

### D2. Drag runs on the UI thread with shared values; the swipe commit runs on JS
The drag updates `tx`/`ty` shared values inside the gesture's `onUpdate` worklet, with no React state per frame. Card and overlay styles come from `useAnimatedStyle` reading `tx`/`ty` through `swipeMath`. On `onEnd`, the worklet calls `resolveRelease`:
- Past the threshold: it animates to `exitTarget` and calls `scheduleOnRN(onSwipe, direction)`. (The worklets 0.13 export name gets confirmed when implementing; it falls back to Reanimated's `runOnJS`.)
- Below the threshold: it springs back to 0.
- `onFinalize` with a cancelled state also springs back.

*Alternative rejected:* the tab bar's `runOnJS(true)` + `setState` per update. That's fine for a 3-slot index, but re-rendering 3 `ClipCard`s on every frame risks the low-end Android performance that the task flags.

### D3. One swipe path, locked while exiting
`requestSwipe(direction)` in `useDiscoverDeck` is the only entry point:
1. If `exiting` is true, return.
2. Set `exiting`, update `rated` and `toast`, and schedule the advance in `swipe.advanceDelay` (280 ms).
3. The advance does `pos + 1` and clears `exiting`.

The gesture path calls `requestSwipe` from `onEnd` after it starts the exit animation. The buttons and accessibility actions go through `SwipeableClipCard`'s imperative `fling(direction)` (exposed through a ref from the top card), which runs the same exit animation with `dx = dy = 0` and then calls `requestSwipe`. While `exiting` is true, the top card's Pan is `.enabled(false)`. That plus the reducer guard covers both gesture-then-button and button-then-gesture. The `exiting` lock lives in the reducer and is mirrored into a ref, so two presses in the same tick can't both pass the guard.

### D4. Timing is JS timers, not animation callbacks
The deck advances 280 ms after the release (as in the prototype), whatever stage the 500 ms exit animation has reached, and the toast hides after 1,400 ms. Both use `setTimeout` in the hook, so `jest.useFakeTimers()` + `act(() => jest.advanceTimersByTime(n))` drives every timing scenario. A new swipe clears and restarts the toast timer. No `withTiming` completion callback carries business logic, which matters because the Jest mock never fires those callbacks.

### D5. Reduce Motion
`useReducedMotion()` from Reanimated, read once in `SwipeDeck` and passed down as a prop. With it on:
- exit is `opacity → 0` over `motion.duration.reduceMotionFade` (200 ms, `Easing.linear`), and `tx`/`ty`/rotation stay where the finger left them. For a button or accessibility swipe they stay at 0.
- return assigns the targets directly, with no `withTiming`.
- the toast animates opacity only.
- deck slot changes are applied directly.

The spec only lists exit, return and toast. Making the slot change instant too is our assumption, in line with "no spring under Reduce Motion".

### D6. Jest mock upgrade
`jest/reanimatedMock.tsx` changes so `useSharedValue` is stable across renders (`useRef`) and its `.value` setter forces a re-render (`useReducer` tick). `useAnimatedStyle` already re-runs on every render, so tests can read the transform after `fireGestureHandler` updates. The mock also adds `cancelAnimation` (no-op). There's no `withSpring`: every "spring" here is `withTiming` with the `motion.spring` bezier, as in the tab bar. `scheduleOnRN` comes from the worklets mock. If it's missing there, `jest.setup.tsx` adds `scheduleOnRN: (fn, ...args) => fn(...args)`.

Gesture tests use `fireGestureHandler(getByGestureTestId('swipe-card-<key>'), [...])` from `react-native-gesture-handler/jest-utils`. The tab bar tests must stay green after the mock change. If a tab bar test relied on the old reset-every-render behaviour, it gets fixed in this change and noted in the PR.

### D7. Theme tokens
`tokens.ts` gains the following, all read through the Unistyles theme:
- **colors:** `paz #7DDCC8`, `tension #E8506E`, `euforia #FFAF5F` (`lavanda` already exists) and `violetaDim rgba(139,124,246,.16)`, `violetaBorder rgba(139,124,246,.3)`.
- **swipe:** `threshold 90`, `overlayMin 20`, `dragRotate 0.05`, `exitRotate 0.06`, `exitX 600`, `exitY 800`, `exitOtherAxisFactor 2`, `advanceDelay 280`.
- **motion:** `motion.exit [.25,.8,.25,1]`, and `motion.duration`: `swipeExit 500`, `swipeReturn 450`, `deckShift 400`, `toastIn 500`, `toastVisible 1400`.
- **deck:** `deck.slots`, i.e. `[{scale 1, y 0, opacity 1}, {scale .96, y 13, opacity .8}, {scale .92, y 26, opacity .55}]`.
- **overlay:** label text, colour key, position and rotation per direction; `typography.overlay` (Sora 800 16) and `overlay.borderWidth 1.5`.
- **toast:** `top 14`, `offscreen 70`; `typography.toast` (Sora 600 13.5).
- **counter:** `typography.counter`, the same as `label` at Sora 600 12.
- **header:** `discoverHeader.padding { top 4, x 2, bottom 12 }`.
- **wordmark:** `colors.violetaDeep #6C5CE0` and `wordmark { fontSize 24, letterSpacing −1.2, orbSize .62, orbGap .06, orbDrop .02, orbCenter [.35, .3], orbStops [[0, '#FFFFFF'], [.35, lavanda], [.8, violetaDeep]], glow { color rgba(139,124,246,.55), radius .4 } }`. The proportions are in em units of `fontSize`, as in the prototype.
- **legend:** `typography.legend` (Sora 600 10.5) and `legend.emojiSize 14`.
- **glass:** `glass.toast { tint rgba(10,10,16,.75), border surfaceBorder, solid noche, blurIntensity ≈ 40 }` and `glass.overlay{Right,Left,Up,Down} { tint <bg>, border <colour>, solid <bg at full alpha>, blurIntensity ≈ 25 }`. `GlassSurface`'s `variant` type widens to every key of `glass` except `borderWidth`. Overlays pass `borderWidth: overlay.borderWidth` through `style`.

The user-facing strings (overlay labels, toast messages, legend labels, `valorados`) live in a `discoverCopy.ts` constant file (Decision 001: no i18n yet). They are not tokens.

### D8. Mock deck
`discoverMock.ts` exports `discoverDeck: readonly ClipCardData[]` with 5 clips in fixed order (Spanish placeholder titles; platform colours stay as the allowed literals). The single-clip `discoverMock` export goes away. `ClipCard.test.tsx` uses `discoverDeck[0]`. The `sin_literales_fuera_de_theme` scan exempts only `discoverMock.ts`, and only for hex colours.

### D9. Static checks
New `src/features/discover/discoverSources.test.ts`, modelled on `noHardcodedValues.test.ts` and reusing `readSourceFiles`. It covers `no_importa_haptics`, `sin_literales_fuera_de_theme` and the no-Supabase/no-`fetch(` scan. Its number-literal rule targets the tokens we own: a regex for `duration`/`delay` keys, `setTimeout(…, <digits>)`, `> <digits>` comparisons and hex/rgba colours, with `*.test.ts(x)` files skipped. The runtime `no_hay_peticiones_de_red` test lives in `DiscoverScreen.test.tsx`.

## Risks / Trade-offs

- **The deck's Pan versus the tab bar's Pan:** they sit in separate views with no overlapping hit areas, so nothing to configure. Check on device (manual step 9).
- **Three animated cards on low-end Android** → only the top card carries the overlays and the gesture, lower cards animate only on deck shifts, and the drag stays off the JS thread (D2).
- **Overlay blur cost** → only the top card renders its 4 overlays, and a `GlassSurface` at opacity 0 still costs a blur view. If profiling shows jank, mount an overlay only while its opacity is above 0 (follow-up, no spec change).
- **Mock upgrade side effects (D6)** → run the full suite after changing the mock and before writing new tests.
- **`ClipCard` isn't full-bleed** → overlay positions ("110 from bottom", "70 from top") are measured from the wrapper's edges, so on a short card the up and down overlays can overlap the title. Accepted for the MVP. Toni checks this side by side with the prototype.
- **LogoutButton on Perfil** (proposal) → flagged for Toni at review, as a one-line change to the route.

## Migration Plan

App-only, no data. Ships in a regular dev build (no new native modules). Rollback is reverting the PR.
