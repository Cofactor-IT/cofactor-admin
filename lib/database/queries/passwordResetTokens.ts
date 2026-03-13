/**
 * passwordResetTokens.ts
 *
 * Query functions for creating and consuming password reset tokens.
 */

import { adminDb } from '../adminDb';

interface CreatePasswordResetTokenParams {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
}

interface CompletePasswordResetParams {
    tokenHash: string;
    passwordHash: string;
    now: Date;
}

function assertPasswordResetModelAvailable() {
    const delegate = (adminDb as unknown as { passwordResetToken?: unknown }).passwordResetToken;
    if (delegate) return;

    throw new Error(
        'Password reset model is unavailable in the current Prisma client. Run `npx prisma migrate deploy`, run `npx prisma generate --no-engine`, then restart the Next.js dev server.'
    );
}

/**
 * Deletes outstanding reset tokens for a user before issuing a new one.
 *
 * @param userId - Target account identifier
 * @returns Number of deleted tokens
 */
export async function clearPasswordResetTokensForUser(userId: string): Promise<number> {
    assertPasswordResetModelAvailable();
    const result = await adminDb.passwordResetToken.deleteMany({
        where: { userId, usedAt: null },
    });
    return result.count;
}

/**
 * Stores a newly issued password reset token hash.
 *
 * @param params - Token persistence payload
 * @returns Created token identifier
 */
export async function createPasswordResetToken(
    params: CreatePasswordResetTokenParams
): Promise<string> {
    assertPasswordResetModelAvailable();
    const record = await adminDb.passwordResetToken.create({
        data: {
            userId: params.userId,
            tokenHash: params.tokenHash,
            expiresAt: params.expiresAt,
        },
        select: {
            id: true,
        },
    });
    return record.id;
}

/**
 * Updates account password when token is valid and marks token as consumed.
 *
 * @param params - Token hash and new password hash
 * @returns User id when reset succeeds, otherwise null
 */
export async function completePasswordReset(
    params: CompletePasswordResetParams
): Promise<string | null> {
    assertPasswordResetModelAvailable();
    const token = await adminDb.passwordResetToken.findFirst({
        where: {
            tokenHash: params.tokenHash,
            usedAt: null,
            expiresAt: { gt: params.now },
        },
        select: {
            id: true,
            userId: true,
        },
    });

    if (!token) return null;

    await adminDb.$transaction([
        adminDb.user.update({
            where: { id: token.userId },
            data: {
                passwordHash: params.passwordHash,
                failedLoginAttempts: 0,
                lockedUntil: null,
            },
        }),
        adminDb.passwordResetToken.update({
            where: { id: token.id },
            data: { usedAt: params.now },
        }),
        adminDb.passwordResetToken.deleteMany({
            where: {
                userId: token.userId,
                usedAt: null,
                id: { not: token.id },
            },
        }),
    ]);

    return token.userId;
}
