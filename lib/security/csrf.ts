/**
 * csrf.ts
 *
 * Origin verification helpers for mutating API routes.
 */

import { headers } from 'next/headers';

function resolveRequestHost(headersSource: Headers): string | null {
    return headersSource.get('x-forwarded-host') ?? headersSource.get('host');
}

function resolveRequestProtocol(headersSource: Headers): string {
    return headersSource.get('x-forwarded-proto') ?? 'http';
}

/**
 * Validates that a mutating request originated from the same host as the active request.
 *
 * This helper is intended for custom API routes that accept `POST`, `PUT`, `PATCH`, or `DELETE`.
 * Server Actions already get origin checks from Next.js automatically.
 *
 * @throws {Error} When the request origin is missing or does not match the current host
 */
export async function verifyCsrfOrigin(): Promise<void> {
    const requestHeaders = await headers();
    const origin = requestHeaders.get('origin');
    const host = resolveRequestHost(requestHeaders);
    const protocol = resolveRequestProtocol(requestHeaders);

    if (!origin || !host) {
        throw new Error('CSRF check failed - missing origin or host header');
    }

    const originUrl = new URL(origin);
    const expectedOrigin = `${protocol}://${host}`;

    if (originUrl.origin !== expectedOrigin) {
        throw new Error('CSRF check failed - origin mismatch');
    }
}
