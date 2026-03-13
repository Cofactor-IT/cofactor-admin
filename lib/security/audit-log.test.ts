/**
 * audit-log.test.ts
 *
 * Tests for shared audit logging helpers.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/headers', () => ({
    headers: vi.fn(),
}));

vi.mock('../database/queries/auditLogs', () => ({
    createAuditLogEntry: vi.fn(),
}));

import { headers } from 'next/headers';
import { createAuditLogEntry } from '../database/queries/auditLogs';
import { AUDIT_ACTIONS, getAuditRequestContext, logAuditAction } from './audit-log';

describe('logAuditAction', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('persists audit entries with the provided payload', async () => {
        await logAuditAction({
            userId: 'user_1',
            userEmail: 'nf@cofactor.world',
            action: AUDIT_ACTIONS.USER_CREATED,
            resourceType: 'User',
            resourceId: 'user_2',
            status: 'SUCCESS',
        });

        expect(createAuditLogEntry).toHaveBeenCalledWith({
            userId: 'user_1',
            userEmail: 'nf@cofactor.world',
            action: AUDIT_ACTIONS.USER_CREATED,
            resourceType: 'User',
            resourceId: 'user_2',
            changes: undefined,
            ipAddress: undefined,
            userAgent: undefined,
            status: 'SUCCESS',
            error: undefined,
        });
    });

    it('swallows persistence failures so main actions are not blocked', async () => {
        vi.mocked(createAuditLogEntry).mockRejectedValueOnce(new Error('db down'));
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

        await expect(
            logAuditAction({
                action: AUDIT_ACTIONS.USER_SIGN_OUT,
                resourceType: 'Session',
                resourceId: 'user_1',
            })
        ).resolves.toBeUndefined();

        expect(errorSpy).toHaveBeenCalled();
    });
});

describe('getAuditRequestContext', () => {
    it('returns request ip and user-agent metadata when headers are present', async () => {
        vi.mocked(headers).mockResolvedValue({
            get(name: string) {
                if (name === 'x-forwarded-for') return '127.0.0.1, 10.0.0.2';
                if (name === 'user-agent') return 'Vitest';
                return null;
            },
        } as never);

        await expect(getAuditRequestContext()).resolves.toEqual({
            ipAddress: '127.0.0.1',
            userAgent: 'Vitest',
        });
    });
});
