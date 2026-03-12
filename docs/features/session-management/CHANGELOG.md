# Changelog (CA-12)

## 2026-03-12

- Added explicit session management settings in NextAuth:
  - JWT strategy
  - 7-day `maxAge`
  - 24-hour `updateAge`
- Added matching `jwt.maxAge` setting
- Added explicit hardened session token cookie options
- Set session cookie name to `cofactor-admin-session`
- Added JWT/session claim propagation for `id`, `role`, `email`, and `name`
- Added unit tests for session and cookie configuration
