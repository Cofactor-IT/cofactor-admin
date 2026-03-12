/**
 * next-auth.d.ts
 *
 * Module augmentation for NextAuth token and session claims.
 */

import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: "ANALYST" | "IT"
    } & DefaultSession["user"]
  }

  interface User {
    role: "ANALYST" | "IT"
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    role?: "ANALYST" | "IT"
    email?: string | null
    name?: string | null
  }
}
