# CSRF Protection

## Purpose

`CA-28` documents and hardens the repo's CSRF position without adding redundant defenses.

The current app primarily mutates data through Server Actions, which already receive same-origin
checks from Next.js. This ticket adds a reusable verification helper for custom API routes and
records the current protection model clearly.

## Current Protection Layers

1. Server Actions
   - protected by Next.js origin checks
2. Session cookie
   - `sameSite: 'lax'`
   - `httpOnly`
3. Future custom API routes
   - should call `verifyCsrfOrigin()` before mutating state

## Current API Surface

The repo currently exposes only one API route:

- `/api/auth/[...nextauth]`

That route is handled by NextAuth and uses NextAuth's own CSRF mechanisms, so no extra custom
wrapper is added around it in this ticket.
