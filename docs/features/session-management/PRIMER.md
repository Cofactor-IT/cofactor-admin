# Session Management (CA-12)

## Purpose

Configure reliable and secure sign-in persistence for Admin users using NextAuth JWT sessions.

## Scope

- JWT-based stateless session strategy
- 7-day session expiry
- 24-hour activity-based token refresh window
- Explicit secure session cookie options

## Out of Scope

- Multi-device session revocation
- Forced logout across all devices
- Database-backed session records
