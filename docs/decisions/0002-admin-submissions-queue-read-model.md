# ADR 0002: Read Scout Submissions Through a Read-Only Queue Model

## Status

Accepted

## Date

2026-04-13

## Context

Admin analysts need a single workspace for incoming Scout submissions without relying on manual handoff.

The data already exists in the Scout application database, but Admin must not own Scout submission writes.
The queue also needs to stay fresh during review sessions without forcing a full browser reload.

Without an explicit boundary, this feature could drift into:

- direct write-capable access from Admin to Scout submission records
- duplicate ingestion or sync jobs for data that already exists in Scout
- custom API polling layers for a server-rendered page that only needs read access

## Decision

The Admin submissions workspace will:

1. read Scout submissions through the existing read-only `scoutDb` connection
2. shape queue rows inside `lib/database/queries/submissions.ts`
3. render the queue from the server route at `app/submissions/page.tsx`
4. keep the route fresh with client-side `router.refresh()` polling every 30 seconds

The Admin app does not create, update, or synchronize Scout submissions for this workspace.
It only reads the submitted records needed for analyst review.

## Consequences

### Positive

- the queue stays aligned with Scout as the source of truth
- Admin keeps a strict read-only boundary for Scout submission data
- the implementation fits the existing server page -> query function pattern
- fresh queue data appears without introducing a separate API or websocket stack

### Tradeoffs

- queue freshness is interval-based rather than push-based
- the route depends on Scout read-only database connectivity to render current data
- pagination and display shaping must stay conservative because the data source is remote to Admin

## Current Application

- `app/submissions/page.tsx`
- `components/submissions/SubmissionQueue.tsx`
- `lib/database/queries/submissions.ts`

These files implement the read-only queue model and the timed route refresh behavior for the Admin submissions workspace.
