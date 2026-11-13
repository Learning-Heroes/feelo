import { act, render, screen } from '@testing-library/react-native'
import { isLiquidGlassAvailable } from 'expo-glass-effect'
import { AccessibilityInfo, StyleSheet, Text } from 'react-native'

import { GlassSurface } from '@/components/GlassSurface'
import { readSourceFiles } from '@/testing/readSourceFiles'

type Listener = (enabled: boolean) => void

let reduceTransparencyListener: Listener | undefined

function mockReduceTransparency(enabled: boolean) {
  jest.spyOn(AccessibilityInfo, 'isReduceTransparencyEnabled').mockResolvedValue(enabled)
  jest.spyOn(AccessibilityInfo, 'addEventListener').mockImplementation((event, listener) => {
    if (event === 'reduceTransparencyChanged') reduceTransparencyListener = listener as Listener
    return { remove: jest.fn() }
  })
}

async function renderSurface() {
  await render(
    <GlassSurface variant="bar" testID="surface">
      <Text>content</Text>
    </GlassSurface>,
  )
  // Let the Reduce Transparency query resolve.
  await act(async () => {})
}

function styleOf(testID: string) {
  return StyleSheet.flatten(screen.getByTestId(testID).props.style)
}

beforeEach(() => {
  reduceTransparencyListener = undefined
  jest.mocked(isLiquidGlassAvailable).mockReturnValue(false)
})

afterEach(() => jest.restoreAllMocks())

describe('GlassSurface', () => {
  it('glass_surface_usa_glass_nativo_en_ios_26', async () => {
    mockReduceTransparency(false)
    jest.mocked(isLiquidGlassAvailable).mockReturnValue(true)

    await renderSurface()

    expect(screen.getByTestId('GlassView')).toBeTruthy()
    expect(screen.queryByTestId('BlurView')).toBeNull()
    expect(screen.getByText('content')).toBeTruthy()
  })

  it('glass_surface_usa_blur_en_fallback', async () => {
    mockReduceTransparency(false)

    await renderSurface()

    expect(screen.queryByTestId('GlassView')).toBeNull()
    expect(styleOf('BlurView')).toMatchObject({ borderColor: 'rgba(255,255,255,.13)', borderWidth: 1 })
    expect(styleOf('glass-tint')).toMatchObject({ backgroundColor: 'rgba(10,10,16,.6)' })
    expect(screen.getByText('content')).toBeTruthy()
  })

  it('reduce_transparency_usa_solido', async () => {
    mockReduceTransparency(true)
    jest.mocked(isLiquidGlassAvailable).mockReturnValue(true)

    await renderSurface()

    expect(screen.queryByTestId('GlassView')).toBeNull()
    expect(screen.queryByTestId('BlurView')).toBeNull()
    expect(styleOf('surface')).toMatchObject({
      backgroundColor: '#0A0A10',
      borderColor: 'rgba(255,255,255,.13)',
    })
    expect(screen.getByText('content')).toBeTruthy()
  })

  it('reduce_transparency_cambia_en_caliente', async () => {
    mockReduceTransparency(false)

    await renderSurface()
    expect(screen.getByTestId('BlurView')).toBeTruthy()

    await act(async () => reduceTransparencyListener?.(true))

    expect(screen.queryByTestId('BlurView')).toBeNull()
    expect(styleOf('surface')).toMatchObject({ backgroundColor: '#0A0A10' })
  })

  it('sin_api_de_reduce_transparency_usa_el_fallback_de_blur', async () => {
    // react-native-web's AccessibilityInfo has no isReduceTransparencyEnabled.
    jest.spyOn(AccessibilityInfo, 'addEventListener').mockReturnValue({ remove: jest.fn() } as never)
    const info = AccessibilityInfo as Partial<typeof AccessibilityInfo>
    const original = info.isReduceTransparencyEnabled
    delete info.isReduceTransparencyEnabled

    try {
      await renderSurface()

      expect(screen.getByTestId('BlurView')).toBeTruthy()
      expect(screen.getByText('content')).toBeTruthy()
    } finally {
      info.isReduceTransparencyEnabled = original
    }
  })

  it('ningun_fichero_importa_glass_directamente', () => {
    const glassImport = /from\s+['"](expo-glass-effect|expo-blur|@callstack\/liquid-glass)['"]/

    const importers = readSourceFiles('src', 'app')
      .filter((file) => !/\.test\.tsx?$/.test(file.path))
      .filter((file) => glassImport.test(file.content))
      .map((file) => file.path)

    expect(importers).toEqual(['src/components/GlassSurface.tsx'])
  })
})
