# Routing Structure (CA-37)

## Purpose

Establish the stable Phase 1 route map before each workspace is implemented.

## Canonical Routes

- `/dashboard`
- `/signin`
- `/submissions`
- `/scouts`
- `/crm`
- `/pipeline`
- `/templates`

## Behavior

- `/dashboard` is the default authenticated landing route.
- `/signin` is the canonical sign-in entry point.
- Dashboard and Scouts are now live structured surfaces rather than placeholders.
- Remaining Phase 1 module routes can still render protected placeholder content until their epics ship.
- Legacy route names redirect to the canonical paths so earlier links do not break.
