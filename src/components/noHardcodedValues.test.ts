import { readSourceFiles } from '@/testing/readSourceFiles'

// Criterion 17: the tab bar, glass surface and tab routes read every colour, radius and
// duration from src/theme/ (SVG path data excepted) and never reach the network.
const SCANNED = [
  'src/components/GlassTabBar.tsx',
  'src/components/GlassSurface.tsx',
  'src/components/useGlassTabBarHeight.ts',
  'src/components/ScreenTitle.tsx',
  'src/components/DiscoverIcon.tsx',
  'src/components/SuggestIcon.tsx',
  'src/components/ProfileIcon.tsx',
]

const LITERALS: [string, RegExp][] = [
  ['hex colour', /#[0-9a-fA-F]{3,8}\b/],
  ['rgb/hsl colour', /\b(rgba?|hsla?)\(/],
  ['radius', /[rR]adius\s*:\s*-?\d/],
  ['duration', /duration\s*:\s*\d/],
  ['delay', /delay\s*:\s*\d/],
]

function scannedFiles() {
  return readSourceFiles('src/components', 'app/(app)/(tabs)').filter(
    (file) => SCANNED.includes(file.path) || file.path.startsWith('app/(app)/(tabs)/'),
  )
}

describe('tab bar sources', () => {
  it('escanea_todos_los_ficheros_de_la_tarea', () => {
    const paths = scannedFiles().map((file) => file.path)
    expect(paths).toEqual(expect.arrayContaining([...SCANNED, 'app/(app)/(tabs)/_layout.tsx']))
  })

  it('sin_literales_fuera_de_theme', () => {
    const offences = scannedFiles().flatMap((file) =>
      LITERALS.filter(([, pattern]) => pattern.test(file.content)).map(([kind]) => `${file.path}: ${kind}`),
    )

    expect(offences).toEqual([])
  })

  it('sin_cliente_de_supabase_ni_fetch', () => {
    const offences = scannedFiles()
      .filter((file) => /@\/lib\/supabase|\bfetch\(/.test(file.content))
      .map((file) => file.path)

    expect(offences).toEqual([])
  })
})
