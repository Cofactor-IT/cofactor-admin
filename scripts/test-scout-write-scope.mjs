/**
 * test-scout-write-scope.mjs
 *
 * Verifies Scout DB scoped-write credentials by checking:
 * 1) read queries are allowed
 * 2) status-column write privilege exists
 * 3) non-approved field writes are blocked
 */

import { PrismaClient } from '@prisma/scout-client';
import 'dotenv/config';

const scoutWriteUrl = process.env.SCOUT_DB_WRITE_URL;

if (!scoutWriteUrl) {
    console.error('SCOUT_DB_WRITE_URL is missing');
    process.exit(1);
}

const scoutWriteDb = new PrismaClient({
    datasources: {
        db: {
            url: scoutWriteUrl,
        },
    },
});

async function run() {
    console.log('Testing Scout write client read access...');
    const submissions = await scoutWriteDb.researchSubmission.findMany({
        take: 5,
        select: {
            id: true,
            status: true,
        },
    });
    console.log(`Read check passed: fetched ${submissions.length} submission rows`);

    console.log('Testing approved status-only write scope...');
    await scoutWriteDb.$executeRawUnsafe(
        'UPDATE "ResearchSubmission" SET "status" = "status" WHERE 1 = 0'
    );
    console.log('Status write check passed: status column update permission is available');

    console.log('Testing non-approved field write protection...');
    try {
        await scoutWriteDb.$executeRawUnsafe(
            'UPDATE "ResearchSubmission" SET "updatedAt" = "updatedAt" WHERE 1 = 0'
        );
        console.error('Scope check failed: non-approved field update was allowed');
        process.exitCode = 1;
    } catch (error) {
        console.log('Scope check passed: non-approved field write blocked by DB permissions');
        console.log(`Blocked with: ${error instanceof Error ? error.message : String(error)}`);
    }
}

run()
    .catch((error) => {
        console.error('Scout scoped write test failed:');
        console.error(error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await scoutWriteDb.$disconnect();
    });
