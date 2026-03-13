/**
 * dashboard.test.ts
 *
 * Tests for dashboard query orchestration, previews, and activity mapping.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    findDashboardPreviewSections,
    findDashboardStats,
    findRecentDashboardActivity,
    setDashboardQueryOverridesForTesting,
} from './dashboard';

const fakeAdminDb = {
    deal: {
        count: vi.fn(),
        findMany: vi.fn(),
    },
    auditLog: {
        findMany: vi.fn(),
    },
};

const fakeScoutDb = {
    researchSubmission: {
        count: vi.fn(),
        findMany: vi.fn(),
    },
    user: {
        count: vi.fn(),
        findMany: vi.fn(),
    },
};

describe('dashboard queries', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        setDashboardQueryOverridesForTesting({
            adminDb: fakeAdminDb,
            scoutDb: fakeScoutDb,
        });
    });

    it('returns four dashboard stat cards with module links', async () => {
        fakeScoutDb.researchSubmission.count.mockResolvedValueOnce(14).mockResolvedValueOnce(5);
        fakeAdminDb.deal.count.mockResolvedValue(6);
        fakeScoutDb.user.count.mockResolvedValueOnce(8).mockResolvedValueOnce(2);

        const stats = await findDashboardStats();

        expect(stats).toEqual([
            expect.objectContaining({
                title: 'Active Submissions',
                count: 14,
                href: '/submissions',
            }),
            expect.objectContaining({ title: 'Deals in Progress', count: 6, href: '/pipeline' }),
            expect.objectContaining({
                title: 'Active Scouts',
                count: 8,
                href: '/scouts?tab=profiles',
            }),
            expect.objectContaining({
                title: 'Scout Applications',
                count: 2,
                href: '/scouts?tab=applications',
            }),
        ]);
    });

    it('returns linked preview sections with live module rows', async () => {
        fakeScoutDb.researchSubmission.findMany
            .mockResolvedValueOnce([
                {
                    id: 'submission_1',
                    researchTopic: 'Quantum Error Correction',
                    researcherName: 'Dr. Chen',
                    status: 'VALIDATING',
                    submittedAt: new Date('2026-03-11T10:00:00.000Z'),
                    createdAt: new Date('2026-03-10T10:00:00.000Z'),
                },
            ])
            .mockResolvedValueOnce([
                {
                    id: 'submission_2',
                    researchTopic: 'Fusion Materials',
                    researcherName: 'Dr. Patel',
                },
            ]);
        fakeAdminDb.deal.findMany.mockResolvedValueOnce([
            {
                id: 'deal_1',
                scoutSubmissionId: 'submission_2',
                stage: 'QUALIFY',
                updatedAt: new Date('2026-03-12T09:00:00.000Z'),
                owner: { name: 'Ahmed Aizi', email: 'ahmed@cofactor.world' },
            },
        ]);
        fakeScoutDb.user.findMany.mockResolvedValueOnce([
            {
                id: 'scout_1',
                fullName: 'Sarah Ahmed',
                email: 'sarah@university.edu',
                university: 'Imperial College London',
                scoutApprovedAt: new Date('2026-03-08T09:00:00.000Z'),
            },
        ]);

        const sections = await findDashboardPreviewSections();

        expect(sections).toHaveLength(3);
        expect(sections[0]).toEqual(
            expect.objectContaining({
                title: 'Submission Queue',
                href: '/submissions',
                items: [
                    expect.objectContaining({
                        title: 'Quantum Error Correction',
                        meta: 'Dr. Chen',
                        href: '/submissions',
                    }),
                ],
            })
        );
        expect(sections[1]).toEqual(
            expect.objectContaining({
                title: 'Deal Pipeline',
                href: '/pipeline',
                items: [
                    expect.objectContaining({
                        title: 'Fusion Materials',
                        meta: 'Ahmed Aizi',
                        href: '/pipeline',
                    }),
                ],
            })
        );
        expect(sections[2]).toEqual(
            expect.objectContaining({
                title: 'Scout Profiles',
                href: '/scouts?tab=profiles',
                items: [
                    expect.objectContaining({
                        title: 'Sarah Ahmed',
                        meta: 'Imperial College London',
                        href: '/scouts?tab=profiles',
                    }),
                ],
            })
        );
    });

    it('returns an empty activity list when no logs exist', async () => {
        fakeAdminDb.auditLog.findMany.mockResolvedValue([]);

        await expect(findRecentDashboardActivity()).resolves.toEqual([]);
    });

    it('degrades Scout-backed stats when the Scout connection is unavailable', async () => {
        setDashboardQueryOverridesForTesting({
            adminDb: fakeAdminDb,
        });
        const scoutDbUrl = process.env.SCOUT_DB_READONLY_URL;
        delete process.env.SCOUT_DB_READONLY_URL;
        fakeAdminDb.deal.count.mockResolvedValue(6);

        try {
            const stats = await findDashboardStats();

            expect(stats).toEqual([
                expect.objectContaining({
                    title: 'Active Submissions',
                    count: 0,
                    secondaryLabel: 'Scout connection unavailable',
                }),
                expect.objectContaining({
                    title: 'Deals in Progress',
                    count: 6,
                    secondaryLabel: 'In Admin pipeline',
                }),
                expect.objectContaining({
                    title: 'Active Scouts',
                    count: 0,
                    secondaryLabel: 'Scout connection unavailable',
                }),
                expect.objectContaining({
                    title: 'Scout Applications',
                    count: 0,
                    secondaryLabel: 'Scout connection unavailable',
                }),
            ]);
        } finally {
            if (scoutDbUrl) process.env.SCOUT_DB_READONLY_URL = scoutDbUrl;
        }
    });

    it('falls back to empty Scout preview sections when the Scout connection is unavailable', async () => {
        setDashboardQueryOverridesForTesting({
            adminDb: fakeAdminDb,
        });
        const scoutDbUrl = process.env.SCOUT_DB_READONLY_URL;
        delete process.env.SCOUT_DB_READONLY_URL;
        fakeAdminDb.deal.findMany.mockResolvedValue([]);

        try {
            const sections = await findDashboardPreviewSections();

            expect(sections[0]).toEqual(
                expect.objectContaining({
                    title: 'Submission Queue',
                    items: [],
                    emptyMessage: 'Connect Scout read-only access to preview live Scout data here.',
                })
            );
            expect(sections[1]).toEqual(
                expect.objectContaining({
                    title: 'Deal Pipeline',
                    items: [],
                })
            );
            expect(sections[2]).toEqual(
                expect.objectContaining({
                    title: 'Scout Profiles',
                    items: [],
                    emptyMessage: 'Connect Scout read-only access to preview live Scout data here.',
                })
            );
        } finally {
            if (scoutDbUrl) process.env.SCOUT_DB_READONLY_URL = scoutDbUrl;
        }
    });

    it('maps submission and deal audit records into dashboard activity items', async () => {
        fakeAdminDb.auditLog.findMany.mockResolvedValue([
            {
                id: 'log_submission',
                action: 'SUBMISSION_STATUS_UPDATED',
                resourceType: 'Submission',
                resourceId: 'submission_1',
                createdAt: new Date('2026-03-12T10:30:00.000Z'),
                user: { name: 'Ahmed Aizi', email: 'ahmed@cofactor.world' },
            },
            {
                id: 'log_deal',
                action: 'DEAL_STAGE_UPDATED',
                resourceType: 'Deal',
                resourceId: 'deal_1',
                createdAt: new Date('2026-03-12T09:00:00.000Z'),
                user: { name: 'NF Emmanuel', email: 'nf@cofactor.world' },
            },
        ]);
        fakeAdminDb.deal.findMany.mockResolvedValue([
            { id: 'deal_1', scoutSubmissionId: 'submission_2', stage: 'QUALIFY' },
        ]);
        fakeScoutDb.researchSubmission.findMany.mockResolvedValue([
            {
                id: 'submission_1',
                researchTopic: 'Quantum Error Correction',
                researcherName: 'Dr. Chen',
            },
            { id: 'submission_2', researchTopic: 'Fusion Materials', researcherName: 'Dr. Patel' },
        ]);

        const activity = await findRecentDashboardActivity();

        expect(activity).toEqual([
            expect.objectContaining({
                id: 'log_submission',
                href: '/submissions',
                title: 'Quantum Error Correction',
                description: 'Submission Status Updated',
                changedBy: 'Ahmed Aizi',
            }),
            expect.objectContaining({
                id: 'log_deal',
                href: '/pipeline',
                title: 'Fusion Materials',
                description: 'Deal Stage Updated',
                changedBy: 'NF Emmanuel',
            }),
        ]);
    });
});
