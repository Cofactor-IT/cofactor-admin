/**
 * scoutDb.ts
 *
 * Read-only Prisma client for Cofactor Scout's database.
 * Uses a dedicated generated client to keep Scout and Admin schemas isolated.
 */

import { PrismaClient } from '@prisma/scout-client';

const globalForScoutDb = globalThis as unknown as {
    scoutDb: PrismaClient | undefined;
};

function createScoutDbClient() {
    const scoutDbUrl = process.env.SCOUT_DB_READONLY_URL;
    if (!scoutDbUrl) {
        throw new Error('SCOUT_DB_READONLY_URL is not set');
    }

    return new PrismaClient({
        datasources: {
            db: {
                url: scoutDbUrl,
            },
        },
        log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });
}

export const scoutDb = globalForScoutDb.scoutDb ?? createScoutDbClient();

if (process.env.NODE_ENV !== 'production') {
    globalForScoutDb.scoutDb = scoutDb;
}
