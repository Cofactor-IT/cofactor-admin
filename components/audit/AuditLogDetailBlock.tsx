/**
 * AuditLogDetailBlock.tsx
 *
 * Reusable labeled detail block for expanded audit-log rows.
 */

import type { ReactNode } from 'react';

interface AuditLogDetailBlockProps {
    label: string;
    value: string;
    subvalue?: ReactNode;
    className?: string;
}

/**
 * Renders a single labeled audit detail block.
 *
 * @param props - Label, value, and optional supplemental content
 * @returns Detail block used inside expanded audit rows
 */
export function AuditLogDetailBlock(props: AuditLogDetailBlockProps) {
    return (
        <div className={`admin-audit-detail-block ${props.className ?? ''}`.trim()}>
            <span className="caption admin-audit-meta-label">{props.label}</span>
            <span className="body admin-audit-meta-value">{props.value}</span>
            {props.subvalue ? (
                <span className="caption admin-audit-detail-subvalue">{props.subvalue}</span>
            ) : null}
        </div>
    );
}
