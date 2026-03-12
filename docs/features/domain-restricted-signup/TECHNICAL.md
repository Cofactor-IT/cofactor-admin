# Domain-Restricted Sign Up - Technical Documentation

**Audience:** Developers  
**Last Updated:** 2026-03-12  
**Task:** CA-7

## Goal

Enforce internal-domain-only account creation for Admin (`@cofactor.world`) at server validation level.

## Files

```
app/auth/signup/page.tsx               # Signup UI
actions/auth.actions.ts                # Server action orchestration
actions/auth.actions.test.ts           # Server action behavior tests
lib/validation/auth.schemas.ts         # Zod schema and domain restriction
lib/validation/auth.schemas.test.ts    # Schema validation tests
lib/auth/password.ts                   # Bcrypt password hashing
lib/auth/accountCreationAccess.ts      # IT operator key guard
lib/database/queries/users.ts          # User lookup/create queries
lib/database/queries/auditLogs.ts      # Audit log query
```

## Validation Order

`actions/auth.actions.ts` performs:

1. Validate IT operator access key
2. Parse `FormData`
3. Validate with `signUpSchema`
4. Reject with field errors on schema failure
5. Check existing email
6. Hash password
7. Create user
8. Write audit log

Schema failure returns before any DB query call.

## No Open Registration Guard

`lib/auth/accountCreationAccess.ts` validates `ADMIN_ACCOUNT_CREATION_KEY` before processing signup.

Without a valid operator key:

- request is rejected by the server action
- no database lookup/write is executed
- domain validation cannot be bypassed via direct action/API calls

## Domain Restriction

`lib/validation/auth.schemas.ts` enforces:

```ts
email.toLowerCase().endsWith("@cofactor.world")
```

This executes in the server action, so direct action/API calls cannot bypass UI controls.

## Role and Security Notes

- `role` is required and restricted to `ANALYST | IT`.
- Password is hashed with bcrypt (`12` rounds) before storage.
- Query functions never return password hash fields.
- Action tests verify invalid-domain rejection happens before DB queries.
