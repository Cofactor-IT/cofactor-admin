# Sign In - Primer

**Audience:** Developers, PM  
**Last Updated:** 2026-03-12  
**Task:** CA-8

## Why This Exists

Admin users need a secure credentials-based sign-in flow tied to Admin's own database.

## Core Behavior

- Sign-in page at `/signin`
- Credentials provider via NextAuth
- Domain-restricted email validation (`@cofactor.world`)
- Generic invalid credentials message
- Account lockout after repeated failures
- IP-based in-memory rate limiting

## Protected Access

Protected routes require a valid session and redirect to `/signin` when unauthenticated.
