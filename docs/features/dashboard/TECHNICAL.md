# Dashboard - Technical Notes (CA-38)

## Route

- `app/dashboard/page.tsx`

The dashboard is the first protected page after sign-in and is forced dynamic so counts refresh on page load.

## Data Query Layer

- `lib/database/queries/dashboard.ts`

Exports:

- `findDashboardStats()`
- `findRecentDashboardActivity()`

### Stats

- Active Submissions:
  - Scout `ResearchSubmission`
  - `isDraft = false`
  - status in `PENDING_RESEARCH`, `VALIDATING`, `PITCHED_MATCHMAKING`
- Deals in Progress:
  - Admin `Deal`
- Active Scouts:
  - Scout `User`
  - approved scout application or Scout role
- Submissions This Week:
  - Scout `ResearchSubmission`
  - non-draft submissions created/submitted since the start of the current week

### Recent Activity

- Uses Admin `AuditLog`
- limited to `resourceType` of `Submission` and `Deal`
- last 10 records, newest first
- enriches submission/deal records with Scout/Admin reference lookups so feed items have human-readable titles

## Components

- `components/dashboard/DashboardOverview.tsx`
- `components/dashboard/DashboardStatCard.tsx`
- `components/dashboard/DashboardActivityFeed.tsx`

All dashboard surfaces are card-based and use the shared `components/ui/Card.tsx` primitive.

## Known Limitation

Recent activity depends on Admin audit events already being written by the corresponding actions. If a workflow has not yet been instrumented with `AuditLog` writes, it will not appear in the dashboard feed.
