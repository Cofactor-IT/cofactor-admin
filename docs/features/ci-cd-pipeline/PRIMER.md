# CI/CD Pipeline - Primer

**Audience:** Developers, PM  
**Last Updated:** 2026-03-12  
**Task:** CA-22

## Why This Exists

This feature enforces baseline quality checks before code lands in `main`.

## What Is Included

- GitHub Actions workflow for PRs and pushes to `main`
- Bitbucket Pipelines config for PRs and `main`
- Required npm scripts:
  - `lint`
  - `type-check`
  - `build`

## Quality Gates

Every pipeline run executes:

1. dependency install (`npm ci`)
2. Prisma client generation
3. lint
4. TypeScript type check
5. production build
