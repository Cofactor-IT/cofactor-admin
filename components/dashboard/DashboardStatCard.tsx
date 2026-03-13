/**
 * DashboardStatCard.tsx
 *
 * Card-first stat display for the Admin dashboard.
 */

import Link from "next/link"
import type { DashboardStat } from "../../lib/database/queries/dashboard"
import { Card } from "../ui/Card"

/**
 * Renders a linked dashboard stat card.
 *
 * @param props - Dashboard stat metadata and target link
 * @returns Clickable stat card
 */
export function DashboardStatCard(props: DashboardStat) {
  return (
    <Link href={props.href} className="admin-dashboard-stat-link">
      <Card className="admin-dashboard-stat-card">
        <Card.Body>
          <div className="admin-dashboard-stat-header">
            <p className="caption m-0">{props.title}</p>
            <span className="caption">Open</span>
          </div>
          <div className="admin-dashboard-stat-value">{props.count}</div>
          <p className="caption m-0">{props.secondaryLabel}</p>
        </Card.Body>
      </Card>
    </Link>
  )
}
