# Dashboard Changelog (CA-38)

## 2026-03-12

- Replaced the dashboard placeholder with live stat cards and recent activity
- Added dashboard query layer spanning Admin DB and Scout read-only DB
- Added card-based dashboard components for stat cards, module previews, and activity feed
- Added graceful empty states for counts and recent activity
- Added linked preview panels so the dashboard surfaces real submission, deal, and scout rows instead of counts only
- Reworked the dashboard into a denser card board instead of a simple top-down stack
- Added dashboard-specific polish: layered surfaces, softer borders, better empty states, and subtle motion
- Added server-side dashboard greeting logic with priority-based operational signals
- Added persisted `lastVisitAt` tracking so "since your last visit" uses real prior-visit data
- Added branded sign-in background treatment with grid texture, glow, and centered wordmark
- Replaced the duplicate scout summary stat with pending Scout applications from Scout user application status
- Restored the top-row dashboard mix to active submissions, deals in progress, active scouts, and scout applications
- Tightened queue-row presentation so long submission titles truncate cleanly and metadata stays on one line
- Standardized stat-card secondary copy toward a more neutral operational tone
