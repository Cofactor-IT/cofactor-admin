/**
 * users.ts
 *
 * User query functions for account lookup and creation.
 */

import { adminDb } from "../adminDb"

interface CreateUserParams {
  name: string
  email: string
  passwordHash: string
  role: "ANALYST" | "IT"
}

/**
 * Finds a user by normalized email.
 *
 * @param email - Email address to look up
 * @returns Minimal user record if found, otherwise null
 */
export async function findUserByEmail(email: string) {
  return adminDb.user.findUnique({
    where: {
      email: email.toLowerCase(),
    },
    select: {
      id: true,
      email: true,
      role: true,
    },
  })
}

/**
 * Creates a new Admin user account.
 *
 * @param params - User creation payload
 * @returns Newly created user record without password hash
 */
export async function createUser(params: CreateUserParams) {
  return adminDb.user.create({
    data: {
      name: params.name,
      email: params.email.toLowerCase(),
      passwordHash: params.passwordHash,
      role: params.role,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  })
}
