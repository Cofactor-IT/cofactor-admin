# Scout Read-Only Connection - Changelog

**Last Updated:** 2026-03-12

## [2026-04-13] Local Pairing Clarification

### Changed

- documented that shared local Admin + Scout development should point `SCOUT_DB_READONLY_URL` at
  the real local Scout app database on `localhost:5434/cofactor_db`
- clarified that the Admin Docker `scout-db` service on `localhost:55435` is an optional isolated
  mirror, not the default shared local Scout source
- added setup guidance for creating Admin roles directly on the real local Scout DB without pushing
  Admin's copy of the Scout schema

### Notes

- This change fixes a local-dev data-source mismatch where Admin could read an empty mirror DB while
  Scout submissions were being written to the real Scout local DB.

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
