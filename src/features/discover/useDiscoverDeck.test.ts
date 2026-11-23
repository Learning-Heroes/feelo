import { act, renderHook } from '@testing-library/react-native'

import { discoverDeck } from '@/features/discover/discoverMock'
import { useDiscoverDeck } from '@/features/discover/useDiscoverDeck'

describe('useDiscoverDeck', () => {
  beforeEach(() => jest.useFakeTimers())
  afterEach(() => {
    jest.restoreAllMocks()
    jest.useRealTimers()
  })

  const swipe = (result: { current: ReturnType<typeof useDiscoverDeck> }, direction: Parameters<typeof result.current.requestSwipe>[0]) =>
    act(() => result.current.requestSwipe(direction))
  const advance = (ms: number) => act(() => jest.advanceTimersByTime(ms))

  it('mock_tiene_al_menos_cinco_clips', () => {
    expect(discoverDeck.length).toBeGreaterThanOrEqual(5)
  })

  it('empieza_con_cero_valorados_y_tres_cards', async () => {
    const { result } = await renderHook(() => useDiscoverDeck())

    expect(result.current.rated).toBe(0)
    expect(result.current.toast).toBeNull()
    expect(result.current.cards).toEqual([
      { key: 0, clip: discoverDeck[0], slot: 0 },
      { key: 1, clip: discoverDeck[1], slot: 1 },
      { key: 2, clip: discoverDeck[2], slot: 2 },
    ])
  })

  it('cuenta_derecha_izquierda_y_arriba_pero_no_abajo', async () => {
    const { result } = await renderHook(() => useDiscoverDeck())

    for (const direction of ['right', 'left', 'up', 'down'] as const) {
      await swipe(result, direction)
      await advance(280)
    }

    expect(result.current.rated).toBe(3)
  })

  it('avanza_a_los_280_ms', async () => {
    const { result } = await renderHook(() => useDiscoverDeck())

    await swipe(result, 'right')
    await advance(279)
    expect(result.current.cards[0].clip).toBe(discoverDeck[0])
    expect(result.current.exiting).toBe(true)

    await advance(1)
    expect(result.current.cards[0].clip).toBe(discoverDeck[1])
    expect(result.current.cards[0].key).toBe(1)
    expect(result.current.exiting).toBe(false)
  })

  it('da_la_vuelta_tras_n_swipes', async () => {
    const { result } = await renderHook(() => useDiscoverDeck())

    for (let i = 0; i < discoverDeck.length; i++) {
      await swipe(result, 'right')
      await advance(280)
    }

    expect(result.current.cards[0].clip).toBe(discoverDeck[0])
    expect(result.current.cards[1].clip).toBe(discoverDeck[1])
  })

  it('toast_con_mensaje_de_la_direccion_y_se_oculta_a_los_1400', async () => {
    const { result } = await renderHook(() => useDiscoverDeck())

    await swipe(result, 'right')
    expect(result.current.toast?.message).toBe('Me gustó · guardado')

    await advance(1399)
    expect(result.current.toast).not.toBeNull()
    await advance(1)
    expect(result.current.toast).toBeNull()
  })

  it('swipe_nuevo_reinicia_el_toast', async () => {
    const { result } = await renderHook(() => useDiscoverDeck())

    await swipe(result, 'right')
    const firstId = result.current.toast?.id
    await advance(1000)
    await swipe(result, 'left')

    expect(result.current.toast?.message).toBe('No me gustó · anotado')
    expect(result.current.toast?.id).not.toBe(firstId)
    await advance(1300)
    expect(result.current.toast).not.toBeNull()
    await advance(100)
    expect(result.current.toast).toBeNull()
  })

  it('segundo_swipe_mientras_sale_se_ignora', async () => {
    const { result } = await renderHook(() => useDiscoverDeck())

    await act(() => {
      result.current.requestSwipe('right')
      result.current.requestSwipe('up')
    })
    await swipe(result, 'up')

    expect(result.current.rated).toBe(1)
    expect(result.current.toast?.message).toBe('Me gustó · guardado')
    await advance(280)
    expect(result.current.cards[0].key).toBe(1)
  })

  it('desmontar_limpia_los_timers', async () => {
    const { result, unmount } = await renderHook(() => useDiscoverDeck())

    const setSpy = jest.spyOn(globalThis, 'setTimeout')
    const clearSpy = jest.spyOn(globalThis, 'clearTimeout')
    await swipe(result, 'right')
    const ours = setSpy.mock.calls
      .map((call, index) => ({ delay: call[1], id: setSpy.mock.results[index].value as unknown }))
      .filter(({ delay }) => delay === 280 || delay === 1400)
    expect(ours).toHaveLength(2)

    await unmount()

    for (const { id } of ours) expect(clearSpy).toHaveBeenCalledWith(id)
  })
})
