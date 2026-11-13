import { act, fireEvent, render, screen } from '@testing-library/react-native'
import type { BottomTabBarProps } from 'expo-router/js-tabs'
import { StyleSheet, Text } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { createGestureController } from 'react-native-gesture-handler/jest-utils'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { GlassTabBar } from '@/components/GlassTabBar'

const BAR_WIDTH = 300
const PAN = 'glass-tab-bar-pan'
const TAP = 'glass-tab-bar-tap'
const LAVANDA = '#B9AFFF'
const TEXTO3 = 'rgba(242,241,247,.34)'

type ReanimatedModule = typeof import('react-native-reanimated')
const Reanimated = jest.requireMock<ReanimatedModule>('react-native-reanimated')

const routes = [
  { key: 'index-key', name: 'index', title: 'Descubre' },
  { key: 'sugerir-key', name: 'sugerir', title: 'Sugerir' },
  { key: 'perfil-key', name: 'perfil', title: 'Perfil' },
]

interface Harness {
  navigate: jest.Mock
  emit: jest.Mock
  rerenderAt: (index: number) => Promise<void>
}

function buildProps(index: number, navigate: jest.Mock, emit: jest.Mock): BottomTabBarProps {
  const descriptors = Object.fromEntries(
    routes.map((route) => [
      route.key,
      {
        options: {
          title: route.title,
          tabBarIcon: ({ color }: { color: string }) => <Text testID={`icon-${route.name}`}>{color}</Text>,
        },
      },
    ]),
  )
  return {
    state: { index, routes: routes.map(({ key, name }) => ({ key, name })) },
    descriptors,
    emitter: { emit },
    navigateToTab: navigate,
    insets: { top: 0, right: 0, bottom: 0, left: 0 },
  } as unknown as BottomTabBarProps
}

function withSafeArea(children: React.ReactNode, bottom: number) {
  return (
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 0, right: 0, bottom, left: 0 },
      }}
    >
      <GestureHandlerRootView>{children}</GestureHandlerRootView>
    </SafeAreaProvider>
  )
}

async function renderBar(index = 0, bottomInset = 0): Promise<Harness> {
  const navigate = jest.fn()
  const emit = jest.fn(() => ({ defaultPrevented: false }))
  const view = await render(withSafeArea(<GlassTabBar {...buildProps(index, navigate, emit)} />, bottomInset))
  await act(async () => {
    fireEvent(screen.getByTestId('glass-tab-bar'), 'layout', {
      nativeEvent: { layout: { x: 0, y: 0, width: BAR_WIDTH, height: 64 } },
    })
  })
  return {
    navigate,
    emit,
    rerenderAt: async (next) => {
      await view.rerender(withSafeArea(<GlassTabBar {...buildProps(next, navigate, emit)} />, bottomInset))
    },
  }
}

const pan = () => createGestureController(PAN)

async function gesture(steps: (controller: ReturnType<typeof pan>) => void) {
  await act(async () => steps(pan()))
}

function styleOf(testID: string) {
  return StyleSheet.flatten(screen.getByTestId(testID).props.style)
}

const barScale = () => (styleOf('glass-tab-bar').transform as { scale: number }[] | undefined)?.[0]?.scale
const indicatorLeft = () => styleOf('glass-tab-bar-indicator').left
const labelColor = (name: string) => styleOf(`glass-tab-label-${name}`).color
const slotLeft = (index: number) => (index * BAR_WIDTH) / 3 + 4

afterEach(() => jest.restoreAllMocks())

describe('GlassTabBar', () => {
  it('tab_bar_muestra_tres_items_en_orden', async () => {
    await renderBar()

    const tabs = screen.getAllByRole('tab')
    expect(tabs.map((tab) => tab.props.accessibilityLabel)).toEqual(['Descubre', 'Sugerir', 'Perfil'])
    for (const route of routes) {
      expect(screen.getByTestId(`icon-${route.name}-active`)).toBeTruthy()
      expect(screen.getByText(route.title)).toBeTruthy()
    }
  })

  it('items_tienen_rol_label_y_estado', async () => {
    await renderBar(0)

    expect(screen.getByTestId('glass-tab-bar')).toHaveProp('accessibilityRole', 'tablist')
    expect(screen.getByRole('tab', { name: 'Descubre' })).toBeSelected()
    expect(screen.getByRole('tab', { name: 'Sugerir' })).not.toBeSelected()
    expect(screen.getByRole('tab', { name: 'Perfil' })).not.toBeSelected()
    for (const tab of screen.getAllByRole('tab')) {
      expect(StyleSheet.flatten(tab.props.style)).toMatchObject({ minHeight: 44, minWidth: 44 })
    }
  })

  it('activar_con_lector_de_pantalla_navega', async () => {
    const { navigate } = await renderBar(0)

    fireEvent(screen.getByRole('tab', { name: 'Perfil' }), 'accessibilityAction', {
      nativeEvent: { actionName: 'activate' },
    })

    expect(navigate).toHaveBeenCalledWith('perfil-key')
  })

  it('tap_navega_a_la_pestana_pulsada', async () => {
    const { navigate, emit } = await renderBar(0)

    await gesture((c) => {
      c.begin({ x: 150 })
      c.activate({ x: 150 })
      c.end({ x: 150 })
    })

    expect(emit).toHaveBeenCalledWith({ type: 'tabPress', target: 'sugerir-key', canPreventDefault: true })
    expect(navigate).toHaveBeenCalledWith('sugerir-key')
  })

  it('tap_sin_movimiento_navega', async () => {
    const { navigate, emit } = await renderBar(0)

    // A finger that never moves: the pan begins and fails on release, the tap succeeds.
    const panController = pan()
    const tapController = createGestureController(TAP)
    await act(async () => {
      panController.begin({ x: 270 })
      tapController.begin({ x: 270 })
    })
    expect(barScale()).toBe(1.04)

    await act(async () => {
      panController.fail({ x: 270 })
      tapController.activate({ x: 270 })
      tapController.end({ x: 270 })
    })

    expect(emit).toHaveBeenCalledTimes(1)
    expect(navigate).toHaveBeenCalledTimes(1)
    expect(navigate).toHaveBeenCalledWith('perfil-key')
    expect(barScale()).toBe(1)
  })

  it('tap_sin_movimiento_en_la_activa_no_navega', async () => {
    const { navigate } = await renderBar(1)

    const panController = pan()
    const tapController = createGestureController(TAP)
    await act(async () => {
      panController.begin({ x: 150 })
      tapController.begin({ x: 150 })
      panController.fail({ x: 150 })
      tapController.activate({ x: 150 })
      tapController.end({ x: 150 })
    })

    expect(navigate).not.toHaveBeenCalled()
  })

  it('tap_en_la_activa_no_renavega', async () => {
    const { navigate } = await renderBar(0)

    await gesture((c) => {
      c.begin({ x: 30 })
      c.activate({ x: 30 })
      c.end({ x: 30 })
    })

    expect(navigate).not.toHaveBeenCalled()
  })

  it('drag_actualiza_indicador_sin_navegar', async () => {
    const { navigate } = await renderBar(0)

    await gesture((c) => {
      c.begin({ x: 30 })
      c.activate({ x: 30 })
      c.update({ x: 150 })
    })

    expect(indicatorLeft()).toBe(slotLeft(1))
    expect(labelColor('sugerir')).toBe(LAVANDA)
    expect(labelColor('index')).toBe(TEXTO3)
    expect(navigate).not.toHaveBeenCalled()
  })

  it('soltar_navega_a_la_pestana_bajo_el_dedo', async () => {
    const { navigate } = await renderBar(0)

    await gesture((c) => {
      c.begin({ x: 30 })
      c.activate({ x: 30 })
      c.update({ x: 270 })
      c.end({ x: 270 })
    })

    expect(navigate).toHaveBeenCalledWith('perfil-key')
    expect(barScale()).toBe(1)
  })

  it('drag_fuera_por_la_izquierda_queda_en_cero', async () => {
    const { navigate } = await renderBar(2)

    await gesture((c) => {
      c.begin({ x: 270 })
      c.activate({ x: 270 })
      c.update({ x: -40 })
      c.end({ x: -40 })
    })

    expect(navigate).toHaveBeenCalledWith('index-key')
  })

  it('drag_fuera_por_la_derecha_queda_en_dos', async () => {
    const { navigate } = await renderBar(0)

    await gesture((c) => {
      c.begin({ x: 30 })
      c.activate({ x: 30 })
      c.update({ x: BAR_WIDTH + 40 })
      c.end({ x: BAR_WIDTH + 40 })
    })

    expect(navigate).toHaveBeenCalledWith('perfil-key')
  })

  it('soltar_sobre_la_activa_no_navega', async () => {
    const { navigate } = await renderBar(1)

    await gesture((c) => {
      c.begin({ x: 150 })
      c.activate({ x: 150 })
      c.update({ x: 270 })
      c.update({ x: 150 })
      c.end({ x: 150 })
    })

    expect(navigate).not.toHaveBeenCalled()
  })

  it('gesto_cancelado_no_navega', async () => {
    const { navigate } = await renderBar(0)

    await gesture((c) => {
      c.begin({ x: 30 })
      c.activate({ x: 30 })
      c.update({ x: 270 })
      c.cancel({ x: 270 })
    })

    expect(navigate).not.toHaveBeenCalled()
    expect(indicatorLeft()).toBe(slotLeft(0))
    expect(barScale()).toBe(1)
  })

  it('escala_pulsar_y_arrastrar', async () => {
    await renderBar(0)
    expect(barScale()).toBe(1)

    const controller = pan()
    await act(async () => controller.begin({ x: 30 }))
    expect(barScale()).toBe(1.04)

    await act(async () => {
      controller.activate({ x: 30 })
      controller.update({ x: 150 })
    })
    expect(barScale()).toBe(1.06)

    await act(async () => controller.end({ x: 150 }))
    expect(barScale()).toBe(1)
  })

  it('indicador_usa_spring_en_tap_y_lineal_en_arrastre', async () => {
    const withTiming = jest.spyOn(Reanimated, 'withTiming')
    const { rerenderAt } = await renderBar(0)

    const controller = pan()
    await act(async () => {
      controller.begin({ x: 30 })
      controller.activate({ x: 30 })
      controller.update({ x: 150 })
    })
    expect(withTiming).toHaveBeenCalledWith(slotLeft(1), expect.objectContaining({ duration: 80 }))

    await act(async () => controller.end({ x: 150 }))
    withTiming.mockClear()
    await rerenderAt(2)
    expect(withTiming).toHaveBeenCalledWith(slotLeft(2), expect.objectContaining({ duration: 450 }))
    expect(Reanimated.Easing.bezier).toBeDefined()
  })

  it('reduce_motion_sin_spring_ni_escala', async () => {
    jest.spyOn(Reanimated, 'useReducedMotion').mockReturnValue(true)
    const withTiming = jest.spyOn(Reanimated, 'withTiming')
    const { rerenderAt } = await renderBar(0)

    const controller = pan()
    await act(async () => {
      controller.begin({ x: 30 })
      controller.activate({ x: 30 })
      controller.update({ x: 150 })
    })
    expect(barScale()).toBe(1)

    await act(async () => controller.end({ x: 150 }))
    withTiming.mockClear()
    await rerenderAt(1)

    // Position jumps (no spring) and fades in over 200 ms.
    expect(indicatorLeft()).toBe(slotLeft(1))
    expect(withTiming).not.toHaveBeenCalledWith(slotLeft(1), expect.anything())
    expect(withTiming).toHaveBeenCalledWith(1, expect.objectContaining({ duration: 200 }))
    // Active icon keeps scale 1.
    const iconTransform = styleOf('glass-tab-icon-sugerir').transform as Record<string, number>[]
    expect(iconTransform).toContainEqual({ scale: 1 })
  })

  it('padding_inferior_respeta_safe_area', async () => {
    await renderBar(0, 34)
    expect(styleOf('glass-tab-bar-wrap').paddingBottom).toBe(34)
  })

  it('padding_inferior_minimo_sin_home_indicator', async () => {
    await renderBar(0, 0)
    expect(styleOf('glass-tab-bar-wrap').paddingBottom).toBe(14)
  })
})
