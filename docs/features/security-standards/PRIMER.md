# Security Standards (CA-24)

## Purpose

This ticket hardens every Admin request at the proxy layer before any feature-specific code runs.

The baseline is:

- clickjacking protection
- MIME sniffing protection
- referrer policy
- browser permissions restrictions
- Content Security Policy
- HSTS in production only

## Why It Lives In The Proxy

`proxy.ts` is already the single route gate for:

- public versus protected routes
- sign-in redirects
- IT-only route protection

Adding the security headers there keeps the contract centralized. Every response path gets the same
baseline, including redirects.

## Dev Note

The CSP keeps `connect-src 'self'` in production, but development allows websocket/localhost
connections so Next.js HMR keeps working.
