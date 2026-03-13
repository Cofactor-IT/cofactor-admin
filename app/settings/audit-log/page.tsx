/**
 * page.tsx
 *
 * IT-only audit log review page.
 */

import { AuditLogTable } from '../../../components/audit/AuditLogTable';
import { AdminShell } from '../../../components/shared/AdminShell';
import { requireIT } from '../../../lib/auth/permissions';
import { findRecentAuditLogs } from '../../../lib/database/queries/auditLogs';

function formatDateTime(value: Date): string {
    return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(value);
}

/**
 * Renders the IT-only audit log page.
 *
 * @returns Read-only audit history for recent Admin events
 */
export default async function AuditLogPage() {
    const session = await requireIT();
    const records = await findRecentAuditLogs();

    const items = records.map((record) => ({
        id: record.id,
        action: record.action,
        resourceType: record.resourceType,
        resourceId: record.resourceId,
        userEmail: record.userEmail ?? record.user?.email ?? null,
        actorName: record.user?.name ?? null,
        ipAddress: record.ipAddress,
        userAgent: record.userAgent,
        status: record.status,
        error: record.error,
        createdAtLabel: formatDateTime(record.createdAt),
    }));

    return (
        <AdminShell
            pageTitle="Audit Log"
            activePath="/settings/audit-log"
            userName={session.user.name ?? session.user.email ?? 'Admin User'}
            userRole={session.user.role}
        >
            <div className="admin-content-stack">
                <AuditLogTable items={items} />
            </div>
        </AdminShell>
    );
}
