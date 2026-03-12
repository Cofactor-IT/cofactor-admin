# Domain-Restricted Sign Up - Primer

**Audience:** Developers, PM  
**Last Updated:** 2026-03-12  
**Task:** CA-7

## Why This Exists

Admin account creation must be restricted to internal Cofactor identities only.

## Core Rule

Only emails ending with `@cofactor.world` are accepted at validation time.

## Scope

- signup page and form submission flow
- server-side IT operator gate for manual account creation
- server-side schema validation in server action
- user creation and audit log write on success
- explicit rejection for non-`@cofactor.world` emails before DB lookup/write
