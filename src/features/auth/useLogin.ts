import { mapAuthError } from '@/features/auth/mapAuthError'
import type { LoginValues } from '@/features/auth/schemas'
import { useAuthSubmit } from '@/features/auth/useAuthSubmit'
import { supabase } from '@/lib/supabase'

// On success the session changes and the route guard leaves the auth stack: no manual navigation.
export function useLogin() {
  return useAuthSubmit(async ({ email, password }: LoginValues) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error ? mapAuthError(error) : null
  })
}
