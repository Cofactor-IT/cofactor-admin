# ESLint - Technical Notes (CA-19)

## Files

- `eslint.config.mjs`
- `tsconfig.json`
- `package.json`
- `.husky/pre-commit`

## ESLint Rules

The flat config extends the existing Next.js core-web-vitals and TypeScript presets, then adds Admin-specific TypeScript enforcement:

- `@typescript-eslint/no-explicit-any = error`
- `@typescript-eslint/no-unused-vars = error`

Unused-variable enforcement allows underscore-prefixed values:

- `argsIgnorePattern: "^_"`
- `caughtErrorsIgnorePattern: "^_"`
- `varsIgnorePattern: "^_"`

## Implicit Returns

`noImplicitReturns` is enabled in `tsconfig.json`.

This is intentionally enforced by TypeScript rather than ESLint because it is a control-flow/type-checking concern.

## Pre-commit Hook

`husky` is installed as a dev dependency and initialized through:

- `package.json` -> `prepare: "husky"`

The tracked pre-commit hook runs:

```sh
npm run lint
npm run type-check
```

If either command fails, the commit is blocked.
