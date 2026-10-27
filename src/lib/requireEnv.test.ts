import { requireEnv } from '@/lib/requireEnv'

describe('requireEnv', () => {
  it('falta_variable_de_entorno', () => {
    expect(() => requireEnv('EXPO_PUBLIC_SUPABASE_URL', undefined)).toThrow(
      'Falta la variable de entorno EXPO_PUBLIC_SUPABASE_URL',
    )
    expect(() => requireEnv('EXPO_PUBLIC_SUPABASE_ANON_KEY', '')).toThrow(
      'Falta la variable de entorno EXPO_PUBLIC_SUPABASE_ANON_KEY',
    )
  })

  it('returns the value when it is set', () => {
    expect(requireEnv('EXPO_PUBLIC_SUPABASE_URL', 'http://127.0.0.1:54321')).toBe('http://127.0.0.1:54321')
  })
})
