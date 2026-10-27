import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// `npm run test:integration` loads these from `supabase status -o env`, i.e. the local stack.
// The URL guard keeps this suite from ever reaching staging.
function localStack(): { url: string; anonKey: string; serviceRoleKey: string } {
  const url = process.env.API_URL
  const anonKey = process.env.ANON_KEY
  const serviceRoleKey = process.env.SERVICE_ROLE_KEY
  if (!url || !/^http:\/\/(127\.0\.0\.1|localhost):54321$/.test(url)) {
    throw new Error(`Integration tests only run against the local stack, got ${url}`)
  }
  if (!anonKey || !serviceRoleKey) throw new Error('Missing ANON_KEY or SERVICE_ROLE_KEY: run via npm run test:integration')
  return { url, anonKey, serviceRoleKey }
}

const USER_A = { email: 'usuario-a@feelo.test', password: 'FeeloA#2026' }
const USER_B = { email: 'usuario-b@feelo.test', password: 'FeeloB#2026' }

const { url, anonKey, serviceRoleKey } = localStack()
const noSession = { auth: { persistSession: false, autoRefreshToken: false } }
const admin = createClient(url, serviceRoleKey, noSession)
const anon = createClient(url, anonKey, noSession)

async function signedIn(user: { email: string; password: string }): Promise<{ client: SupabaseClient; id: string }> {
  const client = createClient(url, anonKey, noSession)
  const { data, error } = await client.auth.signInWithPassword(user)
  if (error) throw error
  return { client, id: data.user.id }
}

let a: { client: SupabaseClient; id: string }
let b: { client: SupabaseClient; id: string }

beforeAll(async () => {
  a = await signedIn(USER_A)
  b = await signedIn(USER_B)
})

describe('trigger on_auth_user_created', () => {
  it('trigger_crea_la_fila_de_usuario', async () => {
    const username = `trigger_${Date.now() % 1_000_000}`
    const email = `${username}@feelo.test`
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password: 'Trigger#2026',
      email_confirm: true,
      user_metadata: { username, country: 'ES', language: 'es-ES' },
    })
    if (error) throw error
    try {
      const { data: row } = await admin.from('user').select('*').eq('id', data.user.id).single()
      expect(row).toMatchObject({ id: data.user.id, email, username, country: 'ES', language: 'es-ES' })
    } finally {
      await admin.auth.admin.deleteUser(data.user.id)
    }
  })
})

describe('signUp from the app (email confirmation off)', () => {
  it('returns a session and the user can read its own row', async () => {
    const username = `signup_${Date.now() % 1_000_000}`
    const client = createClient(url, anonKey, noSession)
    const { data, error } = await client.auth.signUp({
      email: `${username}@feelo.test`,
      password: 'Feelo#2026',
      options: { data: { username, country: null, language: 'es' } },
    })
    if (error) throw error
    try {
      expect(data.session).not.toBeNull()
      const { data: rows } = await client.from('user').select('username, country, language')
      expect(rows).toEqual([{ username, country: null, language: 'es' }])
    } finally {
      if (data.user) await admin.auth.admin.deleteUser(data.user.id)
    }
  })

  it('rejects a password shorter than 8 characters', async () => {
    const { error } = await anon.auth.signUp({
      email: 'corta@feelo.test',
      password: 'Ab1!',
      options: { data: { username: 'corta_user' } },
    })
    expect(error?.code).toBe('weak_password')
  })
})

describe('RLS on public.user', () => {
  it('a_solo_ve_su_fila', async () => {
    const { data, error } = await a.client.from('user').select('id, username')
    expect(error).toBeNull()
    expect(data).toEqual([{ id: a.id, username: 'usuario_a' }])
  })

  it('a_no_ve_la_fila_de_b', async () => {
    const { data, error } = await a.client.from('user').select('*').eq('id', b.id)
    expect(error).toBeNull()
    expect(data).toEqual([])
  })

  it('anonimo_no_ve_usuarios', async () => {
    const { data, error } = await anon.from('user').select('*')
    expect(error).toBeNull()
    expect(data).toEqual([])
  })

  it('no_se_puede_escribir_directamente_en_user', async () => {
    const insert = await a.client.from('user').insert({ id: b.id, username: 'hack', email: 'hack@feelo.test' })
    const update = await a.client.from('user').update({ username: 'hack' }).eq('id', a.id)
    const remove = await a.client.from('user').delete().eq('id', a.id)
    const anonInsert = await anon.from('user').insert({ id: a.id, username: 'hack', email: 'hack@feelo.test' })

    for (const result of [insert, update, remove, anonInsert]) {
      expect(result.error?.code).toBe('42501')
    }
    const { data: row } = await admin.from('user').select('username').eq('id', a.id).single()
    expect(row).toEqual({ username: 'usuario_a' })
  })
})

describe('rpc is_username_available', () => {
  it.each([
    ['libre_123', true],
    ['usuario_a', false],
    ['USUARIO_A', false],
  ])('username %s → %s', async (username, expected) => {
    const { data, error } = await anon.rpc('is_username_available', { p_username: username })
    expect(error).toBeNull()
    expect(data).toBe(expected)
  })

  it('authenticated users can call it too', async () => {
    const { data, error } = await a.client.rpc('is_username_available', { p_username: 'usuario_b' })
    expect(error).toBeNull()
    expect(data).toBe(false)
  })
})
