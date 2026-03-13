/**
 * page.tsx
 *
 * Compatibility redirect for legacy scout profiles route.
 */

import { redirect } from 'next/navigation';

/**
 * Redirects legacy `/scout-profiles` traffic to `/scouts`.
 *
 * @returns Never returns; forwards to `/scouts`
 */
export default function LegacyScoutProfilesPage() {
    redirect('/scouts');
}
