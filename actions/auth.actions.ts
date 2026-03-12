"use server"

/**
 * auth.actions.ts
 *
 * Server Actions for account creation and auth-adjacent workflows.
 */

import { validateAccountCreationAccess } from "../lib/auth/accountCreationAccess"
import { hashPassword } from "../lib/auth/password"
import { logAuditAction } from "../lib/database/queries/auditLogs"
import { createUser, findUserByEmail } from "../lib/database/queries/users"
import { signUpSchema, type SignUpInput } from "../lib/validation/auth.schemas"

export interface SignUpActionState {
  success: boolean
  message?: string
  fieldErrors?: Record<string, string[] | undefined>
}

function parseSignUpFormData(formData: FormData): Record<string, unknown> {
  return {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  }
}

function buildValidationErrorState(fieldErrors: Record<string, string[] | undefined>): SignUpActionState {
  return {
    success: false,
    message: "Please fix the highlighted fields.",
    fieldErrors,
  }
}

function buildExistingEmailState(): SignUpActionState {
  return {
    success: false,
    message: "Email already in use.",
    fieldErrors: {
      email: ["Email already in use"],
    },
  }
}

function buildUnauthorizedState(message: string): SignUpActionState {
  return {
    success: false,
    message,
  }
}

async function createValidatedUser(data: SignUpInput) {
  const passwordHash = await hashPassword(data.password)

  return createUser({
    name: data.name.trim(),
    email: data.email.toLowerCase().trim(),
    passwordHash,
    role: data.role,
  })
}

async function writeUserCreatedAudit(userId: string, email: string, role: "ANALYST" | "IT") {
  await logAuditAction({
    action: "USER_CREATED",
    resourceType: "User",
    resourceId: userId,
    changes: {
      email,
      role,
    },
  })
}

/**
 * Creates a new Admin user account with strict domain-restricted validation.
 *
 * @param _prevState - Current form action state
 * @param formData - Form payload from signup UI
 * @returns Action state containing success or validation errors
 */
export async function signUp(
  _prevState: SignUpActionState,
  formData: FormData,
): Promise<SignUpActionState> {
  const accessError = validateAccountCreationAccess(formData.get("creationKey"))
  if (accessError) {
    return buildUnauthorizedState(accessError)
  }

  const validated = signUpSchema.safeParse(parseSignUpFormData(formData))
  if (!validated.success) {
    return buildValidationErrorState(validated.error.flatten().fieldErrors)
  }

  const normalizedEmail = validated.data.email.toLowerCase().trim()
  const existingUser = await findUserByEmail(normalizedEmail)
  if (existingUser) {
    return buildExistingEmailState()
  }

  const createdUser = await createValidatedUser(validated.data)
  await writeUserCreatedAudit(createdUser.id, createdUser.email, createdUser.role)

  return {
    success: true,
    message: "Account created successfully.",
  }
}
