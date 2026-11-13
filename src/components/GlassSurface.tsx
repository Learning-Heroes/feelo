import { BlurView } from 'expo-blur'
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect'
import { useEffect, useState } from 'react'
import { AccessibilityInfo, Platform, View, type ViewProps } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

export interface GlassSurfaceProps extends ViewProps {
  variant: 'bar'
}

// The only place that touches glass or blur libraries: native Liquid Glass on iOS 26+,
// a blur fallback elsewhere, and a solid surface when Reduce Transparency is on.
export function GlassSurface({ variant, style, children, ...rest }: GlassSurfaceProps) {
  const { theme } = useUnistyles()
  const reduceTransparency = useReduceTransparency()
  const surface = theme.glass[variant]

  if (reduceTransparency) {
    return (
      <View style={[styles.base, styles.border(surface.border), { backgroundColor: surface.solid }, style]} {...rest}>
        <View style={styles.highlight} pointerEvents="none" />
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
    <BlurView
      intensity={surface.blurIntensity}
      tint="dark"
      style={[styles.base, styles.border(surface.border), style]}
      {...rest}
    >
      <View testID="glass-tint" style={[StyleSheet.absoluteFill, { backgroundColor: surface.tint }]} pointerEvents="none" />
      <View style={styles.highlight} pointerEvents="none" />
      {children}
    </BlurView>
  )
}

function useReduceTransparency() {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    let mounted = true
    // Not every platform has the API (react-native-web doesn't): keep the glass look there.
    if (typeof AccessibilityInfo.isReduceTransparencyEnabled === 'function') {
      AccessibilityInfo.isReduceTransparencyEnabled()
        .then((value) => {
          if (mounted) setEnabled(value)
        })
        .catch(() => {
          if (mounted) setEnabled(false)
        })
    }
    const subscription = AccessibilityInfo.addEventListener('reduceTransparencyChanged', setEnabled)
    return () => {
      mounted = false
      subscription.remove()
    }
  }, [])

  return enabled
}

const styles = StyleSheet.create((theme) => ({
  base: { overflow: 'hidden' },
  border: (color: string) => ({ borderWidth: theme.glass.borderWidth, borderColor: color }),
  highlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: theme.glass.borderWidth,
    backgroundColor: theme.colors.highlight,
  },
}))
