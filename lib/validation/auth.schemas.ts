/**
 * auth.schemas.ts
 *
 * Zod schemas for auth-related validation.
 */

import { z } from "zod"

const ALLOWED_EMAIL_DOMAIN = "@cofactor.world"
const DOMAIN_RESTRICTION_MESSAGE = "Only @cofactor.world email addresses are permitted"

export const passwordSchema = z
  .string()
  .min(12, "Password must be at least 12 characters long")

const domainRestrictedEmailSchema = z
  .string()
  .email("Please provide a valid email address")
  .refine(
    (email) => email.toLowerCase().endsWith(ALLOWED_EMAIL_DOMAIN),
    DOMAIN_RESTRICTION_MESSAGE,
  )

export const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  email: domainRestrictedEmailSchema,
  password: passwordSchema,
  role: z.enum(["ANALYST", "IT"]),
})

export const signInSchema = z.object({
  email: domainRestrictedEmailSchema,
  password: z.string().min(1, "Password is required"),
})

export type SignUpInput = z.infer<typeof signUpSchema>
export type SignInInput = z.infer<typeof signInSchema>
