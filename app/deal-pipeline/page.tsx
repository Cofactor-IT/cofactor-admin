/**
 * page.tsx
 *
 * Deal Pipeline workspace placeholder page.
 */

import { AdminShell } from "../../components/shared/AdminShell"
import { WorkspacePlaceholder } from "../../components/shared/WorkspacePlaceholder"
import { requireAuthSession } from "../../lib/auth/session"

/**
 * Renders the Deal Pipeline workspace shell.
 *
 * @returns Protected placeholder page
 */
export default async function DealPipelinePage() {
  const session = await requireAuthSession()
  const userName = session.user.name ?? session.user.email ?? "Team Member"

  return (
    <AdminShell
      pageTitle="Deal Pipeline"
      activePath="/deal-pipeline"
      userName={userName}
      userRole={session.user.role}
    >
      <WorkspacePlaceholder
        title="Deal pipeline"
        description="Deal stage progression, ownership, and internal review workflow will appear in this workspace."
      />
    </AdminShell>
  )
}
