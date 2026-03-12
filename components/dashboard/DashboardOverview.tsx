/**
 * DashboardOverview.tsx
 *
 * Dashboard composition component for stat cards and recent activity.
 */

import type { DashboardActivityItem, DashboardStat } from "../../lib/database/queries/dashboard"
import { DashboardActivityFeed } from "./DashboardActivityFeed"
import { DashboardStatCard } from "./DashboardStatCard"

interface DashboardOverviewProps {
  stats: DashboardStat[]
  activity: DashboardActivityItem[]
}

/**
 * Renders the Admin dashboard overview content.
 *
 * @param props - Stat cards and recent activity items
 * @returns Dashboard overview layout
 */
export function DashboardOverview(props: DashboardOverviewProps) {
  return (
    <section className="admin-content-stack">
      <div className="admin-dashboard-grid">
        {props.stats.map((stat) => <DashboardStatCard key={stat.title} {...stat} />)}
      </div>
      <DashboardActivityFeed items={props.activity} />
    </section>
  )
}
