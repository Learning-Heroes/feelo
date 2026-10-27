import { useRef, useState } from 'react'

import { mapAuthError } from '@/features/auth/mapAuthError'

// Runs an auth action that resolves to an error message (or null), one at a time.
export function useAuthSubmit<T = void>(action: (values: T) => Promise<string | null>) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // The ref blocks a second tap that lands before React re-renders the disabled button.
  const inFlight = useRef(false)

  const submit = async (values: T) => {
    if (inFlight.current) return
    inFlight.current = true
    setIsSubmitting(true)
    setError(null)
    try {
      setError(await action(values))
    } catch (thrown) {
      setError(mapAuthError(thrown))
    } finally {
      inFlight.current = false
      setIsSubmitting(false)
    }
  }

  return { submit, isSubmitting, error }
}
