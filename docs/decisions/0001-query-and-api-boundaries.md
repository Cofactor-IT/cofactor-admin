# ADR 0001: Use Query Functions and Server Actions as the Default App Boundary

## Status

Accepted

## Date

2026-03-13

## Context

Cofactor Admin is a Next.js App Router application with:

- server-rendered read surfaces
- authenticated internal mutations
- Prisma-backed PostgreSQL data stores
- a small number of true HTTP endpoint needs, primarily authentication

Without a clear boundary, the codebase would drift into:

- Prisma calls in pages, components, or actions
- unnecessary `/api/*` endpoints for normal internal UI flows
- duplicated authorization and validation logic

That would make the app harder to reason about and easier to break.

## Decision

The default architecture is:

`components/pages -> server actions or server pages -> query functions -> database`

### Default rules

1. Prisma stays in `lib/database/queries/` and the database client files only.
2. Internal app mutations use Server Actions by default.
3. Read-only server-rendered pages may call query functions directly.
4. API routes are used only when an actual HTTP endpoint is required.

### Appropriate use of query functions

Use query functions for:

- all Prisma reads and writes
- database-specific filtering and shaping
- transactional operations
- shared persistence logic used by multiple surfaces

### Appropriate use of Server Actions

Use Server Actions for:

- authenticated form submissions
- internal Admin mutations triggered by the UI
- validation, auth, authorization, and revalidation orchestration

### Appropriate use of API routes

Use API routes only for:

- NextAuth
- webhooks
- external machine-to-machine integrations
- true cross-origin or HTTP-only workflows
- file upload cases that require an HTTP endpoint

## Consequences

### Positive

- auth and validation stay close to the mutation boundary
- Prisma remains isolated and easier to audit
- internal UI flows avoid unnecessary HTTP boilerplate
- SSR read pages can stay simple and efficient

### Tradeoffs

- server pages and actions must remain disciplined about calling query functions instead of reaching
  for database clients directly
- future contributors may need explicit documentation to avoid adding unnecessary API routes

## Current application of this decision

Examples that follow the boundary:

- `app/dashboard/page.tsx` reads through dashboard query functions
- `app/settings/audit-log/page.tsx` reads through audit-log query functions
- `actions/auth.actions.ts` orchestrates validation/auth and delegates persistence to queries
- `actions/password-reset.actions.ts` uses helpers and query-layer persistence

Current justified API route:

- `app/api/auth/[...nextauth]/route.ts`

## Guardrails for future work

Before adding a new API route, ask:

1. Is this a true HTTP integration requirement?
2. Could this be a Server Action instead?
3. Does the persistence logic belong in a query function?

If the answer to `2` is yes, prefer a Server Action.
