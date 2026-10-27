import type { AuthChangeEvent, Session } from '@supabase/supabase-js'
import { Stack } from 'expo-router'
import { act, renderRouter, screen } from 'expo-router/testing-library'
import { Text } from 'react-native'

import { useAuthStore } from '@/features/auth/useAuthStore'
import { supabase } from '@/lib/supabase'

// Route files can't live in app/ next to a test, so the real root layout is imported here.
import RootLayout from '../../../app/_layout'

jest.mock('@expo-google-fonts/sora', () => ({ useFonts: () => [true, null] }))
jest.mock('@/lib/supabase', () => ({
  supabase: { auth: { onAuthStateChange: jest.fn(), signOut: jest.fn() } },
}))

type Listener = (event: AuthChangeEvent, session: Session | null) => void

const session = { access_token: 'token', user: { id: 'user-a' } } as Session
let emit: Listener

const routes = {
  _layout: RootLayout,
  '(app)/_layout': () => <Stack screenOptions={{ headerShown: false }} />,
  '(app)/index': () => <Text>private</Text>,
  '(auth)/_layout': () => <Stack screenOptions={{ headerShown: false }} />,
  '(auth)/login': () => <Text>login</Text>,
}

beforeEach(() => {
  useAuthStore.setState({ session: null, isRestoring: true })
  jest.mocked(supabase.auth.onAuthStateChange).mockImplementation((listener) => {
    emit = listener as Listener
    return { data: { subscription: { id: '1', callback: listener, unsubscribe: jest.fn() } } }
  })
})

describe('route guards', () => {
  it('splash_durante_restauracion', async () => {
    await renderRouter(routes, { initialUrl: '/' })

    expect(screen.queryByText('login')).toBeNull()
    expect(screen.queryByText('private')).toBeNull()
  })

  it('ruta_privada_sin_sesion_va_a_login', async () => {
    const router = await renderRouter(routes, { initialUrl: '/' })
    await act(async () => emit('INITIAL_SESSION', null))

    expect(await screen.findByText('login')).toBeTruthy()
    expect(router.getPathname()).toBe('/login')
  })

  it('usuario_con_sesion_abre_ruta_de_auth', async () => {
    const router = await renderRouter(routes, { initialUrl: '/login' })
    await act(async () => emit('INITIAL_SESSION', session))

    expect(await screen.findByText('private')).toBeTruthy()
    expect(router.getPathname()).toBe('/')
  })

  it('logout_vuelve_a_login', async () => {
    const router = await renderRouter(routes, { initialUrl: '/' })
    await act(async () => emit('INITIAL_SESSION', session))
    expect(await screen.findByText('private')).toBeTruthy()

    await act(async () => emit('SIGNED_OUT', null))

    expect(await screen.findByText('login')).toBeTruthy()
    expect(router.getPathname()).toBe('/login')
  })
})
