/**
 * page.tsx
 *
 * Scouts workspace placeholder page.
 */

import { AdminShell } from '../../components/shared/AdminShell';
import { WorkspacePlaceholder } from '../../components/shared/WorkspacePlaceholder';
import { requireAuthSession } from '../../lib/auth/session';

/**
 * Renders the Scouts workspace shell.
 *
 * @returns Protected placeholder page
 */
export default async function ScoutsPage() {
    const session = await requireAuthSession();
    const userName = session.user.name ?? session.user.email ?? 'Team Member';

    return (
        <AdminShell
            pageTitle="Scout Profiles"
            activePath="/scouts"
            userName={userName}
            userRole={session.user.role}
        >
            <WorkspacePlaceholder title="Scout Profiles" description="Coming soon." />
        </AdminShell>
    );
}
