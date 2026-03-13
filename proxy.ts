/**
 * proxy.ts
 *
 * Session guard for protected Admin routes.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const DASHBOARD_PATH = '/dashboard';
const SIGN_IN_PATH = '/signin';
const SESSION_COOKIE_NAME = 'cofactor-admin-session';
const PUBLIC_PATHS = new Set([SIGN_IN_PATH, '/auth/forgot-password', '/auth/reset-password']);
const ROUTE_REDIRECTS = new Map([
    ['/auth/signin', SIGN_IN_PATH],
    ['/scout-profiles', '/scouts'],
    ['/deal-pipeline', '/pipeline'],
    ['/email-templates', '/templates'],
]);
const IT_ONLY_PATH_PREFIXES = ['/settings', '/auth/signup'];

function isPublicPath(pathname: string): boolean {
    return PUBLIC_PATHS.has(pathname) || pathname.startsWith('/api/auth/');
}

function isITOnlyPath(pathname: string): boolean {
    return IT_ONLY_PATH_PREFIXES.some(
        (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    );
}

function shouldPersistCallback(pathname: string): boolean {
    return pathname !== '/' && pathname !== DASHBOARD_PATH;
}

/**
 * Redirects unauthenticated users to sign-in and enforces IT-only routes.
 *
 * @param request - Incoming edge request
 * @returns Next response or redirect
 */
export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const redirectedPath = ROUTE_REDIRECTS.get(pathname);
    if (redirectedPath) {
        const redirectUrl = new URL(redirectedPath, request.url);
        redirectUrl.search = request.nextUrl.search;
        return NextResponse.redirect(redirectUrl);
    }

    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
        cookieName: SESSION_COOKIE_NAME,
    });
    if (pathname === SIGN_IN_PATH && token) {
        return NextResponse.redirect(new URL(DASHBOARD_PATH, request.url));
    }

    if (isPublicPath(pathname)) {
        return NextResponse.next();
    }

    if (!token) {
        const signInUrl = new URL(SIGN_IN_PATH, request.url);
        if (shouldPersistCallback(pathname)) {
            signInUrl.searchParams.set('callbackUrl', `${pathname}${request.nextUrl.search}`);
        }
        return NextResponse.redirect(signInUrl);
    }

    if (isITOnlyPath(pathname) && token.role !== 'IT') {
        return NextResponse.redirect(new URL(DASHBOARD_PATH, request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|apple-icon.png|icon.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
    ],
};
