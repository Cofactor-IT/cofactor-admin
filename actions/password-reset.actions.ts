'use server';

/**
 * password-reset.actions.ts
 *
 * Server Actions for forgot-password and reset-password flows.
 */

import { headers } from 'next/headers';
import {
    buildPasswordResetUrl,
    generatePasswordResetToken,
    getPasswordResetExpiry,
    hashPasswordResetToken,
} from '../lib/auth/passwordReset';
import { hashPassword } from '../lib/auth/password';
import {
    clearPasswordResetTokensForUser,
    completePasswordReset,
    createPasswordResetToken,
} from '../lib/database/queries/passwordResetTokens';
import { findPasswordResetCandidateByEmail } from '../lib/database/queries/users';
import { sendPasswordResetEmail } from '../lib/email/passwordReset';
import { AUDIT_ACTIONS, getAuditRequestContext, logAuditAction } from '../lib/security/audit-log';
import { RATE_LIMITS, checkRateLimit, getRequestIpAddress } from '../lib/security/rate-limit';
import { forgotPasswordSchema, resetPasswordSchema } from '../lib/validation/auth.schemas';
import { flattenValidationErrors, type ValidationFieldErrors } from '../lib/validation/result';

const GENERIC_RESET_REQUEST_MESSAGE =
    'If an account exists for that email, you will receive password reset instructions.';
const INVALID_RESET_TOKEN_MESSAGE = 'Reset link is invalid or expired.';
const RESET_SUCCESS_MESSAGE = 'Password updated. You can sign in now.';

export interface ForgotPasswordActionState {
    success: boolean;
    message: string;
    fieldErrors?: ValidationFieldErrors;
    devResetUrl?: string;
}

export interface ResetPasswordActionState {
    success: boolean;
    message: string;
    fieldErrors?: ValidationFieldErrors;
}

function shouldExposeDevResetUrl(): boolean {
    return (
        process.env.NODE_ENV !== 'production' && process.env.PASSWORD_RESET_DEV_SHOW_LINK === 'true'
    );
}

function buildInvalidFieldsState(fieldErrors: ValidationFieldErrors): ForgotPasswordActionState {
    return {
        success: false,
        message: 'Please fix the highlighted fields.',
        fieldErrors,
    };
}

function parseForgotPasswordFormData(formData: FormData): Record<string, unknown> {
    return { email: formData.get('email') };
}

function parseResetPasswordFormData(formData: FormData): Record<string, unknown> {
    return {
        token: formData.get('token'),
        password: formData.get('password'),
    };
}

function buildRateLimitState(retryAfterSeconds: number): ForgotPasswordActionState {
    const retryAfterMinutes = Math.ceil(retryAfterSeconds / 60);
    return {
        success: false,
        message: `Too many password reset attempts. Try again in ${retryAfterMinutes} minute${
            retryAfterMinutes === 1 ? '' : 's'
        }.`,
    };
}

async function issuePasswordResetToken(userId: string): Promise<{ resetUrl: string }> {
    const token = generatePasswordResetToken();
    const tokenHash = hashPasswordResetToken(token);
    const now = new Date();
    const expiresAt = getPasswordResetExpiry(now);

    await clearPasswordResetTokensForUser(userId);
    await createPasswordResetToken({ userId, tokenHash, expiresAt });

    return { resetUrl: buildPasswordResetUrl(token) };
}

/**
 * Issues password reset instructions for valid internal accounts.
 *
 * @param _prevState - Current form action state
 * @param formData - Forgot-password email payload
 * @returns Generic success response or field validation errors
 */
export async function requestPasswordReset(
    _prevState: ForgotPasswordActionState,
    formData: FormData
): Promise<ForgotPasswordActionState> {
    const parsed = forgotPasswordSchema.safeParse(parseForgotPasswordFormData(formData));
    if (!parsed.success) return buildInvalidFieldsState(flattenValidationErrors(parsed.error));

    const requestHeaders = await headers();
    const rateLimit = checkRateLimit({
        key: `password-reset:${getRequestIpAddress(requestHeaders)}:${parsed.data.email}`,
        config: RATE_LIMITS.PASSWORD_RESET,
    });
    if (!rateLimit.allowed) return buildRateLimitState(rateLimit.retryAfterSeconds ?? 0);

    const user = await findPasswordResetCandidateByEmail(parsed.data.email);
    if (!user || !user.isActive) return { success: true, message: GENERIC_RESET_REQUEST_MESSAGE };

    const { resetUrl } = await issuePasswordResetToken(user.id);
    await sendPasswordResetEmail({
        email: user.email,
        name: user.name,
        resetUrl,
    });
    const requestContext = await getAuditRequestContext();
    await logAuditAction({
        action: AUDIT_ACTIONS.PASSWORD_RESET_REQUESTED,
        resourceType: 'User',
        resourceId: user.id,
        userId: user.id,
        userEmail: user.email,
        changes: { email: user.email },
        ipAddress: requestContext.ipAddress,
        userAgent: requestContext.userAgent,
    });

    const state: ForgotPasswordActionState = {
        success: true,
        message: GENERIC_RESET_REQUEST_MESSAGE,
    };

    if (shouldExposeDevResetUrl()) state.devResetUrl = resetUrl;
    return state;
}

/**
 * Validates a reset token and replaces the account password hash.
 *
 * @param _prevState - Current reset form state
 * @param formData - Token and new password payload
 * @returns Success state when password changed, otherwise token/validation error
 */
export async function resetPassword(
    _prevState: ResetPasswordActionState,
    formData: FormData
): Promise<ResetPasswordActionState> {
    const parsed = resetPasswordSchema.safeParse(parseResetPasswordFormData(formData));
    if (!parsed.success) {
        return {
            success: false,
            message: 'Please fix the highlighted fields.',
            fieldErrors: flattenValidationErrors(parsed.error),
        };
    }

    const tokenHash = hashPasswordResetToken(parsed.data.token);
    const passwordHash = await hashPassword(parsed.data.password);
    const userId = await completePasswordReset({ tokenHash, passwordHash, now: new Date() });
    if (!userId) return { success: false, message: INVALID_RESET_TOKEN_MESSAGE };

    const requestContext = await getAuditRequestContext();
    await logAuditAction({
        action: AUDIT_ACTIONS.PASSWORD_RESET_COMPLETED,
        resourceType: 'User',
        resourceId: userId,
        userId,
        ipAddress: requestContext.ipAddress,
        userAgent: requestContext.userAgent,
    });

    return { success: true, message: RESET_SUCCESS_MESSAGE };
}
