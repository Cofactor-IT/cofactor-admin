# Technical Notes (CA-10)

## Data Model

- Prisma `User.role` remains required with enum values:
  - `ANALYST`
  - `IT`
- New users are created through validated server action payloads that include `role`.

## Session Claims

- NextAuth callbacks already persist `role` in both JWT and session.
- `Session.user.role` and `JWT.role` are typed in `types/next-auth.d.ts`.

## Permission Helpers

- Added `lib/auth/permissions.ts`:
  - `requireIT()`:
    - Throws `Unauthorized` when no session or non-IT role
  - `requireAnalyst()`:
    - Throws `Unauthorized` when no session
    - Accepts both `ANALYST` and `IT`

## Action Enforcement

- `actions/auth.actions.ts -> signUp` now requires IT session before processing.
- Account creation is no longer based on an environment operator key.
- Audit log for `USER_CREATED` now records acting IT user via `userId`.

## Route Enforcement

- Middleware now uses `/signin` as the canonical public sign-in route.
- `/auth/signup` requires a valid session.
- IT-only route prefixes:
  - `/auth/signup`
  - `/settings`
- Non-IT users hitting IT-only routes are redirected to `/dashboard`.
