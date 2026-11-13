import { render, screen } from '@testing-library/react-native'
import { StyleSheet } from 'react-native'

import { ScreenTitle } from '@/components/ScreenTitle'
import { collectHostNodes } from '@/testing/collectHostNodes'

describe('ScreenTitle', () => {
  it.each(['Sugerir', 'Perfil'])('pantallas_vacias_solo_tienen_titulo (%s)', async (title) => {
    await render(<ScreenTitle title={title} />)

    const texts = collectHostNodes(screen.toJSON(), 'Text')
    expect(texts).toHaveLength(1)
    expect(texts[0]?.children).toEqual([title])

    const titleText = screen.getByText(title)
    expect(titleText).toHaveProp('accessibilityRole', 'header')
    expect(StyleSheet.flatten(titleText.props.style)).toMatchObject({
      fontFamily: 'Sora_800ExtraBold',
      fontSize: 24,
      letterSpacing: -0.48,
      color: '#F2F1F7',
    })
  })
})
