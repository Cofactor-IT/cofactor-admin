# Technical Notes

## Ticket

`CA-27` Audit Logging

## Implementation Summary

Audit logging is split into two layers:

1. `lib/security/audit-log.ts`
   - action constants
   - request-context extraction
   - failure-tolerant logging helper
2. `lib/database/queries/auditLogs.ts`
   - persistence query
   - recent audit log retrieval for IT review

This keeps the rest of the codebase using a security-oriented helper while Prisma remains in the
query layer.

## Schema Changes

`AuditLog` now stores additional context:

- `userEmail`
- `status`
- `error`

`userId` is optional so system-originated or partially-authenticated failures can still be logged.

## Request Context

`getAuditRequestContext()` reads:

- `x-forwarded-for`
- `user-agent`

`getAuditRequestContextFromSource()` exists for request-like objects passed in by NextAuth.

That allows the credentials authorize path to write sign-in success and failure events without
duplicating header parsing logic.

## UI Surface

The IT-only review page lives at:

- `/settings/audit-log`

It is linked from the Admin shell footer utility section and protected by the existing IT route
guarding.

## Coverage

Current centralized audit writes exist in:

- `lib/auth/config.ts`
- `actions/auth.actions.ts`
- `actions/password-reset.actions.ts`
- `actions/session.actions.ts`

Future consequential actions should call `logAuditAction()` from `lib/security/audit-log.ts`.
