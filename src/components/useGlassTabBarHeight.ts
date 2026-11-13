import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useUnistyles } from 'react-native-unistyles'

export interface GlassTabBarHeight {
  /** Bottom padding of the bar's wrapper: max(bottom inset, wrapMinBottom). */
  bottomPadding: number
  /** Space the floating bar covers at the bottom of the screen. */
  total: number
}

export function useGlassTabBarHeight(): GlassTabBarHeight {
  const { theme } = useUnistyles()
  const insets = useSafeAreaInsets()
  const bottomPadding = Math.max(insets.bottom, theme.tabBar.wrapMinBottom)

  return { bottomPadding, total: theme.tabBar.wrapTop + theme.tabBar.height + bottomPadding }
}
