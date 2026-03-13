# Rate Limiting Infrastructure (CA-25)

## Purpose

This ticket establishes the shared in-memory rate limiting layer for the Admin MVP.

It protects the three sensitive entry points that can be abused quickly:

- credentials sign-in
- IT-only account creation
- password reset requests

## Current Scope

The limiter is intentionally in-memory for MVP.

That keeps the implementation simple for a small internal team, while preserving a clean upgrade
path to Redis later if Admin needs distributed enforcement across instances.

## Applied Policies

- Sign in: `5 attempts / 15 minutes`
- Sign up: `3 attempts / 15 minutes`
- Password reset: `3 attempts / 1 hour`

## Routing Pattern

The current pattern is:

- parse and validate request input first
- derive a stable rate-limit key from client IP plus normalized identity input
- reject over-limit attempts with a clear retry message
- only then touch the database
