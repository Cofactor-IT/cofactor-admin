/**
 * auditLog.types.ts
 *
 * Shared types for Admin audit-log review components.
 */

export interface AuditLogTableItem {
    id: string;
    action: string;
    resourceType: string;
    resourceId: string;
    userEmail: string | null;
    actorName: string | null;
    ipAddress: string | null;
    userAgent: string | null;
    status: string;
    error: string | null;
    changes: unknown | null;
    createdAtLabel: string;
}
