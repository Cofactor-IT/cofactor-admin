# Technical Notes (CA-35)

## Shared Component

The base page layout shell is implemented in:

- `components/shared/AdminShell.tsx`

It provides:

- Fixed `240px` sidebar
- Main page wrapper with `ml-[240px]`
- Header with left-aligned title and right-aligned `pageActions`
- Content wrapper with `px-[32px] py-[24px]`

## Styling

Desktop shell styles live in:

- `app/globals.css`

Key decisions:

- `admin-root` uses `min-width: 1024px`
- Responsive sidebar collapse was removed
- The shell is explicitly desktop-first

## Current Usage

Pages already using the shell:

- `/`
- `/submissions`
- `/auth/signup`
