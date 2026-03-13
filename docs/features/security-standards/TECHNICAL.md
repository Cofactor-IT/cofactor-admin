# Security Standards - Technical Notes (CA-24)

## Files

- `lib/security/headers.ts`
- `lib/security/headers.test.ts`
- `proxy.ts`

## Header Helper

`lib/security/headers.ts` owns the reusable security header contract:

- `buildContentSecurityPolicy()`
- `applySecurityHeaders(response)`

This keeps `proxy.ts` focused on routing decisions instead of inline header assembly.

## Applied Headers

Every proxied response now receives:

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()`
- `Content-Security-Policy`

Production responses additionally receive:

- `Strict-Transport-Security: max-age=31536000; includeSubDomains`

## CSP Behavior

The CSP uses the requested baseline:

- `default-src 'self'`
- `script-src 'self' 'unsafe-eval' 'unsafe-inline'`
- `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`
- `font-src 'self' https://fonts.gstatic.com`
- `img-src 'self' data: blob:`
- `frame-ancestors 'none'`

`connect-src` differs by environment:

- production: `'self'`
- development: `'self' ws: http://localhost:*`

The development exception is required so Next.js hot reload still functions locally.

## Proxy Integration

`proxy.ts` now routes every exit path through shared helpers:

- `nextResponse()`
- `redirectResponse(url)`

That guarantees the same security headers on:

- public requests
- protected requests
- legacy route redirects
- unauthenticated redirects to `/signin`
- authenticated redirects away from `/signin`
- IT-only authorization redirects
