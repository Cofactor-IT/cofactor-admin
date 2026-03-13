# Audit Logging

## Purpose

`CA-27` establishes a single audit logging path for consequential Admin actions.

The goal is straightforward:

- write audit events through one helper
- keep failures in the audit path from blocking the main action
- expose a read-only IT review surface inside Admin

## What Is Logged

Current centralized coverage includes:

- successful sign in
- failed sign in
- sign out
- account creation
- password reset request
- password reset completion

Each event records the same core shape:

- actor identity when available
- action name
- resource type and id
- request context
- success or failure state

## Operator Surface

IT users can review recent audit entries at `/settings/audit-log`.

This page is read only and lives under the existing Admin shell so it inherits the same route
protection and layout patterns as the rest of the app.

## Next Step

Later feature work should reuse `lib/security/audit-log.ts` instead of writing directly to the
database query helper.
