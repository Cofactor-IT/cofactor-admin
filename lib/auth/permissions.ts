/**
 * permissions.ts
 *
 * Role-based permission guards for server actions and pages.
 */

import { getCurrentSession } from './session';

const UNAUTHORIZED_ERROR = 'Unauthorized';

/**
 * Ensures the active session belongs to an IT operator.
 *
 * @returns Authenticated IT session
 * @throws {Error} When session is missing or role is not IT
 */
export async function requireIT() {
    const session = await getCurrentSession();
    if (!session?.user?.id || session.user.role !== 'IT') {
        throw new Error(UNAUTHORIZED_ERROR);
    }

    return session;
}

/**
 * Ensures the active session has analyst-level access.
 *
 * @returns Authenticated session for ANALYST or IT users
 */
export async function requireAnalyst() {
    const session = await getCurrentSession();
    if (!session?.user?.id) {
        throw new Error(UNAUTHORIZED_ERROR);
    }

    return session;
}
