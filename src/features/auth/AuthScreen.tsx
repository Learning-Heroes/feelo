import type { ReactNode } from 'react'
import { Pressable, ScrollView, Text } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

interface AuthScreenProps {
  title: string
  error: string | null
  linkLabel: string
  onLinkPress: () => void
  children: ReactNode
}

// Shared frame of the login and register screens: title, form, form-level error, link to the other screen.
export function AuthScreen({ title, error, linkLabel, onLinkPress, children }: AuthScreenProps) {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text accessibilityRole="header" style={styles.title}>
        {title}
      </Text>
      {children}
      {error ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      ) : null}
      <Pressable accessibilityRole="link" accessibilityLabel={linkLabel} onPress={onLinkPress} style={styles.link}>
        <Text style={styles.linkText}>{linkLabel}</Text>
      </Pressable>
    </ScrollView>
  )
}

const styles = StyleSheet.create((theme, rt) => ({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.noche,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: theme.spacing.lg,
    paddingTop: rt.insets.top + theme.spacing.xl,
    paddingBottom: rt.insets.bottom + theme.spacing.xl,
    paddingHorizontal: theme.spacing.xl,
  },
  title: {
    ...theme.typography.title,
    color: theme.colors.texto1,
  },
  error: {
    ...theme.typography.body,
    color: theme.colors.error,
  },
  link: {
    minHeight: theme.layout.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkText: {
    ...theme.typography.body,
    color: theme.colors.texto2,
  },
}))
