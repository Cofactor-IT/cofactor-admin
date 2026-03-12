# Password Reset Primer

## Goal

Allow team members to recover access securely when they forget passwords.

## User Flow

1. User opens `/auth/forgot-password`.
2. User submits `@cofactor.world` email.
3. System returns a generic success message to prevent account enumeration.
4. User receives reset link with a one-time token.
5. User opens `/auth/reset-password?token=...` and sets a new password.

## Security Guarantees

- Token is stored hashed (`SHA-256`) in DB, never as plaintext.
- Tokens expire (default: 60 minutes).
- Tokens are single-use (`usedAt` set on successful reset).
- Password reset also clears login lockout counters.
