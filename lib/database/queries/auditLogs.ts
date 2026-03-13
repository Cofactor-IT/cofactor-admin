/**
 * auditLogs.ts
 *
 * Query functions for creating audit trail records.
 */

import type { Prisma } from '@prisma/client';
import { adminDb } from '../adminDb';

interface LogAuditActionParams {
    action: string;
    resourceType: string;
    resourceId: string;
    userId?: string;
    changes?: Prisma.InputJsonValue;
}

/**
 * Writes an audit log entry to Admin's database.
 *
 * @param params - Audit event details
 * @returns Created audit log identifier
 */
export async function logAuditAction(params: LogAuditActionParams) {
    const record = await adminDb.auditLog.create({
        data: {
            action: params.action,
            resourceType: params.resourceType,
            resourceId: params.resourceId,
            userId: params.userId,
            changes: params.changes,
        },
        select: {
            id: true,
        },
    });

    return record.id;
}
