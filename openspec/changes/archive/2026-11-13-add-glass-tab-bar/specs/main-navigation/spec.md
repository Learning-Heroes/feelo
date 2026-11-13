# Spec Delta

## Purpose

The signed-in app's primary navigation is a floating glass tab bar. It has three tabs (Descubre, Sugerir, Perfil) and works with a tap and with hold & drag. Its visuals follow the MVP prototype and Brand book §10.

## ADDED Requirements

### Requirement: Three tabs in fixed order
For a signed-in user, the app SHALL show a tab bar with exactly three items in this order: `Descubre`, `Sugerir`, `Perfil`. Each item SHALL have its own filled icon and its text label.

#### Scenario: Tab bar shows three items in order
- **WHEN** the tab bar renders
- **THEN** it shows the items `Descubre`, `Sugerir` and `Perfil` in that order, each with an icon and a label

### Requirement: Discover is the initial tab
When the signed-in app opens, the `Descubre` tab SHALL be selected and its screen SHALL be the existing Discover screen, unchanged.

#### Scenario: App start selects Descubre
- **WHEN** a signed-in user opens the app
- **THEN** the `Descubre` item is selected and the Discover screen is visible

### Requirement: Tap navigates to an inactive tab
Tapping an inactive tab SHALL show that tab's screen and make that item active. The indicator SHALL slide to the item in 450 ms on the brand spring curve.

#### Scenario: Tap Sugerir
- **WHEN** the user taps `Sugerir` while `Descubre` is active
- **THEN** the text `Sugerir` is visible and the `Sugerir` item is selected

#### Scenario: Tap Perfil
- **WHEN** the user taps `Perfil`
- **THEN** the text `Perfil` is visible and the `Perfil` item is selected

#### Scenario: Tap Descubre returns home
- **WHEN** the user is on `Perfil` and taps `Descubre`
- **THEN** the Discover screen is visible

### Requirement: Tap on the active tab does nothing
Tapping the active tab SHALL NOT navigate and SHALL NOT remount its screen.

#### Scenario: Tap on active Descubre
- **WHEN** `Descubre` is active and the user taps `Descubre`
- **THEN** no navigation happens and the Discover screen is not remounted

### Requirement: Placeholder tab screens
The `Sugerir` and `Perfil` screens SHALL show only their title text (`Sugerir` / `Perfil`) on the Noche background. The title SHALL use the Brand book Title role (Sora 800, 24–28 px, tracking −2%) and the screen SHALL contain no other element.

#### Scenario: Placeholder screens have only a title
- **WHEN** the `Sugerir` or `Perfil` screen renders
- **THEN** it contains exactly one text node, whose text is its title

### Requirement: Press feedback
When the user presses the tab bar, it SHALL scale to 1.04 over 300 ms on the brand spring curve.

#### Scenario: Press scales the bar
- **WHEN** a touch begins on the tab bar
- **THEN** the bar's target scale is 1.04

### Requirement: Drag previews a tab without navigating
While the finger moves on the bar, the bar SHALL scale to 1.06. The active index SHALL be `clamp(floor(xRelative / barWidth × 3), 0, 2)`. The indicator and active colour SHALL follow that index live, with an 80 ms linear motion. No navigation SHALL happen during the drag.

#### Scenario: Drag from 10% to 50% of the width
- **WHEN** the user drags from x = 10% to x = 50% of the bar width without releasing
- **THEN** the active index is 1, the bar's target scale is 1.06, and no navigation happens

### Requirement: Release navigates to the tab under the finger
When the user releases a drag or a tap, the app SHALL navigate to the tab under the finger and the bar SHALL scale back to 1. If that tab is already active, no navigation SHALL happen.

#### Scenario: Drag to the right end and release
- **WHEN** the user drags from x = 10% to x = 90% of the bar width and releases
- **THEN** the app navigates to `perfil` and the bar's target scale is 1

#### Scenario: Release over the active tab
- **WHEN** `Sugerir` is active and the user drags away and releases back over `Sugerir`
- **THEN** no navigation happens

### Requirement: Dragging past the bar edges clamps the index
A drag that leaves the bar to the left SHALL stay on index 0. A drag that leaves to the right SHALL stay on index 2. Releasing SHALL navigate to that tab.

#### Scenario: Drag out to the left
- **WHEN** a drag ends at x = −40 relative to the bar
- **THEN** the app navigates to `Descubre` (unless it is already active)

#### Scenario: Drag out to the right
- **WHEN** a drag ends at x = barWidth + 40
- **THEN** the app navigates to `Perfil`

### Requirement: Cancelled gesture restores state
If the system cancels the gesture, the indicator SHALL return to the active tab and the bar SHALL return to scale 1. No navigation SHALL happen.

#### Scenario: Cancelled over index 2
- **WHEN** a drag over index 2 ends in a cancelled state while `Descubre` is active
- **THEN** the indicator is on `Descubre`, the bar's target scale is 1, and no navigation happens

### Requirement: Visual fidelity from theme tokens
The bar, indicator and items SHALL use exactly the values in the task's visual spec, all read from the theme:
- Bar: height 64, radius 99, Noche glass `rgba(10,10,16,.6)`, border `rgba(255,255,255,.13)`
- Indicator: inset 6, width `barWidth/3 − 8`, violet gradient, border and glow
- Items: icon 24, label Sora 600 10.5 px; inactive `rgba(242,241,247,.34)`, active `#B9AFFF` with a −1 lift and 1.1 icon scale

#### Scenario: Tokens match the MVP
- **WHEN** the theme is imported
- **THEN** its tab bar tokens equal the task's visual spec, including height 64, radius 99, background, border, lavender `#B9AFFF`, text 3 and the spring curve `(.3, 1.25, .4, 1)`

### Requirement: Accessible tabs
The tab bar container SHALL have role `tablist`. Each item SHALL have:
- role `tab`
- an accessibility label equal to its label
- a correct `selected` state
- a touch area of at least 44×44

Tapping SHALL be a full alternative to dragging, and it SHALL work with VoiceOver and TalkBack.

#### Scenario: Roles, labels and state
- **WHEN** the tab bar renders with `Descubre` active
- **THEN** the container has role `tablist`, each item has role `tab` with its label, and only `Descubre` is `selected`

### Requirement: Reduce Motion
With Reduce Motion on:
- the bar SHALL NOT scale
- the indicator SHALL change position with a 200 ms fade instead of a spring
- the active icon SHALL NOT scale

#### Scenario: Reduce Motion enabled
- **WHEN** Reduce Motion is on and the user presses, drags or taps
- **THEN** the bar scale stays at 1, the indicator moves with a 200 ms fade and no spring, and the active icon is not scaled

### Requirement: Safe area and no overlap
The tab bar container's bottom padding SHALL be `max(bottom safe-area inset, 14)`. The last element of every tab screen SHALL remain visible above the floating bar.

#### Scenario: Device with home indicator
- **WHEN** the bottom inset is 34
- **THEN** the container's bottom padding is 34

#### Scenario: Device without home indicator
- **WHEN** the bottom inset is 0
- **THEN** the container's bottom padding is 14

### Requirement: No hard-coded values and no network
The tab bar, glass surface and tab routes SHALL NOT contain literal colours, radii or durations; the only exception is SVG path data. They SHALL NOT make network requests or import the Supabase client.

#### Scenario: Static check for literals
- **WHEN** the tab bar, glass surface and tab route sources are scanned
- **THEN** no colour, radius or duration literal is found outside `src/theme/`

#### Scenario: No network while navigating
- **WHEN** the tabs are rendered and the user navigates through all three with `fetch` mocked
- **THEN** `fetch` is never called
