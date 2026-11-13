import { Slot } from 'expo-router'
import { act, fireEvent, renderRouter, screen } from 'expo-router/testing-library'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { createGestureController } from 'react-native-gesture-handler/jest-utils'

// Route files can't live in app/ next to a test, so the real tab routes are imported here.
import TabsLayout from '../../app/(app)/(tabs)/_layout'
import DiscoverRoute from '../../app/(app)/(tabs)/index'
import PerfilRoute from '../../app/(app)/(tabs)/perfil'
import SugerirRoute from '../../app/(app)/(tabs)/sugerir'

jest.mock('@/lib/supabase', () => ({
  supabase: { auth: { onAuthStateChange: jest.fn(), signOut: jest.fn() } },
}))

// Count Discover mounts to prove a tap on the active tab doesn't remount it.
let discoverMounts = 0
jest.mock('@/features/discover/DiscoverScreen', () => {
  const { useEffect } = jest.requireActual<typeof import('react')>('react')
  const actual = jest.requireActual<typeof import('@/features/discover/DiscoverScreen')>(
    '@/features/discover/DiscoverScreen',
  )
  return {
    DiscoverScreen: () => {
      useEffect(() => {
        discoverMounts += 1
      }, [])
      return <actual.DiscoverScreen />
    },
  }
})

const BAR_WIDTH = 300
const xOf = (index: number) => (index + 0.5) * (BAR_WIDTH / 3)

// Stands in for app/_layout.tsx (auth guards are covered by routeGuard.test.tsx).
function RootLayout() {
  return (
    <GestureHandlerRootView>
      <Slot />
    </GestureHandlerRootView>
  )
}

const routes = {
  _layout: RootLayout,
  '(app)/(tabs)/_layout': TabsLayout,
  '(app)/(tabs)/index': DiscoverRoute,
  '(app)/(tabs)/sugerir': SugerirRoute,
  '(app)/(tabs)/perfil': PerfilRoute,
}

async function openApp() {
  const router = await renderRouter(routes, { initialUrl: '/' })
  await act(async () => {
    fireEvent(screen.getByTestId('glass-tab-bar'), 'layout', {
      nativeEvent: { layout: { x: 0, y: 0, width: BAR_WIDTH, height: 64 } },
    })
  })
  return router
}

async function tapTab(index: number) {
  const controller = createGestureController('glass-tab-bar-pan')
  await act(async () => {
    controller.begin({ x: xOf(index) })
    controller.activate({ x: xOf(index) })
    controller.end({ x: xOf(index) })
  })
}

const tab = (name: string) => screen.getByRole('tab', { name })

let fetchSpy: jest.SpyInstance

beforeEach(() => {
  discoverMounts = 0
  fetchSpy = jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('no network in tests'))
})

afterEach(() => jest.restoreAllMocks())

describe('main tab navigation', () => {
  it('arranque_selecciona_descubre', async () => {
    await openApp()

    expect(tab('Descubre')).toBeSelected()
    expect(screen.getByTestId('clip-title')).toBeOnTheScreen()
  })

  it('tap_en_sugerir_navega', async () => {
    const router = await openApp()

    await tapTab(1)

    expect(await screen.findByRole('header', { name: 'Sugerir' })).toBeOnTheScreen()
    expect(tab('Sugerir')).toBeSelected()
    expect(router.getPathname()).toBe('/sugerir')
  })

  it('tap_en_perfil_navega', async () => {
    const router = await openApp()

    await tapTab(2)

    expect(tab('Perfil')).toBeSelected()
    expect(router.getPathname()).toBe('/perfil')
    expect(screen.getByRole('header', { name: 'Perfil' })).toBeOnTheScreen()
  })

  it('tap_en_descubre_vuelve_a_la_home', async () => {
    const router = await openApp()

    await tapTab(2)
    await tapTab(0)

    expect(tab('Descubre')).toBeSelected()
    expect(router.getPathname()).toBe('/')
    expect(screen.getByTestId('clip-title')).toBeOnTheScreen()
  })

  it('tap_en_la_activa_no_renavega', async () => {
    const router = await openApp()
    expect(discoverMounts).toBe(1)

    await tapTab(0)

    expect(router.getPathname()).toBe('/')
    expect(discoverMounts).toBe(1)
  })

  it('no_hay_peticiones_de_red', async () => {
    await openApp()

    await tapTab(1)
    await tapTab(2)
    await tapTab(0)

    expect(fetchSpy).not.toHaveBeenCalled()
  })
})
