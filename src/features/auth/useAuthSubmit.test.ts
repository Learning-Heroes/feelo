import { act, renderHook } from '@testing-library/react-native'

import { useAuthSubmit } from '@/features/auth/useAuthSubmit'

describe('useAuthSubmit', () => {
  it('doble_toque_en_enviar', async () => {
    let finish!: (message: string | null) => void
    const action = jest.fn(() => new Promise<string | null>((resolve) => (finish = resolve)))
    const { result } = await renderHook(() => useAuthSubmit(action))

    let first!: Promise<void>
    await act(async () => {
      first = result.current.submit()
      void result.current.submit()
    })

    expect(action).toHaveBeenCalledTimes(1)
    expect(result.current.isSubmitting).toBe(true)

    await act(async () => {
      finish('Email o contraseña incorrectos.')
      await first
    })

    expect(result.current).toMatchObject({ isSubmitting: false, error: 'Email o contraseña incorrectos.' })
  })

  it('maps a thrown error', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    const { result } = await renderHook(() => useAuthSubmit(() => Promise.reject(new TypeError('Network request failed'))))

    await act(() => result.current.submit())

    expect(result.current.error).toBe('No hay conexión. Revisa tu red e inténtalo de nuevo.')
  })
})
