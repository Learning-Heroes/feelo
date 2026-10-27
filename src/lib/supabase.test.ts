import { AppState, type AppStateStatus } from 'react-native'

const originalEnv = process.env

const loadClient = () => jest.requireActual<typeof import('./supabase')>('./supabase')

const withEnv = () => {
  process.env = {
    ...originalEnv,
    EXPO_PUBLIC_SUPABASE_URL: 'http://127.0.0.1:54321',
    EXPO_PUBLIC_SUPABASE_ANON_KEY: 'anon-key',
  }
}

afterEach(() => {
  process.env = originalEnv
  jest.restoreAllMocks()
  jest.resetModules()
})

describe('supabase client', () => {
  it('fails fast when the Supabase env vars are missing', () => {
    process.env = { ...originalEnv, EXPO_PUBLIC_SUPABASE_URL: '', EXPO_PUBLIC_SUPABASE_ANON_KEY: '' }

    expect(loadClient).toThrow('Falta la variable de entorno EXPO_PUBLIC_SUPABASE_URL')
  })

  it('creates the client when both env vars are set', () => {
    withEnv()

    expect(loadClient().supabase.from).toEqual(expect.any(Function))
  })

  it('refresco_con_appstate', () => {
    withEnv()
    let onChange: ((state: AppStateStatus) => void) | undefined
    jest.spyOn(AppState, 'addEventListener').mockImplementation((_type, listener) => {
      onChange = listener as (state: AppStateStatus) => void
      return { remove: jest.fn() }
    })

    const { supabase } = loadClient()
    const start = jest.spyOn(supabase.auth, 'startAutoRefresh').mockResolvedValue()
    const stop = jest.spyOn(supabase.auth, 'stopAutoRefresh').mockResolvedValue()

    onChange?.('active')
    expect(start).toHaveBeenCalledTimes(1)

    onChange?.('background')
    expect(stop).toHaveBeenCalledTimes(1)
  })
})
