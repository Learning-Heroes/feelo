import { fireEvent, render, screen } from '@testing-library/react-native'
import { router } from 'expo-router'

import { DiscoverScreen } from '@/features/discover/DiscoverScreen'

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), navigate: jest.fn(), replace: jest.fn() },
}))

const ZONES = ['clip-area', 'clip-title', 'clip-tags', 'clip-platforms', 'clip-description']

describe('DiscoverScreen', () => {
  afterEach(() => {
    jest.restoreAllMocks()
    jest.clearAllMocks()
  })

  it('muestra_la_card_mock_completa', async () => {
    await render(<DiscoverScreen />)

    for (const text of [
      'CLIP',
      '▶ 1:42',
      'Título de ejemplo',
      '🎬 Película',
      'Comedia',
      'Netflix',
      'Prime',
      'Descripción corta de ejemplo para comprobar cómo se lee el texto de la card.',
    ]) {
      expect(screen.getByText(text)).toBeOnTheScreen()
    }
  })

  it('zonas_en_orden', async () => {
    await render(<DiscoverScreen />)

    const card = screen.getByTestId('clip-card')
    const found = card.children
      .map((child) => (typeof child === 'string' ? undefined : child.props.testID))
      .filter((id): id is string => ZONES.includes(id))

    expect(found).toEqual(ZONES)
  })

  it('card_tiene_label_accesible', async () => {
    await render(<DiscoverScreen />)

    expect(screen.getByLabelText('Título de ejemplo')).toBeOnTheScreen()
  })

  it('pulsar_la_card_no_hace_nada', async () => {
    await render(<DiscoverScreen />)
    const before = screen.toJSON()

    await fireEvent.press(screen.getByTestId('clip-card'))

    expect(screen.toJSON()).toEqual(before)
    expect(router.push).not.toHaveBeenCalled()
    expect(router.navigate).not.toHaveBeenCalled()
  })

  it('no_hay_peticiones_de_red', async () => {
    const fetchSpy = jest.spyOn(globalThis, 'fetch').mockImplementation(() => Promise.reject(new Error('no network')))

    await render(<DiscoverScreen />)

    expect(screen.getByTestId('clip-card')).toBeOnTheScreen()
    expect(fetchSpy).not.toHaveBeenCalled()
  })
})
