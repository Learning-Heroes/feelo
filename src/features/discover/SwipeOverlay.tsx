import { Text, View } from 'react-native'
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { GlassSurface } from '@/components/GlassSurface'
import { overlayLabels } from '@/features/discover/discoverCopy'
import { overlayOpacity, type Direction } from '@/features/discover/swipeMath'

type Anchor = 'left' | 'right' | 'top' | 'bottom'

const GLASS_VARIANT = {
  right: 'overlayRight',
  left: 'overlayLeft',
  up: 'overlayUp',
  down: 'overlayDown',
} as const

interface SwipeOverlayProps {
  direction: Direction
  tx: SharedValue<number>
  ty: SharedValue<number>
}

// One reaction pill. Only the dominant direction's overlay is visible while dragging; its
// opacity comes from the drag, so it follows the finger without re-rendering.
export function SwipeOverlay({ direction, tx, ty }: SwipeOverlayProps) {
  const { theme } = useUnistyles()
  const tokens = theme.overlay[direction]

  const style = useAnimatedStyle(() => ({ opacity: overlayOpacity(direction, tx.value, ty.value) }))

  return (
    <Animated.View
      testID={`swipe-overlay-${direction}`}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.container(tokens.anchor, tokens.offset), style]}
    >
      <View testID={`swipe-overlay-pill-${direction}`} style={{ transform: [{ rotate: `${tokens.rotate}deg` }] }}>
        <GlassSurface variant={GLASS_VARIANT[direction]} style={styles.pill(tokens.color)}>
          <Text style={[styles.label, { color: tokens.color }]}>{overlayLabels[direction]}</Text>
        </GlassSurface>
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create((theme) => ({
  container: (anchor: Anchor, offset: number) => ({
    ...StyleSheet.absoluteFillObject,
    justifyContent: anchor === 'bottom' ? 'flex-end' : anchor === 'top' ? 'flex-start' : 'center',
    alignItems: anchor === 'left' ? 'flex-start' : anchor === 'right' ? 'flex-end' : 'center',
    ...(anchor === 'left' && { paddingLeft: offset }),
    ...(anchor === 'right' && { paddingRight: offset }),
    ...(anchor === 'top' && { paddingTop: offset }),
    ...(anchor === 'bottom' && { paddingBottom: offset }),
  }),
  pill: (color: string) => ({
    paddingHorizontal: theme.overlay.paddingX,
    paddingVertical: theme.overlay.paddingY,
    borderRadius: theme.radius.pill,
    borderWidth: theme.overlay.borderWidth,
    borderColor: color,
  }),
  label: { ...theme.typography.overlay },
}))
