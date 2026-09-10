# Documentation index

Recommended reading map for humans and agents. No need to read all of it for every task — just what's relevant.

| File | Content | When to read it |
|---|---|---|
| [`product.md`](product.md) | Functional description of the app | Before working on any product feature |
| [`architecture.md`](architecture.md) | Expo + Supabase architecture | Before touching the app's structure or the Supabase integration |
| [`database.md`](database.md) | Data model, tables, relationships, RLS | Before touching the schema or writing new queries/policies |
| [`api-contracts.md`](api-contracts.md) | Contracts between the app, Supabase and external services | Before touching an integration or Edge Function |
| [`decisions/`](decisions/) | ADRs — decisions that can't be deduced from the code | When you need to understand the "why" of something already decided |
| [`skills/`](skills/) | Reusable docs/product prompts and notes | When reusing an approach already solved before |

General agent rules: [`../AGENTS.md`](../AGENTS.md). Claude-specific instructions: [`../.claude/CLAUDE.md`](../.claude/CLAUDE.md).
