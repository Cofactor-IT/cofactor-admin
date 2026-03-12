/**
 * passwordReset.ts
 *
 * Utilities for password reset token generation and URL construction.
 */

import { createHash, randomBytes } from "crypto"

const DEFAULT_PASSWORD_RESET_TTL_MINUTES = 60

/**
 * Generates a cryptographically random reset token.
 *
 * @returns URL-safe token string
 */
export function generatePasswordResetToken(): string {
  return randomBytes(32).toString("hex")
}

/**
 * Hashes a reset token for secure database storage.
 *
 * @param token - Raw reset token value
 * @returns SHA-256 token digest
 */
export function hashPasswordResetToken(token: string): string {
  return createHash("sha256").update(token).digest("hex")
}

/**
 * Resolves password reset expiry timestamp from configured TTL.
 *
 * @param now - Current timestamp
 * @returns Future expiry timestamp
 */
export function getPasswordResetExpiry(now: Date): Date {
  const ttl = Number(process.env.PASSWORD_RESET_TOKEN_TTL_MINUTES ?? DEFAULT_PASSWORD_RESET_TTL_MINUTES)
  const ttlMinutes = Number.isFinite(ttl) && ttl > 0 ? ttl : DEFAULT_PASSWORD_RESET_TTL_MINUTES
  return new Date(now.getTime() + ttlMinutes * 60 * 1000)
}

/**
 * Builds reset URL targeting the Admin reset-password route.
 *
 * @param token - Raw reset token value
 * @returns Absolute URL for password reset
 */
export function buildPasswordResetUrl(token: string): string {
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000"
  return `${baseUrl.replace(/\/$/, "")}/auth/reset-password?token=${encodeURIComponent(token)}`
}
