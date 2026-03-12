# Admin Database - Primer

**Audience:** Product, Operations, Engineering  
**Last Updated:** 2026-03-12

## Purpose

Cofactor Admin uses a dedicated PostgreSQL database, separate from Scout, so internal tooling can evolve independently and securely.

## Scope In CA-13

- Prisma connection baseline for Admin's own database
- `adminDb` read/write client for application use
- Environment variable template for local setup
- Technical + changelog documentation

## Out Of Scope In CA-13

- Scout database read-only client implementation (next task)
- Admin data models and migrations
- Cross-database synchronization logic

## Operational Notes

- Supabase project provisioning is a manual operation
- Credentials must be stored in a secure secret manager
- `.env` is local-only and not committed
