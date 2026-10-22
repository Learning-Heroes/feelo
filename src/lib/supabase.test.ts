const originalEnv = process.env

const loadClient = () => jest.requireActual<typeof import('./supabase')>('./supabase')

afterEach(() => {
  process.env = originalEnv
  jest.resetModules()
})

describe('supabase client', () => {
  it('fails fast when the Supabase env vars are missing', () => {
    process.env = { ...originalEnv, EXPO_PUBLIC_SUPABASE_URL: '', EXPO_PUBLIC_SUPABASE_ANON_KEY: '' }

    expect(loadClient).toThrow(/EXPO_PUBLIC_SUPABASE_URL/)
  })

  it('creates the client when both env vars are set', () => {
    process.env = {
      ...originalEnv,
      EXPO_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
      EXPO_PUBLIC_SUPABASE_ANON_KEY: 'anon-key',
    }

    expect(loadClient().supabase.from).toEqual(expect.any(Function))
  })
})
