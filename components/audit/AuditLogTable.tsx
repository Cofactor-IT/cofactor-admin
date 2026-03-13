/**
 * AuditLogTable.tsx
 *
 * Read-only Admin audit log table for IT operators.
 */

interface AuditLogTableItem {
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
    createdAtLabel: string;
}

interface AuditLogTableProps {
    items: AuditLogTableItem[];
}

function actorLabel(item: AuditLogTableItem): string {
    return item.actorName ?? item.userEmail ?? 'System';
}

/**
 * Renders the read-only audit trail table.
 *
 * @param props - Mapped audit log rows for Admin review
 * @returns Audit log data table with empty state
 */
export function AuditLogTable(props: AuditLogTableProps) {
    if (props.items.length === 0) {
        return (
            <div className="admin-card">
                <div className="admin-card-header">
                    <h3 className="m-0">Audit Log</h3>
                    <p className="body m-0">
                        Tracked Admin security and workflow events will appear here.
                    </p>
                </div>
                <div className="admin-card-body">
                    <p className="body m-0">No audit entries recorded yet.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-card">
            <div className="admin-card-header">
                <h3 className="m-0">Audit Log</h3>
                <p className="body m-0">Most recent Admin security and workflow events.</p>
            </div>
            <div className="admin-card-body p-0">
                <table className="admin-table w-full border-collapse">
                    <thead>
                        <tr className="admin-table-row">
                            <th className="admin-table-cell">When</th>
                            <th className="admin-table-cell">Actor</th>
                            <th className="admin-table-cell">Action</th>
                            <th className="admin-table-cell">Resource</th>
                            <th className="admin-table-cell">Status</th>
                            <th className="admin-table-cell">Context</th>
                        </tr>
                    </thead>
                    <tbody>
                        {props.items.map((item) => (
                            <tr key={item.id} className="admin-table-row">
                                <td className="admin-table-cell">{item.createdAtLabel}</td>
                                <td className="admin-table-cell">{actorLabel(item)}</td>
                                <td className="admin-table-cell">{item.action}</td>
                                <td className="admin-table-cell">
                                    {item.resourceType} - {item.resourceId}
                                </td>
                                <td className="admin-table-cell">{item.status}</td>
                                <td className="admin-table-cell">
                                    {item.error ??
                                        item.ipAddress ??
                                        item.userAgent ??
                                        'No extra context'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
