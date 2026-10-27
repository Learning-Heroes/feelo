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
} as const

export const layout = {
  cardMaxWidth: 420,
  progressHeight: 3,
  platformDot: 8,
  clipAspectRatio: 16 / 9,
  // Minimum touch target (a11y).
  touchTarget: 44,
} as const
