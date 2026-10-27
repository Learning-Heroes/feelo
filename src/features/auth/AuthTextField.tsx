import { type Control, type FieldValues, type Path, useController } from 'react-hook-form'
import { Text, TextInput, type TextInputProps, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

interface AuthTextFieldProps<T extends FieldValues> extends Omit<TextInputProps, 'value' | 'onChangeText' | 'onBlur'> {
  control: Control<T>
  name: Path<T>
  label: string
}

export function AuthTextField<T extends FieldValues>({ control, name, label, ...inputProps }: AuthTextFieldProps<T>) {
  const { field, fieldState } = useController({ control, name })

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        value={field.value}
        onChangeText={field.onChange}
        onBlur={field.onBlur}
        style={styles.input}
        {...inputProps}
      />
      {fieldState.error ? <Text style={styles.error}>{fieldState.error.message}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  field: {
    gap: theme.spacing.xs,
  },
  label: {
    ...theme.typography.label,
    color: theme.colors.texto2,
  },
  input: {
    ...theme.typography.body,
    minHeight: theme.layout.touchTarget,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    backgroundColor: theme.colors.surface,
    color: theme.colors.texto1,
  },
  error: {
    ...theme.typography.label,
    color: theme.colors.error,
  },
}))
