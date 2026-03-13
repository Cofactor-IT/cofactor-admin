/**
 * AuditLogStatusBadge.tsx
 *
 * Reusable status badge for audit-log summary rows.
 */

import { statusClassName } from './auditLog.utils';

interface AuditLogStatusBadgeProps {
    status: string;
}

/**
 * Renders the audit status badge.
 *
 * @param props - Status label from the audit record
 * @returns Styled success or failure pill
 */
export function AuditLogStatusBadge(props: AuditLogStatusBadgeProps) {
    return <span className={statusClassName(props.status)}>{props.status}</span>;
}
