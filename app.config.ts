import type { ExpoConfig } from 'expo/config'

// Native config can't import app code: keep in sync with NOCHE in src/theme/tokens.ts.
const NOCHE = '#0A0A10'

const config: ExpoConfig = {
  name: 'Feelo',
  slug: 'feelo',
  scheme: 'feelo',
  version: '0.1.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'dark',
  backgroundColor: NOCHE,
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'com.learningheroes.feelo',
  },
  android: {
    package: 'com.learningheroes.feelo',
    adaptiveIcon: {
      backgroundColor: NOCHE,
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
  },
  plugins: ['expo-router', 'expo-font'],
  experiments: {
    typedRoutes: true,
  },
}

export default config
