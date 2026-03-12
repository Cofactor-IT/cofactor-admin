/**
 * page.tsx
 *
 * CRM workspace placeholder page.
 */

import { AdminShell } from "../../components/shared/AdminShell"
import { WorkspacePlaceholder } from "../../components/shared/WorkspacePlaceholder"
import { requireAuthSession } from "../../lib/auth/session"

/**
 * Renders the CRM workspace shell.
 *
 * @returns Protected placeholder page
 */
export default async function CrmPage() {
  const session = await requireAuthSession()
  const userName = session.user.name ?? session.user.email ?? "Team Member"

  return (
    <AdminShell
      pageTitle="CRM"
      activePath="/crm"
      userName={userName}
      userRole={session.user.role}
    >
      <WorkspacePlaceholder title="CRM" description="Coming soon." />
    </AdminShell>
  )
}
