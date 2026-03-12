/**
 * config.test.ts
 *
 * Tests for NextAuth session and cookie configuration defaults.
 */

import { describe, expect, it } from "vitest"
import { authConfig } from "./config"

describe("authConfig session management", () => {
  it("uses jwt strategy with seven-day max age and daily update age", () => {
    expect(authConfig.session?.strategy).toBe("jwt")
    expect(authConfig.session?.maxAge).toBe(7 * 24 * 60 * 60)
    expect(authConfig.session?.updateAge).toBe(24 * 60 * 60)
  })

  it("stores session token in an httpOnly lax cookie at root path", () => {
    const sessionTokenCookie = authConfig.cookies?.sessionToken
    expect(sessionTokenCookie?.options.httpOnly).toBe(true)
    expect(sessionTokenCookie?.options.sameSite).toBe("lax")
    expect(sessionTokenCookie?.options.path).toBe("/")
    expect(sessionTokenCookie?.options.secure).toBe(process.env.NODE_ENV === "production")
  })
})
