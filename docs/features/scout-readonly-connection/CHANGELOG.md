# Scout Read-Only Connection - Changelog

**Last Updated:** 2026-03-12

## [2026-03-12] CA-14 Initial Setup

### Added

- `prisma/scout/schema.prisma` based on Scout schema
- Separate Prisma generator output to `@prisma/scout-client`
- `lib/database/scoutDb.ts` read-only Scout client wrapper
- `SCOUT_DB_READONLY_URL` template in `.env.example`
- NPM scripts:
  - `prisma:generate:scout`
  - `prisma:generate:all`
  - `prisma:format:scout`
  - `scout:readonly:test`
- `scripts/test-scout-readonly.mjs` to verify read succeeds and write is blocked

### Notes

- Read-only DB role creation in Scout Supabase is a manual operational step.
- `SCOUT_DB_READONLY_URL` is required in local `.env` for runtime and test commands.
