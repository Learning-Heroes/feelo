// Gesture Handler setup for fireGestureHandler.
import 'react-native-gesture-handler/jestSetup'

// Native storage modules have no JS implementation under Jest: in-memory stand-ins.
jest.mock('@react-native-async-storage/async-storage', () =>
  jest.requireActual('@react-native-async-storage/async-storage/jest/async-storage-mock'),
)

jest.mock('expo-secure-store', () => {
  const store = new Map<string, string>()
  return {
    getItemAsync: jest.fn(async (key: string) => store.get(key) ?? null),
    setItemAsync: jest.fn(async (key: string, value: string) => {
      store.set(key, value)
    }),
    deleteItemAsync: jest.fn(async (key: string) => {
      store.delete(key)
    }),
  }
})

// Reanimated can't initialise under Jest here: see jest/reanimatedMock.tsx.
jest.mock('react-native-worklets', () =>
  jest.requireActual('react-native-worklets/lib/module/mock'),
)
jest.mock('react-native-reanimated', () => jest.requireActual('react-native-reanimated/mock'))

// Native glass, blur and gradient views: plain host Views tagged by type so tests can tell them apart.
jest.mock('expo-glass-effect', () => {
  const { View } = jest.requireActual<typeof import('react-native')>('react-native')
  return {
    GlassView: (props: object) => <View {...props} testID="GlassView" />,
    isLiquidGlassAvailable: jest.fn(() => false),
  }
})
jest.mock('expo-blur', () => {
  const { View } = jest.requireActual<typeof import('react-native')>('react-native')
  return { BlurView: (props: object) => <View {...props} testID="BlurView" /> }
})
jest.mock('expo-linear-gradient', () => {
  const { View } = jest.requireActual<typeof import('react-native')>('react-native')
  return { LinearGradient: (props: object) => <View {...props} testID="LinearGradient" /> }
})
