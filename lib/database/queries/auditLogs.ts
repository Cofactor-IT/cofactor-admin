/**
 * auditLogs.ts
 *
 * Query functions for audit trail persistence and retrieval.
 */

import type { Prisma } from '@prisma/client';
import { adminDb } from '../adminDb';

interface CreateAuditLogEntryParams {
    action: string;
    resourceType: string;
    resourceId: string;
    userId?: string;
    userEmail?: string;
    changes?: Prisma.InputJsonValue;
    ipAddress?: string;
    userAgent?: string;
    status?: string;
    error?: string;
}

interface FindRecentAuditLogsParams {
    limit?: number;
    actor?: string;
    status?: 'SUCCESS' | 'FAILURE' | 'ALL';
    context?: 'ALL' | 'ERRORS' | 'REQUEST' | 'EMPTY';
    from?: Date;
    to?: Date;
}

interface AuditLogActorOption {
    value: string;
    label: string;
}

function actorWhereClause(actor: string): Prisma.AuditLogWhereInput {
    if (actor === 'SYSTEM') {
        return {
            userEmail: null,
            user: {
                is: null,
            },
        };
    }

    return {
        OR: [
            { userEmail: actor },
            {
                user: {
                    is: {
                        email: actor,
                    },
                },
            },
        ],
    };
}

function contextWhereClause(context: 'ERRORS' | 'REQUEST' | 'EMPTY'): Prisma.AuditLogWhereInput {
    if (context === 'ERRORS') {
        return {
            error: {
                not: null,
            },
        };
    }

    if (context === 'REQUEST') {
        return {
            OR: [
                {
                    ipAddress: {
                        not: null,
                    },
                },
                {
                    userAgent: {
                        not: null,
                    },
                },
            ],
        };
    }

    return {
        error: null,
        ipAddress: null,
        userAgent: null,
    };
}

function createdAtWhereClause(from?: Date, to?: Date): Prisma.DateTimeFilter | undefined {
    if (!from && !to) return undefined;

    return {
        gte: from,
        lte: to,
    };
}

/**
 * Writes an audit log entry to Admin's database.
 *
 * @param params - Audit event payload to persist
 * @returns Created audit log identifier
 */
export async function createAuditLogEntry(params: CreateAuditLogEntryParams) {
    const record = await adminDb.auditLog.create({
        data: {
            action: params.action,
            resourceType: params.resourceType,
            resourceId: params.resourceId,
            userId: params.userId,
            userEmail: params.userEmail,
            changes: params.changes,
            ipAddress: params.ipAddress,
            userAgent: params.userAgent,
            status: params.status ?? 'SUCCESS',
            error: params.error,
        },
        select: {
            id: true,
        },
    });

    return record.id;
}

/**
 * Loads distinct actor filter options from recent audit records.
 *
 * @returns Ordered actor options for the audit review filters
 */
export async function findAuditLogActorOptions(): Promise<AuditLogActorOption[]> {
    const records = await adminDb.auditLog.findMany({
        orderBy: {
            createdAt: 'desc',
        },
        take: 250,
        select: {
            userEmail: true,
            user: {
                select: {
                    name: true,
                    email: true,
                },
            },
        },
    });

    const options = new Map<string, string>();

    for (const record of records) {
        const email = record.userEmail ?? record.user?.email ?? null;
        if (email) {
            const label = record.user?.name ? `${record.user.name} (${email})` : email;
            if (!options.has(email)) options.set(email, label);
            continue;
        }

        if (!options.has('SYSTEM')) options.set('SYSTEM', 'System');
    }

    return Array.from(options.entries()).map(([value, label]) => ({
        value,
        label,
    }));
}

/**
 * Loads the most recent Admin audit log records for read-only review.
 *
 * @param limit - Maximum number of records to return
 * @returns Newest audit records with linked user identity when present
 */
export async function findRecentAuditLogs(params: FindRecentAuditLogsParams = {}) {
    const where: Prisma.AuditLogWhereInput = {};
    const andClauses: Prisma.AuditLogWhereInput[] = [];

    if (params.status && params.status !== 'ALL') {
        where.status = params.status;
    }

    if (params.actor) andClauses.push(actorWhereClause(params.actor));
    if (params.context && params.context !== 'ALL') {
        andClauses.push(contextWhereClause(params.context));
    }

    const createdAt = createdAtWhereClause(params.from, params.to);
    if (createdAt) where.createdAt = createdAt;
    if (andClauses.length > 0) where.AND = andClauses;

    return adminDb.auditLog.findMany({
        where,
        orderBy: {
            createdAt: 'desc',
        },
        take: params.limit ?? 100,
        select: {
            id: true,
            action: true,
            resourceType: true,
            resourceId: true,
            userEmail: true,
            changes: true,
            ipAddress: true,
            userAgent: true,
            status: true,
            error: true,
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
