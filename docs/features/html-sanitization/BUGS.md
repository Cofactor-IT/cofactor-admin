# Bugs (CA-26)

## 2026-03-12

### No rich-text storage path yet

- Root cause: current Admin MVP only persists a small number of plain-text fields through server
  actions.
- Impact: `sanitizeHtml()` is established and tested, but not yet used by a live rich-text write
  action.
- Current decision: acceptable for this ticket because the utility contract is now in place and the
  existing write surface already uses `sanitizePlainText()`.
