# Input Validation Infrastructure (CA-23)

## Purpose

Establish one reusable Zod validation layer for Admin so server actions validate runtime input
consistently before any database call.

## What This Adds

- shared base validation primitives
- shared auth-facing schemas built on those primitives
- typed schema exports for downstream actions
- common field-error flattening for form responses

## What It Changes

- sign-up, sign-in, forgot-password, and reset-password now share the same email and password rules
- password helper copy in auth forms now reflects the stronger shared password requirements
- future security tickets can build on one validation contract instead of duplicating schema logic
