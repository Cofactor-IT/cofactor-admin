# Sign Out Technical (CA-9)

## Components

- `components/shared/SignOutButton.tsx`
- `components/shared/AdminShell.tsx`

## Server Action

- `actions/session.actions.ts`
  - `logSignOutAuditAction`
  - Calls `requireAuthSession()` then writes `USER_SIGN_OUT` audit record.

## Placement

- Sidebar footer in `AdminShell`.
- Visible on authenticated pages for all roles.

## Flow

1. `SignOutButton` calls `logSignOutAuditAction()`.
2. Client clears local UI state key (`cofactor-admin-ui-state`).
3. Calls `signOut({ callbackUrl: "/signin" })`.

## Back-Button Protection

- `proxy.ts` protects non-public routes.
- After sign-out, revisiting protected pages redirects to `/signin`.
