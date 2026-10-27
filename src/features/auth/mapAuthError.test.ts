import { AuthApiError, AuthRetryableFetchError, AuthUnknownError } from '@supabase/supabase-js'

import { mapAuthError } from '@/features/auth/mapAuthError'

describe('mapAuthError', () => {
  let consoleError: jest.SpyInstance

  beforeEach(() => {
    consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('credenciales_incorrectas', () => {
    expect(mapAuthError(new AuthApiError('Invalid login credentials', 400, 'invalid_credentials'))).toBe(
      'Email o contraseña incorrectos.',
    )
  })

  it('contrasena_debil_segun_servidor', () => {
    expect(mapAuthError(new AuthApiError('Weak password', 422, 'weak_password'))).toBe(
      'La contraseña no cumple los requisitos de seguridad.',
    )
  })

  it.each([
    new AuthApiError('Too many requests', 429, undefined),
    new AuthApiError('Rate limit', 429, 'over_request_rate_limit'),
    new AuthApiError('Email rate limit', 429, 'over_email_send_rate_limit'),
  ])('rate_limit', (error) => {
    expect(mapAuthError(error)).toBe('Demasiados intentos. Espera unos minutos y vuelve a intentarlo.')
  })

  it('sin_conexion', () => {
    expect(mapAuthError(new AuthRetryableFetchError('Network request failed', 0))).toBe(
      'No hay conexión. Revisa tu red e inténtalo de nuevo.',
    )
    expect(mapAuthError(new TypeError('Network request failed'))).toBe('No hay conexión. Revisa tu red e inténtalo de nuevo.')
  })

  it('error_desconocido', () => {
    const error = new AuthUnknownError('boom', null)

    expect(mapAuthError(error)).toBe('Algo ha fallado. Inténtalo de nuevo.')
    expect(consoleError).toHaveBeenCalledWith(error)
  })

  it('a 5xx is not reported as offline', () => {
    expect(mapAuthError(new AuthRetryableFetchError('Bad gateway', 502))).toBe('Algo ha fallado. Inténtalo de nuevo.')
  })
})
