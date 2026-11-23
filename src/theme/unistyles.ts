import { StyleSheet } from 'react-native-unistyles'

import {
  colors,
  counter,
  deck,
  discoverHeader,
  fonts,
  glass,
  layout,
  legend,
  motion,
  overlay,
  radius,
  spacing,
  swipe,
  tabBar,
  toast,
  typography,
  wordmark,
} from './tokens'

const dark = {
  colors,
  counter,
  deck,
  discoverHeader,
  fonts,
  glass,
  layout,
  legend,
  motion,
  overlay,
  radius,
  spacing,
  swipe,
  tabBar,
  toast,
  typography,
  wordmark,
} as const

type AppThemes = { dark: typeof dark }

declare module 'react-native-unistyles' {
  // Module augmentation needs an interface; it gets its members from AppThemes.
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface UnistylesThemes extends AppThemes {}
}

StyleSheet.configure({
  themes: { dark },
  settings: { initialTheme: 'dark' },
})
