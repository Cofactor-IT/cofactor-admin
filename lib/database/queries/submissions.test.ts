/**
 * submissions.test.ts
 *
 * Tests for the Scout submissions queue query mapping and fallbacks.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    findScoutSubmissionQueue,
    setSubmissionQueueQueryOverridesForTesting,
} from './submissions';

const fakeScoutDb = {
    researchSubmission: {
        count: vi.fn(),
        findMany: vi.fn(),
    },
};

describe('submission queue queries', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        setSubmissionQueueQueryOverridesForTesting({
            scoutDb: fakeScoutDb,
        });
    });

    it('returns paginated queue rows sorted for the submissions workspace', async () => {
        fakeScoutDb.researchSubmission.count.mockResolvedValue(2);
        fakeScoutDb.researchSubmission.findMany.mockResolvedValue([
            {
                id: 'submission_2',
                status: 'VALIDATING',
                researchTopic: 'Programmable protein sensors',
                submittedAt: new Date('2026-04-13T08:00:00.000Z'),
                createdAt: new Date('2026-04-12T08:00:00.000Z'),
                user: {
                    fullName: 'Rosa Patel',
                    email: 'rosa@berkeley.edu',
                    researchAreas: 'Synthetic biology',
                    university: 'UC Berkeley',
                },
            },
            {
                id: 'submission_1',
                status: 'PENDING_RESEARCH',
                researchTopic: null,
                submittedAt: null,
                createdAt: new Date('2026-04-12T06:30:00.000Z'),
                user: {
                    fullName: 'Marco Silva',
                    email: 'marco@mit.edu',
                    researchAreas: null,
                    university: null,
                },
            },
        ]);

        const queue = await findScoutSubmissionQueue({ page: 1 });

        expect(fakeScoutDb.researchSubmission.findMany).toHaveBeenCalledWith({
            where: { isDraft: false },
            orderBy: [{ submittedAt: 'desc' }, { createdAt: 'desc' }],
            skip: 0,
            take: 50,
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
        expect(queue).toEqual({
            items: [
                expect.objectContaining({
                    id: 'submission_2',
                    title: 'Programmable protein sensors',
                    scoutName: 'Rosa Patel',
                    researchArea: 'Synthetic biology',
                    university: 'UC Berkeley',
                    status: 'VALIDATING',
                    statusLabel: 'Validating',
                }),
                expect.objectContaining({
                    id: 'submission_1',
                    title: 'Untitled research submission',
                    scoutName: 'Marco Silva',
                    researchArea: 'Research area not provided',
                    university: 'University not provided',
                    status: 'PENDING_RESEARCH',
                    statusLabel: 'Pending Research',
                }),
            ],
            pagination: {
                page: 1,
                pageSize: 50,
                totalItems: 2,
                totalPages: 1,
                hasPreviousPage: false,
                hasNextPage: false,
            },
            scoutConfigured: true,
            emptyMessage: 'Scout submissions will appear here as soon as new leads are submitted.',
        });
    });

    it('returns a graceful empty state when Scout read-only access is unavailable', async () => {
        setSubmissionQueueQueryOverridesForTesting({
            scoutDb: {
                researchSubmission: {
                    count: vi.fn().mockRejectedValue(new Error('SCOUT_DB_READONLY_URL is not set')),
                    findMany: vi.fn(),
                },
            },
        });

        const queue = await findScoutSubmissionQueue({ page: 3 });

        expect(queue).toEqual({
            items: [],
            pagination: {
                page: 3,
                pageSize: 50,
                totalItems: 0,
                totalPages: 1,
                hasPreviousPage: true,
                hasNextPage: false,
            },
            scoutConfigured: false,
            emptyMessage: 'Connect the Scout read-only database to load incoming submissions here.',
        });
    });
});
