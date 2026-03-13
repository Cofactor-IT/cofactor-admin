# Changelog (CA-24)

## 2026-03-12

- Added centralized proxy security header helpers in `lib/security/headers.ts`
- Applied security headers to all `proxy.ts` response paths, including redirects
- Added test coverage for CSP generation and production-only HSTS behavior
- Documented the development-only CSP connect-source exception required for Next.js HMR
