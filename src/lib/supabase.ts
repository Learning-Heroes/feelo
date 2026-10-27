import { createClient } from '@supabase/supabase-js'
import { AppState, Platform } from 'react-native'

import type { Database } from '@/lib/database.types'
import { LargeSecureStore } from '@/lib/LargeSecureStore'
import { requireEnv } from '@/lib/requireEnv'

const url = requireEnv('EXPO_PUBLIC_SUPABASE_URL', process.env.EXPO_PUBLIC_SUPABASE_URL)
const anonKey = requireEnv('EXPO_PUBLIC_SUPABASE_ANON_KEY', process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY)

export const supabase = createClient<Database>(url, anonKey, {
  auth: {
    // expo-secure-store has no web implementation; on web supabase-js falls back to localStorage.
    storage: Platform.OS === 'web' ? undefined : LargeSecureStore,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

// Refresh the token only while the app is in the foreground.
AppState.addEventListener('change', (state) => {
  if (state === 'active') supabase.auth.startAutoRefresh()
  else supabase.auth.stopAutoRefresh()
})
