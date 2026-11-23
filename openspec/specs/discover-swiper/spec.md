# discover-swiper Specification

## Purpose
The Discover screen's 4-direction swipe deck: the core mechanic that builds the taste profile. Users react to clips with swipes, overlays, a toast and a rated counter. Values come from the MVP prototype `feelo-app.html` and Brand book v0.2.
## Requirements
### Requirement: Drag moves and rotates the top card
While the user drags the top card by (`dx`, `dy`), the card SHALL translate by (`dx`, `dy`) and rotate `dx × 0.05` degrees.

#### Scenario: arrastre_mueve_y_gira_la_card
- **WHEN** a drag with `translationX: 50, translationY: 10` is in progress (no END)
- **THEN** the top card's transform has `translateX 50`, `translateY 10` and rotation `2.5deg`

### Requirement: Overlay of the dominant direction
The dominant direction SHALL be horizontal when `|dx| > |dy|` (sign of `dx`), otherwise vertical (sign of `dy`, negative = up). Only the overlay of the dominant direction SHALL be visible, once the displacement on that axis exceeds 20 px, with opacity `min(displacement / 90, 1)`. Every other overlay SHALL have opacity 0. Overlays SHALL use Sora 800 16 px, padding 10 × 18, radius 99, a 1.5 px border and blur 10, with these values:

| Direction | Label | Text and border | Background | Position and rotation |
|---|---|---|---|---|
| → right | `Me gustó` | `#7DDCC8` | `rgba(20,70,60,.5)` | vertically centred, 18 from the left, −8° |
| ← left | `No me gustó` | `#E8506E` | `rgba(90,20,35,.5)` | vertically centred, 18 from the right, 8° |
| ↑ up | `Me encantó` | `#FFAF5F` | `rgba(90,60,20,.5)` | horizontally centred, 110 from the bottom, −4° |
| ↓ down | `No la he visto` | `#B9AFFF` | `rgba(50,40,100,.5)` | horizontally centred, 70 from the top, 3° |

#### Scenario: overlay_derecha_visible_al_arrastrar
- **WHEN** the drag is at `translationX: 45`
- **THEN** the `Me gustó` overlay has opacity 0.5 and the other three have opacity 0

#### Scenario: sin_overlay_por_debajo_de_20
- **WHEN** the drag is at `translationX: 15`
- **THEN** all overlays have opacity 0

#### Scenario: overlay_satura_en_1
- **WHEN** the drag is at `translationX: 200`
- **THEN** the `Me gustó` overlay has opacity 1

#### Scenario: Overlay styling from theme
- **WHEN** the overlays render
- **THEN** each one's label, colours, position and rotation equal the table above

### Requirement: Swipe past the threshold
On release, a swipe SHALL register when the displacement on the dominant axis is strictly greater than 90 px. The card SHALL fly out to `x = +600` (right), `x = −600` (left), `y = −800` (up) or `y = +800` (down). The other axis SHALL go to `displacement × 2`, the rotation to `x × 0.06` degrees and the opacity to 0, over 500 ms with `cubic-bezier(.25,.8,.25,1)`. The toast and counter SHALL update as follows:

| Direction | Toast | Counts |
|---|---|---|
| → right | `Me gustó · guardado` | yes |
| ← left | `No me gustó · anotado` | yes |
| ↑ up | `Me encantó` | yes |
| ↓ down | `No la has visto · te la podremos sugerir` | no |

#### Scenario: swipe_derecha_registra_me_gusto
- **WHEN** the user drags to `translationX: 120` and releases
- **THEN** the card exits toward `x = +600` in 500 ms and fades out, the toast shows `Me gustó · guardado` and the counter shows `1 valorados`

#### Scenario: swipe_izquierda_registra_no_me_gusto
- **WHEN** the user drags to `translationX: −120` and releases
- **THEN** the card exits toward `x = −600`, the toast shows `No me gustó · anotado` and the counter shows `1 valorados`

#### Scenario: swipe_arriba_registra_me_encanto
- **WHEN** the user drags to `translationY: −120` and releases
- **THEN** the card exits toward `y = −800`, the toast shows `Me encantó` and the counter shows `1 valorados`

#### Scenario: swipe_abajo_no_suma_al_contador
- **WHEN** the user drags to `translationY: 120` and releases
- **THEN** the card exits toward `y = +800`, the toast shows `No la has visto · te la podremos sugerir` and the counter shows `0 valorados`

#### Scenario: diagonal_gana_el_eje_mayor
- **WHEN** the user drags to `translationX: 100, translationY: −95` and releases
- **THEN** a right swipe registers, not an up swipe

#### Scenario: empate_de_ejes_es_vertical
- **WHEN** the user drags to `translationX: 100, translationY: 100` and releases
- **THEN** a down swipe registers

### Requirement: Release below the threshold returns the card
When the gesture ends without exceeding 90 px on the dominant axis, or is cancelled, the card SHALL return to `x = 0`, `y = 0` and rotation 0 in 450 ms with `motion.spring` `cubic-bezier(.3,1.25,.4,1)`. Every overlay SHALL return to opacity 0. No toast SHALL show and the counter SHALL NOT change.

#### Scenario: justo_en_el_umbral_no_cuenta
- **WHEN** the user drags to `translationX: 90` and releases
- **THEN** the card returns, no toast shows and the counter is unchanged

#### Scenario: sin_umbral_vuelve_y_no_registra
- **WHEN** the user drags to `translationX: 60` and releases
- **THEN** the card is at rest, all overlays have opacity 0, no toast shows and the counter shows `0 valorados`

#### Scenario: gesto_cancelado_no_registra
- **WHEN** the gesture reaches `translationX: 150` and then ends in state `CANCELLED`
- **THEN** the card returns, no toast shows and the counter is unchanged

### Requirement: The deck advances after a swipe
280 ms after a swipe registers, the second card SHALL become the top card and be interactive, the third SHALL become the second, and a new clip SHALL enter third position. Cards moving up SHALL animate to their new slot in 400 ms with `motion.spring`.

#### Scenario: swipe_valido_avanza_el_mazo
- **WHEN** the user swipes right and 280 ms pass
- **THEN** the top card shows the title of the mock's second clip

### Requirement: Stacked deck
At rest the deck SHALL show 3 cards. Top: scale 1, interactive. Second: scale .96, `translateY` 13, opacity .8. Third: scale .92, `translateY` 26, opacity .55. Only the top card SHALL respond to gestures and touches.

#### Scenario: mazo_muestra_tres_cards_apiladas
- **WHEN** Discover renders
- **THEN** 3 cards are shown; the second has scale .96 and opacity .8, the third scale .92 and opacity .55

#### Scenario: cards_de_debajo_no_responden
- **WHEN** a gesture or press targets the second card
- **THEN** it does not move and no swipe registers

### Requirement: Infinite deck
The clip at deck position `k` SHALL be `deck[(pos + k) % deck.length]`, where `pos` is the number of swipes so far. The mock deck SHALL be a fixed-order list of at least 5 clips with the `ClipCardData` shape, so the deck never runs out.

#### Scenario: mazo_infinito_da_la_vuelta
- **WHEN** the mock has 5 clips and the user makes 5 swipes
- **THEN** the top card is the mock's first clip and the deck still works

### Requirement: Toast
After a swipe registers, a pill toast SHALL show its direction's message at the top, centred, 14 from the top edge. It uses Sora 600 13.5 px, padding 10 × 18, background `rgba(10,10,16,.75)`, blur 16 and a glass border. It SHALL slide in from above over 500 ms with `motion.spring` and hide 1,400 ms after the swipe. A new swipe SHALL replace the text and restart the timer.

#### Scenario: toast_se_oculta_a_los_1400
- **WHEN** the user swipes and 1,400 ms pass
- **THEN** the toast is hidden

#### Scenario: toast_se_reinicia_con_swipe_nuevo
- **WHEN** the user swipes right and, 1,000 ms later, swipes left
- **THEN** the toast text is `No me gustó · anotado` and it is still visible 2,300 ms after the first swipe

### Requirement: Discover header with wordmark
The Discover header SHALL be a row with padding 4 × 2 × 12 (top × sides × bottom), with the wordmark on the left and the rated counter on the right. The wordmark SHALL be the text `feel` in Sora 800 24 px, letter-spacing −5% (−1.2), line height 1, colour `color.texto.1`, followed by an orb. The orb is 0.62 em across (14.88 px), sits 0.06 em to the right of the text and 0.02 em lower, and is filled with a radial gradient centred at 35 % / 30 %: `#FFFFFF` at 0 %, lavender `#B9AFFF` at 35 % and `#6C5CE0` at 80 %. It has a glow of `rgba(139,124,246,.55)` with radius 0.4 em. The wordmark SHALL be one accessible element labelled `Feelo`, with `accessibilityRole="header"`.

#### Scenario: Header shows wordmark and counter
- **WHEN** Discover renders
- **THEN** the header shows the `feel` wordmark with its orb on the left and `0 valorados` on the right

#### Scenario: Wordmark is accessible
- **WHEN** a screen reader focuses the wordmark
- **THEN** it reads `Feelo` as a header, not `feel`

### Requirement: Rated counter
The Discover header SHALL show, right-aligned, a pill reading `{n} valorados`. It starts at `0 valorados` and uses Sora 600 12 px, padding 6 × 12, radius 99, background `rgba(139,124,246,.16)`, lavender text and border `rgba(139,124,246,.3)`. Right, left and up swipes SHALL add 1; down swipes SHALL NOT.

#### Scenario: contador_inicial_y_mixto
- **WHEN** Discover first renders
- **THEN** the header shows `0 valorados`
- **WHEN** the user makes 2 right swipes, 1 up and 1 down
- **THEN** the header shows `3 valorados`

### Requirement: Legend with equivalent buttons
Under the deck, a legend row SHALL show 4 items in this order: `👈 No me gustó`, `👇 No la he visto`, `👆 Me encantó`, `👉 Me gustó`. Each has an emoji on top at 14 px and its text in Sora 600 10.5 px in `color.texto.3`. Each item SHALL be a button that swipes the top card in its direction, with the same animation, toast, counter and deck advance as the gesture. The legend SHALL stay visible above the floating tab bar.

#### Scenario: leyenda_en_orden
- **WHEN** Discover renders
- **THEN** the legend shows `No me gustó`, `No la he visto`, `Me encantó`, `Me gustó` in that order

#### Scenario: boton_de_leyenda_ejecuta_swipe
- **WHEN** the user presses `Me encantó`
- **THEN** the toast shows `Me encantó`, the counter shows `1 valorados` and the deck advances after 280 ms

### Requirement: Accessibility
Each legend item SHALL have `accessibilityRole="button"`, an `accessibilityLabel` equal to its text, and a touch area of at least 44 × 44. The top card SHALL expose an `accessibilityLabel` with the clip title and 4 `accessibilityActions` (`Me gustó`, `No me gustó`, `Me encantó`, `No la he visto`), each running the matching swipe.

#### Scenario: botones_cumplen_accesibilidad
- **WHEN** Discover renders
- **THEN** there are 4 buttons with role `button`, the correct label, and a size or `hitSlop` of at least 44 × 44

#### Scenario: accessibility_action_ejecuta_swipe
- **WHEN** the top card receives the accessibility action `Me gustó`
- **THEN** the toast shows `Me gustó · guardado`

### Requirement: Reduce Motion
With Reduce Motion on:
- a registered swipe SHALL fade the card out in 200 ms, with no translation or rotation
- a release below the threshold SHALL return the card instantly, with no spring
- the toast SHALL appear with a 200 ms fade
- cards moving up the deck SHALL take their new slot instantly

Overlays, the counter and the deck advance SHALL work the same as without Reduce Motion.

#### Scenario: reduce_motion_desvanece_sin_desplazar
- **WHEN** Reduce Motion is on and the user swipes right
- **THEN** the card neither moves nor rotates, it fades out in 200 ms and the counter shows `1 valorados`

### Requirement: One swipe at a time
While a card is exiting (from the moment a swipe registers until the deck advances), any further swipe from the gesture, a legend button or an accessibility action SHALL be ignored.

#### Scenario: doble_swipe_bloqueado
- **WHEN** the user swipes right and presses `Me encantó` before 280 ms have passed
- **THEN** the counter shows `1 valorados` and only one toast message shows (`Me gustó · guardado`)

### Requirement: No haptics, network or hard-coded values
No file in `src/features/discover/` SHALL import `expo-haptics`. No file of this change SHALL call `fetch` or import the Supabase client. No colour, duration or threshold literal SHALL appear outside `src/theme/`, except the platform colours in `discoverMock.ts`.

#### Scenario: no_importa_haptics
- **WHEN** `src/features/discover/` is scanned
- **THEN** no file imports `expo-haptics`

#### Scenario: no_hay_peticiones_de_red
- **WHEN** Discover renders and the user makes 4 swipes with `fetch` mocked
- **THEN** `fetch` is never called

#### Scenario: sin_literales_fuera_de_theme
- **WHEN** `src/features/discover/` is scanned
- **THEN** no colour, duration or threshold literal is found, except the platform colours in `discoverMock.ts`

