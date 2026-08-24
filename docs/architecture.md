# Arquitectura

> `TODO`: completar según decisiones reales una vez arranque el código. Este documento describe cómo, no qué (eso va en `product.md`).

## Visión general

```
Expo (React Native, cliente)
        │
        ▼
Supabase
  ├─ Postgres (datos)
  ├─ Auth (autenticación de usuarios)
  ├─ Row Level Security (autorización a nivel de fila)
  └─ Edge Functions (lógica de servidor, si aplica)
```

## App (Expo)

- `TODO`: navegación (Expo Router vs React Navigation).
- `TODO`: gestión de estado (Context, Zustand, TanStack Query, etc.).
- `TODO`: estructura de carpetas.

## Backend (Supabase)

- `TODO`: qué vive en Postgres/RLS vs qué vive en Edge Functions.
- `TODO`: estrategia de autenticación (email/password, OAuth, magic link).

## Integraciones externas

`TODO`: servicios de terceros, si los hay.

## Decisiones relacionadas

Ver [`decisions/`](decisions/) para el porqué de las decisiones de arquitectura ya tomadas.
