# Changelog

## 2026-03-12

- centralized audit logging under `lib/security/audit-log.ts`
- added shared `AUDIT_ACTIONS` constants
- expanded `AuditLog` schema with `userEmail`, `status`, and `error`
- wired sign in, failed sign in, sign out, account creation, and password reset flows into the
  shared audit helper
- added IT-only read-only audit log page at `/settings/audit-log`
- replaced the raw audit table styling with a dense expandable Admin operator table UI
- added server-side actor, status, context, and date range filtering to the audit log review page
- made the audit page height-bounded so only the table scrolls
- split the audit review UI into reusable row, badge, and detail-block components
- styled the audit table scrollbar to match the Admin surface system
