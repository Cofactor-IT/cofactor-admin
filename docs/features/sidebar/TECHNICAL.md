# Technical Notes (CA-36)

## Shared Sidebar Implementation

Sidebar implementation lives in:

- `components/shared/AdminShell.tsx`

It now includes:

- fixed `240px` width
- `#1B2A4A` surface background via `--admin-surface`
- right border via `--admin-border`
- top `64px` brand row
- nav items with inline SVG icons and labels
- bottom `64px` user identity bar

## Active Navigation Model

Primary routes in the shell:

- `/submissions`
- `/scouts`
- `/crm`
- `/pipeline`
- `/templates`

IT-only utility navigation remains available for `/auth/signup`, but it is not part of the primary sidebar list.

## Supporting Routes

Placeholder pages were added so all sidebar links resolve immediately:

- `app/scouts/page.tsx`
- `app/crm/page.tsx`
- `app/pipeline/page.tsx`
- `app/templates/page.tsx`

Root route now redirects to `/dashboard`.
