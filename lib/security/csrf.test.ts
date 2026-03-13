/**
 * csrf.test.ts
 *
 * Tests for API-route CSRF origin verification helpers.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/headers', () => ({
    headers: vi.fn(),
}));

import { headers } from 'next/headers';
import { verifyCsrfOrigin } from './csrf';

function buildHeaders(values: Record<string, string>): Headers {
    return new Headers(values);
}

describe('verifyCsrfOrigin', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('passes when origin matches forwarded host and protocol', async () => {
        vi.mocked(headers).mockResolvedValue(
            buildHeaders({
                origin: 'https://admin.cofactor.world',
                'x-forwarded-host': 'admin.cofactor.world',
                'x-forwarded-proto': 'https',
            })
        );

        await expect(verifyCsrfOrigin()).resolves.toBeUndefined();
    });

    it('falls back to host when forwarded host is absent', async () => {
        vi.mocked(headers).mockResolvedValue(
            buildHeaders({
                origin: 'http://localhost:3001',
                host: 'localhost:3001',
            })
        );

        await expect(verifyCsrfOrigin()).resolves.toBeUndefined();
    });

    it('throws when origin is missing', async () => {
        vi.mocked(headers).mockResolvedValue(
            buildHeaders({
                host: 'localhost:3001',
            })
        );

        await expect(verifyCsrfOrigin()).rejects.toThrow(
            'CSRF check failed - missing origin or host header'
        );
    });

    it('throws when origin does not match the current host', async () => {
        vi.mocked(headers).mockResolvedValue(
            buildHeaders({
                origin: 'https://evil.example',
                'x-forwarded-host': 'admin.cofactor.world',
                'x-forwarded-proto': 'https',
            })
        );

        await expect(verifyCsrfOrigin()).rejects.toThrow('CSRF check failed - origin mismatch');
    });
});
