# Changelog

## 2026-03-12

- centralized audit logging under `lib/security/audit-log.ts`
- added shared `AUDIT_ACTIONS` constants
- expanded `AuditLog` schema with `userEmail`, `status`, and `error`
- wired sign in, failed sign in, sign out, account creation, and password reset flows into the
  shared audit helper
- added IT-only read-only audit log page at `/settings/audit-log`
