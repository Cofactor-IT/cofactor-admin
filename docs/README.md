# Docs Structure

This repo uses a feature-first documentation model.

## Folders

- `features/` ticket-level and feature-level docs
- `pm-notes/` shared standards and product notes
- `guides/` reusable how-to documentation (add as needed)
- `engineering/` cross-cutting engineering docs (add as needed)
- `decisions/` ADRs and architecture decisions (add as needed)

## Key Decisions

- [ADR 0001](./decisions/0001-query-and-api-boundaries.md): query functions and Server Actions are
  the default app boundary; API routes are reserved for true HTTP endpoint needs

## Feature Doc Contract

Each feature should include:

- `PRIMER.md`
- `TECHNICAL.md`
- `CHANGELOG.md`
- `BUGS.md`
