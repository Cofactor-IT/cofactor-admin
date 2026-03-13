/**
 * password-reset.actions.test.ts
 *
 * Tests for forgot-password and reset-password server actions.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../lib/database/queries/users', () => ({
    findPasswordResetCandidateByEmail: vi.fn(),
}));

vi.mock('../lib/database/queries/passwordResetTokens', () => ({
    clearPasswordResetTokensForUser: vi.fn(),
    createPasswordResetToken: vi.fn(),
    completePasswordReset: vi.fn(),
}));

vi.mock('../lib/auth/passwordReset', () => ({
    generatePasswordResetToken: vi.fn(),
    hashPasswordResetToken: vi.fn(),
    getPasswordResetExpiry: vi.fn(),
    buildPasswordResetUrl: vi.fn(),
}));

vi.mock('../lib/auth/password', () => ({
    hashPassword: vi.fn(),
}));

vi.mock('../lib/database/queries/auditLogs', () => ({
    logAuditAction: vi.fn(),
}));

vi.mock('../lib/email/passwordReset', () => ({
    sendPasswordResetEmail: vi.fn(),
}));

import { requestPasswordReset, resetPassword } from './password-reset.actions';
import { hashPassword } from '../lib/auth/password';
import {
    buildPasswordResetUrl,
    generatePasswordResetToken,
    getPasswordResetExpiry,
    hashPasswordResetToken,
} from '../lib/auth/passwordReset';
import { logAuditAction } from '../lib/database/queries/auditLogs';
import { sendPasswordResetEmail } from '../lib/email/passwordReset';
import {
    clearPasswordResetTokensForUser,
    completePasswordReset,
    createPasswordResetToken,
} from '../lib/database/queries/passwordResetTokens';
import { findPasswordResetCandidateByEmail } from '../lib/database/queries/users';

function buildForgotFormData(email: string) {
    const formData = new FormData();
    formData.set('email', email);
    return formData;
}

function buildResetFormData(token: string, password: string) {
    const formData = new FormData();
    formData.set('token', token);
    formData.set('password', password);
    return formData;
}

describe('requestPasswordReset', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        delete process.env.PASSWORD_RESET_DEV_SHOW_LINK;
        vi.mocked(findPasswordResetCandidateByEmail).mockResolvedValue(null);
    });

    it('rejects invalid email before DB queries', async () => {
        const state = await requestPasswordReset(
            { success: false, message: '' },
            buildForgotFormData('wrong@gmail.com')
        );

        expect(state.success).toBe(false);
        expect(state.fieldErrors?.email?.[0]).toContain('@cofactor.world');
        expect(findPasswordResetCandidateByEmail).not.toHaveBeenCalled();
    });

    it('returns generic success for unknown account', async () => {
        const state = await requestPasswordReset(
            { success: false, message: '' },
            buildForgotFormData('user@cofactor.world')
        );

        expect(state.success).toBe(true);
        expect(state.message).toContain('If an account exists');
        expect(createPasswordResetToken).not.toHaveBeenCalled();
    });

    it('issues token for active account and logs audit', async () => {
        vi.mocked(findPasswordResetCandidateByEmail).mockResolvedValue({
            id: 'user_1',
            name: 'NF',
            email: 'nf@cofactor.world',
            isActive: true,
        });
        vi.mocked(generatePasswordResetToken).mockReturnValue('raw-token');
        vi.mocked(hashPasswordResetToken).mockReturnValue('token-hash');
        vi.mocked(getPasswordResetExpiry).mockReturnValue(new Date('2026-03-12T10:00:00.000Z'));
        vi.mocked(buildPasswordResetUrl).mockReturnValue(
            'http://localhost:3000/auth/reset-password?token=raw-token'
        );
        process.env.PASSWORD_RESET_DEV_SHOW_LINK = 'true';

        const state = await requestPasswordReset(
            { success: false, message: '' },
            buildForgotFormData('nf@cofactor.world')
        );

        expect(state.success).toBe(true);
        expect(clearPasswordResetTokensForUser).toHaveBeenCalledWith('user_1');
        expect(createPasswordResetToken).toHaveBeenCalledWith({
            userId: 'user_1',
            tokenHash: 'token-hash',
            expiresAt: new Date('2026-03-12T10:00:00.000Z'),
        });
        expect(logAuditAction).toHaveBeenCalledWith({
            action: 'PASSWORD_RESET_REQUESTED',
            resourceType: 'User',
            resourceId: 'user_1',
            changes: { email: 'nf@cofactor.world' },
        });
        expect(sendPasswordResetEmail).toHaveBeenCalledWith({
            email: 'nf@cofactor.world',
            name: 'NF',
            resetUrl: 'http://localhost:3000/auth/reset-password?token=raw-token',
        });
        expect(state.devResetUrl).toContain('/auth/reset-password');
    });
});

describe('resetPassword', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns token error when token cannot be consumed', async () => {
        vi.mocked(hashPassword).mockResolvedValue('new-hash');
        vi.mocked(hashPasswordResetToken).mockReturnValue('token-hash');
        vi.mocked(completePasswordReset).mockResolvedValue(null);

        const state = await resetPassword(
            { success: false, message: '' },
            buildResetFormData('a'.repeat(64), 'NewSecurePass123!')
        );

        expect(state.success).toBe(false);
        expect(state.message).toContain('invalid or expired');
    });

    it('updates password and writes audit on success', async () => {
        vi.mocked(hashPassword).mockResolvedValue('new-hash');
        vi.mocked(hashPasswordResetToken).mockReturnValue('token-hash');
        vi.mocked(completePasswordReset).mockResolvedValue('user_1');

        const state = await resetPassword(
            { success: false, message: '' },
            buildResetFormData('b'.repeat(64), 'NewSecurePass123!')
        );

        expect(state.success).toBe(true);
        expect(logAuditAction).toHaveBeenCalledWith({
            action: 'PASSWORD_RESET_COMPLETED',
            resourceType: 'User',
            resourceId: 'user_1',
        });
    });
});
