/**
 * page.tsx
 *
 * Scout Profiles workspace placeholder page.
 */

import { AdminShell } from "../../components/shared/AdminShell"
import { WorkspacePlaceholder } from "../../components/shared/WorkspacePlaceholder"
import { requireAuthSession } from "../../lib/auth/session"

/**
 * Renders the Scout Profiles workspace shell.
 *
 * @returns Protected placeholder page
 */
export default async function ScoutProfilesPage() {
  const session = await requireAuthSession()
  const userName = session.user.name ?? session.user.email ?? "Team Member"

  return (
    <AdminShell
      pageTitle="Scout Profiles"
      activePath="/scout-profiles"
      userName={userName}
      userRole={session.user.role}
    >
      <WorkspacePlaceholder
        title="Scout profile operations"
        description="Profile review, enrichment, and scout relationship management will live in this workspace."
      />
    </AdminShell>
  )
}
