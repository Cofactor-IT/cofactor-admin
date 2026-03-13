/**
 * page.tsx
 *
 * Submissions workspace placeholder page for authenticated Admin users.
 */

import { requireAuthSession } from '../../lib/auth/session';
import { AdminShell } from '../../components/shared/AdminShell';
import { WorkspacePlaceholder } from '../../components/shared/WorkspacePlaceholder';

export default async function SubmissionsPage() {
    const session = await requireAuthSession();
    const userName = session.user.name ?? session.user.email ?? 'Team Member';

    return (
        <AdminShell
            pageTitle="Submissions"
            activePath="/submissions"
            userName={userName}
            userRole={session.user.role}
        >
            <WorkspacePlaceholder title="Submissions" description="Coming soon." />
        </AdminShell>
    );
}
