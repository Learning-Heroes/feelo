import { Sora_400Regular, Sora_600SemiBold, Sora_800ExtraBold, useFonts } from '@expo-google-fonts/sora'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({ Sora_400Regular, Sora_600SemiBold, Sora_800ExtraBold })

  // On a font error, render with the system font rather than a blank screen.
  if (!fontsLoaded && !fontError) return null

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  )
}
