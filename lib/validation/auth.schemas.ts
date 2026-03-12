/**
 * auth.schemas.ts
 *
 * Zod schemas for auth-related validation.
 */

import { z } from "zod"

const ALLOWED_EMAIL_DOMAIN = "@cofactor.world"

export const passwordSchema = z
  .string()
  .min(12, "Password must be at least 12 characters long")

export const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  email: z
    .string()
    .email("Please provide a valid email address")
    .refine(
      (email) => email.toLowerCase().endsWith(ALLOWED_EMAIL_DOMAIN),
      "Only @cofactor.world email addresses are permitted",
    ),
  password: passwordSchema,
  role: z.enum(["ANALYST", "IT"]),
})

export type SignUpInput = z.infer<typeof signUpSchema>
