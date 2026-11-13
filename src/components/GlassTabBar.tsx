import type { BottomTabBarProps } from 'expo-router/js-tabs'
import { LinearGradient } from 'expo-linear-gradient'
import { useEffect, useRef, useState } from 'react'
import { type LayoutChangeEvent, View } from 'react-native'
import { GestureDetector, useCompetingGestures, usePanGesture, useTapGesture } from 'react-native-gesture-handler'
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { GlassSurface } from '@/components/GlassSurface'
import { useGlassTabBarHeight } from '@/components/useGlassTabBarHeight'

type Phase = 'idle' | 'pressed' | 'dragging'

/** Tab index under x (relative to the bar), clamped to the first and last tab. */
function indexAt(x: number, width: number, count: number) {
  if (width <= 0) return 0
  return Math.min(Math.max(Math.floor((x / width) * count), 0), count - 1)
}

// Floating glass tab bar (Brand book §10). A Pan handles hold & drag: press scales the bar,
// moving previews the tab under the finger, releasing navigates. A Pan never activates for a
// finger that doesn't move, so a Tap competes with it to cover the still touch: whichever
// activates first wins, and the loser finalises as canceled (no double navigation).
export function GlassTabBar({ state, descriptors, emitter, navigateToTab }: BottomTabBarProps) {
  const { theme } = useUnistyles()
  const reduceMotion = useReducedMotion()
  const { bottomPadding } = useGlassTabBarHeight()
  const count = state.routes.length

  const [width, setWidth] = useState(0)
  const [phase, setPhase] = useState<Phase>('idle')
  const [previewIndex, setPreviewIndex] = useState(state.index)

  // Gesture events arrive faster than renders, so the gesture keeps its own copy of
  // the values it reads; it is written only from event handlers and effects.
  const live = useRef({ width: 0, phase: 'idle' as Phase, previewIndex: state.index, activeIndex: state.index })

  // Navigation moved (tap, release or programmatic): the indicator follows the active tab.
  useEffect(() => {
    live.current.activeIndex = state.index
    if (live.current.phase === 'idle') updatePreview(state.index)
  }, [state.index])

  function updatePhase(next: Phase) {
    live.current.phase = next
    setPhase(next)
  }

  function updatePreview(index: number) {
    live.current.previewIndex = index
    setPreviewIndex(index)
  }

  function select(index: number) {
    const route = state.routes[index]
    if (!route || index === live.current.activeIndex) return

    const event = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true })
    if (!event.defaultPrevented) navigateToTab(route.key)
  }

  function preview(x: number) {
    const index = indexAt(x, live.current.width, count)
    if (index !== live.current.previewIndex) updatePreview(index)
    return index
  }

  const pan = usePanGesture({
    testID: 'glass-tab-bar-pan',
    minDistance: 0,
    runOnJS: true,
    onBegin: () => updatePhase('pressed'),
    onUpdate: (event) => {
      if (live.current.phase !== 'dragging') updatePhase('dragging')
      preview(event.x)
    },
    onFinalize: (event) => {
      updatePhase('idle')
      if (event.canceled) {
        updatePreview(live.current.activeIndex)
        return
      }
      select(preview(event.x))
    },
  })

  const tap = useTapGesture({
    testID: 'glass-tab-bar-tap',
    runOnJS: true,
    // Holding still before releasing is still a tap (the MVP navigates on any pointerup).
    maxDuration: theme.tabBar.tapMaxDuration,
    onActivate: (event) => select(indexAt(event.x, live.current.width, count)),
  })

  const gesture = useCompetingGestures(pan, tap)

  const spring = Easing.bezier(...theme.motion.spring)
  const { duration } = theme.motion
  const slot = width / Math.max(count, 1)
  const indicatorLeft = previewIndex * slot + theme.tabBar.indicator.offset

  const targetScale = reduceMotion
    ? 1
    : phase === 'pressed'
      ? theme.tabBar.scalePressed
      : phase === 'dragging'
        ? theme.tabBar.scaleDragging
        : 1

  const barStyle = useAnimatedStyle(
    () => ({
      transform: [{ scale: withTiming(targetScale, { duration: duration.press, easing: spring }) }],
    }),
    [targetScale],
  )

  // Reduce Motion: the indicator jumps to its slot and fades in instead of sliding.
  const indicatorOpacity = useSharedValue(1)
  useEffect(() => {
    if (!reduceMotion) return
    indicatorOpacity.value = 0
    indicatorOpacity.value = withTiming(1, { duration: duration.reduceMotionFade, easing: Easing.linear })
  }, [previewIndex, reduceMotion, indicatorOpacity, duration.reduceMotionFade])

  const indicatorStyle = useAnimatedStyle(
    () => ({
      left: reduceMotion
        ? indicatorLeft
        : phase === 'dragging'
          ? withTiming(indicatorLeft, { duration: duration.indicatorDrag, easing: Easing.linear })
          : withTiming(indicatorLeft, { duration: duration.indicatorTap, easing: spring }),
      opacity: indicatorOpacity.value,
    }),
    [indicatorLeft, phase, reduceMotion],
  )

  function onLayout(event: LayoutChangeEvent) {
    live.current.width = event.nativeEvent.layout.width
    setWidth(event.nativeEvent.layout.width)
  }

  return (
    <View testID="glass-tab-bar-wrap" style={[styles.wrap, { paddingBottom: bottomPadding }]} pointerEvents="box-none">
      <GestureDetector gesture={gesture}>
        <Animated.View testID="glass-tab-bar" accessibilityRole="tablist" style={[styles.shadow, barStyle]} onLayout={onLayout}>
          <GlassSurface variant="bar" style={styles.bar}>
            {width > 0 ? (
              <Animated.View
                testID="glass-tab-bar-indicator"
                pointerEvents="none"
                style={[styles.indicator, { width: slot - theme.tabBar.indicator.shrink }, indicatorStyle]}
              >
                <LinearGradient colors={theme.tabBar.indicator.gradient} style={StyleSheet.absoluteFill} />
              </Animated.View>
            ) : null}
            {state.routes.map((route, index) => {
              const options = descriptors[route.key]?.options
              const label = typeof options?.title === 'string' ? options.title : route.name
              return (
                <TabItem
                  key={route.key}
                  name={route.name}
                  label={label}
                  selected={index === state.index}
                  highlighted={index === previewIndex}
                  reduceMotion={reduceMotion}
                  renderIcon={(color) => options?.tabBarIcon?.({ focused: index === state.index, color, size: theme.tabBar.item.iconSize })}
                  onActivate={() => select(index)}
                />
              )
            })}
          </GlassSurface>
        </Animated.View>
      </GestureDetector>
    </View>
  )
}

interface TabItemProps {
  name: string
  label: string
  /** The navigator's active tab (what assistive tech reports). */
  selected: boolean
  /** The tab shown as active right now, which follows the finger during a drag. */
  highlighted: boolean
  reduceMotion: boolean
  renderIcon: (color: string) => React.ReactNode
  onActivate: () => void
}

function TabItem({ name, label, selected, highlighted, reduceMotion, renderIcon, onActivate }: TabItemProps) {
  const { theme } = useUnistyles()
  const { duration, spring } = theme.motion
  const { item } = theme.tabBar

  const colorTiming = { duration: duration.itemColor }
  const iconTiming = { duration: duration.itemIcon, easing: Easing.bezier(...spring) }
  const iconScale = highlighted && !reduceMotion ? item.iconActiveScale : 1
  const iconLift = highlighted ? item.iconActiveLift : 0

  const labelStyle = useAnimatedStyle(
    () => ({ color: withTiming(highlighted ? theme.colors.lavanda : theme.colors.texto3, colorTiming) }),
    [highlighted],
  )
  // Two stacked icons cross-fade so the SVG colour change is animated like the label's.
  const activeIconStyle = useAnimatedStyle(() => ({ opacity: withTiming(highlighted ? 1 : 0, colorTiming) }), [highlighted])
  const iconStyle = useAnimatedStyle(
    () => ({
      transform: [{ translateY: withTiming(iconLift, iconTiming) }, { scale: withTiming(iconScale, iconTiming) }],
    }),
    [iconLift, iconScale],
  )

  return (
    <View
      testID={`glass-tab-${name}`}
      accessible
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      accessibilityActions={[{ name: 'activate' }]}
      onAccessibilityAction={(event) => {
        if (event.nativeEvent.actionName === 'activate') onActivate()
      }}
      style={styles.item}
    >
      <Animated.View testID={`glass-tab-icon-${name}`} style={[styles.icon, iconStyle]}>
        <View testID={`icon-${name}-inactive`}>{renderIcon(theme.colors.texto3)}</View>
        <Animated.View testID={`icon-${name}-active`} style={[StyleSheet.absoluteFill, activeIconStyle]}>
          {renderIcon(theme.colors.lavanda)}
        </Animated.View>
      </Animated.View>
      <Animated.Text testID={`glass-tab-label-${name}`} style={[styles.label, labelStyle]} numberOfLines={1}>
        {label}
      </Animated.Text>
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: theme.tabBar.wrapTop,
    paddingHorizontal: theme.tabBar.wrapSide,
  },
  shadow: {
    borderRadius: theme.radius.pill,
    boxShadow: [
      {
        offsetX: 0,
        offsetY: theme.tabBar.shadow.offsetY,
        blurRadius: theme.tabBar.shadow.blur,
        color: theme.tabBar.shadow.color,
      },
    ],
  },
  bar: {
    height: theme.tabBar.height,
    borderRadius: theme.radius.pill,
    flexDirection: 'row',
  },
  indicator: {
    position: 'absolute',
    top: theme.tabBar.indicator.inset,
    bottom: theme.tabBar.indicator.inset,
    borderRadius: theme.radius.pill,
    borderWidth: theme.glass.borderWidth,
    borderColor: theme.tabBar.indicator.border,
    overflow: 'hidden',
    boxShadow: [
      {
        offsetX: 0,
        offsetY: theme.tabBar.indicator.glow.offsetY,
        blurRadius: theme.tabBar.indicator.glow.blur,
        color: theme.tabBar.indicator.glow.color,
      },
      { inset: true, offsetX: 0, offsetY: theme.glass.borderWidth, color: theme.tabBar.indicator.highlight },
    ],
  },
  item: {
    flex: 1,
    minWidth: theme.layout.touchTarget,
    minHeight: theme.layout.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.tabBar.item.gap,
  },
  icon: {
    width: theme.tabBar.item.iconSize,
    height: theme.tabBar.item.iconSize,
  },
  label: {
    ...theme.typography.tabLabel,
  },
}))
