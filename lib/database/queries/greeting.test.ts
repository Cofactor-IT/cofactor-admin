/**
 * greeting.test.ts
 *
 * Tests for dashboard greeting query metrics and Scout fallback behavior.
 */

import { beforeEach, describe, expect, it, vi } from "vitest"
import { findGreetingSignalMetrics, setGreetingQueryOverridesForTesting } from "./greeting"
import { findLastVisitAt } from "./users"

vi.mock("./users", () => ({
  findLastVisitAt: vi.fn(),
}))

const fakeAdminDb = {
  interaction: {
    count: vi.fn(),
  },
}

const fakeScoutDb = {
  researchSubmission: {
    count: vi.fn(),
  },
}

describe("greeting queries", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.setSystemTime(new Date("2026-03-12T16:00:00.000Z"))
    setGreetingQueryOverridesForTesting({
      adminDb: fakeAdminDb,
      scoutDb: fakeScoutDb,
    })
  })

  it("loads all greeting signal metrics using the user's previous visit", async () => {
    vi.mocked(findLastVisitAt).mockResolvedValue(new Date("2026-03-11T16:00:00.000Z"))
    fakeAdminDb.interaction.count.mockResolvedValue(2)
    fakeScoutDb.researchSubmission.count
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(4)
      .mockResolvedValueOnce(7)

    const metrics = await findGreetingSignalMetrics("user_1")

    expect(metrics).toEqual({
      overdueNextSteps: 2,
      staleSubmissions: 1,
      newSubmissionsSinceLastVisit: 4,
      queuedSubmissions: 7,
    })
    expect(fakeAdminDb.interaction.count).toHaveBeenCalledWith({
      where: {
        userId: "user_1",
        nextStepDue: { lt: new Date("2026-03-12T16:00:00.000Z") },
      },
    })
    expect(fakeScoutDb.researchSubmission.count).toHaveBeenNthCalledWith(2, {
      where: {
        isDraft: false,
        createdAt: { gt: new Date("2026-03-11T16:00:00.000Z") },
      },
    })
  })

  it("defaults Scout-backed metrics to zero when Scout is unavailable", async () => {
    const scoutDbUrl = process.env.SCOUT_DB_READONLY_URL
    delete process.env.SCOUT_DB_READONLY_URL
    setGreetingQueryOverridesForTesting({
      adminDb: fakeAdminDb,
    })
    vi.mocked(findLastVisitAt).mockResolvedValue(null)
    fakeAdminDb.interaction.count.mockResolvedValue(3)

    try {
      await expect(findGreetingSignalMetrics("user_2")).resolves.toEqual({
        overdueNextSteps: 3,
        staleSubmissions: 0,
        newSubmissionsSinceLastVisit: 0,
        queuedSubmissions: 0,
      })
    } finally {
      if (scoutDbUrl) process.env.SCOUT_DB_READONLY_URL = scoutDbUrl
    }
  })
})
