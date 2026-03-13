# Husky Pre-Commit Hooks - Technical Notes (CA-21)

## Files

- `.husky/pre-commit`
- `package.json`
- `package-lock.json`

## Hook Flow

The pre-commit hook now runs:

```sh
npx lint-staged
npx tsc --noEmit
```

## lint-staged Configuration

Staged file handling is split by file type:

- `*.{ts,tsx}`
  - `eslint --fix`
  - `prettier --write`
- `*.{js,jsx,mjs}`
  - `prettier --write`
- `*.{json,css,md}`
  - `prettier --write`

## Why Type Check Still Runs Globally

`lint-staged` is intentionally scoped to staged files for speed, but type safety can be affected by
cross-file changes. The hook therefore still runs `tsc --noEmit` after staged-file fixes complete.

The hook calls `npx tsc --noEmit` directly rather than `npm run type-check` to avoid unnecessary
Prisma generation friction during local commits on Windows.

## Prepare Script

`package.json` now runs Prisma client generation inside `prepare` before Husky initialization:

```sh
npm run prisma:generate:all && husky
```

This keeps fresh installs compatible with the direct `tsc --noEmit` pre-commit check without
forcing Prisma generation on every commit.

## Validation Performed

- verified the hook passes on a clean staged change
- verified the hook rejects a staged file with an ESLint failure
