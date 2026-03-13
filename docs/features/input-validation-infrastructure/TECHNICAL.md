# Input Validation Infrastructure - Technical Notes (CA-23)

## Files

- `lib/validation/base.schemas.ts`
- `lib/validation/auth.schemas.ts`
- `lib/validation/result.ts`
- `actions/auth.actions.ts`
- `actions/password-reset.actions.ts`
- `lib/auth/config.ts`

## Base Schemas

The reusable primitives now include:

- `emailSchema`
- `cofactorEmailSchema`
- `passwordSchema`
- `nameSchema`
- `idSchema`
- `paginationSchema`

These are intended to be reused by later security and CRUD stories instead of redefining validation
locally per feature.

## Auth Schemas

Auth-specific schemas now build on the shared primitives:

- `signUpSchema`
- `signInSchema`
- `forgotPasswordSchema`
- `resetPasswordSchema`
- `createAccountSchema`
- `changePasswordSchema`

Typed exports are provided for each schema where downstream code is expected to consume the parsed
payload.

## Error Handling

`flattenValidationErrors()` converts Zod failures into the field-level error shape already used by
Admin form actions:

```ts
Record<string, string[] | undefined>
```

This keeps runtime validation output UI-safe and avoids leaking raw Zod error objects into action
state.

## Current Integration

The shared validation layer is actively used by:

- `actions/auth.actions.ts`
- `actions/password-reset.actions.ts`
- `lib/auth/config.ts`

That means sign-in and account-management flows now share the same normalized Cofactor email and
password validation contract.
