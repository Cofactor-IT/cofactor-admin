/**
 * DashboardActivityFeed.tsx
 *
 * Recent submission and deal activity feed for the Admin dashboard.
 */

import Link from "next/link"
import type { DashboardActivityItem } from "../../lib/database/queries/dashboard"
import { Card } from "../ui/Card"

interface DashboardActivityFeedProps {
  items: DashboardActivityItem[]
  className?: string
}

function emptyActivityState() {
  return (
    <p className="body m-0">
      No dashboard activity yet. Submission and deal updates will appear here as Admin actions are recorded.
    </p>
  )
}

function activityList(items: DashboardActivityItem[]) {
  return (
    <div className="admin-activity-list">
      {items.map((item) => (
        <Link key={item.id} href={item.href} className="admin-activity-item">
          <div className="admin-activity-copy">
            <h4 className="m-0">{item.title}</h4>
            <p className="caption m-0">{item.description}</p>
          </div>
          <div className="admin-activity-meta">
            <span className="caption">{item.changedBy}</span>
            <span className="caption">{item.changedAt}</span>
          </div>
        </Link>
      ))}
    </div>
  )
}

/**
 * Renders the dashboard recent activity feed card.
 *
 * @param props - Recent activity items for the dashboard
 * @returns Activity feed card with empty state fallback
 */
export function DashboardActivityFeed(props: DashboardActivityFeedProps) {
  const cardClassName = props.className ? `admin-dashboard-module-card ${props.className}` : "admin-dashboard-module-card"
  return (
    <Card className={cardClassName}>
      <Card.Header>
        <h3 className="m-0">Recent Activity</h3>
      </Card.Header>
      <Card.Body>{props.items.length === 0 ? emptyActivityState() : activityList(props.items)}</Card.Body>
    </Card>
  )
}
