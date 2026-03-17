/**
 * permissions.ts
 *
 * Role-based permission guards for server actions and pages.
 *
 * Role hierarchy (ascending): ANALYST < IT < IT_ADMIN
 * The gdprDelegate flag grants additive GDPR view access regardless of role.
 */

import { getCurrentSession } from './session';

// ============================================
// CONSTANTS
// ============================================

const UNAUTHORIZED_ERROR = 'Unauthorized';

// ============================================
// HELPERS
// ============================================

function isITOrAbove(role: string | undefined): boolean {
    return role === 'IT' || role === 'IT_ADMIN';
}

// ============================================
// GUARDS
// ============================================

/**
 * Ensures the active session belongs to any authenticated user.
 *
 * @returns Authenticated session for ANALYST, IT, or IT_ADMIN users
 * @throws {Error} When session is missing
 */
export async function requireAnalyst() {
    const session = await getCurrentSession();
    if (!session?.user?.id) {
        throw new Error(UNAUTHORIZED_ERROR);
    }

    return session;
}

/**
 * Ensures the active session belongs to an IT operator or above.
 *
 * @returns Authenticated session for IT or IT_ADMIN users
 * @throws {Error} When session is missing or role is below IT
 */
export async function requireIT() {
    const session = await getCurrentSession();
    if (!session?.user?.id || !isITOrAbove(session.user.role)) {
        throw new Error(UNAUTHORIZED_ERROR);
    }

    return session;
}

/**
 * Ensures the active session belongs to an IT_ADMIN.
 *
 * @returns Authenticated IT_ADMIN session
 * @throws {Error} When session is missing or role is not IT_ADMIN
 */
export async function requireITAdmin() {
    const session = await getCurrentSession();
    if (!session?.user?.id || session.user.role !== 'IT_ADMIN') {
        throw new Error(UNAUTHORIZED_ERROR);
    }

    return session;
}

/**
 * Ensures the user can view the GDPR dashboard and logs.
 * Access is granted to IT and above, or any user with the GDPR delegate flag.
 *
 * @returns Authenticated session with GDPR view access
 * @throws {Error} When session is missing or user lacks GDPR access
 */
export async function requireGdprView() {
    const session = await getCurrentSession();
    const hasAccess = isITOrAbove(session?.user?.role) || session?.user?.gdprDelegate === true;

    if (!session?.user?.id || !hasAccess) {
        throw new Error(UNAUTHORIZED_ERROR);
    }

    return session;
}
