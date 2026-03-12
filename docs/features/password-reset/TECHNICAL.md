# Password Reset Technical

## Routes

- `app/auth/forgot-password/page.tsx`
- `app/auth/reset-password/page.tsx`

## Server Actions

- `requestPasswordReset` in `actions/password-reset.actions.ts`
- `resetPassword` in `actions/password-reset.actions.ts`

## Data Model

- Added `PasswordResetToken` model:
  - `userId`
  - `tokenHash` (unique)
  - `expiresAt`
  - `usedAt`
  - `createdAt`

Migration: `prisma/migrations/20260312_add_password_reset_tokens/migration.sql`

## Query Layer

- `lib/database/queries/passwordResetTokens.ts`
  - clear outstanding tokens for a user
  - create token record
  - consume valid token and update password in one transaction
- `lib/database/queries/users.ts`
  - added `findPasswordResetCandidateByEmail`

## Email Delivery

- `lib/email/passwordReset.ts` sends SMTP email when configured.
- Required env vars:
  - `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`

## Local Dev

- Optional dev helper:
  - `PASSWORD_RESET_DEV_SHOW_LINK=true`
- When enabled (non-production only), forgot-password response includes reset URL for local testing.
