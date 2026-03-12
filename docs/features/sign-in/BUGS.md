# Sign In - Bugs

**Last Updated:** 2026-03-12

## Known Issues

- Rate limiter is in-memory and resets on server restart.

## Notes

- Replace in-memory limiter with Redis-backed storage when horizontal scaling begins.
