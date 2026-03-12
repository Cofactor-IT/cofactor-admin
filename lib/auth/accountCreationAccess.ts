/**
 * accountCreationAccess.ts
 *
 * Server-side access checks for manual internal account creation.
 */

const ACCESS_ERROR_MESSAGE = "Account creation is restricted to IT operators."

/**
 * Validates the operator key used for manual account creation.
 *
 * @param providedKey - Key provided by the caller
 * @returns Null when authorized; otherwise a user-safe error message
 */
export function validateAccountCreationAccess(providedKey: unknown): string | null {
  const expectedKey = process.env.ADMIN_ACCOUNT_CREATION_KEY
  if (!expectedKey) {
    return ACCESS_ERROR_MESSAGE
  }

  if (typeof providedKey !== "string" || providedKey.trim() !== expectedKey) {
    return ACCESS_ERROR_MESSAGE
  }

  return null
}
