# Password Reset Bugs

## Known Risks

- If SMTP is not configured, production users will not receive reset email.
  - Mitigation: enforce SMTP environment variables in deployment setup.

## Validation

- Generic success message is intentionally returned for unknown/inactive accounts.
  - This is expected behavior to prevent account enumeration.
