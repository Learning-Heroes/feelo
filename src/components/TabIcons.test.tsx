import { render, screen } from '@testing-library/react-native'

import { DiscoverIcon } from '@/components/DiscoverIcon'
import { ProfileIcon } from '@/components/ProfileIcon'
import { SuggestIcon } from '@/components/SuggestIcon'
import { collectHostNodes } from '@/testing/collectHostNodes'

const LAVANDA = '#B9AFFF'
const ALL_SHAPES = ['RNSVGRect', 'RNSVGPath', 'RNSVGCircle']

function shapes() {
  const tree = screen.toJSON()
  return ALL_SHAPES.flatMap((type) => collectHostNodes(tree, type))
}

describe('tab icons', () => {
  it.each([
    ['DiscoverIcon', DiscoverIcon],
    ['SuggestIcon', SuggestIcon],
    ['ProfileIcon', ProfileIcon],
  ])('%s se pinta a 24×24 con el color recibido', async (_name, Icon) => {
    await render(<Icon color={LAVANDA} />)

    const [svg] = collectHostNodes(screen.toJSON(), 'RNSVGSvgView')
    expect(svg?.props).toMatchObject({ bbWidth: 24, bbHeight: 24 })
    expect(shapes().length).toBeGreaterThan(0)
  })

  it('descubre_tiene_corte_interior_en_noche', async () => {
    await render(<DiscoverIcon color={LAVANDA} />)

    const rects = collectHostNodes(screen.toJSON(), 'RNSVGRect')
    expect(rects).toHaveLength(2)
    // Outer card in the state colour, inner cut-out always Noche at .55.
    expect(rects[1]?.props).toMatchObject({ x: 7, y: 7, width: 10, height: 10, opacity: 0.55 })
  })

  it('sugerir_y_perfil_usan_los_trazados_del_mvp', async () => {
    await render(<SuggestIcon color={LAVANDA} />)
    expect(collectHostNodes(screen.toJSON(), 'RNSVGPath')[0]?.props.d).toBe(
      'M12 2.5l2.2 6.3 6.3 2.2-6.3 2.2L12 19.5l-2.2-6.3-6.3-2.2 6.3-2.2z',
    )

    await render(<ProfileIcon color={LAVANDA} />)
    expect(collectHostNodes(screen.toJSON(), 'RNSVGCircle')[0]?.props).toMatchObject({ cx: 12, cy: 8, r: 4.5 })
    expect(collectHostNodes(screen.toJSON(), 'RNSVGPath')[0]?.props.d).toBe('M3.5 21a8.5 8.5 0 0 1 17 0z')
  })
})
