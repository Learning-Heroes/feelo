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
cp .env.example .env     # rellenar con los datos de Supabase (ver abajo)
npm run ios              # dev build (Unistyles no funciona en Expo Go)
npm run lint && npm run typecheck && npm run test
```

## Supabase

Usamos **Supabase en la nube, sin Supabase local ni Docker**. El desarrollo apunta al proyecto de **staging**; producción es otro proyecto que solo toca CI.

Se hace una vez por persona:

1. Pide a Rafa acceso a la organización de Supabase (cuenta nominal, nada de credenciales compartidas).
2. En el dashboard del proyecto de staging, **Project Settings → API**, copia la *Project URL* y la *anon public key* en tu `.env`:
   ```bash
   EXPO_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon key>
   ```
   Solo la `anon` key llega a la app; la `service_role` nunca va en `.env` ni en el repo.
3. Enlaza la CLI con staging (te pedirá la contraseña de la base de datos):
   ```bash
   npx supabase login
   npx supabase link --project-ref <project-ref-de-staging>
   ```
4. Para el MCP de Supabase de los agentes, exporta el ref en tu shell (`~/.zshrc`) y, al abrir Claude Code, autentícate con `/mcp`:
   ```bash
   export SUPABASE_PROJECT_REF=<project-ref-de-staging>
   ```
   El MCP va en modo `read_only`: los agentes consultan esquema, datos y logs, pero el esquema solo cambia por migraciones.

Día a día:

```bash
npx supabase migration new <verbo_objeto>    # nueva migración en supabase/migrations/
npx supabase db push --include-seed          # aplica migraciones pendientes + seed a staging
npx supabase migration list                  # qué migraciones tiene ya staging
npx supabase gen types typescript --linked > src/lib/database.types.ts
```

Staging es compartido: nunca `db reset` (borra los datos de todos), nunca cambios de esquema desde el dashboard y nunca editar una migración ya aplicada.

## Trabajar con agentes

- [`AGENTS.md`](./AGENTS.md): qué es el proyecto, reglas, dominio, flujo, qué no tocar y a quién preguntar. `CLAUDE.md` lo importa.
- `app/AGENTS.md` y `supabase/AGENTS.md`: reglas de cada carpeta.
- `.claude/settings.json` (permisos y hooks), `.agents/skills/` (skills del proyecto) y `.mcp.json` (Notion + Supabase cloud en solo lectura).

## Estado del proyecto

🚧 App Expo con la pantalla Descubre estática y Supabase inicializado (`supabase/config.toml`, cliente en `src/lib/supabase.ts`), todavía sin esquema.
