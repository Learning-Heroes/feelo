# AGENTS.md

Rules for any AI agent (Claude Code, Codex, Cursor, Copilot…) working in this repo. This file holds what applies everywhere; `app/AGENTS.md` and `supabase/AGENTS.md` add only what is specific to each folder.

**Source of truth.** Notion owns product and process; this repo owns specs and code. This file summarises and links — it does not copy. If it disagrees with Notion, Notion wins and whichever is stale gets fixed the same day. Notion is reachable through the `notion` MCP server (`.mcp.json`).

## Project

**Feelo** is a native mobile app (iOS + Android, no web) that recommends movies and series from the user's **mood**. It asks how you feel and what you want the content to do for you, not what you want to watch.

1. **Discover (swiper)** — TikTok-style clip feed. 4-direction swipe builds the taste profile: ↑ `loved` · → `liked` · ← `disliked` · ↓ `not_seen`.
2. **Suggest (3 taps)** — 2D mood grid (valence × arousal) → intent (`repair` "lift me up" / `congruent` "keep me company" / `explore` "surprise me") → format (`movie` / `series`) + time available → one hero suggestion plus alternatives.

Genre is never asked: it emerges from the algorithm as a latent variable. The recommender is **in-house and deterministic** — no LLM APIs or external inference.

Status: **early build**. Expo app scaffolded (SDK 58, Expo Router, Unistyles 3 — needs a dev build: `npm run ios`, not Expo Go). Supabase initialised (`supabase/config.toml`, client in `src/lib/supabase.ts`), no schema yet. `api:sync` arrives with the first backend task.

**Supabase is cloud-only: no local Supabase, no Docker.** Development runs against the **staging** project (Free plan: 2 projects, staging + production). Each person links their checkout once; agents never link. Setup: `README.md` → Supabase.

## Stack

Expo (managed, EAS) + React Native, New Architecture, TypeScript `strict`, Expo Router · Supabase (Postgres + RLS + Auth + Edge Functions on Deno with Hono) · TMDB (server-side only) · RevenueCat · Jest + RNTL, Maestro for E2E. Client libraries: `app/AGENTS.md`. Why each choice: [Stack tecnológico](https://app.notion.com/p/3c6bd3bd193b807781c7c67526d4ddd7).

No new dependency, backend, ORM or auth service without the area owner's approval and a decision recorded in Notion → Decisiones.

## Repo structure

```
app/          # Expo Router routes            → app/AGENTS.md
src/          # components, features, hooks, lib, theme → app/AGENTS.md
supabase/     # migrations, functions, seed    → supabase/AGENTS.md
api/          # GENERATED OpenAPI contract
postman/      # GENERATED collection + environments
specs/        # versioned technical spec per task
scripts/      # build-api-spec, generators, CI checks
```

## Commands

```bash
npm install
npx supabase migration new <verb_object>   # new migration file
npx supabase db push          # apply pending migrations to the linked project (staging)
npx supabase migration list   # local files vs. what staging has applied
npx expo start                # dev server (native glass needs a dev build: npx expo run:ios)
npm run lint                  # ESLint
npm run typecheck             # tsc --noEmit
npm run test                  # Jest
npm run api:sync              # regenerate api/ + postman/ from schema + Zod
npx supabase gen types typescript --linked > src/lib/database.types.ts
```

Lint, types and tests green before opening a PR.

## Code rules

Full standard: [Estándares de código](https://app.notion.com/p/9762fb909e9b443fbbe8422b6849a47c).

1. TypeScript strict. No `any` (use `unknown` + narrowing), no `@ts-ignore`.
2. **Tests first**, and they must fail first (red → green). Co-located, testing behaviour, not internals.
3. Zero secrets in the repo, no hand-written production URLs, no `process.env.X || 'fallback'`. Only the `anon` key reaches the client.
4. Sensitive business rules and permissions live server-side (Postgres or Edge Functions), never in the app.
5. Zod at both edges: app forms and Edge Function input.
6. File name = export name. No `console.log` reaching `main`. No empty `catch`.
7. **If the task or spec doesn't define it, don't improvise.** Stop and ask (see "Who to ask").

## Domain

Full model: [Modelo de dominio](https://app.notion.com/p/3c6bd3bd193b8041b148e0a527af3612) · scoring: [Algoritmo de sugerencias](https://app.notion.com/p/3c6bd3bd193b801cbf38fd235e94ce10).

- **Catalog** (seeded from TMDB): `Content` (`content_type`, `duration_minutes`, affective signature `valence`/`arousal` in [-1, 1]), `Genre` (8 in-house "vibes" mapped from TMDB), `ContentGenre` (weighted), `Platform`, `ContentPlatform` (per country, `offer_type`), `Clip` (YouTube key from TMDB — embed only, never self-hosted).
- **User data**: `User`, `UserPlatform`, `UserContent` (swiper reactions), `UserMood` (Suggest check-in: `valence`, `arousal`, `intent`, `content_type`, `time_availability`), `SuggestionRequest` + `SuggestionItem` (rank, score, `was_hero`, `was_chosen`), `UserGenreAffinity` (materialised taste profile, rebuildable from `UserContent`).
- **Scoring**: hard filters (exclude already-reacted, platform ∩ user platforms by country, duration ≤ time) → `score = 0.45·taste + 0.35·mood_fit + 0.20·prior`. The prior table is a code constant, not a DB table.
- Subscriptions are owned by RevenueCat, not stored on `User`.

## Workflow

Process: [Metodología de trabajo](https://app.notion.com/p/3cdbd3bd193b80eb920ec3a2d2de61fa) · task format: [Definición de tarea](https://app.notion.com/p/3c6bd3bd193b80218f87cdfa1dba7165).

1. A task lives in the Notion task board. Without acceptance criteria and test cases it is not ready: don't start it.
2. Derive a technical spec into `specs/` → **a human reviews it before any code**.
3. Write the tests from the task's test cases; confirm they fail. Implement until green.
4. One branch and one PR per task (`feat/…`, `fix/…`, `docs/…`, `chore/…`), Conventional Commits, PR linking task and spec.
5. Review: CodeRabbit + area owner sign-off → merge to `staging` → QA by a different agent → CI deploys.

Seeders are part of the deliverable: if QA can't reproduce it on staging with seeded data, it isn't done. A bug found mid-task becomes a new task, never a fix inside someone else's PR.

## Do not touch

- `api/`, `postman/`, `src/lib/database.types.ts` — generated. Change the source and regenerate (`api:sync`, `gen types`) in the same PR.
- `.env` and any secret. Only `.env.example` (empty values) is versioned.
- Supabase beyond `db push` to the already-linked staging project: never `link`, `db reset` (it would wipe the shared staging DB), `functions deploy`, `secrets` or anything aimed at production. Never change the schema from the dashboard or through the MCP. Same for EAS submit/update and store consoles. CI promotes; humans confirm.
- `main` and `staging` directly: always branch + PR. No force-push.

Part of this list is enforced by `.claude/settings.json` and `.claude/hooks/`; the rest is on you.

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
| Repo, envs, access, API contract | [Repositorio y accesos técnicos](https://app.notion.com/p/66b7bc87d8194c73b34c3118904bfc0c) |
| Environments, migration promotion | [Infraestructura](https://app.notion.com/p/3c6bd3bd193b80e6be49c1a873aeefa4) |
| TMDB and other content providers | [Proveedores de contenido](https://app.notion.com/p/3d0bd3bd193b81b7bd11d553149e906d) |
| Design | [Brand book](https://app.notion.com/p/3c6bd3bd193b8070be4bc17609c8fd55) · [UX Flows](https://app.notion.com/p/3c6bd3bd193b809284b7ddce7d4158ed) · [Prototipo](https://app.notion.com/p/3c6bd3bd193b80f09061f4b8536e3cdf) |
| Decisions log | [Decisiones](https://app.notion.com/p/3c6bd3bd193b80cdb900d70b301ac9c9) |

## Skills

Procedures with templates, in `.agents/skills/` (Claude Code: `.claude/skills`). Load one only when the task needs it.

| Skill | Use it to |
|---|---|
| [`new-migration`](.agents/skills/new-migration/SKILL.md) | Change the schema: migration + RLS + seed + types + `api:sync` |
| [`edge-function`](.agents/skills/edge-function/SKILL.md) | Add or change an Edge Function: Hono + Zod → OpenAPI |
| [`glass-component`](.agents/skills/glass-component/SKILL.md) | Build UI on glass via `<GlassSurface>` and its fallbacks |
| [`expo`](.agents/skills/expo/SKILL.md) | Feelo's screen flows and what each one reads and writes |

## Language

Code, commits, comments and agent instructions: **English**. Notion tasks and the root `README.md`: **Spanish**. Keep real repo identifiers as they are.
