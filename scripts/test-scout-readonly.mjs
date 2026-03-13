/**
 * test-scout-readonly.mjs
 *
 * Verifies Scout DB read-only credentials by checking:
 * 1) read queries are allowed
 * 2) write statements are blocked at DB permission level
 */

import { PrismaClient } from '@prisma/scout-client';
import 'dotenv/config';

const scoutUrl = process.env.SCOUT_DB_READONLY_URL;

if (!scoutUrl) {
    console.error('SCOUT_DB_READONLY_URL is missing');
    process.exit(1);
}

const scoutDb = new PrismaClient({
    datasources: {
        db: {
            url: scoutUrl,
        },
    },
});

async function run() {
    console.log('Testing Scout read access...');
    const users = await scoutDb.user.findMany({
        take: 5,
        select: {
            id: true,
            email: true,
        },
    });
    console.log(`Read check passed: fetched ${users.length} user rows`);

    console.log('Testing Scout write protection...');
    try {
        // Safe write-permission probe: updates zero rows but still requires UPDATE permission.
        await scoutDb.$executeRawUnsafe('UPDATE "User" SET "updatedAt" = "updatedAt" WHERE 1 = 0');
        console.error('Write check failed: UPDATE was allowed');
        process.exitCode = 1;
    } catch (error) {
        console.log('Write check passed: write was blocked by DB permissions');
        console.log(`Blocked with: ${error instanceof Error ? error.message : String(error)}`);
    }
}

run()
    .catch((error) => {
        console.error('Scout readonly test failed:');
        console.error(error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await scoutDb.$disconnect();
    });
