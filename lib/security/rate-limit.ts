/**
 * rate-limit.ts
 *
 * In-memory rate limiting for authentication attempts.
 */

interface RateLimitOptions {
    key: string;
    limit?: number;
    windowMs?: number;
}

interface RateLimitState {
    count: number;
    windowStartedAt: number;
}

interface RateLimitResult {
    allowed: boolean;
    retryAfterMs: number;
}

const DEFAULT_LIMIT = 5;
const DEFAULT_WINDOW_MS = 15 * 60 * 1000;
const attemptStore = new Map<string, RateLimitState>();

function getCurrentWindowState(key: string, now: number, windowMs: number): RateLimitState {
    const existing = attemptStore.get(key);
    if (!existing || now - existing.windowStartedAt > windowMs) {
        return {
            count: 0,
            windowStartedAt: now,
        };
    }

    return existing;
}

/**
 * Checks and increments in-memory authentication attempt counters.
 *
 * @param options - Rate limit key and optional limits
 * @returns Allow/deny decision with retry timing
 */
export function checkRateLimit(options: RateLimitOptions): RateLimitResult {
    const now = Date.now();
    const limit = options.limit ?? DEFAULT_LIMIT;
    const windowMs = options.windowMs ?? DEFAULT_WINDOW_MS;
    const state = getCurrentWindowState(options.key, now, windowMs);
    const nextCount = state.count + 1;

    attemptStore.set(options.key, {
        count: nextCount,
        windowStartedAt: state.windowStartedAt,
    });

    if (nextCount <= limit) {
        return { allowed: true, retryAfterMs: 0 };
    }

    const elapsed = now - state.windowStartedAt;
    return {
        allowed: false,
        retryAfterMs: Math.max(0, windowMs - elapsed),
    };
}
