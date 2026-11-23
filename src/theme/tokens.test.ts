import {
  colors,
  counter,
  deck,
  discoverHeader,
  glass,
  legend,
  motion,
  overlay,
  radius,
  swipe,
  tabBar,
  toast,
  typography,
  wordmark,
} from '@/theme/tokens'

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
      swipeExit: 500,
      swipeReturn: 450,
      deckShift: 400,
      toastIn: 500,
      toastVisible: 1400,
    })
  })
})

describe('swiper tokens', () => {
  it('tokens_de_swiper_coinciden_con_mvp', () => {
    expect(colors.paz).toBe('#7DDCC8')
    expect(colors.tension).toBe('#E8506E')
    expect(colors.euforia).toBe('#FFAF5F')
    expect(colors.violetaDim).toBe('rgba(139,124,246,.16)')
    expect(colors.violetaBorder).toBe('rgba(139,124,246,.3)')
    expect(colors.violetaDeep).toBe('#6C5CE0')

    expect(swipe).toEqual({
      threshold: 90,
      overlayMin: 20,
      dragRotate: 0.05,
      exitRotate: 0.06,
      exitX: 600,
      exitY: 800,
      exitOtherAxisFactor: 2,
      advanceDelay: 280,
    })

    expect(motion.exit).toEqual([0.25, 0.8, 0.25, 1])
    expect(motion.duration).toMatchObject({
      swipeExit: 500,
      swipeReturn: 450,
      deckShift: 400,
      toastIn: 500,
      toastVisible: 1400,
      reduceMotionFade: 200,
    })

    expect(deck.slots).toEqual([
      { scale: 1, y: 0, opacity: 1 },
      { scale: 0.96, y: 13, opacity: 0.8 },
      { scale: 0.92, y: 26, opacity: 0.55 },
    ])

    expect(overlay.borderWidth).toBe(1.5)
    expect(overlay.paddingX).toBe(18)
    expect(overlay.paddingY).toBe(10)
    expect(overlay.right).toEqual({
      color: '#7DDCC8',
      background: 'rgba(20,70,60,.5)',
      anchor: 'left',
      offset: 18,
      rotate: -8,
    })
    expect(overlay.left).toEqual({
      color: '#E8506E',
      background: 'rgba(90,20,35,.5)',
      anchor: 'right',
      offset: 18,
      rotate: 8,
    })
    expect(overlay.up).toEqual({
      color: '#FFAF5F',
      background: 'rgba(90,60,20,.5)',
      anchor: 'bottom',
      offset: 110,
      rotate: -4,
    })
    expect(overlay.down).toEqual({
      color: '#B9AFFF',
      background: 'rgba(50,40,100,.5)',
      anchor: 'top',
      offset: 70,
      rotate: 3,
    })
    expect(typography.overlay).toMatchObject({ fontFamily: 'Sora_800ExtraBold', fontSize: 16 })

    expect(toast).toEqual({ top: 14, offscreen: 70, paddingX: 18, paddingY: 10 })
    expect(typography.toast).toMatchObject({ fontFamily: 'Sora_600SemiBold', fontSize: 13.5 })
    expect(glass.toast).toMatchObject({ tint: 'rgba(10,10,16,.75)', border: colors.surfaceBorder, solid: '#0A0A10' })
    expect(glass.overlayRight).toMatchObject({ tint: 'rgba(20,70,60,.5)', border: '#7DDCC8', solid: '#14463C' })
    expect(glass.overlayLeft).toMatchObject({ tint: 'rgba(90,20,35,.5)', border: '#E8506E', solid: '#5A1423' })
    expect(glass.overlayUp).toMatchObject({ tint: 'rgba(90,60,20,.5)', border: '#FFAF5F', solid: '#5A3C14' })
    expect(glass.overlayDown).toMatchObject({ tint: 'rgba(50,40,100,.5)', border: '#B9AFFF', solid: '#322864' })

    expect(typography.counter).toMatchObject({ fontFamily: 'Sora_600SemiBold', fontSize: 12 })
    expect(counter).toEqual({ paddingX: 12, paddingY: 6 })
    expect(typography.legend).toMatchObject({ fontFamily: 'Sora_600SemiBold', fontSize: 10.5 })
    expect(legend.emojiSize).toBe(14)
    expect(discoverHeader.padding).toEqual({ top: 4, x: 2, bottom: 12 })
  })

  it('tokens_de_wordmark_coinciden_con_mvp', () => {
    expect(wordmark.fontSize).toBe(24)
    expect(wordmark.letterSpacing).toBe(-1.2)
    expect(wordmark.orbSize).toBe(0.62)
    expect(wordmark.orbGap).toBe(0.06)
    expect(wordmark.orbDrop).toBe(0.02)
    expect(wordmark.orbCenter).toEqual([0.35, 0.3])
    expect(wordmark.orbStops).toEqual([
      [0, '#FFFFFF'],
      [0.35, '#B9AFFF'],
      [0.8, '#6C5CE0'],
    ])
    expect(wordmark.glow).toEqual({ color: 'rgba(139,124,246,.55)', radius: 0.4 })
  })
})
