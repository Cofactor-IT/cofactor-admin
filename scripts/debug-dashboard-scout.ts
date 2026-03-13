/**
 * debug-dashboard-scout.ts
 *
 * Temporary local debug script for verifying what the Admin dashboard sees through
 * the shared Scout Prisma client and local Scout database connection.
 */

import 'dotenv/config';
import { SubmissionStatus } from '@prisma/scout-client';
import { scoutDb } from '../lib/database/scoutDb.ts';

const ACTIVE_SUBMISSION_STATUSES = [
    SubmissionStatus.PENDING_RESEARCH,
    SubmissionStatus.VALIDATING,
    SubmissionStatus.PITCHED_MATCHMAKING,
];

/**
 * Prints the same Scout-side submission signals the dashboard depends on.
 *
 * @returns Nothing
 */
async function main(): Promise<void> {
    const [allSubmissionCount, activeSubmissionCount, latestSubmissions] = await Promise.all([
        scoutDb.researchSubmission.count(),
        scoutDb.researchSubmission.count({
            where: {
                isDraft: false,
                status: { in: ACTIVE_SUBMISSION_STATUSES },
            },
        }),
        scoutDb.researchSubmission.findMany({
            orderBy: [{ createdAt: 'desc' }],
            take: 5,
            select: {
                id: true,
                researchTopic: true,
                researcherName: true,
                status: true,
                isDraft: true,
                submittedAt: true,
                createdAt: true,
            },
        }),
    ]);

    console.log(
        JSON.stringify(
            {
                scoutDbUrl: process.env.SCOUT_DB_READONLY_URL,
                allSubmissionCount,
                activeSubmissionCount,
                latestSubmissions,
            },
            null,
            2
        )
    );
}

main()
    .catch((error: unknown) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await scoutDb.$disconnect();
    });
