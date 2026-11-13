# Proposal

Task: [[App] — Crear la tab bar glass inferior de 3 pestañas con tap y hold & drag](https://app.notion.com/p/558b1ed3f51e4713bde0cf47fde6be4c) · Validation owner: Toni (frontend)

## Why

The app has one private screen (Discover) and no main navigation. The MVP prototype (`feelo-app.html`) and Brand book §10 define a floating glass tab bar with three tabs (Descubre, Sugerir, Perfil). It responds to a tap and to hold & drag. Adding it now gives the app its final navigation shell, so later screens only have to fill in content. This is also the first UI that needs `GlassSurface`, gestures and animation, so those foundations arrive with it.

## What Changes

- New tab layout **nested inside the existing authenticated `(app)` group**: `app/(app)/(tabs)/_layout.tsx` with a custom `tabBar`, so the default bar is never rendered. The root layout and its `Stack.Protected` auth guards are unchanged. (The Notion task says `app/(tabs)/`. It was written before auth existed. The PO chose to nest the tabs.)
- Thin routes: `app/(app)/(tabs)/index.tsx` (Discover: `<DiscoverScreen />` + the existing temporary `<LogoutButton />`, moved from `app/(app)/index.tsx` and not duplicated), `sugerir.tsx` and `perfil.tsx`.
- Sugerir and Perfil placeholder screens: Noche background and only their title, in the Title role.
- New domain-agnostic components in `src/components/`:
  - `GlassTabBar`: a pill-shaped bar with a sliding indicator and 3 items. It handles tap and hold & drag with a single Pan gesture.
  - `GlassSurface`: picks native Liquid Glass, a blur fallback or a solid fallback at runtime.
  - A shared screen-title component.
  - The three tab icons, drawn as SVG.
- New theme tokens in `src/theme/` for every value in the task's visual spec (bar, indicator, item, lavender, motion curves and durations, glass variant). Existing tokens are reused.
- Support for Reduce Motion and Reduce Transparency.
- New dependencies, all from the Expo SDK and pending Toni's approval at spec review: `react-native-reanimated` (and its peer `react-native-worklets`), `react-native-gesture-handler`, `react-native-svg`, `expo-glass-effect`, `expo-blur`, `expo-linear-gradient`. The decision gets recorded in Notion → Decisiones.

Out of scope:
- Content for Sugerir or Perfil beyond the title.
- Any change to `DiscoverScreen`.
- Animated screen transitions, haptics, ambient blobs, a UI Kit tab, i18n, a light theme, backend and Maestro E2E.
- Moving `LogoutButton` to Perfil. It stays on Discover until the Profile task.

## Capabilities

### New Capabilities
- `main-navigation`: the app's primary tab navigation. Covers which tabs exist and in what order, the initial tab, tap and hold & drag behaviour, accessibility, motion, safe-area handling and the placeholder tab screens.
- `glass-surface`: the shared glass surface and its three runtime levels (native glass, blur fallback, solid fallback for Reduce Transparency). Also enforces that only this component touches glass or blur libraries.

### Modified Capabilities
- None (no existing specs in `openspec/specs/`).

## Impact

- **Routes:** `app/(app)/index.tsx` moves to `app/(app)/(tabs)/index.tsx`, and `app/(app)/_layout.tsx` keeps its Stack. The URL `/` still resolves to Discover, so the auth redirects (`redirectTo="/"`) and `routeGuard.test.tsx` keep working.
- **Code:** new files in `src/components/` and new tokens in `src/theme/tokens.ts` / `unistyles.ts`. `src/features/discover/` is unchanged.
- **Tests and tooling:** Jest gets the Reanimated and Gesture Handler mocks or setup. Native modules (glass, blur, gradient, SVG) are mocked where needed.
- **Native:** the new native modules require a new dev build (`pnpm ios`).
- **No backend:** no Supabase, network calls, seeders, `api:sync` or type generation.
