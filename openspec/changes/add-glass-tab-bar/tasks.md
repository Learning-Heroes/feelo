# Tasks

Branch: `feat/glass-tab-bar`. Workflow per repo rules: write each group's tests first, confirm they fail (red), then implement until green.

## 1. Gate and setup

- [ ] 1.1 Get Toni's approval for the six new dependencies and the `(app)/(tabs)` nesting at spec review, and record the decision in Notion → Decisiones. Verify: link to the decision entry.
- [x] 1.2 Create branch `feat/glass-tab-bar` from `main`. Verify: `git branch --show-current`.
- [x] 1.3 Install `react-native-reanimated`, `react-native-worklets`, `react-native-gesture-handler`, `react-native-svg`, `expo-glass-effect`, `expo-blur` and `expo-linear-gradient` with `pnpm expo install …`. Note the actual exported names (`isLiquidGlassAvailable` vs `isLiquidGlassSupported`, `scheduleOnRN` vs `runOnJS`). Verify: `pnpm typecheck` passes and the names are recorded in the PR notes.
- [x] 1.4 Add the Jest setup for Gesture Handler, Reanimated/worklets and host mocks of `expo-glass-effect`, `expo-blur` and `expo-linear-gradient` to `jest.setup.ts`. Verify: the existing `pnpm test` suite is still green.
- [x] 1.5 Wrap the root in `GestureHandlerRootView` (in `app/_layout.tsx`, around the Stack). Verify: `routeGuard.test.tsx` is still green.

## 2. Theme tokens

- [x] 2.1 Write `src/theme/tokens.test.ts` → `tokens_de_tab_bar_coinciden_con_mvp`, asserting all of the task's visual-spec values. Verify: the test fails (red).
- [x] 2.2 Add `colors.lavanda` and the highlight, shadow and indicator colours, plus `motion`, `tabBar`, `glass.bar` and `typography.tabLabel`, to `tokens.ts` and the Unistyles theme. Reuse existing tokens where values match. Verify: 2.1 passes and `pnpm typecheck` is green.

## 3. GlassSurface

- [x] 3.1 Write `src/components/GlassSurface.test.tsx`. Verify: all four tests fail (red).
  - `glass_surface_usa_glass_nativo_en_ios_26`
  - `glass_surface_usa_blur_en_fallback` (border `rgba(255,255,255,.13)`)
  - `reduce_transparency_usa_solido` (no Blur or Glass view, background `#0A0A10`; also toggling via the `reduceTransparencyChanged` listener)
  - `ningun_fichero_importa_glass_directamente` (fs scan of `src/` and `app/`)
- [x] 3.2 Implement `src/components/GlassSurface.tsx` per design D7: the three levels, the inline Reduce Transparency hook with cleanup, and the 1 px highlight View. Verify: 3.1 passes.

## 4. Tab icons and screen title

- [x] 4.1 Write tests:
  - `src/components/ScreenTitle.test.tsx` → `pantallas_vacias_solo_tienen_titulo` (exactly one text node with the title, Title role style)
  - a TabIcons test checking that each icon renders an SVG with its fill colour prop

  Verify: both fail (red).
- [x] 4.2 Implement `src/components/ScreenTitle.tsx` and the three icon components (Descubre, Sugerir, Perfil) using the MVP SVG paths. The Discover cut-out uses `noche` at the opacity token. Verify: 4.1 passes.

## 5. GlassTabBar

- [x] 5.1 Write `src/components/GlassTabBar.test.tsx`, using fake `state`/`descriptors`/`navigation` and `fireGestureHandler` on the Pan's test id. Verify: all fail (red).
  - `tab_bar_muestra_tres_items_en_orden`
  - `items_tienen_rol_label_y_estado`
  - `drag_actualiza_indicador_sin_navegar`
  - `soltar_navega_a_la_pestana_bajo_el_dedo`
  - `drag_fuera_por_la_izquierda_queda_en_cero`
  - `drag_fuera_por_la_derecha_queda_en_dos`
  - `soltar_sobre_la_activa_no_navega`
  - `tap_en_la_activa_no_renavega`
  - `gesto_cancelado_no_navega`
  - `escala_pulsar_y_arrastrar`
  - `reduce_motion_sin_spring_ni_escala`
  - `padding_inferior_respeta_safe_area` (insets 34 → 34, 0 → 14)
  - an accessibility-activation test (`accessibilityAction` "activate" navigates)
- [x] 5.2 Implement `src/components/useGlassTabBarHeight.ts`: the total height from tokens + `max(insets.bottom, 14)`. Verify: covered by `padding_inferior_respeta_safe_area`.
- [x] 5.3 Implement `src/components/GlassTabBar.tsx` per design D3–D6 and D9:
  - wrapper with shadow
  - `GlassSurface` bar
  - gradient indicator driven by shared values
  - items with colour and icon animation
  - a single Pan `minDistance(0)`
  - `select(index)` with the `tabPress` emit, plus the same-index guard
  - Reduce Motion branch
  - a11y roles, state and actions

  Verify: 5.1 passes.

## 6. Routes

- [x] 6.1 Write `src/components/GlassTabBar.integration.test.tsx` (or under `src/features/` if it imports the auth store), using `renderRouter` with the real `(tabs)` layout. Verify: they fail (red).
  - `arranque_selecciona_descubre`
  - `tap_en_sugerir_navega`
  - `tap_en_perfil_navega`
  - `tap_en_descubre_vuelve_a_la_home`
  - `no_hay_peticiones_de_red` (`fetch` spied, navigate through all 3 tabs)
- [x] 6.2 Create `app/(app)/(tabs)/_layout.tsx` (`Tabs` with the custom `tabBar`, `headerShown: false`, `sceneStyle` padding and Noche background from `useGlassTabBarHeight`). Add `index.tsx` (DiscoverScreen + LogoutButton) and `sugerir.tsx` / `perfil.tsx` (ScreenTitle with constant text). Delete `app/(app)/index.tsx` so the route is not duplicated. Verify: 6.1 passes and `routeGuard.test.tsx` is still green.

## 7. Static checks and integration

- [x] 7.1 Write `src/components/noHardcodedValues.test.ts` → `sin_literales_fuera_de_theme`. It scans `GlassTabBar.tsx`, `GlassSurface.tsx`, `useGlassTabBarHeight.ts`, `ScreenTitle.tsx` and `app/(app)/(tabs)/*` for hex/rgba colours and numeric `borderRadius`/`duration` literals, excluding SVG path and viewBox data. It also asserts there are no `@/lib/supabase` imports. Verify: it passes against the implemented code, and a temporary literal makes it fail.
- [x] 7.2 Run `pnpm lint`, `pnpm typecheck` and `pnpm test`. Verify: all green.
- [ ] 7.3 Do a manual device check on a dev build (`pnpm ios`), following the task's §8 steps 1–7: tap, hold & drag, release outside both sides, side-by-side with `feelo-app.html`, iOS 26 glass vs older iOS or Android blur, Reduce Motion, Reduce Transparency, VoiceOver. Tune `glass.bar.blurIntensity` and confirm the Discover card is not covered by the bar. Verify: the checklist with results goes in the PR description.

## Workflow follow-up

- Open a PR `feat/glass-tab-bar` → `staging` linking the Notion task and this change. Push only after explicit confirmation. Get CodeRabbit + Toni's sign-off.
- Fix the Notion task's commands (`npm` → `pnpm`) and note the `(app)/(tabs)` path deviation in the task.
- Archive this change (`/opsx:archive`) after merge.
