# Changelog (CA-25)

## 2026-03-12

- Replaced the one-off auth limiter with a centralized in-memory rate-limit utility
- Added `RATE_LIMITS` for sign-in, sign-up, and password reset flows
- Added cleanup, reset, and request-IP helper support to the shared security layer
- Applied sign-up and password-reset throttling before their first database query
- Extended the sign-in flow to return retry-aware `RATE_LIMITED:<seconds>` errors
- Added tests for shared rate-limit behavior and action-level throttling
