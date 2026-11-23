# Tasks

Branch: `feat/discover-swiper`. Workflow per repo rules: write each group's tests first, confirm they fail (red), then implement until green. Test names come from the Notion task's test cases.

## 1. Setup

- [x] 1.1 Create branch `feat/discover-swiper` (from the tab bar work it depends on). Verify: `git branch --show-current`.
- [x] 1.2 Upgrade `jest/reanimatedMock.tsx` per design D6: a stable, re-rendering `useSharedValue` and a `cancelAnimation` no-op. Confirm `scheduleOnRN` (or `runOnJS`) resolves under Jest. Verify: the existing `pnpm test` suite is still green, tab bar tests included.

## 2. Theme tokens and copy

- [x] 2.1 Extend `src/theme/tokens.test.ts` with `tokens_de_swiper_coinciden_con_mvp`, which asserts every value in the spec tables: overlay colours and backgrounds, threshold 90 / min 20, rotation factors, exit targets, 280 / 450 / 500 / 400 / 1400 ms, deck slots, toast, counter, legend and the `motion.exit` curve. Verify: red.
- [x] 2.2 Add the tokens from design D7 to `tokens.ts` and the Unistyles theme, widen `GlassSurface`'s `variant` type, and add `discoverCopy.ts` with every user-facing string. Verify: 2.1 green, `pnpm typecheck` green, `GlassSurface.test.tsx` green.

## 3. Swipe math

- [x] 3.1 Write `src/features/discover/swipeMath.test.ts`. Cover the dominant axis, the tie going vertical, the diagonal going to the larger axis, exactly 90 not counting, overlay opacity at 15 / 45 / 200, and the exit targets for all 4 directions, including the other axis × 2 and the rotation `x × 0.06`. Verify: red.
- [x] 3.2 Implement `swipeMath.ts` as worklet-safe pure functions reading the theme's swipe tokens. Verify: 3.1 green.

## 4. Mock deck and deck state

- [x] 4.1 Write `src/features/discover/useDiscoverDeck.test.ts` (fake timers). Cover: starts at 0 rated with 3 cards from the deck; the counter counts right, left and up but not down; advance at 280 ms; wraps after N swipes; the toast hides at 1,400 ms; a new swipe restarts the toast timer; a second `requestSwipe` while exiting is ignored; timers are cleared on unmount. Verify: red.
- [x] 4.2 Replace `discoverMock` with `discoverDeck` (5 fixed clips) and update `ClipCard.test.tsx` to use `discoverDeck[0]`. Implement `useDiscoverDeck` per design D1/D3/D4. Verify: 4.1 green and `ClipCard.test.tsx` green, with `ClipCard.tsx` unchanged (`git diff --stat` shows no change to it).

## 5. Card, overlays and deck

- [x] 5.1 Write `src/features/discover/SwipeDeck.test.tsx` using `fireGestureHandler` / `getByGestureTestId`. Cover: `arrastre_mueve_y_gira_la_card`, `overlay_derecha_visible_al_arrastrar`, `sin_overlay_por_debajo_de_20`, `overlay_satura_en_1`, overlay label, colour, position and rotation from tokens, `mazo_muestra_tres_cards_apiladas`, `cards_de_debajo_no_responden`, `justo_en_el_umbral_no_cuenta`, `sin_umbral_vuelve_y_no_registra` (450 ms spring via the `withTiming` spy), `gesto_cancelado_no_registra`, the exit target and its 500 ms `motion.exit` timing for each direction, `diagonal_gana_el_eje_mayor`, `empate_de_ejes_es_vertical`, `accessibility_action_ejecuta_swipe` (the card label equals the clip title, plus 4 actions), and `reduce_motion_desvanece_sin_desplazar`. Verify: red.
- [x] 5.2 Implement `SwipeOverlay`, `SwipeableClipCard` (wrapping the unchanged `ClipCard`, with an imperative `fling`) and `SwipeDeck` per design D1, D2, D3 and D5. Verify: 5.1 green.

## 6. Screen: header, legend, toast

- [x] 6.0 Write `src/components/Wordmark.test.tsx` (it renders `feel` and an SVG orb whose gradient stops come from the tokens; it is a single accessible `header` labelled `Feelo`), add the `Wordmark` tokens to the 2.1 token test, and add `Wordmark.tsx` to the scan list in `noHardcodedValues.test.ts`. Verify: red. Then implement `src/components/Wordmark.tsx` per design D1. Verify: green.
- [x] 6.1 Rewrite `src/features/discover/DiscoverScreen.test.tsx` (integration, fake timers). Keep `no_hay_peticiones_de_red`, now with 4 swipes, and `card_tiene_label_accesible` on the top card. Drop `zonas_en_orden` and `muestra_la_card_mock_completa`, which `ClipCard.test.tsx` now covers. Add: `swipe_derecha_registra_me_gusto`, `swipe_izquierda_registra_no_me_gusto`, `swipe_arriba_registra_me_encanto`, `swipe_abajo_no_suma_al_contador`, `swipe_valido_avanza_el_mazo`, `mazo_infinito_da_la_vuelta`, `contador_inicial_y_mixto`, `cabecera_muestra_wordmark_y_contador`, `toast_se_oculta_a_los_1400`, `toast_se_reinicia_con_swipe_nuevo`, `leyenda_en_orden`, `boton_de_leyenda_ejecuta_swipe`, `botones_cumplen_accesibilidad` and `doble_swipe_bloqueado`. Verify: red.
- [x] 6.2 Implement `DiscoverHeader` (`Wordmark` + counter pill), `SwipeLegend`, `SwipeToast` (`GlassSurface variant="toast"`, slide-in or fade-in) and the new `DiscoverScreen` composition. Verify: 6.1 green.

## 7. Routes

- [x] 7.1 Add the route tests to `GlassTabBar.integration.test.tsx` (or a new route test): the Discover route renders only `DiscoverScreen`, and Perfil shows the title plus the `Cerrar sesión` button. Verify: red.
- [x] 7.2 Make `app/(app)/(tabs)/index.tsx` return only `<DiscoverScreen />` and move `<LogoutButton />` into `perfil.tsx`. Verify: 7.1 green, `routeGuard.test.tsx` and the tab bar integration tests green.

## 8. Static checks

- [x] 8.1 Write `src/features/discover/discoverSources.test.ts` per design D9: `no_importa_haptics`, `sin_literales_fuera_de_theme` and the no-Supabase/no-`fetch(` scan. Run it against the finished code and fix any offence by moving the value to `src/theme/`. Confirm it can fail by temporarily adding a literal. Verify: green.

## 9. Verify and hand off

- [x] 9.1 `pnpm lint`, `pnpm typecheck` and `pnpm test` all green. No `api:sync` (no schema or function change).
- [ ] 9.2 *(Skipped at Rafa's request on 2026-11-23: no simulator run in this PR. Left to Toni's frontend validation.)* Manual check on an iOS dev build (`pnpm ios`) following the task's "Pasos manuales" 1–9, including VoiceOver and Reduce Motion, side by side with `feelo-app.html`. Note the results in the PR.
- [x] 9.3 `feelo-reviewer` review of the diff against the task and repo rules, then fix its findings.
- [x] 9.4 Archive the change (`/opsx:archive`) and draft the PR from `.github/pull_request_template.md`, linking the Notion task and this change. Don't push without confirmation.
