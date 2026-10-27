import { zodResolver } from '@hookform/resolvers/zod'
import { router } from 'expo-router'
import { useForm } from 'react-hook-form'

import { AuthScreen } from '@/features/auth/AuthScreen'
import { AuthSubmitButton } from '@/features/auth/AuthSubmitButton'
import { AuthTextField } from '@/features/auth/AuthTextField'
import { messages } from '@/features/auth/messages'
import { registerSchema } from '@/features/auth/schemas'
import { useRegister } from '@/features/auth/useRegister'

export function RegisterScreen() {
  const { control, handleSubmit } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', username: '', password: '', confirmPassword: '' },
  })
  const { submit, isSubmitting, error } = useRegister()

  return (
    <AuthScreen
      title={messages.register.title}
      error={error}
      linkLabel={messages.register.toLogin}
      onLinkPress={() => router.replace('/login')}
    >
      <AuthTextField
        control={control}
        name="email"
        label={messages.fields.email}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        textContentType="emailAddress"
      />
      <AuthTextField
        control={control}
        name="username"
        label={messages.fields.username}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="username"
        textContentType="username"
      />
      <AuthTextField
        control={control}
        name="password"
        label={messages.fields.password}
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
      />
      <AuthTextField
        control={control}
        name="confirmPassword"
        label={messages.fields.confirmPassword}
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
      />
      <AuthSubmitButton label={messages.register.submit} isSubmitting={isSubmitting} onPress={handleSubmit(submit)} />
    </AuthScreen>
  )
}
