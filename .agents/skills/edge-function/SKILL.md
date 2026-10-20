---
name: edge-function
description: Create or change a Feelo Supabase Edge Function with Hono + @hono/zod-openapi, so the same Zod schema validates the input and produces the OpenAPI contract. Use for anything that needs secrets, third parties (TMDB, RevenueCat webhooks) or the suggestion scoring, and whenever a function's request/response changes.
---

# Edge Function — Feelo

Rules: [`supabase/AGENTS.md`](../../../supabase/AGENTS.md). Decide first whether it belongs here: pure data logic → Postgres function (RPC) via `new-migration`; secrets, external APIs or the scoring pipeline → Edge Function.

## 1. Create

```bash
npx supabase functions new <kebab-name>   # e.g. get-suggestions
```

Layout:

```
supabase/functions/<kebab-name>/
  index.ts          # Hono app + routes, nothing else
  schemas.ts        # Zod request/response schemas (feed the OpenAPI)
  handler.ts        # logic, testable without HTTP
  handler.test.ts   # deno test
supabase/functions/_shared/   # cors, errors, supabase client factory
```

## 2. Template

```ts
// schemas.ts
import { z } from 'npm:@hono/zod-openapi'

export const SuggestionRequest = z.object({
  moodId: z.string().uuid(),
}).openapi('SuggestionRequest')

export const SuggestionResponse = z.object({
  requestId: z.string().uuid(),
  hero: z.object({ contentId: z.string().uuid(), score: z.number() }),
  alternatives: z.array(z.object({ contentId: z.string().uuid(), score: z.number() })),
}).openapi('SuggestionResponse')

export const ErrorResponse = z.object({
  code: z.string(),      // stable, e.g. MOOD_NOT_FOUND
  message: z.string(),
}).openapi('ErrorResponse')
```

```ts
// index.ts
import { OpenAPIHono, createRoute } from 'npm:@hono/zod-openapi'
import { ErrorResponse, SuggestionRequest, SuggestionResponse } from './schemas.ts'
import { getSuggestions } from './handler.ts'

const route = createRoute({
  method: 'post',
  path: '/get-suggestions',
  tags: ['suggest'],
  operationId: 'getSuggestions',
  security: [{ bearerAuth: [] }],
  request: { body: { content: { 'application/json': { schema: SuggestionRequest } } } },
  responses: {
    200: { description: 'Ranked suggestions', content: { 'application/json': { schema: SuggestionResponse } } },
    400: { description: 'Invalid input', content: { 'application/json': { schema: ErrorResponse } } },
    404: { description: 'Mood not found', content: { 'application/json': { schema: ErrorResponse } } },
  },
})

const app = new OpenAPIHono({
  defaultHook: (result, c) => {
    if (!result.success) return c.json({ code: 'INVALID_INPUT', message: 'Invalid request body' }, 400)
  },
})

app.openapi(route, async (c) => {
  const body = c.req.valid('json')            // already validated by Zod
  const jwt = c.req.header('Authorization')!  // forward the user's JWT so RLS applies
  const result = await getSuggestions(body, jwt)
  if (!result.ok) return c.json(result.error, result.status)
  return c.json(result.data, 200)
})

app.doc('/get-suggestions/openapi.json', { openapi: '3.1.0', info: { title: 'get-suggestions', version: '1' } })

Deno.serve(app.fetch)
```

## 3. Rules

- **Zod first**: nothing touches the DB or a third party before the input is validated.
- Create the Supabase client with the **caller's JWT** so RLS applies. Use `service_role` only when the task requires it (ingestion, webhooks) and say why in the PR.
- Secrets via `Deno.env.get('TMDB_API_KEY')`; fail at startup if missing, no fallbacks, never log them.
- Return typed results from the handler (`{ ok: true, data } | { ok: false, status, error }`) instead of throwing by default. Stable `code` per error; no stack traces or SQL in responses.
- Idempotent for anything a phone may retry (idempotency key or upsert on a natural key).
- The scoring is in-house and deterministic: no LLM or external inference.

## 4. Run and test

```bash
npx supabase functions serve <kebab-name>
deno test supabase/functions/<kebab-name>/
```

Tests cover happy path, edge cases and every expected error with its exact `code` (from the task's test cases). Test the handler directly; one HTTP-level test per route is enough.

## 5. Contract

```bash
npm run api:sync
```

Commit the regenerated `api/` and `postman/` in the same PR. Never edit them by hand.
