/**
 * DashboardQuickActions.tsx
 *
 * Quick links for the most common Admin workflows.
 */

import Link from 'next/link';
import { Card } from '../ui/Card';

interface QuickAction {
    href: '/submissions' | '/pipeline' | '/crm' | '/templates';
    title: string;
    description: string;
    shortcut: string;
}

const QUICK_ACTIONS: QuickAction[] = [
    {
        href: '/submissions',
        title: 'Review next submission',
        description: 'Jump into the Scout queue and continue triage.',
        shortcut: 'G then S',
    },
    {
        href: '/pipeline',
        title: 'Create a deal',
        description: 'Move an active submission into the Admin pipeline.',
        shortcut: 'G then P',
    },
    {
        href: '/crm',
        title: 'Log an interaction',
        description: 'Capture a call, email, or meeting against a contact.',
        shortcut: 'G then C',
    },
    {
        href: '/templates',
        title: 'Compose from a template',
        description: 'Open reusable email copy for outreach or follow-up.',
        shortcut: 'G then T',
    },
];

/**
 * Renders the dashboard quick-actions card.
 *
 * @returns Card with common operational shortcuts
 */
export function DashboardQuickActions() {
    return (
        <Card className="admin-dashboard-module-card">
            <Card.Header className="admin-preview-header">
                <div className="admin-preview-heading">
                    <h3 className="m-0">Quick Actions</h3>
                    <p className="caption m-0">Frequent actions for the daily Admin flow.</p>
                </div>
            </Card.Header>
            <Card.Body>
                <div className="admin-preview-list">
                    {QUICK_ACTIONS.map((action) => (
                        <Link
                            key={action.title}
                            href={action.href}
                            className="admin-quick-action-item"
                        >
                            <div className="admin-preview-copy">
                                <h4 className="m-0">{action.title}</h4>
                                <p className="caption m-0">{action.description}</p>
                            </div>
                            <span className="admin-shortcut-badge">{action.shortcut}</span>
                        </Link>
                    ))}
                </div>
            </Card.Body>
        </Card>
    );
}
