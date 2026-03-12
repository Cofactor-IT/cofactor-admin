# Sign In - Changelog

**Last Updated:** 2026-03-12

## [2026-03-12] CA-8 Initial Setup

### Added

- NextAuth credentials provider config for Admin auth
- `/auth/signin` page with generic and lockout-aware errors
- NextAuth API route (`app/api/auth/[...nextauth]/route.ts`)
- Protected-route middleware with sign-in redirect
- In-memory auth rate limiter (`5 attempts / 15 min / IP`)
- User lockout state fields in Prisma schema + migration
- Session and JWT type augmentation for `id` and `role`
