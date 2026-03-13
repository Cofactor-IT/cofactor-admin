/**
 * rate-limit.test.ts
 *
 * Tests for shared rate limiting behavior.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
    RATE_LIMITS,
    checkRateLimit,
    cleanupExpiredRecords,
    clearRateLimitStore,
    getRequestIpAddress,
    resetRateLimit,
} from './rate-limit';

describe('checkRateLimit', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        clearRateLimitStore();
    });

    afterEach(() => {
        clearRateLimitStore();
        vi.useRealTimers();
    });

    it('allows requests until the configured max is exceeded', () => {
        const key = 'signin:test';

        expect(checkRateLimit({ key, config: RATE_LIMITS.SIGN_IN }).allowed).toBe(true);
        expect(checkRateLimit({ key, config: RATE_LIMITS.SIGN_IN }).allowed).toBe(true);
        expect(checkRateLimit({ key, config: { ...RATE_LIMITS.SIGN_IN, max: 2 } }).allowed).toBe(
            false
        );
    });

    it('returns retry metadata when a bucket is locked', () => {
        const key = 'signup:test';
        const config = { ...RATE_LIMITS.SIGN_UP, max: 1 };

        checkRateLimit({ key, config });
        const blocked = checkRateLimit({ key, config });

        expect(blocked.allowed).toBe(false);
        expect(blocked.locked).toBe(true);
        expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
    });

    it('resets a bucket after resetRateLimit is called', () => {
        const key = 'password-reset:test';
        const config = { ...RATE_LIMITS.PASSWORD_RESET, max: 1 };

        checkRateLimit({ key, config });
        expect(checkRateLimit({ key, config }).allowed).toBe(false);

        resetRateLimit(key);

        expect(checkRateLimit({ key, config }).allowed).toBe(true);
    });

    it('cleans expired records out of memory', () => {
        const key = 'cleanup:test';
        checkRateLimit({ key, config: RATE_LIMITS.SIGN_IN });

        vi.advanceTimersByTime(RATE_LIMITS.SIGN_IN.windowMs + 1000);
        cleanupExpiredRecords();

        expect(checkRateLimit({ key, config: RATE_LIMITS.SIGN_IN }).allowed).toBe(true);
    });
});

describe('getRequestIpAddress', () => {
    it('prefers forwarded headers and falls back to x-real-ip', () => {
        expect(
            getRequestIpAddress({
                get(name: string) {
                    if (name === 'x-forwarded-for') return '10.0.0.1, 10.0.0.2';
                    return null;
                },
            })
        ).toBe('10.0.0.1');

        expect(
            getRequestIpAddress({
                headers: {
                    'x-real-ip': '192.168.0.10',
                },
            })
        ).toBe('192.168.0.10');
    });
});
