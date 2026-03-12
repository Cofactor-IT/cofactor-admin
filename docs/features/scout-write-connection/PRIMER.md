# Scout Scoped Write Connection - Primer

**Audience:** Developers, PM  
**Last Updated:** 2026-03-12  
**Task:** CA-15

## Why This Exists

Cofactor Admin needs to update selected fields in Scout without broad write access.

This feature adds a dedicated scoped-write connection that can:

- read Scout data needed for workflows
- update submission status
- reject writes to non-approved fields at the database permission layer

## What Is Included

- `SCOUT_DB_WRITE_URL` environment variable contract
- `lib/database/scoutWriteDb.ts` Prisma client wrapper
- `scripts/setup-local-scout-db.mjs` local Scout DB bootstrap utility
- `scripts/test-scout-write-scope.mjs` permission verification script
- `npm run scout:write:test` command

## What Is Not Included

- broad write access to Scout tables
- reusable write access outside submission-status workflows
- new Scout schema or migrations from Admin
