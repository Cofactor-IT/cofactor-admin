/**
 * auth.schemas.test.ts
 *
 * Tests for auth validation schemas.
 */

import { describe, expect, it } from 'vitest';
import {
    changePasswordSchema,
    createAccountSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    signInSchema,
    signUpSchema,
} from './auth.schemas';
import {
    cofactorEmailSchema,
    emailSchema,
    idSchema,
    nameSchema,
    paginationSchema,
    passwordSchema,
} from './base.schemas';

describe('base schemas', () => {
    it('normalizes valid email addresses', () => {
        const result = emailSchema.parse('  NF@Cofactor.World ');

        expect(result).toBe('nf@cofactor.world');
    });

    it('rejects non-cofactor internal emails', () => {
        const result = cofactorEmailSchema.safeParse('outside@example.com');

        expect(result.success).toBe(false);
    });

    it('requires strong passwords', () => {
        const result = passwordSchema.safeParse('weak-password');

        expect(result.success).toBe(false);
    });

    it('validates names, ids and pagination primitives', () => {
        expect(nameSchema.parse(' Ahmed Aizi ')).toBe('Ahmed Aizi');
        expect(idSchema.safeParse('not-a-cuid').success).toBe(false);
        expect(paginationSchema.parse({ page: '2', limit: '10' })).toEqual({ page: 2, limit: 10 });
    });
});

describe('signUpSchema', () => {
    it('accepts @cofactor.world emails', () => {
        const result = signUpSchema.safeParse({
            name: 'Ahmed Aizi',
            email: 'ahmed@cofactor.world',
            password: 'Cofactor123!',
            role: 'ANALYST',
        });

        expect(result.success).toBe(true);
    });

    it('rejects non-cofactor domains', () => {
        const result = signUpSchema.safeParse({
            name: 'External User',
            email: 'user@gmail.com',
            password: 'Cofactor123!',
            role: 'IT',
        });

        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.flatten().fieldErrors.email?.[0]).toContain('@cofactor.world');
        }
    });
});

describe('signInSchema', () => {
    it('rejects non-cofactor sign-in domains', () => {
        const result = signInSchema.safeParse({
            email: 'someone@example.com',
            password: 'password',
        });

        expect(result.success).toBe(false);
    });
});

describe('forgotPasswordSchema', () => {
    it('accepts valid cofactor email', () => {
        const result = forgotPasswordSchema.safeParse({
            email: 'ops@cofactor.world',
        });

        expect(result.success).toBe(true);
    });
});

describe('resetPasswordSchema', () => {
    it('requires token and strong password', () => {
        const result = resetPasswordSchema.safeParse({
            token: 'short-token',
            password: 'weak',
        });

        expect(result.success).toBe(false);
    });
});

describe('createAccountSchema', () => {
    it('matches signup validation rules', () => {
        const result = createAccountSchema.safeParse({
            name: 'Ops Admin',
            email: 'ops@cofactor.world',
            password: 'Cofactor123!',
            role: 'IT',
        });

        expect(result.success).toBe(true);
    });
});

describe('changePasswordSchema', () => {
    it('rejects mismatched password confirmation', () => {
        const result = changePasswordSchema.safeParse({
            currentPassword: 'Current123!',
            newPassword: 'NewPassword123!',
            confirmPassword: 'WrongPassword123!',
        });

        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.flatten().fieldErrors.confirmPassword?.[0]).toBe(
                'Passwords do not match'
            );
        }
    });
});
