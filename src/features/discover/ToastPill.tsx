import { useEffect, useMemo } from 'react'
import { Text } from 'react-native'
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { GlassSurface } from '@/components/GlassSurface'

interface ToastPillProps {
  message: string
}

// Plays its entrance once per mount; SwipeToast remounts it (key = toast id) for each swipe.
export function ToastPill({ message }: ToastPillProps) {
  const { theme } = useUnistyles()
  const reduceMotion = useReducedMotion()
  const { reduceMotionFade, toastIn } = theme.motion.duration
  // Easing.bezier returns a new function per call: memoised so a parent re-render
  // (e.g. the deck advancing at 280 ms) doesn't restart the entrance mid-way.
  const spring = useMemo(() => Easing.bezier(...theme.motion.spring), [theme.motion.spring])

  const translateY = useSharedValue(reduceMotion ? 0 : -theme.toast.offscreen)
  const opacity = useSharedValue(reduceMotion ? 0 : 1)

  useEffect(() => {
    if (reduceMotion) {
      opacity.value = withTiming(1, { duration: reduceMotionFade, easing: Easing.linear })
    } else {
      translateY.value = withTiming(0, { duration: toastIn, easing: spring })
    }
  }, [reduceMotion, reduceMotionFade, toastIn, spring, opacity, translateY])

  const style = useAnimatedStyle(() => ({ opacity: opacity.value, transform: [{ translateY: translateY.value }] }))

  return (
    <Animated.View testID="swipe-toast" pointerEvents="none" accessibilityLiveRegion="polite" style={[styles.wrap, style]}>
      <GlassSurface variant="toast" style={styles.pill}>
        <Text style={styles.text}>{message}</Text>
      </GlassSurface>
    </Animated.View>
  )
}

const styles = StyleSheet.create((theme, rt) => ({
  wrap: {
    position: 'absolute',
    top: rt.insets.top + theme.toast.top,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  pill: {
    paddingHorizontal: theme.toast.paddingX,
    paddingVertical: theme.toast.paddingY,
    borderRadius: theme.radius.pill,
  },
  text: {
    ...theme.typography.toast,
    color: theme.colors.texto1,
  },
}))
