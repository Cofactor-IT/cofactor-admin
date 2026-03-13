/**
 * AuditLogTable.tsx
 *
 * Read-only Admin audit log table for IT operators.
 */

import { AuditLogRow } from './AuditLogRow';
import type { AuditLogTableItem } from './auditLog.types';

interface AuditLogTableProps {
    items: AuditLogTableItem[];
}

/**
 * Renders the read-only audit trail table.
 *
 * @param props - Mapped audit log entries for Admin review
 * @returns Audit log table with expandable detail rows
 */
export function AuditLogTable(props: AuditLogTableProps) {
    if (props.items.length === 0) {
        return (
            <div className="admin-card admin-audit-table-card">
                <div className="admin-card-body admin-audit-feed-body">
                    <p className="body m-0">No audit entries recorded yet.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-card admin-audit-table-card">
            <div className="admin-card-body admin-audit-feed-body">
                <div className="admin-audit-table-scroll">
                    <div className="admin-audit-table-head">
                        <span className="caption">Timestamp</span>
                        <span className="caption">Actor</span>
                        <span className="caption">Operation</span>
                        <span className="caption">Resource</span>
                        <span className="caption">Status</span>
                        <span className="caption">Context</span>
                    </div>

                    <div className="admin-audit-list">
                        {props.items.map((item) => (
                            <AuditLogRow key={item.id} item={item} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
