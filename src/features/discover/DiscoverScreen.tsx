import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { ClipCard } from '@/features/discover/ClipCard'
import { discoverMock } from '@/features/discover/discoverMock'

export function DiscoverScreen() {
  return (
    <View style={styles.screen}>
      <ClipCard clip={discoverMock} />
    </View>
  )
}

const styles = StyleSheet.create((theme, rt) => ({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: rt.insets.top,
    paddingBottom: rt.insets.bottom,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.noche,
  },
}))
