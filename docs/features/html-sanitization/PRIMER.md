# HTML Sanitization (CA-26)

## Purpose

This ticket establishes the server-side sanitization contract for any user-generated content that
will later be stored and rendered by Admin.

It covers four categories:

- rich HTML
- plain text
- filenames
- slugs

## Why It Exists Now

Admin does not yet have a large amount of rich-text content, but it will soon:

- notes
- email templates
- CRM interactions
- future content-heavy admin flows

The correct move is to establish the sanitization layer now and start using it on the write paths
that already exist.

## Current Integration

The first live storage integration is account creation:

- `signUp` sanitizes `name` server-side before persistence

That makes the pattern explicit for future write actions instead of leaving sanitization as an
afterthought.
