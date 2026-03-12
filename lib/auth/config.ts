/**
 * config.ts
 *
 * NextAuth configuration for Admin credentials sign-in.
 */

import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { findAuthUserByEmail, resetLoginAttempts, updateFailedLoginAttempts } from "../database/queries/users"
import { checkRateLimit } from "../security/rate-limit"
import { signInSchema } from "../validation/auth.schemas"
import { verifyPassword } from "./password"

// ============================================
// CONSTANTS
// ============================================

const LOCKOUT_THRESHOLD = 5
const LOCKOUT_DURATION_MS = 15 * 60 * 1000
const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60
const SESSION_UPDATE_AGE_SECONDS = 24 * 60 * 60

export const ACCOUNT_LOCKED_ERROR = "ACCOUNT_LOCKED"
export const RATE_LIMIT_ERROR = "RATE_LIMITED"

// ============================================
// HELPERS
// ============================================

function getRequestIpAddress(req: unknown): string {
  if (!req || typeof req !== "object") return "unknown"

  const headers = (req as { headers?: Record<string, string | string[] | undefined> }).headers
  const forwarded = headers?.["x-forwarded-for"]
  const realIp = headers?.["x-real-ip"]

  if (typeof forwarded === "string" && forwarded.length > 0) return forwarded.split(",")[0].trim()
  if (Array.isArray(forwarded) && forwarded.length > 0) return forwarded[0]
  if (typeof realIp === "string" && realIp.length > 0) return realIp

  return "unknown"
}

function getLockUntil(nextAttempts: number): Date | null {
  if (nextAttempts < LOCKOUT_THRESHOLD) return null
  return new Date(Date.now() + LOCKOUT_DURATION_MS)
}

async function registerFailedPasswordAttempt(userId: string, currentAttempts: number) {
  const failedLoginAttempts = currentAttempts + 1
  const lockedUntil = getLockUntil(failedLoginAttempts)
  await updateFailedLoginAttempts({ userId, failedLoginAttempts, lockedUntil })
}

function applyRateLimit(req: unknown): boolean {
  const ipAddress = getRequestIpAddress(req)
  const rateLimit = checkRateLimit({
    key: `signin:${ipAddress}`,
    limit: 5,
    windowMs: LOCKOUT_DURATION_MS,
  })

  return rateLimit.allowed
}

function isUserLocked(lockedUntil: Date | null): boolean {
  return Boolean(lockedUntil && lockedUntil > new Date())
}

function shouldUseSecureCookie(): boolean {
  return process.env.NODE_ENV === "production"
}

function getSessionCookieName(): string {
  return shouldUseSecureCookie() ? "__Secure-next-auth.session-token" : "next-auth.session-token"
}

async function authorizeWithCredentials(credentials: unknown, req: unknown) {
  const parsed = signInSchema.safeParse(credentials)
  if (!parsed.success) return null
  if (!applyRateLimit(req)) throw new Error(RATE_LIMIT_ERROR)

  const user = await findAuthUserByEmail(parsed.data.email)
  if (!user || !user.isActive) return null
  if (isUserLocked(user.lockedUntil)) throw new Error(ACCOUNT_LOCKED_ERROR)

  const passwordMatches = await verifyPassword(parsed.data.password, user.passwordHash)
  if (!passwordMatches) {
    await registerFailedPasswordAttempt(user.id, user.failedLoginAttempts)
    return null
  }

  await resetLoginAttempts(user.id)
  return { id: user.id, name: user.name, email: user.email, role: user.role }
}

// ============================================
// NEXTAUTH CONFIG
// ============================================

/**
 * NextAuth options for credentials-based Admin authentication.
 */
export const authConfig: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: authorizeWithCredentials,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (!user) return token

      token.id = user.id
      token.role = (user as { role?: "ANALYST" | "IT" }).role
      return token
    },
    async session({ session, token }) {
      if (!session.user) return session

      session.user.id = (token.id as string | undefined) ?? ""
      session.user.role = (token.role as "ANALYST" | "IT" | undefined) ?? "ANALYST"
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
    maxAge: SESSION_MAX_AGE_SECONDS,
    updateAge: SESSION_UPDATE_AGE_SECONDS,
  },
  cookies: {
    sessionToken: {
      name: getSessionCookieName(),
      options: {
        httpOnly: true,
        sameSite: "lax",
        secure: shouldUseSecureCookie(),
        path: "/",
      },
    },
  },
}
