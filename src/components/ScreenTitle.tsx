import { Text, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

export interface ScreenTitleProps {
  title: string
}

// Placeholder screen: Noche background and only its title, in the Brand book Title role.
export function ScreenTitle({ title }: ScreenTitleProps) {
  return (
    <View style={styles.screen}>
      <Text accessibilityRole="header" style={styles.title}>
        {title}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create((theme, rt) => ({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: rt.insets.top,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.noche,
  },
  title: {
    ...theme.typography.title,
    color: theme.colors.texto1,
  },
}))
