// Design tokens from the Brand book v0.2 (§4 colour, §5 type, §10 components).
export const colors = {
  noche: '#0A0A10',
  violeta: '#8B7CF6',
  texto1: '#F2F1F7',
  texto2: 'rgba(242,241,247,.62)',
  texto3: 'rgba(242,241,247,.34)',
  // Niebla fill without blur: solid surface until GlassSurface exists.
  surface: 'rgba(255,255,255,.07)',
  surfaceBorder: 'rgba(255,255,255,.13)',
  // Not in the Brand book: placeholder for a clip with no video yet.
  clipPlaceholder: '#1C1830',
  chip: 'rgba(255,255,255,.08)',
  track: 'rgba(255,255,255,.16)',
  scrim: 'rgba(10,10,16,.6)',
  // Not in the Brand book: provisional red for form and auth errors (Toni, 2026-10-27).
  error: '#FF6B6B',
  // Active tab bar item (Brand book §10, prototype feelo-app.html).
  lavanda: '#B9AFFF',
  // 1 px inner top highlight on glass surfaces.
  highlight: 'rgba(255,255,255,.22)',
} as const

export const radius = {
  sm: 8,
  card: 26,
  pill: 99,
} as const

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
} as const

export const fonts = {
  regular: 'Sora_400Regular',
  semibold: 'Sora_600SemiBold',
  extrabold: 'Sora_800ExtraBold',
} as const

export const typography = {
  title: { fontFamily: fonts.extrabold, fontSize: 24, lineHeight: 30, letterSpacing: -0.48 },
  body: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 21 },
  label: { fontFamily: fonts.semibold, fontSize: 12, lineHeight: 16 },
  tabLabel: { fontFamily: fonts.semibold, fontSize: 10.5 },
} as const

export const layout = {
  cardMaxWidth: 420,
  progressHeight: 3,
  platformDot: 8,
  clipAspectRatio: 16 / 9,
  // Minimum touch target (a11y).
  touchTarget: 44,
} as const

// Brand book §9: cubic-bezier control points of motion.spring, and durations in ms.
export const motion = {
  spring: [0.3, 1.25, 0.4, 1],
  duration: {
    press: 300,
    indicatorTap: 450,
    indicatorDrag: 80,
    itemColor: 300,
    itemIcon: 350,
    reduceMotionFade: 200,
  },
} as const

// Glass surface variants: tint for the blur fallback, solid for Reduce Transparency.
export const glass = {
  borderWidth: 1,
  bar: {
    tint: colors.scrim,
    border: colors.surfaceBorder,
    solid: colors.noche,
    // Approximates CSS blur(28px); tune on device.
    blurIntensity: 60,
  },
} as const

// Floating tab bar (prototype feelo-app.html, "tab bar" block).
export const tabBar = {
  height: 64,
  wrapTop: 10,
  wrapSide: 26,
  wrapMinBottom: 14,
  scalePressed: 1.04,
  scaleDragging: 1.06,
  // A still press up to this long (ms) still counts as a tap on release.
  tapMaxDuration: 10000,
  shadow: { offsetY: 18, blur: 40, color: 'rgba(0,0,0,.55)' },
  indicator: {
    inset: 6,
    offset: 4,
    shrink: 8,
    gradient: ['rgba(185,175,255,.22)', 'rgba(139,124,246,.08)'],
    border: 'rgba(139,124,246,.4)',
    glow: { offsetY: 4, blur: 18, color: 'rgba(139,124,246,.25)' },
    highlight: 'rgba(255,255,255,.25)',
  },
  item: {
    gap: 3,
    iconSize: 24,
    iconActiveScale: 1.1,
    iconActiveLift: -1,
    cutoutOpacity: 0.55,
  },
} as const
