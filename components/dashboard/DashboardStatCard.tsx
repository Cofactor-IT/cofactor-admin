/**
 * DashboardStatCard.tsx
 *
 * Card-first stat display for the Admin dashboard.
 */

import Link from 'next/link';
import type { DashboardStat } from '../../lib/database/queries/dashboard';
import { Card } from '../ui/Card';

/**
 * Renders a linked dashboard stat card.
 *
 * @param props - Dashboard stat metadata and target link
 * @returns Clickable stat card
 */
export function DashboardStatCard(props: DashboardStat) {
    const cardClassName =
        props.accent === 'primary'
            ? 'admin-dashboard-stat-card admin-dashboard-stat-card-primary'
            : 'admin-dashboard-stat-card';
    const valueClassName =
        props.accent === 'primary'
            ? 'admin-dashboard-stat-value admin-dashboard-stat-value-primary'
            : 'admin-dashboard-stat-value';

    return (
        <Link href={props.href} className="admin-dashboard-stat-link">
            <Card className={cardClassName}>
                <Card.Body>
                    <div className="admin-dashboard-stat-header">
                        <p className="caption m-0">{props.title}</p>
                        <span className="caption">{props.actionLabel}</span>
                    </div>
                    <div className={valueClassName}>{props.count}</div>
                    <p className="caption m-0">{props.secondaryLabel}</p>
                    <p className="admin-dashboard-stat-trend m-0">{props.trendLabel}</p>
                </Card.Body>
            </Card>
        </Link>
    );
}
