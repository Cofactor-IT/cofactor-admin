# CI/CD Pipeline - Changelog

**Last Updated:** 2026-03-12

## [2026-03-12] CA-22 Initial Setup

### Added

- `.github/workflows/ci.yml` for GitHub CI checks
- `bitbucket-pipelines.yml` for Bitbucket CI checks
- `lint`, `type-check`, and `build` npm scripts
- Prisma generate step (`npm run prisma:generate:all`) before quality checks
- baseline Next.js/TypeScript config required by the quality checks
- CA-22 feature docs
