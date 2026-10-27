import { z } from 'zod'

import { messages } from '@/features/auth/messages'

const { errors } = messages

// Any character that is not a letter or a digit. Only the app enforces it: Supabase's
// password_requirements can't require symbols alone (accepted risk, see the task).
const SPECIAL_CHARACTER = /[^\p{L}\p{N}]/u

const email = z.string().trim().toLowerCase().min(1, errors.required).pipe(z.email(errors.invalidEmail))

const newPassword = z
  .string()
  .min(1, errors.required)
  .min(8, errors.passwordTooShort)
  .regex(SPECIAL_CHARACTER, errors.passwordNoSpecial)

export const loginSchema = z.object({
  email,
  password: z.string().min(1, errors.required),
})

export const registerSchema = z
  .object({
    email,
    username: z.string().min(1, errors.required).regex(/^[a-z0-9_]{3,20}$/, errors.invalidUsername),
    password: newPassword,
    confirmPassword: z.string().min(1, errors.required),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: errors.passwordsDontMatch,
    path: ['confirmPassword'],
  })

export type LoginValues = z.output<typeof loginSchema>
export type RegisterValues = z.output<typeof registerSchema>
