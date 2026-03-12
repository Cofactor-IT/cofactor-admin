/**
 * page.tsx
 *
 * IT-only signup page for creating internal Admin team accounts.
 */

import { AdminShell } from "../../../components/shared/AdminShell"
import { requireIT } from "../../../lib/auth/permissions"
import { SignUpForm } from "./SignUpForm"

/**
 * Renders IT-only signup page inside authenticated Admin shell.
 *
 * @returns Sign-up page with shared sidebar and account form
 */
export default async function SignUpPage() {
  const session = await requireIT()
  const userName = session.user.name ?? session.user.email ?? "Team Member"

  return (
    <AdminShell
      pageTitle="Admin Sign Up"
      activePath="/auth/signup"
      userName={userName}
      userRole={session.user.role}
    >
      <section className="admin-auth-content">
        <SignUpForm />
      </section>
    </AdminShell>
  )
}
