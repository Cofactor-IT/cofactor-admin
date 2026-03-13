# Dashboard - Technical Notes (CA-38)

## Route

- `app/dashboard/page.tsx`

The dashboard is the first protected page after sign-in and is forced dynamic so counts refresh on page load.

## Data Query Layer

- `lib/database/queries/dashboard.ts`

Exports:

- `findDashboardStats()`
- `findDashboardPreviewSections()`
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

### Module Previews

- Submission Queue:
  - Scout `ResearchSubmission`
  - latest active non-draft submissions
- Deal Pipeline:
  - Admin `Deal`
  - latest updated deals, enriched with Scout submission titles when available
- Scout Profiles:
  - Scout `User`
  - latest approved Scout accounts

If `SCOUT_DB_READONLY_URL` is not configured, Scout-backed preview cards stay visible but render empty with a clear fallback message instead of crashing the dashboard.

## Components

- `components/dashboard/DashboardOverview.tsx`
- `components/dashboard/DashboardPreviewSection.tsx`
- `components/dashboard/DashboardStatCard.tsx`
- `components/dashboard/DashboardActivityFeed.tsx`

All dashboard surfaces are card-based and use the shared `components/ui/Card.tsx` primitive.
The layout is intentionally board-like: stat cards first, then a two-column card region with a primary submission card, secondary deal/scout cards, and a dedicated activity card.
Dashboard-specific polish is implemented in `app/globals.css` and includes:

- scoped load-in animation on the dashboard shell
- soft white-opacity borders for dashboard card surfaces
- layered navy gradients for stat and module cards
- restrained teal glow on primary stat values and inline links
- compact empty-state blocks with a single recovery action

## Known Limitation

Recent activity depends on Admin audit events already being written by the corresponding actions. If a workflow has not yet been instrumented with `AuditLog` writes, it will not appear in the dashboard feed.
