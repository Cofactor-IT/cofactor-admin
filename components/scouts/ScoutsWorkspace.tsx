/**
 * ScoutsWorkspace.tsx
 *
 * Tabbed Scouts workspace for applications and approved scout profiles.
 */

import Link from 'next/link';
import { Card } from '../ui/Card';

export type ScoutsTab = 'applications' | 'profiles';

interface ScoutsWorkspaceProps {
    activeTab: ScoutsTab;
}

interface ScoutsTabDefinition {
    id: ScoutsTab;
    label: string;
    href: '/scouts?tab=applications' | '/scouts?tab=profiles';
    title: string;
    description: string;
}

const SCOUTS_TABS: ScoutsTabDefinition[] = [
    {
        id: 'applications',
        label: 'Applications',
        href: '/scouts?tab=applications',
        title: 'Scout Applications',
        description: 'Incoming scout requests waiting for review, approval, or rejection.',
    },
    {
        id: 'profiles',
        label: 'Profiles',
        href: '/scouts?tab=profiles',
        title: 'Scout Profiles',
        description: 'Approved scouts, their track record, and long-term scout context.',
    },
];

function tabClassName(isActive: boolean): string {
    if (isActive) return 'admin-tab-link admin-tab-link-active';
    return 'admin-tab-link';
}

function activeTabCopy(activeTab: ScoutsTab): ScoutsTabDefinition {
    if (activeTab === 'applications') return SCOUTS_TABS[0];
    return SCOUTS_TABS[1];
}

/**
 * Renders the tabbed Scouts workspace shell.
 *
 * @param props - Currently selected Scouts tab
 * @returns Tab layout and placeholder panel for the selected Scouts domain view
 */
export function ScoutsWorkspace(props: ScoutsWorkspaceProps) {
    const activeTab = activeTabCopy(props.activeTab);

    return (
        <section className="admin-content-stack">
            <Card>
                <Card.Header className="admin-tab-card-header">
                    <div className="admin-tab-list" role="tablist" aria-label="Scouts views">
                        {SCOUTS_TABS.map((tab) => {
                            const isActive = tab.id === props.activeTab;

                            return (
                                <Link
                                    key={tab.id}
                                    href={tab.href}
                                    className={tabClassName(isActive)}
                                    role="tab"
                                    aria-selected={isActive}
                                >
                                    {tab.label}
                                </Link>
                            );
                        })}
                    </div>
                </Card.Header>
                <Card.Body className="admin-tab-panel">
                    <div className="admin-content-stack gap-[12px]">
                        <div>
                            <h3 className="m-0">{activeTab.title}</h3>
                            <p className="body mt-[12px] mb-0">{activeTab.description}</p>
                        </div>
                        <p className="caption m-0 text-admin-secondary">
                            Coming soon. This tab split is now the canonical Scouts information
                            architecture for Admin.
                        </p>
                    </div>
                </Card.Body>
            </Card>
        </section>
    );
}
