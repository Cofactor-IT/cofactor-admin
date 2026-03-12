# Sign In - Technical Documentation

**Audience:** Developers  
**Last Updated:** 2026-03-12  
**Task:** CA-8

## Goal

Implement NextAuth credentials sign-in for Cofactor Admin with lockout and rate-limit protections.

## Files

```
app/signin/page.tsx                      # Canonical credentials sign-in UI
app/api/auth/[...nextauth]/route.ts      # NextAuth API route handlers
lib/auth/config.ts                       # NextAuth options + authorize logic
lib/auth/session.ts                      # Server session helpers
lib/auth/password.ts                     # verifyPassword utility
lib/security/rate-limit.ts               # In-memory IP rate limiter
lib/database/queries/users.ts            # Auth user lookups + lockout updates
proxy.ts                                 # Session guard for protected routes
types/next-auth.d.ts                     # Session/JWT type augmentation
```

## Security Controls

1. **Domain restriction**
   - `signInSchema` requires `@cofactor.world`
   - Runs server-side in credentials authorize callback
2. **Generic invalid auth errors**
   - Invalid email/password returns `null` (NextAuth `CredentialsSignin`)
   - No email enumeration in UI messages
3. **Account lockout**
   - Tracks `failedLoginAttempts` and `lockedUntil` on `User`
   - Lock applied after 5 failed attempts for 15 minutes
   - Resets attempts on successful sign-in
4. **Rate limiting**
   - In-memory `5 attempts / 15 min` per IP
   - Rejects over-limit requests before DB password verification

## Prisma Changes

`User` model additions:

- `failedLoginAttempts Int @default(0)`
- `lockedUntil DateTime?`

Migration:

- `prisma/migrations/20260312_add_user_lockout_fields/migration.sql`

## Route Protection

`proxy.ts`:

- Allows `/signin`, password-reset auth routes, and `/api/auth/*`
- Requires valid NextAuth token for protected routes
- Redirects unauthenticated users to `/signin?callbackUrl=<path>`
- Redirects authenticated users away from `/signin` to `/dashboard`
