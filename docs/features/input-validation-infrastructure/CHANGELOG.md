# Input Validation Infrastructure Changelog (CA-23)

## 2026-03-12

- added reusable base Zod schemas for email, internal email, password, name, id, and pagination
- refactored auth schemas to build on the shared primitives
- added reusable field-error flattening for server action responses
- updated auth flows and tests to use the shared validation contract
