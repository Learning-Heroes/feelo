import { AuthApiError, AuthRetryableFetchError } from '@supabase/supabase-js'
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native'
import { router } from 'expo-router'

import { LoginScreen } from '@/features/auth/LoginScreen'
import { supabase } from '@/lib/supabase'

jest.mock('expo-router', () => ({ router: { replace: jest.fn() } }))
jest.mock('@/lib/supabase', () => ({
  supabase: { auth: { signInWithPassword: jest.fn() } },
}))

const signIn = jest.mocked(supabase.auth.signInWithPassword)

async function fillAndSubmit(email: string, password: string) {
  await fireEvent.changeText(screen.getByLabelText('Email'), email)
  await fireEvent.changeText(screen.getByLabelText('Contraseña'), password)
  await fireEvent.press(screen.getByRole('button', { name: 'Iniciar sesión' }))
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('LoginScreen', () => {
  it('login_correcto_llama_a_signin_con_email_normalizado', async () => {
    signIn.mockResolvedValue({ data: { user: null, session: null }, error: null } as never)
    await render(<LoginScreen />)

    await fillAndSubmit('  Usuario-A@Feelo.test ', 'FeeloA#2026')

    await waitFor(() => expect(signIn).toHaveBeenCalledWith({ email: 'usuario-a@feelo.test', password: 'FeeloA#2026' }))
  })

  it('email_invalido_no_llama_a_supabase', async () => {
    await render(<LoginScreen />)

    await fillAndSubmit('usuario@', 'FeeloA#2026')

    expect(await screen.findByText('Introduce un email válido.')).toBeTruthy()
    expect(signIn).not.toHaveBeenCalled()
  })

  it('credenciales_incorrectas', async () => {
    signIn.mockResolvedValue({
      data: { user: null, session: null },
      error: new AuthApiError('Invalid login credentials', 400, 'invalid_credentials'),
    } as never)
    await render(<LoginScreen />)

    await fillAndSubmit('usuario-a@feelo.test', 'Mala#0000')

    expect(await screen.findByText('Email o contraseña incorrectos.')).toBeTruthy()
  })

  it('sin_conexion', async () => {
    signIn.mockResolvedValue({
      data: { user: null, session: null },
      error: new AuthRetryableFetchError('Network request failed', 0),
    } as never)
    await render(<LoginScreen />)

    await fillAndSubmit('usuario-a@feelo.test', 'FeeloA#2026')

    expect(await screen.findByText('No hay conexión. Revisa tu red e inténtalo de nuevo.')).toBeTruthy()
  })

  it('goes to register', async () => {
    await render(<LoginScreen />)

    await fireEvent.press(screen.getByRole('link', { name: '¿No tienes cuenta? Regístrate' }))

    expect(router.replace).toHaveBeenCalledWith('/register')
  })
})
