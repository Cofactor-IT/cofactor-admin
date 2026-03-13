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
 * Loads the most recent Admin audit log records for read-only review.
 *
 * @param limit - Maximum number of records to return
 * @returns Newest audit records with linked user identity when present
 */
export async function findRecentAuditLogs(limit: number = 100) {
    return adminDb.auditLog.findMany({
        orderBy: {
            createdAt: 'desc',
        },
        take: limit,
        select: {
            id: true,
            action: true,
            resourceType: true,
            resourceId: true,
            userEmail: true,
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
