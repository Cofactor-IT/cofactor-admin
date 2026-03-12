# Technical Notes (CA-12)

## Auth Configuration

Updated `lib/auth/config.ts` session options:

- `strategy: "jwt"`
- `maxAge: 7 * 24 * 60 * 60`
- `updateAge: 24 * 60 * 60`
- `jwt.maxAge: 7 * 24 * 60 * 60` (matches session max age)

## Cookie Hardening

Configured `cookies.sessionToken` with:

- `name: "cofactor-admin-session"`
- `httpOnly: true`
- `sameSite: "lax"`
- `path: "/"`
- `secure: process.env.NODE_ENV === "production"`

## JWT and Session Claims

`callbacks.jwt` and `callbacks.session` now propagate:

- `id`
- `role`
- `email`
- `name`

## Known Limitation

- Role changes made in the database are reflected on next JWT refresh window (`updateAge`) rather than instantly.

## Verification Coverage

Added `lib/auth/config.test.ts` to assert session defaults and cookie options.

Manual verification remains required for real browser persistence behavior (close/reopen browser and idle-expiration scenarios).
