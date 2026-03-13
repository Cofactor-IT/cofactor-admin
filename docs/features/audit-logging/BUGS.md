# Bugs

## 2026-03-12

### Issue

Audit events were being written through ad hoc query calls, which created two problems:

- the action vocabulary was not centralized
- request context and failure handling were inconsistent across flows

### Fix

Introduced `lib/security/audit-log.ts` as the single write entry point.

This helper:

- centralizes action constants
- extracts request metadata consistently
- catches persistence failures so audit writes never block the primary action
