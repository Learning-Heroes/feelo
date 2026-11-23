import { Pressable, Text, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { legendItems } from '@/features/discover/discoverCopy'
import type { Direction } from '@/features/discover/swipeMath'

interface SwipeLegendProps {
  onSelect: (direction: Direction) => void
}

// The four swipe directions as buttons: same result as the gesture, for people who can't drag.
export function SwipeLegend({ onSelect }: SwipeLegendProps) {
  return (
    <View testID="swipe-legend" style={styles.row}>
      {legendItems.map((item) => (
        <Pressable
          key={item.direction}
          testID={`legend-${item.direction}`}
          accessibilityRole="button"
          accessibilityLabel={item.label}
          onPress={() => onSelect(item.direction)}
          style={styles.item}
        >
          <Text style={styles.emoji}>{item.emoji}</Text>
          <Text style={styles.label}>{item.label}</Text>
        </Pressable>
      ))}
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: theme.spacing.md,
  },
  item: {
    minWidth: theme.layout.touchTarget,
    minHeight: theme.layout.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
  },
  emoji: { fontSize: theme.legend.emojiSize },
  label: {
    ...theme.typography.legend,
    color: theme.colors.texto3,
  },
}))
