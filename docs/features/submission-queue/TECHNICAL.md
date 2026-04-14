# Submission Queue - Technical Notes

## Route

- `app/submissions/page.tsx`

The submissions route is now a protected, force-dynamic Admin page that loads its initial queue state on the server through the Scout read-only connection.

## Data Query Layer

- `lib/database/queries/submissions.ts`

Exports:

- `findScoutSubmissionQueue()`
- `setSubmissionQueueQueryOverridesForTesting()`

Query behavior:

- Reads from `scoutDb` only
- Filters to submitted records with `isDraft = false`
- Sorts by `submittedAt DESC`, then `createdAt DESC`
- Selects only the fields needed for the queue UI
- Returns pagination metadata with a fixed page size of `50`
- Falls back to a non-crashing empty state when `SCOUT_DB_READONLY_URL` is not configured

Queue row fields are assembled from Scout `ResearchSubmission` plus the related Scout `User`:

- submission title -> `researchTopic`
- scout name -> `user.fullName`
- research area -> `user.researchAreas`
- university -> `user.university`
- date submitted -> `submittedAt` with `createdAt` fallback
- current status -> `status`

## UI

- `components/submissions/SubmissionQueue.tsx`

The UI is a client component so it can keep the server-rendered route fresh with `router.refresh()` polling every 30 seconds. This updates the queue without a full page reload and preserves the App Router shell.

The queue uses the shared Admin card surface and the existing dashboard empty-state pattern. Status pills reuse the shared badge tokens from `app/globals.css`.

## Testing

- `lib/database/queries/submissions.test.ts`

Coverage includes:

- queue row mapping and pagination metadata
- Scout connection unavailable fallback behavior
