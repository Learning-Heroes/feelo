import { useRef } from 'react'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { DiscoverHeader } from '@/features/discover/DiscoverHeader'
import { SwipeDeck, type SwipeDeckHandle } from '@/features/discover/SwipeDeck'
import { SwipeLegend } from '@/features/discover/SwipeLegend'
import { SwipeToast } from '@/features/discover/SwipeToast'
import { useDiscoverDeck } from '@/features/discover/useDiscoverDeck'

// The tab layout already reserves the floating tab bar's height below this screen.
export function DiscoverScreen() {
  const { cards, requestSwipe, rated, toast, exiting } = useDiscoverDeck()
  const deck = useRef<SwipeDeckHandle>(null)

  return (
    <View style={styles.screen}>
      <DiscoverHeader rated={rated} />
      <SwipeDeck ref={deck} cards={cards} exiting={exiting} onSwipe={requestSwipe} />
      <SwipeLegend onSelect={(direction) => deck.current?.fling(direction)} />
      <SwipeToast toast={toast} />
    </View>
  )
}

const styles = StyleSheet.create((theme, rt) => ({
  screen: {
    flex: 1,
    paddingTop: rt.insets.top,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.noche,
  },
}))
