/**
 * auth.actions.test.ts
 *
 * Tests for signup server action behavior and security checks.
 */

import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("../lib/auth/password", () => ({
  hashPassword: vi.fn(),
}))

vi.mock("../lib/database/queries/users", () => ({
  findUserByEmail: vi.fn(),
  createUser: vi.fn(),
}))

vi.mock("../lib/database/queries/auditLogs", () => ({
  logAuditAction: vi.fn(),
}))

import { signUp } from "./auth.actions"
import { hashPassword } from "../lib/auth/password"
import { logAuditAction } from "../lib/database/queries/auditLogs"
import { createUser, findUserByEmail } from "../lib/database/queries/users"

function buildFormData(overrides: Partial<Record<string, string>> = {}) {
  const values = {
    creationKey: "it-creation-key",
    name: "Theis Admin",
    email: "theis@cofactor.world",
    password: "strong-password-123",
    role: "ANALYST",
    ...overrides,
  }

  const formData = new FormData()
  Object.entries(values).forEach(([key, value]) => formData.set(key, value))
  return formData
}

describe("signUp", () => {
  beforeEach(() => {
    process.env.ADMIN_ACCOUNT_CREATION_KEY = "it-creation-key"
    vi.clearAllMocks()
  })

  it("rejects non-cofactor domains before any DB query", async () => {
    const state = await signUp({ success: false }, buildFormData({ email: "outside@gmail.com" }))

    expect(state.success).toBe(false)
    expect(state.fieldErrors?.email?.[0]).toContain("@cofactor.world")
    expect(findUserByEmail).not.toHaveBeenCalled()
    expect(createUser).not.toHaveBeenCalled()
    expect(logAuditAction).not.toHaveBeenCalled()
    expect(hashPassword).not.toHaveBeenCalled()
  })

  it("rejects requests without valid IT operator key", async () => {
    const state = await signUp({ success: false }, buildFormData({ creationKey: "wrong-key" }))

    expect(state.success).toBe(false)
    expect(state.message).toContain("restricted to IT operators")
    expect(findUserByEmail).not.toHaveBeenCalled()
    expect(createUser).not.toHaveBeenCalled()
  })

  it("creates user and writes audit log for valid internal payload", async () => {
    vi.mocked(findUserByEmail).mockResolvedValue(null)
    vi.mocked(hashPassword).mockResolvedValue("hashed-password")
    vi.mocked(createUser).mockResolvedValue({
      id: "user_1",
      name: "Theis Admin",
      email: "theis@cofactor.world",
      role: "ANALYST",
      createdAt: new Date(),
    })

    const state = await signUp({ success: false }, buildFormData())

    expect(state.success).toBe(true)
    expect(findUserByEmail).toHaveBeenCalledWith("theis@cofactor.world")
    expect(createUser).toHaveBeenCalledWith({
      name: "Theis Admin",
      email: "theis@cofactor.world",
      passwordHash: "hashed-password",
      role: "ANALYST",
    })
    expect(logAuditAction).toHaveBeenCalledOnce()
  })
})
