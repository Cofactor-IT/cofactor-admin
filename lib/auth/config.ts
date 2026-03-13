/**
 * config.ts
 *
 * NextAuth configuration for Admin credentials sign-in.
 */

import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import {
    findAuthUserByEmail,
    resetLoginAttempts,
    updateFailedLoginAttempts,
} from '../database/queries/users';
import {
    RATE_LIMITS,
    checkRateLimit,
    getRequestIpAddress,
    resetRateLimit,
} from '../security/rate-limit';
import { signInSchema } from '../validation/auth.schemas';
import { verifyPassword } from './password';

// ============================================
// CONSTANTS
// ============================================

const LOCKOUT_THRESHOLD = 5;
const LOCKOUT_DURATION_MS = RATE_LIMITS.SIGN_IN.lockDurationMs ?? RATE_LIMITS.SIGN_IN.windowMs;
const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;
const SESSION_UPDATE_AGE_SECONDS = 24 * 60 * 60;
const SESSION_COOKIE_NAME = 'cofactor-admin-session';

export const ACCOUNT_LOCKED_ERROR = 'ACCOUNT_LOCKED';
export const RATE_LIMIT_ERROR = 'RATE_LIMITED';

// ============================================
// HELPERS
// ============================================

function buildRateLimitError(retryAfterSeconds: number): Error {
    return new Error(`${RATE_LIMIT_ERROR}:${retryAfterSeconds}`);
}

function getLockUntil(nextAttempts: number): Date | null {
    if (nextAttempts < LOCKOUT_THRESHOLD) return null;
    return new Date(Date.now() + LOCKOUT_DURATION_MS);
}

async function registerFailedPasswordAttempt(userId: string, currentAttempts: number) {
    const failedLoginAttempts = currentAttempts + 1;
    const lockedUntil = getLockUntil(failedLoginAttempts);
    await updateFailedLoginAttempts({ userId, failedLoginAttempts, lockedUntil });
}

function getSignInRateLimitKey(req: unknown, email: string): string {
    const ipAddress = getRequestIpAddress(req);
    return `signin:${ipAddress}:${email.toLowerCase()}`;
}

function isUserLocked(lockedUntil: Date | null): boolean {
    return Boolean(lockedUntil && lockedUntil > new Date());
}

function shouldUseSecureCookie(): boolean {
    return process.env.NODE_ENV === 'production';
}

function getSessionCookieName(): string {
    return SESSION_COOKIE_NAME;
}

async function authorizeWithCredentials(credentials: unknown, req: unknown) {
    const parsed = signInSchema.safeParse(credentials);
    if (!parsed.success) return null;

    const rateLimitKey = getSignInRateLimitKey(req, parsed.data.email);
    const rateLimit = checkRateLimit({
        key: rateLimitKey,
        config: RATE_LIMITS.SIGN_IN,
    });
    if (!rateLimit.allowed) throw buildRateLimitError(rateLimit.retryAfterSeconds ?? 0);

    const user = await findAuthUserByEmail(parsed.data.email);
    if (!user || !user.isActive) return null;
    if (isUserLocked(user.lockedUntil)) throw new Error(ACCOUNT_LOCKED_ERROR);

    const passwordMatches = await verifyPassword(parsed.data.password, user.passwordHash);
    if (!passwordMatches) {
        await registerFailedPasswordAttempt(user.id, user.failedLoginAttempts);
        return null;
    }

    await resetLoginAttempts(user.id);
    resetRateLimit(rateLimitKey);
    return { id: user.id, name: user.name, email: user.email, role: user.role };
}

// ============================================
// NEXTAUTH CONFIG
// ============================================

/**
 * NextAuth options for credentials-based Admin authentication.
 */
export const authConfig: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            authorize: authorizeWithCredentials,
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (!user) return token;

            token.id = user.id;
            token.role = (user as { role?: 'ANALYST' | 'IT' }).role;
            token.email = user.email;
            token.name = user.name;
            return token;
        },
        async session({ session, token }) {
            if (!session.user) return session;

            session.user.id = (token.id as string | undefined) ?? '';
            session.user.role = (token.role as 'ANALYST' | 'IT' | undefined) ?? 'ANALYST';
            session.user.email = (token.email as string | undefined) ?? session.user.email;
            session.user.name = (token.name as string | undefined) ?? session.user.name;
            return session;
        },
    },
    pages: {
        signIn: '/signin',
    },
    session: {
        strategy: 'jwt',
        maxAge: SESSION_MAX_AGE_SECONDS,
        updateAge: SESSION_UPDATE_AGE_SECONDS,
    },
    jwt: {
        maxAge: SESSION_MAX_AGE_SECONDS,
    },
    cookies: {
        sessionToken: {
            name: getSessionCookieName(),
            options: {
                httpOnly: true,
                sameSite: 'lax',
                secure: shouldUseSecureCookie(),
                path: '/',
            },
        },
    },
};
