---
name: glass-component
description: Build Feelo UI on a glass / Liquid Glass surface through the in-house <GlassSurface> component, with its fallbacks for Android, iOS < 26 and Reduce Transparency. Use when creating or changing any card, sheet, tab bar, button or overlay with a glass look, or when GlassSurface itself needs to change.
---

# Glass component — Feelo

Visual language: [Brand book](https://app.notion.com/p/3c6bd3bd193b8070be4bc17609c8fd55) · [Prototipo](https://app.notion.com/p/3c6bd3bd193b80f09061f4b8536e3cdf).

Real Liquid Glass is an iOS 26 system API; Android doesn't have it. So every surface has **three levels** and `<GlassSurface>` picks one at runtime:

| Condition | Renders |
|---|---|
| iOS 26+ and `isLiquidGlassAvailable()` | `GlassView` from `expo-glass-effect` |
| Android, iOS < 26 | `BlurView` from `expo-blur` + tinted overlay + `expo-linear-gradient` highlight |
| *Reduce Transparency* on (any platform) | Solid surface from tokens + gradient border |

## Consuming it (the normal case)

```tsx
import { GlassSurface } from '@/components/GlassSurface'

export function SuggestionCard({ title }: SuggestionCardProps) {
  return (
    <GlassSurface variant="card" style={styles.card}>
      <Text style={styles.title}>{title}</Text>
    </GlassSurface>
  )
}

const styles = StyleSheet.create((theme) => ({
  card: { padding: theme.spacing.lg, borderRadius: theme.radius.xl },
  title: { ...theme.typography.titleM, color: theme.colors.textPrimary },
}))
```

- Pick a `variant` (`card`, `sheet`, `bar`, `button`…); don't pass raw tint or intensity values from a screen.
- Keep simultaneously visible blurred surfaces low on Android (≈3); prefer one `GlassSurface` wrapping a group over many small ones.

## If `GlassSurface` doesn't exist yet

Create `src/components/GlassSurface.tsx` (one export, same name) following this shape, reading every value from the theme:

```tsx
import { useEffect, useState } from 'react'
import { AccessibilityInfo, Platform, View, type ViewProps } from 'react-native'
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect'
import { BlurView } from 'expo-blur'
import { LinearGradient } from 'expo-linear-gradient'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

export interface GlassSurfaceProps extends ViewProps {
  variant: 'card' | 'sheet' | 'bar' | 'button'
}

export function GlassSurface({ variant, style, children, ...rest }: GlassSurfaceProps) {
  const { theme } = useUnistyles()
  const reduceTransparency = useReduceTransparency()
  const surface = theme.glass[variant] // tint, blurIntensity, solid, highlight

  if (reduceTransparency) {
    return (
      <View style={[styles.base, { backgroundColor: surface.solid }, style]} {...rest}>
        <LinearGradient colors={surface.highlight} style={StyleSheet.absoluteFill} pointerEvents="none" />
        {children}
      </View>
    )
  }

  if (Platform.OS === 'ios' && isLiquidGlassAvailable()) {
    return (
      <GlassView glassEffectStyle="regular" tintColor={surface.tint} style={[styles.base, style]} {...rest}>
        {children}
      </GlassView>
    )
  }

  return (
    <BlurView intensity={surface.blurIntensity} tint="systemMaterial" style={[styles.base, style]} {...rest}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: surface.tint }]} pointerEvents="none" />
      <LinearGradient colors={surface.highlight} style={StyleSheet.absoluteFill} pointerEvents="none" />
      {children}
    </BlurView>
  )
}

function useReduceTransparency() {
  const [enabled, setEnabled] = useState(false)
  useEffect(() => {
    AccessibilityInfo.isReduceTransparencyEnabled().then(setEnabled)
    const sub = AccessibilityInfo.addEventListener('reduceTransparencyChanged', setEnabled)
    return () => sub.remove()
  }, [])
  return enabled
}

const styles = StyleSheet.create({ base: { overflow: 'hidden' } })
```

- Tokens (`theme.glass.<variant>`) go in `src/theme/`; add them there, never inline.
- Check the installed `expo-glass-effect` API (`npx expo install expo-glass-effect expo-blur expo-linear-gradient`) before relying on prop names.
- `expo-glass-effect` works in Expo Go; `@callstack/liquid-glass` (only if morphing between surfaces is required, and with Toni's approval) needs a dev build.

## Verify

- Component test (RNTL): each of the three branches renders, mocking `isLiquidGlassAvailable`, `Platform.OS` and `isReduceTransparencyEnabled`.
- Look at it on an iOS 26 dev build (`npx expo run:ios`), an Android emulator and with *Reduce Transparency* on. Note in the PR what you checked.
