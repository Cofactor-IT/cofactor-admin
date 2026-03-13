'use server';

/**
 * session.actions.ts
 *
 * Server Actions for session lifecycle events.
 */

import { requireAuthSession } from '../lib/auth/session';
import { logAuditAction } from '../lib/database/queries/auditLogs';

/**
 * Logs a sign-out audit event while session context is still available.
 *
 * @returns Void once audit record is written
 */
export async function logSignOutAuditAction(): Promise<void> {
    const session = await requireAuthSession();
    await logAuditAction({
        action: 'USER_SIGN_OUT',
        resourceType: 'Session',
        resourceId: session.user.id,
        userId: session.user.id,
    });
}
