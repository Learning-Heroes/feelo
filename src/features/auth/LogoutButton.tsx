import { Pressable, Text, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { mapAuthError } from '@/features/auth/mapAuthError'
import { messages } from '@/features/auth/messages'
import { useAuthStore } from '@/features/auth/useAuthStore'
import { useAuthSubmit } from '@/features/auth/useAuthSubmit'

// ponytail: floats over the top of the private screen until the Profile task gives it a home.
export function LogoutButton() {
  const signOut = useAuthStore((state) => state.signOut)
  const { submit, isSubmitting, error } = useAuthSubmit(async () => {
    const signOutError = await signOut()
    return signOutError ? mapAuthError(signOutError) : null
  })

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={messages.logout}
        accessibilityState={{ disabled: isSubmitting, busy: isSubmitting }}
        disabled={isSubmitting}
        onPress={() => submit()}
        style={styles.button}
      >
        <Text style={styles.label}>{messages.logout}</Text>
      </Pressable>
      {error ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create((theme, rt) => ({
  container: {
    position: 'absolute',
    top: rt.insets.top + theme.spacing.sm,
    left: theme.spacing.lg,
    right: theme.spacing.lg,
    alignItems: 'flex-end',
    gap: theme.spacing.xs,
  },
  button: {
    minHeight: theme.layout.touchTarget,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.chip,
  },
  label: {
    ...theme.typography.label,
    color: theme.colors.texto1,
  },
  error: {
    ...theme.typography.label,
    color: theme.colors.error,
  },
}))
