import { ActivityIndicator, Pressable, Text } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

interface AuthSubmitButtonProps {
  label: string
  isSubmitting: boolean
  onPress: () => void
}

export function AuthSubmitButton({ label, isSubmitting, onPress }: AuthSubmitButtonProps) {
  const { theme } = useUnistyles()

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isSubmitting, busy: isSubmitting }}
      disabled={isSubmitting}
      onPress={onPress}
      style={styles.button}
    >
      {isSubmitting ? (
        <ActivityIndicator testID="auth-submit-loading" color={theme.colors.texto1} />
      ) : (
        <Text style={styles.label}>{label}</Text>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create((theme) => ({
  button: {
    minHeight: theme.layout.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.violeta,
  },
  label: {
    ...theme.typography.label,
    color: theme.colors.texto1,
  },
}))
