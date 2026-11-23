import { dominantAxis, exitTarget, overlayOpacity, resolveRelease } from '@/features/discover/swipeMath'

describe('dominantAxis', () => {
  it('horizontal_si_dx_es_mayor', () => {
    expect(dominantAxis(100, 95)).toBe('x')
    expect(dominantAxis(-100, 95)).toBe('x')
  })

  it('empate_va_a_vertical', () => {
    expect(dominantAxis(100, 100)).toBe('y')
    expect(dominantAxis(0, 0)).toBe('y')
  })

  it('diagonal_gana_el_eje_mayor', () => {
    expect(dominantAxis(95, -100)).toBe('y')
  })
})

describe('overlayOpacity', () => {
  it('cero_por_debajo_de_20', () => {
    expect(overlayOpacity('right', 15, 0)).toBe(0)
    expect(overlayOpacity('right', 20, 0)).toBe(0)
  })

  it('proporcional_al_desplazamiento', () => {
    expect(overlayOpacity('right', 45, 0)).toBe(0.5)
    expect(overlayOpacity('left', -45, 0)).toBe(0.5)
    expect(overlayOpacity('up', 0, -45)).toBe(0.5)
    expect(overlayOpacity('down', 0, 45)).toBe(0.5)
  })

  it('satura_en_1', () => {
    expect(overlayOpacity('right', 200, 0)).toBe(1)
  })

  it('solo_la_direccion_dominante', () => {
    expect(overlayOpacity('left', 45, 0)).toBe(0)
    expect(overlayOpacity('up', 45, 0)).toBe(0)
    expect(overlayOpacity('down', 45, 0)).toBe(0)
    expect(overlayOpacity('right', 100, -95)).toBe(1)
    expect(overlayOpacity('up', 100, -95)).toBe(0)
    expect(overlayOpacity('down', 100, 100)).toBe(1)
    expect(overlayOpacity('right', 100, 100)).toBe(0)
  })
})

describe('resolveRelease', () => {
  it('registra_en_las_cuatro_direcciones', () => {
    expect(resolveRelease(120, 0)).toBe('right')
    expect(resolveRelease(-120, 0)).toBe('left')
    expect(resolveRelease(0, -120)).toBe('up')
    expect(resolveRelease(0, 120)).toBe('down')
  })

  it('exactamente_90_no_cuenta', () => {
    expect(resolveRelease(90, 0)).toBeNull()
    expect(resolveRelease(0, -90)).toBeNull()
    expect(resolveRelease(91, 0)).toBe('right')
  })

  it('diagonal_gana_el_eje_mayor', () => {
    expect(resolveRelease(100, -95)).toBe('right')
  })

  it('empate_es_vertical', () => {
    expect(resolveRelease(100, 100)).toBe('down')
    expect(resolveRelease(-100, -100)).toBe('up')
  })
})

describe('exitTarget', () => {
  it('derecha', () => {
    expect(exitTarget('right', 120, 10)).toEqual({ x: 600, y: 20, rotate: 36 })
  })

  it('izquierda', () => {
    expect(exitTarget('left', -120, 10)).toEqual({ x: -600, y: 20, rotate: -36 })
  })

  it('arriba', () => {
    const target = exitTarget('up', 10, -120)
    expect(target.x).toBe(20)
    expect(target.y).toBe(-800)
    expect(target.rotate).toBeCloseTo(1.2)
  })

  it('abajo', () => {
    const target = exitTarget('down', -10, 120)
    expect(target.x).toBe(-20)
    expect(target.y).toBe(800)
    expect(target.rotate).toBeCloseTo(-1.2)
  })

  it('sin_arrastre_sale_recto', () => {
    expect(exitTarget('right', 0, 0)).toEqual({ x: 600, y: 0, rotate: 36 })
  })
})
