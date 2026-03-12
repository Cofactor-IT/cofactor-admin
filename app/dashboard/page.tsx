/**
 * page.tsx
 *
 * Default authenticated landing route for Admin.
 */

import { AdminShell } from "../../components/shared/AdminShell"
import { WorkspacePlaceholder } from "../../components/shared/WorkspacePlaceholder"
import { requireAuthSession } from "../../lib/auth/session"

/**
 * Renders the default Admin dashboard workspace.
 *
 * @returns Protected dashboard placeholder page
 */
export default async function DashboardPage() {
  const session = await requireAuthSession()
  const userName = session.user.name ?? session.user.email ?? "Team Member"

  return (
    <AdminShell
      pageTitle="Dashboard"
      activePath="/dashboard"
      userName={userName}
      userRole={session.user.role}
    >
      <WorkspacePlaceholder
        title="Dashboard"
        description="Coming soon."
      />
    </AdminShell>
  )
}
