/**
 * headers.test.ts
 *
 * Tests for proxy security header helpers.
 */

import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextResponse } from 'next/server';
import { applySecurityHeaders, buildContentSecurityPolicy } from './headers';

afterEach(() => {
    vi.unstubAllEnvs();
});

describe('buildContentSecurityPolicy', () => {
    it('allows websocket development connections outside production', () => {
        vi.stubEnv('NODE_ENV', 'development');

        expect(buildContentSecurityPolicy()).toContain("connect-src 'self' ws: http://localhost:*");
    });

    it('locks connect sources to self in production', () => {
        vi.stubEnv('NODE_ENV', 'production');

        expect(buildContentSecurityPolicy()).toContain("connect-src 'self'");
        expect(buildContentSecurityPolicy()).not.toContain('ws:');
    });
});

describe('applySecurityHeaders', () => {
    it('applies baseline browser hardening headers', () => {
        vi.stubEnv('NODE_ENV', 'development');
        const response = applySecurityHeaders(new NextResponse(null, { status: 200 }));

        expect(response.headers.get('X-Frame-Options')).toBe('DENY');
        expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
        expect(response.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
        expect(response.headers.get('Permissions-Policy')).toBe(
            'camera=(), microphone=(), geolocation=(), payment=()'
        );
        expect(response.headers.get('Content-Security-Policy')).toContain("default-src 'self'");
        expect(response.headers.has('Strict-Transport-Security')).toBe(false);
    });

    it('adds HSTS in production only', () => {
        vi.stubEnv('NODE_ENV', 'production');
        const response = applySecurityHeaders(new NextResponse(null, { status: 200 }));

        expect(response.headers.get('Strict-Transport-Security')).toBe(
            'max-age=31536000; includeSubDomains'
        );
    });
});
