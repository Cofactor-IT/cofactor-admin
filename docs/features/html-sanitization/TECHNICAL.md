# HTML Sanitization - Technical Notes (CA-26)

## Files

- `lib/security/sanitization.ts`
- `lib/security/sanitization.test.ts`
- `actions/auth.actions.ts`
- `actions/auth.actions.test.ts`

## Utility Contract

`lib/security/sanitization.ts` now exports:

- `sanitizeHtml()`
- `sanitizePlainText()`
- `sanitizeFilename()`
- `sanitizeSlug()`

### `sanitizeHtml()`

Uses `isomorphic-dompurify` with a limited safe tag set for future rich-text content.

Allowed tags include:

- paragraphs and headings
- emphasis tags
- lists
- links
- blockquote
- code/pre

### `sanitizePlainText()`

Strips all markup and normalizes whitespace. This is the correct helper for:

- names
- titles
- short notes stored as plain text

### `sanitizeFilename()`

Restricts filenames to a safe ASCII subset and removes traversal-style patterns.

### `sanitizeSlug()`

Normalizes freeform text into a URL-safe slug contract.

## Current App Usage

The current live write surface using this utility is:

- `actions/auth.actions.ts`

`createValidatedUser()` now sanitizes the persisted account name before it reaches the database
query layer.

## Follow-On Usage

As the CRM, notes, and email template write actions are added, they should use:

- `sanitizePlainText()` for plain text fields
- `sanitizeHtml()` only when rich markup is intentionally allowed
