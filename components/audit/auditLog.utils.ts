/**
 * auditLog.utils.ts
 *
 * Shared formatting helpers for Admin audit-log review components.
 */

import type { AuditLogTableItem } from './auditLog.types';

interface AuditLogChangeEntry {
    label: string;
    value: string;
}

function truncateEnd(value: string, maxLength: number): string {
    if (value.length <= maxLength) return value;
    return `${value.slice(0, maxLength - 3)}...`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function resourceTypeLabel(resourceType: string): string {
    return formatActionLabel(resourceType);
}

function formatUnknownValue(value: unknown): string {
    if (value === null || value === undefined) return 'None';
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    if (Array.isArray(value)) return value.map((item) => formatUnknownValue(item)).join(', ');
    if (isRecord(value)) {
        return Object.entries(value)
            .map(
                ([key, recordValue]) =>
                    `${formatActionLabel(key)}: ${formatUnknownValue(recordValue)}`
            )
            .join(' | ');
    }
    return 'Structured data';
}

export function actorLabel(item: AuditLogTableItem): string {
    return item.actorName ?? item.userEmail ?? 'System';
}

export function formatActionLabel(action: string): string {
    return action
        .toLowerCase()
        .split('_')
        .filter(Boolean)
        .map((segment) => segment[0]?.toUpperCase() + segment.slice(1))
        .join(' ');
}

export function resourceSummaryLabel(item: AuditLogTableItem): string {
    if (item.resourceType.toLowerCase() === 'user') return 'User account';
    if (item.resourceType.toLowerCase() === 'session') return 'Session';
    return resourceTypeLabel(item.resourceType);
}

export function contextLabel(item: AuditLogTableItem): string {
    if (item.error) return item.error;
    if (item.ipAddress) return item.ipAddress;
    if (item.userAgent) return item.userAgent;
    return 'No extra context';
}

export function contextPreview(item: AuditLogTableItem): string {
    return truncateEnd(contextLabel(item), 44);
}

export function statusClassName(status: string): string {
    return status === 'FAILURE'
        ? 'admin-audit-status admin-audit-status-failure'
        : 'admin-audit-status admin-audit-status-success';
}

export function changeEntries(value: unknown): AuditLogChangeEntry[] {
    if (!isRecord(value)) return [];

    return Object.entries(value).map(([key, entryValue]) => ({
        label: formatActionLabel(key),
        value: formatUnknownValue(entryValue),
    }));
}
