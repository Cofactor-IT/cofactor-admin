# Submission Queue Primer

## Goal

Give internal Admin users a single live queue for incoming Scout submissions so analysts do not depend on manual handoff.

## User Value

- Analysts can review newly submitted Scout leads in one place.
- Queue rows surface the scout, research context, and submission status immediately.
- The workspace stays current without requiring a full browser reload.

## Scope

- Protected `/submissions` workspace
- Read-only Scout DB query layer
- Newest-first ordering
- Graceful empty state
- Client-side live refresh for fresh queue data
