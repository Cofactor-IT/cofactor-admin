/**
 * headers.ts
 *
 * Shared security header helpers for proxy responses.
 */

import { NextResponse } from 'next/server';

const PRODUCTION_CONNECT_SOURCES = ["'self'"];
const DEVELOPMENT_CONNECT_SOURCES = ["'self'", 'ws:', 'http://localhost:*'];

/**
 * Builds the Content Security Policy string for the current environment.
 *
 * @returns Serialized CSP header value
 */
export function buildContentSecurityPolicy(): string {
    const connectSources =
        process.env.NODE_ENV === 'production'
            ? PRODUCTION_CONNECT_SOURCES
            : DEVELOPMENT_CONNECT_SOURCES;

    return [
        "default-src 'self'",
        "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: blob:",
        `connect-src ${connectSources.join(' ')}`,
        "frame-ancestors 'none'",
    ].join('; ');
}

/**
 * Applies the Admin security header baseline to a response.
 *
 * @param response - Next.js response to harden
 * @returns The same response instance with security headers attached
 */
export function applySecurityHeaders(response: NextResponse): NextResponse {
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set(
        'Permissions-Policy',
        'camera=(), microphone=(), geolocation=(), payment=()'
    );
    response.headers.set('Content-Security-Policy', buildContentSecurityPolicy());

    if (process.env.NODE_ENV === 'production') {
        response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }

    return response;
}
