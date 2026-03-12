# Scout Read-Only Connection - Technical Documentation

**Audience:** Developers  
**Last Updated:** 2026-03-12  
**Task:** CA-14

## Goal

Provide a safe read-only connection from Cofactor Admin to Cofactor Scout's database.

## File Structure

```
lib/database/
`-- scoutDb.ts                    # Read-only Scout Prisma client wrapper

prisma/
`-- scout/schema.prisma           # Scout schema for separate Prisma client generation

scripts/
`-- test-scout-readonly.mjs       # Verifies read succeeds and write is blocked
```

## Environment Variables

Required:

- `SCOUT_DB_READONLY_URL`

This URL must use a dedicated read-only Postgres role from Scout's Supabase project.

## Scout Supabase Role Setup (Manual)

Run in Scout Supabase SQL editor:

```sql
CREATE USER cofactor_admin_readonly WITH PASSWORD 'your-secure-password';
GRANT CONNECT ON DATABASE postgres TO cofactor_admin_readonly;
GRANT USAGE ON SCHEMA public TO cofactor_admin_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO cofactor_admin_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO cofactor_admin_readonly;
```

This enforces read-only access at the database permission layer.

## Prisma Client Separation

`prisma/scout/schema.prisma` uses a separate generator output:

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../../node_modules/@prisma/scout-client"
}

datasource db {
  provider = "postgresql"
  url      = env("SCOUT_DB_READONLY_URL")
}
```

This keeps Scout and Admin Prisma clients isolated and prevents schema collisions.

## Runtime Client

`lib/database/scoutDb.ts`:

- imports `PrismaClient` from `@prisma/scout-client`
- injects `SCOUT_DB_READONLY_URL` at runtime
- throws immediately if env variable is missing
- uses global singleton pattern in non-production

## Commands

Generate Scout client:

```bash
npm run prisma:generate:scout
```

Generate both Admin + Scout clients:

```bash
npm run prisma:generate:all
```

Validate read-only behavior:

```bash
npm run scout:readonly:test
```

## Read-Only Verification Strategy

The test script checks:

1. **Read path**: `findMany` on Scout `User` model
2. **Write block**: safe `UPDATE ... WHERE 1 = 0` probe

`WHERE 1 = 0` ensures no data mutation even if a role is misconfigured, while still requiring update privileges.

## End-To-End Verification

After setting `SCOUT_DB_READONLY_URL`:

```bash
npm run prisma:generate:scout
npm run scout:readonly:test
```

Expected:

- Read check succeeds
- Write check is rejected by Postgres permission error
