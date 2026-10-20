# Feelo

> Este README es la única documentación del repo en español (es la puerta de entrada del curso). Las instrucciones para agentes (`AGENTS.md`, `.agents/`, `.claude/`) y el código (nombres, commits, comentarios) están en inglés — ver [AGENTS.md](./AGENTS.md).

Feelo es el proyecto que se construye a lo largo del curso "IA para Developers" como caso práctico de un equipo trabajando con agentes de IA de forma consistente.

## Visión

Feelo es una app móvil (iOS + Android) que recomienda películas y series según tu **mood**. En vez de preguntarte qué quieres ver, te pregunta **cómo estás** y **qué quieres que el contenido haga por ti**.

- **Descubre:** feed de clips con swipe en 4 direcciones (me encantó / me gustó / no me gustó / no lo he visto) que construye tu perfil de gustos.
- **Sugerir:** en 3 toques — mood en un grid ánimo × energía, intención (súbeme el ánimo / acompáñame / sorpréndeme) y formato — una sugerencia directa y alternativas.

La documentación de producto y proceso vive en Notion ([Inicio](https://app.notion.com/p/ebcbd3bd193b8321a42481a84fa5158f) · [Documentación](https://app.notion.com/p/3c6bd3bd193b80c9a6dffd70018b9941)). Este repo es la fuente de verdad de specs y código.

## Stack

Expo + React Native (TypeScript estricto, Expo Router, Unistyles, glass iOS 26) · Supabase (Postgres + RLS + Edge Functions) · TMDB · RevenueCat. Detalle en [Stack tecnológico](https://app.notion.com/p/3c6bd3bd193b807781c7c67526d4ddd7).

## Instalación y comandos

```bash
npm install
cp .env.example .env     # rellenar valores locales
npx supabase start       # Supabase local (Docker)
npx supabase db reset    # migraciones + seed
npx expo start           # app
npm run lint && npm run typecheck && npm run test
```

> La app aún no está scaffoldeada: estos comandos funcionan a partir de la siguiente sesión.

## Trabajar con agentes

- [`AGENTS.md`](./AGENTS.md): qué es el proyecto, reglas, dominio, flujo, qué no tocar y a quién preguntar. `CLAUDE.md` lo importa.
- `app/AGENTS.md` y `supabase/AGENTS.md`: reglas de cada carpeta.
- `.claude/settings.json` (permisos y hooks), `.agents/skills/` (skills del proyecto) y `.mcp.json` (Notion + Supabase local).

## Estado del proyecto

🚧 Repo preparado para trabajar con agentes (rama `chore/agents-setup`); sin código de aplicación todavía.
