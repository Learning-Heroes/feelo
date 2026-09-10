---
name: docs-and-testing
description: How to document changes and the minimum tests expected in Feelo. Use when closing any task that touches architecture, the data model, API contracts, or non-trivial business logic.
---

# Documentation and testing — Feelo

## When to document

- Architecture changes → `docs/architecture.md`.
- Data schema or RLS changes → `docs/database.md`.
- Contract changes (Edge Functions, external integrations) → `docs/api-contracts.md`.
- Decisions that can't be deduced from the code (why X and not Y) → a new ADR at `docs/decisions/NNNN-short-title.md`, following the format of `docs/decisions/0001-record-architecture-decisions.md`.

Documentation is updated in the same PR as the code that motivates it, not after.

## When to test

- Non-trivial business logic (calculations, transformations, validations — e.g. deck filtering by mood/platform, "already swiped" exclusion): unit test.
- Critical RLS policies: verify with at least two different users.
- UI: prioritize behavior tests (interaction, loading/error states) over snapshots.

## What not to do

- Don't document what's already obvious from reading the code — that's noise that goes stale.
- Don't write tests that only confirm a mock returns what the mock returns.
