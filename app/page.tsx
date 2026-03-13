/**
 * page.tsx
 *
 * Redirects authenticated root traffic to the primary Admin workspace.
 */

import { redirect } from 'next/navigation';

/**
 * Redirects the root route to dashboard.
 *
 * @returns Never returns; forwards to `/dashboard`
 */
export default function HomePage() {
    redirect('/dashboard');
}
