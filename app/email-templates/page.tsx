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
export default async function EmailTemplatesPage() {
  const session = await requireAuthSession()
  const userName = session.user.name ?? session.user.email ?? "Team Member"

  return (
    <AdminShell
      pageTitle="Email Templates"
      activePath="/email-templates"
      userName={userName}
      userRole={session.user.role}
    >
      <WorkspacePlaceholder
        title="Email templates"
        description="Reusable outreach and process templates will be managed from this workspace."
      />
    </AdminShell>
  )
}
