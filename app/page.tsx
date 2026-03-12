/**
 * page.tsx
 *
 * Placeholder home page to keep build/lint/type-check healthy
 * while feature pages are implemented.
 */

import Image from "next/image"
import { AdminShell } from "../components/shared/AdminShell"
import { requireAuthSession } from "../lib/auth/session"

export default async function HomePage() {
  const session = await requireAuthSession()
  const userName = session.user.name ?? session.user.email ?? "Team Member"

  return (
    <AdminShell
      pageTitle="Home"
      activePath="/"
      userName={userName}
      userRole={session.user.role}
    >
      <section className="admin-content-stack">
        <Image
          src="/branding/cofactor-admin-placeholder-navbar-logo.png"
          alt="Cofactor Admin placeholder navbar logo from Scout"
          width={220}
          height={46}
          priority
        />
        <h1>Cofactor Admin</h1>
        <p className="body">CI/CD baseline is configured.</p>
        <Image
          src="/branding/cofactor-admin-placeholder-hero-logo.png"
          alt="Cofactor Admin placeholder hero logo from Scout"
          width={420}
          height={88}
          className="mt-4"
        />
      </section>
    </AdminShell>
  )
}
