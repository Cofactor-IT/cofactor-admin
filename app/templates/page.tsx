/**
 * page.tsx
 *
 * Email Templates workspace placeholder page.
 */

import { AdminShell } from "../../components/shared/AdminShell"
import { WorkspacePlaceholder } from "../../components/shared/WorkspacePlaceholder"
import { requireAuthSession } from "../../lib/auth/session"

/**
 * Renders the Email Templates workspace shell.
 *
 * @returns Protected placeholder page
 */
export default async function TemplatesPage() {
  const session = await requireAuthSession()
  const userName = session.user.name ?? session.user.email ?? "Team Member"

  return (
    <AdminShell
      pageTitle="Email Templates"
      activePath="/templates"
      userName={userName}
      userRole={session.user.role}
    >
      <WorkspacePlaceholder title="Email Templates" description="Coming soon." />
    </AdminShell>
  )
}
