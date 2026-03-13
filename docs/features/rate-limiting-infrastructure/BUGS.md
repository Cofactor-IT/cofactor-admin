# Bugs (CA-25)

## 2026-03-12

### No cross-instance enforcement in MVP

- Root cause: the current limiter stores counters in process memory.
- Impact: multiple app instances would not share the same rate-limit state.
- Current decision: accepted for MVP because Admin is still a small internal tool.
- Follow-up: migrate the same `RATE_LIMITS` contract to Redis when distributed enforcement matters.
