---
name: expo
description: Convenciones para trabajar en la app Expo/React Native de Feelo — estructura, navegación, componentes, estado, llamadas a Supabase y testing básico. Usar al crear pantallas, componentes o features de la app cliente.
---

# Expo / React Native — Feelo

## Estructura de app

- `TODO`: fijar convención real (Expo Router vs React Navigation) en `docs/architecture.md` y reflejarla aquí.
- Un componente = una responsabilidad. Componentes de presentación separados de la lógica de datos.

## Navegación

- `TODO`: documentar aquí el patrón elegido una vez exista código (rutas, layouts, deep linking).

## Componentes y estado

- Preferir estado local/derivado antes que estado global.
- `TODO`: librería de gestión de estado (Context, Zustand, TanStack Query...) una vez decidida — registrar el porqué en `docs/decisions/`.

## Llamadas a Supabase desde la app

- Usar siempre el cliente de Supabase (`@supabase/supabase-js`) con las claves `EXPO_PUBLIC_*` de `.env`, nunca la `service_role key` en el cliente.
- Confiar en RLS para la autorización, no filtrar "a mano" en el cliente lo que ya debería filtrar una política.
- Tipar las respuestas (generar tipos desde el esquema de Supabase cuando exista: `supabase gen types typescript`).

## Testing básico

- `TODO`: runner de tests (Jest + `@testing-library/react-native` es lo estándar en Expo).
- Priorizar tests de lógica de negocio y hooks sobre snapshots de UI.

## Buenas prácticas

- Código en inglés. Sin lógica de negocio duplicada entre pantallas: extraer a hooks/servicios.
- Manejar estados de carga/error explícitamente en cualquier pantalla que llame a Supabase.
