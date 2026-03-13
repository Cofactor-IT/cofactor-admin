/**
 * scoutWriteDb.ts
 *
 * Scoped-write Prisma client for Cofactor Scout's database.
 * This client must only be used for approved write paths (submission status updates).
 */

import { PrismaClient } from '@prisma/scout-client';

const globalForScoutWriteDb = globalThis as unknown as {
    scoutWriteDb: PrismaClient | undefined;
};

function createScoutWriteDbClient() {
    const scoutWriteDbUrl = process.env.SCOUT_DB_WRITE_URL;
    if (!scoutWriteDbUrl) {
        throw new Error('SCOUT_DB_WRITE_URL is not set');
    }

    return new PrismaClient({
        datasources: {
            db: {
                url: scoutWriteDbUrl,
            },
        },
        log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });
}

export const scoutWriteDb = globalForScoutWriteDb.scoutWriteDb ?? createScoutWriteDbClient();

if (process.env.NODE_ENV !== 'production') {
    globalForScoutWriteDb.scoutWriteDb = scoutWriteDb;
}
