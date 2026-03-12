# Password Reset Changelog

## 2026-03-12

- Added forgot-password and reset-password pages.
- Added password reset server actions with generic anti-enumeration responses.
- Added one-time password reset token persistence with expiry and consumption tracking.
- Added SMTP password reset email sender.
- Added schema/model migration for `PasswordResetToken`.
- Added tests for password reset actions and validation schemas.
