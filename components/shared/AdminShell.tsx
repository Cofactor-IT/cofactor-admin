/**
 * AdminShell.tsx
 *
 * Shared authenticated page shell with fixed Admin sidebar and page header.
 */

import Image from "next/image"
import Link from "next/link"
import type { ReactNode } from "react"
import { SignOutButton } from "./SignOutButton"

type AdminRoute =
  | "/submissions"
  | "/scouts"
  | "/crm"
  | "/pipeline"
  | "/templates"
  | "/auth/signup"

interface AdminShellProps {
  pageTitle: string
  activePath: AdminRoute
  userName: string
  userRole: "ANALYST" | "IT"
  pageActions?: ReactNode
  children: ReactNode
}

interface NavItemDefinition {
  href: Exclude<AdminRoute, "/auth/signup">
  label: string
}

const NAV_ITEMS: NavItemDefinition[] = [
  { href: "/submissions", label: "Submissions" },
  { href: "/scouts", label: "Scout Profiles" },
  { href: "/crm", label: "CRM" },
  { href: "/pipeline", label: "Deal Pipeline" },
  { href: "/templates", label: "Email Templates" },
]

function navItemClass(isActive: boolean): string {
  if (isActive) return "admin-nav-item admin-nav-item-active"
  return "admin-nav-item"
}

function navIconClassName(isActive: boolean): string {
  if (isActive) return "admin-nav-icon text-[var(--white)]"
  return "admin-nav-icon text-[var(--admin-text-secondary)]"
}

function FileStackIcon(props: { isActive: boolean }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={navIconClassName(props.isActive)}>
      <path d="M5.5 3.5h6l3 3v10h-9Z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M11.5 3.5v3h3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7.25 10h5.5M7.25 13h5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function UsersIcon(props: { isActive: boolean }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={navIconClassName(props.isActive)}>
      <path d="M6.75 9.25a2.75 2.75 0 1 0 0-5.5 2.75 2.75 0 0 0 0 5.5ZM13.5 8a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M2.75 15.75a4 4 0 0 1 8 0M11 15.75a3 3 0 0 1 6 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function ContactCardIcon(props: { isActive: boolean }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={navIconClassName(props.isActive)}>
      <rect x="3.5" y="4.5" width="13" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M6.5 9.25h7M6.5 12h4.5M7.75 7.25a1 1 0 1 1 0-.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function PipelineIcon(props: { isActive: boolean }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={navIconClassName(props.isActive)}>
      <rect x="3.5" y="4.5" width="4" height="11" rx="1" stroke="currentColor" strokeWidth="1.6" />
      <rect x="8.5" y="7" width="3" height="8.5" rx="1" stroke="currentColor" strokeWidth="1.6" />
      <rect x="12.5" y="9.5" width="4" height="6" rx="1" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

function MailTemplateIcon(props: { isActive: boolean }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={navIconClassName(props.isActive)}>
      <rect x="3.5" y="5" width="13" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="m4.75 6.5 5.25 4 5.25-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function navIcon(href: NavItemDefinition["href"], isActive: boolean): ReactNode {
  if (href === "/submissions") return <FileStackIcon isActive={isActive} />
  if (href === "/scouts") return <UsersIcon isActive={isActive} />
  if (href === "/crm") return <ContactCardIcon isActive={isActive} />
  if (href === "/pipeline") return <PipelineIcon isActive={isActive} />
  return <MailTemplateIcon isActive={isActive} />
}

/**
 * Renders the shared Admin shell used on protected routes.
 *
 * @param props - Shell title, active route, identity and page content
 * @returns Sidebar + page content layout
 */
export function AdminShell(props: AdminShellProps) {
  return (
    <main className="admin-root">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <Image
            src="/branding/cofactor-admin-placeholder-navbar-logo.png"
            alt="Cofactor Admin wordmark"
            width={148}
            height={31}
            priority
          />
        </div>

        <nav className="flex-1 px-[12px] py-[16px] flex flex-col gap-[4px]">
          {NAV_ITEMS.map((item) => {
            const isActive = props.activePath === item.href
            return (
              <Link key={item.href} href={item.href} className={navItemClass(isActive)}>
                {navIcon(item.href, isActive)}
                <span className="label text-inherit">{item.label}</span>
              </Link>
            )
          })}
          {props.userRole === "IT" ? (
            <Link href="/auth/signup" className="admin-sidebar-utility-link">
              <span className="caption">Manage team members</span>
            </Link>
          ) : null}
        </nav>

        <div className="px-[16px] pb-[12px]">
          <SignOutButton />
        </div>
        <div className="admin-sidebar-userbar">
          <span className="caption">
            {props.userName} - {props.userRole}
          </span>
        </div>
      </aside>

      <div className="admin-page ml-[240px]">
        <header className="admin-page-header px-[32px]">
          <h2 className="m-0">{props.pageTitle}</h2>
          <div className="admin-page-actions">{props.pageActions}</div>
        </header>
        <section className="admin-page-content px-[32px] py-[24px]">{props.children}</section>
      </div>
    </main>
  )
}
