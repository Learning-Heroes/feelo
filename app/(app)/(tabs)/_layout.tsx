import { Tabs } from 'expo-router/js-tabs'
import { StyleSheet } from 'react-native-unistyles'

import { DiscoverIcon } from '@/components/DiscoverIcon'
import { GlassTabBar } from '@/components/GlassTabBar'
import { ProfileIcon } from '@/components/ProfileIcon'
import { SuggestIcon } from '@/components/SuggestIcon'
import { useGlassTabBarHeight } from '@/components/useGlassTabBarHeight'

// No i18n yet (Decision 001): tab labels live here as constants.
const TAB_TITLES = { discover: 'Descubre', suggest: 'Sugerir', profile: 'Perfil' } as const

export default function TabsLayout() {
  const { total } = useGlassTabBarHeight()

  return (
    <Tabs
      tabBar={(props) => <GlassTabBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: [styles.scene, { paddingBottom: total }] }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: TAB_TITLES.discover, tabBarIcon: ({ color }) => <DiscoverIcon color={color} /> }}
      />
      <Tabs.Screen
        name="sugerir"
        options={{ title: TAB_TITLES.suggest, tabBarIcon: ({ color }) => <SuggestIcon color={color} /> }}
      />
      <Tabs.Screen
        name="perfil"
        options={{ title: TAB_TITLES.profile, tabBarIcon: ({ color }) => <ProfileIcon color={color} /> }}
      />
    </Tabs>
  )
}

const styles = StyleSheet.create((theme) => ({
  scene: { backgroundColor: theme.colors.noche },
}))
