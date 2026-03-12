# Scout Read-Only Connection - Bugs

**Last Updated:** 2026-03-12

## Open Issues

- None currently tracked.

## Operational Risks To Monitor

- If `SCOUT_DB_READONLY_URL` accidentally points to a write-capable role, writes could succeed.
- If Scout schema changes, regenerate `@prisma/scout-client` to keep models in sync.
