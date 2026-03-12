# Sign Out Bugs (CA-9)

## Known Risks

- If audit log write fails, sign-out still proceeds to avoid trapping users in session.
- Browser back-button may briefly show cached paint before middleware redirect completes.
