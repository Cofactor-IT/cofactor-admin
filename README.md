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
- `SCOUT_DB_WRITE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `PASSWORD_RESET_TOKEN_TTL_MINUTES`
- `PASSWORD_RESET_DEV_SHOW_LINK`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASSWORD`
- `SMTP_FROM`

## Database Workflows

### Supabase (Primary)

Use your Admin Supabase project URLs in `.env`.

```bash
npm run prisma:migrate:deploy
npm run prisma:migrate:status
```

### Local Docker (Optional)

Start local Admin DB + Adminer:

```bash
npm run docker:up
```

Service defaults:

- Admin Postgres: `localhost:55434`
- Adminer: `http://localhost:8080`

Start Admin + Scout local DBs + Adminer:

```bash
npm run docker:up:all
```

Bootstrap local Scout schema and scoped roles:

```bash
npm run scout:local:setup
```

Stop services:

```bash
npm run docker:down
```

## Useful Commands

- `npm run dev` (webpack, default for stability)
- `npm run dev:turbo` (optional Turbopack mode)
- `npm run start`
- `npm run prisma:format`
- `npm run prisma:format:scout`
- `npm run prisma:generate`
- `npm run prisma:generate:scout`
- `npm run prisma:generate:all`
- `npm run prisma:db-pull`
- `npm run prisma:migrate:deploy`
- `npm run prisma:migrate:status`
- `npm run lint`
- `npm run type-check`
- `npm run build`
- `npm run scout:local:setup`
- `npm run scout:readonly:test`
- `npm run scout:write:test`
- `npm run docker:up`
- `npm run docker:up:all`
- `npm run docker:logs`
- `npm run docker:down`

## Branding Placeholders

Placeholder favicon and logos are currently copied from Cofactor Scout:

- `app/favicon.ico`
- `public/branding/cofactor-admin-placeholder-navbar-logo.png`
- `public/branding/cofactor-admin-placeholder-hero-logo.png`
- `public/branding/cofactor-admin-placeholder-navbar-logo.svg`
- `public/branding/cofactor-admin-placeholder-hero-logo.svg`

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

## CI/CD

Both pipeline systems are configured:

- GitHub Actions: `.github/workflows/ci.yml`
- Bitbucket Pipelines: `bitbucket-pipelines.yml`

Both run:

- `npm ci`
- `npm run prisma:generate:all`
- `npm run lint`
- `npm run type-check`
- `npm run build`

## Initial Ticket Coverage

- `CA-13` Setup Cofactor Admin database
  - Prisma schema + migration baseline
  - `adminDb` client
  - Docker local database setup
- `CA-14` Set up read-only Scout connection
  - Separate Scout Prisma schema/client (`@prisma/scout-client`)
  - `scoutDb` read-only connection layer
  - Read/write permission verification script
- `CA-15` Set up scoped write connection to Scout
  - `scoutWriteDb` scoped-write connection layer
  - Status-only permission verification script
- `CA-22` Set up CI/CD pipeline
  - GitHub Actions workflow
  - Bitbucket pipeline config
  - lint/type-check/build quality gates
- `CA-7` Domain-restricted sign up
  - `@cofactor.world` validation in server-side Zod schema
  - Signup server action + user creation + audit logging
- `CA-8` Sign in
  - NextAuth credentials sign-in with lockout and rate limiting
  - Protected-route middleware and session wiring
- `CA-12` Session management
  - JWT session strategy with 7-day `maxAge` and 24-hour `updateAge`
  - Matching JWT/session max-age and token claim hydration (`id`, `role`, `email`, `name`)
  - Session token cookie: `cofactor-admin-session` with hardened options (`httpOnly`, `sameSite`, `secure`, `path`)
- `CA-9` Sign out
  - Shared sidebar sign-out action available across protected pages
  - Sign-out audit event logged before session destruction (`USER_SIGN_OUT`)
  - Redirect to `/signin` with middleware-protected back-button behavior
- `CA-10` Role assignment
  - Role stored on User and embedded in JWT/session claims
  - IT-only account creation enforced in route middleware and server action
  - Shared role guard helpers for IT and analyst-level authorization
- `CA-35` Base page layout shell
  - Shared `AdminShell` for protected pages
  - Fixed `240px` sidebar offset with title/actions header pattern
  - Consistent desktop content padding and global Admin background
- `CA-36` Sidebar
  - Fixed five-item Admin navigation with icons and active states
  - Persistent brand row and bottom user identity bar
  - Placeholder pages added for all sidebar destinations
- `CA-37` Routing structure
  - Added `/dashboard` authenticated landing route and `/signin` public sign-in entry
  - Phase 1 module routes now resolve at `/submissions`, `/scouts`, `/crm`, `/pipeline`, and `/templates`
  - Legacy route aliases redirect to the new route contract
- `CA-38` Dashboard
  - Dashboard landing page with live stat cards, module previews, and recent activity feed
  - Admin + Scout readonly query composition for fresh counts on page load
  - Card-based dashboard layout with graceful empty states
- `CA-11` Password reset
  - `/auth/forgot-password` request flow with generic anti-enumeration messaging
  - `/auth/reset-password` token + expiry validation with one-time token consumption
  - SMTP-driven reset email support with optional local dev reset-link display
