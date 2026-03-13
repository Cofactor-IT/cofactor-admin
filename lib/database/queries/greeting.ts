/**
 * greeting.ts
 *
 * Query functions that gather the minimum Admin and Scout data required to
 * build the dashboard greeting signal.
 */

import { SubmissionStatus } from "@prisma/scout-client"
import { findLastVisitAt } from "./users"

interface GreetingAdminDb {
  interaction: {
    count(args: unknown): Promise<number>
  }
}

interface GreetingScoutDb {
  researchSubmission: {
    count(args: unknown): Promise<number>
  }
}

export interface GreetingSignalMetrics {
  overdueNextSteps: number
  staleSubmissions: number
  newSubmissionsSinceLastVisit: number
  queuedSubmissions: number
}

const GREETING_DEFAULT_LOOKBACK_HOURS = 24
const STALE_SUBMISSION_WINDOW_HOURS = 48

let greetingQueryOverrides:
  | {
      adminDb?: GreetingAdminDb
      scoutDb?: GreetingScoutDb
    }
  | null = null

function isMissingScoutDbConfigurationError(error: unknown): boolean {
  return error instanceof Error && error.message === "SCOUT_DB_READONLY_URL is not set"
}

function staleSubmissionThreshold(now: Date): Date {
  return new Date(now.getTime() - STALE_SUBMISSION_WINDOW_HOURS * 60 * 60 * 1000)
}

function defaultLastVisit(now: Date): Date {
  return new Date(now.getTime() - GREETING_DEFAULT_LOOKBACK_HOURS * 60 * 60 * 1000)
}

async function adminDatabase(): Promise<GreetingAdminDb> {
  if (greetingQueryOverrides?.adminDb) return greetingQueryOverrides.adminDb
  const { adminDb } = await import("../adminDb")
  return adminDb as unknown as GreetingAdminDb
}

async function scoutDatabase(): Promise<GreetingScoutDb> {
  if (greetingQueryOverrides?.scoutDb) return greetingQueryOverrides.scoutDb
  const { scoutDb } = await import("../scoutDb")
  return scoutDb as unknown as GreetingScoutDb
}

async function safeScoutCount(loadCount: () => Promise<number>): Promise<number> {
  try {
    return await loadCount()
  } catch (error) {
    if (isMissingScoutDbConfigurationError(error)) return 0
    throw error
  }
}

async function countOverdueNextSteps(userId: string, now: Date): Promise<number> {
  const adminDb = await adminDatabase()
  return adminDb.interaction.count({
    where: {
      userId,
      nextStepDue: { lt: now },
    },
  })
}

async function countStaleSubmissions(now: Date): Promise<number> {
  return safeScoutCount(async () => {
    const scoutDb = await scoutDatabase()
    return scoutDb.researchSubmission.count({
      where: {
        isDraft: false,
        status: { in: [SubmissionStatus.PENDING_RESEARCH, SubmissionStatus.VALIDATING] },
        updatedAt: { lt: staleSubmissionThreshold(now) },
      },
    })
  })
}

async function countNewSubmissionsSince(date: Date): Promise<number> {
  return safeScoutCount(async () => {
    const scoutDb = await scoutDatabase()
    return scoutDb.researchSubmission.count({
      where: {
        isDraft: false,
        createdAt: { gt: date },
      },
    })
  })
}

async function countQueuedSubmissions(): Promise<number> {
  return safeScoutCount(async () => {
    const scoutDb = await scoutDatabase()
    return scoutDb.researchSubmission.count({
      where: {
        isDraft: false,
        status: SubmissionStatus.PENDING_RESEARCH,
      },
    })
  })
}

/**
 * Overrides greeting query delegates for test execution.
 *
 * @param overrides - Fake Admin and Scout delegates, or null to reset
 * @returns Nothing
 */
export function setGreetingQueryOverridesForTesting(
  overrides: {
    adminDb?: GreetingAdminDb
    scoutDb?: GreetingScoutDb
  } | null,
) {
  greetingQueryOverrides = overrides
}

/**
 * Loads the real-time counts used to decide the dashboard greeting signal.
 *
 * @param userId - Signed-in Admin user
 * @returns Priority-signal metric counts
 */
export async function findGreetingSignalMetrics(userId: string): Promise<GreetingSignalMetrics> {
  const now = new Date()
  const lastVisitAt = (await findLastVisitAt(userId)) ?? defaultLastVisit(now)
  const [overdueNextSteps, staleSubmissions, newSubmissionsSinceLastVisit, queuedSubmissions] = await Promise.all([
    countOverdueNextSteps(userId, now),
    countStaleSubmissions(now),
    countNewSubmissionsSince(lastVisitAt),
    countQueuedSubmissions(),
  ])

  return {
    overdueNextSteps,
    staleSubmissions,
    newSubmissionsSinceLastVisit,
    queuedSubmissions,
  }
}
