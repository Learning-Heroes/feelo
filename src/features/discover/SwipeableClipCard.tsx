import { useEffect, useImperativeHandle, useRef, type Ref } from 'react'
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler'
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { scheduleOnRN, scheduleOnUI } from 'react-native-worklets'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { ClipCard } from '@/features/discover/ClipCard'
import { overlayLabels } from '@/features/discover/discoverCopy'
import type { ClipCardData } from '@/features/discover/discoverMock'
import { SwipeOverlay } from '@/features/discover/SwipeOverlay'
import { exitTarget, resolveRelease, type Direction } from '@/features/discover/swipeMath'

const DIRECTIONS: readonly Direction[] = ['right', 'left', 'up', 'down']

export interface SwipeableClipCardHandle {
  /** Runs the same exit as a drag past the threshold, with no displacement. */
  fling: (direction: Direction) => void
}

interface SwipeableClipCardProps {
  /** Absolute deck position, used for test ids. */
  cardKey: number
  clip: ClipCardData
  slot: number
  exiting: boolean
  reduceMotion: boolean
  onSwipe: (direction: Direction) => void
  ref?: Ref<SwipeableClipCardHandle>
}

// Wraps the unchanged ClipCard. The top card (slot 0) owns the Pan, the overlays and the
// accessibility actions; the others only animate between deck slots. The drag runs on the UI
// thread (shared values) and the commit goes back to JS with scheduleOnRN.
export function SwipeableClipCard({ cardKey, clip, slot, exiting, reduceMotion, onSwipe, ref }: SwipeableClipCardProps) {
  const { theme } = useUnistyles()
  const isTop = slot === 0

  const tx = useSharedValue(0)
  const ty = useSharedValue(0)
  const rot = useSharedValue(0)
  const opacity = useSharedValue(1)
  // Set when an exit starts, so a second swipe in the same tick can't redirect the card.
  const locked = useSharedValue(false)

  const slotScale = useSharedValue<number>(theme.deck.slots[slot].scale)
  const slotY = useSharedValue<number>(theme.deck.slots[slot].y)
  const slotOpacity = useSharedValue<number>(theme.deck.slots[slot].opacity)

  const { duration } = theme.motion
  const spring = Easing.bezier(...theme.motion.spring)
  const exitEasing = Easing.bezier(...theme.motion.exit)
  const { dragRotate } = theme.swipe

  // Deck shift: the card keeps its instance and animates to its new slot.
  const appliedSlot = useRef(slot)
  useEffect(() => {
    if (appliedSlot.current === slot) return
    appliedSlot.current = slot
    const target = theme.deck.slots[slot]
    if (reduceMotion) {
      slotScale.value = target.scale
      slotY.value = target.y
      slotOpacity.value = target.opacity
      return
    }
    const timing = { duration: duration.deckShift, easing: spring }
    slotScale.value = withTiming(target.scale, timing)
    slotY.value = withTiming(target.y, timing)
    slotOpacity.value = withTiming(target.opacity, timing)
  }, [slot, reduceMotion, theme, duration.deckShift, spring, slotScale, slotY, slotOpacity])

  // Check and lock in one step on the UI thread: a JS-side write to `locked` lands late, so a
  // legend press racing a drag release could otherwise start two exits.
  function exit(direction: Direction, dx: number, dy: number) {
    'worklet'
    if (locked.value) return
    locked.value = true
    if (reduceMotion) {
      opacity.value = withTiming(0, { duration: duration.reduceMotionFade, easing: Easing.linear })
    } else {
      const target = exitTarget(direction, dx, dy)
      const timing = { duration: duration.swipeExit, easing: exitEasing }
      tx.value = withTiming(target.x, timing)
      ty.value = withTiming(target.y, timing)
      rot.value = withTiming(target.rotate, timing)
      opacity.value = withTiming(0, timing)
    }
    scheduleOnRN(onSwipe, direction)
  }

  function follow(dx: number, dy: number) {
    'worklet'
    if (locked.value) return
    tx.value = dx
    ty.value = dy
    rot.value = dx * dragRotate
  }

  function springBack() {
    'worklet'
    if (reduceMotion) {
      tx.value = 0
      ty.value = 0
      rot.value = 0
      return
    }
    const timing = { duration: duration.swipeReturn, easing: spring }
    tx.value = withTiming(0, timing)
    ty.value = withTiming(0, timing)
    rot.value = withTiming(0, timing)
  }

  useImperativeHandle(ref, () => ({
    fling: (direction) => {
      if (!isTop || exiting) return
      scheduleOnUI(exit, direction, 0, 0)
    },
  }))

  const pan = usePanGesture({
    testID: `swipe-card-${cardKey}`,
    enabled: isTop && !exiting,
    onUpdate: (event) => {
      'worklet'
      follow(event.translationX, event.translationY)
    },
    onDeactivate: (event) => {
      'worklet'
      if (locked.value) return
      const direction = event.canceled ? null : resolveRelease(tx.value, ty.value)
      if (direction === null) springBack()
      else exit(direction, tx.value, ty.value)
    },
  })

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value * slotOpacity.value,
    transform: [
      { translateX: tx.value },
      { translateY: ty.value + slotY.value },
      { scale: slotScale.value },
      { rotate: `${rot.value}deg` },
    ],
  }))

  const topProps = isTop
    ? {
        accessible: true,
        accessibilityLabel: clip.title,
        accessibilityActions: DIRECTIONS.map((direction) => ({ name: overlayLabels[direction], label: overlayLabels[direction] })),
        onAccessibilityAction: (event: { nativeEvent: { actionName: string } }) => {
          const direction = DIRECTIONS.find((candidate) => overlayLabels[candidate] === event.nativeEvent.actionName)
          if (direction && !exiting) scheduleOnUI(exit, direction, 0, 0)
        },
      }
    : { accessibilityElementsHidden: true, importantForAccessibility: 'no-hide-descendants' as const }

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        testID={`deck-card-${cardKey}`}
        pointerEvents={isTop ? 'auto' : 'none'}
        style={[styles.card, style]}
        {...topProps}
      >
        <ClipCard clip={clip} />
        {isTop && DIRECTIONS.map((direction) => <SwipeOverlay key={direction} direction={direction} tx={tx} ty={ty} />)}
      </Animated.View>
    </GestureDetector>
  )
}

const styles = StyleSheet.create({
  card: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
