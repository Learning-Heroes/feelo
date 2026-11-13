# Design

## Context

See `proposal.md` for the motivation. Current state that shapes the approach:

- **Routes.** `app/_layout.tsx` loads Sora and holds the splash until the auth session is restored. It guards `(app)` and `(auth)` with `Stack.Protected` (`redirectTo="/login"` / `"/"`). `app/(app)/_layout.tsx` is a bare Stack. `app/(app)/index.tsx` renders `<DiscoverScreen />` + `<LogoutButton />`.
- **Discover screen.** `DiscoverScreen` centres a card. It pads by `rt.insets.top/bottom` (Unistyles runtime) and has no ScrollView.
- **Theme.** `src/theme/tokens.ts` already has `noche`, `violeta`, `texto3`, `surfaceBorder` (`rgba(255,255,255,.13)`), `scrim` (`rgba(10,10,16,.6)`), `radius.pill` (99), `fonts.semibold` and `layout.touchTarget`. It has no motion tokens and no tab bar or glass tokens.
- **Dependencies.** No Reanimated, Gesture Handler, SVG, glass, blur or gradient packages are installed. `expo-router` 58 declares `react-native-reanimated` 4.x and `react-native-gesture-handler` as peers, and ships `Tabs` (bottom-tabs based) with a `tabBar` prop. Reanimated 4 requires `react-native-worklets`. `babel-preset-expo` wires its plugin automatically.
- **Package manager and tests.** The project uses pnpm, not the npm the task mentions. Jest uses the `jest-expo` preset with the Unistyles mock. The `glass-component` skill (`.agents/skills/glass-component/SKILL.md`) defines the `GlassSurface` shape.

## Goals / Non-Goals

**Goals:**
- One gesture path for tap and drag.
- Reanimated drives the UI-thread animations, so drag tracking does not depend on JS-thread frames.
- `GlassTabBar` knows nothing about the domain. It only uses the props expo-router passes to `tabBar` (`state`, `descriptors`, `navigation`).
- Every value comes from the theme.

**Non-Goals:**
- A generic tab-count abstraction. Three tabs are assumed by the spec formula. The code derives `n` from `state.routes.length`, but nothing beyond 3 is tested.
- Lazy or unmounted tab screens, screen transitions and haptics.

## Decisions

### D1 — Tabs nested under `(app)`
`app/(app)/(tabs)/_layout.tsx` uses `<Tabs tabBar={(props) => <GlassTabBar {...props} />} screenOptions={{ headerShown: false }} />`. The route files are `index.tsx`, `sugerir.tsx` and `perfil.tsx`.
- Groups don't add URL segments, so `/` still resolves to Discover. The auth redirects and `routeGuard.test.tsx` stay valid.
- `app/(app)/_layout.tsx` stays a Stack, which leaves room for future pushed screens such as detail views.
- **Alternatives:**
  - Top-level `app/(tabs)/`, as the task literally says. Rejected by the PO: it would bypass or force a rework of the auth guard.
  - Turning `(app)/_layout` into Tabs. Rejected: it blocks future stack screens above the tabs.

### D2 — Custom `tabBar` on expo-router `Tabs`
We use `Tabs` from expo-router, which is bottom-tabs under the hood, with a fully custom `tabBar`.
- **Why:** the task forbids the default bar, not the navigator. `Tabs` gives us state, `tabPress` events and keeps screens mounted, which satisfies "the active tab is not remounted".
- **Alternatives:**
  - `expo-router/ui` headless tabs. Newer API and less documented for this pattern.
  - Native tabs (`NativeTabs`). These can't render a custom glass pill with drag.

### D3 — A single Pan gesture with `minDistance(0)`
`Gesture.Pan().minDistance(0)` covers the whole bar and replicates the prototype's pointer events:

| Callback | Behaviour |
|---|---|
| `onBegin` | target scale 1.04, compute the index from `x` |
| `onUpdate` | target scale 1.06, `previewIndex = clamp(floor(x / width × n), 0, n−1)` |
| `onEnd` (success) | hand the index to JS |
| `onFinalize` | if cancelled or failed, reset `previewIndex` to `state.index`; in every case, scale back to 1 |

- `x` is relative to the bar (the gesture's `e.x`), so the "left of the bar" offset is implicit. The bar width comes from `onLayout` and is stored in a shared value.
- A tap is the same gesture with no movement.
- Items are not separate `Pressable`s that capture the touch. That avoids tap/pan races. Accessibility still needs activatable tabs, though (see D6).
- **Alternative:** `Gesture.Exclusive(Tap, Pan)`. Rejected: two code paths, and a tap on one item followed by a drag to another conflicts.

### D4 — Navigation call
On release, JS runs `select(index)`:
1. If `index === state.index`, return. This covers criteria 4 and 8: no `navigate`, no remount.
2. Otherwise emit `navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true })`.
3. If the event is not default-prevented, call `navigation.navigate(route.name, route.params)`.

This is the standard bottom-tabs contract. The worklet hands off to JS with the installed Reanimated 4 API: `scheduleOnRN` from `react-native-worklets`, or `runOnJS` if it is still exported un-deprecated. We check at install time and pick one.

### D5 — Animation and state
Shared values:

| Shared value | Meaning |
|---|---|
| `previewIndex` | index shown by the indicator and the active colour |
| `pressScale` | target scale of the bar |
| `barWidth` | measured bar width |

- `useEffect` syncs `previewIndex` to `state.index` whenever navigation changes, for example after a programmatic navigation.
- **Indicator `left`:** `index × width/3 + 4`. It animates with `withTiming(…, { duration: motion.indicatorTap (450), easing: Easing.bezier(...motion.spring) })` after a tap or release, and with `duration: motion.indicatorDrag (80), easing: Easing.linear` during a drag. A `dragging` shared value picks between the two.
- **Bar scale:** `withTiming(scale, { duration: motion.press (300), easing: spring })`.
- **Item colour:** each item derives `progress = withTiming(previewIndex === i ? 1 : 0, 300 ms)` and uses `interpolateColor(texto3 → lavanda)`. The active icon gets `translateY: -1` and `scale: 1.1` over 350 ms on the spring curve.
- **Reduce Motion:** `useReducedMotion()`. When on:
  - press and drag scale stay at 1
  - the indicator jumps to its new position inside a 200 ms opacity fade (out to 0, set `left`, back to 1, total 200 ms, linear)
  - the icon scale stays at 1, while the colour change remains
- **Spring curve:** `motion.spring = [0.3, 1.25, 0.4, 1]` is a cubic-bezier with overshoot. We implement it as `withTiming` + `Easing.bezier`, not `withSpring`, to match the prototype's CSS exactly.

### D6 — Accessibility
- The container is an `Animated.View` with `accessibilityRole="tablist"`.
- Each item is a `View` with:
  - `accessible`, `accessibilityRole="tab"`, `accessibilityLabel={label}` and `accessibilityState={{ selected }}`
  - `onAccessibilityTap` / `accessibilityActions=[{ name: 'activate' }]` + `onAccessibilityAction` calling `select(i)`
  - `minHeight`/`minWidth` from `layout.touchTarget`

  Screen-reader activation therefore works even though touch input goes through the Pan. In tests, `fireEvent.press` won't reach a plain View. Tap tests use `fireGestureHandler` with BEGAN→END at the item's x. Accessibility-activation tests use `fireEvent(item, 'accessibilityAction', { nativeEvent: { actionName: 'activate' } })`.

  An item is `{ flex: 1 }` of a 64 px-tall bar, so it is ≥ 44×44 whenever the bar is at least 132 wide (always true at 26 px side padding).
- **Alternative considered:** wrap each item in a `Pressable` and let the Pan run simultaneously. That needs `simultaneousWithExternalGesture` plumbing and risks double navigation. Not worth it.

### D7 — `GlassSurface`
`src/components/GlassSurface.tsx` follows the `glass-component` skill. The `variant` prop is limited to `'bar'` for now; more variants arrive when they are used.

| Condition | Renders |
|---|---|
| Reduce Transparency on (checked first) | solid `View` with background `glass.bar.solid` (= `noche`) and border `glass.bar.border` |
| `isLiquidGlassAvailable()` on iOS | `GlassView` with `tintColor = glass.bar.tint` |
| otherwise | `BlurView` with `intensity = glass.bar.blurIntensity`, `tint="dark"`, an absolute tint overlay `glass.bar.tint` (`rgba(10,10,16,.6)`) and the border |

- **Reduce Transparency hook:** `AccessibilityInfo.isReduceTransparencyEnabled()` plus the `reduceTransparencyChanged` listener, with cleanup. It lives inside the same file (one export per file).
- **API name:** the task names `isLiquidGlassSupported`, while the skill names `isLiquidGlassAvailable`. We use whatever the installed `expo-glass-effect` exports, check it when we add the package, and mock that same name in tests.
- **Blur values:** CSS `blur(28px) saturate(180%)` has no exact RN equivalent. `blurIntensity` is a token, tuned visually on device. Saturate is not reproducible and is dropped.
- **Highlight:** the 1 px inner top highlight `rgba(255,255,255,.22)` is an absolute 1 px `View`, not a gradient. That means `expo-linear-gradient` is only needed for the indicator's vertical gradient.
- **Shadow:** the bar's shadow (`0 18 40 rgba(0,0,0,.55)`) goes on an outer wrapper `View` (the `boxShadow` style, supported on the New Architecture). The glass surface keeps `overflow: hidden`.

### D8 — Tokens
Values added to `src/theme/tokens.ts` and exposed on the Unistyles theme:

| Token | Values |
|---|---|
| `colors.lavanda` | `#B9AFFF` |
| `colors.highlight` | `rgba(255,255,255,.22)` |
| `colors.shadow` | `rgba(0,0,0,.55)` |
| indicator colours | gradient `rgba(185,175,255,.22)` → `rgba(139,124,246,.08)`, border `rgba(139,124,246,.4)`, glow `rgba(139,124,246,.25)`, highlight `rgba(255,255,255,.25)` |
| `motion` | `spring: [0.3, 1.25, 0.4, 1]`; durations `press 300`, `indicatorTap 450`, `indicatorDrag 80`, `itemColor 300`, `itemIcon 350`, `reduceMotionFade 200` |
| `tabBar` | `height 64`, `wrapTop 10`, `wrapSide 26`, `wrapMinBottom 14`, `indicatorInset 6`, `indicatorGap 4` (left offset) and `8` (width shrink), `itemGap 3`, `iconSize 24`, `labelSize 10.5`, `scalePressed 1.04`, `scaleDragging 1.06`, `iconActiveScale 1.1`, `iconActiveLift -1`, shadow and glow geometry |
| `glass.bar` | `tint` (= `scrim`), `border` (= `surfaceBorder`), `solid` (= `noche`), `blurIntensity` |
| `typography.tabLabel` | Sora 600, 10.5 |

Existing tokens are reused by reference, not duplicated as literals.

- **Title role.** The Brand book Title is 24–28 px. The existing `typography.title` (Sora 800, 24, tracking −0.48 ≈ −2%) already fits, so placeholders use it.
- **SVG icons.** Path data and `viewBox` stay as literals in the icon component, allowed by criterion 17. Their fill comes from props or tokens. Discover's cut-out uses `colors.noche` at an opacity token of `.55`.

### D9 — Bar placement and safe area
- **Floating bar.** The bar floats with `position: 'absolute'` at the bottom, rendered by the `tabBar` prop. The wrapper's padding is: top `tabBar.wrapTop`, sides `wrapSide`, bottom `max(insets.bottom, wrapMinBottom)` from `useSafeAreaInsets()` (react-native-safe-area-context). This is easy to mock in tests.
- **No overlap with screens.** We must not change `DiscoverScreen`, so the tabs layout sets `sceneStyle: { paddingBottom: tabBarTotalHeight }` (wrapTop + height + bottom padding). Every screen's content area then ends above the bar.
- **Shared height.** `GlassTabBar` exports a small hook, `useGlassTabBarHeight()`, in its own file (file name = export name). It computes that total from tokens and insets, and the layout uses it for `sceneStyle`.
- **Discover padding.** `DiscoverScreen` keeps its own `rt.insets.bottom` padding, which double-counts a little at the bottom. Its card is centred, so the only effect is a slight upward shift. That is acceptable without touching `DiscoverScreen` and should be verified visually.
- **Background behind the bar.** `sceneStyle` background is set to `noche`, so the padded area matches. A semi-transparent glass then shows Noche below the bar rather than content. This is accepted for the MVP: no scrolling content exists yet. A future scrolling screen should use `contentInset` instead.

### D10 — Placeholder screens
`src/components/ScreenTitle.tsx` (Title role, `texto1`, on a `noche` flex-1 view, centred) is used by `sugerir.tsx` and `perfil.tsx` with constant strings. There is no i18n yet (Decision 001); the strings live as constants in the route files, which matches the task.

### D11 — Testing setup
`jest.setup.ts` gets these mocks:
- `react-native-gesture-handler/jestSetup`
- Reanimated's Jest setup (`setUpTests()` from `react-native-reanimated`, or the documented mock for v4)
- `react-native-worklets` mock if needed
- `expo-glass-effect`, `expo-blur` and `expo-linear-gradient` as host-component mocks, so tests can query them by type or testID
- `react-native-svg`, if the jest-expo preset doesn't already handle it

Test files:
- `GlassTabBar.test.tsx` renders the component with fake `state`/`navigation`/`descriptors` and uses `fireGestureHandler(getByGestureTestId('glass-tab-bar-pan'), [...])`.
- Static-analysis tests (criteria 13 and 17) read the source files with `fs` and run regex checks. They live in `src/components/GlassSurface.test.tsx` and `src/components/noHardcodedValues.test.ts`.
- Integration tests use `renderRouter` from `expo-router/testing-library` with the real `(tabs)` layout and stub screens. A Discover stub is fine where we only test navigation. `arranque_selecciona_descubre` mocks `useAuthStore`/Supabase like `routeGuard.test.tsx` does, or mounts only the `(tabs)` subtree.
- Scale assertions read the shared value or the animated style's target through the Reanimated test helpers (`getAnimatedStyle`/`toHaveAnimatedStyle`) once timers are advanced. They do not assert intermediate frames.

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| **New native deps** need Toni's approval. If any is rejected (e.g. `expo-linear-gradient`), D7/D8 change. | Approval is a gate at spec review. The indicator gradient could fall back to a solid tint. |
| **Pan steals vertical gestures** from screen content near the bar. | The Pan only covers the bar's own bounds. `activeOffsetY` is not needed because there is no scroll under it. Verify on device that the Discover card swipe (future) is not affected. |
| **Blur cost on low-end Android.** | One blurred surface only. Device check noted in the PR. |
| **`boxShadow` on New Architecture.** Shadow and glow may look different on Android. | Accept platform difference and compare against `feelo-app.html` on device. |
| **Reanimated 4 / worklets API drift.** `runOnJS` vs `scheduleOnRN`, and the Jest setup name. | Read the installed package's docs when adding it, and pin via `pnpm expo install`. |
| **Bezier with overshoot (1.25) on `withTiming`.** Reanimated's `Easing.bezier` accepts y > 1. | Confirmed in the API. A visual check covers the rest. |
| **Double bottom padding on Discover** (insets + `sceneStyle`). | Visual check. A later Discover task can drop its own inset. |
| **`fireGestureHandler` with `minDistance(0)`** can transition BEGAN→ACTIVE→END differently in tests. | Pass explicit `state` events in tests. |

## Migration Plan

1. Install the dependencies with `pnpm expo install …` and rebuild the dev client (`pnpm ios`).
2. Move the Discover route into `(tabs)`. No URL changes and no persisted data.
3. **Rollback:** revert the PR and rebuild. Nothing server-side changes.

## Open Questions

- The exact `blurIntensity` that best matches `blur(28px)` will be tuned on device. This does not affect the specs.
- The Notion task's commands use `npm`, but the repo uses pnpm. We follow the repo (this does not affect behaviour). The task page's commands should be fixed in Notion.

## Implementation notes (deviations found while applying)

| Decision | Planned | What the installed packages required |
|---|---|---|
| **D2/D4: tab bar props** | `tabBar` gets `navigation` | expo-router 58 passes `{ state, descriptors, emitter, navigateToTab, insets }`. `select(i)` emits `tabPress` on `emitter` and calls `navigateToTab(route.key)` only if `i` ≠ the active index and the event isn't prevented. This matches the default `BottomTabBar`. The import is `expo-router/js-tabs`; the old `Tabs` export from `expo-router` is deprecated. |
| **D3: gesture API** | `Gesture.Pan()` | Gesture Handler 3.3 deprecates the builder, so the bar uses `usePanGesture({ minDistance: 0, runOnJS: true, onBegin, onUpdate, onFinalize })`. Navigation runs on success. On `canceled` the indicator resets to the active tab. |
| **D5: where the drag state lives** | shared values updated on the UI thread | Callbacks run on the JS thread (`runOnJS: true`). The phase (`idle`/`pressed`/`dragging`) and the preview index are React state, with a ref mirror written only from handlers and effects. The animations themselves (`withTiming` + `Easing.bezier(motion.spring)`) still run on the UI thread. **Cost:** a JS round trip on each slot change (at most 3 per drag) and on press. Watch for lag in the device check. If the JS thread is busy, move index tracking back to worklets with `scheduleOnRN`. |
| **D5: icon colour** | — | SVG fills don't interpolate, so each item stacks an inactive and an active icon and cross-fades them over 300 ms. The label colour animates with `withTiming`. |
| **D7: glass API** | `isLiquidGlassSupported` or `isLiquidGlassAvailable` | `expo-glass-effect` 58 exports `isLiquidGlassAvailable`. The Android blur keeps `expo-blur`'s default `blurMethod` (`none` = tinted fallback). Real Android blur (`dimezisBlurView`) needs a `BlurTargetView` and is left for the device check. |
| **D9: measuring the bar** | `onLayout` on the glass surface | `onLayout` sits on the bar's outer animated view, which has the same width. Scaling doesn't affect layout. |
| **D11: Jest** | upstream mocks | Reanimated's upstream mock imports the real entry, which can't initialise under Jest with pnpm. Instead: `jest/reanimatedMock.tsx` (aliased as `react-native-reanimated/mock` in `moduleNameMapper`, so `expo-router/testing-library` picks it up too), plus worklets' own mock. Animations resolve to their target, and tests assert targets and timing configs (spying `withTiming`). The static checks read files through `src/testing/readSourceFiles.ts`, because the project has no Node types. |
| **D3: tap (found on device)** | A Pan with `minDistance(0)` also covers taps | A Pan never activates for a finger that doesn't move, so a still tap did nothing. A `useTapGesture` now competes with the Pan (`useCompetingGestures(pan, tap)`): a moving finger activates the Pan, a still one the Tap. The loser finalises as `canceled` (FAILED counts as canceled), so a touch never navigates twice. The press scale still comes from the Pan's `onBegin`. The Tap's `maxDuration` is the `tabBar.tapMaxDuration` token (10 s), so "hold still, then release" also navigates, as in the MVP. |
