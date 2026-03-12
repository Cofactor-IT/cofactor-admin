/**
 * AdminShell.tsx
 *
 * Shared authenticated page shell with sidebar and page header.
 */

import Link from "next/link"
import type { ReactNode } from "react"
import { SignOutButton } from "./SignOutButton"

interface AdminShellProps {
  pageTitle: string
  activePath: "/" | "/submissions" | "/auth/signup"
  userName: string
  userRole: "ANALYST" | "IT"
  children: ReactNode
}

function navItemClass(isActive: boolean): string {
  if (isActive) return "admin-nav-item admin-nav-item-active"
  return "admin-nav-item"
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
        <div className="h-[64px] flex items-center px-[24px] border-b border-[var(--admin-border)]">
          <span className="h4 m-0">Cofactor Admin</span>
        </div>

        <nav className="flex-1 px-[12px] py-[16px] flex flex-col gap-[4px]">
          <Link href="/" className={navItemClass(props.activePath === "/")}>
            Home
          </Link>
          <Link href="/submissions" className={navItemClass(props.activePath === "/submissions")}>
            Submissions
          </Link>
          {props.userRole === "IT" ? (
            <Link href="/auth/signup" className={navItemClass(props.activePath === "/auth/signup")}>
              Team members
            </Link>
          ) : null}
        </nav>

        <div className="border-t border-[var(--admin-border)] p-[16px] flex flex-col gap-[10px]">
          <span className="caption">
            {props.userName} - {props.userRole}
          </span>
          <SignOutButton />
        </div>
      </aside>

      <div className="admin-page">
        <header className="admin-page-header">
          <h2 className="m-0">{props.pageTitle}</h2>
        </header>
        <section className="admin-page-content">{props.children}</section>
      </div>
    </main>
  )
}
