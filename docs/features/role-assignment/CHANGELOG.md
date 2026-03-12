# Changelog (CA-10)

## 2026-03-12

- Added role guard helpers in `lib/auth/permissions.ts`
- Enforced IT-only account creation in `actions/auth.actions.ts`
- Removed key-based account creation gate and deleted `lib/auth/accountCreationAccess.ts`
- Updated `/auth/signup` UI copy to reflect IT session-based creation flow
- Tightened middleware auth/role checks for `/auth/signup` and `/settings*`
- Added role permission unit tests
- Updated root `README.md` ticket coverage for CA-10
