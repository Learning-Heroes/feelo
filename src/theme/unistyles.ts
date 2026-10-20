import { StyleSheet } from 'react-native-unistyles'

import { colors, fonts, layout, radius, spacing, typography } from './tokens'

const dark = { colors, fonts, layout, radius, spacing, typography } as const

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
