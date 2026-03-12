/**
 * dashboard.ts
 *
 * Query functions for building the Admin dashboard view model from
 * Admin's own database and Scout's read-only connection.
 */

import { DealStage } from "@prisma/client"
import {
  Role as ScoutRole,
  ScoutApplicationStatus,
  SubmissionStatus,
} from "@prisma/scout-client"

// ============================================
// TYPES
// ============================================

export interface DashboardStat {
  title: string
  count: number
  secondaryLabel: string
  href: "/submissions" | "/pipeline" | "/scouts"
}

export interface DashboardActivityItem {
  id: string
  href: "/submissions" | "/pipeline"
  title: string
  description: string
  changedBy: string
  changedAt: string
}

interface ActivityLogRecord {
  id: string
  action: string
  resourceType: string
  resourceId: string
  createdAt: Date
  user: {
    name: string
    email: string
  } | null
}

interface SubmissionReference {
  id: string
  researchTopic: string | null
  researcherName: string | null
}

interface DealReference {
  id: string
  scoutSubmissionId: string
  stage: DealStage
}

interface DashboardActivityReferences {
  submissionMap: Map<string, SubmissionReference>
  dealMap: Map<string, DealReference>
}

interface DashboardAdminDb {
  deal: {
    count(args?: unknown): Promise<number>
    findMany(args: unknown): Promise<DealReference[]>
  }
  auditLog: {
    findMany(args: unknown): Promise<ActivityLogRecord[]>
  }
}

interface DashboardScoutDb {
  researchSubmission: {
    count(args: unknown): Promise<number>
    findMany(args: unknown): Promise<SubmissionReference[]>
  }
  user: {
    count(args: unknown): Promise<number>
  }
}

// ============================================
// CONSTANTS
// ============================================

const ACTIVE_SUBMISSION_STATUSES = [
  SubmissionStatus.PENDING_RESEARCH,
  SubmissionStatus.VALIDATING,
  SubmissionStatus.PITCHED_MATCHMAKING,
]

const DASHBOARD_ACTIVITY_RESOURCE_TYPES = ["Submission", "Deal"] as const
const RECENT_ACTIVITY_LIMIT = 10

let dashboardQueryOverrides:
  | {
      adminDb: DashboardAdminDb
      scoutDb: DashboardScoutDb
    }
  | null = null

// ============================================
// HELPERS
// ============================================

function startOfCurrentWeek(today: Date): Date {
  const weekStart = new Date(today)
  const dayOffset = (weekStart.getDay() + 6) % 7
  weekStart.setDate(weekStart.getDate() - dayOffset)
  weekStart.setHours(0, 0, 0, 0)
  return weekStart
}

function actorName(activity: ActivityLogRecord): string {
  return activity.user?.name ?? activity.user?.email ?? "System"
}

function displaySubmissionName(submission: SubmissionReference | undefined, resourceId: string): string {
  if (submission?.researchTopic) return submission.researchTopic
  if (submission?.researcherName) return submission.researcherName
  return `Submission ${resourceId.slice(0, 8)}`
}

function humanizeAction(action: string): string {
  return action
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((segment) => segment[0]?.toUpperCase() + segment.slice(1))
    .join(" ")
}

function formatChangedAt(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date)
}

function activityDescription(activity: ActivityLogRecord): string {
  return humanizeAction(activity.action)
}

function activityHref(activity: ActivityLogRecord): "/submissions" | "/pipeline" {
  if (activity.resourceType === "Deal") return "/pipeline"
  return "/submissions"
}

function activityTitle(
  activity: ActivityLogRecord,
  references: DashboardActivityReferences,
): string {
  if (activity.resourceType === "Deal") {
    const deal = references.dealMap.get(activity.resourceId)
    const submission = references.submissionMap.get(deal?.scoutSubmissionId ?? "")
    return displaySubmissionName(submission, activity.resourceId)
  }

  const submission = references.submissionMap.get(activity.resourceId)
  return displaySubmissionName(submission, activity.resourceId)
}

function submissionIdsFromActivity(logs: ActivityLogRecord[]): string[] {
  return logs
    .filter((activity) => activity.resourceType === "Submission")
    .map((activity) => activity.resourceId)
}

function dealIdsFromActivity(logs: ActivityLogRecord[]): string[] {
  return logs
    .filter((activity) => activity.resourceType === "Deal")
    .map((activity) => activity.resourceId)
}

function uniqueSubmissionIdsForDeals(deals: DealReference[]): string[] {
  return [...new Set(deals.map((deal) => deal.scoutSubmissionId))]
}

function toSubmissionMap(submissions: SubmissionReference[]): Map<string, SubmissionReference> {
  return new Map(submissions.map((submission) => [submission.id, submission]))
}

function toDealMap(deals: DealReference[]): Map<string, DealReference> {
  return new Map(deals.map((deal) => [deal.id, deal]))
}

async function adminDatabase(): Promise<DashboardAdminDb> {
  if (dashboardQueryOverrides) return dashboardQueryOverrides.adminDb
  const { adminDb } = await import("../adminDb")
  return adminDb as unknown as DashboardAdminDb
}

async function scoutDatabase(): Promise<DashboardScoutDb> {
  if (dashboardQueryOverrides) return dashboardQueryOverrides.scoutDb
  const { scoutDb } = await import("../scoutDb")
  return scoutDb as unknown as DashboardScoutDb
}

async function countActiveSubmissions(): Promise<number> {
  const scoutDb = await scoutDatabase()
  return scoutDb.researchSubmission.count({
    where: {
      isDraft: false,
      status: { in: ACTIVE_SUBMISSION_STATUSES },
    },
  })
}

async function countDealsInProgress(): Promise<number> {
  const adminDb = await adminDatabase()
  return adminDb.deal.count()
}

async function countActiveScouts(): Promise<number> {
  const scoutDb = await scoutDatabase()
  return scoutDb.user.count({
    where: {
      OR: [
        { scoutApplicationStatus: ScoutApplicationStatus.APPROVED },
        { role: ScoutRole.SCOUT },
      ],
    },
  })
}

async function countSubmissionsThisWeek(): Promise<number> {
  const weekStart = startOfCurrentWeek(new Date())
  const scoutDb = await scoutDatabase()
  return scoutDb.researchSubmission.count({
    where: {
      isDraft: false,
      OR: [
        { submittedAt: { gte: weekStart } },
        { submittedAt: null, createdAt: { gte: weekStart } },
      ],
    },
  })
}

async function recentActivityLogs(): Promise<ActivityLogRecord[]> {
  const adminDb = await adminDatabase()
  return adminDb.auditLog.findMany({
    where: {
      resourceType: { in: [...DASHBOARD_ACTIVITY_RESOURCE_TYPES] },
    },
    orderBy: { createdAt: "desc" },
    take: RECENT_ACTIVITY_LIMIT,
    select: {
      id: true,
      action: true,
      resourceType: true,
      resourceId: true,
      createdAt: true,
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  })
}

async function submissionReferences(ids: string[]): Promise<SubmissionReference[]> {
  if (ids.length === 0) return []
  const scoutDb = await scoutDatabase()
  return scoutDb.researchSubmission.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      researchTopic: true,
      researcherName: true,
    },
  })
}

async function dealReferences(ids: string[]): Promise<DealReference[]> {
  if (ids.length === 0) return []
  const adminDb = await adminDatabase()
  return adminDb.deal.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      scoutSubmissionId: true,
      stage: true,
    },
  })
}

async function activityReferences(logs: ActivityLogRecord[]): Promise<DashboardActivityReferences> {
  const deals = await dealReferences(dealIdsFromActivity(logs))
  const submissionIds = [
    ...submissionIdsFromActivity(logs),
    ...uniqueSubmissionIdsForDeals(deals),
  ]
  const submissions = await submissionReferences([...new Set(submissionIds)])

  return {
    submissionMap: toSubmissionMap(submissions),
    dealMap: toDealMap(deals),
  }
}

function toDashboardActivity(
  activity: ActivityLogRecord,
  references: DashboardActivityReferences,
): DashboardActivityItem {
  return {
    id: activity.id,
    href: activityHref(activity),
    title: activityTitle(activity, references),
    description: activityDescription(activity),
    changedBy: actorName(activity),
    changedAt: formatChangedAt(activity.createdAt),
  }
}

// ============================================
// EXPORTED QUERY FUNCTIONS
// ============================================

/**
 * Overrides dashboard query clients for test execution.
 *
 * @param overrides - Fake Admin and Scout database delegates, or null to reset
 * @returns Nothing
 */
export function setDashboardQueryOverridesForTesting(
  overrides: {
    adminDb: DashboardAdminDb
    scoutDb: DashboardScoutDb
  } | null,
) {
  dashboardQueryOverrides = overrides
}

/**
 * Loads the four dashboard stat-card counts and module links.
 *
 * @returns Dashboard stat cards backed by Admin and Scout data
 */
export async function findDashboardStats(): Promise<DashboardStat[]> {
  const [activeSubmissions, dealsInProgress, activeScouts, submissionsThisWeek] = await Promise.all([
    countActiveSubmissions(),
    countDealsInProgress(),
    countActiveScouts(),
    countSubmissionsThisWeek(),
  ])

  return [
    { title: "Active Submissions", count: activeSubmissions, secondaryLabel: "In Scout review flow", href: "/submissions" },
    { title: "Deals in Progress", count: dealsInProgress, secondaryLabel: "Tracked in Admin", href: "/pipeline" },
    { title: "Active Scouts", count: activeScouts, secondaryLabel: "Approved Scout network", href: "/scouts" },
    { title: "Submissions This Week", count: submissionsThisWeek, secondaryLabel: "Submitted since Monday", href: "/submissions" },
  ]
}

/**
 * Loads the recent dashboard activity feed from Admin audit events.
 *
 * @returns Last ten submission/deal activity items with module links
 */
export async function findRecentDashboardActivity(): Promise<DashboardActivityItem[]> {
  const logs = await recentActivityLogs()
  if (logs.length === 0) return []

  const references = await activityReferences(logs)
  return logs.map((activity) => toDashboardActivity(activity, references))
}
