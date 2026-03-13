/**
 * auth.actions.test.ts
 *
 * Tests for signup server action behavior and security checks.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/headers', () => ({
    headers: vi.fn(),
}));

vi.mock('../lib/auth/password', () => ({
    hashPassword: vi.fn(),
}));

vi.mock('../lib/auth/permissions', () => ({
    requireIT: vi.fn(),
}));

vi.mock('../lib/database/queries/users', () => ({
    findUserByEmail: vi.fn(),
    createUser: vi.fn(),
}));

vi.mock('../lib/security/audit-log', () => ({
    AUDIT_ACTIONS: {
        USER_CREATED: 'USER_CREATED',
    },
    getAuditRequestContext: vi.fn(),
    logAuditAction: vi.fn(),
}));

vi.mock('../lib/security/rate-limit', () => ({
    RATE_LIMITS: {
        SIGN_UP: {
            max: 3,
            windowMs: 15 * 60 * 1000,
            lockDurationMs: 15 * 60 * 1000,
        },
    },
    checkRateLimit: vi.fn(),
    getRequestIpAddress: vi.fn(),
}));

import { signUp } from './auth.actions';
import { headers } from 'next/headers';
import { requireIT } from '../lib/auth/permissions';
import { hashPassword } from '../lib/auth/password';
import { getAuditRequestContext, logAuditAction } from '../lib/security/audit-log';
import { createUser, findUserByEmail } from '../lib/database/queries/users';
import { checkRateLimit, getRequestIpAddress } from '../lib/security/rate-limit';

function buildFormData(overrides: Partial<Record<string, string>> = {}) {
    const values = {
        name: 'Theis Admin',
        email: 'theis@cofactor.world',
        password: 'Cofactor123!',
        role: 'ANALYST',
        ...overrides,
    };

    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => formData.set(key, value));
    return formData;
}

describe('signUp', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(headers).mockResolvedValue({
            get: vi.fn().mockReturnValue('127.0.0.1'),
        } as never);
        vi.mocked(getRequestIpAddress).mockReturnValue('127.0.0.1');
        vi.mocked(checkRateLimit).mockReturnValue({
            allowed: true,
            remaining: 2,
            resetTime: Date.now() + 1000,
            locked: false,
        });
        vi.mocked(getAuditRequestContext).mockResolvedValue({
            ipAddress: '127.0.0.1',
            userAgent: 'Vitest',
        });
        vi.mocked(requireIT).mockResolvedValue({
            user: {
                id: 'it_user_1',
                email: 'it@cofactor.world',
                role: 'IT',
            },
        } as Awaited<ReturnType<typeof requireIT>>);
    });

    it('rejects non-cofactor domains before any DB query', async () => {
        const state = await signUp(
            { success: false },
            buildFormData({ email: 'outside@gmail.com' })
        );

        expect(state.success).toBe(false);
        expect(state.fieldErrors?.email?.[0]).toContain('@cofactor.world');
        expect(findUserByEmail).not.toHaveBeenCalled();
        expect(createUser).not.toHaveBeenCalled();
        expect(logAuditAction).not.toHaveBeenCalled();
        expect(hashPassword).not.toHaveBeenCalled();
    });

    it('rejects requests from non-IT users', async () => {
        vi.mocked(requireIT).mockRejectedValueOnce(new Error('Unauthorized'));
        const state = await signUp({ success: false }, buildFormData());

        expect(state.success).toBe(false);
        expect(state.message).toContain('Only IT users');
        expect(findUserByEmail).not.toHaveBeenCalled();
        expect(createUser).not.toHaveBeenCalled();
    });

    it('rejects requests that exceed the signup rate limit', async () => {
        vi.mocked(checkRateLimit).mockReturnValueOnce({
            allowed: false,
            remaining: 0,
            resetTime: Date.now() + 60_000,
            locked: true,
            retryAfterSeconds: 60,
        });

        const state = await signUp({ success: false }, buildFormData());

        expect(state.success).toBe(false);
        expect(state.message).toContain('Try again in 1 minute');
        expect(findUserByEmail).not.toHaveBeenCalled();
        expect(createUser).not.toHaveBeenCalled();
    });

    it('creates user and writes audit log for valid internal payload', async () => {
        vi.mocked(findUserByEmail).mockResolvedValue(null);
        vi.mocked(hashPassword).mockResolvedValue('hashed-password');
        vi.mocked(createUser).mockResolvedValue({
            id: 'user_1',
            name: 'Theis Admin',
            email: 'theis@cofactor.world',
            role: 'ANALYST',
            createdAt: new Date(),
        });

        const state = await signUp({ success: false }, buildFormData());

        expect(state.success).toBe(true);
        expect(findUserByEmail).toHaveBeenCalledWith('theis@cofactor.world');
        expect(createUser).toHaveBeenCalledWith({
            name: 'Theis Admin',
            email: 'theis@cofactor.world',
            passwordHash: 'hashed-password',
            role: 'ANALYST',
        });
        expect(logAuditAction).toHaveBeenCalledWith({
            action: 'USER_CREATED',
            resourceType: 'User',
            resourceId: 'user_1',
            userId: 'it_user_1',
            userEmail: 'it@cofactor.world',
            changes: {
                email: 'theis@cofactor.world',
                role: 'ANALYST',
            },
            ipAddress: '127.0.0.1',
            userAgent: 'Vitest',
        });
    });

    it('sanitizes stored account names before persistence', async () => {
        vi.mocked(findUserByEmail).mockResolvedValue(null);
        vi.mocked(hashPassword).mockResolvedValue('hashed-password');
        vi.mocked(createUser).mockResolvedValue({
            id: 'user_2',
            name: 'Theis Admin',
            email: 'theis@cofactor.world',
            role: 'ANALYST',
            createdAt: new Date(),
        });

        await signUp({ success: false }, buildFormData({ name: '<strong>Theis</strong> Admin' }));

        expect(createUser).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'Theis Admin',
            })
        );
    });
});
