/**
 * auth.actions.test.ts
 *
 * Tests for signup server action behavior and security checks.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

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

vi.mock('../lib/database/queries/auditLogs', () => ({
    logAuditAction: vi.fn(),
}));

import { signUp } from './auth.actions';
import { requireIT } from '../lib/auth/permissions';
import { hashPassword } from '../lib/auth/password';
import { logAuditAction } from '../lib/database/queries/auditLogs';
import { createUser, findUserByEmail } from '../lib/database/queries/users';

function buildFormData(overrides: Partial<Record<string, string>> = {}) {
    const values = {
        name: 'Theis Admin',
        email: 'theis@cofactor.world',
        password: 'strong-password-123',
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
        vi.mocked(requireIT).mockResolvedValue({
            user: {
                id: 'it_user_1',
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
            changes: {
                email: 'theis@cofactor.world',
                role: 'ANALYST',
            },
        });
    });
});
