/**
 * page.tsx
 *
 * Tabbed Scouts workspace page.
 */

import { AdminShell } from '../../components/shared/AdminShell';
import { ScoutsWorkspace, type ScoutsTab } from '../../components/scouts/ScoutsWorkspace';
import { requireAuthSession } from '../../lib/auth/session';

interface ScoutsPageProps {
    searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

function getFirstParamValue(value: string | string[] | undefined): string | undefined {
    if (typeof value === 'string') return value;
    if (Array.isArray(value)) return value[0];
    return undefined;
}

function resolveScoutsTab(value: string | undefined): ScoutsTab {
    if (value === 'applications') return 'applications';
    return 'profiles';
}

/**
 * Renders the tabbed Scouts workspace shell.
 *
 * @returns Protected placeholder page
 */
export default async function ScoutsPage(props: ScoutsPageProps) {
    const session = await requireAuthSession();
    const userName = session.user.name ?? session.user.email ?? 'Team Member';
    const params = (await props.searchParams) ?? {};
    const activeTab = resolveScoutsTab(getFirstParamValue(params.tab));

    return (
        <AdminShell
            pageTitle="Scouts"
            activePath="/scouts"
            userName={userName}
            userRole={session.user.role}
        >
            <ScoutsWorkspace activeTab={activeTab} />
        </AdminShell>
    );
}
