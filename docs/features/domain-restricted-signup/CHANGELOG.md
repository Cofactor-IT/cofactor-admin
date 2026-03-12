# Domain-Restricted Sign Up - Changelog

**Last Updated:** 2026-03-12

## [2026-03-12] CA-7 Initial Setup

### Added

- signup page at `app/auth/signup/page.tsx`
- server action `signUp` in `actions/auth.actions.ts`
- Zod auth schema with `@cofactor.world` restriction
- server-side IT operator gate (`ADMIN_ACCOUNT_CREATION_KEY`)
- password hashing utility (`bcryptjs`)
- user query and audit log query functions
- automated tests for schema and server action behavior
- CA-7 feature docs
