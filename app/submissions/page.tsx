/**
 * page.tsx
 *
 * Placeholder submissions page for authenticated Admin users.
 */

import { requireAuthSession } from "../../lib/auth/session"
import { AdminShell } from "../../components/shared/AdminShell"

export default async function SubmissionsPage() {
  const session = await requireAuthSession()
  const userName = session.user.name ?? session.user.email ?? "Team Member"

  return (
    <AdminShell
      pageTitle="Submissions"
      activePath="/submissions"
      userName={userName}
      userRole={session.user.role}
    >
      <section className="admin-content-stack">
        <h1>Submissions</h1>
        <p className="body-large">Signed in successfully. Submissions workspace is loading next.</p>
        <div className="admin-card p-6">
          <p className="body m-0">Admin surface styles are active globally.</p>
        </div>
      </section>
    </AdminShell>
  )
}
