import { act, fireEvent, render, screen, within } from '@testing-library/react-native'
import { StyleSheet, Text } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { createGestureController } from 'react-native-gesture-handler/jest-utils'

import { overlayLabels } from '@/features/discover/discoverCopy'
import { discoverDeck } from '@/features/discover/discoverMock'
import { SwipeDeck } from '@/features/discover/SwipeDeck'
import { useDiscoverDeck } from '@/features/discover/useDiscoverDeck'
import type { Direction } from '@/features/discover/swipeMath'
import { deck, glass, motion, overlay } from '@/theme/tokens'

type ReanimatedModule = typeof import('react-native-reanimated')
const Reanimated = jest.requireMock<ReanimatedModule>('react-native-reanimated')

function Harness() {
  const state = useDiscoverDeck()
  return (
    <GestureHandlerRootView>
      <SwipeDeck cards={state.cards} exiting={state.exiting} onSwipe={state.requestSwipe} />
      <Text testID="rated">{state.rated}</Text>
      <Text testID="toast">{state.toast?.message ?? ''}</Text>
    </GestureHandlerRootView>
  )
}

const DIRECTIONS: Direction[] = ['right', 'left', 'up', 'down']
const hidden = { includeHiddenElements: true }

const cardStyle = (key: number) => StyleSheet.flatten(screen.getByTestId(`deck-card-${key}`, hidden).props.style)
const transformOf = (key: number) =>
  Object.assign({}, ...(cardStyle(key).transform as Record<string, number | string>[]))
const overlayOpacity = (direction: Direction) =>
  StyleSheet.flatten(screen.getByTestId(`swipe-overlay-${direction}`, hidden).props.style).opacity
const rated = () => screen.getByTestId('rated').children.join('')

async function drag(key: number, dx: number, dy: number, finish: 'end' | 'cancel' | 'none' = 'end') {
  const controller = createGestureController(`swipe-card-${key}`)
  await act(async () => {
    controller.begin({ translationX: 0, translationY: 0 })
    controller.activate({ translationX: 0, translationY: 0 })
    controller.update({ translationX: dx, translationY: dy })
    if (finish === 'end') controller.end({ translationX: dx, translationY: dy })
    if (finish === 'cancel') controller.cancel({ translationX: dx, translationY: dy })
  })
  // The worklets mock queues scheduleOnRN callbacks as microtasks.
  await act(async () => {})
}

// The worklets mock delivers scheduleOnRN through queueMicrotask, which must keep running.
beforeEach(() => jest.useFakeTimers({ doNotFake: ['queueMicrotask'] }))
afterEach(() => {
  jest.restoreAllMocks()
  jest.useRealTimers()
})

describe('SwipeDeck', () => {
  it('arrastre_mueve_y_gira_la_card', async () => {
    await render(<Harness />)

    await drag(0, 50, 10, 'none')

    expect(transformOf(0)).toMatchObject({ translateX: 50, translateY: 10, rotate: '2.5deg' })
  })

  it('overlay_derecha_visible_al_arrastrar', async () => {
    await render(<Harness />)

    await drag(0, 45, 0, 'none')

    expect(overlayOpacity('right')).toBeCloseTo(0.5)
    for (const other of ['left', 'up', 'down'] as const) expect(overlayOpacity(other)).toBe(0)
  })

  it('sin_overlay_por_debajo_de_20', async () => {
    await render(<Harness />)

    await drag(0, 15, 0, 'none')

    for (const direction of DIRECTIONS) expect(overlayOpacity(direction)).toBe(0)
  })

  it('overlay_satura_en_1', async () => {
    await render(<Harness />)

    await drag(0, 200, 0, 'none')

    expect(overlayOpacity('right')).toBe(1)
  })

  it.each(DIRECTIONS)('overlay %s usa etiqueta, color, posicion y rotacion de los tokens', async (direction) => {
    await render(<Harness />)
    const tokens = overlay[direction]
    const key = `overlay${direction[0].toUpperCase()}${direction.slice(1)}` as 'overlayRight'

    const view = screen.getByTestId(`swipe-overlay-${direction}`, hidden)
    const label = within(view).getByText(overlayLabels[direction], hidden)
    expect(StyleSheet.flatten(label.props.style)).toMatchObject({ color: tokens.color, fontFamily: 'Sora_800ExtraBold', fontSize: 16 })
    const pill = within(view).getByTestId(`swipe-overlay-pill-${direction}`, hidden)
    expect(StyleSheet.flatten(pill.props.style).transform).toEqual([{ rotate: `${tokens.rotate}deg` }])
    const glassStyle = StyleSheet.flatten(within(view).getByTestId('BlurView', hidden).props.style)
    expect(glassStyle).toMatchObject({ borderWidth: overlay.borderWidth, borderColor: tokens.color })
    expect(glass[key].tint).toBe(tokens.background)
    const container = StyleSheet.flatten(view.props.style)
    const padding = { left: 'paddingLeft', right: 'paddingRight', top: 'paddingTop', bottom: 'paddingBottom' }[tokens.anchor]
    expect(container).toMatchObject({ [padding]: tokens.offset })
  })

  it('overlays_ocultos_para_accesibilidad', async () => {
    await render(<Harness />)

    expect(screen.getByTestId('swipe-overlay-right', hidden)).toHaveProp('importantForAccessibility', 'no-hide-descendants')
  })

  it('mazo_muestra_tres_cards_apiladas', async () => {
    await render(<Harness />)

    expect(screen.getAllByTestId(/^deck-card-/, hidden)).toHaveLength(3)
    expect(transformOf(0)).toMatchObject({ scale: 1 })
    expect(transformOf(1)).toMatchObject({ scale: deck.slots[1].scale, translateY: deck.slots[1].y })
    expect(cardStyle(1).opacity).toBe(deck.slots[1].opacity)
    expect(transformOf(2)).toMatchObject({ scale: deck.slots[2].scale, translateY: deck.slots[2].y })
    expect(cardStyle(2).opacity).toBe(deck.slots[2].opacity)
  })

  it('cards_de_debajo_no_responden', async () => {
    await render(<Harness />)

    await drag(1, 150, 0)

    expect(transformOf(1)).toMatchObject({ translateX: 0 })
    expect(rated()).toBe('0')
    expect(screen.getByTestId('toast').children).toHaveLength(0)
    expect(screen.getByTestId('deck-card-1', hidden)).toHaveProp('pointerEvents', 'none')
  })

  it('justo_en_el_umbral_no_cuenta', async () => {
    await render(<Harness />)

    await drag(0, 90, 0)

    expect(transformOf(0)).toMatchObject({ translateX: 0 })
    expect(rated()).toBe('0')
    expect(screen.getByTestId('toast').children).toHaveLength(0)
  })

  it('sin_umbral_vuelve_y_no_registra', async () => {
    const withTiming = jest.spyOn(Reanimated, 'withTiming')
    await render(<Harness />)

    await drag(0, 60, 0)

    expect(withTiming).toHaveBeenCalledWith(0, expect.objectContaining({ duration: motion.duration.swipeReturn }))
    expect(transformOf(0)).toMatchObject({ translateX: 0, translateY: 0, rotate: '0deg' })
    for (const direction of DIRECTIONS) expect(overlayOpacity(direction)).toBe(0)
    expect(rated()).toBe('0')
  })

  it('gesto_cancelado_no_registra', async () => {
    await render(<Harness />)

    await drag(0, 150, 0, 'cancel')

    expect(transformOf(0)).toMatchObject({ translateX: 0, translateY: 0 })
    expect(rated()).toBe('0')
    expect(screen.getByTestId('toast').children).toHaveLength(0)
  })

  it.each([
    ['right', 120, 0, 600, 0, 36],
    ['left', -120, 0, -600, 0, -36],
    ['up', 0, -120, 0, -800, 0],
    ['down', 0, 120, 0, 800, 0],
  ] as const)('swipe_%s_sale_a_su_destino_en_500ms', async (_direction, dx, dy, x, y, rotate) => {
    // Spies go in before render: worklets capture their closure when they are created.
    const withTiming = jest.spyOn(Reanimated, 'withTiming')
    const bezier = jest.spyOn(Reanimated.Easing, 'bezier')
    await render(<Harness />)

    await drag(0, dx, dy)

    const exit = expect.objectContaining({ duration: motion.duration.swipeExit })
    expect(withTiming).toHaveBeenCalledWith(x, exit)
    expect(withTiming).toHaveBeenCalledWith(y, exit)
    expect(withTiming).toHaveBeenCalledWith(0, exit)
    expect(transformOf(0)).toMatchObject({ translateX: x, translateY: y })
    expect(cardStyle(0).opacity).toBe(0)
    expect(parseFloat(String(transformOf(0).rotate))).toBeCloseTo(rotate)
    expect(bezier).toHaveBeenCalledWith(...motion.exit)
    expect(rated()).toBe(_direction === 'down' ? '0' : '1')
  })

  it('el_otro_eje_va_al_doble_del_arrastre', async () => {
    await render(<Harness />)

    await drag(0, 120, 30)

    expect(transformOf(0)).toMatchObject({ translateX: 600, translateY: 60 })
  })

  it('diagonal_gana_el_eje_mayor', async () => {
    await render(<Harness />)

    await drag(0, 100, -95)

    expect(transformOf(0)).toMatchObject({ translateX: 600 })
    expect(screen.getByTestId('toast').children.join('')).toBe('Me gustó · guardado')
  })

  it('empate_de_ejes_es_vertical', async () => {
    await render(<Harness />)

    await drag(0, 100, 100)

    expect(transformOf(0)).toMatchObject({ translateY: 800 })
    expect(rated()).toBe('0')
  })

  it('accessibility_action_ejecuta_swipe', async () => {
    await render(<Harness />)

    const card = screen.getByTestId('deck-card-0')
    expect(card).toHaveProp('accessibilityLabel', discoverDeck[0].title)
    expect(card).toHaveProp(
      'accessibilityActions',
      DIRECTIONS.map((direction) => ({ name: overlayLabels[direction], label: overlayLabels[direction] })),
    )

    await fireEvent(card, 'accessibilityAction', { nativeEvent: { actionName: 'Me gustó' } })
    // scheduleOnUI: the worklets mock runs it on the next animation frame.
    await act(async () => jest.advanceTimersByTime(16))
    await act(async () => {})

    expect(screen.getByTestId('toast').children.join('')).toBe('Me gustó · guardado')
    expect(rated()).toBe('1')
  })

  it('las_cards_de_debajo_no_exponen_acciones', async () => {
    await render(<Harness />)

    expect(screen.getByTestId('deck-card-1', hidden)).not.toHaveProp('accessibilityActions')
    expect(screen.getByTestId('deck-card-1', hidden)).toHaveProp('importantForAccessibility', 'no-hide-descendants')
  })

  it('avanza_la_card_de_debajo_a_su_nuevo_hueco_en_400ms', async () => {
    const withTiming = jest.spyOn(Reanimated, 'withTiming')
    await render(<Harness />)
    await drag(0, 120, 0)
    withTiming.mockClear()

    await act(async () => jest.advanceTimersByTime(280))

    expect(screen.queryByTestId('deck-card-0', hidden)).toBeNull()
    expect(withTiming).toHaveBeenCalledWith(1, expect.objectContaining({ duration: motion.duration.deckShift }))
    expect(transformOf(1)).toMatchObject({ scale: 1, translateY: 0 })
    expect(screen.getByTestId('deck-card-1')).toBeOnTheScreen()
    // The card that moved up keeps being interactive: it can be swiped now.
    await drag(1, -120, 0)
    expect(rated()).toBe('2')
  })

  it('reduce_motion_desvanece_sin_desplazar', async () => {
    jest.spyOn(Reanimated, 'useReducedMotion').mockReturnValue(true)
    const withTiming = jest.spyOn(Reanimated, 'withTiming')
    await render(<Harness />)

    await drag(0, 120, 0)

    expect(withTiming).toHaveBeenCalledTimes(1)
    expect(withTiming).toHaveBeenCalledWith(0, expect.objectContaining({ duration: motion.duration.reduceMotionFade }))
    expect(transformOf(0)).toMatchObject({ translateX: 120, translateY: 0 })
    expect(cardStyle(0).opacity).toBe(0)
    expect(rated()).toBe('1')
  })

  it('reduce_motion_vuelve_al_instante', async () => {
    jest.spyOn(Reanimated, 'useReducedMotion').mockReturnValue(true)
    const withTiming = jest.spyOn(Reanimated, 'withTiming')
    await render(<Harness />)

    await drag(0, 60, 0)

    expect(withTiming).not.toHaveBeenCalled()
    expect(transformOf(0)).toMatchObject({ translateX: 0, translateY: 0 })
  })
})
