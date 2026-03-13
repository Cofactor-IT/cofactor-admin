'use server';

/**
 * auth.actions.ts
 *
 * Server Actions for account creation and auth-adjacent workflows.
 */

import { requireIT } from '../lib/auth/permissions';
import { hashPassword } from '../lib/auth/password';
import { createUser, findUserByEmail } from '../lib/database/queries/users';
import { AUDIT_ACTIONS, getAuditRequestContext, logAuditAction } from '../lib/security/audit-log';
import { RATE_LIMITS, checkRateLimit, getRequestIpAddress } from '../lib/security/rate-limit';
import { sanitizePlainText } from '../lib/security/sanitization';
import { signUpSchema, type SignUpInput } from '../lib/validation/auth.schemas';
import { flattenValidationErrors, type ValidationFieldErrors } from '../lib/validation/result';
import { headers } from 'next/headers';

export interface SignUpActionState {
    success: boolean;
    message?: string;
    fieldErrors?: ValidationFieldErrors;
}

function parseSignUpFormData(formData: FormData): Record<string, unknown> {
    return {
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
        role: formData.get('role'),
    };
}

function buildValidationErrorState(fieldErrors: ValidationFieldErrors): SignUpActionState {
    return {
        success: false,
        message: 'Please fix the highlighted fields.',
        fieldErrors,
    };
}

function buildExistingEmailState(): SignUpActionState {
    return {
        success: false,
        message: 'Email already in use.',
        fieldErrors: {
            email: ['Email already in use'],
        },
    };
}

function buildUnauthorizedState(): SignUpActionState {
    return {
        success: false,
        message: 'Only IT users can create new accounts.',
    };
}

function buildRateLimitState(retryAfterSeconds: number): SignUpActionState {
    const retryAfterMinutes = Math.ceil(retryAfterSeconds / 60);
    return {
        success: false,
        message: `Too many account creation attempts. Try again in ${retryAfterMinutes} minute${
            retryAfterMinutes === 1 ? '' : 's'
        }.`,
    };
}

async function createValidatedUser(data: SignUpInput) {
    const passwordHash = await hashPassword(data.password);
    const sanitizedName = sanitizePlainText(data.name);

    return createUser({
        name: sanitizedName,
        email: data.email.toLowerCase().trim(),
        passwordHash,
        role: data.role,
    });
}

async function writeUserCreatedAudit(
    userId: string,
    email: string,
    role: 'ANALYST' | 'IT',
    actorId: string,
    actorEmail?: string | null
) {
    const requestContext = await getAuditRequestContext();
    await logAuditAction({
        action: AUDIT_ACTIONS.USER_CREATED,
        resourceType: 'User',
        resourceId: userId,
        userId: actorId,
        userEmail: actorEmail ?? undefined,
        changes: {
            email,
            role,
        },
        ipAddress: requestContext.ipAddress,
        userAgent: requestContext.userAgent,
    });
}

/**
 * Creates a new Admin user account with strict domain-restricted validation.
 *
 * @param _prevState - Current form action state
 * @param formData - Form payload from signup UI
 * @returns Action state containing success or validation errors
 */
export async function signUp(
    _prevState: SignUpActionState,
    formData: FormData
): Promise<SignUpActionState> {
    const actorSession = await requireIT().catch(() => null);
    if (!actorSession) return buildUnauthorizedState();

    const validated = signUpSchema.safeParse(parseSignUpFormData(formData));
    if (!validated.success) {
        return buildValidationErrorState(flattenValidationErrors(validated.error));
    }

    const normalizedEmail = validated.data.email.toLowerCase().trim();
    const requestHeaders = await headers();
    const rateLimit = checkRateLimit({
        key: `signup:${getRequestIpAddress(requestHeaders)}:${normalizedEmail}`,
        config: RATE_LIMITS.SIGN_UP,
    });
    if (!rateLimit.allowed) {
        return buildRateLimitState(rateLimit.retryAfterSeconds ?? 0);
    }

    const existingUser = await findUserByEmail(normalizedEmail);
    if (existingUser) {
        return buildExistingEmailState();
    }

    const createdUser = await createValidatedUser(validated.data);
    await writeUserCreatedAudit(
        createdUser.id,
        createdUser.email,
        createdUser.role,
        actorSession.user.id,
        actorSession.user.email
    );

    return {
        success: true,
        message: 'Account created successfully.',
    };
}
