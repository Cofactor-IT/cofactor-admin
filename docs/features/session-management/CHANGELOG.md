# Changelog (CA-12)

## 2026-03-12

- Added explicit session management settings in NextAuth:
  - JWT strategy
  - 7-day `maxAge`
  - 24-hour `updateAge`
- Added explicit hardened session token cookie options
- Added environment-aware session token cookie name
- Added unit tests for session and cookie configuration
