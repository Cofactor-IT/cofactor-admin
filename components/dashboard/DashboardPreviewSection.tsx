/**
 * DashboardPreviewSection.tsx
 *
 * Linked preview card for a dashboard module.
 */

import Link from "next/link"
import type { DashboardPreviewSection as DashboardPreviewSectionModel } from "../../lib/database/queries/dashboard"
import { Card } from "../ui/Card"

interface DashboardPreviewSectionProps {
  section: DashboardPreviewSectionModel
}

function emptyState(message: string) {
  return <p className="body m-0">{message}</p>
}

function itemList(items: DashboardPreviewSectionModel["items"]) {
  return (
    <div className="admin-preview-list">
      {items.map((item) => (
        <Link key={item.id} href={item.href} className="admin-preview-item">
          <div className="admin-preview-copy">
            <h4 className="m-0">{item.title}</h4>
            <p className="caption m-0">{item.meta}</p>
          </div>
          <span className="caption">{item.detail}</span>
        </Link>
      ))}
    </div>
  )
}

/**
 * Renders a dashboard module preview card.
 *
 * @param props - Preview section metadata and rows
 * @returns Linked preview card
 */
export function DashboardPreviewSection(props: DashboardPreviewSectionProps) {
  const { section } = props

  return (
    <Card>
      <Card.Header className="admin-preview-header">
        <div className="admin-preview-heading">
          <h3 className="m-0">{section.title}</h3>
          <p className="caption m-0">{section.description}</p>
        </div>
        <Link href={section.href} className="admin-inline-link">
          View all
        </Link>
      </Card.Header>
      <Card.Body>{section.items.length === 0 ? emptyState(section.emptyMessage) : itemList(section.items)}</Card.Body>
    </Card>
  )
}
