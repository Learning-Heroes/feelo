import { useImperativeHandle, useRef, type Ref } from 'react'
import { View } from 'react-native'
import { useReducedMotion } from 'react-native-reanimated'
import { StyleSheet } from 'react-native-unistyles'

import type { DeckCard } from '@/features/discover/useDiscoverDeck'
import { SwipeableClipCard, type SwipeableClipCardHandle } from '@/features/discover/SwipeableClipCard'
import type { Direction } from '@/features/discover/swipeMath'

export interface SwipeDeckHandle {
  /** Swipes the top card as a gesture past the threshold would. */
  fling: (direction: Direction) => void
}

interface SwipeDeckProps {
  cards: readonly DeckCard[]
  exiting: boolean
  onSwipe: (direction: Direction) => void
  ref?: Ref<SwipeDeckHandle>
}

// The cards render bottom-up, keyed by absolute position, so the card that moves from
// slot 1 to slot 0 keeps its instance and animates instead of remounting.
export function SwipeDeck({ cards, exiting, onSwipe, ref }: SwipeDeckProps) {
  const reduceMotion = useReducedMotion()
  const top = useRef<SwipeableClipCardHandle>(null)

  useImperativeHandle(ref, () => ({ fling: (direction) => top.current?.fling(direction) }))

  return (
    <View style={styles.deck}>
      {[...cards].reverse().map((card) => (
        <SwipeableClipCard
          key={card.key}
          ref={card.slot === 0 ? top : undefined}
          cardKey={card.key}
          clip={card.clip}
          slot={card.slot}
          exiting={exiting}
          reduceMotion={reduceMotion}
          onSwipe={onSwipe}
        />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  deck: { flex: 1 },
})
