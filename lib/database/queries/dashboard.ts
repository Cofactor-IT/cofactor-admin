/**
 * dashboard.ts
 *
 * Query functions for building the Admin dashboard view model from
 * Admin's own database and Scout's read-only connection.
 */

import { DealStage } from '@prisma/client';
import { Role as ScoutRole, ScoutApplicationStatus, SubmissionStatus } from '@prisma/scout-client';

// ============================================
// TYPES
// ============================================

export interface DashboardStat {
    title: string;
    count: number;
    secondaryLabel: string;
    trendLabel: string;
    actionLabel: string;
    accent: 'primary' | 'default';
    href: '/submissions' | '/pipeline' | '/scouts';
}

export interface DashboardActivityItem {
    id: string;
    href: '/submissions' | '/pipeline';
    title: string;
    description: string;
    changedBy: string;
    changedAt: string;
}

export interface DashboardPreviewItem {
    id: string;
    title: string;
    meta: string;
    detail: string;
    href: '/submissions' | '/pipeline' | '/scouts';
}

export interface DashboardPreviewSection {
    title: string;
    description: string;
    href: '/submissions' | '/pipeline' | '/scouts';
    items: DashboardPreviewItem[];
    emptyMessage: string;
}

interface ActivityLogRecord {
    id: string;
    action: string;
    resourceType: string;
    resourceId: string;
    createdAt: Date;
    user: {
        name: string;
        email: string;
    } | null;
}

interface SubmissionReference {
    id: string;
    researchTopic: string | null;
    researcherName: string | null;
    status?: SubmissionStatus;
    submittedAt?: Date | null;
    createdAt?: Date;
}

interface DealReference {
    id: string;
    scoutSubmissionId: string;
    stage: DealStage;
    updatedAt?: Date;
    owner?: {
        name: string;
        email: string;
    } | null;
}

interface ScoutReference {
    id: string;
    fullName: string;
    email: string;
    university: string | null;
    scoutApprovedAt: Date | null;
}

interface DashboardActivityReferences {
    submissionMap: Map<string, SubmissionReference>;
    dealMap: Map<string, DealReference>;
}

interface DashboardAdminDb {
    deal: {
        count(args?: unknown): Promise<number>;
        findMany(args: unknown): Promise<DealReference[]>;
    };
    auditLog: {
        findMany(args: unknown): Promise<ActivityLogRecord[]>;
    };
}

interface DashboardScoutDb {
    researchSubmission: {
        count(args: unknown): Promise<number>;
        findMany(args: unknown): Promise<SubmissionReference[]>;
    };
    user: {
        count(args: unknown): Promise<number>;
        findMany(args: unknown): Promise<ScoutReference[]>;
    };
}

// ============================================
// CONSTANTS
// ============================================

const ACTIVE_SUBMISSION_STATUSES = [
    SubmissionStatus.PENDING_RESEARCH,
    SubmissionStatus.VALIDATING,
    SubmissionStatus.PITCHED_MATCHMAKING,
];

const DASHBOARD_ACTIVITY_RESOURCE_TYPES = ['Submission', 'Deal'] as const;
const RECENT_ACTIVITY_LIMIT = 10;
const PREVIEW_LIMIT = 4;
const SCOUT_UNAVAILABLE_LABEL = 'Scout connection unavailable';
const SCOUT_UNAVAILABLE_PREVIEW_MESSAGE =
    'Connect Scout read-only access to preview live Scout data here.';

let dashboardQueryOverrides: {
    adminDb?: DashboardAdminDb;
    scoutDb?: DashboardScoutDb;
} | null = null;

// ============================================
// HELPERS
// ============================================

function startOfCurrentWeek(today: Date): Date {
    const weekStart = new Date(today);
    const dayOffset = (weekStart.getDay() + 6) % 7;
    weekStart.setDate(weekStart.getDate() - dayOffset);
    weekStart.setHours(0, 0, 0, 0);
    return weekStart;
}

function actorName(activity: ActivityLogRecord): string {
    return activity.user?.name ?? activity.user?.email ?? 'System';
}

function displaySubmissionName(
    submission: SubmissionReference | undefined,
    resourceId: string
): string {
    if (submission?.researchTopic) return submission.researchTopic;
    if (submission?.researcherName) return submission.researcherName;
    return `Submission ${resourceId.slice(0, 8)}`;
}

function humanizeAction(action: string): string {
    return action
        .toLowerCase()
        .split('_')
        .filter(Boolean)
        .map((segment) => segment[0]?.toUpperCase() + segment.slice(1))
        .join(' ');
}

function formatChangedAt(date: Date): string {
    const now = new Date();
    const elapsedMs = now.getTime() - date.getTime();
    const elapsedMinutes = Math.floor(elapsedMs / (1000 * 60));
    const elapsedHours = Math.floor(elapsedMinutes / 60);
    const elapsedDays = Math.floor(elapsedHours / 24);

    if (elapsedMinutes < 1) return 'Just now';
    if (elapsedMinutes < 60) return `${elapsedMinutes}m ago`;
    if (elapsedHours < 24) return `${elapsedHours}h ago`;
    if (elapsedDays === 1) return 'Yesterday';
    if (elapsedDays < 7) return `${elapsedDays}d ago`;

    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
    }).format(date);
}

function formatDate(date: Date | null | undefined): string {
    if (!date) return 'Date unavailable';
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
    }).format(date);
}

function activityDescription(activity: ActivityLogRecord): string {
    return humanizeAction(activity.action);
}

function activityHref(activity: ActivityLogRecord): '/submissions' | '/pipeline' {
    if (activity.resourceType === 'Deal') return '/pipeline';
    return '/submissions';
}

function activityTitle(
    activity: ActivityLogRecord,
    references: DashboardActivityReferences
): string {
    if (activity.resourceType === 'Deal') {
        const deal = references.dealMap.get(activity.resourceId);
        const submission = references.submissionMap.get(deal?.scoutSubmissionId ?? '');
        return displaySubmissionName(submission, activity.resourceId);
    }

    const submission = references.submissionMap.get(activity.resourceId);
    return displaySubmissionName(submission, activity.resourceId);
}

function submissionIdsFromActivity(logs: ActivityLogRecord[]): string[] {
    return logs
        .filter((activity) => activity.resourceType === 'Submission')
        .map((activity) => activity.resourceId);
}

function dealIdsFromActivity(logs: ActivityLogRecord[]): string[] {
    return logs
        .filter((activity) => activity.resourceType === 'Deal')
        .map((activity) => activity.resourceId);
}

function uniqueSubmissionIdsForDeals(deals: DealReference[]): string[] {
    return [...new Set(deals.map((deal) => deal.scoutSubmissionId))];
}

function toSubmissionMap(submissions: SubmissionReference[]): Map<string, SubmissionReference> {
    return new Map(submissions.map((submission) => [submission.id, submission]));
}

function toDealMap(deals: DealReference[]): Map<string, DealReference> {
    return new Map(deals.map((deal) => [deal.id, deal]));
}

function isMissingScoutDbConfigurationError(error: unknown): boolean {
    return error instanceof Error && error.message === 'SCOUT_DB_READONLY_URL is not set';
}

function isScoutConfigured(): boolean {
    return Boolean(dashboardQueryOverrides?.scoutDb || process.env.SCOUT_DB_READONLY_URL);
}

function humanizeSubmissionStatus(status: SubmissionStatus | undefined): string {
    if (!status) return 'Status unavailable';
    return humanizeAction(status);
}

function humanizeDealStage(stage: DealStage): string {
    return humanizeAction(stage);
}

function toSubmissionPreviewItem(submission: SubmissionReference): DashboardPreviewItem {
    return {
        id: submission.id,
        title: displaySubmissionName(submission, submission.id),
        meta: submission.researcherName ?? 'Research submission',
        detail: `${humanizeSubmissionStatus(submission.status)} - ${formatDate(submission.submittedAt ?? submission.createdAt)}`,
        href: '/submissions',
    };
}

function toDealPreviewItem(
    deal: DealReference,
    submissions: Map<string, SubmissionReference>
): DashboardPreviewItem {
    const submission = submissions.get(deal.scoutSubmissionId);
    return {
        id: deal.id,
        title: displaySubmissionName(submission, deal.id),
        meta: deal.owner?.name ?? deal.owner?.email ?? 'Assigned deal owner',
        detail: `${humanizeDealStage(deal.stage)} - ${formatDate(deal.updatedAt)}`,
        href: '/pipeline',
    };
}

function toScoutPreviewItem(scout: ScoutReference): DashboardPreviewItem {
    return {
        id: scout.id,
        title: scout.fullName,
        meta: scout.university ?? scout.email,
        detail: `Approved scout - ${formatDate(scout.scoutApprovedAt)}`,
        href: '/scouts',
    };
}

async function adminDatabase(): Promise<DashboardAdminDb> {
    if (dashboardQueryOverrides?.adminDb) return dashboardQueryOverrides.adminDb;
    const { adminDb } = await import('../adminDb');
    return adminDb as unknown as DashboardAdminDb;
}

async function scoutDatabase(): Promise<DashboardScoutDb> {
    if (dashboardQueryOverrides?.scoutDb) return dashboardQueryOverrides.scoutDb;
    const { scoutDb } = await import('../scoutDb');
    return scoutDb as unknown as DashboardScoutDb;
}

async function safeScoutCount(loadCount: () => Promise<number>): Promise<number> {
    try {
        return await loadCount();
    } catch (error) {
        if (isMissingScoutDbConfigurationError(error)) return 0;
        throw error;
    }
}

async function countActiveSubmissions(): Promise<number> {
    return safeScoutCount(async () => {
        const scoutDb = await scoutDatabase();
        return scoutDb.researchSubmission.count({
            where: {
                isDraft: false,
                status: { in: ACTIVE_SUBMISSION_STATUSES },
            },
        });
    });
}

async function countDealsInProgress(): Promise<number> {
    const adminDb = await adminDatabase();
    return adminDb.deal.count();
}

async function countActiveScouts(): Promise<number> {
    return safeScoutCount(async () => {
        const scoutDb = await scoutDatabase();
        return scoutDb.user.count({
            where: {
                OR: [
                    { scoutApplicationStatus: ScoutApplicationStatus.APPROVED },
                    { role: ScoutRole.SCOUT },
                ],
            },
        });
    });
}

async function countSubmissionsThisWeek(): Promise<number> {
    const weekStart = startOfCurrentWeek(new Date());
    return safeScoutCount(async () => {
        const scoutDb = await scoutDatabase();
        return scoutDb.researchSubmission.count({
            where: {
                isDraft: false,
                OR: [
                    { submittedAt: { gte: weekStart } },
                    { submittedAt: null, createdAt: { gte: weekStart } },
                ],
            },
        });
    });
}

async function recentActivityLogs(): Promise<ActivityLogRecord[]> {
    const adminDb = await adminDatabase();
    return adminDb.auditLog.findMany({
        where: {
            resourceType: { in: [...DASHBOARD_ACTIVITY_RESOURCE_TYPES] },
        },
        orderBy: { createdAt: 'desc' },
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
    });
}

async function submissionReferences(ids: string[]): Promise<SubmissionReference[]> {
    if (ids.length === 0) return [];
    const scoutDb = await scoutDatabase();
    return scoutDb.researchSubmission.findMany({
        where: { id: { in: ids } },
        select: {
            id: true,
            researchTopic: true,
            researcherName: true,
        },
    });
}

async function dealReferences(ids: string[]): Promise<DealReference[]> {
    if (ids.length === 0) return [];
    const adminDb = await adminDatabase();
    return adminDb.deal.findMany({
        where: { id: { in: ids } },
        select: {
            id: true,
            scoutSubmissionId: true,
            stage: true,
        },
    });
}

async function activityReferences(logs: ActivityLogRecord[]): Promise<DashboardActivityReferences> {
    const deals = await dealReferences(dealIdsFromActivity(logs));
    const submissionIds = [
        ...submissionIdsFromActivity(logs),
        ...uniqueSubmissionIdsForDeals(deals),
    ];
    const submissions = await submissionReferences([...new Set(submissionIds)]);

    return {
        submissionMap: toSubmissionMap(submissions),
        dealMap: toDealMap(deals),
    };
}

async function activeSubmissionPreviewItems(): Promise<DashboardPreviewItem[]> {
    try {
        const scoutDb = await scoutDatabase();
        const submissions = await scoutDb.researchSubmission.findMany({
            where: {
                isDraft: false,
                status: { in: ACTIVE_SUBMISSION_STATUSES },
            },
            orderBy: [{ submittedAt: 'desc' }, { createdAt: 'desc' }],
            take: PREVIEW_LIMIT,
            select: {
                id: true,
                researchTopic: true,
                researcherName: true,
                status: true,
                submittedAt: true,
                createdAt: true,
            },
        });

        return submissions.map((submission) => toSubmissionPreviewItem(submission));
    } catch (error) {
        if (isMissingScoutDbConfigurationError(error)) return [];
        throw error;
    }
}

async function recentDealPreviewItems(): Promise<DashboardPreviewItem[]> {
    const adminDb = await adminDatabase();
    const deals = await adminDb.deal.findMany({
        orderBy: { updatedAt: 'desc' },
        take: PREVIEW_LIMIT,
        select: {
            id: true,
            scoutSubmissionId: true,
            stage: true,
            updatedAt: true,
            owner: {
                select: {
                    name: true,
                    email: true,
                },
            },
        },
    });

    const scoutSubmissionIds = uniqueSubmissionIdsForDeals(deals);
    const submissions = await safeScoutSubmissionPreviewMap(scoutSubmissionIds);
    return deals.map((deal) => toDealPreviewItem(deal, submissions));
}

async function safeScoutSubmissionPreviewMap(
    ids: string[]
): Promise<Map<string, SubmissionReference>> {
    if (ids.length === 0) return new Map();

    try {
        const scoutDb = await scoutDatabase();
        const submissions = await scoutDb.researchSubmission.findMany({
            where: { id: { in: ids } },
            select: {
                id: true,
                researchTopic: true,
                researcherName: true,
            },
        });

        return toSubmissionMap(submissions);
    } catch (error) {
        if (isMissingScoutDbConfigurationError(error)) return new Map();
        throw error;
    }
}

async function activeScoutPreviewItems(): Promise<DashboardPreviewItem[]> {
    try {
        const scoutDb = await scoutDatabase();
        const scouts = await scoutDb.user.findMany({
            where: {
                OR: [
                    { scoutApplicationStatus: ScoutApplicationStatus.APPROVED },
                    { role: ScoutRole.SCOUT },
                ],
            },
            orderBy: [{ scoutApprovedAt: 'desc' }, { createdAt: 'desc' }],
            take: PREVIEW_LIMIT,
            select: {
                id: true,
                fullName: true,
                email: true,
                university: true,
                scoutApprovedAt: true,
            },
        });

        return scouts.map((scout) => toScoutPreviewItem(scout));
    } catch (error) {
        if (isMissingScoutDbConfigurationError(error)) return [];
        throw error;
    }
}

function toDashboardActivity(
    activity: ActivityLogRecord,
    references: DashboardActivityReferences
): DashboardActivityItem {
    return {
        id: activity.id,
        href: activityHref(activity),
        title: activityTitle(activity, references),
        description: activityDescription(activity),
        changedBy: actorName(activity),
        changedAt: formatChangedAt(activity.createdAt),
    };
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
        adminDb?: DashboardAdminDb;
        scoutDb?: DashboardScoutDb;
    } | null
) {
    dashboardQueryOverrides = overrides;
}

/**
 * Loads the four dashboard stat-card counts and module links.
 *
 * @returns Dashboard stat cards backed by Admin and Scout data
 */
export async function findDashboardStats(): Promise<DashboardStat[]> {
    const scoutConfigured = isScoutConfigured();
    const [activeSubmissions, dealsInProgress, activeScouts, submissionsThisWeek] =
        await Promise.all([
            countActiveSubmissions(),
            countDealsInProgress(),
            countActiveScouts(),
            countSubmissionsThisWeek(),
        ]);

    return [
        {
            title: 'Active Submissions',
            count: activeSubmissions,
            secondaryLabel: scoutConfigured ? 'In Scout review flow' : SCOUT_UNAVAILABLE_LABEL,
            trendLabel:
                submissionsThisWeek > 0
                    ? `${submissionsThisWeek} submitted this week`
                    : 'No new submissions this week',
            actionLabel: 'View all',
            accent: 'primary',
            href: '/submissions',
        },
        {
            title: 'Deals in Progress',
            count: dealsInProgress,
            secondaryLabel: 'Tracked in Admin',
            trendLabel:
                dealsInProgress > 0
                    ? `${dealsInProgress} active in pipeline`
                    : 'Pipeline is currently clear',
            actionLabel: 'View all',
            accent: 'default',
            href: '/pipeline',
        },
        {
            title: 'Active Scouts',
            count: activeScouts,
            secondaryLabel: scoutConfigured ? 'Approved Scout network' : SCOUT_UNAVAILABLE_LABEL,
            trendLabel:
                activeScouts > 0
                    ? `${activeScouts} approved scout profiles`
                    : 'Scout network still building',
            actionLabel: 'View all',
            accent: 'default',
            href: '/scouts',
        },
        {
            title: 'Submissions This Week',
            count: submissionsThisWeek,
            secondaryLabel: scoutConfigured ? 'Submitted since Monday' : SCOUT_UNAVAILABLE_LABEL,
            trendLabel:
                activeSubmissions > 0
                    ? `${activeSubmissions} currently in review`
                    : 'No active queue pressure',
            actionLabel: 'View all',
            accent: 'default',
            href: '/submissions',
        },
    ];
}

/**
 * Loads preview sections that surface the underlying module data on the dashboard.
 *
 * @returns Linked preview sections for submissions, deals, and scouts
 */
export async function findDashboardPreviewSections(): Promise<DashboardPreviewSection[]> {
    const [submissionItems, dealItems, scoutItems] = await Promise.all([
        activeSubmissionPreviewItems(),
        recentDealPreviewItems(),
        activeScoutPreviewItems(),
    ]);

    return [
        {
            title: 'Submission Queue',
            description: 'Latest active research leads from Scout.',
            href: '/submissions',
            items: submissionItems,
            emptyMessage: isScoutConfigured()
                ? 'No active submissions yet. New Scout submissions will appear here.'
                : SCOUT_UNAVAILABLE_PREVIEW_MESSAGE,
        },
        {
            title: 'Deal Pipeline',
            description: 'Recently updated Admin deals.',
            href: '/pipeline',
            items: dealItems,
            emptyMessage:
                'No deals in progress yet. Once Admin starts tracking deals, they will appear here.',
        },
        {
            title: 'Scout Profiles',
            description: 'Most recently approved Scout accounts.',
            href: '/scouts',
            items: scoutItems,
            emptyMessage: isScoutConfigured()
                ? 'No approved Scouts yet. Approved profiles will appear here.'
                : SCOUT_UNAVAILABLE_PREVIEW_MESSAGE,
        },
    ];
}

/**
 * Loads the recent dashboard activity feed from Admin audit events.
 *
 * @returns Last ten submission/deal activity items with module links
 */
export async function findRecentDashboardActivity(): Promise<DashboardActivityItem[]> {
    const logs = await recentActivityLogs();
    if (logs.length === 0) return [];

    const references = await activityReferences(logs);
    return logs.map((activity) => toDashboardActivity(activity, references));
}
