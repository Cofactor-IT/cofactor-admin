/**
 * page.tsx
 *
 * IT-only audit log review page.
 */

import { AuditLogTable } from '../../../components/audit/AuditLogTable';
import { AuditLogFilters } from '../../../components/audit/AuditLogFilters';
import { AdminShell } from '../../../components/shared/AdminShell';
import { requireIT } from '../../../lib/auth/permissions';
import {
    findAuditLogActorOptions,
    findRecentAuditLogs,
} from '../../../lib/database/queries/auditLogs';

type AuditLogStatusFilter = 'ALL' | 'SUCCESS' | 'FAILURE';
type AuditLogContextFilter = 'ALL' | 'ERRORS' | 'REQUEST' | 'EMPTY';

interface AuditLogPageProps {
    searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

function getFirstParamValue(value: string | string[] | undefined): string | undefined {
    if (typeof value === 'string') return value;
    if (Array.isArray(value)) return value[0];
    return undefined;
}

function getStatusFilter(value: string | undefined): AuditLogStatusFilter {
    if (value === 'SUCCESS' || value === 'FAILURE') return value;
    return 'ALL';
}

function getContextFilter(value: string | undefined): AuditLogContextFilter {
    if (value === 'ERRORS' || value === 'REQUEST' || value === 'EMPTY') return value;
    return 'ALL';
}

function startOfDay(value: string): Date | undefined {
    if (!value) return undefined;
    return new Date(`${value}T00:00:00.000`);
}

function endOfDay(value: string): Date | undefined {
    if (!value) return undefined;
    return new Date(`${value}T23:59:59.999`);
}

function formatDateTime(value: Date): string {
    return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(value);
}

/**
 * Renders the IT-only audit log page.
 *
 * @param props - Route search params for query and status filtering
 * @returns Read-only audit history for recent Admin events
 */
export default async function AuditLogPage(props: AuditLogPageProps) {
    const session = await requireIT();
    const params = (await props.searchParams) ?? {};
    const actor = getFirstParamValue(params.actor) ?? '';
    const status = getStatusFilter(getFirstParamValue(params.status));
    const context = getContextFilter(getFirstParamValue(params.context));
    const from = getFirstParamValue(params.from) ?? '';
    const to = getFirstParamValue(params.to) ?? '';
    const actorOptions = await findAuditLogActorOptions();
    const records = await findRecentAuditLogs({
        actor,
        status,
        context,
        from: startOfDay(from),
        to: endOfDay(to),
    });

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
        changes: record.changes ?? null,
        createdAtLabel: formatDateTime(record.createdAt),
    }));

    return (
        <AdminShell
            pageTitle="Audit Log"
            activePath="/settings/audit-log"
            userName={session.user.name ?? session.user.email ?? 'Admin User'}
            userRole={session.user.role}
        >
            <div className="admin-content-stack admin-audit-page">
                <AuditLogFilters
                    initialActor={actor}
                    initialStatus={status}
                    initialContext={context}
                    initialFrom={from}
                    initialTo={to}
                    actorOptions={actorOptions}
                />
                <div className="admin-audit-table-shell">
                    <AuditLogTable items={items} />
                </div>
            </div>
        </AdminShell>
    );
}
