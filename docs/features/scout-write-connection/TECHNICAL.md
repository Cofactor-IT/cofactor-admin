# Scout Scoped Write Connection - Technical Documentation

**Audience:** Developers  
**Last Updated:** 2026-03-12  
**Task:** CA-15

## Goal

Provide a narrow, controlled write path from Cofactor Admin to Cofactor Scout.

The allowed write scope is submission status updates only.

## File Structure

```
lib/database/
`-- scoutWriteDb.ts                # Scoped-write Scout Prisma client wrapper

scripts/
|-- setup-local-scout-db.mjs       # Bootstraps local Scout schema + grants
`-- test-scout-write-scope.mjs     # Verifies scoped write permissions
```

## Environment Variables

Required:

- `SCOUT_DB_WRITE_URL`

This URL must use a dedicated Scout Supabase Postgres role with limited grants.

## Scout Supabase Role Setup (Manual)

Run in Scout Supabase SQL editor using the real Scout table name:

```sql
CREATE USER cofactor_admin_write WITH PASSWORD 'your-secure-password';
GRANT CONNECT ON DATABASE postgres TO cofactor_admin_write;
GRANT USAGE ON SCHEMA public TO cofactor_admin_write;
GRANT SELECT ON "ResearchSubmission" TO cofactor_admin_write;
GRANT UPDATE ("status") ON "ResearchSubmission" TO cofactor_admin_write;
```

Notes:

- The model in Scout Prisma schema is `ResearchSubmission`, so SQL grants target `"ResearchSubmission"`.
- `UPDATE ("status")` restricts the role to the `status` column only.

## Runtime Client

`lib/database/scoutWriteDb.ts`:

- imports `PrismaClient` from `@prisma/scout-client`
- injects `SCOUT_DB_WRITE_URL` at runtime
- throws immediately if env variable is missing
- uses global singleton pattern in non-production

## Commands

Bootstrap local Scout DB + scoped roles:

```bash
npm run scout:local:setup
```

Verify scoped-write behavior:

```bash
npm run scout:write:test
```

## Scoped Permission Verification Strategy

The test script checks:

1. **Read path**: `findMany` on Scout `ResearchSubmission`
2. **Allowed write**: `UPDATE "ResearchSubmission" SET "status" = "status" WHERE 1 = 0`
3. **Blocked write**: `UPDATE "ResearchSubmission" SET "updatedAt" = "updatedAt" WHERE 1 = 0`

`WHERE 1 = 0` ensures no data mutation while still forcing Postgres permission checks.

## Submission Action Usage Boundary

`scoutWriteDb` should be imported only in submission-status write paths.

At MVP, treat this client as dedicated to status updates and avoid reuse in unrelated features.
