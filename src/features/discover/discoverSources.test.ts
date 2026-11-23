import { readSourceFiles } from '@/testing/readSourceFiles'

// Static checks over the Discover swiper: no haptics, no network, and every colour, duration
// and threshold read from src/theme/. Test files are skipped: they assert the token values.
const isSource = (path: string) => !/\.test\.tsx?$/.test(path)

const discoverFiles = () => readSourceFiles('src/features/discover').filter((file) => isSource(file.path))

// Files of this change outside the feature folder.
const CHANGE_FILES = ['src/components/Wordmark.tsx', 'app/(app)/(tabs)/index.tsx', 'app/(app)/(tabs)/perfil.tsx']
const changeFiles = () => [
  ...discoverFiles(),
  ...readSourceFiles('src/components', 'app/(app)/(tabs)').filter((file) => CHANGE_FILES.includes(file.path)),
]

const LITERALS: [string, RegExp][] = [
  ['hex colour', /#[0-9a-fA-F]{3,8}\b/],
  ['rgb/hsl colour', /\b(rgba?|hsla?)\(/],
  ['duration', /duration\s*:\s*\d/i],
  ['delay', /delay\s*:\s*\d/i],
  ['timer', /set(Timeout|Interval)\([^)]*,\s*\d/],
  // `> 0` is a sign or emptiness check, not a threshold.
  ['threshold comparison', /[^=<]>=?\s*(?!0(?![.\d]))\d/],
]

// The platform brand colours of the mock clips are the only allowed colour literals.
const COLOUR_KINDS = ['hex colour', 'rgb/hsl colour']

describe('discover sources', () => {
  it('escanea_los_ficheros_del_swiper', () => {
    const paths = discoverFiles().map((file) => file.path)
    expect(paths).toEqual(
      expect.arrayContaining([
        'src/features/discover/DiscoverScreen.tsx',
        'src/features/discover/SwipeDeck.tsx',
        'src/features/discover/SwipeableClipCard.tsx',
        'src/features/discover/swipeMath.ts',
        'src/features/discover/useDiscoverDeck.ts',
        'src/features/discover/discoverMock.ts',
      ]),
    )
  })

  it('no_importa_haptics', () => {
    const offences = discoverFiles()
      .filter((file) => /expo-haptics/.test(file.content))
      .map((file) => file.path)

    expect(offences).toEqual([])
  })

  it('sin_literales_fuera_de_theme', () => {
    const offences = discoverFiles().flatMap((file) =>
      LITERALS.filter(([kind, pattern]) => {
        if (file.path === 'src/features/discover/discoverMock.ts' && COLOUR_KINDS.includes(kind)) return false
        return pattern.test(file.content)
      }).map(([kind]) => `${file.path}: ${kind}`),
    )

    expect(offences).toEqual([])
  })

  it('sin_cliente_de_supabase_ni_fetch', () => {
    const offences = changeFiles()
      .filter((file) => /@\/lib\/supabase|\bfetch\(/.test(file.content))
      .map((file) => file.path)

    expect(offences).toEqual([])
  })
})
