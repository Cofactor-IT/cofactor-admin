/**
 * page.tsx
 *
 * Compatibility redirect for legacy sign-in path.
 */

import { redirect } from 'next/navigation';

/**
 * Redirects legacy `/auth/signin` traffic to `/signin`.
 *
 * @returns Never returns; forwards to `/signin`
 */
export default function LegacySignInPage() {
    redirect('/signin');
}
