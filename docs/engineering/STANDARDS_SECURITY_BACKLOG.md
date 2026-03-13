# Standards And Security Backlog

## Purpose

This file is the working backlog for the remaining tickets in the Standards and Security epic.

It exists so future sessions can recover the implementation plan from the repository instead of
depending on chat history.

## Status Snapshot

- `CA-18` done
- `CA-19` done
- `CA-20` done
- `CA-21` done
- `CA-22` done
- `CA-23` done
- `CA-24` implemented on `feature/CA-24-security-standards`

## Recommended Delivery Order

1. `CA-25` Rate limiting infrastructure
2. `CA-26` HTML sanitization
3. `CA-27` Audit logging
4. `CA-28` CSRF protection

## Repo-Specific Constraints

- Follow `docs/pm-notes/CODE_STANDARDS.md`
- Follow the 3-layer pattern:
  - Components -> Server Actions -> Query Functions -> Database
- Keep Prisma access inside `lib/database/queries/`
- `requireAuth()` must be first in every protected server action
- Zod validation must happen before any database call
- Keep branch names consistent across `origin` and `github`

## Ticket Backlog

### CA-21: Set Up Husky Pre-Commit Hooks

**Goal**

Replace the current simple Husky hook with the full staged-file flow:

- `lint-staged`
- Prettier on staged files
- ESLint fix on staged files
- TypeScript type-check before commit completes

**Current repo state**

- `husky` is already installed
- `.husky/pre-commit` already exists
- current hook runs:
  - `npm run lint`
  - `npm run type-check`

**Work required**

- add `lint-staged`
- update `package.json` with `lint-staged` config
- update `.husky/pre-commit`
- keep the hook compatible with local Windows environments

**Likely files**

- `package.json`
- `package-lock.json`
- `.husky/pre-commit`
- `docs/features/husky/*`
- `README.md`

**Acceptance details to verify**

- staged TS files run through ESLint fix and Prettier
- staged JS/CSS/JSON/MD files run through Prettier
- `npx tsc --noEmit` still runs after `lint-staged`
- a commit with a deliberate lint error is blocked

### CA-23: Input Validation Infrastructure

**Goal**

Establish reusable Zod primitives and auth schemas so every server action validates input through a
shared contract.

**Current repo state**

- `zod` is installed
- auth schemas already exist in `lib/validation/auth.schemas.ts`
- tests already exist around auth schema behavior

**Work required**

- split or add reusable base schemas
- export typed schema inference types
- standardize field-level error returns in server actions
- align existing auth flows with shared primitives instead of ad hoc validation

**Likely files**

- `lib/validation/base.schemas.ts`
- `lib/validation/auth.schemas.ts`
- `actions/auth.actions.ts`
- `actions/password-reset.actions.ts`
- `actions/session.actions.ts`
- tests under `lib/validation/` and `actions/`
- `docs/features/input-validation-infrastructure/*`

**Important implementation note**

This ticket should establish the pattern used by the remaining security tickets. Do not keep
duplicated schema fragments once shared primitives are added.

### CA-24: Security Standards

**Goal**

Apply the baseline security headers in the proxy layer without breaking route protection.

**Current repo state**

- route protection currently lives in `proxy.ts`
- sign-in flow depends on the custom cookie name `cofactor-admin-session`

**Work required**

- add security headers to all responses
- preserve existing redirect/auth behavior
- enable HSTS only in production

**Likely files**

- `proxy.ts`
- tests if proxy/auth behavior is covered
- `docs/features/security-standards/*`

**Important implementation note**

Do not regress the recent auth fix that aligned middleware token reading with the custom cookie
name.

### CA-25: Rate Limiting Infrastructure

**Goal**

Centralize in-memory rate limiting for sign-in, sign-up, and password reset.

**Current repo state**

- `lib/security/rate-limit.ts` already exists
- sign-in already references rate limiting behavior conceptually

**Work required**

- verify the current utility matches the ticket contract
- add central `RATE_LIMITS` config if missing or incomplete
- apply limits consistently in:
  - sign-in
  - sign-up
  - password reset request
- return clear retry messaging

**Likely files**

- `lib/security/rate-limit.ts`
- `lib/security/rate-limit.test.ts`
- `actions/auth.actions.ts`
- `actions/password-reset.actions.ts`
- `docs/features/rate-limiting-infrastructure/*`

**Important implementation note**

Prefer tightening the existing implementation over introducing a second rate-limit abstraction.

### CA-26: HTML Sanitization

**Goal**

Add a sanitization utility layer for plain text, HTML, filenames, and slugs.

**Current repo state**

- password reset and auth flows do not yet need rich HTML sanitization
- future notes/templates/content work will need it

**Work required**

- install `isomorphic-dompurify`
- add server-side sanitization helpers
- apply them where current user-generated text is stored
- document what helper to use for what kind of content

**Likely files**

- `lib/security/sanitization.ts`
- `actions/auth.actions.ts`
- any note/template actions present at implementation time
- `docs/features/html-sanitization/*`

**Important implementation note**

Use this ticket to establish the utility contract now, even if only a small number of current
actions consume it immediately.

### CA-27: Audit Logging

**Goal**

Make consequential actions traceable and consistent through a central audit logging utility.

**Current repo state**

- `AuditLog` already exists in the Prisma schema
- some flows already write audit records
- audit logging is not yet fully centralized under a dedicated security utility

**Work required**

- add `AUDIT_ACTIONS`
- add `logAuditAction()` helper
- normalize existing logging calls to use the helper
- ensure logging failure never blocks the primary action
- verify sign-in, sign-out, failed sign-in, account creation, role changes, and submission updates

**Likely files**

- `lib/security/audit-log.ts`
- `actions/auth.actions.ts`
- `actions/session.actions.ts`
- submission/deal actions as they exist
- any relevant query helpers
- `docs/features/audit-logging/*`

**Important implementation note**

This ticket must work with the existing Admin DB schema rather than introducing a second logging
pattern.

### CA-28: CSRF Protection

**Goal**

Document and enforce CSRF protection for mutating server surfaces.

**Current repo state**

- Server Actions already benefit from Next.js built-in origin checks
- most current mutations are server actions, not API routes
- auth callback routes are handled by NextAuth

**Work required**

- add explicit origin verification utility for any mutating API route
- confirm session cookie remains `sameSite: 'lax'`
- document the manual verification approach
- verify no custom mutating API routes bypass the check

**Likely files**

- `lib/security/csrf.ts`
- `app/api/**/route.ts` for any mutating endpoints
- auth/session docs if cookie behavior is referenced
- `docs/features/csrf-protection/*`

**Important implementation note**

This ticket is partly implementation and partly verification/documentation. Avoid inventing extra
client-side CSRF mechanisms where Next.js server actions already provide protection.

## Execution Notes For Future Sessions

- When starting one of these tickets, read this file and the corresponding Jira ticket text first
- Prefer finishing one ticket completely before starting the next
- If a ticket changes cross-cutting architecture, add an ADR under `docs/decisions/`
- Update `README.md` and `docs/features/<feature>/` as each ticket closes
