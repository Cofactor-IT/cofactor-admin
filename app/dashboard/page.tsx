/**
 * page.tsx
 *
 * Default authenticated landing route for Admin.
 */

import { AdminShell } from "../../components/shared/AdminShell"
import { DashboardOverview } from "../../components/dashboard/DashboardOverview"
import {
  findDashboardPreviewSections,
  findDashboardStats,
  findRecentDashboardActivity,
} from "../../lib/database/queries/dashboard"
import { requireAuthSession } from "../../lib/auth/session"

export const dynamic = "force-dynamic"

/**
 * Renders the default Admin dashboard with live counts and activity.
 *
 * @returns Protected dashboard page
 */
export default async function DashboardPage() {
  const session = await requireAuthSession()
  const userName = session.user.name ?? session.user.email ?? "Team Member"
  const [stats, previews, activity] = await Promise.all([
    findDashboardStats(),
    findDashboardPreviewSections(),
    findRecentDashboardActivity(),
  ])

  return (
    <AdminShell
      pageTitle="Dashboard"
      activePath="/dashboard"
      userName={userName}
      userRole={session.user.role}
    >
      <DashboardOverview stats={stats} previews={previews} activity={activity} />
    </AdminShell>
  )
}
