# Changelog (CA-26)

## 2026-03-12

- Added server-side sanitization helpers for HTML, plain text, filenames, and slugs
- Added sanitization test coverage for each helper
- Applied plain-text sanitization to Admin account creation before persistence
- Added a regression test proving sign-up strips markup from stored names
