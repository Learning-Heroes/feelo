import { zodResolver } from '@hookform/resolvers/zod'
import { router } from 'expo-router'
import { useForm } from 'react-hook-form'

import { AuthScreen } from '@/features/auth/AuthScreen'
import { AuthSubmitButton } from '@/features/auth/AuthSubmitButton'
import { AuthTextField } from '@/features/auth/AuthTextField'
import { messages } from '@/features/auth/messages'
import { loginSchema } from '@/features/auth/schemas'
import { useLogin } from '@/features/auth/useLogin'

export function LoginScreen() {
  const { control, handleSubmit } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })
  const { submit, isSubmitting, error } = useLogin()

  return (
    <AuthScreen
      title={messages.login.title}
      error={error}
      linkLabel={messages.login.toRegister}
      onLinkPress={() => router.replace('/register')}
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
        name="password"
        label={messages.fields.password}
        secureTextEntry
        autoComplete="current-password"
        textContentType="password"
      />
      <AuthSubmitButton label={messages.login.submit} isSubmitting={false} onPress={handleSubmit(submit)} />
    </AuthScreen>
  )
}
