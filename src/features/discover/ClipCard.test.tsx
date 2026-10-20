import { render, screen } from '@testing-library/react-native'

import { ClipCard } from '@/features/discover/ClipCard'
import { discoverMock } from '@/features/discover/discoverMock'

describe('ClipCard', () => {
  it('titulo_largo_se_corta_a_dos_lineas', async () => {
    const title = 'Un título de ejemplo larguísimo '.padEnd(80, 'x')
    expect(title).toHaveLength(80)

    await render(<ClipCard clip={{ ...discoverMock, title }} />)

    const titleText = screen.getByTestId('clip-title')
    expect(titleText).toHaveTextContent(title)
    expect(titleText.props.numberOfLines).toBe(2)
    expect(titleText.props.ellipsizeMode).toBe('tail')
  })

  it('sin_plataformas_no_pinta_chips', async () => {
    await render(<ClipCard clip={{ ...discoverMock, platforms: [] }} />)

    expect(screen.queryByTestId('clip-platforms')).not.toBeOnTheScreen()
    expect(screen.getByTestId('clip-title')).toBeOnTheScreen()
    expect(screen.getByTestId('clip-description')).toBeOnTheScreen()
  })
})
