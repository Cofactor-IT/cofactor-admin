/**
 * users.ts
 *
 * User query functions for account lookup and creation.
 */

import { adminDb } from '../adminDb';

interface CreateUserParams {
    name: string;
    email: string;
    passwordHash: string;
    role: 'ANALYST' | 'IT';
}

interface UpdateFailedLoginAttemptsParams {
    userId: string;
    failedLoginAttempts: number;
    lockedUntil: Date | null;
}

interface AuthUserRecord {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    role: 'ANALYST' | 'IT';
    isActive: boolean;
    failedLoginAttempts: number;
    lockedUntil: Date | null;
}

interface PasswordResetCandidateRecord {
    id: string;
    name: string;
    email: string;
    isActive: boolean;
}

interface LastVisitRecord {
    lastVisitAt: Date | null;
}

/**
 * Finds a user by normalized email.
 *
 * @param email - Email address to look up
 * @returns Minimal user record if found, otherwise null
 */
export async function findUserByEmail(email: string) {
    return adminDb.user.findUnique({
        where: {
            email: email.toLowerCase(),
        },
        select: {
            id: true,
            email: true,
            role: true,
        },
    });
}

/**
 * Finds user security/auth fields required during credential sign-in.
 *
 * @param email - Email address used for authentication
 * @returns Auth user record or null when not found
 */
export async function findAuthUserByEmail(email: string): Promise<AuthUserRecord | null> {
    return adminDb.user.findUnique({
        where: {
            email: email.toLowerCase(),
        },
        select: {
            id: true,
            name: true,
            email: true,
            passwordHash: true,
            role: true,
            isActive: true,
            failedLoginAttempts: true,
            lockedUntil: true,
        },
    });
}

/**
 * Finds active account metadata used during password reset request flow.
 *
 * @param email - Email address requesting reset
 * @returns Candidate record including active status or null
 */
export async function findPasswordResetCandidateByEmail(
    email: string
): Promise<PasswordResetCandidateRecord | null> {
    return adminDb.user.findUnique({
        where: {
            email: email.toLowerCase(),
        },
        select: {
            id: true,
            name: true,
            email: true,
            isActive: true,
        },
    });
}

/**
 * Creates a new Admin user account.
 *
 * @param params - User creation payload
 * @returns Newly created user record without password hash
 */
export async function createUser(params: CreateUserParams) {
    return adminDb.user.create({
        data: {
            name: params.name,
            email: params.email.toLowerCase(),
            passwordHash: params.passwordHash,
            role: params.role,
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
        },
    });
}

/**
 * Persists failed-login counters and lock timestamp after invalid sign-in.
 *
 * @param params - Failed sign-in state payload
 * @returns Updated security state fields
 */
export async function updateFailedLoginAttempts(params: UpdateFailedLoginAttemptsParams) {
    return adminDb.user.update({
        where: {
            id: params.userId,
        },
        data: {
            failedLoginAttempts: params.failedLoginAttempts,
            lockedUntil: params.lockedUntil,
        },
        select: {
            id: true,
            failedLoginAttempts: true,
            lockedUntil: true,
        },
    });
}

/**
 * Clears lockout counters after successful credential verification.
 *
 * @param userId - User identifier to reset
 * @returns Updated user id
 */
export async function resetLoginAttempts(userId: string) {
    return adminDb.user.update({
        where: {
            id: userId,
        },
        data: {
            failedLoginAttempts: 0,
            lockedUntil: null,
        },
        select: {
            id: true,
        },
    });
}

/**
 * Reads the most recent dashboard visit timestamp for a user.
 *
 * @param userId - User identifier to inspect
 * @returns Last recorded visit timestamp or null when none exists yet
 */
export async function findLastVisitAt(userId: string): Promise<Date | null> {
    const user = (await adminDb.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            lastVisitAt: true,
        },
    })) as LastVisitRecord | null;

    return user?.lastVisitAt ?? null;
}

/**
 * Persists the current timestamp as the user's latest dashboard visit.
 *
 * @param userId - User identifier to update
 * @returns Updated user id
 */
export async function updateLastVisit(userId: string) {
    return adminDb.user.update({
        where: {
            id: userId,
        },
        data: {
            lastVisitAt: new Date(),
        },
        select: {
            id: true,
        },
    });
}
