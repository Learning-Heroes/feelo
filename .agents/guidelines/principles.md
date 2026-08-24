# Principles (language, architecture, security)

**Level**: blocking.

## Language

- Code (variables, functions, classes, files, technical commits, comments): **English**.
- Agent instructions (`AGENTS.md`, `.agents/`, `.claude/`) and functional docs under `docs/`: **English**.
- The single exception is the root [`README.md`](../../README.md): it stays in **Spanish**, since it's the human-facing landing page for the course ("IA para Developers") this project is built for.

## Architecture

- Stack: Expo (React Native) for the app + Supabase for database, auth and the backend/data layer.
- Do not introduce another backend, ORM or auth service without recording the decision in `docs/decisions/`.
- One component/function = one responsibility. Avoid premature abstractions.

## Security

- Never commit `.env`, plaintext `anon` keys outside `.env.example`, or the Supabase `service_role key` anywhere on the client.
- Row Level Security (RLS) is on by default for every new Supabase table. Any table without RLS needs an explicit justification in an ADR.
- Make sure client-side queries never leak another user's data (always filter by `auth.uid()` or an equivalent RLS policy, not in app logic).
