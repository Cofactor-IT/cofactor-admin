# Scout Scoped Write Connection - Changelog

**Last Updated:** 2026-03-12

## [2026-04-13] Local Pairing Clarification

### Changed

- documented that shared local Admin + Scout development should point `SCOUT_DB_WRITE_URL` at the
  real local Scout app database on `localhost:5434/cofactor_db`
- updated local setup guidance to support `SCOUT_DB_SKIP_SCHEMA_PUSH=true` when bootstrapping Admin
  roles against the real local Scout DB

### Notes

- This avoids destructive schema-push prompts when the setup script is used only to create Admin
  roles and grants on the live local Scout database.

## [2026-03-12] CA-15 Initial Setup

### Added

- `lib/database/scoutWriteDb.ts` scoped-write Scout Prisma client wrapper
- `SCOUT_DB_WRITE_URL` template in `.env.example`
- `scripts/test-scout-write-scope.mjs` for scoped permission checks
- `npm run scout:write:test` command in `package.json`
- `scripts/setup-local-scout-db.mjs` to bootstrap local Scout schema and roles
- `npm run scout:local:setup` and `npm run docker:up:all` commands
- feature docs under `docs/features/scout-write-connection/`

### Notes

- Scout write-role creation and grants are manual operational steps in Supabase.
- Scoped-write test uses no-op SQL probes (`WHERE 1 = 0`) to avoid data mutation.
