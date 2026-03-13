/**
 * AuditLogRow.tsx
 *
 * Expandable summary and detail row for the Admin audit-log table.
 */

import { AuditLogDetailBlock } from './AuditLogDetailBlock';
import { AuditLogStatusBadge } from './AuditLogStatusBadge';
import type { AuditLogTableItem } from './auditLog.types';
import {
    actorLabel,
    changeEntries,
    contextPreview,
    formatActionLabel,
    resourceSummaryLabel,
} from './auditLog.utils';

interface AuditLogRowProps {
    item: AuditLogTableItem;
}

/**
 * Renders one expandable audit-log row.
 *
 * @param props - Audit record mapped for display
 * @returns Summary row with expandable contextual details
 */
export function AuditLogRow(props: AuditLogRowProps) {
    const itemChanges = changeEntries(props.item.changes);

    return (
        <details className="admin-audit-item">
            <summary className="admin-audit-summary">
                <span className="caption admin-audit-summary-cell admin-audit-time">
                    {props.item.createdAtLabel}
                </span>
                <span className="body admin-audit-summary-cell admin-audit-actor">
                    {actorLabel(props.item)}
                </span>
                <span className="body admin-audit-summary-cell admin-audit-action">
                    {formatActionLabel(props.item.action)}
                </span>
                <span className="body admin-audit-summary-cell admin-audit-resource-summary">
                    {resourceSummaryLabel(props.item)}
                </span>
                <span className="admin-audit-summary-cell">
                    <AuditLogStatusBadge status={props.item.status} />
                </span>
                <span className="caption admin-audit-summary-cell admin-audit-context-preview">
                    {contextPreview(props.item)}
                </span>
            </summary>

            <div className="admin-audit-details">
                <div className="admin-audit-detail-grid">
                    <AuditLogDetailBlock
                        label="Actor"
                        value={actorLabel(props.item)}
                        subvalue={props.item.userEmail ?? undefined}
                    />

                    <AuditLogDetailBlock
                        label="Resource"
                        value={resourceSummaryLabel(props.item)}
                        subvalue={props.item.resourceId}
                    />

                    <AuditLogDetailBlock
                        label="Request"
                        value={props.item.ipAddress ?? 'No IP recorded'}
                        subvalue={
                            <span className="admin-audit-context-full">
                                {props.item.userAgent ?? 'No user agent recorded'}
                            </span>
                        }
                    />
                </div>

                {itemChanges.length > 0 ? (
                    <div className="admin-audit-change-list">
                        {itemChanges.map((entry) => (
                            <AuditLogDetailBlock
                                key={`${props.item.id}-${entry.label}`}
                                label={entry.label}
                                value={entry.value}
                                className="admin-audit-change-item"
                            />
                        ))}
                    </div>
                ) : null}
            </div>
        </details>
    );
}
