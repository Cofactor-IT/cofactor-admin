# Cofactor Admin

Internal operations platform for Cofactor.

## Current Status

Project bootstrap is in progress.  
Database foundation and Prisma schema are set up for Admin's own data store.

## Tech Stack (Current)

- Node.js + npm
- Prisma ORM
- PostgreSQL (Supabase for hosted, Docker for local)

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create local env file:

```bash
cp .env.example .env
```

3. Fill `.env` with real values for:

- `ADMIN_DATABASE_URL`
- `ADMIN_DATABASE_URL_POOLED`
- `SCOUT_DB_READONLY_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`

## Database Workflows

### Supabase (Primary)

Use your Admin Supabase project URLs in `.env`.

```bash
npm run prisma:migrate:deploy
npm run prisma:migrate:status
```

### Local Docker (Optional)

Start local DB + Adminer:

```bash
npm run docker:up
```

Service defaults:

- Postgres: `localhost:55434`
- Adminer: `http://localhost:8080`

Stop services:

```bash
npm run docker:down
```

## Useful Commands

- `npm run prisma:format`
- `npm run prisma:format:scout`
- `npm run prisma:generate`
- `npm run prisma:generate:scout`
- `npm run prisma:generate:all`
- `npm run prisma:db-pull`
- `npm run prisma:migrate:deploy`
- `npm run prisma:migrate:status`
- `npm run scout:readonly:test`
- `npm run docker:up`
- `npm run docker:logs`
- `npm run docker:down`

## Git Remotes

This repo uses both Bitbucket and GitHub.

- `origin` = Bitbucket
- `github` = GitHub

Verify:

```bash
git remote -v
```

Push branch to both:

```bash
git push -u origin <branch>
git push -u github <branch>
```

## Documentation Workflow (Per Ticket)

When closing a ticket, update docs in `docs/features/<feature>/`:

- `PRIMER.md` for high-level context
- `TECHNICAL.md` for implementation details
- `CHANGELOG.md` for shipped changes
- `BUGS.md` for known issues and fixes

Shared standards and design notes live in:

- `docs/pm-notes/CODE_STANDARDS.md`
- `docs/pm-notes/DESIGN_GUIDELINES.md`

## Initial Ticket Coverage

- `CA-13` Setup Cofactor Admin database
  - Prisma schema + migration baseline
  - `adminDb` client
  - Docker local database setup
- `CA-14` Set up read-only Scout connection
  - Separate Scout Prisma schema/client (`@prisma/scout-client`)
  - `scoutDb` read-only connection layer
  - Read/write permission verification script
