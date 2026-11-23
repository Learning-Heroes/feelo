// Stand-in for react-native-reanimated under Jest. The package's own mock imports the real
// entry point, which can't initialise here (pnpm + worklets), so package.json maps
// `react-native-reanimated/mock` to this file and jest.setup.tsx mocks the package with it.
// Animations resolve to their target at once: tests assert targets and timing configs.
import { useReducer, useState } from 'react'
import { Text, View } from 'react-native'

const identity = <T,>(value: T) => value

const Animated = { View, Text, createAnimatedComponent: identity, call: () => {} }

export default Animated
// Like the real one, bezier() returns a new function per call (it can't be a stable dependency).
export const Easing = { bezier: () => (t: number) => t, linear: identity }
// Gesture Handler probes these when Reanimated is installed.
export const isSharedValue = () => false
export const setGestureState = () => {}
export const useComposedEventHandler =
  <E,>(handlers: (((event: E) => void) | null)[]) =>
  (event: E) =>
    handlers.forEach((handler) => handler?.(event))
export const useAnimatedStyle = <T,>(updater: () => T) => updater()
export const useReducedMotion = () => false
// Stable across renders; assigning `.value` re-renders the owner so useAnimatedStyle re-reads it.
export const useSharedValue = <T,>(initial: T) => {
  const [, tick] = useReducer((count: number) => count + 1, 0)
  const [shared] = useState(() => {
    let current = initial
    return {
      get value() {
        return current
      },
      set value(next: T) {
        current = next
        tick()
      },
    }
  })
  return shared
}
export const cancelAnimation = () => {}
export const withTiming = identity
