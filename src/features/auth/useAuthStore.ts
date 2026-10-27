import type { AuthError, Session } from '@supabase/supabase-js'
import { create } from 'zustand'

import { supabase } from '@/lib/supabase'

interface AuthState {
  session: Session | null
  isRestoring: boolean
  init: () => () => void
  signOut: () => Promise<AuthError | null>
}

export const useAuthStore = create<AuthState>()((set) => ({
  session: null,
  isRestoring: true,
  // onAuthStateChange emits INITIAL_SESSION once the stored session is restored, then every change.
  init: () => {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log(session)
      set({ session, isRestoring: false })
    })
    return () => data.subscription.unsubscribe()
  },
  signOut: async () => (await supabase.auth.signOut()).error,
}))
