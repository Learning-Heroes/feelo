import { ScreenTitle } from '@/components/ScreenTitle'
import { LogoutButton } from '@/features/auth/LogoutButton'

// No i18n yet (Decision 001).
const TITLE = 'Perfil'

// The logout button is temporary: it lives here until the Profile task gives it a home.
export default function PerfilRoute() {
  return (
    <>
      <ScreenTitle title={TITLE} />
      <LogoutButton />
    </>
  )
}
