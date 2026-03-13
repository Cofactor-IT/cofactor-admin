/**
 * DashboardEmptyState.tsx
 *
 * Reusable empty state block for dashboard cards.
 */

import Link from "next/link"

interface DashboardEmptyStateProps {
  icon: "submission" | "deal" | "scout" | "activity"
  title: string
  message: string
  href: string
  actionLabel: string
}

function emptyStateIcon(icon: DashboardEmptyStateProps["icon"]) {
  if (icon === "submission") {
    return (
      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="admin-dashboard-empty-svg">
        <path d="M5.5 3.5h6l3 3v10h-9Z" stroke="currentColor" strokeWidth="1.6" />
        <path d="M11.5 3.5v3h3" stroke="currentColor" strokeWidth="1.6" />
        <path d="M7.25 10h5.5M7.25 13h5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    )
  }

  if (icon === "deal") {
    return (
      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="admin-dashboard-empty-svg">
        <rect x="3.5" y="4.5" width="4" height="11" rx="1" stroke="currentColor" strokeWidth="1.6" />
        <rect x="8.5" y="7" width="3" height="8.5" rx="1" stroke="currentColor" strokeWidth="1.6" />
        <rect x="12.5" y="9.5" width="4" height="6" rx="1" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    )
  }

  if (icon === "scout") {
    return (
      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="admin-dashboard-empty-svg">
        <path d="M6.75 9.25a2.75 2.75 0 1 0 0-5.5 2.75 2.75 0 0 0 0 5.5ZM13.5 8a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z" stroke="currentColor" strokeWidth="1.6" />
        <path d="M2.75 15.75a4 4 0 0 1 8 0M11 15.75a3 3 0 0 1 6 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="admin-dashboard-empty-svg">
      <circle cx="10" cy="10" r="6.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10 6.75v3.5M10 13.25h.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

/**
 * Renders a compact dashboard empty state with a linked recovery action.
 *
 * @param props - Empty state copy and destination link
 * @returns Dashboard empty state block
 */
export function DashboardEmptyState(props: DashboardEmptyStateProps) {
  return (
    <div className="admin-dashboard-empty-state">
      <div className="admin-dashboard-empty-icon" aria-hidden="true">
        {emptyStateIcon(props.icon)}
      </div>
      <div className="admin-dashboard-empty-copy">
        <h4 className="m-0">{props.title}</h4>
        <p className="body m-0">{props.message}</p>
      </div>
      <Link href={props.href} className="admin-dashboard-empty-action admin-button-secondary button">
        {props.actionLabel}
      </Link>
    </div>
  )
}
