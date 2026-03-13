/**
 * password-reset.actions.test.ts
 *
 * Tests for forgot-password and reset-password server actions.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/headers', () => ({
    headers: vi.fn(),
}));

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

vi.mock('../lib/security/audit-log', () => ({
    AUDIT_ACTIONS: {
        PASSWORD_RESET_REQUESTED: 'PASSWORD_RESET_REQUESTED',
        PASSWORD_RESET_COMPLETED: 'PASSWORD_RESET_COMPLETED',
    },
    getAuditRequestContext: vi.fn(),
    logAuditAction: vi.fn(),
}));

vi.mock('../lib/email/passwordReset', () => ({
    sendPasswordResetEmail: vi.fn(),
}));

vi.mock('../lib/security/rate-limit', () => ({
    RATE_LIMITS: {
        PASSWORD_RESET: {
            max: 3,
            windowMs: 60 * 60 * 1000,
            lockDurationMs: 60 * 60 * 1000,
        },
    },
    checkRateLimit: vi.fn(),
    getRequestIpAddress: vi.fn(),
}));

import { requestPasswordReset, resetPassword } from './password-reset.actions';
import { headers } from 'next/headers';
import { hashPassword } from '../lib/auth/password';
import {
    buildPasswordResetUrl,
    generatePasswordResetToken,
    getPasswordResetExpiry,
    hashPasswordResetToken,
} from '../lib/auth/passwordReset';
import { getAuditRequestContext, logAuditAction } from '../lib/security/audit-log';
import { sendPasswordResetEmail } from '../lib/email/passwordReset';
import {
    clearPasswordResetTokensForUser,
    completePasswordReset,
    createPasswordResetToken,
} from '../lib/database/queries/passwordResetTokens';
import { findPasswordResetCandidateByEmail } from '../lib/database/queries/users';
import { checkRateLimit, getRequestIpAddress } from '../lib/security/rate-limit';

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

    it('blocks repeated requests when the password reset limit is exceeded', async () => {
        vi.mocked(checkRateLimit).mockReturnValueOnce({
            allowed: false,
            remaining: 0,
            resetTime: Date.now() + 60_000,
            locked: true,
            retryAfterSeconds: 60,
        });

        const state = await requestPasswordReset(
            { success: false, message: '' },
            buildForgotFormData('user@cofactor.world')
        );

        expect(state.success).toBe(false);
        expect(state.message).toContain('Try again in 1 minute');
        expect(findPasswordResetCandidateByEmail).not.toHaveBeenCalled();
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
            userId: 'user_1',
            userEmail: 'nf@cofactor.world',
            changes: { email: 'nf@cofactor.world' },
            ipAddress: '127.0.0.1',
            userAgent: 'Vitest',
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
        vi.mocked(getAuditRequestContext).mockResolvedValue({
            ipAddress: '127.0.0.1',
            userAgent: 'Vitest',
        });
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
            userId: 'user_1',
            ipAddress: '127.0.0.1',
            userAgent: 'Vitest',
        });
    });
});
