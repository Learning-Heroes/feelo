# Convenciones del proyecto

## Idioma

- Código (variables, funciones, clases, archivos, commits técnicos, comentarios): **inglés**.
- Documentación funcional (README, `docs/product.md`, etc.) e instrucciones para agentes: **español**.

## Estilo y estructura

- `TODO`: fijar linter/formatter (ESLint + Prettier es lo estándar en Expo/React Native) y documentarlo aquí una vez se decida.
- Estructura de carpetas de la app Expo: `TODO`, definir en `docs/architecture.md` cuando arranque el código (convención recomendada: `app/` para rutas si se usa Expo Router, `components/`, `hooks/`, `lib/`, `types/`).
- Un componente/función = una responsabilidad. Evitar abstracciones prematuras.

## Validaciones

- No mergear con lint o tests en rojo.
- Cambios en el esquema de datos siempre vía migración versionada de Supabase (`supabase/migrations/`), nunca a mano en el dashboard.
- Cambios en contratos de API (Supabase functions, endpoints externos) se reflejan en `docs/api-contracts.md`.

## Seguridad

- Nunca commitear `.env`, claves `anon` en texto plano fuera de `.env.example`, ni la `service_role key` de Supabase en ningún sitio del cliente.
- Row Level Security (RLS) activado por defecto en toda tabla nueva de Supabase. Cualquier tabla sin RLS necesita justificación explícita en un ADR.
- Revisar que no se expongan datos de otros usuarios en queries desde el cliente (siempre filtrar por `auth.uid()` o equivalente vía políticas RLS, no en la lógica de la app).

## Documentación

- Si un cambio afecta a arquitectura, modelo de datos o contratos de API, se actualiza la documentación correspondiente en el mismo PR que el código.
- Decisiones no deducibles del código (por qué se eligió X sobre Y) van a `docs/decisions/` como ADR, no como comentario en el código.
