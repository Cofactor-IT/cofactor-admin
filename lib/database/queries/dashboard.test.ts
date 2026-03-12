/**
 * dashboard.test.ts
 *
 * Tests for dashboard query orchestration and activity mapping.
 */

import { beforeEach, describe, expect, it, vi } from "vitest"
import {
  findDashboardStats,
  findRecentDashboardActivity,
  setDashboardQueryOverridesForTesting,
} from "./dashboard"

const fakeAdminDb = {
  deal: {
    count: vi.fn<() => Promise<number>>(),
    findMany: vi.fn<(args: unknown) => Promise<Array<{ id: string; scoutSubmissionId: string; stage: "QUALIFY" }>>>(),
  },
  auditLog: {
    findMany: vi.fn<
      (args: unknown) => Promise<
        Array<{
          id: string
          action: string
          resourceType: string
          resourceId: string
          createdAt: Date
          user: { name: string; email: string } | null
        }>
      >
    >(),
  },
}

const fakeScoutDb = {
  researchSubmission: {
    count: vi.fn<(args: unknown) => Promise<number>>(),
    findMany: vi.fn<
      (args: unknown) => Promise<Array<{ id: string; researchTopic: string | null; researcherName: string | null }>>
    >(),
  },
  user: {
    count: vi.fn<(args: unknown) => Promise<number>>(),
  },
}

describe("dashboard queries", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setDashboardQueryOverridesForTesting({
      adminDb: fakeAdminDb,
      scoutDb: fakeScoutDb,
    })
  })

  it("returns four dashboard stat cards with module links", async () => {
    fakeScoutDb.researchSubmission.count.mockResolvedValueOnce(14).mockResolvedValueOnce(3)
    fakeAdminDb.deal.count.mockResolvedValue(6)
    fakeScoutDb.user.count.mockResolvedValue(8)

    const stats = await findDashboardStats()

    expect(stats).toEqual([
      expect.objectContaining({ title: "Active Submissions", count: 14, href: "/submissions" }),
      expect.objectContaining({ title: "Deals in Progress", count: 6, href: "/pipeline" }),
      expect.objectContaining({ title: "Active Scouts", count: 8, href: "/scouts" }),
      expect.objectContaining({ title: "Submissions This Week", count: 3, href: "/submissions" }),
    ])
  })

  it("returns an empty activity list when no logs exist", async () => {
    fakeAdminDb.auditLog.findMany.mockResolvedValue([])

    await expect(findRecentDashboardActivity()).resolves.toEqual([])
  })

  it("maps submission and deal audit records into dashboard activity items", async () => {
    fakeAdminDb.auditLog.findMany.mockResolvedValue([
      {
        id: "log_submission",
        action: "SUBMISSION_STATUS_UPDATED",
        resourceType: "Submission",
        resourceId: "submission_1",
        createdAt: new Date("2026-03-12T10:30:00.000Z"),
        user: { name: "Ahmed Aizi", email: "ahmed@cofactor.world" },
      },
      {
        id: "log_deal",
        action: "DEAL_STAGE_UPDATED",
        resourceType: "Deal",
        resourceId: "deal_1",
        createdAt: new Date("2026-03-12T09:00:00.000Z"),
        user: { name: "NF Emmanuel", email: "nf@cofactor.world" },
      },
    ])
    fakeAdminDb.deal.findMany.mockResolvedValue([
      { id: "deal_1", scoutSubmissionId: "submission_2", stage: "QUALIFY" },
    ])
    fakeScoutDb.researchSubmission.findMany.mockResolvedValue([
      { id: "submission_1", researchTopic: "Quantum Error Correction", researcherName: "Dr. Chen" },
      { id: "submission_2", researchTopic: "Fusion Materials", researcherName: "Dr. Patel" },
    ])

    const activity = await findRecentDashboardActivity()

    expect(activity).toEqual([
      expect.objectContaining({
        id: "log_submission",
        href: "/submissions",
        title: "Quantum Error Correction",
        description: "Submission Status Updated",
        changedBy: "Ahmed Aizi",
      }),
      expect.objectContaining({
        id: "log_deal",
        href: "/pipeline",
        title: "Fusion Materials",
        description: "Deal Stage Updated",
        changedBy: "NF Emmanuel",
      }),
    ])
  })
})
