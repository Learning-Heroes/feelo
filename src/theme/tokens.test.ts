import { colors, glass, motion, radius, tabBar, typography } from '@/theme/tokens'

describe('tab bar tokens', () => {
  it('tokens_de_tab_bar_coinciden_con_mvp', () => {
    // Bar
    expect(tabBar.height).toBe(64)
    expect(radius.pill).toBe(99)
    expect(glass.bar.tint).toBe('rgba(10,10,16,.6)')
    expect(glass.bar.border).toBe('rgba(255,255,255,.13)')
    expect(glass.bar.solid).toBe('#0A0A10')
    expect(colors.highlight).toBe('rgba(255,255,255,.22)')
    expect(tabBar.shadow).toEqual({ offsetY: 18, blur: 40, color: 'rgba(0,0,0,.55)' })

    // Wrap
    expect(tabBar.wrapTop).toBe(10)
    expect(tabBar.wrapSide).toBe(26)
    expect(tabBar.wrapMinBottom).toBe(14)

    // Scale
    expect(tabBar.scalePressed).toBe(1.04)
    expect(tabBar.scaleDragging).toBe(1.06)

    // Indicator
    expect(tabBar.indicator.inset).toBe(6)
    expect(tabBar.indicator.offset).toBe(4)
    expect(tabBar.indicator.shrink).toBe(8)
    expect(tabBar.indicator.gradient).toEqual(['rgba(185,175,255,.22)', 'rgba(139,124,246,.08)'])
    expect(tabBar.indicator.border).toBe('rgba(139,124,246,.4)')
    expect(tabBar.indicator.glow).toEqual({ offsetY: 4, blur: 18, color: 'rgba(139,124,246,.25)' })
    expect(tabBar.indicator.highlight).toBe('rgba(255,255,255,.25)')

    // Items
    expect(tabBar.item.gap).toBe(3)
    expect(tabBar.item.iconSize).toBe(24)
    expect(tabBar.item.iconActiveScale).toBe(1.1)
    expect(tabBar.item.iconActiveLift).toBe(-1)
    expect(tabBar.item.cutoutOpacity).toBe(0.55)
    expect(typography.tabLabel).toMatchObject({ fontFamily: 'Sora_600SemiBold', fontSize: 10.5 })
    expect(colors.texto3).toBe('rgba(242,241,247,.34)')
    expect(colors.lavanda).toBe('#B9AFFF')

    // Motion
    expect(motion.spring).toEqual([0.3, 1.25, 0.4, 1])
    expect(motion.duration).toEqual({
      press: 300,
      indicatorTap: 450,
      indicatorDrag: 80,
      itemColor: 300,
      itemIcon: 350,
      reduceMotionFade: 200,
    })
  })
})
