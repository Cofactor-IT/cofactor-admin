/**
 * base.schemas.ts
 *
 * Reusable Zod primitives shared across Admin validation flows.
 */

import { z } from 'zod';

const COFACTOR_EMAIL_DOMAIN = '@cofactor.world';

/**
 * Validates and normalizes a general email address.
 */
export const emailSchema = z.string().trim().toLowerCase().email('Invalid email address');

/**
 * Restricts email addresses to the Cofactor internal domain.
 */
export const cofactorEmailSchema = emailSchema.refine(
    (email) => email.endsWith(COFACTOR_EMAIL_DOMAIN),
    'Must be a @cofactor.world email address'
);

/**
 * Validates a strong password for Admin authentication flows.
 */
export const passwordSchema = z
    .string()
    .min(12, 'Password must be at least 12 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

/**
 * Validates human-readable names.
 */
export const nameSchema = z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .trim();

/**
 * Validates Prisma CUID identifiers.
 */
export const idSchema = z.string().cuid('Invalid ID format');

/**
 * Validates and normalizes common pagination inputs.
 */
export const paginationSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(50),
});
