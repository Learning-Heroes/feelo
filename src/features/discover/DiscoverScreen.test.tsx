import { act, fireEvent, render, screen, within } from '@testing-library/react-native'
import { StyleSheet } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { createGestureController } from 'react-native-gesture-handler/jest-utils'

import { DiscoverScreen } from '@/features/discover/DiscoverScreen'
import { discoverDeck } from '@/features/discover/discoverMock'
import type { Direction } from '@/features/discover/swipeMath'
import { motion } from '@/theme/tokens'

type ReanimatedModule = typeof import('react-native-reanimated')
const Reanimated = jest.requireMock<ReanimatedModule>('react-native-reanimated')

const renderScreen = () =>
  render(
    <GestureHandlerRootView>
      <DiscoverScreen />
    </GestureHandlerRootView>,
  )

const DELTAS: Record<Direction, [number, number]> = { right: [120, 0], left: [-120, 0], up: [0, -120], down: [0, 120] }

// Swipes the card at deck position `key` with a real drag past the threshold.
async function swipe(direction: Direction, key = 0) {
  const [dx, dy] = DELTAS[direction]
  const controller = createGestureController(`swipe-card-${key}`)
  await act(async () => {
    controller.begin({ translationX: 0, translationY: 0 })
    controller.activate({ translationX: 0, translationY: 0 })
    controller.update({ translationX: dx, translationY: dy })
    controller.end({ translationX: dx, translationY: dy })
  })
  await act(async () => {})
}

const advance = (ms: number) => act(async () => jest.advanceTimersByTime(ms))
const counter = () => within(screen.getByTestId('rated-counter')).getByText(/valorados/).children.join('')
const toastMessage = () => {
  const toast = screen.queryByTestId('swipe-toast')
  return toast ? within(toast).getByText(/./).children.join('') : null
}
const topTitle = () => screen.getByTestId('clip-title').children.join('')
// Buttons and accessibility actions run the exit on the UI thread (scheduleOnUI), which the
// worklets mock delivers on the next animation frame.
const FRAME_MS = 16
const press = async (name: string) => {
  await fireEvent.press(screen.getByRole('button', { name }))
  await act(async () => jest.advanceTimersByTime(FRAME_MS))
  await act(async () => {})
}

let discoverDeckPosition = 0

// The worklets mock delivers scheduleOnRN through queueMicrotask, which must keep running.
beforeEach(() => {
  discoverDeckPosition = 0
  jest.useFakeTimers({ doNotFake: ['queueMicrotask'] })
})
afterEach(() => {
  jest.restoreAllMocks()
  jest.useRealTimers()
})

describe('DiscoverScreen', () => {
  it('card_tiene_label_accesible', async () => {
    await renderScreen()

    expect(screen.getByTestId('deck-card-0')).toHaveProp('accessibilityLabel', discoverDeck[0].title)
  })

  it('cabecera_muestra_wordmark_y_contador', async () => {
    await renderScreen()

    expect(screen.getByRole('header', { name: 'Feelo' })).toBeOnTheScreen()
    expect(counter()).toBe('0 valorados')
  })

  it('contador_inicial_y_mixto', async () => {
    await renderScreen()
    expect(counter()).toBe('0 valorados')

    for (const direction of ['right', 'right', 'up', 'down'] as const) {
      await swipe(direction, discoverDeckPosition++)
      await advance(280)
    }

    expect(counter()).toBe('3 valorados')
  })

  it.each([
    ['right', 'swipe_derecha_registra_me_gusto', 'Me gustó · guardado', '1 valorados'],
    ['left', 'swipe_izquierda_registra_no_me_gusto', 'No me gustó · anotado', '1 valorados'],
    ['up', 'swipe_arriba_registra_me_encanto', 'Me encantó', '1 valorados'],
    ['down', 'swipe_abajo_no_suma_al_contador', 'No la has visto · te la podremos sugerir', '0 valorados'],
  ] as const)('%s: %s', async (direction, _name, message, count) => {
    await renderScreen()

    await swipe(direction)

    expect(toastMessage()).toBe(message)
    expect(counter()).toBe(count)
  })

  it('swipe_valido_avanza_el_mazo', async () => {
    await renderScreen()

    await swipe('right')
    expect(topTitle()).toBe(discoverDeck[0].title)
    await advance(280)

    expect(topTitle()).toBe(discoverDeck[1].title)
  })

  it('mazo_infinito_da_la_vuelta', async () => {
    await renderScreen()

    for (let k = 0; k < discoverDeck.length; k++) {
      await swipe('right', k)
      await advance(280)
    }

    expect(topTitle()).toBe(discoverDeck[0].title)
    await swipe('left', discoverDeck.length)
    expect(counter()).toBe(`${discoverDeck.length + 1} valorados`)
  })

  it('toast_se_oculta_a_los_1400', async () => {
    await renderScreen()

    await swipe('right')
    await advance(1399)
    expect(toastMessage()).toBe('Me gustó · guardado')
    await advance(1)

    expect(screen.queryByTestId('swipe-toast')).toBeNull()
  })

  it('toast_se_reinicia_con_swipe_nuevo', async () => {
    await renderScreen()

    await swipe('right')
    await advance(1000)
    await swipe('left', 1)
    await advance(1300)

    expect(toastMessage()).toBe('No me gustó · anotado')
    await advance(100)
    expect(screen.queryByTestId('swipe-toast')).toBeNull()
  })

  it('toast_entra_deslizando_en_500ms', async () => {
    const withTiming = jest.spyOn(Reanimated, 'withTiming')
    await renderScreen()

    await swipe('right')
    expect(withTiming).toHaveBeenCalledWith(0, expect.objectContaining({ duration: motion.duration.toastIn }))
  })

  it('toast_no_reinicia_la_entrada_al_avanzar_el_mazo', async () => {
    const withTiming = jest.spyOn(Reanimated, 'withTiming')
    await renderScreen()

    await swipe('right')
    withTiming.mockClear()
    // The deck advance at 280 ms re-renders the screen; the toast entrance must not restart.
    await advance(motion.duration.swipeExit)

    expect(withTiming).not.toHaveBeenCalledWith(0, expect.objectContaining({ duration: motion.duration.toastIn }))
  })

  it('toast_solo_funde_con_reduce_motion', async () => {
    jest.spyOn(Reanimated, 'useReducedMotion').mockReturnValue(true)
    const withTiming = jest.spyOn(Reanimated, 'withTiming')
    await renderScreen()

    await swipe('right')

    expect(withTiming).toHaveBeenCalledWith(1, expect.objectContaining({ duration: motion.duration.reduceMotionFade }))
    expect(withTiming).not.toHaveBeenCalledWith(0, expect.objectContaining({ duration: motion.duration.toastIn }))
  })

  it('leyenda_en_orden', async () => {
    await renderScreen()

    const labels = screen.getAllByRole('button').map((button) => button.props.accessibilityLabel)
    expect(labels).toEqual(['No me gustó', 'No la he visto', 'Me encantó', 'Me gustó'])
    expect(screen.getByText('👈')).toBeOnTheScreen()
    expect(screen.getByText('👉')).toBeOnTheScreen()
  })

  it('boton_de_leyenda_ejecuta_swipe', async () => {
    await renderScreen()

    await press('Me encantó')

    expect(toastMessage()).toBe('Me encantó')
    expect(counter()).toBe('1 valorados')
    await advance(280)
    expect(topTitle()).toBe(discoverDeck[1].title)
  })

  it('botones_cumplen_accesibilidad', async () => {
    await renderScreen()

    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(4)
    for (const button of buttons) {
      expect(StyleSheet.flatten(button.props.style)).toMatchObject({ minHeight: 44, minWidth: 44 })
    }
  })

  it('doble_swipe_bloqueado', async () => {
    await renderScreen()

    await press('Me gustó')
    await advance(100)
    await press('Me encantó')

    expect(counter()).toBe('1 valorados')
    expect(toastMessage()).toBe('Me gustó · guardado')
  })

  it('arrastre_durante_la_salida_se_ignora', async () => {
    await renderScreen()

    await swipe('right')
    await swipe('left')

    expect(counter()).toBe('1 valorados')
  })

  it('no_hay_peticiones_de_red', async () => {
    const fetchSpy = jest.spyOn(globalThis, 'fetch').mockImplementation(() => Promise.reject(new Error('no network')))
    await renderScreen()

    for (const [k, direction] of (['right', 'left', 'up', 'down'] as const).entries()) {
      await swipe(direction, k)
      await advance(280)
    }

    expect(fetchSpy).not.toHaveBeenCalled()
  })
})
