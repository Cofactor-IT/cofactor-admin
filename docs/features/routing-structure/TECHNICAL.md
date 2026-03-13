# Routing Structure - Technical Notes (CA-37)

## Canonical Route Map

- `/dashboard` -> authenticated dashboard landing page
- `/signin` -> public credentials sign-in page
- `/submissions` -> protected submissions workspace
- `/scouts` -> protected tabbed Scouts workspace (`?tab=applications|profiles`)
- `/crm` -> protected CRM workspace shell
- `/pipeline` -> protected deal pipeline workspace shell
- `/templates` -> protected email templates workspace shell

## Compatibility Redirects

`proxy.ts` redirects legacy paths to the canonical route contract:

- `/auth/signin` -> `/signin`
- `/scout-profiles` -> `/scouts`
- `/deal-pipeline` -> `/pipeline`
- `/email-templates` -> `/templates`

## Auth Routing Rules

- Unauthenticated requests to protected routes are redirected to `/signin?callbackUrl=<path>`.
- Authenticated requests to `/signin` are redirected to `/dashboard`.
- IT-only routes continue to be enforced in `proxy.ts`.
- Existing password-reset routes remain public auth exceptions so CA-11 continues to function.

## Files

- `proxy.ts`
- `app/page.tsx`
- `app/dashboard/page.tsx`
- `app/signin/page.tsx`
- `app/submissions/page.tsx`
- `app/scouts/page.tsx`
- `app/crm/page.tsx`
- `app/pipeline/page.tsx`
- `app/templates/page.tsx`
- `components/shared/AdminShell.tsx`
- `lib/auth/config.ts`
- `lib/auth/session.ts`
