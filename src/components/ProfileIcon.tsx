import Svg, { Circle, Path } from 'react-native-svg'
import { useUnistyles } from 'react-native-unistyles'

import type { TabIconProps } from '@/components/TabIconProps'

// MVP icon: head and shoulders.
export function ProfileIcon({ color }: TabIconProps) {
  const { theme } = useUnistyles()
  const size = theme.tabBar.item.iconSize

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={8} r={4.5} fill={color} />
      <Path d="M3.5 21a8.5 8.5 0 0 1 17 0z" fill={color} />
    </Svg>
  )
}
