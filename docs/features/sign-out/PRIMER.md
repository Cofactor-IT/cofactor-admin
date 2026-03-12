# Sign Out Primer (CA-9)

## Goal

Provide a reliable sign-out flow that always destroys the current session and redirects to sign-in.

## User Behavior

1. User clicks **Sign out** in the sidebar.
2. App logs a sign-out audit event.
3. NextAuth clears session cookie and redirects to `/auth/signin`.

## Security Intent

- Sign-out is POST-driven via NextAuth `signOut()`.
- Protected route middleware blocks back-button access after sign-out.
- User/session identity is logged before session destruction.
