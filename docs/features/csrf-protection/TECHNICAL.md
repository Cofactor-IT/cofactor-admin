# Technical Notes

## Ticket

`CA-28` CSRF Protection

## Implementation Summary

Added:

- `lib/security/csrf.ts`
- `lib/security/csrf.test.ts`

`verifyCsrfOrigin()` compares:

- `origin`
- `x-forwarded-host` or `host`
- `x-forwarded-proto` fallbacking to `http`

If the origin does not match the current request host, it throws.

## Why This Is Limited

The current repo does not have custom mutating API routes beyond NextAuth:

- `app/api/auth/[...nextauth]/route.ts`

That route is intentionally left alone because NextAuth handles its own CSRF flow.

Most application mutations happen through Server Actions, which already receive same-origin
protection from Next.js. Adding a second custom token layer there would be redundant and more
fragile than useful.

## Verification Notes

The existing auth config already pins the session cookie to:

- `sameSite: 'lax'`
- `httpOnly: true`

That remains unchanged.
