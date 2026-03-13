# ESLint (CA-19)

## Purpose

Establish linting and commit-time enforcement for the agreed Admin code rules.

## What This Enforces

- no explicit `any`
- no unused variables
- no implicit return paths via TypeScript `noImplicitReturns`
- pre-commit blocking when lint or type-check fails

## Developer Workflow

Run these locally:

- `npm run lint`
- `npm run type-check`

On commit:

- `.husky/pre-commit` runs both commands automatically

## Rule Notes

- underscore-prefixed variables are allowed for intentionally unused parameters or caught errors
- implicit return-path enforcement comes from TypeScript, not ESLint
