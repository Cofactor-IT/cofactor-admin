# Rate Limiting Infrastructure - Technical Notes (CA-25)

## Files

- `lib/security/rate-limit.ts`
- `lib/security/rate-limit.test.ts`
- `lib/auth/config.ts`
- `actions/auth.actions.ts`
- `actions/password-reset.actions.ts`
- `app/auth/signin/SignInForm.tsx`

## Shared Utility

`lib/security/rate-limit.ts` now owns the centralized contract:

- `RATE_LIMITS`
- `checkRateLimit()`
- `resetRateLimit()`
- `cleanupExpiredRecords()`
- `getRequestIpAddress()`

The in-memory store tracks:

- current attempt count
- reset window
- optional lock duration after over-limit attempts

Expired records are cleaned every five minutes and the timer is `unref()`'d so it does not keep
Node processes alive.

## Applied Keys

Current buckets combine client IP and normalized email where available:

- sign in: `signin:<ip>:<email>`
- sign up: `signup:<ip>:<email>`
- password reset: `password-reset:<ip>:<email>`

This keeps enforcement tighter than a pure per-IP bucket while still slowing brute force traffic
from a single source.

## Feature Integration

### Sign In

`lib/auth/config.ts` now:

- uses `RATE_LIMITS.SIGN_IN`
- throws `RATE_LIMITED:<seconds>` when the IP/email bucket is blocked
- resets the sign-in bucket after a successful credentials auth

### Sign Up

`actions/auth.actions.ts` now:

- reads request headers through `next/headers`
- applies `RATE_LIMITS.SIGN_UP` before the first DB query
- returns a clear retry message instead of continuing the account-creation flow

### Password Reset

`actions/password-reset.actions.ts` now:

- applies `RATE_LIMITS.PASSWORD_RESET` before any reset candidate lookup
- returns a clear retry message with no database work once the limit is hit

## UI Behavior

The sign-in form now parses the `RATE_LIMITED:<seconds>` error code and renders a user-facing retry
message instead of a generic invalid-credentials error.
