/**
 * password.ts
 *
 * Password hashing utilities for account management.
 */

import { hash } from 'bcryptjs';
import { compare } from 'bcryptjs';

const PASSWORD_SALT_ROUNDS = 12;

/**
 * Hashes a plain text password using bcrypt.
 *
 * @param password - Plain text password from validated input
 * @returns Bcrypt hash suitable for database storage
 */
export async function hashPassword(password: string): Promise<string> {
    return hash(password, PASSWORD_SALT_ROUNDS);
}

/**
 * Compares a plain text password against a bcrypt hash.
 *
 * @param password - Plain text password input
 * @param passwordHash - Stored bcrypt password hash
 * @returns True when password matches the hash
 */
export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
    return compare(password, passwordHash);
}
