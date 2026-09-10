---
description: Implement a new feature following the repo's workflow (understand → implement → test → document → PR)
---

You're going to implement the following feature: $ARGUMENTS

Follow the workflow described in [`.agents/guidelines/workflow.md`](../../.agents/guidelines/workflow.md):

1. Read `AGENTS.md` and the relevant part of `docs/` for this feature (not all of `docs/`, just what's needed).
2. If the feature implies a non-trivial architecture or data-model decision, propose or update an ADR in `docs/decisions/` before writing code.
3. Implement the smallest change that resolves the feature. Code in English.
4. Run tests/lint if they're defined.
5. Update `docs/` if the feature changes architecture, API contracts or the data model.
6. Prepare the PR summary following `.github/pull_request_template.md`.
