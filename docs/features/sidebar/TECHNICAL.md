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
- top-right page-header identity instead of a sidebar identity block
- lower utility area for IT-only management and sign-out controls
- brighter inactive copy with explicit hover feedback
- footer separator above the utility section
- sign-out rendered as a first-class sidebar row with its own icon
- IT-only audit-log utility link

## Active Navigation Model

Primary routes in the shell:

- `/dashboard`
- `/submissions`
- `/scouts`
- `/crm`
- `/pipeline`
- `/templates`

`/scouts` is the single Scout domain entry in the sidebar. Applications and Profiles are handled as
tabs inside the page instead of separate sidebar items.

IT-only utility navigation remains available for:

- `/auth/signup`
- `/settings/audit-log`

These are not part of the primary sidebar list.
The visible utility label is shortened to `Team Members` to preserve single-line rhythm in the footer section.

## Supporting Routes

Placeholder pages were added so all sidebar links resolve immediately:

- `app/scouts/page.tsx`
- `app/crm/page.tsx`
- `app/pipeline/page.tsx`
- `app/templates/page.tsx`
- `app/settings/audit-log/page.tsx`

Root route now redirects to `/dashboard`.
