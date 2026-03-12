# Admin Database - Technical Documentation

**Audience:** Developers  
**Last Updated:** 2026-03-12  
**Task:** CA-13

## Goal

Set up Cofactor Admin with its own PostgreSQL database connection via Prisma, separate from Cofactor Scout.

## MVP Data Model Decisions

- `Deal` links to `Contact` through a join table: `DealContact`
  - Supports many-to-many relationships
  - Allows one contact to be in multiple deals
  - Allows tagging the relationship with `role` and `isPrimary`
- `Note` can target exactly one resource at a time:
  - `SUBMISSION` (external Scout submission ID)
  - `DEAL` (Admin deal ID)
  - `CONTACT` (Admin contact ID)
  - Enforced with SQL check constraints in the initial migration

## File Structure

```
prisma/
`-- schema.prisma            # Prisma datasource for Admin DB

lib/database/
|-- adminDb.ts               # Read/write Prisma client for Admin DB
`-- scoutDb.ts               # Placeholder for next task (read-only Scout client)

prisma/migrations/20260312_init/
`-- migration.sql            # Initial schema DDL and constraints

docker-compose.yml           # Local Postgres + Adminer services
.dockerignore                # Docker build context exclusions
.env.example                 # Required env vars and placeholders
```

## Prisma Configuration

**File:** `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("ADMIN_DATABASE_URL_POOLED")
  directUrl = env("ADMIN_DATABASE_URL")
}
```

### Why Two URLs

- `ADMIN_DATABASE_URL_POOLED` is used by the app/runtime (pgBouncer pooled connection)
- `ADMIN_DATABASE_URL` is used for Prisma operations that require direct DB access (migrations/introspection)

## Prisma Client

**File:** `lib/database/adminDb.ts`

### Behavior

- Exports a singleton Prisma client as `adminDb`
- Uses verbose Prisma logging in development (`query`, `error`, `warn`)
- Uses minimal logging in production (`error`)
- Reuses a global instance in non-production to avoid connection exhaustion during hot reload

## Environment Variables

**File:** `.env.example`

Required variables:

- `ADMIN_DATABASE_URL`
- `ADMIN_DATABASE_URL_POOLED`
- `ADMIN_DB_NAME` (local Docker)
- `ADMIN_DB_USER` (local Docker)
- `ADMIN_DB_PASSWORD` (local Docker)
- `ADMIN_DB_PORT` (local Docker)
- `ADMINER_PORT` (local Docker)
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`

The real `.env` file is intentionally not committed.

## Local Docker Setup

```bash
npm run docker:up
```

Creates:

- Postgres on `localhost:55434` (or `ADMIN_DB_PORT`)
- Adminer on `http://localhost:8080` (or `ADMINER_PORT`)

Optional:

```bash
npm run docker:logs
npm run docker:down
```

## Verification

For a fresh Admin DB, apply migrations first:

```bash
npm run prisma:migrate:deploy
npm run prisma:migrate:status
```

Use `prisma db pull` only when introspecting an existing database schema.

### Schema Validation Commands (already run locally)

```bash
npm run prisma:format
npx prisma validate
npm run prisma:generate
```
