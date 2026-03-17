/**
 * next-auth.d.ts
 *
 * Module augmentation for NextAuth token and session claims.
 */

import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            role: 'ANALYST' | 'IT' | 'IT_ADMIN';
            gdprDelegate: boolean;
        } & DefaultSession['user'];
    }

    interface User {
        role: 'ANALYST' | 'IT' | 'IT_ADMIN';
        gdprDelegate: boolean;
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id?: string;
        role?: 'ANALYST' | 'IT' | 'IT_ADMIN';
        gdprDelegate?: boolean;
        email?: string | null;
        name?: string | null;
    }
}
