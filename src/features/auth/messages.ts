// Every visible auth text lives here, so it can be reviewed and translated later.
export const messages = {
  login: {
    title: 'Iniciar sesión',
    submit: 'Iniciar sesión',
    toRegister: '¿No tienes cuenta? Regístrate',
  },
  register: {
    title: 'Crear cuenta',
    submit: 'Crear cuenta',
    toLogin: '¿Ya tienes cuenta? Inicia sesión',
  },
  fields: {
    email: 'Email',
    username: 'Nombre de usuario',
    password: 'Contraseña',
    confirmPassword: 'Repetir contraseña',
  },
  logout: 'Cerrar sesión',
  errors: {
    invalidEmail: 'Introduce un email válido.',
    required: 'Este campo es obligatorio.',
    passwordTooShort: 'La contraseña debe tener al menos 8 caracteres.',
    passwordNoSpecial: 'La contraseña debe incluir al menos un carácter especial (por ejemplo: ! @ # $ %).',
    passwordsDontMatch: 'Las contraseñas no coinciden.',
    invalidUsername: 'El nombre de usuario debe tener entre 3 y 20 caracteres: minúsculas, números o guion bajo.',
    usernameTaken: 'Ese nombre de usuario ya está en uso.',
    invalidCredentials: 'Email o contraseña incorrectos.',
    weakPassword: 'La contraseña no cumple los requisitos de seguridad.',
    rateLimited: 'Demasiados intentos. Espera unos minutos y vuelve a intentarlo.',
    offline: 'No hay conexión. Revisa tu red e inténtalo de nuevo.',
    unknown: 'Algo ha fallado. Inténtalo de nuevo.',
  },
} as const
