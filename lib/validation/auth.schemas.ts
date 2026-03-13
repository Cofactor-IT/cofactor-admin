/**
 * auth.schemas.ts
 *
 * Zod schemas for auth-related validation.
 */

import { z } from 'zod';
import { cofactorEmailSchema, nameSchema, passwordSchema } from './base.schemas';

export const signUpSchema = z.object({
    name: nameSchema,
    email: cofactorEmailSchema,
    password: passwordSchema,
    role: z.enum(['ANALYST', 'IT']),
});

export const signInSchema = z.object({
    email: cofactorEmailSchema,
    password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
    email: cofactorEmailSchema,
});

export const resetPasswordSchema = z.object({
    token: z.string().min(32, 'Reset token is invalid'),
    password: passwordSchema,
});

export const createAccountSchema = signUpSchema;

export const changePasswordSchema = z
    .object({
        currentPassword: z.string().min(1, 'Current password is required'),
        newPassword: passwordSchema,
        confirmPassword: z.string().min(1, 'Please confirm your new password'),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    });

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
