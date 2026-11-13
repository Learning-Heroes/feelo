// Stand-in for react-native-reanimated under Jest. The package's own mock imports the real
// entry point, which can't initialise here (pnpm + worklets), so package.json maps
// `react-native-reanimated/mock` to this file and jest.setup.tsx mocks the package with it.
// Animations resolve to their target at once: tests assert targets and timing configs.
import { Text, View } from 'react-native'

const identity = <T,>(value: T) => value

const Animated = { View, Text, createAnimatedComponent: identity, call: () => {} }

export default Animated
export const Easing = { bezier: () => identity, linear: identity }
// Gesture Handler probes these when Reanimated is installed.
export const isSharedValue = () => false
export const setGestureState = () => {}
export const useComposedEventHandler =
  <E,>(handlers: (((event: E) => void) | null)[]) =>
  (event: E) =>
    handlers.forEach((handler) => handler?.(event))
export const useAnimatedStyle = <T,>(updater: () => T) => updater()
export const useReducedMotion = () => false
export const useSharedValue = <T,>(value: T) => ({ value })
export const withTiming = identity
