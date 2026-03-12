/**
 * rate-limit.test.ts
 *
 * Tests for auth rate limiter behavior.
 */

import { describe, expect, it } from "vitest"
import { checkRateLimit } from "./rate-limit"

describe("checkRateLimit", () => {
  it("blocks after configured limit in the same window", () => {
    const key = `test:${Date.now()}`
    expect(checkRateLimit({ key, limit: 2, windowMs: 1000 }).allowed).toBe(true)
    expect(checkRateLimit({ key, limit: 2, windowMs: 1000 }).allowed).toBe(true)
    expect(checkRateLimit({ key, limit: 2, windowMs: 1000 }).allowed).toBe(false)
  })
})
