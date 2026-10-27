import { Sora_400Regular, Sora_600SemiBold, Sora_800ExtraBold, useFonts } from '@expo-google-fonts/sora'
import { SplashScreen, Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'

import { useAuthStore } from '@/features/auth/useAuthStore'

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({ Sora_400Regular, Sora_600SemiBold, Sora_800ExtraBold })
  const session = useAuthStore((state) => state.session)
  const isRestoring = useAuthStore((state) => state.isRestoring)

  useEffect(() => useAuthStore.getState().init(), [])

  // On a font error, render with the system font rather than a blank screen.
  const isReady = (fontsLoaded || fontError !== null) && !isRestoring

  useEffect(() => {
    if (isReady) SplashScreen.hide()
  }, [isReady])

  // Keep the splash until the session is restored, so login never flashes for a signed-in user.
  if (!isReady) return null

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={session !== null} redirectTo="/login">
          <Stack.Screen name="(app)" />
        </Stack.Protected>
        <Stack.Protected guard={session === null} redirectTo="/">
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
      </Stack>
    </>
  )
}
