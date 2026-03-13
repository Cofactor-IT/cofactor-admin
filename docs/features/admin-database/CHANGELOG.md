# Admin Database - Changelog

**Last Updated:** 2026-03-12

## [2026-03-12] CA-13 Initial Setup

### Added

- Prisma project baseline for Admin database access
- Initial Admin MVP data schema in `prisma/schema.prisma`:
  - `User`, `Account`, `Session`, `VerificationToken`
  - `Deal`, `Contact`, `DealContact`, `Interaction`, `Note`
  - `EmailTemplate`, `AuditLog`
- `prisma/schema.prisma` with:
  - `url = env("ADMIN_DATABASE_URL_POOLED")`
  - `directUrl = env("ADMIN_DATABASE_URL")`
- `lib/database/adminDb.ts` singleton Prisma read/write client
- reserved the `lib/database/scoutDb.ts` path that was later populated by CA-14
- Initial SQL migration scaffold:
  - `prisma/migrations/20260312_init/migration.sql`
  - Includes DB-level constraints enforcing `Note` single-target behavior
- `.env.example` with Admin DB and auth variable placeholders
- Docker local development setup:
  - `docker-compose.yml` (`admin-db`, `adminer`)
  - `.dockerignore`
- `package.json` Prisma scripts:
  - `docker:up`
  - `docker:down`
  - `docker:logs`
  - `prisma:generate`
  - `prisma:format`
  - `prisma:db-pull`
  - `prisma:migrate:deploy`
  - `prisma:migrate:status`
- `.gitignore` entries for env files, build output, and local Prisma DB artifacts

### Notes

- Supabase project creation and real credential entry are manual operational steps.
- For fresh databases, migration deployment is the primary setup path.
- Migration `20260312_init` is now deployed and verified on the Admin Supabase database.
- Local Docker DB default port moved from `5434` to `55434` to avoid port conflicts.
