# Submission Queue Bugs

## Known Issues

- No known bugs specific to the submissions queue at this time.

## Resolved

### 2026-04-13 Local Admin/Scout DB mismatch

- Root cause: local Admin was pointed at the optional Admin-managed Scout mirror on `localhost:55435`
  while the real local Scout app wrote submissions to `localhost:5434/cofactor_db`.
- Effect: the queue rendered correctly but read a different database, so newly submitted local Scout
  records did not appear in Admin.
- Fix: repointed local Admin Scout DB URLs to the real Scout local database, documented the shared
  local pairing, and updated the local setup script so role/grant bootstrap can target the real
  Scout DB without forcing an Admin-side schema push.
