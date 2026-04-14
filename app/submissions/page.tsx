/**
 * page.tsx
 *
 * Protected Scout submissions queue for authenticated Admin users.
 */

import { AdminShell } from '../../components/shared/AdminShell';
import { SubmissionQueue } from '../../components/submissions/SubmissionQueue';
import { requireAuthSession } from '../../lib/auth/session';
import { findScoutSubmissionQueue } from '../../lib/database/queries/submissions';

export const dynamic = 'force-dynamic';

interface SubmissionsPageProps {
    searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

function requestedPage(searchParams: Record<string, string | string[] | undefined>): number {
    const rawPage = Array.isArray(searchParams.page) ? searchParams.page[0] : searchParams.page;
    const pageNumber = Number(rawPage);
    if (!Number.isFinite(pageNumber) || pageNumber < 1) return 1;
    return Math.trunc(pageNumber);
}

/**
 * Renders the live Scout submissions queue for authenticated Admin users.
 *
 * @param props - Route search params for queue pagination
 * @returns Protected submissions queue workspace
 */
export default async function SubmissionsPage(props: SubmissionsPageProps) {
    const [session, resolvedSearchParams] = await Promise.all([
        requireAuthSession(),
        props.searchParams ?? Promise.resolve({}),
    ]);
    const userName = session.user.name ?? session.user.email ?? 'Team Member';
    const queue = await findScoutSubmissionQueue({
        page: requestedPage(resolvedSearchParams),
    });

    return (
        <AdminShell
            pageTitle="Submissions"
            activePath="/submissions"
            userName={userName}
            userRole={session.user.role}
        >
            <SubmissionQueue queue={queue} />
        </AdminShell>
    );
}
