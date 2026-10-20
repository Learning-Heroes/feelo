# AGENTS.md

Rules for any AI agent (Claude Code, Codex, Cursor, Copilot…) working in this repo. Read it whole before touching code.

**Source of truth.** Notion owns product and process; this repo owns specs and code. This file summarises and links — it does not copy. If it disagrees with Notion, Notion wins and whichever is stale gets fixed the same day. Notion is reachable through the `notion` MCP server (`.mcp.json`).

## Project

**Feelo** is a native mobile app (iOS + Android, no web) that recommends movies and series from the user's **mood**. It asks how you feel and what you want the content to do for you, not what you want to watch.

Two core mechanics:

1. **Discover (swiper)** — TikTok-style feed of clips. 4-direction swipe builds the taste profile: ↑ `loved` · → `liked` · ← `disliked` · ↓ `not_seen`.
2. **Suggest (3 taps)** — 2D mood grid (valence × arousal) → intent (`repair` "lift me up" / `congruent` "keep me company" / `explore` "surprise me") → format (`movie` / `series`) + time available → one hero suggestion plus alternatives.

Genre is never asked: it emerges from the algorithm as a latent variable. The recommender is **in-house and deterministic** — no LLM APIs or external inference.

Status: **pre-scaffold**. There is no app code yet; `app/` and `supabase/` only hold their `AGENTS.md`. Commands below are the project's target commands and start working once the Expo app is scaffolded.

## Stack

| Layer | Choice |
|---|---|
| App | Expo (managed, EAS) + React Native, New Architecture, TypeScript `strict` |
| Navigation | Expo Router |
| Server state / client state | TanStack Query / Zustand (UI and session only) |
| Forms | React Hook Form + Zod |
| Styles | **Unistyles 3** + tokens in `src/theme`. **Tailwind / NativeWind are ruled out** |
| Glass | `expo-glass-effect` (iOS 26) → `expo-blur` fallback → solid surface, always through `<GlassSurface>` |
| Animation / lists | Reanimated + Gesture Handler / FlashList |
| Backend | Supabase: Postgres + RLS + Auth + Edge Functions (Deno, Hono + `@hono/zod-openapi`) |
| Catalog | TMDB API, consumed **server-side only** |
| Payments | RevenueCat |
| Tests | Jest + React Native Testing Library · Postgres/Deno tests · Maestro (E2E) |

Do not add a dependency, backend, ORM or auth service without the area owner's approval and a decision recorded in Notion → Decisiones.

## Repo structure

```
app/                  # Expo Router routes — thin screens (see app/AGENTS.md)
src/
  components/         # domain-agnostic UI primitives (glass kit)
  features/           # vertical domain modules (discover, suggest, onboarding…)
  hooks/              # cross-cutting hooks
  lib/                # Supabase client, generated types, pure utils
  theme/              # design tokens
supabase/             # migrations, functions, seed (see supabase/AGENTS.md)
api/                  # GENERATED OpenAPI contract — never edit by hand
postman/              # GENERATED collection + environments — never edit by hand
specs/                # versioned technical spec per task
scripts/              # build-api-spec, generators, CI checks
```

Import direction is one-way: `app → features → components/hooks → lib/theme`. A feature never imports another feature; shared code moves up to `src/*`. Always use the `@/` alias, never chained `../../`.

## Commands

```bash
npm install
npx supabase start            # local Supabase (Docker). Studio: http://localhost:54323
npx supabase db reset         # local DB: re-apply migrations + seed.sql
npx expo start                # dev server (native glass needs a dev build: npx expo run:ios)
npm run lint                  # ESLint
npm run typecheck             # tsc --noEmit
npm run test                  # Jest
npm run api:sync              # regenerate api/openapi.json + postman/ from schema + Zod
npx supabase migration new <name>
npx supabase functions serve <name>
npx supabase gen types typescript --local > src/lib/database.types.ts
```

Lint, types and tests must be green before opening a PR. Agents only ever run against **local** Supabase.

## Code rules (non-negotiable)

Full standard: [Estándares de código](https://app.notion.com/p/9762fb909e9b443fbbe8422b6849a47c). The short version:

1. TypeScript strict. No `any` (use `unknown` + narrowing), no `@ts-ignore`.
2. Database types are **generated** from the schema, never hand-written.
3. **RLS on every table**, one explicit policy per verb. Schema changes only via migrations — never the dashboard.
4. The app never decides permissions or sensitive business rules: that lives in Postgres (RLS, functions) or Edge Functions.
5. Zero secrets in the repo and no hand-written production URLs. Only the `anon` key reaches the client; `service_role` and `TMDB_API_KEY` live in Supabase/CI secrets. No `process.env.X || 'fallback'` for secrets.
6. **Tests first**, and they must fail first (red → green).
7. The API contract (`api/`, `postman/`) is generated. Change schema or a function → `npm run api:sync` in the same PR.
8. Screens are composition only: no business logic in components; data goes through a feature hook, never straight to Supabase.
9. No magic values: colors, spacing, radii and type come from `src/theme`. No hardcoded visible text: everything goes through i18n.
10. **If the task or spec doesn't define it, don't improvise.** Stop and ask (see "Who to ask").

File name = export name. No `console.log` reaching `main`. No empty `catch`.

## Domain

Full model: [Modelo de dominio](https://app.notion.com/p/3c6bd3bd193b8041b148e0a527af3612) · scoring: [Algoritmo de sugerencias](https://app.notion.com/p/3c6bd3bd193b801cbf38fd235e94ce10).

- **Catalog** (seeded from TMDB, public read): `Content` (`content_type`, `duration_minutes`, affective signature `valence`/`arousal` in [-1, 1]), `Genre` (8 in-house "vibes" mapped from TMDB genres), `ContentGenre` (weighted), `Platform`, `ContentPlatform` (per country, `offer_type`), `Clip` (YouTube key from TMDB — embed only, never self-hosted).
- **User data** (RLS: each user only their rows): `User`, `UserPlatform`, `UserContent` (swiper reactions), `UserMood` (Suggest check-in: `valence`, `arousal`, `intent`, `content_type`, `time_availability`), `SuggestionRequest` + `SuggestionItem` (rank, score, `was_hero`, `was_chosen`), `UserGenreAffinity` (materialised taste profile, rebuildable from `UserContent`).
- **Scoring**: hard filters (exclude already-reacted, platform ∩ user platforms by country, duration ≤ time) → `score = 0.45·taste + 0.35·mood_fit + 0.20·prior`. The prior table is a code constant, not a DB table.
- Subscriptions are owned by RevenueCat, not stored on `User`.

## Workflow

Process: [Metodología de trabajo](https://app.notion.com/p/3cdbd3bd193b80eb920ec3a2d2de61fa) · task format: [Definición de tarea](https://app.notion.com/p/3c6bd3bd193b80218f87cdfa1dba7165).

1. A task lives in the Notion task board. If it lacks acceptance criteria or test cases, it is not ready: don't start it.
2. Derive a technical spec into `specs/` → **a human reviews it before any code**.
3. Write the tests from the task's test cases; confirm they fail.
4. Implement until green.
5. One branch and one PR per task: `feat/…`, `fix/…`, `docs/…`, `chore/…`. Conventional Commits. The PR links the task and the spec.
6. Review: CodeRabbit + sign-off from the area owner. Merge to `staging` → QA by a different agent → CI deploys.

Seeders are part of the deliverable: if QA can't reproduce it on staging with seeded data, it isn't done. A bug found mid-task becomes a new task, never a fix smuggled into someone else's PR.

## Do not touch

- `api/`, `postman/`, `src/lib/database.types.ts` — generated. Regenerate them, never edit them.
- `.env` and any secret. Only `.env.example` (empty values) is versioned.
- Staging or production Supabase, EAS submit/update, store consoles: anything outside local needs explicit human confirmation.
- Already-applied migrations: write a new one instead.
- `main` and `staging` directly: always a branch + PR. No force-push.

`.claude/settings.json` and `.claude/hooks/` enforce part of this list; the rest is on you.

## Who to ask

Blocked or ambiguous → comment on the Notion task, move it to `Blocked`, mention the owner. Never decide alone. Team: [Equipo](https://app.notion.com/p/3c6bd3bd193b80f49b81e59b3c1b50e7).

| Topic | Owner |
|---|---|
| Product, UX, scope trade-offs | Iskren (Product Owner) |
| Task status, missing criteria, coordination | Génesis (Project Manager) |
| Data model, Supabase, API, algorithm, security | Rafa (Backend Owner) |
| Screens, navigation, components, design fidelity | Toni (Frontend Owner) |

## Notion map

| Need | Page |
|---|---|
| Vision, mechanics | [Inicio](https://app.notion.com/p/ebcbd3bd193b8321a42481a84fa5158f) |
| All project docs | [Documentación](https://app.notion.com/p/3c6bd3bd193b80c9a6dffd70018b9941) |
| Stack and its why | [Stack tecnológico](https://app.notion.com/p/3c6bd3bd193b807781c7c67526d4ddd7) |
| Repo, envs, access, API contract | [Repositorio y accesos técnicos](https://app.notion.com/p/66b7bc87d8194c73b34c3118904bfc0c) |
| Environments, migration promotion | [Infraestructura](https://app.notion.com/p/3c6bd3bd193b80e6be49c1a873aeefa4) |
| TMDB and other content providers | [Proveedores de contenido](https://app.notion.com/p/3d0bd3bd193b81b7bd11d553149e906d) |
| Design | [Brand book](https://app.notion.com/p/3c6bd3bd193b8070be4bc17609c8fd55) · [UX Flows](https://app.notion.com/p/3c6bd3bd193b809284b7ddce7d4158ed) · [Prototipo](https://app.notion.com/p/3c6bd3bd193b80f09061f4b8536e3cdf) |
| Decisions log | [Decisiones](https://app.notion.com/p/3c6bd3bd193b80cdb900d70b301ac9c9) |

## Skills

Project skills live in `.agents/skills/` (Claude Code sees them through the `.claude/skills` symlink). Load one only when the task needs it.

| Skill | Use it to |
|---|---|
| [`new-migration`](.agents/skills/new-migration/SKILL.md) | Change the schema: migration + RLS per verb + seed + types + `api:sync` |
| [`edge-function`](.agents/skills/edge-function/SKILL.md) | Add or change an Edge Function: Hono + Zod → OpenAPI |
| [`glass-component`](.agents/skills/glass-component/SKILL.md) | Build UI on a glass surface via `<GlassSurface>` with its fallbacks |
| [`expo`](.agents/skills/expo/SKILL.md) | Feelo's screen flow and how screens get data |

## Language

Code, commits, comments and agent instructions: **English**. Notion tasks and the root `README.md`: **Spanish**. Keep real repo identifiers (tables, files, components) as they are.
