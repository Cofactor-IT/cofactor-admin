/**
 * rate-limit.ts
 *
 * In-memory rate limiting for sensitive authentication operations.
 */

export interface RateLimitConfig {
    max: number;
    windowMs: number;
    lockDurationMs?: number;
}

interface RateLimitRecord {
    count: number;
    resetTime: number;
    lockedUntil?: number;
}

export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    resetTime: number;
    locked: boolean;
    retryAfterSeconds?: number;
}

interface CheckRateLimitParams {
    key: string;
    config: RateLimitConfig;
}

const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
const DEFAULT_IP_ADDRESS = 'unknown';
const attemptStore = new Map<string, RateLimitRecord>();

export const RATE_LIMITS = {
    SIGN_IN: {
        max: 5,
        windowMs: 15 * 60 * 1000,
        lockDurationMs: 15 * 60 * 1000,
    },
    SIGN_UP: {
        max: 3,
        windowMs: 15 * 60 * 1000,
        lockDurationMs: 15 * 60 * 1000,
    },
    PASSWORD_RESET: {
        max: 3,
        windowMs: 60 * 60 * 1000,
        lockDurationMs: 60 * 60 * 1000,
    },
} as const;

function getRecord(key: string, now: number, config: RateLimitConfig): RateLimitRecord {
    const existing = attemptStore.get(key);
    if (!existing || existing.resetTime <= now) {
        return {
            count: 0,
            resetTime: now + config.windowMs,
        };
    }

    return existing;
}

function getRetryAfterSeconds(expiresAt: number, now: number): number {
    return Math.max(1, Math.ceil((expiresAt - now) / 1000));
}

function buildBlockedResult(record: RateLimitRecord, now: number): RateLimitResult {
    const retrySource = record.lockedUntil ?? record.resetTime;
    return {
        allowed: false,
        remaining: 0,
        resetTime: record.resetTime,
        locked: true,
        retryAfterSeconds: getRetryAfterSeconds(retrySource, now),
    };
}

function getHeaderValue(source: unknown, headerName: string): string | null {
    if (source && typeof source === 'object' && 'get' in source) {
        const get = (source as { get?: (name: string) => string | null }).get;
        if (typeof get === 'function') return get(headerName);
    }

    if (!source || typeof source !== 'object') return null;
    const headers = (source as { headers?: Record<string, string | string[] | undefined> }).headers;
    const headerValue = headers?.[headerName];
    if (typeof headerValue === 'string') return headerValue;
    if (Array.isArray(headerValue) && headerValue.length > 0) return headerValue[0] ?? null;
    return null;
}

function getPrimaryAddress(headerValue: string | null): string | null {
    if (!headerValue) return null;
    const address = headerValue.split(',')[0]?.trim();
    return address && address.length > 0 ? address : null;
}

function shouldDeleteRecord(record: RateLimitRecord, now: number): boolean {
    return record.resetTime <= now && (!record.lockedUntil || record.lockedUntil <= now);
}

/**
 * Extracts the client IP address from Next.js headers or request objects.
 *
 * @param source - Headers-like object or auth request payload
 * @returns Best-effort client IP or `unknown`
 */
export function getRequestIpAddress(source: unknown): string {
    const forwarded = getPrimaryAddress(getHeaderValue(source, 'x-forwarded-for'));
    if (forwarded) return forwarded;

    const realIp = getPrimaryAddress(getHeaderValue(source, 'x-real-ip'));
    return realIp ?? DEFAULT_IP_ADDRESS;
}

/**
 * Checks and increments the in-memory rate limit window for a key.
 *
 * @param params - Rate limit key and policy configuration
 * @returns Allow/deny decision with retry metadata
 */
export function checkRateLimit(params: CheckRateLimitParams): RateLimitResult {
    const now = Date.now();
    const activeRecord = attemptStore.get(params.key);
    if (activeRecord?.lockedUntil && activeRecord.lockedUntil > now) {
        return buildBlockedResult(activeRecord, now);
    }

    const record = getRecord(params.key, now, params.config);
    const nextCount = record.count + 1;
    if (nextCount > params.config.max) {
        const blockedRecord = {
            ...record,
            count: nextCount,
            lockedUntil: params.config.lockDurationMs
                ? now + params.config.lockDurationMs
                : undefined,
        };
        attemptStore.set(params.key, blockedRecord);
        return buildBlockedResult(blockedRecord, now);
    }

    attemptStore.set(params.key, {
        ...record,
        count: nextCount,
    });

    return {
        allowed: true,
        remaining: Math.max(0, params.config.max - nextCount),
        resetTime: record.resetTime,
        locked: false,
    };
}

/**
 * Resets the in-memory attempt history for a key.
 *
 * @param key - Rate-limit bucket key to clear
 */
export function resetRateLimit(key: string): void {
    attemptStore.delete(key);
}

/**
 * Removes expired and unlocked entries from the in-memory store.
 */
export function cleanupExpiredRecords(): void {
    const now = Date.now();
    attemptStore.forEach((record, key) => {
        if (shouldDeleteRecord(record, now)) attemptStore.delete(key);
    });
}

/**
 * Clears the in-memory store. Exported for tests only.
 */
export function clearRateLimitStore(): void {
    attemptStore.clear();
}

const cleanupTimer = setInterval(cleanupExpiredRecords, CLEANUP_INTERVAL_MS);
cleanupTimer.unref?.();
