import { AuthRetryableFetchError } from '@supabase/supabase-js'
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native'

import { LogoutButton } from '@/features/auth/LogoutButton'
import { useAuthStore } from '@/features/auth/useAuthStore'

jest.mock('@/lib/supabase', () => ({ supabase: { auth: {} } }))

const signOut = jest.fn()

beforeEach(() => {
  signOut.mockReset()
  useAuthStore.setState({ signOut })
})

describe('LogoutButton', () => {
  it('logout_llama_a_signout', async () => {
    signOut.mockResolvedValue(null)
    await render(<LogoutButton />)

    await fireEvent.press(screen.getByRole('button', { name: 'Cerrar sesión' }))

    await waitFor(() => expect(signOut).toHaveBeenCalledTimes(1))
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('shows the error when sign out fails', async () => {
    signOut.mockResolvedValue(new AuthRetryableFetchError('Network request failed', 0))
    await render(<LogoutButton />)

    await fireEvent.press(screen.getByRole('button', { name: 'Cerrar sesión' }))

    expect(await screen.findByText('No hay conexión. Revisa tu red e inténtalo de nuevo.')).toBeTruthy()
  })
})
