/**
 * DashboardOverview.tsx
 *
 * Dashboard composition component for stat cards, previews, and recent activity.
 */

import type {
  DashboardActivityItem,
  DashboardPreviewSection as DashboardPreviewSectionModel,
  DashboardStat,
} from "../../lib/database/queries/dashboard"
import { DashboardActivityFeed } from "./DashboardActivityFeed"
import { DashboardPreviewSection } from "./DashboardPreviewSection"
import { DashboardStatCard } from "./DashboardStatCard"

interface DashboardOverviewProps {
  stats: DashboardStat[]
  previews: DashboardPreviewSectionModel[]
  activity: DashboardActivityItem[]
}

/**
 * Renders the Admin dashboard overview content.
 *
 * @param props - Stat cards, preview sections, and recent activity items
 * @returns Dashboard overview layout
 */
export function DashboardOverview(props: DashboardOverviewProps) {
  return (
    <section className="admin-content-stack">
      <div className="admin-dashboard-grid">
        {props.stats.map((stat) => <DashboardStatCard key={stat.title} {...stat} />)}
      </div>
      <div className="admin-dashboard-preview-grid">
        {props.previews.map((section) => <DashboardPreviewSection key={section.title} section={section} />)}
      </div>
      <DashboardActivityFeed items={props.activity} />
    </section>
  )
}
