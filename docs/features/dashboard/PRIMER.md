# Dashboard (CA-38)

## Purpose

Give analysts an immediate at-a-glance landing page after sign-in.

## What It Shows

- Active Submissions
- Deals in Progress
- Active Scouts
- Submissions This Week
- Submission Queue preview
- Deal Pipeline preview
- Scout Profiles preview
- Recent Activity feed for submission and deal changes

## Data Sources

- Scout read-only database:
  - active submissions
  - active scouts
  - submissions this week
- Admin database:
  - deals in progress
  - audit-log-based recent activity

## Empty States

- Stat cards render `0` when no records exist yet
- Preview cards show explicit empty-state guidance when there is nothing to review yet
- Scout-backed preview cards explain when the Scout read-only connection is not configured
- Activity feed explains that updates will appear once Admin actions are recorded
