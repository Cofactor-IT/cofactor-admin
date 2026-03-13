/**
 * DashboardOverview.tsx
 *
 * Dashboard composition component for stat cards, previews, and recent activity.
 */

import type {
    DashboardActivityItem,
    DashboardPreviewSection as DashboardPreviewSectionModel,
    DashboardStat,
} from '../../lib/database/queries/dashboard';
import { DashboardActivityFeed } from './DashboardActivityFeed';
import { DashboardPreviewSection } from './DashboardPreviewSection';
import { DashboardQuickActions } from './DashboardQuickActions';
import { DashboardStatCard } from './DashboardStatCard';

interface DashboardOverviewProps {
    greeting: string;
    stats: DashboardStat[];
    previews: DashboardPreviewSectionModel[];
    activity: DashboardActivityItem[];
}

/**
 * Renders the Admin dashboard overview content.
 *
 * @param props - Stat cards, preview sections, and recent activity items
 * @returns Dashboard overview layout
 */
export function DashboardOverview(props: DashboardOverviewProps) {
    const [submissionSection, dealSection, scoutSection] = props.previews;

    return (
        <section className="admin-content-stack admin-dashboard-shell">
            <div className="admin-dashboard-intro">
                <p className="body-large m-0">{props.greeting}</p>
            </div>
            <div className="admin-dashboard-grid">
                {props.stats.map((stat) => (
                    <DashboardStatCard key={stat.title} {...stat} />
                ))}
            </div>
            <div className="admin-dashboard-feature-row">
                {submissionSection ? (
                    <DashboardPreviewSection
                        section={submissionSection}
                        className="admin-dashboard-card-tall admin-dashboard-primary-panel"
                    />
                ) : null}
                <DashboardActivityFeed
                    items={props.activity}
                    className="admin-dashboard-card-tall"
                />
            </div>
            <div className="admin-dashboard-supporting-row">
                {dealSection ? <DashboardPreviewSection section={dealSection} /> : null}
                {scoutSection ? <DashboardPreviewSection section={scoutSection} /> : null}
                <DashboardQuickActions />
            </div>
        </section>
    );
}
