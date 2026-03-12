/**
 * session.actions.test.ts
 *
 * Tests for session lifecycle server actions.
 */

import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("../lib/auth/session", () => ({
  requireAuthSession: vi.fn(),
}))

vi.mock("../lib/database/queries/auditLogs", () => ({
  logAuditAction: vi.fn(),
}))

import { requireAuthSession } from "../lib/auth/session"
import { logAuditAction } from "../lib/database/queries/auditLogs"
import { logSignOutAuditAction } from "./session.actions"

describe("logSignOutAuditAction", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("writes USER_SIGN_OUT audit record with active user id", async () => {
    vi.mocked(requireAuthSession).mockResolvedValue({
      user: { id: "user_1" },
    } as Awaited<ReturnType<typeof requireAuthSession>>)

    await logSignOutAuditAction()

    expect(logAuditAction).toHaveBeenCalledWith({
      action: "USER_SIGN_OUT",
      resourceType: "Session",
      resourceId: "user_1",
      userId: "user_1",
    })
  })
})
