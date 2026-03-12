/**
 * auth.schemas.test.ts
 *
 * Tests for auth validation schemas.
 */

import { describe, expect, it } from "vitest"
import { forgotPasswordSchema, resetPasswordSchema, signInSchema, signUpSchema } from "./auth.schemas"

describe("signUpSchema", () => {
  it("accepts @cofactor.world emails", () => {
    const result = signUpSchema.safeParse({
      name: "Ahmed Aizi",
      email: "ahmed@cofactor.world",
      password: "very-strong-password",
      role: "ANALYST",
    })

    expect(result.success).toBe(true)
  })

  it("rejects non-cofactor domains", () => {
    const result = signUpSchema.safeParse({
      name: "External User",
      email: "user@gmail.com",
      password: "very-strong-password",
      role: "IT",
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.email?.[0]).toContain("@cofactor.world")
    }
  })
})

describe("signInSchema", () => {
  it("rejects non-cofactor sign-in domains", () => {
    const result = signInSchema.safeParse({
      email: "someone@example.com",
      password: "password",
    })

    expect(result.success).toBe(false)
  })
})

describe("forgotPasswordSchema", () => {
  it("accepts valid cofactor email", () => {
    const result = forgotPasswordSchema.safeParse({
      email: "ops@cofactor.world",
    })

    expect(result.success).toBe(true)
  })
})

describe("resetPasswordSchema", () => {
  it("requires token and strong password", () => {
    const result = resetPasswordSchema.safeParse({
      token: "short-token",
      password: "weak",
    })

    expect(result.success).toBe(false)
  })
})
