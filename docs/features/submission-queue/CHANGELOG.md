# Submission Queue Changelog

## 2026-04-13

- Replaced the `/submissions` placeholder with a live Scout submissions queue
- Added a dedicated Scout read-only query layer for newest-first submission rows
- Added queue pagination metadata and graceful empty-state handling
- Added client-side route refresh polling so new submissions appear without a full page reload
