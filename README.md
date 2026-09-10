# Feelo

> Este README es la única documentación del repo en español (es la puerta de entrada del curso). El resto de la documentación funcional (`docs/`) y las instrucciones para agentes (`AGENTS.md`, `.agents/`, `.claude/`) están en inglés. Código (nombres, commits, comentarios) siempre en inglés — ver [AGENTS.md](./AGENTS.md).

Feelo es el proyecto que se construye a lo largo del curso "IA para Developers" como caso práctico de un equipo trabajando con agentes de IA de forma consistente.

## Visión

Feelo es un recomendador de qué ver, basado en estado de ánimo y con mecánica de swipe — como un Tinder para decidir qué peli o serie ver esta noche. Dices cómo te sientes (te apetece reírte, llorar, algo ligero, pensar, tensión, nostalgia...) y Feelo te enseña una baraja de títulos filtrados por ese ánimo y por las plataformas de streaming a las que estás suscrito. Deslizas a la derecha lo que te interesa y aparece un "¡Match!" con acceso directo a verlo en su plataforma.

## Problema

Con dos o más suscripciones de streaming activas, decidir qué ver se convierte en 15-20 minutos de scroll sin rumbo por catálogos enormes, con recomendaciones que se basan en tu historial y no en cómo te sientes ahora mismo, repartidas además entre varias apps que solo recomiendan de su propio catálogo.

## Alcance

**Entra en el MVP:** onboarding (elegir plataformas + swipes iniciales de gustos), check-in de ánimo, baraja de swipe filtrada por ánimo + plataformas, pantalla de "match", watchlist, perfil de gustos básico por ánimo.

**Se posterga explícitamente:** funciones sociales (matchear con amigos, sesiones compartidas), modo "ver juntos", sincronización en vivo del catálogo vía APIs oficiales de las plataformas (v1 usa un catálogo semilla/manual), reseñas de usuarios, recomendaciones basadas en el historial real de visionado (sin OAuth a las cuentas de streaming), múltiples perfiles por cuenta.

Detalle completo en [docs/product.md](./docs/product.md).

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

- Cerrar el esquema de datos inicial en Supabase ([docs/database.md](./docs/database.md)) — hay un borrador de tablas, falta implementarlo.
- Definir estrategia de navegación y gestión de estado en Expo.
- Definir de dónde sale el catálogo semilla de títulos (manual al inicio; evaluar una fuente real más adelante).

## Estado del proyecto

🚧 Estructura base / scaffold inicial (README, `AGENTS.md`, `.agents/`, `.claude/`, `docs/`, `.github/`). Visión de producto definida en [docs/product.md](./docs/product.md); sin código de aplicación todavía.
