import { Text, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { Wordmark } from '@/components/Wordmark'
import { ratedLabel } from '@/features/discover/discoverCopy'

interface DiscoverHeaderProps {
  rated: number
}

export function DiscoverHeader({ rated }: DiscoverHeaderProps) {
  return (
    <View testID="discover-header" style={styles.header}>
      <Wordmark />
      <View testID="rated-counter" style={styles.counter}>
        <Text style={styles.counterText}>{ratedLabel(rated)}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: theme.discoverHeader.padding.top,
    paddingHorizontal: theme.discoverHeader.padding.x,
    paddingBottom: theme.discoverHeader.padding.bottom,
  },
  counter: {
    paddingHorizontal: theme.counter.paddingX,
    paddingVertical: theme.counter.paddingY,
    borderRadius: theme.radius.pill,
    borderWidth: theme.glass.borderWidth,
    borderColor: theme.colors.violetaBorder,
    backgroundColor: theme.colors.violetaDim,
  },
  counterText: {
    ...theme.typography.counter,
    color: theme.colors.lavanda,
  },
}))
