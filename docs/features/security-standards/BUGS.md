# Bugs (CA-24)

## 2026-03-12

### Potential dev HMR breakage from strict CSP

- Root cause: a production-grade `connect-src 'self'` policy blocks the websocket/localhost
  connections Next.js uses for local hot reload.
- Fix: allow `ws:` and `http://localhost:*` only when `NODE_ENV !== 'production'`.
- Production behavior remains locked to `connect-src 'self'`.
