# Scout Read-Only Connection - Primer

**Audience:** Product, Operations, Engineering  
**Last Updated:** 2026-03-12  
**Task:** CA-14

## Purpose

Allow Cofactor Admin to read Scout data (submissions, users, profiles) without copying that data into Admin and without allowing writes.

## Why This Exists

- Keeps Scout as source of truth for Scout-owned entities
- Reduces data duplication between projects
- Enforces database-level safety via read-only credentials

## Scope In CA-14

- Separate Prisma schema for Scout (`prisma/scout/schema.prisma`)
- Generated Scout client at `@prisma/scout-client`
- Read-only client wrapper in `lib/database/scoutDb.ts`
- Environment variable template and test command for read/write permission checks
