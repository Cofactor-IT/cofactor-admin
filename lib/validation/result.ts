/**
 * result.ts
 *
 * Shared helpers for mapping Zod validation failures into field-level UI errors.
 */

import type { ZodError } from 'zod';

export type ValidationFieldErrors = Record<string, string[] | undefined>;

/**
 * Flattens Zod field errors into the action-state shape used by forms.
 *
 * @param error - Zod validation error
 * @returns Field-level error object keyed by form field
 */
export function flattenValidationErrors(error: ZodError): ValidationFieldErrors {
    return error.flatten().fieldErrors;
}
