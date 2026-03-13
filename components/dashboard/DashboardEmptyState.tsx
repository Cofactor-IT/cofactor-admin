/**
 * DashboardEmptyState.tsx
 *
 * Reusable empty state block for dashboard cards.
 */

import Link from "next/link"

interface DashboardEmptyStateProps {
  iconLabel: string
  title: string
  message: string
  href: string
  actionLabel: string
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
        {props.iconLabel}
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
