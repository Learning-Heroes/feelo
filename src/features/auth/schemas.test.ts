import { loginSchema, registerSchema } from '@/features/auth/schemas'

const valid = {
  email: 'nuevo@feelo.test',
  username: 'nuevo_user',
  password: 'Feelo#2026',
  confirmPassword: 'Feelo#2026',
}

// First message per field, as react-hook-form shows it.
function firstError(result: ReturnType<typeof registerSchema.safeParse>, field: string): string | undefined {
  return result.error?.issues.find((issue) => issue.path[0] === field)?.message
}

describe('registerSchema', () => {
  it('accepts a valid form', () => {
    expect(registerSchema.safeParse(valid).success).toBe(true)
  })

  it('email_invalido', () => {
    expect(firstError(registerSchema.safeParse({ ...valid, email: 'usuario@' }), 'email')).toBe('Introduce un email válido.')
  })

  it('email_con_espacios_se_normaliza', () => {
    expect(registerSchema.parse({ ...valid, email: '  Usuario-A@Feelo.test ' }).email).toBe('usuario-a@feelo.test')
  })

  it('campo_obligatorio_vacio', () => {
    const result = registerSchema.safeParse({ email: '', username: '', password: '', confirmPassword: '' })
    for (const field of ['email', 'username', 'password', 'confirmPassword']) {
      expect(firstError(result, field)).toBe('Este campo es obligatorio.')
    }
  })

  it('contrasena_corta', () => {
    expect(firstError(registerSchema.safeParse({ ...valid, password: 'Ab1!', confirmPassword: 'Ab1!' }), 'password')).toBe(
      'La contraseña debe tener al menos 8 caracteres.',
    )
  })

  it('contrasena_sin_especial', () => {
    expect(
      firstError(registerSchema.safeParse({ ...valid, password: 'Feelo2026', confirmPassword: 'Feelo2026' }), 'password'),
    ).toBe('La contraseña debe incluir al menos un carácter especial (por ejemplo: ! @ # $ %).')
  })

  it('contrasena_de_exactamente_8_con_especial_es_valida', () => {
    expect(registerSchema.safeParse({ ...valid, password: 'Abcdef1!', confirmPassword: 'Abcdef1!' }).success).toBe(true)
  })

  it('contrasenas_distintas', () => {
    expect(firstError(registerSchema.safeParse({ ...valid, confirmPassword: 'Feelo#2027' }), 'confirmPassword')).toBe(
      'Las contraseñas no coinciden.',
    )
  })

  it.each(['ab', 'Mal Usuario', 'demasiado_largo_para_ser_valido'])('username_invalido: %s', (username) => {
    expect(firstError(registerSchema.safeParse({ ...valid, username }), 'username')).toBe(
      'El nombre de usuario debe tener entre 3 y 20 caracteres: minúsculas, números o guion bajo.',
    )
  })
})

describe('loginSchema', () => {
  it('normalises the email and only requires a password', () => {
    expect(loginSchema.parse({ email: ' Usuario-A@Feelo.test', password: 'x' })).toEqual({
      email: 'usuario-a@feelo.test',
      password: 'x',
    })
  })

  it('rejects an invalid email and an empty password', () => {
    const result = loginSchema.safeParse({ email: 'usuario@', password: '' })
    expect(result.error?.issues.map((issue) => issue.message)).toEqual([
      'Introduce un email válido.',
      'Este campo es obligatorio.',
    ])
  })
})
