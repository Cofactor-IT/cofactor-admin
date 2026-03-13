/**
 * config.test.ts
 *
 * Tests for NextAuth session and cookie configuration defaults.
 */

import { describe, expect, it } from 'vitest';
import { authConfig } from './config';

describe('authConfig session management', () => {
    it('uses /signin as the public credentials entry route', () => {
        expect(authConfig.pages?.signIn).toBe('/signin');
    });

    it('uses jwt strategy with seven-day max age and daily update age', () => {
        expect(authConfig.session?.strategy).toBe('jwt');
        expect(authConfig.session?.maxAge).toBe(7 * 24 * 60 * 60);
        expect(authConfig.session?.updateAge).toBe(24 * 60 * 60);
        expect(authConfig.jwt?.maxAge).toBe(7 * 24 * 60 * 60);
    });

    it('stores session token in hardened cofactor-admin-session cookie', () => {
        const sessionTokenCookie = authConfig.cookies?.sessionToken;
        expect(sessionTokenCookie?.name).toBe('cofactor-admin-session');
        expect(sessionTokenCookie?.options.httpOnly).toBe(true);
        expect(sessionTokenCookie?.options.sameSite).toBe('lax');
        expect(sessionTokenCookie?.options.path).toBe('/');
        expect(sessionTokenCookie?.options.secure).toBe(process.env.NODE_ENV === 'production');
    });

    it('hydrates jwt and session with id, role, email and name claims', async () => {
        const jwtCallback = authConfig.callbacks?.jwt;
        const sessionCallback = authConfig.callbacks?.session;
        if (!jwtCallback || !sessionCallback) throw new Error('Auth callbacks are missing');

        type JwtCallbackArgs = Parameters<typeof jwtCallback>[0];
        type SessionCallbackArgs = Parameters<typeof sessionCallback>[0];

        const jwtArgs = {
            token: {},
            user: {
                id: 'user_1',
                role: 'IT',
                email: 'it@cofactor.world',
                name: 'IT Operator',
            },
        } as JwtCallbackArgs;

        const token = await jwtCallback(jwtArgs);
        const sessionArgs = {
            session: { user: { id: '', role: 'ANALYST', email: null, name: null } },
            token,
        } as SessionCallbackArgs;

        const session = await sessionCallback(sessionArgs);
        if (!session.user) throw new Error('Session user was not hydrated');

        const hydratedUser = session.user as {
            id: string;
            role: 'ANALYST' | 'IT';
            email?: string | null;
            name?: string | null;
        };

        expect(hydratedUser.id).toBe('user_1');
        expect(hydratedUser.role).toBe('IT');
        expect(hydratedUser.email).toBe('it@cofactor.world');
        expect(hydratedUser.name).toBe('IT Operator');
    });
});
