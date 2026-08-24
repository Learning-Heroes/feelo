# Feelo

> Documentación funcional en español. Código (nombres, commits, comentarios) en inglés — ver [AGENTS.md](./AGENTS.md).

## Visión

_Pendiente de definir._ Feelo es el proyecto que se construye a lo largo del curso "IA para Developers" como caso práctico de un equipo trabajando con agentes de IA de forma consistente.

## Problema

_Pendiente de definir._ Completar con el problema real que resuelve la app antes de avanzar en funcionalidad.

## Alcance

_Pendiente de definir._ Qué entra en la v1 y qué se pospone explícitamente.

## Stack

- **App:** [Expo](https://expo.dev/) (React Native)
- **Backend / datos:** [Supabase](https://supabase.com/) (Postgres, Auth, Storage, Edge Functions)

## Instalación

```bash
# Requisitos: Node LTS, pnpm/npm, Expo CLI, Supabase CLI, cuenta de Supabase
npm install
cp .env.example .env   # completar con las claves del proyecto de Supabase
```

## Comandos

```bash
npm run start       # levanta Expo (dev server)
npm run ios         # abre en simulador iOS
npm run android     # abre en emulador Android
npm run lint        # linting
npm run test        # tests
supabase start      # entorno local de Supabase
supabase db push    # aplica migraciones
```

> Estos comandos son el objetivo del scaffold; ajustar según el `package.json` real una vez arrancado el proyecto Expo.

## Arquitectura mínima

App Expo (cliente) → Supabase (Postgres + Auth + Storage + Edge Functions). Detalle en [docs/architecture.md](./docs/architecture.md).

## Documentación del proyecto

Punto de entrada para humanos y agentes: [docs/index.md](./docs/index.md).

## Decisiones abiertas

- Definir visión/problema/alcance del producto.
- Definir modelo de datos inicial en Supabase ([docs/database.md](./docs/database.md)).
- Definir estrategia de navegación y gestión de estado en Expo.

## Estado del proyecto

🚧 Estructura base / scaffold inicial (README, `CLAUDE.md`, `AGENTS.md`, `.agents/`, `.claude/`, `docs/`, `.github/`). Sin código de aplicación todavía.
