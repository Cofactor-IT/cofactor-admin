/**
 * page.tsx
 *
 * Placeholder home page to keep build/lint/type-check healthy
 * while feature pages are implemented.
 */

import Image from "next/image"

export default function HomePage() {
  return (
    <main className="admin-shell">
      <section className="admin-page-content">
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
          style={{ marginTop: "16px" }}
        />
      </section>
    </main>
  )
}
