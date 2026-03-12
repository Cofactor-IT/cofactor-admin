# Role Assignment (CA-10)

## Purpose

Ensure every Cofactor Admin account has an explicit role at creation and enforce role checks beyond the UI.

## Scope

- `User.role` is mandatory and limited to `ANALYST` or `IT`
- Role claim is available in JWT/session for request-time checks
- IT-only account creation path
- Route-level and action-level authorization checks

## Out of Scope

- Fine-grained permission matrices for future modules
- External identity provider role mapping
