# Bugs

## 2026-03-12

### Issue

The repo did not have an explicit reusable CSRF helper for future custom mutating API routes.

### Fix

Added `lib/security/csrf.ts` and documented where it should and should not be used:

- use it for custom mutating API routes
- do not duplicate it in Server Actions
- do not wrap NextAuth's built-in route with a second ad hoc CSRF layer
