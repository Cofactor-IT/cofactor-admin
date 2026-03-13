/**
 * page.tsx
 *
 * Compatibility redirect for legacy templates route.
 */

import { redirect } from 'next/navigation';

/**
 * Redirects legacy `/email-templates` traffic to `/templates`.
 *
 * @returns Never returns; forwards to `/templates`
 */
export default function LegacyEmailTemplatesPage() {
    redirect('/templates');
}
