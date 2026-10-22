import { createClient } from '@supabase/supabase-js'

const url = process.env.EXPO_PUBLIC_SUPABASE_URL
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  throw new Error(
    'Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY: copy .env.example to .env and fill them in (README → Supabase).',
  )
}

// ponytail: no session persistence until the auth task adds secure storage; add the generated Database type once src/lib/database.types.ts exists.
export const supabase = createClient(url, anonKey, {
  auth: { persistSession: false },
})
