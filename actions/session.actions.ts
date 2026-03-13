'use server';

/**
 * session.actions.ts
 *
 * Server Actions for session lifecycle events.
 */

import { requireAuthSession } from '../lib/auth/session';
import { AUDIT_ACTIONS, getAuditRequestContext, logAuditAction } from '../lib/security/audit-log';

/**
 * Logs a sign-out audit event while session context is still available.
 *
 * @returns Void once audit record is written
 */
export async function logSignOutAuditAction(): Promise<void> {
    const session = await requireAuthSession();
    const requestContext = await getAuditRequestContext();
    await logAuditAction({
        action: AUDIT_ACTIONS.USER_SIGN_OUT,
        resourceType: 'Session',
        resourceId: session.user.id,
        userId: session.user.id,
        userEmail: session.user.email ?? undefined,
        ipAddress: requestContext.ipAddress,
        userAgent: requestContext.userAgent,
    });
}
