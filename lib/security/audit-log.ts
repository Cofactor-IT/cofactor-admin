/**
 * audit-log.ts
 *
 * Shared audit logging helpers and action constants.
 */

import type { Prisma } from '@prisma/client';
import { headers } from 'next/headers';
import { createAuditLogEntry } from '../database/queries/auditLogs';

export const AUDIT_ACTIONS = {
    USER_SIGN_IN: 'USER_SIGN_IN',
    USER_SIGN_OUT: 'USER_SIGN_OUT',
    USER_SIGN_IN_FAILED: 'USER_SIGN_IN_FAILED',
    USER_CREATED: 'USER_CREATED',
    ACCOUNT_DEACTIVATED: 'ACCOUNT_DEACTIVATED',
    ROLE_CHANGED: 'ROLE_CHANGED',
    PASSWORD_CHANGED: 'PASSWORD_CHANGED',
    PASSWORD_RESET_REQUESTED: 'PASSWORD_RESET_REQUESTED',
    PASSWORD_RESET_COMPLETED: 'PASSWORD_RESET_COMPLETED',
    SUBMISSION_STATUS_CHANGED: 'SUBMISSION_STATUS_CHANGED',
    SUBMISSION_NOTE_ADDED: 'SUBMISSION_NOTE_ADDED',
    SCOUT_APPLICATION_APPROVED: 'SCOUT_APPLICATION_APPROVED',
    SCOUT_APPLICATION_REJECTED: 'SCOUT_APPLICATION_REJECTED',
    SCOUT_APPLICATION_APPROVAL_UNDONE: 'SCOUT_APPLICATION_APPROVAL_UNDONE',
    DEAL_CREATED: 'DEAL_CREATED',
    DEAL_STAGE_CHANGED: 'DEAL_STAGE_CHANGED',
    DEAL_OWNER_CHANGED: 'DEAL_OWNER_CHANGED',
    CONTACT_CREATED: 'CONTACT_CREATED',
    INTERACTION_LOGGED: 'INTERACTION_LOGGED',
} as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS];

interface AuditRequestContext {
    ipAddress?: string;
    userAgent?: string;
}

interface LogAuditActionParams {
    userId?: string;
    userEmail?: string;
    action: AuditAction;
    resourceType: string;
    resourceId: string;
    changes?: Prisma.InputJsonValue;
    ipAddress?: string;
    userAgent?: string;
    status?: 'SUCCESS' | 'FAILURE';
    error?: string;
}

function getHeaderValue(headersSource: unknown, name: string): string | undefined {
    if (headersSource && typeof headersSource === 'object' && 'get' in headersSource) {
        const getter = (headersSource as { get?: (headerName: string) => string | null }).get;
        const value = typeof getter === 'function' ? getter(name) : null;
        return value && value.length > 0 ? value : undefined;
    }

    if (!headersSource || typeof headersSource !== 'object') return undefined;
    const headersRecord = (
        headersSource as { headers?: Record<string, string | string[] | undefined> }
    ).headers;
    const value = headersRecord?.[name];
    if (typeof value === 'string' && value.length > 0) return value;
    if (Array.isArray(value) && value[0]) return value[0];
    return undefined;
}

function normalizeIpAddress(rawIpAddress?: string): string | undefined {
    return rawIpAddress?.split(',')[0]?.trim() || undefined;
}

/**
 * Reads request metadata used by audit entries from a headers-like source.
 *
 * @param headersSource - Headers object or request-like object
 * @returns IP address and user agent when available
 */
export function getAuditRequestContextFromSource(headersSource: unknown): AuditRequestContext {
    return {
        ipAddress: normalizeIpAddress(getHeaderValue(headersSource, 'x-forwarded-for')),
        userAgent: getHeaderValue(headersSource, 'user-agent'),
    };
}

/**
 * Reads request metadata used by audit entries from the active server request.
 *
 * @returns IP address and user agent when available
 */
export async function getAuditRequestContext(): Promise<AuditRequestContext> {
    const requestHeaders = await headers();
    return getAuditRequestContextFromSource(requestHeaders);
}

/**
 * Writes an audit event without letting logging failures block the main flow.
 *
 * @param params - Audit event details
 */
export async function logAuditAction(params: LogAuditActionParams): Promise<void> {
    try {
        await createAuditLogEntry({
            userId: params.userId,
            userEmail: params.userEmail,
            action: params.action,
            resourceType: params.resourceType,
            resourceId: params.resourceId,
            changes: params.changes,
            ipAddress: params.ipAddress,
            userAgent: params.userAgent,
            status: params.status ?? 'SUCCESS',
            error: params.error,
        });
    } catch (error) {
        console.error('Audit log failed:', error);
    }
}
