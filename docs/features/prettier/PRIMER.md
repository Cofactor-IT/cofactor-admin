# Prettier (CA-20)

## Purpose

Establish one formatting standard for the Admin repository so spacing, quotes, semicolons, and line
wrapping are automatic and consistent.

## What This Enforces

- 4-space indentation
- single quotes
- semicolons
- `es5` trailing commas
- `100` character print width
- LF line endings

## Developer Workflow

Run these locally:

- `npm run format`
- `npm run format:check`

Prettier is configured to ignore:

- `node_modules`
- `.next`
- `.git`
- `next-env.d.ts`
- `*.md`

## Integration Notes

- ESLint remains the code-quality tool
- Prettier handles formatting only
- `eslint-plugin-prettier/recommended` keeps ESLint and Prettier aligned
