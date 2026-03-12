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
export default async function PipelinePage() {
  const session = await requireAuthSession()
  const userName = session.user.name ?? session.user.email ?? "Team Member"

  return (
    <AdminShell
      pageTitle="Deal Pipeline"
      activePath="/pipeline"
      userName={userName}
      userRole={session.user.role}
    >
      <WorkspacePlaceholder title="Deal Pipeline" description="Coming soon." />
    </AdminShell>
  )
}
