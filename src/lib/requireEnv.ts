// Expo only inlines EXPO_PUBLIC_* on a literal `process.env.NAME` read, so callers read the var and pass it in.
export function requireEnv(name: string, value: string | undefined): string {
  if (!value) throw new Error(`Falta la variable de entorno ${name}`)
  return value
}
