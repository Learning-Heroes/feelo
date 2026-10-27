import type { AuthChangeEvent, Session } from '@supabase/supabase-js'

import { useAuthStore } from '@/features/auth/useAuthStore'
import { supabase } from '@/lib/supabase'

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      onAuthStateChange: jest.fn(),
      signOut: jest.fn(),
    },
  },
}))

type Listener = (event: AuthChangeEvent, session: Session | null) => void

const session = { access_token: 'token', user: { id: 'user-a' } } as Session
const unsubscribe = jest.fn()
let emit: Listener

beforeEach(() => {
  jest.clearAllMocks()
  useAuthStore.setState({ session: null, isRestoring: true })
  jest.mocked(supabase.auth.onAuthStateChange).mockImplementation((listener) => {
    emit = listener as Listener
    return { data: { subscription: { id: '1', callback: listener, unsubscribe } } }
  })
})

describe('useAuthStore', () => {
  it('is restoring until Supabase reports the initial session', () => {
    useAuthStore.getState().init()

    expect(useAuthStore.getState()).toMatchObject({ session: null, isRestoring: true })
  })

  it('restaura_sesion_al_arrancar', () => {
    useAuthStore.getState().init()
    emit('INITIAL_SESSION', session)

    expect(useAuthStore.getState()).toMatchObject({ session, isRestoring: false })
  })

  it('init returns the unsubscribe function', () => {
    const stop = useAuthStore.getState().init()
    stop()

    expect(unsubscribe).toHaveBeenCalledTimes(1)
  })

  it('logout_limpia_la_sesion', async () => {
    jest.mocked(supabase.auth.signOut).mockImplementation(async () => {
      emit('SIGNED_OUT', null)
      return { error: null }
    })
    useAuthStore.getState().init()
    emit('INITIAL_SESSION', session)

    const error = await useAuthStore.getState().signOut()

    expect(error).toBeNull()
    expect(supabase.auth.signOut).toHaveBeenCalledTimes(1)
    expect(useAuthStore.getState().session).toBeNull()
  })
})
