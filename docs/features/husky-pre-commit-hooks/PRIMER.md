# Husky Pre-Commit Hooks (CA-21)

## Purpose

Block bad commits automatically before they enter the repository.

## What This Enforces

- staged TypeScript files run through ESLint autofix
- staged source and config files run through Prettier
- full TypeScript type-check runs before the commit completes

## Developer Workflow

On every commit:

1. `lint-staged` runs against staged files only
2. `npm run type-check` runs for full repo safety
3. the commit is rejected if either step fails

## Why This Is Separate From CI

- Husky catches problems before code leaves the local machine
- CI remains the server-side backstop on pull requests
