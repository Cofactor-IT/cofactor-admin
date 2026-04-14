/**
 * submissions.ts
 *
 * Query functions for the Admin submissions queue backed by Scout's read-only database.
 */

// ============================================
// IMPORTS
// ============================================

import { SubmissionStatus } from '@prisma/scout-client';

// ============================================
// TYPES
// ============================================

export interface ScoutSubmissionQueueItem {
    id: string;
    title: string;
    scoutName: string;
    researchArea: string;
    university: string;
    dateSubmittedLabel: string;
    status: SubmissionStatus;
    statusLabel: string;
}

export interface ScoutSubmissionQueuePagination {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}

export interface ScoutSubmissionQueueResult {
    items: ScoutSubmissionQueueItem[];
    pagination: ScoutSubmissionQueuePagination;
    scoutConfigured: boolean;
    emptyMessage: string;
}

interface FindScoutSubmissionQueueParams {
    page?: number;
}

interface ScoutSubmissionQueueRecord {
    id: string;
    status: SubmissionStatus;
    researchTopic: string | null;
    submittedAt: Date | null;
    createdAt: Date;
    user: {
        fullName: string;
        researchAreas: string | null;
        university: string | null;
    };
}

interface ScoutSubmissionQueueDb {
    researchSubmission: {
        count(args: unknown): Promise<number>;
        findMany(args: unknown): Promise<ScoutSubmissionQueueRecord[]>;
    };
}

// ============================================
// CONSTANTS
// ============================================

const SUBMISSION_QUEUE_PAGE_SIZE = 50;
const SCOUT_UNAVAILABLE_MESSAGE =
    'Connect the Scout read-only database to load incoming submissions here.';
const EMPTY_QUEUE_MESSAGE =
    'Scout submissions will appear here as soon as new leads are submitted.';

let submissionQueueOverrides: {
    scoutDb?: ScoutSubmissionQueueDb;
} | null = null;

// ============================================
// HELPERS
// ============================================

function normalizedPage(page: number | undefined): number {
    if (!page || !Number.isFinite(page) || page < 1) return 1;
    return Math.trunc(page);
}

function submissionOffset(page: number): number {
    return (page - 1) * SUBMISSION_QUEUE_PAGE_SIZE;
}

function isMissingScoutDbConfigurationError(error: unknown): boolean {
    return error instanceof Error && error.message === 'SCOUT_DB_READONLY_URL is not set';
}

function isScoutConfigured(): boolean {
    return Boolean(submissionQueueOverrides?.scoutDb || process.env.SCOUT_DB_READONLY_URL);
}

function queuePagination(page: number, totalItems: number): ScoutSubmissionQueuePagination {
    const totalPages = Math.max(1, Math.ceil(totalItems / SUBMISSION_QUEUE_PAGE_SIZE));
    return {
        page,
        pageSize: SUBMISSION_QUEUE_PAGE_SIZE,
        totalItems,
        totalPages,
        hasPreviousPage: page > 1,
        hasNextPage: page < totalPages,
    };
}

function effectivePage(page: number, totalItems: number): number {
    const totalPages = Math.max(1, Math.ceil(totalItems / SUBMISSION_QUEUE_PAGE_SIZE));
    return Math.min(page, totalPages);
}

function formatSubmissionDate(date: Date | null | undefined): string {
    if (!date) return 'Date unavailable';
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(date);
}

function humanizeStatus(status: SubmissionStatus): string {
    return status
        .toLowerCase()
        .split('_')
        .filter(Boolean)
        .map((segment) => segment[0]?.toUpperCase() + segment.slice(1))
        .join(' ');
}

function queueTitle(submission: ScoutSubmissionQueueRecord): string {
    return submission.researchTopic?.trim() || 'Untitled research submission';
}

function queueResearchArea(submission: ScoutSubmissionQueueRecord): string {
    return submission.user.researchAreas?.trim() || 'Research area not provided';
}

function queueUniversity(submission: ScoutSubmissionQueueRecord): string {
    return submission.user.university?.trim() || 'University not provided';
}

function toQueueItem(submission: ScoutSubmissionQueueRecord): ScoutSubmissionQueueItem {
    return {
        id: submission.id,
        title: queueTitle(submission),
        scoutName: submission.user.fullName,
        researchArea: queueResearchArea(submission),
        university: queueUniversity(submission),
        dateSubmittedLabel: formatSubmissionDate(submission.submittedAt ?? submission.createdAt),
        status: submission.status,
        statusLabel: humanizeStatus(submission.status),
    };
}

async function scoutDatabase(): Promise<ScoutSubmissionQueueDb> {
    if (submissionQueueOverrides?.scoutDb) return submissionQueueOverrides.scoutDb;
    const { scoutDb } = await import('../scoutDb');
    return scoutDb as unknown as ScoutSubmissionQueueDb;
}

async function queueSubmissionCount(scoutDb: ScoutSubmissionQueueDb): Promise<number> {
    return scoutDb.researchSubmission.count({
        where: { isDraft: false },
    });
}

async function queueSubmissions(
    scoutDb: ScoutSubmissionQueueDb,
    page: number
): Promise<ScoutSubmissionQueueRecord[]> {
    return scoutDb.researchSubmission.findMany({
        where: { isDraft: false },
        orderBy: [{ submittedAt: 'desc' }, { createdAt: 'desc' }],
        skip: submissionOffset(page),
        take: SUBMISSION_QUEUE_PAGE_SIZE,
        select: {
            id: true,
            status: true,
            researchTopic: true,
            submittedAt: true,
            createdAt: true,
            user: {
                select: {
                    fullName: true,
                    researchAreas: true,
                    university: true,
                },
            },
        },
    });
}

async function safeQueueResult(
    page: number,
    loadQueue: () => Promise<ScoutSubmissionQueueResult>
): Promise<ScoutSubmissionQueueResult> {
    try {
        return await loadQueue();
    } catch (error) {
        if (!isMissingScoutDbConfigurationError(error)) throw error;
        return {
            items: [],
            pagination: queuePagination(page, 0),
            scoutConfigured: false,
            emptyMessage: SCOUT_UNAVAILABLE_MESSAGE,
        };
    }
}

// ============================================
// EXPORTED QUERY FUNCTIONS
// ============================================

/**
 * Overrides Scout submission queue dependencies during tests.
 *
 * @param overrides - Fake Scout DB delegate, or null to reset
 * @returns Nothing
 */
export function setSubmissionQueueQueryOverridesForTesting(
    overrides: {
        scoutDb?: ScoutSubmissionQueueDb;
    } | null
) {
    submissionQueueOverrides = overrides;
}

/**
 * Loads the paginated Scout submissions queue sorted by newest submissions first.
 *
 * @param params - Optional queue page selection
 * @returns Queue rows, pagination metadata, and empty-state copy
 */
export async function findScoutSubmissionQueue(
    params: FindScoutSubmissionQueueParams
): Promise<ScoutSubmissionQueueResult> {
    const page = normalizedPage(params.page);

    return safeQueueResult(page, async () => {
        const scoutDb = await scoutDatabase();
        const totalItems = await queueSubmissionCount(scoutDb);
        const currentPage = effectivePage(page, totalItems);
        const submissions = await queueSubmissions(scoutDb, currentPage);

        return {
            items: submissions.map((submission) => toQueueItem(submission)),
            pagination: queuePagination(currentPage, totalItems),
            scoutConfigured: isScoutConfigured(),
            emptyMessage: EMPTY_QUEUE_MESSAGE,
        };
    });
}
