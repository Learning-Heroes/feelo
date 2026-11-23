import { useCallback, useEffect, useReducer, useRef } from 'react'

import { discoverDeck, type ClipCardData } from '@/features/discover/discoverMock'
import { toastMessages } from '@/features/discover/discoverCopy'
import type { Direction } from '@/features/discover/swipeMath'
import { motion, swipe } from '@/theme/tokens'

const VISIBLE_CARDS = 3

export interface DeckCard {
  /** Absolute deck position: stable while a card moves between slots. */
  key: number
  clip: ClipCardData
  slot: number
}

interface DeckToast {
  message: string
  id: number
}

interface DeckState {
  pos: number
  rated: number
  toast: DeckToast | null
  exiting: boolean
}

type DeckAction =
  | { type: 'swipe'; direction: Direction; toastId: number }
  | { type: 'advance' }
  | { type: 'hideToast' }

const initialState: DeckState = { pos: 0, rated: 0, toast: null, exiting: false }

function reducer(state: DeckState, action: DeckAction): DeckState {
  switch (action.type) {
    case 'swipe':
      if (state.exiting) return state
      return {
        ...state,
        exiting: true,
        rated: action.direction === 'down' ? state.rated : state.rated + 1,
        toast: { message: toastMessages[action.direction], id: action.toastId },
      }
    case 'advance':
      return { ...state, pos: state.pos + 1, exiting: false }
    case 'hideToast':
      return { ...state, toast: null }
  }
}

export function useDiscoverDeck(deck: readonly ClipCardData[] = discoverDeck) {
  const [state, dispatch] = useReducer(reducer, initialState)
  // Mirrors `state.exiting` so two calls in the same tick can't both pass the guard.
  const exitingRef = useRef(false)
  const toastId = useRef(0)
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(
    () => () => {
      clearTimeout(advanceTimer.current)
      clearTimeout(toastTimer.current)
    },
    [],
  )

  const requestSwipe = useCallback((direction: Direction) => {
    if (exitingRef.current) return
    exitingRef.current = true
    toastId.current += 1
    dispatch({ type: 'swipe', direction, toastId: toastId.current })

    advanceTimer.current = setTimeout(() => {
      exitingRef.current = false
      dispatch({ type: 'advance' })
    }, swipe.advanceDelay)

    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => dispatch({ type: 'hideToast' }), motion.duration.toastVisible)
  }, [])

  const cards: DeckCard[] = Array.from({ length: VISIBLE_CARDS }, (_, k) => ({
    key: state.pos + k,
    clip: deck[(state.pos + k) % deck.length],
    slot: k,
  }))

  return { cards, requestSwipe, rated: state.rated, toast: state.toast, exiting: state.exiting }
}
