/**
 * page.tsx
 *
 * Compatibility redirect for legacy pipeline route.
 */

import { redirect } from 'next/navigation';

/**
 * Redirects legacy `/deal-pipeline` traffic to `/pipeline`.
 *
 * @returns Never returns; forwards to `/pipeline`
 */
export default function LegacyDealPipelinePage() {
    redirect('/pipeline');
}
