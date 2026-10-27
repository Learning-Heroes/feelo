import { fireEvent, render, screen, waitFor } from '@testing-library/react-native'
import { getLocales } from 'expo-localization'
import { router } from 'expo-router'

import { RegisterScreen } from '@/features/auth/RegisterScreen'
import { supabase } from '@/lib/supabase'

jest.mock('expo-router', () => ({ router: { replace: jest.fn() } }))
jest.mock('expo-localization', () => ({ getLocales: jest.fn() }))
jest.mock('@/lib/supabase', () => ({
  supabase: { auth: { signUp: jest.fn() }, rpc: jest.fn() },
}))

const signUp = jest.mocked(supabase.auth.signUp)
const rpc = jest.mocked(supabase.rpc)

const form = {
  Email: 'nuevo@feelo.test',
  'Nombre de usuario': 'nuevo_user',
  Contraseña: 'Feelo#2026',
  'Repetir contraseña': 'Feelo#2026',
}

async function fillAndSubmit(values: Partial<typeof form> = {}) {
  for (const [label, value] of Object.entries({ ...form, ...values })) {
    await fireEvent.changeText(screen.getByLabelText(label), value)
  }
  await fireEvent.press(screen.getByRole('button', { name: 'Crear cuenta' }))
}

function usernameAvailable(available: boolean) {
  rpc.mockResolvedValue({ data: available, error: null, status: 200 } as never)
}

beforeEach(() => {
  jest.clearAllMocks()
  jest.mocked(getLocales).mockReturnValue([{ regionCode: 'ES', languageTag: 'es-ES' }] as unknown as ReturnType<typeof getLocales>)
  signUp.mockResolvedValue({ data: { user: null, session: null }, error: null } as never)
})

describe('RegisterScreen', () => {
  it('registro_valido_llama_a_signup_con_metadatos', async () => {
    usernameAvailable(true)
    await render(<RegisterScreen />)

    await fillAndSubmit({ Email: '  Nuevo@Feelo.test ' })

    await waitFor(() =>
      expect(signUp).toHaveBeenCalledWith({
        email: 'nuevo@feelo.test',
        password: 'Feelo#2026',
        options: { data: { username: 'nuevo_user', country: 'ES', language: 'es-ES' } },
      }),
    )
    expect(rpc).toHaveBeenCalledWith('is_username_available', { p_username: 'nuevo_user' })
  })

  it('locale_sin_region', async () => {
    usernameAvailable(true)
    jest.mocked(getLocales).mockReturnValue([{ regionCode: null, languageTag: 'es' }] as unknown as ReturnType<typeof getLocales>)
    await render(<RegisterScreen />)

    await fillAndSubmit()

    await waitFor(() =>
      expect(signUp).toHaveBeenCalledWith(
        expect.objectContaining({ options: { data: { username: 'nuevo_user', country: null, language: 'es' } } }),
      ),
    )
  })

  it('username_ocupado_bloquea_el_registro', async () => {
    usernameAvailable(false)
    await render(<RegisterScreen />)

    await fillAndSubmit({ 'Nombre de usuario': 'usuario_a' })

    expect(await screen.findByText('Ese nombre de usuario ya está en uso.')).toBeTruthy()
    expect(signUp).not.toHaveBeenCalled()
  })

  it('email_invalido_no_llama_a_supabase', async () => {
    await render(<RegisterScreen />)

    await fillAndSubmit({ Email: 'usuario@' })

    expect(await screen.findByText('Introduce un email válido.')).toBeTruthy()
    expect(rpc).not.toHaveBeenCalled()
    expect(signUp).not.toHaveBeenCalled()
  })

  it('contrasenas_distintas', async () => {
    await render(<RegisterScreen />)

    await fillAndSubmit({ 'Repetir contraseña': 'Feelo#2027' })

    expect(await screen.findByText('Las contraseñas no coinciden.')).toBeTruthy()
    expect(signUp).not.toHaveBeenCalled()
  })

  it('sin_conexion_al_comprobar_username', async () => {
    rpc.mockResolvedValue({ data: null, error: { message: 'TypeError: Network request failed' }, status: 0 } as never)
    await render(<RegisterScreen />)

    await fillAndSubmit()

    expect(await screen.findByText('No hay conexión. Revisa tu red e inténtalo de nuevo.')).toBeTruthy()
    expect(signUp).not.toHaveBeenCalled()
  })

  it('goes back to login', async () => {
    await render(<RegisterScreen />)

    await fireEvent.press(screen.getByRole('link', { name: '¿Ya tienes cuenta? Inicia sesión' }))

    expect(router.replace).toHaveBeenCalledWith('/login')
  })
})
