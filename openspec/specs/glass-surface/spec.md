# glass-surface Specification

## Purpose

A single shared glass surface that every glass-looking UI element renders through. At runtime it picks native Liquid Glass, a blur fallback, or a solid fallback when Reduce Transparency is on, so the glass look degrades consistently across platforms.

## Requirements

### Requirement: Native glass on supported iOS
On iOS where native Liquid Glass is supported (iOS 26+), and with Reduce Transparency off, the glass surface SHALL render the platform's native glass effect.

#### Scenario: Liquid Glass supported
- **WHEN** native Liquid Glass is reported as supported and Reduce Transparency is off
- **THEN** the surface renders the native glass view

### Requirement: Blur fallback
On iOS below 26 and on Android, with Reduce Transparency off, the glass surface SHALL render a blur with background `rgba(10,10,16,.6)` and a 1 px border `rgba(255,255,255,.13)`.

#### Scenario: Liquid Glass not supported
- **WHEN** native Liquid Glass is reported as not supported and Reduce Transparency is off
- **THEN** the surface renders a blur view with the `rgba(255,255,255,.13)` border and `rgba(10,10,16,.6)` tint, and no native glass view

### Requirement: Solid fallback for Reduce Transparency
With Reduce Transparency on, on any platform, the glass surface SHALL render a solid `#0A0A10` background with the same border. It SHALL render neither blur nor native glass.

#### Scenario: Reduce Transparency enabled
- **WHEN** Reduce Transparency is on
- **THEN** the surface renders neither a blur view nor a native glass view, and its background is `#0A0A10`

#### Scenario: Reduce Transparency toggled at runtime
- **WHEN** the user turns Reduce Transparency on while the surface is mounted
- **THEN** the surface switches to the solid fallback without a remount of its parent

### Requirement: Glass libraries are encapsulated
Only the glass surface module SHALL import the native glass, blur or `@callstack/liquid-glass` libraries. No other file in `src/` or `app/` SHALL import them.

#### Scenario: Static import check
- **WHEN** all source files under `src/` and `app/` are scanned for imports of `expo-glass-effect`, `expo-blur` or `@callstack/liquid-glass`
- **THEN** the only match is the glass surface module
