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

Hay **dos formas** de trabajar, con las mismas migraciones y el mismo seed. Cada persona elige según a qué apunte su `.env`. Producción es otro proyecto que solo toca CI.

| | Cloud (por defecto) | Local |
|---|---|---|
| Base de datos | Proyecto de **staging**, compartido | Docker en tu máquina, solo tuya |
| Requisitos | Acceso a la org de Supabase | Docker Desktop |
| Aplicar cambios | `npx supabase db push --include-seed` | `npx supabase db reset --local` |
| Flag de la CLI | `--linked` | `--local` |

### Opción A — Cloud (staging)

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

Staging es compartido: nunca `db reset --linked` (borra los datos de todos), nunca cambios de esquema desde el dashboard y nunca editar una migración ya aplicada.

### Opción B — Local (Docker)

Una base de datos solo tuya, en tu máquina. No necesitas cuenta de Supabase.

**Requisitos:** Docker Desktop instalado y abierto, y `npm install` hecho (la CLI va por `npx`).

**1. Arranca Supabase**

```bash
npx supabase start
```

La primera vez descarga las imágenes (varios GB, unos minutos): conviene hacerlo antes de la sesión. Al acabar imprime las URLs y las claves.

**2. Saca la URL y la clave**

```bash
npx supabase status
```

De todo lo que muestra solo necesitas dos valores:

| Valor de `status` | Para qué | ¿Va en `.env`? |
|---|---|---|
| `API URL` (`http://127.0.0.1:54321`) | Dirección de la API | ✅ `EXPO_PUBLIC_SUPABASE_URL` |
| `anon key` (empieza por `eyJ…`) | Clave pública de la app; la protección es la RLS | ✅ `EXPO_PUBLIC_SUPABASE_ANON_KEY` |
| `service_role key` / `Secret key` | Se salta la RLS | ❌ Nunca en la app |
| `DB URL`, `Studio URL`… | Conectar con psql o abrir el panel | ❌ |

La *publishable key* (`sb_publishable_…`) es la sustituta nueva de la anon key; cualquiera de las dos funciona.

**3. Crea el `.env`**

Este comando lo genera a partir de `supabase status` (**sobrescribe** el `.env` que tengas):

```bash
npx supabase status -o env | grep -E '^(API_URL|ANON_KEY)=' \
  | sed -e 's/^API_URL=/EXPO_PUBLIC_SUPABASE_URL=/' -e 's/^ANON_KEY=/EXPO_PUBLIC_SUPABASE_ANON_KEY=/' > .env
```

O cópialo a mano desde `.env.example`. Tiene que quedar así:

```bash
EXPO_PUBLIC_SUPABASE_URL="http://127.0.0.1:54321"
EXPO_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOi..."
```

La anon key local es una clave de demo, igual para todo el mundo y válida solo contra tu Docker. Aun así, `.env` nunca se sube al repo.

**4. Ajusta la URL a tu dispositivo**

| Dónde corre la app | `EXPO_PUBLIC_SUPABASE_URL` |
|---|---|
| Simulador de iOS | `http://127.0.0.1:54321` |
| Emulador de Android | `http://10.0.2.2:54321` |
| Móvil físico (misma wifi) | `http://<IP de tu Mac>:54321` (`ipconfig getifaddr en0`) |

**5. Comprueba que responde y arranca la app**

```bash
curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:54321/auth/v1/health -H "apikey: <anon key>"   # 200
npx expo start -c
```

El `-c` limpia la caché: Expo mete las variables `EXPO_PUBLIC_*` en el código al compilar, y sin él la app sigue con los valores anteriores.

**Si algo falla**

- `Cannot connect to the Docker daemon` → abre Docker Desktop y repite.
- `port is already allocated` → hay otro Supabase corriendo (de este u otro proyecto): `npx supabase stop --all`.
- La app dice `Missing EXPO_PUBLIC_SUPABASE_URL…` → falta el `.env` o no reiniciaste con `npx expo start -c`.
- `no files matched pattern: supabase/seed.sql` → es solo un aviso hasta que exista la primera migración con seed.

**Día a día**

```bash
npx supabase migration new <verbo_objeto>
npx supabase db reset --local                # reaplica todas las migraciones + seed, desde cero
npx supabase gen types typescript --local > src/lib/database.types.ts
npx supabase stop                            # para los contenedores
```

Studio local: http://localhost:54323. El MCP `supabase-local` de los agentes solo responde con `supabase start` en marcha.

Para pasar de un modo a otro basta con cambiar las dos variables del `.env` y reiniciar Expo (`npx expo start -c`).

## Trabajar con agentes

- [`AGENTS.md`](./AGENTS.md): qué es el proyecto, reglas, dominio, flujo, qué no tocar y a quién preguntar. `CLAUDE.md` lo importa.
- `app/AGENTS.md` y `supabase/AGENTS.md`: reglas de cada carpeta.
- `.claude/settings.json` (permisos y hooks), `.agents/skills/` (skills del proyecto) y `.mcp.json` (Notion + Supabase cloud en solo lectura + Supabase local).

## Estado del proyecto

🚧 App Expo con la pantalla Descubre estática y Supabase inicializado (`supabase/config.toml`, cliente en `src/lib/supabase.ts`), todavía sin esquema.
