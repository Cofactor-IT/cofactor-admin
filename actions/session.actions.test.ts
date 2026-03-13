/**
 * session.actions.test.ts
 *
 * Tests for session lifecycle server actions.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../lib/auth/session', () => ({
    requireAuthSession: vi.fn(),
}));

vi.mock('../lib/security/audit-log', () => ({
    AUDIT_ACTIONS: {
        USER_SIGN_OUT: 'USER_SIGN_OUT',
    },
    getAuditRequestContext: vi.fn(),
    logAuditAction: vi.fn(),
}));

import { requireAuthSession } from '../lib/auth/session';
import { getAuditRequestContext, logAuditAction } from '../lib/security/audit-log';
import { logSignOutAuditAction } from './session.actions';

describe('logSignOutAuditAction', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(getAuditRequestContext).mockResolvedValue({
            ipAddress: '127.0.0.1',
            userAgent: 'Vitest',
        });
    });

    it('writes USER_SIGN_OUT audit record with active user id', async () => {
        vi.mocked(requireAuthSession).mockResolvedValue({
            user: { id: 'user_1', email: 'nf@cofactor.world' },
        } as Awaited<ReturnType<typeof requireAuthSession>>);

        await logSignOutAuditAction();

        expect(logAuditAction).toHaveBeenCalledWith({
            action: 'USER_SIGN_OUT',
            resourceType: 'Session',
            resourceId: 'user_1',
            userId: 'user_1',
            userEmail: 'nf@cofactor.world',
            ipAddress: '127.0.0.1',
            userAgent: 'Vitest',
        });
    });
});
