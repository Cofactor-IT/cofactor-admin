# Scout Scoped Write Connection - Changelog

**Last Updated:** 2026-03-12

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
