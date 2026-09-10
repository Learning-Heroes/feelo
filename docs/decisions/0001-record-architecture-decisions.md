# 0001 · Record architecture decisions as ADRs

- **Status**: accepted
- **Context**: we need a place for decisions that can't be deduced by reading the code (why X instead of Y), so an agent or a new person doesn't unknowingly repeat or contradict them.
- **Decision**: every non-trivial architecture, data-model or library decision is documented as an ADR in `docs/decisions/`, formatted as `NNNN-short-title.md`.
- **Consequences**: more discipline when making decisions; in exchange, the project's "why" is written down and versioned alongside the code, not left in the team's memory.
