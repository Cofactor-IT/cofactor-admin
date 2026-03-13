# Dashboard (CA-38)

## Purpose

Give analysts an immediate at-a-glance landing page after sign-in.

## What It Shows

- Contextual greeting driven by the highest-priority live signal
- Active Submissions
- Deals in Progress
- Active Scouts
- Scout Applications
- Submission Queue preview
- Deal Pipeline preview
- Scout Profiles preview
- Recent Activity feed for submission and deal changes

## Layout Direction

- Dashboard uses a card-board layout, not a simple vertical report
- Submission Queue is the primary large card
- Deal Pipeline and Scout Profiles sit as secondary cards beneath it
- Recent Activity sits in its own side card for persistent scanning
- Cards use layered dark surfaces with soft white-opacity borders instead of hard dividers
- Important stats use restrained teal glow to feel active without becoming noisy
- Hover interactions are short and subtle: brighter borders, slight lift, shallow slide on rows

## Data Sources

- Scout read-only database:
  - active submissions
  - active scouts
  - pending scout applications
  - stale review detection
  - new submissions since the user's previous visit

## Navigation Intent

- `Active Scouts` links to `/scouts?tab=profiles`
- `Scout Applications` links to `/scouts?tab=applications`
- Scout profile previews also land on `/scouts?tab=profiles`
- Admin database:
  - deals in progress
  - audit-log-based recent activity
  - overdue next-step detection from CRM interactions
  - persisted `lastVisitAt` timestamp on Admin users

## Empty States

- Stat cards render `0` when no records exist yet
- Preview cards show explicit empty-state guidance when there is nothing to review yet
- Scout-backed preview cards explain when the Scout read-only connection is not configured
- Activity feed explains that updates will appear once Admin actions are recorded

## Greeting Priority

The dashboard greeting surfaces one signal only, in this order:

1. Overdue CRM next steps
2. Stale Scout submissions in review for 48+ hours
3. New Scout submissions since the previous dashboard visit
4. Queue count waiting for review
5. All clear
