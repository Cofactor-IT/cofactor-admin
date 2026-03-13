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

Additional greeting-specific modules:

- `lib/database/queries/greeting.ts`
- `lib/utils/greeting.ts`
- `lib/database/queries/users.ts` (`lastVisitAt` read/write helpers)

### Stats

- Active Submissions:
  - Scout `ResearchSubmission`
  - `isDraft = false`
  - status in `PENDING_RESEARCH`, `VALIDATING`, `PITCHED_MATCHMAKING`
- Deals in Progress:
  - Admin `Deal`
- Active Scouts:
  - Scout `User`
  - `scoutApplicationStatus = APPROVED`
- Scout Applications:
  - Scout `User`
  - `scoutApplicationStatus = PENDING`

`Submissions This Week` is no longer a top-level stat card. It remains an internal supporting metric used for trend copy on other cards.

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

Scout-related dashboard links now target the tabbed Scouts route:

- profile-oriented cards -> `/scouts?tab=profiles`
- application-oriented cards -> `/scouts?tab=applications`

If `SCOUT_DB_READONLY_URL` is not configured, Scout-backed preview cards stay visible but render empty with a clear fallback message instead of crashing the dashboard.

## Components

- `components/dashboard/DashboardOverview.tsx`
- `components/dashboard/DashboardPreviewSection.tsx`
- `components/dashboard/DashboardStatCard.tsx`
- `components/dashboard/DashboardActivityFeed.tsx`

`DashboardOverview` now receives a precomputed greeting string from the page route. The greeting is assembled server-side so it reflects live data on every page load.

## Greeting Signal

Greeting priority order:

1. Overdue CRM next steps owned by the signed-in user
2. Scout submissions stuck in review for more than 48 hours
3. New Scout submissions since the user's previous dashboard visit
4. Current Scout queue waiting for review
5. All-clear fallback

`lastVisitAt` is stored on the Admin `User` model and updated after the dashboard greeting is computed, so "since your last visit" always uses the previous visit timestamp rather than the current request time.

All dashboard surfaces are card-based and use the shared `components/ui/Card.tsx` primitive.
The layout is intentionally board-like: stat cards first, then a two-column card region with a primary submission card, secondary deal/scout cards, and a dedicated activity card.
Dashboard-specific polish is implemented in `app/globals.css` and includes:

- scoped load-in animation on the dashboard shell
- soft white-opacity borders for dashboard card surfaces
- layered navy gradients for stat and module cards
- restrained teal glow on primary stat values and inline links
- compact empty-state blocks with a single recovery action

## Sign-In Context Surface

The public sign-in screen now uses the same Admin brand language as the dashboard:

- centered branded wordmark above the auth card
- low-opacity grid texture in the page background
- restrained teal glow behind the form stage
- existing teal input focus treatment via `.admin-input:focus`

## Known Limitation

Recent activity depends on Admin audit events already being written by the corresponding actions. If a workflow has not yet been instrumented with `AuditLog` writes, it will not appear in the dashboard feed.
