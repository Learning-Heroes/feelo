import Svg, { Path } from 'react-native-svg'
import { useUnistyles } from 'react-native-unistyles'

import type { TabIconProps } from '@/components/TabIconProps'

// MVP icon: four-point sparkle.
export function SuggestIcon({ color }: TabIconProps) {
  const { theme } = useUnistyles()
  const size = theme.tabBar.item.iconSize

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 2.5l2.2 6.3 6.3 2.2-6.3 2.2L12 19.5l-2.2-6.3-6.3-2.2 6.3-2.2z" fill={color} />
    </Svg>
  )
}
