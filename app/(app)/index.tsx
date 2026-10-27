import { LogoutButton } from '@/features/auth/LogoutButton'
import { DiscoverScreen } from '@/features/discover/DiscoverScreen'

export default function DiscoverRoute() {
  return (
    <>
      <DiscoverScreen />
      <LogoutButton />
    </>
  )
}
