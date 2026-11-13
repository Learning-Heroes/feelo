import Svg, { Rect } from 'react-native-svg'
import { useUnistyles } from 'react-native-unistyles'

import type { TabIconProps } from '@/components/TabIconProps'

// MVP icon: a card with a Noche cut-out (path data stays literal by design).
export function DiscoverIcon({ color }: TabIconProps) {
  const { theme } = useUnistyles()
  const size = theme.tabBar.item.iconSize

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x={3} y={4} width={18} height={16} rx={4} fill={color} />
      <Rect x={7} y={7} width={10} height={10} rx={2} fill={theme.colors.noche} opacity={theme.tabBar.item.cutoutOpacity} />
    </Svg>
  )
}
