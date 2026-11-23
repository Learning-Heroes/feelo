import { render, screen } from '@testing-library/react-native'
import { StyleSheet } from 'react-native'

import { Wordmark } from '@/components/Wordmark'
import { colors, wordmark } from '@/theme/tokens'
import { collectHostNodes } from '@/testing/collectHostNodes'

const ORB_SIZE = wordmark.fontSize * wordmark.orbSize

// react-native-svg hands the gradient to native as [offset, ARGB int, offset, ARGB int, ...].
const argb = (hex: string) => (0xff000000 | parseInt(hex.slice(1), 16)) | 0

describe('Wordmark', () => {
  it('es_un_unico_header_accesible_llamado_feelo', async () => {
    await render(<Wordmark />)

    const header = screen.getByRole('header', { name: 'Feelo' })
    expect(header).toHaveProp('accessible', true)
    expect(header).toHaveProp('accessibilityLabel', 'Feelo')
    // The children are hidden from the accessibility tree, so a reader never says "feel".
    expect(screen.queryByText('feel')).toBeNull()
    expect(screen.getByText('feel', { includeHiddenElements: true })).toHaveProp('importantForAccessibility', 'no-hide-descendants')
    expect(screen.getByTestId('wordmark-orb', { includeHiddenElements: true })).toHaveProp(
      'accessibilityElementsHidden',
      true,
    )
  })

  it('pinta_feel_con_la_tipografia_del_mvp', async () => {
    await render(<Wordmark />)

    const text = screen.getByText('feel', { includeHiddenElements: true })
    expect(StyleSheet.flatten(text.props.style)).toMatchObject({
      fontFamily: 'Sora_800ExtraBold',
      fontSize: wordmark.fontSize,
      letterSpacing: wordmark.letterSpacing,
      lineHeight: wordmark.fontSize,
      color: colors.texto1,
    })
  })

  it('pinta_el_orbe_con_gradiente_radial_de_los_tokens', async () => {
    await render(<Wordmark />)
    const tree = screen.toJSON()

    const [svg] = collectHostNodes(tree, 'RNSVGSvgView')
    expect(svg?.props.bbWidth).toBeCloseTo(ORB_SIZE)
    expect(svg?.props.bbHeight).toBeCloseTo(ORB_SIZE)

    const [gradient] = collectHostNodes(tree, 'RNSVGRadialGradient')
    expect(gradient?.props).toMatchObject({ cx: '35%', cy: '30%' })

    expect(gradient?.props.gradient).toEqual(wordmark.orbStops.flatMap(([offset, color]) => [offset, argb(color)]))
    expect(collectHostNodes(tree, 'RNSVGCircle')).toHaveLength(1)
  })

  it('el_orbe_se_separa_y_brilla_segun_los_tokens', async () => {
    await render(<Wordmark />)

    const orb = screen.getByTestId('wordmark-orb', { includeHiddenElements: true })
    expect(StyleSheet.flatten(orb.props.style)).toMatchObject({
      marginLeft: wordmark.fontSize * wordmark.orbGap,
      shadowColor: wordmark.glow.color,
      shadowRadius: wordmark.fontSize * wordmark.glow.radius,
    })
  })
})
