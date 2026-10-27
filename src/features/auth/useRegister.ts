import { getLocales } from 'expo-localization'

import { mapAuthError } from '@/features/auth/mapAuthError'
import { messages } from '@/features/auth/messages'
import type { RegisterValues } from '@/features/auth/schemas'
import { useAuthSubmit } from '@/features/auth/useAuthSubmit'
import { supabase } from '@/lib/supabase'

// Email confirmation is off: signUp returns a session and the route guard opens the private area.
export function useRegister() {
  return useAuthSubmit(async ({ email, password, username }: RegisterValues) => {
    const availability = await supabase.rpc('is_username_available', { p_username: username })
    if (availability.error) {
      return availability.status === 0 ? messages.errors.offline : mapAuthError(availability.error)
    }
    if (!availability.data) return messages.errors.usernameTaken

    const [locale] = getLocales()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username, country: locale.regionCode ?? null, language: locale.languageTag } },
    })
    return error ? mapAuthError(error) : null
  })
}
