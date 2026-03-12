# Technical Notes (CA-12)

## Auth Configuration

Updated `lib/auth/config.ts` session options:

- `strategy: "jwt"`
- `maxAge: 7 * 24 * 60 * 60`
- `updateAge: 24 * 60 * 60`

## Cookie Hardening

Configured `cookies.sessionToken` with:

- `httpOnly: true`
- `sameSite: "lax"`
- `path: "/"`
- `secure: process.env.NODE_ENV === "production"`

Cookie name is environment-aware:

- Production: `__Secure-next-auth.session-token`
- Non-production: `next-auth.session-token`

## Verification Coverage

Added `lib/auth/config.test.ts` to assert session defaults and cookie options.

Manual verification remains required for real browser persistence behavior (close/reopen browser and idle-expiration scenarios).
