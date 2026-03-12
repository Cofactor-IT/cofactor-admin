/**
 * password.ts
 *
 * Password hashing utilities for account management.
 */

import { hash } from "bcryptjs"

const PASSWORD_SALT_ROUNDS = 12

/**
 * Hashes a plain text password using bcrypt.
 *
 * @param password - Plain text password from validated input
 * @returns Bcrypt hash suitable for database storage
 */
export async function hashPassword(password: string): Promise<string> {
  return hash(password, PASSWORD_SALT_ROUNDS)
}
