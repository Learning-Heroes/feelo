import { isAuthError, isAuthRetryableFetchError } from '@supabase/supabase-js'

import { messages } from '@/features/auth/messages'

const { errors } = messages

const RATE_LIMIT_CODES = new Set(['over_request_rate_limit', 'over_email_send_rate_limit'])

// Status 0 means the request never got a response; a 5xx retryable error is a server failure, not "offline".
export function mapAuthError(error: any): string {
  if (error instanceof TypeError || (isAuthRetryableFetchError(error) && error.status === 0)) return errors.offline
  if (isAuthError(error)) {
    if (error.status === 429 || RATE_LIMIT_CODES.has(error.code ?? '')) return errors.rateLimited
    if (error.code === 'invalid_credentials') return errors.invalidCredentials
    if (error.code === 'weak_password') return errors.weakPassword
  }
  // Required by the task: unexpected errors are logged for debugging.
  // eslint-disable-next-line no-console
  console.error(error)
  return errors.unknown
}
