---
description: Take a Notion task through Feelo's workflow (task → spec → red tests → green → PR)
---

Task to implement: $ARGUMENTS

Follow the Workflow section of `AGENTS.md`:

1. Fetch the task from Notion (`notion` MCP) and the pages it links. If it lacks acceptance criteria or test cases, or anything you need is undefined, stop: say what's missing and who owns it (see "Who to ask").
2. Create the branch (`feat/…`, `fix/…`, `docs/…`, `chore/…`).
3. Write the technical spec in `specs/<task-slug>.md`: what changes, where, and what "done" means. **Stop and wait for human review of the spec before writing code.**
4. Write the tests from the task's test cases and run them: they must fail.
5. Implement until green. Load the matching skill (`new-migration`, `edge-function`, `glass-component`, `expo`) when the task touches that area.
6. `npm run lint`, `npm run typecheck`, `npm run test`; `npm run api:sync` if the schema or a function changed.
7. Draft the PR description from `.github/pull_request_template.md`, linking the task and the spec. Don't push without confirmation.
