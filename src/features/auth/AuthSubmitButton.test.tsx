import { render, screen } from '@testing-library/react-native'

import { AuthSubmitButton } from '@/features/auth/AuthSubmitButton'

describe('AuthSubmitButton', () => {
  it('boton_deshabilitado_con_carga', async () => {
    await render(<AuthSubmitButton label="Iniciar sesión" isSubmitting onPress={jest.fn()} />)

    expect(screen.getByRole('button', { name: 'Iniciar sesión' })).toBeDisabled()
    expect(screen.getByTestId('auth-submit-loading')).toBeTruthy()
  })

  it('shows the label when idle', async () => {
    await render(<AuthSubmitButton label="Iniciar sesión" isSubmitting={false} onPress={jest.fn()} />)

    expect(screen.getByRole('button', { name: 'Iniciar sesión' })).toBeEnabled()
    expect(screen.getByText('Iniciar sesión')).toBeTruthy()
  })
})
