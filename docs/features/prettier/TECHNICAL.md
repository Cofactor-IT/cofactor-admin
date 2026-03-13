# Prettier - Technical Notes (CA-20)

## Files

- `prettier.config.mjs`
- `.prettierignore`
- `eslint.config.mjs`
- `package.json`

## Formatting Rules

The repository now formats code with:

- `tabWidth: 4`
- `useTabs: false`
- `singleQuote: true`
- `semi: true`
- `trailingComma: 'es5'`
- `printWidth: 100`
- `arrowParens: 'always'`
- `endOfLine: 'lf'`

## ESLint Integration

The flat ESLint config appends `eslint-plugin-prettier/recommended`.

This does two things:

- runs Prettier-compatible formatting checks through ESLint
- disables conflicting stylistic ESLint rules

## Package Scripts

Added:

- `npm run format`
- `npm run format:check`

Validation for this ticket includes:

- formatting the full repository with `npm run format`
- re-running `npm run lint`
- re-running `npm run type-check`
